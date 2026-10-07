import { dist, pointInPolygon, roomDimensions, wallSegments } from "./geometry"
import {
  DEFAULT_WALL,
  NodeKind,
  NodeMount,
  PlanNode,
  PlanOpening,
  PlanPoint,
  PlanRoom,
  PlanScheme,
  WALL_MATERIALS,
  WallProps,
} from "./types"

/** Что всегда ставится на стену: розетки, выключатели, щит */
export const FORCE_WALL = new Set<NodeKind>([
  "socket",
  "socket_power",
  "switch",
  "switch_double",
  "switch_pass",
  "switch_pass_double",
  "panel",
])

export const wallProps = (scheme: PlanScheme, wallId: string): WallProps => ({
  ...DEFAULT_WALL,
  ...(scheme.walls?.[wallId] || {}),
})

export interface WallInfo {
  id: string
  roomId: string
  index: number
  a: PlanPoint
  b: PlanPoint
  length: number
  /** Единичный вектор вдоль стены */
  ux: number
  uy: number
  /** Нормаль наружу помещения */
  nx: number
  ny: number
  thickness: number
  material: WallProps["material"]
  /**
   * Общая стена с соседним помещением: контур идёт по её оси,
   * толщина делится пополам на обе стороны
   */
  shared: boolean
  /** Сдвиг внутренней грани от контура внутрь помещения, м */
  inner: number
  /** Контур полосы стены для отрисовки: внутренняя грань a→b, наружная b→a */
  band: PlanPoint[]
}

const lineHit = (p: PlanPoint, u: PlanPoint, q: PlanPoint, v: PlanPoint): PlanPoint | null => {
  const den = u.x * v.y - u.y * v.x
  if (Math.abs(den) < 1e-9) return null
  const t = ((q.x - p.x) * v.y - (q.y - p.y) * v.x) / den
  return { x: p.x + u.x * t, y: p.y + u.y * t }
}

/**
 * Все стены помещения с толщиной. Контур помещения — внутренняя грань стены,
 * стена растёт наружу. Если за стеной соседнее помещение — стена общая,
 * контур считаем её осью. Углы сопрягаются «на ус» по соседним стенам
 */
export function roomWalls(room: PlanRoom, scheme: PlanScheme): WallInfo[] {
  const dims = roomDimensions(room)
  if (dims.length === 0) return []
  const others = scheme.rooms.filter((r) => r.id !== room.id && r.points.length > 2)

  const base = dims.map((d, index) => {
    const len = d.length
    const ux = (d.b.x - d.a.x) / len
    const uy = (d.b.y - d.a.y) / len
    const out = Math.min(0.12, len * 0.2)
    let shared = false
    for (const t of [0.25, 0.5, 0.75]) {
      const probe = {
        x: d.a.x + (d.b.x - d.a.x) * t + d.nx * out,
        y: d.a.y + (d.b.y - d.a.y) * t + d.ny * out,
      }
      if (others.some((r) => pointInPolygon(probe, r.points))) shared = true
    }
    const props = wallProps(scheme, d.id)
    const inner = shared ? props.thickness / 2 : 0
    const outer = shared ? props.thickness / 2 : props.thickness
    return { d, index, ux, uy, shared, props, inner, outer }
  })

  const n = base.length
  return base.map((w, i) => {
    const prev = base[(i - 1 + n) % n]
    const next = base[(i + 1) % n]
    // Точки на гранях: внутренняя — сдвиг внутрь (против нормали), наружная — наружу
    const face = (ww: typeof w, k: number) => ({ x: ww.d.a.x + ww.d.nx * k, y: ww.d.a.y + ww.d.ny * k })
    const corner = (ww: typeof w, other: typeof w, k: number, ko: number, fallback: PlanPoint) => {
      const hit = lineHit(face(ww, k), { x: ww.ux, y: ww.uy }, face(other, ko), { x: other.ux, y: other.uy })
      if (!hit || dist(hit, fallback) > Math.max(Math.abs(k), Math.abs(ko), 0.05) * 4) return fallback
      return hit
    }
    const ia = { x: w.d.a.x - w.d.nx * w.inner, y: w.d.a.y - w.d.ny * w.inner }
    const ib = { x: w.d.b.x - w.d.nx * w.inner, y: w.d.b.y - w.d.ny * w.inner }
    const oa = { x: w.d.a.x + w.d.nx * w.outer, y: w.d.a.y + w.d.ny * w.outer }
    const ob = { x: w.d.b.x + w.d.nx * w.outer, y: w.d.b.y + w.d.ny * w.outer }
    const band = [
      corner(w, prev, -w.inner, -prev.inner, ia),
      corner(w, next, -w.inner, -next.inner, ib),
      corner(w, next, w.outer, next.outer, ob),
      corner(w, prev, w.outer, prev.outer, oa),
    ]
    return {
      id: w.d.id,
      roomId: room.id,
      index: w.index,
      a: w.d.a,
      b: w.d.b,
      length: w.d.length,
      ux: w.ux,
      uy: w.uy,
      nx: w.d.nx,
      ny: w.d.ny,
      thickness: w.props.thickness,
      material: w.props.material,
      shared: w.shared,
      inner: w.inner,
      band,
    }
  })
}

/** Все стены плана. Общие стены рисуем один раз — у первого помещения */
export function schemeWalls(scheme: PlanScheme): { all: WallInfo[]; draw: WallInfo[] } {
  const all = scheme.rooms.flatMap((r) => roomWalls(r, scheme))
  const seen: WallInfo[] = []
  const draw: WallInfo[] = []
  for (const w of all) {
    if (w.shared) {
      const twin = seen.find(
        (s) =>
          s.shared &&
          Math.abs(s.ux * w.uy - s.uy * w.ux) < 1e-3 &&
          Math.abs((w.a.x - s.a.x) * s.uy - (w.a.y - s.a.y) * s.ux) < 0.02,
      )
      if (twin) {
        // Перекрытие по длине — значит это та же перегородка
        const proj = (p: PlanPoint) => (p.x - twin.a.x) * twin.ux + (p.y - twin.a.y) * twin.uy
        const lo = Math.min(proj(w.a), proj(w.b))
        const hi = Math.max(proj(w.a), proj(w.b))
        if (hi > 0.01 && lo < twin.length - 0.01) continue
      }
      seen.push(w)
    }
    draw.push(w)
  }
  return { all, draw }
}

export function findWall(scheme: PlanScheme, wallId: string): WallInfo | null {
  const roomId = wallId.split(":")[0]
  const room = scheme.rooms.find((r) => r.id === roomId)
  if (!room) return null
  return roomWalls(room, scheme).find((w) => w.id === wallId) || null
}

/** Проём на стене: начало и конец по длине стены, м */
export function openingSpan(o: PlanOpening, w: { length: number }): { start: number; end: number } {
  const start = Math.min(Math.max(o.offset, 0), Math.max(w.length - o.width, 0))
  return { start, end: Math.min(start + o.width, w.length) }
}

/** Точка на внутренней грани стены на расстоянии s от её начала */
const facePoint = (w: WallInfo, s: number): PlanPoint => ({
  x: w.a.x + w.ux * s - w.nx * w.inner,
  y: w.a.y + w.uy * s - w.ny * w.inner,
})

/**
 * Положение точки по привязке и направление, куда смотрит значок.
 * На стене — внутрь помещения; в откосе — в сторону проёма
 */
export function mountPosition(
  scheme: PlanScheme,
  m: NodeMount,
): { p: PlanPoint; dir: PlanPoint; wall: WallInfo; opening?: PlanOpening } | null {
  const w = findWall(scheme, m.wallId)
  if (!w) return null
  if (m.place === "reveal" && m.openingId) {
    const o = scheme.openings.find((x) => x.id === m.openingId && x.wallId === w.id)
    if (o) {
      const span = openingSpan(o, w)
      const edge = m.side === "end" ? span.end : span.start
      const depth = Math.min(Math.max(m.depth ?? w.thickness / 2, 0), w.thickness)
      const f = facePoint(w, edge)
      const sign = m.side === "end" ? -1 : 1
      return {
        p: { x: f.x + w.nx * depth, y: f.y + w.ny * depth },
        dir: { x: w.ux * sign, y: w.uy * sign },
        wall: w,
        opening: o,
      }
    }
  }
  const s = Math.min(Math.max(m.offset, 0), w.length)
  return { p: facePoint(w, s), dir: { x: -w.nx, y: -w.ny }, wall: w }
}

/**
 * Привязка к ближайшей стене помещения, в котором щёлкнули.
 * Если щелчок пришёлся на проём — точка уходит в его откос
 * (к ближайшему краю), глубина берётся по месту щелчка
 */
export function snapToWall(scheme: PlanScheme, p: PlanPoint, maxDist = Infinity): NodeMount | null {
  const inside = scheme.rooms.filter((r) => r.points.length > 2 && pointInPolygon(p, r.points))
  const walls = schemeWalls(scheme).all
  let pool = inside.length ? walls.filter((w) => inside.some((r) => r.id === w.roomId)) : walls
  if (pool.length === 0) pool = walls

  let best: { w: WallInfo; d: number; s: number; across: number } | null = null
  for (const w of pool) {
    const rx = p.x - w.a.x
    const ry = p.y - w.a.y
    const s = rx * w.ux + ry * w.uy
    // Расстояние от внутренней грани наружу: <0 — в комнате, 0..t — внутри стены
    const across = rx * w.nx + ry * w.ny + w.inner
    const sc = Math.min(Math.max(s, 0), w.length)
    const along = Math.abs(s - sc)
    const off = across < 0 ? -across : across > w.thickness ? across - w.thickness : 0
    const d = Math.hypot(along, off)
    if (!best || d < best.d) best = { w, d, s: sc, across }
  }
  if (!best || best.d > maxDist) return null

  const { w, s, across } = best
  const opening = scheme.openings
    .filter((o) => o.wallId === w.id)
    .find((o) => {
      const sp = openingSpan(o, w)
      return s > sp.start - 0.02 && s < sp.end + 0.02
    })
  if (opening) {
    const sp = openingSpan(opening, w)
    const side = s - sp.start <= sp.end - s ? "start" : "end"
    const depth = Math.min(Math.max(across, w.thickness * 0.15), w.thickness * 0.85)
    return {
      wallId: w.id,
      offset: side === "start" ? sp.start : sp.end,
      place: "reveal",
      openingId: opening.id,
      side,
      depth: Math.round(depth * 1000) / 1000,
    }
  }
  return { wallId: w.id, offset: Math.round(s * 1000) / 1000, place: "wall" }
}

/**
 * Пересчитывает координаты привязанных точек после правки стен и проёмов.
 * Если проём удалили — точка остаётся на стене там же; если стену — привязка снимается
 */
export function applyMounts(scheme: PlanScheme): PlanScheme {
  if (!(scheme.nodes || []).some((n) => n.mount)) return scheme
  const nodes = (scheme.nodes || []).map((n): PlanNode => {
    if (!n.mount) return n
    let m = n.mount
    if (m.place === "reveal" && !scheme.openings.some((o) => o.id === m.openingId)) {
      m = { wallId: m.wallId, offset: m.offset, place: "wall" }
    }
    const pos = mountPosition(scheme, m)
    if (!pos) return { ...n, mount: null }
    return { ...n, mount: m, x: pos.p.x, y: pos.p.y, roomId: pos.wall.roomId }
  })
  return { ...scheme, nodes }
}

/** Куда смотрит значок точки: по привязке, иначе null — решит wallDirection */
export function nodeDirection(scheme: PlanScheme, n: PlanNode): PlanPoint | null {
  if (!n.mount) return null
  return mountPosition(scheme, n.mount)?.dir ?? null
}

/** Подпись привязки для карточки и PDF */
export function mountLabel(scheme: PlanScheme, n: PlanNode): string {
  if (!n.mount) return "—"
  const pos = mountPosition(scheme, n.mount)
  if (!pos) return "—"
  const wallNo = pos.wall.index + 1
  if (pos.opening) {
    const kind = pos.opening.kind === "window" ? "окна" : pos.opening.kind === "door" ? "двери" : "проёма"
    return `откос ${kind}, стена ${wallNo}`
  }
  return `стена ${wallNo}`
}

export const materialLabel = (m: WallProps["material"]) => WALL_MATERIALS[m].label

/** Расширение рамки плана на толщину стен — чтобы стены не обрезались */
export const maxWallThickness = (scheme: PlanScheme) =>
  Math.max(DEFAULT_WALL.thickness, ...Object.values(scheme.walls || {}).map((w) => w.thickness || 0))

/**
 * Куски полосы стены без проёмов — для отрисовки: проём вырезается,
 * и по его краям видны откосы на всю толщину стены
 */
export function wallPieces(w: WallInfo, openings: PlanOpening[]): PlanPoint[][] {
  const own = openings
    .filter((o) => o.wallId === w.id)
    .map((o) => openingSpan(o, w))
    .sort((a, b) => a.start - b.start)
  const [ia, ib, ob, oa] = w.band
  // Сдвиг углов полосы вдоль стены относительно контура
  const proj = (p: PlanPoint) => (p.x - w.a.x) * w.ux + (p.y - w.a.y) * w.uy
  const sIa = proj(ia)
  const sIb = proj(ib)
  const sOa = proj(oa)
  const sOb = proj(ob)
  const at = (s: number, k: number) => ({
    x: w.a.x + w.ux * s + w.nx * k,
    y: w.a.y + w.uy * s + w.ny * k,
  })
  const kIn = -w.inner
  const kOut = w.thickness - w.inner

  const pieces: PlanPoint[][] = []
  let cursor: { inS: number; outS: number; first: boolean } = { inS: sIa, outS: sOa, first: true }
  for (const sp of own) {
    const inStart = cursor.first ? ia : at(cursor.inS, kIn)
    const outStart = cursor.first ? oa : at(cursor.outS, kOut)
    if (sp.start > Math.max(cursor.inS, cursor.outS) - 1e-6) {
      pieces.push([inStart, at(sp.start, kIn), at(sp.start, kOut), outStart])
    }
    cursor = { inS: sp.end, outS: sp.end, first: false }
  }
  const inStart = cursor.first ? ia : at(cursor.inS, kIn)
  const outStart = cursor.first ? oa : at(cursor.outS, kOut)
  if (Math.min(sIb, sOb) > Math.max(cursor.inS, cursor.outS) - 1e-6 || cursor.first) {
    pieces.push([inStart, ib, ob, outStart])
  }
  return pieces
}

/** Проём в толще стены: прямоугольник от внутренней до наружной грани */
export function openingBand(w: WallInfo, o: PlanOpening): PlanPoint[] {
  const sp = openingSpan(o, w)
  const at = (s: number, k: number) => ({
    x: w.a.x + w.ux * s + w.nx * k,
    y: w.a.y + w.uy * s + w.ny * k,
  })
  const kIn = -w.inner
  const kOut = w.thickness - w.inner
  return [at(sp.start, kIn), at(sp.end, kIn), at(sp.end, kOut), at(sp.start, kOut)]
}

export { wallSegments }
