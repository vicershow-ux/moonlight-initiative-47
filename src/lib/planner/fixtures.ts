import { FIXTURE_PRESETS, PlanFixture, PlanPoint, PlanRoom, PlanScheme } from "./types"
import { dist, distToSegment, pointInPolygon, polygonArea } from "./geometry"
import { rayHit } from "./placeAssist"

/** Отступ светящегося контура парящего потолка от стен по умолчанию, м */
export const FLOATING_OFFSET = 0.1

/** Вся линия трека: начало, повороты, конец */
export const trackPath = (f: PlanFixture): PlanPoint[] => [f.a, ...(f.points || []), f.b]

/** Число поворотов трека — под каждый нужен угловой коннектор */
export const trackTurns = (f: PlanFixture) => {
  const p = trackPath(f)
  let n = 0
  for (let i = 1; i + 1 < p.length; i++) {
    const ax = p[i].x - p[i - 1].x
    const ay = p[i].y - p[i - 1].y
    const bx = p[i + 1].x - p[i].x
    const by = p[i + 1].y - p[i].y
    if (Math.abs(ax * by - ay * bx) > 1e-9) n++
  }
  return n
}

/** Прямые участки трека */
export const trackSegments = (f: PlanFixture) => {
  const p = trackPath(f)
  return p.slice(1).map((b, i) => ({ a: p[i], b, length: dist(p[i], b) }))
}

/** Длина трека по всей ломаной; у парящего потолка — расстояние a–b */
export const fixtureLength = (f: PlanFixture) =>
  f.kind === "track" ? trackSegments(f).reduce((s, x) => s + x.length, 0) : dist(f.a, f.b)

/** Середина самого длинного участка — для подписей и привязки к помещению */
export const trackMid = (f: PlanFixture): PlanPoint => {
  const segs = trackSegments(f)
  const best = segs.reduce((m, x) => (x.length > m.length ? x : m), segs[0])
  return { x: (best.a.x + best.b.x) / 2, y: (best.a.y + best.b.y) / 2 }
}

/** Сдвиг трека целиком вместе с поворотами */
export const shiftTrack = (f: Pick<PlanFixture, "a" | "b" | "points">, dx: number, dy: number) => ({
  a: { x: f.a.x + dx, y: f.a.y + dy },
  b: { x: f.b.x + dx, y: f.b.y + dy },
  points: (f.points || []).map((p) => ({ x: p.x + dx, y: p.y + dy })),
})

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
  [...scheme.rooms].reverse().find((r) => pointInPolygon(f.kind === "track" ? trackMid(f) : { x: (f.a.x + f.b.x) / 2, y: (f.a.y + f.b.y) / 2 }, r.points)) ||
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
  const path = trackPath(f)
  const xs = path.map((p) => p.x)
  const ys = path.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const turns = path.length > 2
  const horiz = maxX - minX >= maxY - minY
  if (!room) return { horiz, turns, side: null, sideDir: 0, startEnd: null as number | null, endEnd: null as number | null }
  // Прямой трек — от середины; с поворотами — по габариту: отступы крайних участков
  const mid = turns ? { x: (minX + maxX) / 2, y: (minY + maxY) / 2 } : { x: (f.a.x + f.b.x) / 2, y: (f.a.y + f.b.y) / 2 }
  const lo = turns ? { x: minX, y: horiz ? mid.y : minY } : horiz ? (f.a.x <= f.b.x ? f.a : f.b) : f.a.y <= f.b.y ? f.a : f.b
  const hi = turns ? { x: horiz ? maxX : mid.x, y: horiz ? mid.y : maxY } : lo === f.a ? f.b : f.a
  const edgeA = turns ? (horiz ? { x: mid.x, y: minY } : { x: minX, y: mid.y }) : mid
  const edgeB = turns ? (horiz ? { x: mid.x, y: maxY } : { x: maxX, y: mid.y }) : mid
  const s1 = horiz ? rayHit(edgeA, room.points, 0, -1) : rayHit(edgeA, room.points, -1, 0)
  const s2 = horiz ? rayHit(edgeB, room.points, 0, 1) : rayHit(edgeB, room.points, 1, 0)
  const side = s1 !== null && (s2 === null || s1 <= s2) ? s1 : s2
  const sideDir = side === s1 ? -1 : 1
  const sideFrom = side === s1 ? edgeA : edgeB
  const startEnd = horiz ? rayHit(lo, room.points, -1, 0) : rayHit(lo, room.points, 0, -1)
  const endEnd = horiz ? rayHit(hi, room.points, 1, 0) : rayHit(hi, room.points, 0, 1)
  return { horiz, turns, side, sideDir, sideFrom, startEnd, endEnd, lo, hi }
}

/** Точки привязки для расстановки: концы и середины треков */
export function fixtureRefs(fixtures: PlanFixture[], excludeId?: string): PlanPoint[] {
  return fixtures
    .filter((f) => f.kind === "track" && f.id !== excludeId)
    .flatMap((f) => [...trackPath(f), ...trackSegments(f).map((x) => ({ x: (x.a.x + x.b.x) / 2, y: (x.a.y + x.b.y) / 2 }))])
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
      if (trackSegments(f).some((x) => distToSegment(p, x.a, x.b) < tol)) return f
      continue
    }
    const c = floatingContour(scheme, f)
    if (!c) continue
    for (let i = 0; i < c.length; i++) if (distToSegment(p, c[i], c[(i + 1) % c.length]) < tol) return f
  }
  return null
}

export const fixtureName = (f: PlanFixture) => f.label || FIXTURE_PRESETS[f.kind].label
