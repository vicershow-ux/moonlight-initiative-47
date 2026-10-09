import { addCable, cableLength, emptyTotals, CableTotals } from "./cable"
import { LAYING_METHODS, LayingMethod, NodeKind, PlanLink, PlanPoint, PlanScheme, sectionOf } from "./types"
import { linkGeometry } from "./geometry"
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

/** Шаги крепежа по типовой практике монтажа, м */
const STEP = {
  chaseClamp: 0.5,
  chaseTie: 0.3,
  trayBracket: 1.2,
  traySection: 3,
  ductDowel: 0.5,
  ductPiece: 2,
  clip: 0.5,
  corrTie: 0.5,
}

interface LayingTotal {
  /** Метры кабеля этим способом (со спусками и запасом) */
  cable: number
  /** Длина трасс по плану — для лотка и кабель-канала, м */
  route: number
  /** Длина, где два кабеля и больше идут вместе, м */
  shared: number
  lines: number
}

/** Перекрытие двух ортогональных трасс — где кабели идут рядом по одной линии */
function overlap(a: PlanPoint[], b: PlanPoint[]): number {
  let sum = 0
  for (let i = 1; i < a.length; i++) {
    for (let j = 1; j < b.length; j++) {
      const [a0, a1, b0, b1] = [a[i - 1], a[i], b[j - 1], b[j]]
      const ah = Math.abs(a0.y - a1.y) < 1e-6
      const bh = Math.abs(b0.y - b1.y) < 1e-6
      const av = Math.abs(a0.x - a1.x) < 1e-6
      const bv = Math.abs(b0.x - b1.x) < 1e-6
      if (ah && bh && Math.abs(a0.y - b0.y) < 0.03) {
        const lo = Math.max(Math.min(a0.x, a1.x), Math.min(b0.x, b1.x))
        const hi = Math.min(Math.max(a0.x, a1.x), Math.max(b0.x, b1.x))
        if (hi > lo) sum += hi - lo
      } else if (av && bv && Math.abs(a0.x - b0.x) < 0.03) {
        const lo = Math.max(Math.min(a0.y, a1.y), Math.min(b0.y, b1.y))
        const hi = Math.min(Math.max(a0.y, a1.y), Math.max(b0.y, b1.y))
        if (hi > lo) sum += hi - lo
      }
    }
  }
  return sum
}

/** Сколько кабеля и трасс каждым способом прокладки */
export function layingTotals(
  scheme: PlanScheme,
  links: PlanLink[],
  byId: Map<string, import("./types").PlanNode>,
): Record<LayingMethod, LayingTotal> {
  const def = scheme.cable?.laying || "chase"
  const out = Object.fromEntries(
    (Object.keys(LAYING_METHODS) as LayingMethod[]).map((m) => [m, { cable: 0, route: 0, shared: 0, lines: 0 }]),
  ) as Record<LayingMethod, LayingTotal>
  const routes: { m: LayingMethod; r: PlanPoint[] }[] = []
  for (const l of links) {
    const m = l.laying || def
    const c = cableLength(l, byId, scheme.rooms, scheme.defaultHeight, scheme.cable, scheme)
    const g = linkGeometry(l, byId)
    if (!c || !g) continue
    out[m].cable += c.total
    // Кабель-канал и гофра идут и по спускам, лоток — только под потолком
    out[m].route += m === "tray" ? g.length : g.length + c.drops + c.wall
    out[m].lines += 1
    routes.push({ m, r: g.route })
  }
  for (let i = 0; i < routes.length; i++) {
    for (let j = i + 1; j < routes.length; j++) {
      if (routes[i].m === routes[j].m) out[routes[i].m].shared += overlap(routes[i].r, routes[j].r)
    }
  }
  // Общий лоток или канал на несколько кабелей — длину не задваиваем
  for (const m of ["tray", "duct"] as const) out[m].route = Math.max(out[m].route - out[m].shared, 0)
  return out
}

/** Крепёж и изделия под каждый способ прокладки */
function layingFasteners(lay: Record<LayingMethod, LayingTotal>, corrFix: "dowel" | "screw"): MaterialRow[] {
  const rows: MaterialRow[] = []
  const up = (v: number) => Math.ceil(v - 1e-9)
  const m1 = (v: number) => v.toFixed(1).replace(".", ",")

  const ch = lay.chase
  if (ch.cable > 0) {
    rows.push({
      name: "Дюбель-хомут",
      spec: "для круглого кабеля 5–10 мм",
      unit: "шт",
      qty: up(ch.cable / STEP.chaseClamp),
      note: `штроба: ${m1(ch.cable)} м кабеля, шаг ${toMmText(STEP.chaseClamp)}`,
    })
    if (ch.shared > 0) {
      rows.push({
        name: "Стяжка кабельная",
        spec: "нейлон 3,6×200",
        unit: "шт",
        qty: up(ch.shared / STEP.chaseTie),
        note: `2 кабеля в одной штробе на ${m1(ch.shared)} м, шаг ${toMmText(STEP.chaseTie)}`,
      })
    }
  }

  const tr = lay.tray
  if (tr.route > 0) {
    const sections = up(tr.route / STEP.traySection)
    const joints = Math.max(sections - 1, 0)
    const brackets = up(tr.route / STEP.trayBracket) + 1
    rows.push(
      { name: "Лоток кабельный перфорированный", spec: "секция 3 м", unit: "шт", qty: sections, note: `трасса в лотке ${m1(tr.route)} м` },
      { name: "Пластина соединительная для лотка", spec: "", unit: "шт", qty: joints },
      { name: "Кронштейн / подвес для лотка", spec: `шаг ${toMmText(STEP.trayBracket)}`, unit: "шт", qty: brackets },
      { name: "Анкер для кронштейна", spec: "6×40", unit: "шт", qty: brackets },
      { name: "Болт", spec: "М6×12", unit: "шт", qty: joints * 4 + brackets * 2, note: "4 на стык секций, 2 на кронштейн" },
      { name: "Гайка", spec: "М6", unit: "шт", qty: joints * 4 + brackets * 2 },
      { name: "Пресс-шайба", spec: "М6", unit: "шт", qty: joints * 4 + brackets * 2 },
    )
  }

  const du = lay.duct
  if (du.route > 0) {
    const pieces = up(du.route / STEP.ductPiece)
    rows.push(
      { name: "Кабель-канал", spec: "секция 2 м", unit: "шт", qty: pieces, note: `трасса в канале ${m1(du.route)} м` },
      {
        name: "Дюбель-гвоздь",
        spec: "6×40",
        unit: "шт",
        qty: up(du.route / STEP.ductDowel) + pieces,
        note: `шаг ${toMmText(STEP.ductDowel)} + по краям секций`,
      },
      { name: "Бур", spec: "Ø6 мм", unit: "шт", qty: 1 },
    )
  }

  const co = lay.corrugated
  if (co.cable > 0) {
    const clips = up(co.cable / STEP.clip) + co.lines
    rows.push(
      { name: "Гофротруба ПВХ", spec: "Ø20", unit: "м", qty: roundCable(co.cable), note: `кабель в гофре ${m1(co.cable)} м` },
      { name: "Клипса для гофры", spec: "Ø20", unit: "шт", qty: clips, note: `шаг ${toMmText(STEP.clip)}` },
      corrFix === "screw"
        ? { name: "Саморез", spec: "3,5×35", unit: "шт", qty: clips, note: "по одному на клипсу" }
        : { name: "Дюбель-гвоздь", spec: "6×40", unit: "шт", qty: clips, note: "по одному на клипсу" },
    )
    if (corrFix === "dowel") rows.push({ name: "Бур", spec: "Ø6 мм", unit: "шт", qty: 1 })
    const ties = up(co.shared / STEP.corrTie) + co.lines * 2
    rows.push({ name: "Стяжка кабельная", spec: "нейлон 3,6×200", unit: "шт", qty: ties, note: "на пучки гофры и у коробок" })
  }

  // Одинаковые позиции (бур, стяжки, дюбель-гвозди) от разных способов — одной строкой
  const merged = new Map<string, MaterialRow>()
  for (const r of rows) {
    if (r.qty <= 0) continue
    const k = `${r.name}|${r.spec}`
    const cur = merged.get(k)
    if (!cur) merged.set(k, { ...r })
    else if (r.name === "Бур") cur.qty = 1
    else {
      cur.qty += r.qty
      cur.note = [cur.note, r.note].filter(Boolean).join("; ")
    }
  }
  return [...merged.values()]
}

const toMmText = (m: number) => `${Math.round(m * 1000)} мм`

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
  const lay = layingTotals(scheme, links, byId)
  if (totalCable > 0 && (points > 0 || lay.chase.cable > 0)) {
    consum.push({
      name: "Гипс монтажный / алебастр",
      spec: lay.chase.cable > 0 ? "для крепления подрозетников и заделки штроб" : "для крепления подрозетников",
      unit: "уп",
      qty: Math.max(1, Math.ceil((points * 0.15 + lay.chase.cable * 0.03) / 5)),
      note: "мешок 5 кг",
    })
  }
  if (consum.length) sections.push({ title: "Расходные материалы", rows: consum })

  const fix = layingFasteners(lay, scheme.cable?.corrugatedFix || "dowel")
  if (fix.length) sections.push({ title: "Прокладка и крепёж кабеля", rows: fix })

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
