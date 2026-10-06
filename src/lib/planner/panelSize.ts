import { groupSummaries } from "./groups"
import { buildBlocks, panelSettings, rcdRating } from "./panelDiagram"
import { PlanGroup, PlanScheme, breakerAmps } from "./types"

/**
 * Ширина аппаратов в DIN-модулях (1 модуль = 17,5 мм).
 * Взяты типовые значения для распространённых серий; у конкретного
 * производителя дифавтомат или УЗО может быть на модуль шире или уже
 */
export const MODULES = {
  /** Автомат: 1 модуль на полюс */
  breaker1p: 1,
  breaker2p: 2,
  breaker3p: 3,
  /** УЗО однофазное — 2 модуля, трёхфазное — 4 */
  rcd2p: 2,
  rcd4p: 4,
  /** Дифавтомат 1P+N в однофазной сети — 2 модуля */
  rcbo: 2,
} as const

/** Типовой ряд квартирных щитов по числу модулей */
export const ENCLOSURES = [
  { modules: 4, rows: 1 },
  { modules: 8, rows: 1 },
  { modules: 12, rows: 1 },
  { modules: 18, rows: 1 },
  { modules: 24, rows: 2 },
  { modules: 36, rows: 3 },
  { modules: 48, rows: 4 },
  { modules: 54, rows: 3 },
  { modules: 72, rows: 4 },
]

/** Запас свободных мест под будущие группы — по умолчанию 20 % */
export const SPARE_SHARE = 0.2

export interface PanelItem {
  /** Позиционное обозначение: QF0, QD1, QFD4… */
  pos: string
  name: string
  spec: string
  qty: number
  modulesEach: number
  modules: number
}

export interface PanelSize {
  items: PanelItem[]
  /** Модули, которые занимают аппараты */
  used: number
  /** Сколько нужно с запасом под расширение */
  needed: number
  /** Подобранный корпус; null — если не хватает даже самого большого */
  enclosure: { modules: number; rows: number } | null
  free: number
  fillPercent: number
}

/**
 * Сколько DIN-модулей займут аппараты щита и какой корпус подойдёт.
 * Состав берём ровно тот же, что рисуется на однолинейной схеме, —
 * чтобы спецификация и схема всегда совпадали
 */
export function panelSize(scheme: PlanScheme, spare = SPARE_SHARE): PanelSize | null {
  const sums = groupSummaries(scheme).filter((s) => s.group)
  if (sums.length === 0) return null

  const panel = panelSettings(scheme.panel)
  const three = panel.phases === 3
  const inputAmps = breakerAmps(panel.inputBreaker)
  const items: PanelItem[] = []
  const add = (pos: string, name: string, spec: string, modulesEach: number) =>
    items.push({ pos, name, spec, qty: 1, modulesEach, modules: modulesEach })

  // Ввод: в однофазной сети вводной автомат обычно двухполюсный, в трёхфазной — трёхполюсный
  add(
    "QF0",
    "Автомат вводной",
    `${panel.inputBreaker}, ${three ? "3P" : "2P"}`,
    three ? MODULES.breaker3p : MODULES.breaker2p,
  )
  if (panel.mainRcd) {
    add(
      "QD0",
      "УЗО противопожарное",
      `${rcdRating(inputAmps)} А, ${panel.mainRcd} мА, ${three ? "4P" : "2P"}`,
      three ? MODULES.rcd4p : MODULES.rcd2p,
    )
  }

  let qd = 1
  for (const b of buildBlocks(sums, inputAmps)) {
    if (b.kind === "rcd") {
      add(`QD${qd++}`, "УЗО", `${b.rating} А, ${b.leakage} мА, тип A, 2P`, MODULES.rcd2p)
      for (const s of b.sums) {
        const g = s.group as PlanGroup
        add(`QF${g.num}`, "Автомат", `${g.breaker}, 1P`, MODULES.breaker1p)
      }
    } else {
      const g = b.sum.group as PlanGroup
      if (g.protection === "rcbo") {
        add(`QFD${g.num}`, "Дифавтомат", `${g.breaker}, ${g.leakage} мА, 1P+N`, MODULES.rcbo)
      } else {
        add(`QF${g.num}`, "Автомат", `${g.breaker}, 1P`, MODULES.breaker1p)
      }
    }
  }

  const used = items.reduce((s, i) => s + i.modules, 0)
  const needed = Math.ceil(used * (1 + spare))
  const enclosure = ENCLOSURES.find((e) => e.modules >= needed) ?? null
  const free = enclosure ? enclosure.modules - used : 0
  return {
    items,
    used,
    needed,
    enclosure,
    free,
    fillPercent: enclosure ? Math.round((used / enclosure.modules) * 100) : 100,
  }
}

/** Сводная спецификация: одинаковые аппараты складываются в одну строку */
export function panelSpecification(size: PanelSize) {
  const map = new Map<string, { name: string; spec: string; qty: number; modules: number; pos: string[] }>()
  for (const i of size.items) {
    const key = `${i.name}|${i.spec}`
    const row = map.get(key)
    if (row) {
      row.qty += 1
      row.modules += i.modules
      row.pos.push(i.pos)
    } else {
      map.set(key, { name: i.name, spec: i.spec, qty: 1, modules: i.modules, pos: [i.pos] })
    }
  }
  return [...map.values()]
}
