import { FLOOR_FINISHES, FloorFinish, TileSpec } from "./types"

/**
 * Рисунки отделки в реальном масштабе: плитка с настоящими размерами и швом,
 * доска и паркет, обои. Один и тот же рисунок идёт в 3D, на план и на развёртки.
 * Каждый рисунок — повторяющийся фрагмент размером repeatW × repeatH метров
 */
export interface FinishPattern {
  /** Размер повторяемого фрагмента, м */
  repeatW: number
  repeatH: number
  /** Рисует фрагмент на канвасе 2D (px — пикселей на метр) */
  draw: (g: CanvasRenderingContext2D, px: number) => void
  /** То же фрагментом SVG — для плана и PDF; s — пикселей на метр */
  svg: (s: number) => string
}

/** Детерминированный «шум» оттенка — одинаковый на экране и в PDF, без Math.random */
const noise = (i: number, j: number, seed = 1) => {
  const x = Math.sin(i * 127.1 + j * 311.7 + seed * 74.7) * 43758.5453
  return x - Math.floor(x)
}

export const shade = (hex: string, k: number) => {
  const n = parseInt((hex || "#888888").replace("#", "").padEnd(6, "0").slice(0, 6), 16)
  const c = (v: number) => Math.min(255, Math.max(0, Math.round(v + k)))
  return `rgb(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)})`
}

/** Ячейка плитки: x, y, w, h — шаг раскладки (плитка + шов), м */
type Rect = { x: number; y: number; w: number; h: number; c: string; rot?: number }

/**
 * Плитки фрагмента в метрах. Ячейки задаются по шагу раскладки (плитка + шов),
 * шов вычитается при отрисовке — не тоньше 0,7 px, чтобы был виден и на мелком плане
 */
function tileRects(t: TileSpec): { rects: Rect[]; rw: number; rh: number; wrap: boolean } {
  const j = Math.max(t.joint, 0.0005)
  const W = t.w + j
  const H = t.h + j
  const col = (i: number, k: number) => shade(t.color, (noise(i, k) - 0.5) * 10)
  const rects: Rect[] = []
  switch (t.layout) {
    case "offset":
    case "third": {
      const rows = t.layout === "offset" ? 2 : 3
      const sh = t.layout === "offset" ? W / 2 : W / 3
      for (let r = 0; r < rows; r++) rects.push({ x: r * sh, y: r * H, w: W, h: H, c: col(5, r) })
      return { rects, rw: W, rh: H * rows, wrap: true }
    }
    case "checker": {
      const c2 = t.color2 || shade(t.color, -60)
      for (let r = 0; r < 2; r++)
        for (let c = 0; c < 2; c++) rects.push({ x: c * W, y: r * H, w: W, h: H, c: (r + c) % 2 ? shade(c2, (noise(c, r) - 0.5) * 8) : col(c, r) })
      return { rects, rw: W * 2, rh: H * 2, wrap: false }
    }
    case "diagonal": {
      // Квадрат повёрнут на 45°: фрагмент — диагональ плитки
      const d = W * Math.SQRT2
      for (const [cx, cy] of [[0, 0], [d, 0], [0, d], [d, d], [d / 2, d / 2]]) rects.push({ x: cx - W / 2, y: cy - W / 2, w: W, h: W, c: col(cx * 10, cy * 10), rot: 45 })
      return { rects, rw: d, rh: d, wrap: false }
    }
    case "herringbone": {
      // Ёлочка «лесенкой» из плашек L×S, L = n·S: горизонтальная плашка в (kS, kS),
      // вертикальная — в (kS, kS+S). Решётка повторов: (2L, 0) и (S, S) → ячейка 2L × 2L
      const S = Math.min(W, H)
      const n = Math.max(Math.round(Math.max(W, H) / S), 2)
      const L = n * S
      const rw = 2 * L
      for (let m = -2; m <= 2; m++)
        for (let k = -3 * n; k <= 3 * n; k++) {
          const x = k * S + m * rw
          const y = k * S
          rects.push({ x, y, w: L, h: S, c: col(k + m * 31, 1) })
          rects.push({ x, y: y + S, w: S, h: L, c: col(k + m * 31, 2) })
        }
      return { rects, rw, rh: rw, wrap: false }
    }
    default:
      rects.push({ x: 0, y: 0, w: W, h: H, c: col(0, 0) })
      return { rects, rw: W, rh: H, wrap: true }
  }
}

export function tilePattern(t: TileSpec): FinishPattern {
  const { rects, rw, rh, wrap } = tileRects(t)
  const wraps = wrap ? [-1, 0, 1] : [0]
  const jp = (s: number) => Math.max(t.joint * s, 0.7)
  return {
    repeatW: rw,
    repeatH: rh,
    draw: (g, px) => {
      const jj = jp(px)
      g.fillStyle = t.grout
      g.fillRect(0, 0, rw * px, rh * px)
      for (const r of rects) {
        for (const ox of wraps)
          for (const oy of wraps) {
            g.save()
            if (r.rot) {
              g.translate((r.x + r.w / 2 + ox * rw) * px, (r.y + r.h / 2 + oy * rh) * px)
              g.rotate((r.rot * Math.PI) / 180)
              g.translate((-r.w / 2) * px, (-r.h / 2) * px)
            } else g.translate((r.x + ox * rw) * px, (r.y + oy * rh) * px)
            const w = r.w * px - jj
            const h = r.h * px - jj
            g.fillStyle = r.c
            g.fillRect(0, 0, w, h)
            // Лёгкий блик сверху-слева — плитка читается объёмной
            const grd = g.createLinearGradient(0, 0, w, h)
            grd.addColorStop(0, t.gloss ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)")
            grd.addColorStop(1, "rgba(0,0,0,0.06)")
            g.fillStyle = grd
            g.fillRect(0, 0, w, h)
            g.restore()
          }
      }
    },
    svg: (s) => {
      const jj = jp(s)
      const parts = [`<rect width="${rw * s}" height="${rh * s}" fill="${t.grout}"/>`]
      for (const r of rects)
        for (const ox of wraps)
          for (const oy of wraps) {
            const x = (r.x + ox * rw) * s
            const y = (r.y + oy * rh) * s
            const w = r.w * s - jj
            const h = r.h * s - jj
            if (w <= 0 || h <= 0) continue
            const tr = r.rot ? ` transform="rotate(${r.rot} ${(x + (r.w * s) / 2).toFixed(2)} ${(y + (r.h * s) / 2).toFixed(2)})"` : ""
            parts.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" fill="${r.c}"${tr}/>`)
          }
      return parts.join("")
    },
  }
}

/** Доска, ламинат, кварцвинил: планки 1,2 × 0,19 м вразбежку, с волокнами */
function plankPattern(color: string, len = 1.2, wid = 0.19): FinishPattern {
  const rows = 6
  const rw = len
  const rh = wid * rows
  const planks: Rect[] = []
  // Стыки вразбежку: сдвиг ряда на 0,37 длины; по одной планке на ряд, повтор — по ширине фрагмента
  for (let r = 0; r < rows; r++) planks.push({ x: ((r * 0.37) % 1) * len, y: r * wid, w: len, h: wid, c: shade(color, (noise(r, 3) - 0.5) * 26) })
  const each = (fn: (x: number, p: Rect, i: number) => void) => planks.forEach((p, i) => [-1, 0].forEach((ox) => fn(p.x + ox * rw, p, i)))
  return {
    repeatW: rw,
    repeatH: rh,
    draw: (g, px) => {
      const jj = Math.max(px * 0.0015, 0.8)
      g.fillStyle = shade(color, -45)
      g.fillRect(0, 0, rw * px, rh * px)
      each((x, p, i) => {
        g.fillStyle = p.c
        g.fillRect(x * px, p.y * px, p.w * px - jj, p.h * px - jj)
        // Волокна дерева
        g.strokeStyle = "rgba(60,35,15,0.10)"
        g.lineWidth = 1
        for (let k = 0; k < 5; k++) {
          const yy = (p.y + (p.h * (k + 0.5)) / 5) * px
          g.beginPath()
          g.moveTo(x * px, yy)
          for (let q = 0; q <= 12; q++) g.lineTo((x + (p.w * q) / 12) * px, yy + Math.sin(q * 1.3 + i + k) * 1.4)
          g.stroke()
        }
      })
    },
    svg: (s) => {
      const jj = Math.max(s * 0.0015, 0.7)
      const out = [`<rect width="${rw * s}" height="${rh * s}" fill="${shade(color, -45)}"/>`]
      each((x, p) => out.push(`<rect x="${(x * s).toFixed(2)}" y="${(p.y * s).toFixed(2)}" width="${(p.w * s - jj).toFixed(2)}" height="${(p.h * s - jj).toFixed(2)}" fill="${p.c}"/>`))
      return out.join("")
    },
  }
}

/** Паркет ёлочкой: плашки 0,42 × 0,07 м */
function parquetPattern(color: string): FinishPattern {
  return tilePattern({ w: 0.42, h: 0.07, joint: 0.001, layout: "herringbone", color, grout: shade(color, -45) })
}

/** Ровное покрытие (линолеум, ковролин) — лёгкая фактура */
function plainPattern(color: string, speck = 0.06): FinishPattern {
  const rw = 0.5
  const dots = Array.from({ length: 80 }, (_, i) => ({ x: noise(i, 1) * rw, y: noise(i, 2) * rw, k: (noise(i, 3) - 0.5) * 30 }))
  return {
    repeatW: rw,
    repeatH: rw,
    draw: (g, px) => {
      g.fillStyle = color
      g.fillRect(0, 0, rw * px, rw * px)
      for (const d of dots) {
        g.fillStyle = shade(color, d.k)
        g.globalAlpha = speck * 4
        g.fillRect(d.x * px, d.y * px, 2, 2)
      }
      g.globalAlpha = 1
    },
    svg: (s) => `<rect width="${rw * s}" height="${rw * s}" fill="${color}"/>`,
  }
}

/** Рисунок покрытия пола по выбору в отделке комнаты */
export function floorFinishPattern(finish: FloorFinish, color: string, tile?: TileSpec): FinishPattern | null {
  if (finish === "none") return null
  if (finish === "tile" || finish === "porcelain") return tilePattern(tile || { w: 0.6, h: 0.6, joint: 0.002, layout: "grid", color, grout: "#9ca3af" })
  if (finish === "parquet") return parquetPattern(color)
  if (FLOOR_FINISHES[finish].pattern === "planks") return plankPattern(color, finish === "engineered" ? 1.9 : 1.2, finish === "engineered" ? 0.2 : 0.19)
  return plainPattern(color, finish === "carpet" ? 0.12 : 0.04)
}

/** Обои: рисунок-дамаск с шагом 0,53 × 0,64 м (ширина полосы × раппорт) */
export function wallpaperPattern(color: string, rapport = 0.64, width = 0.53): FinishPattern {
  const rw = width
  const rh = Math.max(rapport, 0.3)
  const motif = (g: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
    g.beginPath()
    g.moveTo(cx, cy - r)
    g.bezierCurveTo(cx + r * 0.9, cy - r * 0.4, cx + r * 0.9, cy + r * 0.4, cx, cy + r)
    g.bezierCurveTo(cx - r * 0.9, cy + r * 0.4, cx - r * 0.9, cy - r * 0.4, cx, cy - r)
    g.stroke()
    g.beginPath()
    g.arc(cx, cy, r * 0.22, 0, Math.PI * 2)
    g.stroke()
  }
  return {
    repeatW: rw,
    repeatH: rh,
    draw: (g, px) => {
      g.fillStyle = color
      g.fillRect(0, 0, rw * px, rh * px)
      g.strokeStyle = shade(color, 28)
      g.lineWidth = Math.max(px * 0.004, 1.5)
      const r = Math.min(rw, rh) * 0.28 * px
      motif(g, (rw / 2) * px, (rh / 2) * px, r)
      for (const [x, y] of [[0, 0], [rw, 0], [0, rh], [rw, rh]]) motif(g, x * px, y * px, r)
      // Стык полос
      g.fillStyle = "rgba(0,0,0,0.05)"
      g.fillRect(0, 0, 1, rh * px)
    },
    svg: (s) => {
      const r = Math.min(rw, rh) * 0.28 * s
      const m = (cx: number, cy: number) =>
        `<path d="M${cx} ${cy - r} C${cx + r * 0.9} ${cy - r * 0.4} ${cx + r * 0.9} ${cy + r * 0.4} ${cx} ${cy + r} C${cx - r * 0.9} ${cy + r * 0.4} ${cx - r * 0.9} ${cy - r * 0.4} ${cx} ${cy - r} Z" fill="none" stroke="${shade(color, 28)}" stroke-width="0.8"/>`
      return `<rect width="${rw * s}" height="${rh * s}" fill="${color}"/>` + [m((rw / 2) * s, (rh / 2) * s), m(0, 0), m(rw * s, 0), m(0, rh * s), m(rw * s, rh * s)].join("")
    },
  }
}

/** Декоративная штукатурка и покраска: ровный цвет с лёгкой фактурой */
export function paintPattern(color: string, rough = false): FinishPattern {
  return plainPattern(color, rough ? 0.12 : 0.02)
}

/** SVG-узор для плана/развёртки: patternUnits в пикселях экрана, s — пикселей на метр */
export function svgPatternDef(id: string, p: FinishPattern, s: number, opts: { rotate?: number; ox?: number; oy?: number } = {}): string {
  const w = Math.max(p.repeatW * s, 0.5)
  const h = Math.max(p.repeatH * s, 0.5)
  const tr = [opts.ox || opts.oy ? `translate(${opts.ox || 0} ${opts.oy || 0})` : "", opts.rotate ? `rotate(${opts.rotate})` : ""].filter(Boolean).join(" ")
  return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${w.toFixed(2)}" height="${h.toFixed(2)}"${tr ? ` patternTransform="${tr}"` : ""}>${p.svg(s)}</pattern>`
}

/** Сколько плиток нужно на площадь с учётом раскладки: целых штук, м², коробок */
export function tileCount(t: TileSpec, area: number, wasteOverride?: number): { pieces: number; m2: number; boxes: number | null } {
  const waste = wasteOverride ?? ({ grid: 0.1, offset: 0.12, third: 0.12, diagonal: 0.15, herringbone: 0.18, checker: 0.1 } as const)[t.layout]
  const one = (t.w + t.joint) * (t.h + t.joint)
  const pieces = Math.ceil((area / one) * (1 + waste))
  const m2 = Math.round(pieces * t.w * t.h * 100) / 100
  return { pieces, m2, boxes: t.perBox ? Math.ceil(pieces / t.perBox) : null }
}
