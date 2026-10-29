import { PlanPoint, PlanRoom } from "./types"
import { pointInPolygon } from "./geometry"

/** Размерная линия от точки до стены или соседней точки */
export interface PlaceDim {
  a: PlanPoint
  b: PlanPoint
  /** Длина, м */
  length: number
  kind: "wall" | "node"
}

/** Линия выравнивания: точка стоит на одной оси с другой точкой или центром комнаты */
export interface PlaceGuide {
  from: PlanPoint
  to: PlanPoint
  kind: "node" | "center"
}

export interface PlaceAssist {
  point: PlanPoint
  dims: PlaceDim[]
  guides: PlaceGuide[]
  /** Шаг до соседней точки равен шагу в уже расставленном ряду */
  equal: PlanPoint[]
}

/** Насколько близко к оси другой точки курсор прилипает к ней, пикселей */
const ALIGN_PX = 10

/** Расстояние от точки до контура комнаты по лучу вдоль оси: dx/dy = ±1 */
function rayHit(p: PlanPoint, pts: PlanPoint[], dx: number, dy: number): number | null {
  let best: number | null = null
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % pts.length]
    let t: number | null = null
    if (dx !== 0) {
      if ((a.y - p.y) * (b.y - p.y) > 0 || a.y === b.y) continue
      const x = a.x + ((p.y - a.y) * (b.x - a.x)) / (b.y - a.y)
      t = (x - p.x) * dx
    } else {
      if ((a.x - p.x) * (b.x - p.x) > 0 || a.x === b.x) continue
      const y = a.y + ((p.x - a.x) * (b.y - a.y)) / (b.x - a.x)
      t = (y - p.y) * dy
    }
    if (t !== null && t > 1e-6 && (best === null || t < best)) best = t
  }
  return best
}

const same = (a: number, b: number) => Math.abs(a - b) < 1e-6

/**
 * Помощник расстановки потолочных точек: прилипает к осям уже стоящих точек
 * и к центру комнаты, ловит одинаковый шаг в ряду и считает расстояния до стен.
 * free — с зажатым Alt прилипания нет, расстояния всё равно показываются
 */
export function placeAssist(
  raw: PlanPoint,
  rooms: PlanRoom[],
  refs: PlanPoint[],
  scale: number,
  free: boolean,
): PlaceAssist {
  const p = { ...raw }
  const room = [...rooms].reverse().find((r) => r.points.length > 2 && pointInPolygon(raw, r.points)) || null
  const guides: PlaceGuide[] = []
  const equal: PlanPoint[] = []
  const tol = ALIGN_PX / scale

  const centre = room
    ? (() => {
        const xs = room.points.map((q) => q.x)
        const ys = room.points.map((q) => q.y)
        return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 }
      })()
    : null
  const pool = room ? refs.filter((r) => pointInPolygon(r, room.points)) : refs

  let lockX: { v: number; src: PlanPoint; kind: PlaceGuide["kind"] } | null = null
  let lockY: { v: number; src: PlanPoint; kind: PlaceGuide["kind"] } | null = null

  if (!free) {
    for (const r of pool) {
      if (Math.abs(r.x - p.x) < tol && (!lockX || Math.abs(r.x - p.x) < Math.abs(lockX.v - p.x))) lockX = { v: r.x, src: r, kind: "node" }
      if (Math.abs(r.y - p.y) < tol && (!lockY || Math.abs(r.y - p.y) < Math.abs(lockY.v - p.y))) lockY = { v: r.y, src: r, kind: "node" }
    }
    if (centre) {
      if (!lockX && Math.abs(centre.x - p.x) < tol) lockX = { v: centre.x, src: centre, kind: "center" }
      if (!lockY && Math.abs(centre.y - p.y) < tol) lockY = { v: centre.y, src: centre, kind: "center" }
    }
    if (lockX) p.x = lockX.v
    if (lockY) p.y = lockY.v

    // Ряд по горизонтали: тот же шаг, что между соседними точками ряда, или середина между двумя
    const rowSnap = (axis: "x" | "y") => {
      const other = axis === "x" ? "y" : "x"
      const row = pool.filter((r) => same(r[other], p[other])).sort((a, b) => a[axis] - b[axis])
      if (!row.length) return
      const candidates: { v: number; marks: PlanPoint[] }[] = []
      for (let i = 0; i + 1 < row.length; i++) {
        const a = row[i]
        const b = row[i + 1]
        candidates.push({ v: (a[axis] + b[axis]) / 2, marks: [a, b] })
      }
      if (row.length >= 2) {
        const first = row[0]
        const last = row[row.length - 1]
        const s1 = row[1][axis] - first[axis]
        const s2 = last[axis] - row[row.length - 2][axis]
        candidates.push({ v: last[axis] + s2, marks: [row[row.length - 2], last] })
        candidates.push({ v: first[axis] - s1, marks: [first, row[1]] })
      }
      let best: { v: number; marks: PlanPoint[] } | null = null
      for (const c of candidates) {
        if (Math.abs(c.v - p[axis]) < tol && (!best || Math.abs(c.v - p[axis]) < Math.abs(best.v - p[axis]))) best = c
      }
      if (best) {
        p[axis] = Math.round(best.v * 1000) / 1000
        equal.push(...best.marks)
      }
    }
    if (lockY) rowSnap("x")
    if (lockX) rowSnap("y")

    if (lockX) guides.push({ from: lockX.src, to: { ...p }, kind: lockX.kind })
    if (lockY) guides.push({ from: lockY.src, to: { ...p }, kind: lockY.kind })
  }

  const dims: PlaceDim[] = []
  if (room) {
    const left = rayHit(p, room.points, -1, 0)
    const right = rayHit(p, room.points, 1, 0)
    const up = rayHit(p, room.points, 0, -1)
    const down = rayHit(p, room.points, 0, 1)
    // Размеры до двух ближайших стен — по ним монтажник размечает потолок рулеткой
    const hx = left !== null && (right === null || left <= right) ? { t: left, s: -1 } : right !== null ? { t: right, s: 1 } : null
    const hy = up !== null && (down === null || up <= down) ? { t: up, s: -1 } : down !== null ? { t: down, s: 1 } : null
    if (hx) dims.push({ a: p, b: { x: p.x + hx.s * hx.t, y: p.y }, length: hx.t, kind: "wall" })
    if (hy) dims.push({ a: p, b: { x: p.x, y: p.y + hy.s * hy.t }, length: hy.t, kind: "wall" })
  }

  // Ближайшие соседи на той же оси — расстояние между ними
  const neighbour = (axis: "x" | "y") => {
    const other = axis === "x" ? "y" : "x"
    let best: PlanPoint | null = null
    for (const r of pool) {
      if (!same(r[other], p[other]) || same(r[axis], p[axis])) continue
      if (!best || Math.abs(r[axis] - p[axis]) < Math.abs(best[axis] - p[axis])) best = r
    }
    if (best) dims.push({ a: p, b: { ...best }, length: Math.abs(best[axis] - p[axis]), kind: "node" })
  }
  neighbour("x")
  neighbour("y")

  return { point: p, dims, guides, equal }
}
