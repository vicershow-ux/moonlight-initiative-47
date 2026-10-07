import { groupSummaries } from "./groups"
import { buildBlocks, lineDeviceModules, lineDevicePositions } from "./panelDiagram"
import {
  inputDeviceModules,
  inputDevicePositions,
  inputDeviceSpec,
  inputLimitAmps,
  panelSettings,
} from "./panelInput"
import { INPUT_DEVICE_INFO, LINE_DEVICE_INFO, PlanGroup, PlanScheme } from "./types"

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
  const inputAmps = inputLimitAmps(panel.devices)
  const items: PanelItem[] = []
  const add = (pos: string, name: string, spec: string, modulesEach: number) =>
    items.push({ pos, name, spec, qty: 1, modulesEach, modules: modulesEach })

  // Ввод — ровно та цепочка, что задана в настройках щита.
  // Навесной счётчик места на рейке не занимает, но в спецификацию попадает
  const pos = inputDevicePositions(panel.devices)
  for (const d of panel.devices) {
    add(
      pos.get(d.id) || "",
      INPUT_DEVICE_INFO[d.kind].label,
      inputDeviceSpec(d, panel.phases),
      inputDeviceModules(d, panel.phases),
    )
  }

  // Аппараты линии стоят на рейке сразу за автоматом своей группы
  const addLine = (g: PlanGroup) => {
    const lpos = lineDevicePositions(g)
    for (const d of g.devices || []) {
      const info = LINE_DEVICE_INFO[d.kind]
      add(lpos.get(d.id) || "", info.label, info.ratings[0] ? `${d.rating} А` : "—", lineDeviceModules(d))
    }
  }

  let qd = 1
  for (const b of buildBlocks(sums, inputAmps)) {
    if (b.kind === "rcd") {
      add(`QD${qd++}`, "УЗО", `${b.rating} А, ${b.leakage} мА, тип A, 2P`, MODULES.rcd2p)
      for (const s of b.sums) {
        const g = s.group as PlanGroup
        add(`QF${g.num}`, "Автомат", `${g.breaker}, 1P`, MODULES.breaker1p)
        addLine(g)
      }
    } else {
      const g = b.sum.group as PlanGroup
      if (g.protection === "rcbo") {
        add(`QFD${g.num}`, "Дифавтомат", `${g.breaker}, ${g.leakage} мА, 1P+N`, MODULES.rcbo)
      } else {
        add(`QF${g.num}`, "Автомат", `${g.breaker}, 1P`, MODULES.breaker1p)
      }
      addLine(g)
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
