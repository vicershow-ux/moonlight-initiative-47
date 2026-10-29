import { FIXTURE_PRESETS, FixtureKind, NODE_PRESETS, NodeKind, PlanFixture, PlanLayer, PlanNode } from "@/lib/planner/types"
import { fixtureLength } from "@/lib/planner/fixtures"
import { fmtNum } from "@/lib/planner/geometry"
import { toMm } from "@/lib/planner/geometry"
import { symbolIconSvg } from "@/lib/planner/symbols"

/** Короткие буквенные обозначения точек — подпись у значка на мелком масштабе */
export const NODE_CODES: Partial<Record<NodeKind, string>> = {
  panel: "ЩК",
  junction: "КР",
  socket: "Р",
  socket_power: "Р380",
  switch: "В",
  switch_double: "В2",
  switch_pass: "ВП",
  switch_pass_double: "ВП2",
  light: "Св",
  spot: "Сп",
}

/** Порядок в легенде — как в справочнике точек */
const ORDER = Object.keys(NODE_PRESETS) as NodeKind[]

export interface NodeLegendItem {
  kind: NodeKind
  label: string
  code: string
  count: number
  /** Высоты установки, мм */
  heights: number[]
}

/** Какие точки есть на слое — для легенды */
export function nodeLegendItems(nodes: PlanNode[], layer: Exclude<PlanLayer, "plan">): NodeLegendItem[] {
  return ORDER.filter((k) => NODE_PRESETS[k].layer === layer)
    .map((kind) => {
      const list = nodes.filter((n) => n.layer === layer && n.kind === kind)
      return {
        kind,
        label: NODE_PRESETS[kind].label,
        code: NODE_CODES[kind] || "",
        count: list.length,
        heights: [...new Set(list.map((n) => toMm(n.height)))].sort((a, b) => a - b),
      }
    })
    .filter((i) => i.count > 0)
}

/** Значок точки отдельной картинкой для легенды PDF (data-URI — html2canvas рисует без обрезки) */
export function nodeLegendImg(kind: NodeKind, w = 40, h = 24): string {
  const svg = symbolIconSvg(kind, w, h, h * 0.34, "#161616", "#ffffff")
  if (!svg) return ""
  return `<img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}" width="${w}" height="${h}" style="vertical-align:middle;display:inline-block"/>`
}

/** Треки и парящие потолки для легенды: трек — штуки и общая длина, потолок — помещения */
export function fixtureLegendItems(fixtures: PlanFixture[]) {
  return (Object.keys(FIXTURE_PRESETS) as FixtureKind[])
    .map((kind) => {
      const list = fixtures.filter((f) => f.kind === kind)
      const len = list.reduce((s, f) => s + fixtureLength(f), 0)
      return {
        kind,
        label: FIXTURE_PRESETS[kind].label,
        code: FIXTURE_PRESETS[kind].code,
        count: list.length,
        total: kind === "track" ? `${list.length} шт. · ${fmtNum(len, 2)} м` : `${list.length} пом.`,
      }
    })
    .filter((i) => i.count > 0)
}
