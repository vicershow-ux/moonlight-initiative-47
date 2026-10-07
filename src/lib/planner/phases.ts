import { GroupSummary, groupSummaries } from "./groups"
import { panelSettings } from "./panelInput"
import { NodeKind, PHASES, Phase, PlanGroup, PlanScheme, breakerAmps } from "./types"

/** Напряжение фазы, В */
export const PHASE_VOLTAGE = 230

/**
 * Типовая расчётная мощность точки, кВт — для оценки, если мощность группы не задана.
 * Розетки взяты с учётом того, что одновременно работает не всё
 */
const NODE_POWER: Partial<Record<NodeKind, number>> = {
  socket: 0.3,
  socket_power: 2.5,
  light: 0.1,
  spot: 0.01,
}

/** Коэффициент одновременности: чем больше точек в группе, тем меньше доля одновременной работы */
const demandFactor = (count: number) => (count <= 2 ? 1 : count <= 5 ? 0.8 : count <= 10 ? 0.6 : 0.5)

/**
 * Расчётная мощность группы, кВт. Если задана вручную — берём её.
 * Иначе оцениваем по точкам, но не больше, чем выдержит автомат группы
 */
export function groupPower(sum: GroupSummary): { kw: number; estimated: boolean } {
  const g = sum.group
  if (g?.power && g.power > 0) return { kw: g.power, estimated: false }
  let raw = 0
  let count = 0
  for (const [kind, n] of Object.entries(sum.nodeCounts)) {
    raw += (NODE_POWER[kind as NodeKind] || 0) * (n || 0)
    count += n || 0
  }
  let kw = raw * demandFactor(count)
  const cap = g ? (breakerAmps(g.breaker) * PHASE_VOLTAGE) / 1000 : 0
  if (cap > 0) kw = Math.min(kw, cap)
  return { kw: Math.round(kw * 100) / 100, estimated: true }
}

export const kwToAmps = (kw: number) => (kw * 1000) / PHASE_VOLTAGE

export interface PhaseLoad {
  phase: Phase
  kw: number
  amps: number
  groups: number[]
}

export interface PhaseBalance {
  /** Фаза каждой группы по id */
  byGroup: Map<string, Phase>
  /** Какие фазы назначены вручную */
  manual: Set<string>
  loads: PhaseLoad[]
  totalKw: number
  /** Перекос: (макс − мин) / макс, % */
  imbalance: number
  warnings: string[]
}

/**
 * Распределение групп по фазам. Группы с вручную заданной фазой остаются на ней,
 * остальные раскладываются от самой мощной к самой слабой на наименее нагруженную фазу —
 * так перекос получается минимальным без перебора всех вариантов
 */
export function phaseBalance(scheme: PlanScheme): PhaseBalance | null {
  const panel = panelSettings(scheme.panel)
  if (panel.phases !== 3) return null
  const sums = groupSummaries(scheme).filter((s) => s.group)
  if (sums.length === 0) return null

  const load: Record<Phase, number> = { L1: 0, L2: 0, L3: 0 }
  const members: Record<Phase, number[]> = { L1: [], L2: [], L3: [] }
  const byGroup = new Map<string, Phase>()
  const manual = new Set<string>()
  const power = new Map(sums.map((s) => [(s.group as PlanGroup).id, groupPower(s).kw]))

  const put = (g: PlanGroup, ph: Phase) => {
    byGroup.set(g.id, ph)
    load[ph] += power.get(g.id) || 0
    members[ph].push(g.num)
  }

  for (const s of sums) {
    const g = s.group as PlanGroup
    if (g.phase && PHASES.includes(g.phase)) {
      put(g, g.phase)
      manual.add(g.id)
    }
  }

  const auto = sums
    .map((s) => s.group as PlanGroup)
    .filter((g) => !manual.has(g.id))
    .sort((a, b) => (power.get(b.id) || 0) - (power.get(a.id) || 0) || a.num - b.num)
  for (const g of auto) {
    const ph = [...PHASES].sort((a, b) => load[a] - load[b] || members[a].length - members[b].length)[0]
    put(g, ph)
  }

  // Доводка: переносим или меняем местами автоматические группы, пока разброс уменьшается.
  // Жадная раскладка иногда оставляет перекос там, где можно разделить ровно
  const spread = () => Math.max(...PHASES.map((p) => load[p])) - Math.min(...PHASES.map((p) => load[p]))
  const reassign = (g: PlanGroup, to: Phase) => {
    const from = byGroup.get(g.id) as Phase
    const kw = power.get(g.id) || 0
    load[from] -= kw
    load[to] += kw
    members[from] = members[from].filter((n) => n !== g.num)
    members[to].push(g.num)
    byGroup.set(g.id, to)
  }
  for (let iter = 0; iter < 50; iter++) {
    const before = spread()
    let improved = false
    outer: for (const g of auto) {
      for (const to of PHASES) {
        const from = byGroup.get(g.id) as Phase
        if (to === from) continue
        reassign(g, to)
        if (spread() < before - 1e-9) {
          improved = true
          break outer
        }
        reassign(g, from)
      }
      for (const h of auto) {
        const pg = byGroup.get(g.id) as Phase
        const ph = byGroup.get(h.id) as Phase
        if (g === h || pg === ph) continue
        reassign(g, ph)
        reassign(h, pg)
        if (spread() < before - 1e-9) {
          improved = true
          break outer
        }
        reassign(g, pg)
        reassign(h, ph)
      }
    }
    if (!improved) break
  }

  const loads: PhaseLoad[] = PHASES.map((ph) => ({
    phase: ph,
    kw: Math.round(load[ph] * 100) / 100,
    amps: Math.round(kwToAmps(load[ph]) * 10) / 10,
    groups: members[ph].sort((a, b) => a - b),
  }))
  const totalKw = Math.round(loads.reduce((s, l) => s + l.kw, 0) * 100) / 100
  const max = Math.max(...loads.map((l) => l.kw))
  const min = Math.min(...loads.map((l) => l.kw))
  const imbalance = max > 0 ? Math.round(((max - min) / max) * 100) : 0

  const warnings: string[] = []
  if (imbalance > 30 && max > 1) {
    warnings.push(`Перекос фаз ${imbalance}% — лучше не больше 30%. Перенесите часть групп на менее нагруженную фазу.`)
  }
  const inputAmps = panel.devices.filter((d) => d.kind === "breaker" || d.kind === "rcbo").map((d) => d.rating)
  const limit = inputAmps.length ? Math.min(...inputAmps) : 0
  for (const l of loads) {
    if (limit && l.amps > limit) {
      warnings.push(`Фаза ${l.phase}: расчётный ток ${l.amps} А больше вводного автомата ${limit} А.`)
    }
  }
  return { byGroup, manual, loads, totalKw, imbalance, warnings }
}
