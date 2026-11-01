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
export function dilate(mask: Uint8Array, W: number, H: number, r: number) {
  const sum = integral(mask, W, H)
  const out = new Uint8Array(W * H)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) out[y * W + x] = sum(x - r, y - r, x + r, y + r) > 0 ? 1 : 0
  return out
}

/** Внешний контур области по граням пикселей; вершины только в поворотах */
export function traceOutline(mask: Uint8Array, W: number, H: number): PlanPoint[] {
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

export function dropCollinear(pts: PlanPoint[], eps: number): PlanPoint[] {
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
export function simplify(pts: PlanPoint[], eps: number): PlanPoint[] {
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
  const g = await loadGray(u)
  return detectFromGray(g.gray, g.W, g.H, u, existing)
}

/** Фото подложки в оттенках серого (до 2400 px по длинной стороне) */
export async function loadGray(u: PlanUnderlay): Promise<{ gray: Float32Array; W: number; H: number }> {
  const img = await loadImage(u.url)
  const k = Math.min(1, 2400 / Math.max(img.width, img.height))
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
  return { gray, W, H }
}

const TARGET_PX_PER_M = 29

/** Масштабирование полутоновой картинки до ширины W (усреднение при уменьшении, билинейно при увеличении) */
export function resample(src: Float32Array, W0: number, H0: number, W: number): { gray: Float32Array; W: number; H: number } {
  if (Math.abs(W - W0) <= 2) return { gray: src, W: W0, H: H0 }
  const k = W0 / W
  const H = Math.max(1, Math.round(H0 / k))
  const out = new Float32Array(W * H)
  if (k > 1) {
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const x0 = Math.floor(x * k)
        const x1 = Math.min(Math.max(Math.floor((x + 1) * k), x0 + 1), W0)
        const y0 = Math.floor(y * k)
        const y1 = Math.min(Math.max(Math.floor((y + 1) * k), y0 + 1), H0)
        let s = 0
        for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) s += src[yy * W0 + xx]
        out[y * W + x] = s / ((x1 - x0) * (y1 - y0))
      }
  } else {
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const fx = Math.min(x * k, W0 - 1.001)
        const fy = Math.min(y * k, H0 - 1.001)
        const ix = Math.floor(fx)
        const iy = Math.floor(fy)
        const tx = fx - ix
        const ty = fy - iy
        out[y * W + x] =
          src[iy * W0 + ix] * (1 - tx) * (1 - ty) +
          src[iy * W0 + ix + 1] * tx * (1 - ty) +
          src[(iy + 1) * W0 + ix] * (1 - tx) * ty +
          src[(iy + 1) * W0 + ix + 1] * tx * ty
      }
  }
  return { gray: out, W, H }
}

/** Распознавание по полутоновой картинке W×H, растянутой на подложку u */
export function detectFromGray(gray0: Float32Array, W0: number, H0: number, u: PlanUnderlay, existing: PlanPoint[][] = []): DetectedRoom[] {
  // Один набор порогов срабатывает не на всех фото: прогоняем несколько масштабов и ширин
  // закрываемых дверей и оставляем контуры, которые находятся устойчиво и не налезают друг на друга
  const runs: DetectedRoom[][] = []
  for (const ppm of [24, 29, 36])
    for (const br of [0.45, 0.6]) {
      const { gray, W, H } = resample(gray0, W0, H0, Math.round(u.w * ppm))
      if (W < 50) continue
      runs.push(detectPass(gray, W, H, u, existing, br))
    }
  return mergeRuns(runs)
}

/** Доля площади a, накрытая b — по сетке 5 см */
function coverage(a: PlanPoint[], b: PlanPoint[]): number {
  const bx = (p: PlanPoint[]) => [Math.min(...p.map((q) => q.x)), Math.min(...p.map((q) => q.y)), Math.max(...p.map((q) => q.x)), Math.max(...p.map((q) => q.y))]
  const A = bx(a)
  const B = bx(b)
  if (A[2] < B[0] || B[2] < A[0] || A[3] < B[1] || B[3] < A[1]) return 0
  const step = Math.max(0.05, Math.sqrt((A[2] - A[0]) * (A[3] - A[1])) / 40)
  let inA = 0
  let both = 0
  for (let y = A[1] + step / 2; y < A[3]; y += step)
    for (let x = A[0] + step / 2; x < A[2]; x += step) {
      const p = { x, y }
      if (!inPoly(p, a)) continue
      inA++
      if (inPoly(p, b)) both++
    }
  return inA ? both / inA : 0
}

function inPoly(p: PlanPoint, poly: PlanPoint[]) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]
    const b = poly[j]
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside
  }
  return inside
}

function mergeRuns(runs: DetectedRoom[][]): DetectedRoom[] {
  const all = runs.flatMap((r, ri) => r.map((c) => ({ ...c, ri })))
  const scored = all.map((c) => {
    let support = 0
    for (let ri = 0; ri < runs.length; ri++) {
      if (ri === c.ri) {
        support++
        continue
      }
      if (runs[ri].some((o) => Math.abs(o.area - c.area) < Math.max(0.3, c.area * 0.12) && coverage(c.points, o.points) > 0.85 && coverage(o.points, c.points) > 0.85)) support++
    }
    // Устойчивые и простые (прямоугольные) контуры — в приоритете
    return { c, score: support * 10 - Math.max(0, c.points.length - 4) * 1.5 }
  })
  scored.sort((a, b) => b.score - a.score || b.c.area - a.c.area)
  const out: DetectedRoom[] = []
  const minSupport = runs.length >= 4 ? 2 : 1
  for (const { c, score } of scored) {
    if (score < minSupport * 10 - 12) continue
    if (out.some((o) => coverage(c.points, o.points) > 0.15 || coverage(o.points, c.points) > 0.15)) continue
    out.push({ points: c.points, area: c.area })
  }
  // Ванна, унитаз, плита рисуются линиями и режут мелкое помещение на куски. Если в каком-то
  // проходе нашёлся целый прямоугольник, накрывающий несколько мелких кусков, берём его
  const rects = all.filter((c) => c.points.length === 4 && c.area < 12).sort((a, b) => b.area - a.area)
  for (const big of rects) {
    const parts = out.filter((o) => o.area < 2.2 && coverage(o.points, big.points) > 0.85)
    if (parts.length < 2) continue
    const sum = parts.reduce((s, p) => s + p.area, 0)
    if (sum < big.area * 0.55) continue
    // Не задеваем соседние помещения
    if (out.some((o) => !parts.includes(o) && coverage(o.points, big.points) > 0.15)) continue
    for (const p of parts) out.splice(out.indexOf(p), 1)
    out.push({ points: big.points, area: big.area })
  }
  // Куски, разделённые только тонкой линией сантехники (зазора нет), — одно помещение
  const box = (p: PlanPoint[]) => ({ x0: Math.min(...p.map((q) => q.x)), y0: Math.min(...p.map((q) => q.y)), x1: Math.max(...p.map((q) => q.x)), y1: Math.max(...p.map((q) => q.y)) })
  for (let changed = true; changed; ) {
    changed = false
    for (let i = 0; i < out.length && !changed; i++)
      for (let j = i + 1; j < out.length && !changed; j++) {
        const a = out[i]
        const b = out[j]
        if (a.area > 3 || b.area > 3 || a.points.length !== 4 || b.points.length !== 4) continue
        const A = box(a.points)
        const B = box(b.points)
        const gx = Math.max(A.x0, B.x0) - Math.min(A.x1, B.x1)
        const gy = Math.max(A.y0, B.y0) - Math.min(A.y1, B.y1)
        const side = gx > gy ? { gap: gx, ov: Math.min(A.y1, B.y1) - Math.max(A.y0, B.y0), len: Math.min(A.y1 - A.y0, B.y1 - B.y0) } : { gap: gy, ov: Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0), len: Math.min(A.x1 - A.x0, B.x1 - B.x0) }
        if (side.gap > 0.05 || side.ov < side.len * 0.85) continue
        const U = { x0: Math.min(A.x0, B.x0), y0: Math.min(A.y0, B.y0), x1: Math.max(A.x1, B.x1), y1: Math.max(A.y1, B.y1) }
        const ua = (U.x1 - U.x0) * (U.y1 - U.y0)
        if (ua > 4.5 || ua > (a.area + b.area) * 1.25) continue
        const pts = [{ x: U.x0, y: U.y0 }, { x: U.x1, y: U.y0 }, { x: U.x1, y: U.y1 }, { x: U.x0, y: U.y1 }]
        out.splice(j, 1)
        out[i] = { points: pts, area: Math.round(ua * 10) / 10 }
        changed = true
      }
  }
  return out.sort((a, b) => b.area - a.area)
}

export function detectPass(gray: Float32Array, W: number, H: number, u: PlanUnderlay, existing: PlanPoint[][], bridgeM: number): DetectedRoom[] {
  {
  const pxPerM = W / u.w

  // Тёмное относительно окрестности ~1 м — так не мешают тени и неровный свет на фото
  const mean = integral(gray, W, H)
  // Порог под контраст фото: бледная ксерокопия и чёткий скан
  const sorted = Float32Array.from(gray).sort()
  const span = sorted[Math.floor(sorted.length * 0.97)] - sorted[Math.floor(sorted.length * 0.02)]
  const thr = Math.min(28, Math.max(8, span * 0.16))
  const R = Math.max(8, Math.round(pxPerM * 0.5))
  const dark = new Uint8Array(W * H)
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const x0 = Math.max(x - R, 0)
      const x1 = Math.min(x + R, W - 1)
      const y0 = Math.max(y - R, 0)
      const y1 = Math.min(y + R, H - 1)
      const m = mean(x0, y0, x1, y1) / ((x1 - x0 + 1) * (y1 - y0 + 1))
      dark[y * W + x] = gray[y * W + x] < m - thr ? 1 : 0
    }

  // Надписи, размеры и цифры — отдельные мелкие пятна, не связанные со стенами: убираем их целиком,
  // иначе вертикальная подпись размера («3.10») или дробь площади режут комнату пополам
  dropSmallBlobs(dark, W, H, Math.round(pxPerM * 1.0))

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
  const r = Math.max(2, Math.round(pxPerM * bridgeM))
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
    // Контур из пикселей — только прямые углы; мелкие ступеньки от шума и надписей убираем
    let pts = orthoSimplify(dropCollinear(outline, 1e-9).map(toWorld), 0.45)
    if (pts.length < 3) continue
    // Узкая щель между стенами (толщина стены, вентканал) — не помещение
    const xs = pts.map((p) => p.x)
    const ys = pts.map((p) => p.y)
    if (Math.min(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) < 0.55) continue
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
  alignRooms(out.map((r) => r.points), 0.12)
  for (const r of out) r.points = dropCollinear(r.points.map((p) => ({ x: Math.round(p.x * 100) / 100, y: Math.round(p.y * 100) / 100 })), 0.01)
  return out.filter((r) => r.points.length >= 3).sort((a, b) => b.area - a.area)
  }
}

/** Удаляет связные тёмные пятна, которые по обеим осям меньше maxPx */
export function dropSmallBlobs(mask: Uint8Array, W: number, H: number, maxPx: number) {
  const seen = new Uint8Array(W * H)
  const stack: number[] = []
  const blob: number[] = []
  for (let s = 0; s < W * H; s++) {
    if (!mask[s] || seen[s]) continue
    stack.length = 0
    blob.length = 0
    stack.push(s)
    seen[s] = 1
    let minX = W
    let minY = H
    let maxX = 0
    let maxY = 0
    while (stack.length) {
      const i = stack.pop()!
      blob.push(i)
      const x = i % W
      const y = (i / W) | 0
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
          const j = ny * W + nx
          if (mask[j] && !seen[j]) {
            seen[j] = 1
            stack.push(j)
          }
        }
    }
    if (maxX - minX < maxPx && maxY - minY < maxPx) for (const i of blob) mask[i] = 0
  }
}

/**
 * Упрощение контура с прямыми углами: самая короткая стена короче minLen убирается.
 * Ступенька — меньшая соседняя стена переезжает на линию большей; узкий зубец — втягивается.
 * Так одна стена не дробится на куски
 */
export function orthoSimplify(src: PlanPoint[], minLen: number): PlanPoint[] {
  let pts = src.map((p) => ({ ...p }))
  const len = (a: PlanPoint, b: PlanPoint) => Math.hypot(b.x - a.x, b.y - a.y)
  for (let guard = 0; guard < 2000 && pts.length > 4; guard++) {
    const n = pts.length
    let i = -1
    let best = minLen
    for (let k = 0; k < n; k++) {
      const l = len(pts[k], pts[(k + 1) % n])
      if (l < best) {
        best = l
        i = k
      }
    }
    if (i < 0) break
    const a = pts[i]
    const b = pts[(i + 1) % n]
    const pa = pts[(i - 1 + n) % n]
    const nb = pts[(i + 2) % n]
    const u1 = { x: a.x - pa.x, y: a.y - pa.y }
    const u2 = { x: nb.x - b.x, y: nb.y - b.y }
    const l1 = len(pa, a)
    const l2 = len(b, nb)
    const next = pts.map((p) => ({ ...p }))
    if (u1.x * u2.x + u1.y * u2.y > 0) {
      // Ступенька: стена i исчезает, короткий сосед ложится на линию длинного
      if (l2 <= l1) next[(i + 2) % n] = { x: nb.x + a.x - b.x, y: nb.y + a.y - b.y }
      else next[(i - 1 + n) % n] = { x: pa.x + b.x - a.x, y: pa.y + b.y - a.y }
      // Лишняя вершина ступеньки становится дублем соседней и отфильтруется
      if (l2 <= l1) next[(i + 1) % n] = { ...a }
      else next[i] = { ...b }
    } else {
      // Зубец: стену i сдвигаем назад на длину короткого соседа
      const d = Math.min(l1, l2)
      const ux = -u1.x / (l1 || 1)
      const uy = -u1.y / (l1 || 1)
      next[i] = { x: a.x + ux * d, y: a.y + uy * d }
      next[(i + 1) % n] = { x: b.x + ux * d, y: b.y + uy * d }
    }
    const cleaned = dropCollinear(next.filter((p, k) => len(p, next[(k + 1) % next.length]) > 1e-6), 1e-6)
    if (cleaned.length < 4 || cleaned.length >= n) {
      // Упрощать дальше нечего — не зацикливаемся
      if (cleaned.length >= n) minLen = best - 1e-9
      if (cleaned.length < 4) break
    }
    pts = cleaned
  }
  return pts
}

/** Близкие линии соседних комнат сводим к одной координате — стены разных комнат ложатся ровно */
function alignRooms(rooms: PlanPoint[][], tol: number) {
  for (const axis of ["x", "y"] as const) {
    const vals: { v: number; r: number; i: number }[] = []
    rooms.forEach((pts, r) => pts.forEach((p, i) => vals.push({ v: p[axis], r, i })))
    vals.sort((a, b) => a.v - b.v)
    let start = 0
    for (let k = 1; k <= vals.length; k++) {
      if (k < vals.length && vals[k].v - vals[k - 1].v < tol / 3 && vals[k].v - vals[start].v < tol) continue
      const group = vals.slice(start, k)
      if (group.length > 1) {
        const m = group.reduce((s, g) => s + g.v, 0) / group.length
        for (const g of group) rooms[g.r][g.i] = { ...rooms[g.r][g.i], [axis]: m }
      }
      start = k
    }
  }
}
