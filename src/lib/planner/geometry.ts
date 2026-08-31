import {
  PlanOpening,
  PlanPoint,
  PlanRoom,
  PlanScheme,
  PlanTotals,
  RoomMetrics,
} from "./types"

export const dist = (a: PlanPoint, b: PlanPoint) =>
  Math.hypot(b.x - a.x, b.y - a.y)

export function polygonArea(points: PlanPoint[]): number {
  if (points.length < 3) return 0
  let sum = 0
  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    const q = points[(i + 1) % points.length]
    sum += p.x * q.y - q.x * p.y
  }
  return Math.abs(sum) / 2
}

export function polygonPerimeter(points: PlanPoint[]): number {
  if (points.length < 2) return 0
  let sum = 0
  for (let i = 0; i < points.length; i++) {
    sum += dist(points[i], points[(i + 1) % points.length])
  }
  return sum
}

export function wallSegments(room: PlanRoom): { id: string; a: PlanPoint; b: PlanPoint; length: number }[] {
  const pts = room.points
  if (pts.length < 2) return []
  const closed = pts.length > 2
  const count = closed ? pts.length : pts.length - 1

  const segments = []
  for (let i = 0; i < count; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % pts.length]
    segments.push({ id: `${room.id}:${i}`, a, b, length: dist(a, b) })
  }
  return segments
}

export function openingArea(o: PlanOpening): number {
  return Math.max(o.width, 0) * Math.max(o.height, 0)
}

export function roomMetrics(room: PlanRoom, openings: PlanOpening[]): RoomMetrics {
  const segments = wallSegments(room)
  const wallIds = new Set(segments.map((s) => s.id))
  const roomOpenings = openings.filter((o) => wallIds.has(o.wallId))

  const area = polygonArea(room.points)
  const perimeter = room.points.length > 2 ? polygonPerimeter(room.points) : 0
  const height = room.height || 0
  const wallAreaGross = perimeter * height
  const openingsArea = roomOpenings.reduce((s, o) => s + openingArea(o), 0)

  return {
    id: room.id,
    name: room.name,
    room_type: room.room_type,
    height,
    area,
    perimeter,
    wallAreaGross,
    openingsArea,
    wallAreaNet: Math.max(wallAreaGross - openingsArea, 0),
    windows: roomOpenings.filter((o) => o.kind === "window").length,
    doors: roomOpenings.filter((o) => o.kind !== "window").length,
    wallCount: segments.length,
  }
}

export function schemeMetrics(scheme: PlanScheme): {
  rooms: RoomMetrics[]
  totals: PlanTotals
} {
  const rooms = scheme.rooms.map((r) => roomMetrics(r, scheme.openings))

  const totals = rooms.reduce<PlanTotals>(
    (acc, m) => ({
      floor: acc.floor + m.area,
      ceiling: acc.ceiling + m.area,
      wall: acc.wall + m.wallAreaGross,
      wallNet: acc.wallNet + m.wallAreaNet,
      perimeter: acc.perimeter + m.perimeter,
      openingsArea: acc.openingsArea + m.openingsArea,
      windows: acc.windows + m.windows,
      doors: acc.doors + m.doors,
      rooms: acc.rooms + 1,
    }),
    {
      floor: 0,
      ceiling: 0,
      wall: 0,
      wallNet: 0,
      perimeter: 0,
      openingsArea: 0,
      windows: 0,
      doors: 0,
      rooms: 0,
    },
  )

  return { rooms, totals }
}

export function schemeBounds(scheme: PlanScheme) {
  const pts = scheme.rooms.flatMap((r) => r.points)
  if (pts.length === 0) {
    return { minX: 0, minY: 0, maxX: 10, maxY: 10, width: 10, height: 10 }
  }
  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(maxX - minX, 0.1),
    height: Math.max(maxY - minY, 0.1),
  }
}

export function polygonCentroid(points: PlanPoint[]): PlanPoint {
  if (points.length === 0) return { x: 0, y: 0 }
  if (points.length < 3) {
    return {
      x: points.reduce((s, p) => s + p.x, 0) / points.length,
      y: points.reduce((s, p) => s + p.y, 0) / points.length,
    }
  }
  let cx = 0
  let cy = 0
  let a = 0
  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    const q = points[(i + 1) % points.length]
    const f = p.x * q.y - q.x * p.y
    cx += (p.x + q.x) * f
    cy += (p.y + q.y) * f
    a += f
  }
  if (Math.abs(a) < 1e-9) {
    return {
      x: points.reduce((s, p) => s + p.x, 0) / points.length,
      y: points.reduce((s, p) => s + p.y, 0) / points.length,
    }
  }
  const area = a / 2
  return { x: cx / (6 * area), y: cy / (6 * area) }
}

export function pointInPolygon(point: PlanPoint, points: PlanPoint[]): boolean {
  if (points.length < 3) return false
  let inside = false
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i].x
    const yi = points[i].y
    const xj = points[j].x
    const yj = points[j].y
    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi + 1e-12) + xi
    if (intersect) inside = !inside
  }
  return inside
}

export function openingPosition(
  scheme: PlanScheme,
  opening: PlanOpening,
): { a: PlanPoint; b: PlanPoint; mid: PlanPoint } | null {
  for (const room of scheme.rooms) {
    const segment = wallSegments(room).find((s) => s.id === opening.wallId)
    if (!segment) continue

    const len = segment.length
    if (len < 1e-6) return null

    const ux = (segment.b.x - segment.a.x) / len
    const uy = (segment.b.y - segment.a.y) / len

    const start = Math.min(Math.max(opening.offset, 0), Math.max(len - opening.width, 0))
    const end = Math.min(start + opening.width, len)

    const a = { x: segment.a.x + ux * start, y: segment.a.y + uy * start }
    const b = { x: segment.a.x + ux * end, y: segment.a.y + uy * end }
    return { a, b, mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }
  }
  return null
}

export function snap(value: number, step: number) {
  return Math.round(value / step) * step
}

export const fmtNum = (n: number, digits = 2) =>
  new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(n || 0)
