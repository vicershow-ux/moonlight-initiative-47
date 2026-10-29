import { FIXTURE_PRESETS, PlanFixture, PlanPoint, PlanRoom, PlanScheme } from "./types"
import { dist, distToSegment, pointInPolygon, polygonArea } from "./geometry"
import { rayHit } from "./placeAssist"

/** Отступ светящегося контура парящего потолка от стен по умолчанию, м */
export const FLOATING_OFFSET = 0.1

export const fixtureLength = (f: PlanFixture) => dist(f.a, f.b)

/** Контур, сдвинутый внутрь помещения на d — линия парящего потолка */
export function insetPolygon(points: PlanPoint[], d: number): PlanPoint[] {
  const n = points.length
  if (n < 3) return points
  // Обход против часовой — нормаль внутрь слева; по часовой — справа
  const sign = polygonSignedArea(points) > 0 ? 1 : -1
  const lines = points.map((a, i) => {
    const b = points[(i + 1) % n]
    const len = dist(a, b) || 1
    const nx = (-(b.y - a.y) / len) * sign
    const ny = ((b.x - a.x) / len) * sign
    return { a: { x: a.x + nx * d, y: a.y + ny * d }, b: { x: b.x + nx * d, y: b.y + ny * d } }
  })
  return lines.map((cur, i) => {
    const prev = lines[(i - 1 + n) % n]
    return intersect(prev.a, prev.b, cur.a, cur.b) ?? cur.a
  })
}

function polygonSignedArea(pts: PlanPoint[]): number {
  let s = 0
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % pts.length]
    s += a.x * b.y - b.x * a.y
  }
  return s / 2
}

function intersect(p1: PlanPoint, p2: PlanPoint, p3: PlanPoint, p4: PlanPoint): PlanPoint | null {
  const d = (p1.x - p2.x) * (p4.y - p3.y) - (p1.y - p2.y) * (p4.x - p3.x)
  if (Math.abs(d) < 1e-9) return null
  const t = ((p1.x - p3.x) * (p4.y - p3.y) - (p1.y - p3.y) * (p4.x - p3.x)) / d
  return { x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t }
}

export const fixtureRoom = (scheme: Pick<PlanScheme, "rooms">, f: PlanFixture): PlanRoom | null =>
  scheme.rooms.find((r) => r.id === f.roomId) ||
  [...scheme.rooms].reverse().find((r) => pointInPolygon({ x: (f.a.x + f.b.x) / 2, y: (f.a.y + f.b.y) / 2 }, r.points)) ||
  null

/** Контур парящего потолка; у трека — его отрезок */
export function floatingContour(scheme: Pick<PlanScheme, "rooms">, f: PlanFixture): PlanPoint[] | null {
  const room = fixtureRoom(scheme, f)
  if (!room || room.points.length < 3) return null
  return insetPolygon(room.points, f.offset ?? FLOATING_OFFSET)
}

/** Длина подсветки парящего потолка — периметр контура, м */
export function floatingPerimeter(contour: PlanPoint[]): number {
  return contour.reduce((s, p, i) => s + dist(p, contour[(i + 1) % contour.length]), 0)
}

export const floatingArea = (contour: PlanPoint[]) => Math.abs(polygonArea(contour))

/**
 * Отступы трека от стен: сбоку (перпендикулярно треку, до ближайшей стены)
 * и с торцов (по оси трека до стены). По ним трек размечают на потолке
 */
export function trackOffsets(scheme: Pick<PlanScheme, "rooms">, f: PlanFixture) {
  const room = fixtureRoom(scheme, f)
  const horiz = Math.abs(f.b.y - f.a.y) <= Math.abs(f.b.x - f.a.x)
  if (!room) return { horiz, side: null, sideDir: 0, startEnd: null as number | null, endEnd: null as number | null }
  const mid = { x: (f.a.x + f.b.x) / 2, y: (f.a.y + f.b.y) / 2 }
  const lo = horiz ? (f.a.x <= f.b.x ? f.a : f.b) : f.a.y <= f.b.y ? f.a : f.b
  const hi = lo === f.a ? f.b : f.a
  const s1 = horiz ? rayHit(mid, room.points, 0, -1) : rayHit(mid, room.points, -1, 0)
  const s2 = horiz ? rayHit(mid, room.points, 0, 1) : rayHit(mid, room.points, 1, 0)
  const side = s1 !== null && (s2 === null || s1 <= s2) ? s1 : s2
  const sideDir = side === s1 ? -1 : 1
  const startEnd = horiz ? rayHit(lo, room.points, -1, 0) : rayHit(lo, room.points, 0, -1)
  const endEnd = horiz ? rayHit(hi, room.points, 1, 0) : rayHit(hi, room.points, 0, 1)
  return { horiz, side, sideDir, startEnd, endEnd, lo, hi }
}

/** Точки привязки для расстановки: концы и середины треков */
export function fixtureRefs(fixtures: PlanFixture[], excludeId?: string): PlanPoint[] {
  return fixtures
    .filter((f) => f.kind === "track" && f.id !== excludeId)
    .flatMap((f) => [f.a, f.b, { x: (f.a.x + f.b.x) / 2, y: (f.a.y + f.b.y) / 2 }])
}

/** Попадание по элементу на экране: трек — по отрезку, потолок — по контуру */
export function hitFixture(
  scheme: Pick<PlanScheme, "rooms">,
  fixtures: PlanFixture[],
  p: PlanPoint,
  tol: number,
): PlanFixture | null {
  for (const f of [...fixtures].reverse()) {
    if (f.kind === "track") {
      if (distToSegment(p, f.a, f.b) < tol) return f
      continue
    }
    const c = floatingContour(scheme, f)
    if (!c) continue
    for (let i = 0; i < c.length; i++) if (distToSegment(p, c[i], c[(i + 1) % c.length]) < tol) return f
  }
  return null
}

export const fixtureName = (f: PlanFixture) => f.label || FIXTURE_PRESETS[f.kind].label
