import { fmtNum } from "./geometry"
import { GroupSummary, describeNodes, groupSummaries } from "./groups"
import {
  DEFAULT_PANEL,
  PanelSettings,
  PlanGroup,
  PlanScheme,
  breakerAmps,
  sectionOf,
} from "./types"

const esc = (s: string) =>
  String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

const INK = "#161616"
const MUTED = "#666666"
const FONT = 'font-family="Arial"'

export const panelSettings = (p?: Partial<PanelSettings> | null): PanelSettings => ({
  ...DEFAULT_PANEL,
  ...(p || {}),
})

/** Номинал УЗО — ближайший стандартный не меньше автомата группы */
const rcdRating = (amps: number) => [16, 25, 40, 63, 80, 100].find((x) => x >= amps) ?? 100

/**
 * Блоки щита слева направо. Группы с «Автомат + УЗО» и одинаковой утечкой
 * садятся под одно общее УЗО — так обычно и собирают квартирный щит.
 * Номинал общего УЗО — не меньше суммы автоматов под ним, но не больше вводного
 */
type Block =
  | { kind: "single"; sum: GroupSummary }
  | { kind: "rcd"; leakage: number; rating: number; sums: GroupSummary[] }

function buildBlocks(sums: GroupSummary[], inputAmps: number): Block[] {
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
const lineSection = (sum: GroupSummary) => {
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
  const inputAmps = breakerAmps(panel.inputBreaker)
  const blocks = buildBlocks(sums, inputAmps)
  const lines = sums.length

  // Колонки отходящих линий: ширина подстраивается под лист,
  // при большом числе групп схема переносится на вторую строку
  const left = 70
  const usable = width - left - 20
  const perRow = Math.max(1, Math.min(lines, Math.floor(usable / 58)))
  const colW = usable / perRow

  const parts: string[] = []
  const busY = 150
  const rowH = 310
  const rcdH = 50
  const brH = 48
  const textTop = 22

  // ——— Ввод ———
  const inX = left + 10
  parts.push(
    label(inX + 14, 18, `Ввод: ${panel.phases === 3 ? "~380 В, 3ф" : "~220 В, 1ф"}, кабель ${panel.inputCable}`),
    `<line x1="${inX}" y1="8" x2="${inX}" y2="30" stroke="${INK}" stroke-width="1.6"/>`,
  )
  parts.push(breakerSym(inX, 30, 50))
  parts.push(
    label(inX + 14, 52, `QF0 ${panel.inputBreaker}`, 'font-weight="bold"'),
    label(inX + 14, 64, panel.phases === 3 ? "3P, вводной" : "2P, вводной", `fill="${MUTED}"`),
  )
  let y = 80
  if (panel.mainRcd) {
    parts.push(rcdSym(inX, y, 50))
    parts.push(
      label(inX + 22, y + 22, `QD0 ${rcdRating(inputAmps)} А / ${panel.mainRcd} мА`, 'font-weight="bold"'),
      label(inX + 22, y + 34, "УЗО противопожарное", `fill="${MUTED}"`),
    )
    y += 50
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

      // Отходящая линия и стрелка к потребителю
      const lineTop = cy + brH
      const lineBot = lineTop + 40
      parts.push(
        `<line x1="${x}" y1="${lineTop}" x2="${x}" y2="${lineBot}" stroke="${INK}" stroke-width="1.2"/>`,
        `<polygon points="${x - 3.5},${lineBot - 6} ${x + 3.5},${lineBot - 6} ${x},${lineBot}" fill="${INK}"/>`,
      )

      // Подписи линии — повёрнуты вертикально, как на однолинейных схемах
      const tx = x + 4
      const ty = lineBot + textTop
      const len = `${fmtNum(c.sum.total, 1)} м`
      const purpose = g.name || describeNodes(c.sum.nodeCounts) || "—"
      parts.push(
        `<rect x="${x - 11}" y="${lineBot + 4}" width="22" height="14" fill="#ffffff" stroke="${INK}" stroke-width="1"/>`,
        `<text x="${x}" y="${lineBot + 14.5}" text-anchor="middle" font-size="9" font-weight="bold" fill="${INK}" ${FONT}>${g.num}</text>`,
        `<text transform="translate(${tx}, ${ty}) rotate(90)" font-size="8.5" fill="${INK}" ${FONT}>${esc(lineSection(c.sum))} · ${len}</text>`,
        `<text transform="translate(${tx - 11}, ${ty}) rotate(90)" font-size="8.5" fill="${MUTED}" ${FONT}>${esc(purpose.length > 26 ? purpose.slice(0, 25) + "…" : purpose)}</text>`,
      )
      if (c.sum.warning) {
        parts.push(`<text x="${x}" y="${cy - 2}" text-anchor="middle" font-size="11" font-weight="bold" fill="#b45309" ${FONT}>!</text>`)
      }
    })
  }

  const height = busY + rows * rowH - 30
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#ffffff"/>${parts.join("")}</svg>`
}

/** Проверки щита — выводятся под схемой */
export function panelWarnings(scheme: PlanScheme): string[] {
  const sums = groupSummaries(scheme).filter((s) => s.group)
  const panel = panelSettings(scheme.panel)
  const inputAmps = breakerAmps(panel.inputBreaker)
  const out: string[] = []

  const maxGroup = Math.max(0, ...sums.map((s) => breakerAmps((s.group as PlanGroup).breaker)))
  if (inputAmps && maxGroup >= inputAmps) {
    out.push(
      `Вводной автомат ${panel.inputBreaker} не больше самого мощного автомата группы — селективность не обеспечена.`,
    )
  }
  for (const s of sums) if (s.warning) out.push(`Группа ${(s.group as PlanGroup).num}: ${s.warning}.`)

  const nums = sums.map((s) => (s.group as PlanGroup).num)
  const dup = nums.filter((n, i) => nums.indexOf(n) !== i)
  if (dup.length) out.push(`Повторяются номера групп: ${[...new Set(dup)].join(", ")}.`)
  return out
}
