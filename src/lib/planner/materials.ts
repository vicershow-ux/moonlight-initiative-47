import { addCable, cableLength, emptyTotals, CableTotals } from "./cable"
import { NodeKind, PlanScheme, sectionOf } from "./types"
import { panelSettings } from "./panelInput"
import { panelSize, panelSpecification } from "./panelSize"
import { chaseTotals, roomElevations } from "./elevation"

/** Запас на закупку кабеля сверх расчёта: обрезки, подрезка, ошибки трассы */
export const CABLE_BUY_SHARE = 0.1

export interface MaterialRow {
  name: string
  spec: string
  unit: "м" | "шт" | "уп"
  qty: number
  note?: string
}

export interface MaterialSection {
  title: string
  rows: MaterialRow[]
}

/** Марка кабеля по сечению: до 6 мм² — ВВГнг-LS 3×, 10 мм² и ввод — тоже трёхжильный для однофазной сети */
const cableName = (spec: string, phases: 1 | 3, input = false) => {
  const s = sectionOf(spec)
  const cores = input && phases === 3 ? 5 : 3
  return `ВВГнг(А)-LS ${cores}×${String(s).replace(".", ",")}`
}

/** Округление метров кабеля вверх до 5 м — так продают в бухтах и на отрез */
const roundCable = (m: number) => Math.ceil(m / 5) * 5

const SOCKETS: Partial<Record<NodeKind, { name: string; spec: string }>> = {
  socket: { name: "Розетка", spec: "с заземлением, 16 А, скрытая" },
  socket_power: { name: "Розетка силовая", spec: "с заземлением, 16–25 А, скрытая" },
}
const SWITCHES: Partial<Record<NodeKind, { name: string; spec: string }>> = {
  switch: { name: "Выключатель одноклавишный", spec: "10 А, скрытый" },
  switch_double: { name: "Выключатель двухклавишный", spec: "10 А, скрытый" },
  switch_pass: { name: "Переключатель проходной одноклавишный", spec: "10 А, скрытый" },
  switch_pass_double: { name: "Переключатель проходной двухклавишный", spec: "10 А, скрытый" },
}
const BOXED = new Set<NodeKind>([
  "socket",
  "socket_power",
  "switch",
  "switch_double",
  "switch_pass",
  "switch_pass_double",
])

/** Подрозетник под материал стены: в гипсокартон — с лапками, в остальное — под штукатурку */
const boxFor = (scheme: PlanScheme, wallId?: string) => {
  const m = wallId ? scheme.walls?.[wallId]?.material : undefined
  return m === "gkl" ? "для гипсокартона Ø68 × 45" : "под штукатурку Ø68 × 45"
}

const add = (map: Map<string, MaterialRow>, row: MaterialRow) => {
  const key = `${row.name}|${row.spec}|${row.unit}`
  const cur = map.get(key)
  if (cur) cur.qty += row.qty
  else map.set(key, { ...row })
}

/**
 * Смета материалов электрики по проекту: кабель по сечениям с запасом,
 * подрозетники и распаячные коробки, электроустановочные изделия, щит с аппаратами
 * и расходники. Количества берём из плана — те же, что на схемах
 */
export function electricMaterials(scheme: PlanScheme): MaterialSection[] {
  const nodes = (scheme.nodes || []).filter((n) => n.layer === "electric")
  const links = (scheme.links || []).filter((l) => l.layer === "electric")
  const byId = new Map((scheme.nodes || []).map((n) => [n.id, n]))
  const panel = panelSettings(scheme.panel)
  const sections: MaterialSection[] = []

  // Кабель
  const bySpec: Record<string, CableTotals> = {}
  for (const l of links) {
    const c = cableLength(l, byId, scheme.rooms, scheme.defaultHeight, scheme.cable, scheme)
    if (c) bySpec[l.spec] = addCable(bySpec[l.spec] || emptyTotals(), c)
  }
  const cable: MaterialRow[] = Object.entries(bySpec)
    .sort(([a], [b]) => sectionOf(a) - sectionOf(b))
    .map(([spec, c]) => ({
      name: `Кабель ${cableName(spec, panel.phases)}`,
      spec,
      unit: "м" as const,
      qty: roundCable(c.total * (1 + CABLE_BUY_SHARE)),
      note: `по проекту ${c.total.toFixed(1).replace(".", ",")} м + ${Math.round(CABLE_BUY_SHARE * 100)}%`,
    }))
  if (panel.inputCable && nodes.some((n) => n.kind === "panel")) {
    cable.push({
      name: `Кабель ввода ${cableName(panel.inputCable, panel.phases, true)}`,
      spec: panel.inputCable,
      unit: "м",
      qty: 0,
      note: "длина от этажного щита — уточнить на объекте",
    })
  }
  if (cable.length) sections.push({ title: "Кабель", rows: cable })

  // Монтажные коробки
  const boxes = new Map<string, MaterialRow>()
  for (const n of nodes) {
    if (BOXED.has(n.kind)) {
      add(boxes, { name: "Подрозетник", spec: boxFor(scheme, n.mount?.wallId), unit: "шт", qty: 1 })
    } else if (n.kind === "junction") {
      add(boxes, { name: "Коробка распаячная", spec: "скрытая Ø100, с крышкой", unit: "шт", qty: 1 })
    }
  }
  if (boxes.size) sections.push({ title: "Монтажные коробки", rows: [...boxes.values()] })

  // Электроустановочные изделия
  const devices = new Map<string, MaterialRow>()
  for (const n of nodes) {
    const s = SOCKETS[n.kind] || SWITCHES[n.kind]
    if (s) add(devices, { name: s.name, spec: s.spec, unit: "шт", qty: 1 })
  }
  const lights = nodes.filter((n) => n.kind === "light" || n.kind === "spot").length
  if (lights) {
    add(devices, { name: "Клеммник для подключения светильника", spec: "3 провода, до 2,5 мм²", unit: "шт", qty: lights })
  }
  if (devices.size) sections.push({ title: "Розетки и выключатели", rows: [...devices.values()] })

  // Щит
  const size = panelSize(scheme)
  if (size) {
    const rows: MaterialRow[] = panelSpecification(size).map((r) => ({
      name: r.name,
      spec: r.spec,
      unit: "шт" as const,
      qty: r.qty,
      note: r.pos.join(", "),
    }))
    if (size.enclosure) {
      rows.unshift({
        name: "Щит распределительный встраиваемый",
        spec: `${size.enclosure.modules} модулей, ${size.enclosure.rows} ряд(а)`,
        unit: "шт",
        qty: 1,
      })
    }
    const groups = (scheme.groups || []).length
    rows.push(
      { name: "Шина нулевая N", spec: `на ${Math.max(groups + 2, 6)} отверстий`, unit: "шт", qty: 1 },
      { name: "Шина заземления PE", spec: `на ${Math.max(groups + 2, 6)} отверстий`, unit: "шт", qty: 1 },
      {
        name: "Шина соединительная (гребёнка)",
        spec: panel.phases === 3 ? "3P, 63 А" : "1P, 63 А",
        unit: "шт",
        qty: size.enclosure ? size.enclosure.rows : 1,
      },
    )
    sections.push({ title: "Электрощит", rows })
  }

  // Расходники: по типовым нормам на точку и на метр кабеля
  const totalCable = Object.values(bySpec).reduce((s, c) => s + c.total, 0)
  const points = nodes.filter((n) => BOXED.has(n.kind) || n.kind === "junction").length
  const consum: MaterialRow[] = []
  if (points) {
    // Клеммы Wago: в среднем 3 на распаячную коробку на каждую отходящую линию и по 1 на точку с шлейфом
    const junctions = nodes.filter((n) => n.kind === "junction").length
    const wago = junctions * 9 + Math.ceil(points * 0.5) * 3
    if (wago) consum.push({ name: "Клеммы соединительные", spec: "рычажные, 3–5 проводов", unit: "шт", qty: wago })
  }
  if (totalCable > 0) {
    consum.push({
      name: "Гипс монтажный / алебастр",
      spec: "для крепления подрозетников и заделки штроб",
      unit: "уп",
      qty: Math.max(1, Math.ceil((points * 0.15 + totalCable * 0.03) / 5)),
      note: "мешок 5 кг",
    })
    consum.push({
      name: "Гофротруба ПВХ",
      spec: "Ø20, для участков вне штробы",
      unit: "м",
      qty: roundCable(totalCable * 0.15),
      note: "≈15% длины кабеля",
    })
  }
  if (consum.length) sections.push({ title: "Расходные материалы", rows: consum })

  // Работы по штробам — по развёрткам стен, чтобы прораб сразу видел объём
  const chase = scheme.rooms.reduce(
    (acc, r) => acc + roomElevations(scheme, r).reduce((s, e) => s + chaseTotals(e).total, 0),
    0,
  )
  if (chase > 0) {
    sections.push({
      title: "Объём работ",
      rows: [
        {
          name: "Штробление стен под кабель",
          spec: "по развёрткам стен",
          unit: "м",
          qty: Math.ceil(chase * 10) / 10,
          note: "от коробок до трассы под потолком и между коробками",
        },
        { name: "Сверление под подрозетник", spec: "коронка Ø68", unit: "шт", qty: points - nodes.filter((n) => n.kind === "junction").length },
      ],
    })
  }

  return sections
}
