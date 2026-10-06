import { linkGeometry } from "./geometry"
import { CableSettings, PlanLink, PlanNode, PlanRoom } from "./types"

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
  total: number
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
): CableLength | null {
  const g = linkGeometry(link, nodeById)
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
  return { plan: g.length, drops, reserve, total: g.length + drops + reserve }
}

export interface CableTotals {
  plan: number
  drops: number
  reserve: number
  total: number
}

export const emptyTotals = (): CableTotals => ({ plan: 0, drops: 0, reserve: 0, total: 0 })

export function addCable(acc: CableTotals, c: CableLength): CableTotals {
  acc.plan += c.plan
  acc.drops += c.drops
  acc.reserve += c.reserve
  acc.total += c.total
  return acc
}
