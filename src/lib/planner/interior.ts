import {
  FURNITURE_PRESETS,
  HEATING_PRESETS,
  PlanFurniture,
  PlanHeating,
  PlanPoint,
  PlanRoom,
  PlanScheme,
} from "./types"
import { dist, pointInPolygon, polygonArea, polygonPerimeter, distToSegment } from "./geometry"
import { roomWalls } from "./walls"

/** Углы предмета мебели с учётом поворота: тыльная сторона — первые две точки */
export function furnitureCorners(f: Pick<PlanFurniture, "x" | "y" | "w" | "d" | "rot">): PlanPoint[] {
  const r = (f.rot * Math.PI) / 180
  const c = Math.cos(r)
  const s = Math.sin(r)
  const hw = f.w / 2
  const hd = f.d / 2
  return [
    [-hw, -hd],
    [hw, -hd],
    [hw, hd],
    [-hw, hd],
  ].map(([x, y]) => ({ x: f.x + x * c - y * s, y: f.y + x * s + y * c }))
}

export const furnitureRoom = (scheme: Pick<PlanScheme, "rooms">, p: PlanPoint): PlanRoom | null =>
  [...scheme.rooms].reverse().find((r) => r.points.length > 2 && pointInPolygon(p, r.points)) || null

export const hitFurniture = (items: PlanFurniture[], p: PlanPoint): PlanFurniture | null =>
  [...items].reverse().find((f) => pointInPolygon(p, furnitureCorners(f))) || null

/**
 * Пристыковка к стене: тыльная сторона прижимается к ближайшей стене помещения,
 * поворот — так, чтобы предмет смотрел в комнату. maxDist — с какого расстояния прилипать
 */
export function snapFurnitureToWall(
  scheme: PlanScheme,
  f: Pick<PlanFurniture, "x" | "y" | "w" | "d" | "rot">,
  maxDist = 0.5,
): { x: number; y: number; rot: number } | null {
  const room = furnitureRoom(scheme, f)
  if (!room) return null
  let best: { d: number; x: number; y: number; rot: number } | null = null
  for (const w of roomWalls(room, scheme)) {
    const ia = { x: w.a.x - w.nx * w.inner, y: w.a.y - w.ny * w.inner }
    const ib = { x: w.b.x - w.nx * w.inner, y: w.b.y - w.ny * w.inner }
    const d = distToSegment(f, ia, ib)
    if (d > maxDist + f.d / 2 || (best && d > best.d)) continue
    // Проекция центра на грань стены, затем отступ на полглубины внутрь комнаты
    const t = Math.min(Math.max((f.x - ia.x) * w.ux + (f.y - ia.y) * w.uy, f.w / 2), Math.max(w.length - f.w / 2, f.w / 2))
    const px = ia.x + w.ux * t - w.nx * (f.d / 2)
    const py = ia.y + w.uy * t - w.ny * (f.d / 2)
    // Тыльная сторона (локальная −y) смотрит на стену: нормаль наружу = направление «назад»
    const rot = Math.round(((Math.atan2(w.nx, -w.ny) * 180) / Math.PI + 360) % 360)
    best = { d, x: px, y: py, rot }
  }
  return best ? { x: best.x, y: best.y, rot: best.rot } : null
}

// ——— Тёплый пол ———

/** Площадь многоугольника с учётом знака — для вычитания */
const absArea = (pts: PlanPoint[]) => Math.abs(polygonArea(pts))

/** Пересечение прямоугольника мебели с зоной — площадь, приближённо по сетке 5 см */
function overlapArea(zone: PlanPoint[], piece: PlanPoint[]): number {
  const xs = piece.map((p) => p.x)
  const ys = piece.map((p) => p.y)
  const step = 0.05
  let n = 0
  for (let x = Math.min(...xs) + step / 2; x < Math.max(...xs); x += step) {
    for (let y = Math.min(...ys) + step / 2; y < Math.max(...ys); y += step) {
      const q = { x, y }
      if (pointInPolygon(q, piece) && pointInPolygon(q, zone)) n++
    }
  }
  return n * step * step
}

export interface HeatingCalc {
  /** Площадь контура, м² */
  gross: number
  /** Под мебелью без ножек, м² */
  blocked: number
  /** Полезная площадь обогрева, м² */
  net: number
  /** Мощность, Вт */
  watts: number
  /** Длина кабеля или трубы, м */
  length: number
  /** Ток, А */
  amps: number
}

export function heatingCalc(scheme: PlanScheme, h: PlanHeating): HeatingCalc {
  const gross = absArea(h.points)
  const blocked = h.cutFurniture
    ? (scheme.furniture || [])
        .filter((f) => FURNITURE_PRESETS[f.kind].blocksHeating)
        .reduce((s, f) => s + overlapArea(h.points, furnitureCorners(f)), 0)
    : 0
  const net = Math.max(gross - blocked, 0)
  const watts = net * h.power
  const step = h.step ?? HEATING_PRESETS[h.kind].step ?? 0
  const length = (h.kind === "cable" || h.kind === "water") && step > 0 ? net / step : 0
  return {
    gross: Math.round(gross * 100) / 100,
    blocked: Math.round(blocked * 100) / 100,
    net: Math.round(net * 100) / 100,
    watts: Math.round(watts),
    length: Math.round(length * 10) / 10,
    amps: h.kind === "water" ? 0 : Math.round((watts / 230) * 10) / 10,
  }
}

export const heatingRoom = (scheme: Pick<PlanScheme, "rooms">, h: PlanHeating): PlanRoom | null =>
  scheme.rooms.find((r) => r.id === h.roomId) || (h.points.length ? furnitureRoom(scheme, centroid(h.points)) : null)

const centroid = (pts: PlanPoint[]) => ({
  x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
  y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
})

export const hitHeating = (zones: PlanHeating[], p: PlanPoint): PlanHeating | null =>
  [...zones].reverse().find((h) => h.points.length > 2 && pointInPolygon(p, h.points)) || null

/** Зона по всему помещению с отступом от стен — быстрая заготовка */
export function roomHeatingContour(room: PlanRoom, offset = 0.05): PlanPoint[] {
  const pts = room.points
  const n = pts.length
  let sa = 0
  for (let i = 0; i < n; i++) sa += pts[i].x * pts[(i + 1) % n].y - pts[(i + 1) % n].x * pts[i].y
  const sign = sa > 0 ? 1 : -1
  const lines = pts.map((a, i) => {
    const b = pts[(i + 1) % n]
    const len = dist(a, b) || 1
    const nx = (-(b.y - a.y) / len) * sign
    const ny = ((b.x - a.x) / len) * sign
    return { a: { x: a.x + nx * offset, y: a.y + ny * offset }, b: { x: b.x + nx * offset, y: b.y + ny * offset } }
  })
  return lines.map((cur, i) => {
    const prev = lines[(i - 1 + n) % n]
    const d = (prev.a.x - prev.b.x) * (cur.a.y - cur.b.y) - (prev.a.y - prev.b.y) * (cur.a.x - cur.b.x)
    if (Math.abs(d) < 1e-9) return cur.a
    const t = ((prev.a.x - cur.a.x) * (cur.a.y - cur.b.y) - (prev.a.y - cur.a.y) * (cur.a.x - cur.b.x)) / d
    return { x: prev.a.x + (prev.b.x - prev.a.x) * t, y: prev.a.y + (prev.b.y - prev.a.y) * t }
  })
}

export const contourPerimeter = (pts: PlanPoint[]) => polygonPerimeter(pts)

// ——— Подсказки по мебели и электрике ———

export interface InteriorWarning {
  text: string
  at: PlanPoint
}

const WALL_SOCKETS = new Set(["socket", "socket_power", "switch", "switch_double", "switch_pass", "switch_pass_double"])

/**
 * Проверки расстановки: розетка или выключатель за шкафом, светильник
 * не по центру кровати/стола, зона тёплого пола под ванной, кровать у батареи и т.п.
 */
export function interiorWarnings(scheme: PlanScheme): InteriorWarning[] {
  const out: InteriorWarning[] = []
  const furniture = scheme.furniture || []
  const nodes = (scheme.nodes || []).filter((n) => n.layer === "electric")
  for (const f of furniture) {
    const pr = FURNITURE_PRESETS[f.kind]
    const corners = furnitureCorners(f)
    // Чуть расширяем контур — розетка на стене стоит у самой грани
    const grown = furnitureCorners({ ...f, w: f.w + 0.04, d: f.d + 0.1 })
    if (pr.blocksSockets) {
      for (const n of nodes) {
        if (!WALL_SOCKETS.has(n.kind)) continue
        if (n.height > f.h + 0.05) continue
        if (pointInPolygon(n, grown)) {
          out.push({ text: `${n.kind.startsWith("switch") ? "Выключатель" : "Розетка"} закрыта: ${f.label || pr.label}`, at: { x: n.x, y: n.y } })
        }
      }
    }
    if (f.kind === "bed_double" || f.kind === "bed_single" || f.kind === "table") {
      const over = nodes.filter((n) => (n.kind === "light" || n.kind === "spot") && pointInPolygon(n, corners))
      for (const n of over) {
        // Над кроватью и столом люстру ждут по центру — допуск 5 см
        const off = Math.max(Math.abs(n.x - f.x), Math.abs(n.y - f.y))
        if (n.kind === "light" && off > 0.05) out.push({ text: `Светильник не по центру: ${f.label || pr.label} (${Math.round(off * 1000)} мм)`, at: { x: n.x, y: n.y } })
      }
    }
  }
  for (const h of scheme.heating || []) {
    const c = heatingCalc(scheme, h)
    if (!h.cutFurniture && furniture.some((f) => FURNITURE_PRESETS[f.kind].blocksHeating && overlapArea(h.points, furnitureCorners(f)) > 0.05)) {
      out.push({ text: "Тёплый пол заходит под мебель — включите вырез под мебелью", at: centroid(h.points) })
    }
    if (h.kind !== "water" && c.amps > 16) out.push({ text: `Тёплый пол ${c.watts} Вт — больше 16 А, нужен контактор или две зоны`, at: centroid(h.points) })
  }
  return out
}

/** Точки привязки для светильников: центры и края мебели — чтобы ставить ровно над столом или кроватью */
export function furnitureRefs(scheme: PlanScheme): PlanPoint[] {
  return (scheme.furniture || []).flatMap((f) => [{ x: f.x, y: f.y }, ...furnitureCorners(f)])
}
