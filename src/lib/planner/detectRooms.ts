import type { PlanPoint, PlanUnderlay } from "./types"
import { squareUp } from "@/components/crm/planner/drawAssist"

export interface DetectedRoom {
  points: PlanPoint[]
  area: number
}

const loadImage = (url: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image()
    i.crossOrigin = "anonymous"
    i.onload = () => res(i)
    i.onerror = () => rej(new Error("Не удалось открыть фото подложки"))
    i.src = url
  })

/** Сумма по прямоугольнику через интегральное изображение */
function integral(src: Float32Array | Uint8Array, W: number, H: number) {
  const I = new Float64Array((W + 1) * (H + 1))
  for (let y = 0; y < H; y++) {
    let row = 0
    for (let x = 0; x < W; x++) {
      row += src[y * W + x]
      I[(y + 1) * (W + 1) + x + 1] = I[y * (W + 1) + x + 1] + row
    }
  }
  return (x0: number, y0: number, x1: number, y1: number) => {
    x0 = Math.max(x0, 0)
    y0 = Math.max(y0, 0)
    x1 = Math.min(x1, W - 1)
    y1 = Math.min(y1, H - 1)
    if (x1 < x0 || y1 < y0) return 0
    const a = (y1 + 1) * (W + 1)
    const b = y0 * (W + 1)
    return I[a + x1 + 1] - I[a + x0] - I[b + x1 + 1] + I[b + x0]
  }
}

/** Квадратное расширение маски на r пикселей */
function dilate(mask: Uint8Array, W: number, H: number, r: number) {
  const sum = integral(mask, W, H)
  const out = new Uint8Array(W * H)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) out[y * W + x] = sum(x - r, y - r, x + r, y + r) > 0 ? 1 : 0
  return out
}

/** Внешний контур области по граням пикселей; вершины только в поворотах */
function traceOutline(mask: Uint8Array, W: number, H: number): PlanPoint[] {
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && mask[y * W + x] === 1
  const next = new Map<number, number[]>()
  const key = (x: number, y: number) => y * (W + 2) + x
  const add = (ax: number, ay: number, bx: number, by: number) => {
    const k = key(ax, ay)
    const arr = next.get(k)
    if (arr) arr.push(key(bx, by))
    else next.set(k, [key(bx, by)])
  }
  // Обход против часовой в координатах экрана: область всегда слева
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (!inside(x, y)) continue
      if (!inside(x, y - 1)) add(x + 1, y, x, y)
      if (!inside(x, y + 1)) add(x, y + 1, x + 1, y + 1)
      if (!inside(x - 1, y)) add(x, y, x, y + 1)
      if (!inside(x + 1, y)) add(x + 1, y + 1, x + 1, y)
    }
  let bestLoop: PlanPoint[] = []
  let bestArea = 0
  while (next.size) {
    const start = next.keys().next().value as number
    const loop: PlanPoint[] = []
    let cur = start
    for (let guard = 0; guard < 1e6; guard++) {
      const arr = next.get(cur)
      if (!arr || !arr.length) break
      const to = arr.pop()!
      if (!arr.length) next.delete(cur)
      loop.push({ x: cur % (W + 2), y: Math.floor(cur / (W + 2)) })
      cur = to
      if (cur === start) break
    }
    let a = 0
    for (let i = 0; i < loop.length; i++) {
      const p = loop[i]
      const q = loop[(i + 1) % loop.length]
      a += p.x * q.y - q.x * p.y
    }
    if (Math.abs(a) > bestArea) {
      bestArea = Math.abs(a)
      bestLoop = loop
    }
  }
  return dropCollinear(bestLoop, 1e-9)
}

function dropCollinear(pts: PlanPoint[], eps: number): PlanPoint[] {
  let cur = pts
  for (let pass = 0; pass < 3; pass++) {
    const out = cur.filter((p, i) => {
      const a = cur[(i - 1 + cur.length) % cur.length]
      const b = cur[(i + 1) % cur.length]
      const cross = (p.x - a.x) * (b.y - p.y) - (p.y - a.y) * (b.x - p.x)
      const l = Math.hypot(b.x - a.x, b.y - a.y) || 1
      return Math.abs(cross) / l > eps && Math.hypot(p.x - a.x, p.y - a.y) > 1e-9
    })
    if (out.length === cur.length || out.length < 3) return out.length < 3 ? cur : out
    cur = out
  }
  return cur
}

/** Упрощение замкнутого контура (Дуглас — Пекер) */
function simplify(pts: PlanPoint[], eps: number): PlanPoint[] {
  if (pts.length < 5) return pts
  const rdp = (arr: PlanPoint[]): PlanPoint[] => {
    if (arr.length < 3) return arr
    const a = arr[0]
    const b = arr[arr.length - 1]
    const L = Math.hypot(b.x - a.x, b.y - a.y) || 1
    let idx = 0
    let dmax = 0
    for (let i = 1; i < arr.length - 1; i++) {
      const d = Math.abs((arr[i].x - a.x) * (b.y - a.y) - (arr[i].y - a.y) * (b.x - a.x)) / L
      if (d > dmax) {
        dmax = d
        idx = i
      }
    }
    if (dmax <= eps) return [a, b]
    return [...rdp(arr.slice(0, idx + 1)).slice(0, -1), ...rdp(arr.slice(idx))]
  }
  let far = 0
  let fd = 0
  pts.forEach((p, i) => {
    const d = Math.hypot(p.x - pts[0].x, p.y - pts[0].y)
    if (d > fd) {
      fd = d
      far = i
    }
  })
  const first = rdp(pts.slice(0, far + 1))
  const second = rdp([...pts.slice(far), pts[0]])
  return [...first.slice(0, -1), ...second.slice(0, -1)]
}

/**
 * Поиск помещений на фото плана: тёмные линии — стены, дверные проёмы
 * закрываются расширением стен, замкнутые светлые области внутри плана — комнаты.
 * Контур возвращается по внутренней грани стен, в метрах плана
 */
export async function detectRooms(u: PlanUnderlay, existing: PlanPoint[][] = []): Promise<DetectedRoom[]> {
  const img = await loadImage(u.url)
  const k = Math.min(1, 1100 / Math.max(img.width, img.height))
  const W = Math.round(img.width * k)
  const H = Math.round(img.height * k)
  const c = document.createElement("canvas")
  c.width = W
  c.height = H
  const g = c.getContext("2d", { willReadFrequently: true })!
  g.drawImage(img, 0, 0, W, H)
  let data: Uint8ClampedArray
  try {
    data = g.getImageData(0, 0, W, H).data
  } catch {
    throw new Error("Браузер не дал прочитать фото подложки — загрузите его заново")
  }
  const gray = new Float32Array(W * H)
  for (let i = 0; i < W * H; i++) gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]
  return detectFromGray(gray, W, H, u, existing)
}

/** Распознавание по полутоновой картинке W×H, растянутой на подложку u */
export function detectFromGray(gray: Float32Array, W: number, H: number, u: PlanUnderlay, existing: PlanPoint[][] = []): DetectedRoom[] {
  const pxPerM = W / u.w

  // Тёмное относительно окрестности ~1 м — так не мешают тени и неровный свет на фото
  const mean = integral(gray, W, H)
  const R = Math.max(8, Math.round(pxPerM * 0.5))
  const dark = new Uint8Array(W * H)
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const x0 = Math.max(x - R, 0)
      const x1 = Math.min(x + R, W - 1)
      const y0 = Math.max(y - R, 0)
      const y1 = Math.min(y + R, H - 1)
      const m = mean(x0, y0, x1, y1) / ((x1 - x0 + 1) * (y1 - y0 + 1))
      dark[y * W + x] = gray[y * W + x] < m - 28 ? 1 : 0
    }

  // Стены — только длинные прямые линии: надписи, цифры и значки короче и в стены не попадают
  const minRun = Math.max(6, Math.round(pxPerM * 0.6))
  const gapPx = 2
  const lines = new Uint8Array(W * H)
  const runs = (len: number, cnt: number, at: (i: number, j: number) => number) => {
    for (let i = 0; i < cnt; i++) {
      let j = 0
      while (j < len) {
        if (!dark[at(i, j)]) {
          j++
          continue
        }
        let e = j
        let gap = 0
        let last = j
        while (e < len && gap <= gapPx) {
          if (dark[at(i, e)]) {
            gap = 0
            last = e
          } else gap++
          e++
        }
        if (last - j + 1 >= minRun) for (let t = j; t <= last; t++) lines[at(i, t)] = 1
        j = last + 1
      }
    }
  }
  runs(W, H, (y, x) => y * W + x)
  runs(H, W, (x, y) => y * W + x)

  // Дверь до ~1 м закрываем, продлевая стены вдоль их направления, — комнаты при этом не сужаются
  const r = Math.max(2, Math.round(pxPerM * 0.5))
  const wall = new Uint8Array(lines)
  const bridge = (len: number, cnt: number, at: (i: number, j: number) => number, thick: (i: number, j: number) => boolean) => {
    for (let i = 0; i < cnt; i++) {
      let prev = -1
      for (let j = 0; j < len; j++) {
        if (!lines[at(i, j)] || !thick(i, j)) continue
        if (prev >= 0 && j - prev > 1 && j - prev <= r * 2) for (let t = prev + 1; t < j; t++) wall[at(i, t)] = 1
        prev = j
      }
    }
  }
  // Продлеваем только по линиям, идущим вдоль: у пикселя есть соседи по этой оси
  bridge(W, H, (y, x) => y * W + x, (y, x) => (x > 0 && lines[y * W + x - 1] === 1) || (x < W - 1 && lines[y * W + x + 1] === 1))
  bridge(H, W, (x, y) => y * W + x, (x, y) => (y > 0 && lines[(y - 1) * W + x] === 1) || (y < H - 1 && lines[(y + 1) * W + x] === 1))

  const label = new Int32Array(W * H).fill(-1)
  const out: DetectedRoom[] = []
  const toWorld = (p: PlanPoint) => ({ x: u.x + (p.x / W) * u.w, y: u.y + (p.y / H) * u.h })
  const centerTaken = (p: PlanPoint) =>
    existing.some((poly) => {
      let inside = false
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const a = poly[i]
        const b = poly[j]
        if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside
      }
      return inside
    })
  let lab = 0
  const stack: number[] = []
  for (let s = 0; s < W * H; s++) {
    if (wall[s] || label[s] >= 0) continue
    stack.length = 0
    stack.push(s)
    label[s] = lab
    let border = false
    let n = 0
    let minX = W
    let minY = H
    let maxX = 0
    let maxY = 0
    let sx = 0
    let sy = 0
    while (stack.length) {
      const i = stack.pop()!
      const x = i % W
      const y = (i / W) | 0
      n++
      sx += x
      sy += y
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) border = true
      if (x > 0 && !wall[i - 1] && label[i - 1] < 0) (label[i - 1] = lab), stack.push(i - 1)
      if (x < W - 1 && !wall[i + 1] && label[i + 1] < 0) (label[i + 1] = lab), stack.push(i + 1)
      if (y > 0 && !wall[i - W] && label[i - W] < 0) (label[i - W] = lab), stack.push(i - W)
      if (y < H - 1 && !wall[i + W] && label[i + W] < 0) (label[i + W] = lab), stack.push(i + W)
    }
    const cur = lab++
    if (border) continue
    // Площадь после возврата к грани стены
    const area = n / (pxPerM * pxPerM)
    if (area < 0.6 || area > 150) continue
    if (centerTaken(toWorld({ x: sx / n, y: sy / n }))) continue

    // Область — до внутренней грани стен; закрываем дырки от надписей внутри
    const bx0 = Math.max(minX - 2, 0)
    const by0 = Math.max(minY - 2, 0)
    const bw = Math.min(maxX + 3, W) - bx0
    const bh = Math.min(maxY + 3, H) - by0
    const local = new Uint8Array(bw * bh)
    for (let y = minY; y <= maxY; y++)
      for (let x = minX; x <= maxX; x++) if (label[y * W + x] === cur) local[(y - by0) * bw + (x - bx0)] = 1
    const grown = dilate(local, bw, bh, 1)
    let outline = traceOutline(grown, bw, bh).map((p) => ({ x: p.x + bx0, y: p.y + by0 }))
    outline = simplify(outline, Math.max(1.5, pxPerM * 0.18))
    let pts = outline.map(toWorld)
    pts = squareUp(pts, 12)
    pts = dropCollinear(pts, 0.03).map((p) => ({ x: Math.round(p.x * 100) / 100, y: Math.round(p.y * 100) / 100 }))
    if (pts.length < 3) continue
    let a2 = 0
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]
      const q = pts[(i + 1) % pts.length]
      a2 += p.x * q.y - q.x * p.y
    }
    const realArea = Math.abs(a2) / 2
    if (realArea < 0.8) continue
    out.push({ points: pts, area: Math.round(realArea * 10) / 10 })
  }
  return out.sort((a, b) => b.area - a.area)
}
