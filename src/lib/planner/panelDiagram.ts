import { GroupSummary, describeNodes, groupSummaries } from "./groups"
import {
  InputDevice,
  LINE_DEVICE_INFO,
  LineDevice,
  PlanGroup,
  PlanScheme,
  breakerAmps,
  sectionOf,
  sectionStyle,
  PHASE_COLORS,
} from "./types"
import { phaseBalance } from "./phases"
import {
  inputDevicePositions,
  inputDeviceSpec,
  inputLimitAmps,
  inputWarnings,
  panelSettings,
  rcdRating,
} from "./panelInput"

export { panelSettings, rcdRating }

const esc = (s: string) =>
  String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

const INK = "#161616"
const MUTED = "#666666"
const FONT = 'font-family="Arial"'


/**
 * Блоки щита слева направо. Группы с «Автомат + УЗО» и одинаковой утечкой
 * садятся под одно общее УЗО — так обычно и собирают квартирный щит.
 * Номинал общего УЗО — не меньше суммы автоматов под ним, но не больше вводного
 */
export type Block =
  | { kind: "single"; sum: GroupSummary }
  | { kind: "rcd"; leakage: number; rating: number; sums: GroupSummary[] }

export function buildBlocks(sums: GroupSummary[], inputAmps: number): Block[] {
  const blocks: Block[] = []
  const rcdByLeak = new Map<number, Extract<Block, { kind: "rcd" }>>()
  for (const sum of sums) {
    const g = sum.group as PlanGroup
    if (g.protection === "rcd") {
      let b = rcdByLeak.get(g.leakage)
      if (!b) {
        b = { kind: "rcd", leakage: g.leakage, rating: 0, sums: [] }
        rcdByLeak.set(g.leakage, b)
        blocks.push(b)
      }
      b.sums.push(sum)
    } else {
      blocks.push({ kind: "single", sum })
    }
  }
  for (const b of rcdByLeak.values()) {
    const load = b.sums.reduce((m, s) => m + breakerAmps((s.group as PlanGroup).breaker), 0)
    b.rating = rcdRating(Math.min(load, inputAmps || load))
  }
  return blocks
}

/** Сечение отходящей линии: самое толстое в группе, по нему кабель идёт от щита */
export const lineSection = (sum: GroupSummary) => {
  const specs = Object.keys(sum.bySpec)
  if (specs.length === 0) return "—"
  return specs.sort((a, b) => sectionOf(b) - sectionOf(a))[0]
}

// ——— Графические элементы ———

/** Автоматический выключатель: контакт с крестиком на неподвижном конце */
function breakerSym(x: number, y: number, h: number): string {
  const top = y + h * 0.3
  const bot = y + h * 0.7
  return [
    `<line x1="${x}" y1="${y}" x2="${x}" y2="${top}" stroke="${INK}" stroke-width="1.2"/>`,
    `<line x1="${x}" y1="${bot}" x2="${x - h * 0.22}" y2="${top + 2}" stroke="${INK}" stroke-width="1.2"/>`,
    `<line x1="${x - 3}" y1="${top - 3}" x2="${x + 3}" y2="${top + 3}" stroke="${INK}" stroke-width="1.2"/>`,
    `<line x1="${x + 3}" y1="${top - 3}" x2="${x - 3}" y2="${top + 3}" stroke="${INK}" stroke-width="1.2"/>`,
    `<line x1="${x}" y1="${bot}" x2="${x}" y2="${y + h}" stroke="${INK}" stroke-width="1.2"/>`,
  ].join("")
}

/** Защита от утечки: контакт и кольцо датчика тока под ним */
function rcdSym(x: number, y: number, h: number): string {
  const top = y + h * 0.22
  const bot = y + h * 0.52
  const ring = y + h * 0.74
  return [
    `<line x1="${x}" y1="${y}" x2="${x}" y2="${top}" stroke="${INK}" stroke-width="1.2"/>`,
    `<line x1="${x}" y1="${bot}" x2="${x - h * 0.2}" y2="${top + 2}" stroke="${INK}" stroke-width="1.2"/>`,
    `<line x1="${x}" y1="${bot}" x2="${x}" y2="${y + h}" stroke="${INK}" stroke-width="1.2"/>`,
    `<ellipse cx="${x}" cy="${ring}" rx="7" ry="3.2" fill="none" stroke="${INK}" stroke-width="1.1"/>`,
    `<line x1="${x + 7}" y1="${ring}" x2="${x + 12}" y2="${ring}" stroke="${INK}" stroke-width="1" stroke-dasharray="2 1.5"/>`,
    `<line x1="${x + 12}" y1="${ring}" x2="${x + 12}" y2="${top + 4}" stroke="${INK}" stroke-width="1" stroke-dasharray="2 1.5"/>`,
    `<line x1="${x + 12}" y1="${top + 4}" x2="${x - 4}" y2="${top + 4}" stroke="${INK}" stroke-width="1" stroke-dasharray="2 1.5"/>`,
  ].join("")
}

/** Выключатель нагрузки: контакт без расцепителя */
function switchSym(x: number, y: number, h: number): string {
  const top = y + h * 0.3
  const bot = y + h * 0.7
  return [
    `<line x1="${x}" y1="${y}" x2="${x}" y2="${top}" stroke="${INK}" stroke-width="1.2"/>`,
    `<line x1="${x}" y1="${bot}" x2="${x - h * 0.22}" y2="${top + 2}" stroke="${INK}" stroke-width="1.2"/>`,
    `<line x1="${x - 4}" y1="${top}" x2="${x + 4}" y2="${top}" stroke="${INK}" stroke-width="1.2"/>`,
    `<line x1="${x}" y1="${bot}" x2="${x}" y2="${y + h}" stroke="${INK}" stroke-width="1.2"/>`,
  ].join("")
}

/** Счётчик: прямоугольник с буквами Wh на линии */
function meterSym(x: number, y: number, h: number): string {
  const bh = h * 0.5
  const by = y + (h - bh) / 2
  return [
    `<line x1="${x}" y1="${y}" x2="${x}" y2="${by}" stroke="${INK}" stroke-width="1.2"/>`,
    `<rect x="${x - 13}" y="${by}" width="26" height="${bh}" fill="#ffffff" stroke="${INK}" stroke-width="1.2"/>`,
    `<text x="${x}" y="${by + bh / 2 + 3.5}" text-anchor="middle" font-size="9" font-weight="bold" fill="${INK}" ${FONT}>Wh</text>`,
    `<line x1="${x}" y1="${by + bh}" x2="${x}" y2="${y + h}" stroke="${INK}" stroke-width="1.2"/>`,
  ].join("")
}

/** Реле напряжения: катушка (прямоугольник с косой чертой) и управляемый контакт */
function relaySym(x: number, y: number, h: number): string {
  const top = y + h * 0.28
  const bot = y + h * 0.68
  return [
    `<line x1="${x}" y1="${y}" x2="${x}" y2="${top}" stroke="${INK}" stroke-width="1.2"/>`,
    `<line x1="${x}" y1="${bot}" x2="${x - h * 0.2}" y2="${top + 2}" stroke="${INK}" stroke-width="1.2"/>`,
    `<line x1="${x}" y1="${bot}" x2="${x}" y2="${y + h}" stroke="${INK}" stroke-width="1.2"/>`,
    `<rect x="${x - 26}" y="${top - 2}" width="12" height="${bot - top + 4}" fill="#ffffff" stroke="${INK}" stroke-width="1.1"/>`,
    `<line x1="${x - 26}" y1="${bot + 2}" x2="${x - 14}" y2="${top - 2}" stroke="${INK}" stroke-width="1"/>`,
    `<line x1="${x - 14}" y1="${(top + bot) / 2}" x2="${x - h * 0.1}" y2="${(top + bot) / 2}" stroke="${INK}" stroke-width="1" stroke-dasharray="2 1.5"/>`,
  ].join("")
}

/** УЗИП: отвод от линии на землю через разрядник */
function spdSym(x: number, y: number, h: number): string {
  const mid = y + h * 0.4
  const bx = x - 22
  return [
    `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + h}" stroke="${INK}" stroke-width="1.2"/>`,
    `<circle cx="${x}" cy="${mid}" r="1.8" fill="${INK}"/>`,
    `<line x1="${x}" y1="${mid}" x2="${bx}" y2="${mid}" stroke="${INK}" stroke-width="1.2"/>`,
    `<rect x="${bx - 5}" y="${mid}" width="10" height="16" fill="#ffffff" stroke="${INK}" stroke-width="1.1"/>`,
    `<polyline points="${bx - 3},${mid + 4} ${bx + 1},${mid + 8} ${bx - 1},${mid + 9} ${bx + 3},${mid + 13}" fill="none" stroke="${INK}" stroke-width="1"/>`,
    `<line x1="${bx}" y1="${mid + 16}" x2="${bx}" y2="${mid + 22}" stroke="${INK}" stroke-width="1.2"/>`,
    `<line x1="${bx - 6}" y1="${mid + 22}" x2="${bx + 6}" y2="${mid + 22}" stroke="${INK}" stroke-width="1.2"/>`,
    `<line x1="${bx - 4}" y1="${mid + 25}" x2="${bx + 4}" y2="${mid + 25}" stroke="${INK}" stroke-width="1.2"/>`,
    `<line x1="${bx - 2}" y1="${mid + 28}" x2="${bx + 2}" y2="${mid + 28}" stroke="${INK}" stroke-width="1.2"/>`,
  ].join("")
}

/** Аппарат ввода нужного вида — всё рисуется на одной вертикали по линии питания */
function inputSym(d: InputDevice, x: number, y: number, h: number): string {
  switch (d.kind) {
    case "breaker":
      return breakerSym(x, y, h)
    case "switch":
      return switchSym(x, y, h)
    case "meter":
      return meterSym(x, y, h)
    case "relay":
      return relaySym(x, y, h)
    case "rcd":
      return rcdSym(x, y, h)
    case "rcbo":
      return (
        breakerSym(x, y, h) +
        `<ellipse cx="${x}" cy="${y + h * 0.86}" rx="6" ry="2.8" fill="none" stroke="${INK}" stroke-width="1.1"/>`
      )
    case "spd":
      return spdSym(x, y, h)
  }
}

/** Контакт, которым управляет катушка (контактор, реле): прямоугольник катушки слева */
function coilContactSym(x: number, y: number, h: number, mark: string): string {
  const top = y + h * 0.28
  const bot = y + h * 0.7
  const cx = x - 24
  return [
    `<line x1="${x}" y1="${y}" x2="${x}" y2="${top}" stroke="${INK}" stroke-width="1.2"/>`,
    `<line x1="${x}" y1="${bot}" x2="${x - h * 0.2}" y2="${top + 2}" stroke="${INK}" stroke-width="1.2"/>`,
    `<line x1="${x}" y1="${bot}" x2="${x}" y2="${y + h}" stroke="${INK}" stroke-width="1.2"/>`,
    `<circle cx="${x}" cy="${top}" r="1.6" fill="${INK}"/>`,
    `<rect x="${cx - 6}" y="${top - 3}" width="12" height="${bot - top + 6}" fill="#ffffff" stroke="${INK}" stroke-width="1.1"/>`,
    mark
      ? `<text x="${cx}" y="${(top + bot) / 2 + 3}" text-anchor="middle" font-size="7" font-weight="bold" fill="${INK}" ${FONT}>${mark}</text>`
      : "",
    `<line x1="${cx + 6}" y1="${(top + bot) / 2}" x2="${x - h * 0.1}" y2="${(top + bot) / 2}" stroke="${INK}" stroke-width="1" stroke-dasharray="2 1.5"/>`,
  ].join("")
}

/** Прямоугольник с буквенной меткой на линии — для диммера, терморегулятора */
function boxSym(x: number, y: number, h: number, mark: string): string {
  const bh = h * 0.46
  const by = y + (h - bh) / 2
  return [
    `<line x1="${x}" y1="${y}" x2="${x}" y2="${by}" stroke="${INK}" stroke-width="1.2"/>`,
    `<rect x="${x - 10}" y="${by}" width="20" height="${bh}" fill="#ffffff" stroke="${INK}" stroke-width="1.2"/>`,
    `<text x="${x}" y="${by + bh / 2 + 3}" text-anchor="middle" font-size="7.5" font-weight="bold" fill="${INK}" ${FONT}>${mark}</text>`,
    `<line x1="${x}" y1="${by + bh}" x2="${x}" y2="${y + h}" stroke="${INK}" stroke-width="1.2"/>`,
  ].join("")
}

/** Розетка на DIN: полукруг с выводом */
function socketSym(x: number, y: number, h: number): string {
  const cy = y + h * 0.55
  return [
    `<line x1="${x}" y1="${y}" x2="${x}" y2="${cy - 7}" stroke="${INK}" stroke-width="1.2"/>`,
    `<path d="M ${x - 8} ${cy} A 8 8 0 0 1 ${x + 8} ${cy}" fill="none" stroke="${INK}" stroke-width="1.2"/>`,
    `<line x1="${x - 10}" y1="${cy}" x2="${x + 10}" y2="${cy}" stroke="${INK}" stroke-width="1.2"/>`,
    `<line x1="${x}" y1="${cy - 8}" x2="${x}" y2="${cy - 7}" stroke="${INK}" stroke-width="1.2"/>`,
  ].join("")
}

/** Индикатор: круг с крестом */
function lampSym(x: number, y: number, h: number): string {
  const cy = y + h / 2
  const r = 7
  const d = r * 0.7
  return [
    `<line x1="${x}" y1="${y}" x2="${x}" y2="${cy - r}" stroke="${INK}" stroke-width="1.2"/>`,
    `<circle cx="${x}" cy="${cy}" r="${r}" fill="#ffffff" stroke="${INK}" stroke-width="1.2"/>`,
    `<line x1="${x - d}" y1="${cy - d}" x2="${x + d}" y2="${cy + d}" stroke="${INK}" stroke-width="1"/>`,
    `<line x1="${x + d}" y1="${cy - d}" x2="${x - d}" y2="${cy + d}" stroke="${INK}" stroke-width="1"/>`,
    `<line x1="${x}" y1="${cy + r}" x2="${x}" y2="${y + h}" stroke="${INK}" stroke-width="1.2"/>`,
  ].join("")
}

/** Аппарат на линии группы */
function lineSym(d: LineDevice, x: number, y: number, h: number): string {
  switch (d.kind) {
    case "contactor":
      return coilContactSym(x, y, h, "")
    case "timer":
      return coilContactSym(x, y, h, "T")
    case "impulse":
      return coilContactSym(x, y, h, "И")
    case "switch":
      return switchSym(x, y, h)
    case "dimmer":
      return boxSym(x, y, h, "Д")
    case "thermostat":
      return boxSym(x, y, h, "t°")
    case "socket":
      return socketSym(x, y, h)
    case "lamp":
      return lampSym(x, y, h)
  }
}

/** Позиционные обозначения аппаратов линии: KM3, KM3.2 — номер группы и порядковый */
export function lineDevicePositions(g: PlanGroup): Map<string, string> {
  const counters: Record<string, number> = {}
  const out = new Map<string, string>()
  for (const d of g.devices || []) {
    const prefix = LINE_DEVICE_INFO[d.kind].pos
    counters[prefix] = (counters[prefix] || 0) + 1
    out.set(d.id, `${prefix}${g.num}${counters[prefix] > 1 ? `.${counters[prefix]}` : ""}`)
  }
  return out
}

export const lineDeviceModules = (d: LineDevice) =>
  d.modules && d.modules > 0 ? d.modules : LINE_DEVICE_INFO[d.kind].modules

const INPUT_NAMES: Record<InputDevice["kind"], string> = {
  breaker: "вводной автомат",
  switch: "выключатель нагрузки",
  meter: "электросчётчик",
  relay: "реле напряжения",
  rcd: "УЗО",
  rcbo: "дифавтомат",
  spd: "УЗИП",
}

const label = (x: number, y: number, text: string, opts = "") =>
  `<text x="${x}" y="${y}" font-size="9" fill="${INK}" ${FONT} ${opts}>${esc(text)}</text>`

/**
 * Однолинейная схема щита в SVG.
 * Сверху ввод: кабель, вводной автомат, при необходимости противопожарное УЗО.
 * Дальше шина, под ней автоматы групп и отходящие линии с номером,
 * сечением, длиной и назначением
 */
export function panelDiagramSvg(scheme: PlanScheme, width = 700): string | null {
  const sums = groupSummaries(scheme).filter((s) => s.group)
  if (sums.length === 0) return null

  const panel = panelSettings(scheme.panel)
  const inputAmps = inputLimitAmps(panel.devices)
  const blocks = buildBlocks(sums, inputAmps)
  const lines = sums.length
  const balance = phaseBalance(scheme)

  // Высота ввода зависит от числа аппаратов в цепочке
  const devH = 52
  const busY = 40 + panel.devices.length * devH + 24

  // Колонки отходящих линий: ширина подстраивается под лист,
  // при большом числе групп схема переносится на вторую строку
  const left = 70
  const usable = width - left - 20
  const perRow = Math.max(1, Math.min(lines, Math.floor(usable / 58)))
  const colW = usable / perRow

  const parts: string[] = []
  const lineDevH = 44
  const maxLineDevs = Math.max(0, ...sums.map((s) => ((s.group as PlanGroup).devices || []).length))
  const rowH = 330 + maxLineDevs * lineDevH
  const rcdH = 50
  const brH = 48
  const textTop = 22

  // ——— Ввод: аппараты в том порядке, как их поставил электрик ———
  const inX = left + 40
  const pos = inputDevicePositions(panel.devices)
  parts.push(
    label(inX + 14, 18, `Ввод: ${panel.phases === 3 ? "~380 В, 3ф" : "~220 В, 1ф"}, кабель ${panel.inputCable}`),
    `<line x1="${inX}" y1="8" x2="${inX}" y2="40" stroke="${INK}" stroke-width="1.6"/>`,
  )
  let y = 40
  for (const d of panel.devices) {
    parts.push(inputSym(d, inX, y, devH))
    parts.push(
      label(inX + 18, y + devH * 0.45, `${pos.get(d.id)} ${inputDeviceSpec(d, panel.phases)}`, 'font-weight="bold"'),
      label(inX + 18, y + devH * 0.45 + 12, INPUT_NAMES[d.kind], `fill="${MUTED}"`),
    )
    y += devH
  }
  parts.push(`<line x1="${inX}" y1="${y}" x2="${inX}" y2="${busY}" stroke="${INK}" stroke-width="1.6"/>`)

  // ——— Отходящие линии по строкам ———
  // Раскладываем блоки по колонкам: УЗО с группами занимает несколько колонок подряд
  type Col = { sum: GroupSummary; block: Block; first: boolean; last: boolean }
  const cols: Col[] = []
  for (const b of blocks) {
    if (b.kind === "single") cols.push({ sum: b.sum, block: b, first: true, last: true })
    else b.sums.forEach((s, i) => cols.push({ sum: s, block: b, first: i === 0, last: i === b.sums.length - 1 }))
  }

  const rows = Math.ceil(cols.length / perRow)
  let qd = 1
  const qdNames = new Map<Block, string>()

  for (let r = 0; r < rows; r++) {
    const by = busY + r * rowH
    const rowCols = cols.slice(r * perRow, (r + 1) * perRow)
    const x0 = left + colW / 2
    const xEnd = left + colW * (rowCols.length - 1) + colW / 2

    // Шина: на следующих строках она продолжается от левого края
    parts.push(
      `<line x1="${r === 0 ? inX : left - 20}" y1="${by}" x2="${xEnd + 10}" y2="${by}" stroke="${INK}" stroke-width="3"/>`,
    )
    if (r === 0) parts.push(label(left - 60, by - 6, panel.name, 'font-weight="bold" font-size="11"'))
    if (r > 0) {
      parts.push(
        `<line x1="${left - 20}" y1="${by - rowH + 0}" x2="${left - 20}" y2="${by}" stroke="${INK}" stroke-width="1.2" stroke-dasharray="4 3"/>`,
      )
    }

    rowCols.forEach((c, i) => {
      const x = x0 + i * colW
      const g = c.sum.group as PlanGroup
      let cy = by

      // Общее УЗО над несколькими группами: свой отвод от шины и малая шинка под ним
      if (c.block.kind === "rcd") {
        const b = c.block
        const startInRow = c.first || i === 0
        if (startInRow) {
          const spanEnd = rowCols.findIndex((cc, j) => j >= i && cc.last && cc.block === b)
          const endIdx = spanEnd === -1 ? rowCols.length - 1 : spanEnd
          const sx = x0 + i * colW
          const ex = x0 + endIdx * colW
          const mid = (sx + ex) / 2
          if (!qdNames.has(b)) qdNames.set(b, `QD${qd++}`)
          parts.push(`<line x1="${mid}" y1="${by}" x2="${mid}" y2="${by + 8}" stroke="${INK}" stroke-width="1.2"/>`)
          parts.push(rcdSym(mid, by + 8, rcdH - 8))
          parts.push(
            label(mid + 16, by + 26, `${qdNames.get(b)} ${b.rating} А`, 'font-weight="bold"'),
            label(mid + 16, by + 37, `${b.leakage} мА, тип A`, `fill="${MUTED}"`),
          )
          parts.push(
            `<line x1="${sx}" y1="${by + rcdH}" x2="${ex}" y2="${by + rcdH}" stroke="${INK}" stroke-width="1.8"/>`,
          )
        }
        cy = by + rcdH
      } else {
        // Отдельная линия прямо от шины; у дифавтомата кольцо утечки рисуем в одном аппарате
        parts.push(`<line x1="${x}" y1="${by}" x2="${x}" y2="${by + rcdH}" stroke="${INK}" stroke-width="1.2"/>`)
        cy = by + rcdH
      }

      // Автомат группы
      parts.push(breakerSym(x, cy, brH))
      const isRcbo = g.protection === "rcbo"
      if (isRcbo) {
        const ring = cy + brH * 0.86
        parts.push(`<ellipse cx="${x}" cy="${ring}" rx="6" ry="2.8" fill="none" stroke="${INK}" stroke-width="1.1"/>`)
      }
      // Номер аппарата совпадает с номером группы — так проще искать в щите
      const devName = isRcbo ? `QFD${g.num}` : `QF${g.num}`
      parts.push(
        label(x + 9, cy + 20, devName, 'font-size="8"'),
        label(x + 9, cy + 30, g.breaker, 'font-weight="bold"'),
      )
      if (isRcbo) parts.push(label(x + 9, cy + 40, `${g.leakage} мА`, 'font-size="8"'))

      // Аппараты на линии после защиты — в заданном порядке
      let ly = cy + brH
      const lpos = lineDevicePositions(g)
      for (const d of g.devices || []) {
        parts.push(lineSym(d, x, ly, lineDevH))
        const info = LINE_DEVICE_INFO[d.kind]
        parts.push(
          label(x + 13, ly + lineDevH * 0.42, lpos.get(d.id) || "", 'font-size="8"'),
          label(x + 13, ly + lineDevH * 0.42 + 10, info.ratings[0] ? `${d.rating} А` : "", 'font-weight="bold" font-size="8.5"'),
        )
        ly += lineDevH
      }

      // Отходящая линия: цвет и толщина — по сечению кабеля, без текстовой подписи
      const st = sectionStyle(lineSection(c.sum))
      const lineTop = ly
      const lineBot = cy + brH + maxLineDevs * lineDevH + 46
      parts.push(
        `<line x1="${x}" y1="${lineTop}" x2="${x}" y2="${lineBot - 5}" stroke="${st.color}" stroke-width="${st.width + 1.2}" stroke-linecap="round"/>`,
        `<polygon points="${x - 4.5},${lineBot - 7} ${x + 4.5},${lineBot - 7} ${x},${lineBot}" fill="${st.color}"/>`,
      )

      // Фаза группы при трёхфазном вводе — цветом по ГОСТ справа от стрелки
      const ph = balance?.byGroup.get(g.id)
      if (ph) {
        parts.push(
          `<text x="${x + 6}" y="${lineBot - 1}" font-size="8.5" font-weight="bold" fill="${PHASE_COLORS[ph]}" ${FONT}>${ph}</text>`,
        )
      }

      // Номер группы в рамке цвета кабеля и назначение — вертикально
      const purpose = g.name || describeNodes(c.sum.nodeCounts) || "—"
      parts.push(
        `<rect x="${x - 11}" y="${lineBot + 4}" width="22" height="14" fill="#ffffff" stroke="${st.color}" stroke-width="1.6"/>`,
        `<text x="${x}" y="${lineBot + 14.5}" text-anchor="middle" font-size="9" font-weight="bold" fill="${INK}" ${FONT}>${g.num}</text>`,
        `<text transform="translate(${x - 3}, ${lineBot + textTop}) rotate(90)" font-size="8.5" fill="${MUTED}" ${FONT}>${esc(purpose.length > 30 ? purpose.slice(0, 29) + "…" : purpose)}</text>`,
      )
      if (c.sum.warning) {
        parts.push(`<text x="${x}" y="${cy - 2}" text-anchor="middle" font-size="11" font-weight="bold" fill="#b45309" ${FONT}>!</text>`)
      }
    })
  }

  // Нагрузка по фазам — справа от ввода, над шиной
  if (balance) {
    const bw = 210
    const bx = width - bw - 6
    const byy = 6
    const rowsH = 15
    const bh = 22 + rowsH * 3 + 18
    parts.push(
      `<rect x="${bx}" y="${byy}" width="${bw}" height="${bh}" rx="3" fill="#fafafa" stroke="#cccccc"/>`,
      label(bx + 8, byy + 15, "Нагрузка по фазам", 'font-weight="bold"'),
    )
    const maxKw = Math.max(...balance.loads.map((l) => l.kw), 0.01)
    balance.loads.forEach((l, i) => {
      const ry = byy + 22 + i * rowsH
      const barW = 60 * (l.kw / maxKw)
      parts.push(
        `<text x="${bx + 8}" y="${ry + 10}" font-size="9" font-weight="bold" fill="${PHASE_COLORS[l.phase]}" ${FONT}>${l.phase}</text>`,
        `<rect x="${bx + 26}" y="${ry + 3}" width="60" height="8" fill="#eeeeee"/>`,
        `<rect x="${bx + 26}" y="${ry + 3}" width="${barW}" height="8" fill="${PHASE_COLORS[l.phase]}"/>`,
        label(bx + 92, ry + 10, `${l.kw.toFixed(2).replace(".", ",")} кВт · ${String(l.amps).replace(".", ",")} А`),
      )
    })
    const fy = byy + 22 + rowsH * 3 + 11
    parts.push(
      label(
        bx + 8,
        fy,
        `Всего ${balance.totalKw.toFixed(2).replace(".", ",")} кВт, перекос ${balance.imbalance}%`,
        `fill="${balance.imbalance > 30 ? "#b45309" : MUTED}"`,
      ),
    )
  }

  // Легенда цветов — только сечения, которые есть в щите
  const used = [...new Set(sums.map(lineSection))].filter((x) => x !== "—")
  used.sort((a, b) => sectionOf(a) - sectionOf(b))
  const legendY = busY + rows * rowH - 22
  let lx = left + 10
  parts.push(label(left - 60, legendY + 3.5, "Кабель:", `fill="${MUTED}"`))
  for (const spec of used) {
    const st = sectionStyle(spec)
    parts.push(
      `<line x1="${lx}" y1="${legendY}" x2="${lx + 26}" y2="${legendY}" stroke="${st.color}" stroke-width="${st.width + 1.2}" stroke-linecap="round"/>`,
      label(lx + 32, legendY + 3.5, spec),
    )
    lx += 92
  }

  const height = legendY + 16
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#ffffff"/>${parts.join("")}</svg>`
}

/** Проверки щита — выводятся под схемой */
export function panelWarnings(scheme: PlanScheme): string[] {
  const sums = groupSummaries(scheme).filter((s) => s.group)
  const panel = panelSettings(scheme.panel)
  const maxGroup = Math.max(0, ...sums.map((s) => breakerAmps((s.group as PlanGroup).breaker)))
  const out: string[] = [...inputWarnings(panel.devices, maxGroup), ...(phaseBalance(scheme)?.warnings || [])]
  for (const s of sums) if (s.warning) out.push(`Группа ${(s.group as PlanGroup).num}: ${s.warning}.`)

  const nums = sums.map((s) => (s.group as PlanGroup).num)
  const dup = nums.filter((n, i) => nums.indexOf(n) !== i)
  if (dup.length) out.push(`Повторяются номера групп: ${[...new Set(dup)].join(", ")}.`)
  return out
}
