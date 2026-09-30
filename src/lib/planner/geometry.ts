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

export const round2 = (n: number) =>
  Number.isFinite(n) ? Math.round((n + Number.EPSILON) * 100) / 100 : 0

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

  const area = round2(polygonArea(room.points))
  const perimeter = round2(room.points.length > 2 ? polygonPerimeter(room.points) : 0)
  const height = room.height || 0
  const wallAreaGross = round2(perimeter * height)
  const openingsArea = round2(roomOpenings.reduce((s, o) => s + openingArea(o), 0))

  return {
    id: room.id,
    name: room.name,
    room_type: room.room_type,
    height,
    area,
    perimeter,
    wallAreaGross,
    openingsArea,
    wallAreaNet: round2(Math.max(wallAreaGross - openingsArea, 0)),
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

  totals.floor = round2(totals.floor)
  totals.ceiling = round2(totals.ceiling)
  totals.wall = round2(totals.wall)
  totals.wallNet = round2(totals.wallNet)
  totals.perimeter = round2(totals.perimeter)
  totals.openingsArea = round2(totals.openingsArea)

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

/** Кратчайшее расстояние от точки до отрезка — для попадания кликом по линии */
export function distToSegment(p: PlanPoint, a: PlanPoint, b: PlanPoint): number {
  const len = dist(a, b)
  if (len < 1e-9) return dist(p, a)
  const t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / (len * len)
  const clamped = Math.min(Math.max(t, 0), 1)
  return dist(p, { x: a.x + (b.x - a.x) * clamped, y: a.y + (b.y - a.y) * clamped })
}

export interface WallDimension {
  id: string
  a: PlanPoint
  b: PlanPoint
  /** Единичная нормаль, направленная наружу контура помещения */
  nx: number
  ny: number
  length: number
}

/**
 * Размерные линии по внешнему контуру помещения — по одной на каждую стену.
 * Нормаль ищем пробной точкой: если она попала внутрь контура, разворачиваем.
 * Так линии выносятся наружу и на прямоугольных, и на сложных планах.
 */
export function roomDimensions(room: PlanRoom): WallDimension[] {
  const pts = room.points
  if (pts.length < 3) return []

  const result: WallDimension[] = []
  for (const seg of wallSegments(room)) {
    const len = seg.length
    if (len < 1e-9) continue

    const ux = (seg.b.x - seg.a.x) / len
    const uy = (seg.b.y - seg.a.y) / len
    let nx = uy
    let ny = -ux

    const eps = Math.min(0.05, len * 0.1)
    const mid = { x: (seg.a.x + seg.b.x) / 2, y: (seg.a.y + seg.b.y) / 2 }
    if (pointInPolygon({ x: mid.x + nx * eps, y: mid.y + ny * eps }, pts)) {
      nx = -nx
      ny = -ny
    }

    result.push({ id: seg.id, a: seg.a, b: seg.b, nx, ny, length: len })
  }
  return result
}

/**
 * Размеры только по наружным стенам всей планировки.
 * Стену считаем внутренней, если сразу за ней начинается соседнее помещение —
 * такие размеры на чертеже оказались бы внутри контура и мешали бы читать план.
 */
export function outerDimensions(rooms: PlanRoom[]): { room: PlanRoom; dims: WallDimension[] }[] {
  // Две комнаты могут стоять вплотную, и тогда одна и та же линия получила бы
  // два одинаковых размера друг на друге. Оставляем только первый
  const seen = new Set<string>()
  const key = (d: WallDimension) => {
    const r = (n: number) => Math.round(n * 100) / 100
    const p1 = `${r(d.a.x)},${r(d.a.y)}`
    const p2 = `${r(d.b.x)},${r(d.b.y)}`
    return [p1, p2].sort().join("|")
  }

  return rooms.map((room) => {
    const others = rooms.filter((r) => r.id !== room.id && r.points.length > 2)
    const dims = roomDimensions(room).filter((dim) => {
      // Пробуем несколько точек вдоль стены: если хотя бы к одной примыкает
      // соседнее помещение, стена общая. Иначе на планах, где комнаты
      // совпадают частично, размеры наложились бы друг на друга
      const out = Math.min(0.12, dim.length * 0.2)
      for (const t of [0.15, 0.35, 0.5, 0.65, 0.85]) {
        const probe = {
          x: dim.a.x + (dim.b.x - dim.a.x) * t + dim.nx * out,
          y: dim.a.y + (dim.b.y - dim.a.y) * t + dim.ny * out,
        }
        if (others.some((r) => pointInPolygon(probe, r.points))) return false
      }
      const k = key(dim)
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    return { room, dims }
  })
}

export interface DimensionParts {
  length: number
  /** Выносные линии от углов стены к размерной линии */
  ext1: { x1: number; y1: number; x2: number; y2: number }
  ext2: { x1: number; y1: number; x2: number; y2: number }
  line: { x1: number; y1: number; x2: number; y2: number }
  /** Стрелки на концах — готовые points для polygon */
  arrows: [string, string]
  label: { x: number; y: number; cx: number; cy: number; angle: number }
}

export const DIM_STYLE = {
  offset: 26,
  gap: 4,
  overshoot: 6,
  arrow: 8,
  text: 5,
}

/**
 * Переводит размер стены в экранные координаты: выноски, линия, стрелки, подпись.
 * Чистая математика без привязки к React — одинаково работает на холсте и в PDF.
 */
export function dimensionParts(
  dim: WallDimension,
  toScreen: (p: PlanPoint) => { x: number; y: number },
  opts: Partial<typeof DIM_STYLE> = {},
): DimensionParts {
  const o = { ...DIM_STYLE, ...opts }
  const sa = toScreen(dim.a)
  const sb = toScreen(dim.b)
  const { nx, ny } = dim

  const ax = sa.x + nx * o.offset
  const ay = sa.y + ny * o.offset
  const bx = sb.x + nx * o.offset
  const by = sb.y + ny * o.offset

  const dx = bx - ax
  const dy = by - ay
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const px = -uy
  const py = ux

  const head = Math.min(o.arrow, len / 3)
  const half = head * 0.34
  const arrow = (tipX: number, tipY: number, dirX: number, dirY: number) => {
    const baseX = tipX + dirX * head
    const baseY = tipY + dirY * head
    return (
      `${tipX},${tipY} ${baseX + px * half},${baseY + py * half} ` +
      `${baseX - px * half},${baseY - py * half}`
    )
  }

  const mx = (ax + bx) / 2
  const my = (ay + by) / 2
  let angle = (Math.atan2(dy, dx) * 180) / Math.PI
  if (angle > 90 || angle < -90) angle += 180

  return {
    length: dim.length,
    ext1: {
      x1: sa.x + nx * o.gap,
      y1: sa.y + ny * o.gap,
      x2: sa.x + nx * (o.offset + o.overshoot),
      y2: sa.y + ny * (o.offset + o.overshoot),
    },
    ext2: {
      x1: sb.x + nx * o.gap,
      y1: sb.y + ny * o.gap,
      x2: sb.x + nx * (o.offset + o.overshoot),
      y2: sb.y + ny * (o.offset + o.overshoot),
    },
    line: { x1: ax, y1: ay, x2: bx, y2: by },
    arrows: [arrow(ax, ay, ux, uy), arrow(bx, by, -ux, -uy)],
    label: { x: mx, y: my - o.text, cx: mx, cy: my, angle },
  }
}

export function snap(value: number, step: number) {
  return Math.round(value / step) * step
}

export const fmtNum = (n: number, digits = 2) =>
  new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(n || 0)