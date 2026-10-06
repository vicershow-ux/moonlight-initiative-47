import { CableTotals, addCable, cableLength, emptyTotals } from "./cable"
import {
  MIN_SECTION,
  NODE_PRESETS,
  NodeKind,
  PlanGroup,
  PlanScheme,
  sectionOf,
} from "./types"

export interface GroupSummary {
  group: PlanGroup | null
  /** Длина кабеля по сечениям: по плану, спуски, запас и итог, м */
  bySpec: Record<string, CableTotals>
  /** Сумма по группе */
  cable: CableTotals
  /** Итоговая длина с запасом — для закупки */
  total: number
  linkCount: number
  /** Сколько каких точек подключено к трассам группы */
  nodeCounts: Partial<Record<NodeKind, number>>
  /** Самое тонкое сечение в группе — по нему проверяется автомат */
  minSection: number
  /** Предупреждение, если автомат слишком мощный для кабеля */
  warning: string | null
}

/**
 * Сводка по группам электрощита. Отдельной строкой идут трассы без группы,
 * чтобы электрик видел, что ещё не распределено
 */
export function groupSummaries(scheme: PlanScheme): GroupSummary[] {
  const links = (scheme.links || []).filter((l) => l.layer === "electric")
  const groups = [...(scheme.groups || [])].sort((a, b) => a.num - b.num)
  const nodeById = new Map((scheme.nodes || []).map((n) => [n.id, n]))

  const build = (group: PlanGroup | null): GroupSummary => {
    const own = links.filter((l) => (l.groupId ?? null) === (group ? group.id : null))
    const bySpec: Record<string, CableTotals> = {}
    const nodeIds = new Set<string>()
    const cable = emptyTotals()
    for (const l of own) {
      const c = cableLength(l, nodeById, scheme.rooms, scheme.defaultHeight, scheme.cable)
      if (!c) continue
      bySpec[l.spec] = addCable(bySpec[l.spec] || emptyTotals(), c)
      addCable(cable, c)
      nodeIds.add(l.fromId)
      nodeIds.add(l.toId)
    }

    // Щит и распаячные коробки — не потребители, в состав группы их не пишем
    const nodeCounts: Partial<Record<NodeKind, number>> = {}
    for (const id of nodeIds) {
      const n = nodeById.get(id)
      if (!n || n.kind === "panel" || n.kind === "junction") continue
      nodeCounts[n.kind] = (nodeCounts[n.kind] || 0) + 1
    }

    const sections = Object.keys(bySpec).map(sectionOf).filter((x) => x > 0)
    const minSection = sections.length ? Math.min(...sections) : 0
    const need = group ? MIN_SECTION[group.breaker] : undefined
    const warning =
      group && need && minSection > 0 && minSection < need
        ? `Под ${group.breaker} нужен кабель от ${String(need).replace(".", ",")} мм², в группе есть ${String(minSection).replace(".", ",")} мм²`
        : null

    return {
      group,
      bySpec,
      cable,
      total: cable.total,
      linkCount: own.length,
      nodeCounts,
      minSection,
      warning,
    }
  }

  const result = groups.map(build)
  const loose = build(null)
  if (loose.linkCount > 0) result.push(loose)
  return result
}

/** Короткий состав группы: «3 розетки, 1 выключатель» */
export function describeNodes(counts: Partial<Record<NodeKind, number>>): string {
  return Object.entries(counts)
    .map(([kind, n]) => `${NODE_PRESETS[kind as NodeKind].label.toLowerCase()} — ${n}`)
    .join(", ")
}
