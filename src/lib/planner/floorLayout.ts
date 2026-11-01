import { wallSegments } from "./geometry"
import type { PlanRoom, RoomFinish } from "./types"

export type FloorDir = "along" | "across"

export const FLOOR_DIRS: Record<FloorDir, string> = {
  along: "Вдоль длинной стены",
  across: "Поперёк",
}

export interface FloorLayout {
  /** Направление длинной стороны доски на плане, радианы (−90°…90°] */
  angle: number
  angleDeg: number
  /** Угол стены, от которой начинается укладка — от него идёт сетка рядов */
  origin: { x: number; y: number }
  start: { id: string; a: { x: number; y: number }; b: { x: number; y: number }; length: number } | null
  dir: FloorDir
  /** Стена выбрана автоматически (длинная, вдоль досок) */
  auto: boolean
}

/** Укладка пола: направление досок и стена, от которой идёт первый ряд */
export function floorLayout(room: PlanRoom, f: RoomFinish): FloorLayout {
  const dir: FloorDir = f.floorDir || "along"
  const segs = wallSegments(room).filter((s) => s.length > 1e-6)
  if (!segs.length) return { angle: 0, angleDeg: 0, origin: { x: 0, y: 0 }, start: null, dir, auto: true }
  const ang = (s: (typeof segs)[number]) => Math.atan2(s.b.y - s.a.y, s.b.x - s.a.x)
  const longest = segs.reduce((a, b) => (b.length > a.length ? b : a))
  let angle = ang(longest) + (dir === "across" ? Math.PI / 2 : 0)
  angle = Math.atan2(Math.sin(angle), Math.cos(angle))
  if (angle > Math.PI / 2 + 1e-9) angle -= Math.PI
  if (angle <= -Math.PI / 2 + 1e-9) angle += Math.PI
  // По умолчанию — самая длинная стена, параллельная доскам: первый ряд кладут вдоль неё
  const parallel = segs.filter((s) => Math.abs(Math.sin(ang(s) - angle)) < 0.1).sort((a, b) => b.length - a.length)
  const chosen = f.floorStartWall ? segs.find((s) => s.id === f.floorStartWall) : undefined
  const start = chosen || parallel[0] || longest
  return { angle, angleDeg: (angle * 180) / Math.PI, origin: start.a, start, dir, auto: !chosen }
}

/** Внутренняя нормаль стены — в сторону центра помещения */
export function inwardNormal(room: PlanRoom, a: { x: number; y: number }, b: { x: number; y: number }) {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
  let nx = -(b.y - a.y) / len
  let ny = (b.x - a.x) / len
  const cx = room.points.reduce((s, p) => s + p.x, 0) / room.points.length
  const cy = room.points.reduce((s, p) => s + p.y, 0) / room.points.length
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  if ((cx - mx) * nx + (cy - my) * ny < 0) {
    nx = -nx
    ny = -ny
  }
  return { nx, ny }
}
