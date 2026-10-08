import { linkGeometry } from "./geometry"
import { CableSettings, PlanLink, PlanNode, PlanPoint, PlanRoom, PlanScheme } from "./types"
import { findWall, openingSpan } from "./walls"

export const DEFAULT_CABLE: CableSettings = {
  traceFromCeiling: 0.15,
  endReserve: 0.15,
}

export interface CableLength {
  /** Длина по плану — по трассе с поворотами */
  plan: number
  /** Вертикальные спуски от трассы под потолком к точкам на обоих концах */
  drops: number
  /** Запас на разделку обоих концов */
  reserve: number
  /** Заход в откосы: от угла проёма на стене вглубь до точки */
  wall: number
  total: number
}

/**
 * Для точки в откосе кабель идёт по стене до угла проёма и оттуда
 * заходит в откос на глубину установки. Возвращаем угол проёма на внутренней
 * стороне стены и глубину захода; для остальных точек — их место и 0
 */
export function cableAnchor(n: PlanNode, scheme?: PlanScheme | null): { p: PlanPoint; depth: number } {
  const m = n.mount
  if (!scheme || !m || m.place !== "reveal" || !m.openingId) return { p: { x: n.x, y: n.y }, depth: 0 }
  const w = findWall(scheme, m.wallId)
  const o = scheme.openings.find((x) => x.id === m.openingId)
  if (!w || !o) return { p: { x: n.x, y: n.y }, depth: 0 }
  const sp = openingSpan(o, w)
  const edge = m.side === "end" ? sp.end : sp.start
  const depth = Math.min(Math.max(m.depth ?? w.thickness / 2, 0), w.thickness)
  return {
    p: { x: w.a.x + w.ux * edge - w.nx * w.inner, y: w.a.y + w.uy * edge - w.ny * w.inner },
    depth,
  }
}

export const cableSettings = (s?: Partial<CableSettings> | null): CableSettings => ({
  ...DEFAULT_CABLE,
  ...(s || {}),
})

/**
 * Длина кабеля одной трассы.
 * Кабель идёт под потолком на заданном отступе и спускается к каждой точке
 * на её высоту. Потолок берём из помещения, в котором стоит точка.
 * Светильник выше уровня трассы — тогда кабель поднимается, это тоже учитывается
 */
export function cableLength(
  link: PlanLink,
  nodeById: Map<string, PlanNode>,
  rooms: PlanRoom[],
  defaultHeight: number,
  settings?: Partial<CableSettings> | null,
  scheme?: PlanScheme | null,
): CableLength | null {
  const from = nodeById.get(link.fromId)
  const to = nodeById.get(link.toId)
  if (!from || !to) return null
  // Трасса по плану — до угла проёма, глубина откоса считается отдельно
  const fa = cableAnchor(from, scheme)
  const ta = cableAnchor(to, scheme)
  const anchors = new Map([
    [link.fromId, fa.p],
    [link.toId, ta.p],
  ])
  const g = linkGeometry(link, anchors)
  if (!g) return null
  const cfg = cableSettings(settings)

  const vertical = (id: string) => {
    const n = nodeById.get(id)
    if (!n) return 0
    const room = n.roomId ? rooms.find((r) => r.id === n.roomId) : null
    const ceiling = room?.height || defaultHeight
    const traceZ = Math.max(ceiling - cfg.traceFromCeiling, 0)
    return Math.abs(traceZ - (n.height || 0))
  }

  const drops = vertical(link.fromId) + vertical(link.toId)
  const reserve = cfg.endReserve * 2
  const wall = fa.depth + ta.depth
  return { plan: g.length, drops, reserve, wall, total: g.length + drops + reserve + wall }
}

export interface CableTotals {
  plan: number
  drops: number
  reserve: number
  wall: number
  total: number
}

export const emptyTotals = (): CableTotals => ({ plan: 0, drops: 0, reserve: 0, wall: 0, total: 0 })

export function addCable(acc: CableTotals, c: CableTotals): CableTotals {
  acc.plan += c.plan
  acc.drops += c.drops
  acc.reserve += c.reserve
  acc.wall += c.wall || 0
  acc.total += c.total
  return acc
}
