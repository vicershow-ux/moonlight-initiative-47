import { PlanPoint } from "@/lib/planner/types"

export interface AssistGuide {
  from: PlanPoint
  to: PlanPoint
}

export interface AssistAngle {
  origin: PlanPoint
  /** Направление ближайшей оси, радианы */
  axis: number
  /** Направление отрезка, радианы */
  line: number
  /** Отклонение от оси, градусы со знаком */
  dev: number
  locked: boolean
  /** Угол к предыдущей стене, градусы */
  turn: number | null
}

export interface DrawAssist {
  point: PlanPoint
  guides: AssistGuide[]
  angle: AssistAngle | null
}

const DEG = 180 / Math.PI
/** Отклонение меньше этого значения — стена выпрямляется сама */
const LOCK_DEG = 3
/** Насколько близко к уровню другой стены курсор прилипает к нему, пикселей */
const ALIGN_PX = 9

const norm = (a: number) => {
  let v = a
  while (v > Math.PI) v -= 2 * Math.PI
  while (v < -Math.PI) v += 2 * Math.PI
  return v
}

/**
 * Помощник черчения: выпрямляет почти горизонтальные и вертикальные стены,
 * подтягивает угол на уровень уже нарисованных углов и считает отклонение в градусах.
 * free — с зажатым Alt помощник выключен
 */
export function assistPoint(
  raw: PlanPoint,
  prev: PlanPoint | null,
  before: PlanPoint | null,
  refs: PlanPoint[],
  scale: number,
  free: boolean,
): DrawAssist {
  const p = { ...raw }
  let lockedAxis: "h" | "v" | null = null

  if (prev && !free) {
    const ang = Math.atan2(p.y - prev.y, p.x - prev.x)
    const axis = Math.round(ang / (Math.PI / 2)) * (Math.PI / 2)
    if (Math.abs(norm(ang - axis)) * DEG < LOCK_DEG) {
      lockedAxis = Math.abs(Math.sin(axis)) < 0.5 ? "h" : "v"
      if (lockedAxis === "h") p.y = prev.y
      else p.x = prev.x
    }
  }

  const guides: AssistGuide[] = []
  if (!free) {
    const tol = ALIGN_PX / scale
    const same = (a: PlanPoint, b: PlanPoint) => Math.abs(a.x - b.x) < 1e-6 && Math.abs(a.y - b.y) < 1e-6
    const pool = refs.filter((r) => !prev || !same(r, prev))

    if (lockedAxis !== "v") {
      let best: PlanPoint | null = null
      for (const r of pool) {
        const d = Math.abs(r.x - p.x)
        if (d < tol && (!best || d < Math.abs(best.x - p.x))) best = r
      }
      if (best) p.x = best.x
      if (best) guides.push({ from: best, to: p })
    }
    if (lockedAxis !== "h") {
      let best: PlanPoint | null = null
      for (const r of pool) {
        const d = Math.abs(r.y - p.y)
        if (d < tol && (!best || d < Math.abs(best.y - p.y))) best = r
      }
      if (best) p.y = best.y
      if (best) guides.push({ from: best, to: p })
    }
    for (const g of guides) g.to = p
  }

  let angle: AssistAngle | null = null
  if (prev && Math.hypot(p.x - prev.x, p.y - prev.y) > 1e-6) {
    const line = Math.atan2(p.y - prev.y, p.x - prev.x)
    const axis = Math.round(line / (Math.PI / 2)) * (Math.PI / 2)
    const dev = norm(line - axis) * DEG
    let turn: number | null = null
    if (before) {
      const back = Math.atan2(before.y - prev.y, before.x - prev.x)
      turn = Math.abs(norm(line - back)) * DEG
    }
    angle = { origin: prev, axis, line, dev, locked: Math.abs(dev) < 0.05, turn }
  }

  return { point: p, guides, angle }
}

export const fmtDeg = (v: number) => {
  const a = Math.abs(v)
  return `${a < 10 ? a.toFixed(1).replace(".", ",") : Math.round(a)}°`
}

/**
 * Выпрямляет почти горизонтальные и вертикальные стены контура:
 * концы такой стены получают одинаковую координату, поэтому
 * противоположные стены прямоугольной комнаты выходят одной длины
 */
export function squareUp(points: PlanPoint[], maxDeg = LOCK_DEG): PlanPoint[] {
  const n = points.length
  if (n < 3) return points
  const px = points.map((_, i) => i)
  const py = points.map((_, i) => i)
  const find = (arr: number[], i: number): number => (arr[i] === i ? i : (arr[i] = find(arr, arr[i])))
  const join = (arr: number[], a: number, b: number) => {
    arr[find(arr, a)] = find(arr, b)
  }
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    const a = points[i]
    const b = points[j]
    const ang = Math.atan2(b.y - a.y, b.x - a.x)
    const axis = Math.round(ang / (Math.PI / 2)) * (Math.PI / 2)
    const dev = Math.abs(norm(ang - axis)) * DEG
    if (dev === 0 || dev >= maxDeg) continue
    if (Math.abs(Math.sin(axis)) < 0.5) join(py, i, j)
    else join(px, i, j)
  }
  const avg = (arr: number[], key: "x" | "y") => {
    const sum = new Map<number, { s: number; c: number }>()
    points.forEach((p, i) => {
      const r = find(arr, i)
      const v = sum.get(r) || { s: 0, c: 0 }
      v.s += p[key]
      v.c += 1
      sum.set(r, v)
    })
    return points.map((_, i) => {
      const v = sum.get(find(arr, i))!
      return Math.round((v.s / v.c) * 1000) / 1000
    })
  }
  const xs = avg(px, "x")
  const ys = avg(py, "y")
  return points.map((_, i) => ({ x: xs[i], y: ys[i] }))
}
