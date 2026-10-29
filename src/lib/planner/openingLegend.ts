import { OPENING_PRESETS, OpeningKind, PlanOpening } from "@/lib/planner/types"
import { toMm } from "@/lib/planner/geometry"

export interface OpeningPalette {
  wall: string
  wallStroke: string
  gap: string
  window: string
  door: string
  arch: string
}

/** Цвета как на чертеже в PDF: белый лист, тёмные стены */
export const PDF_OPENING_PALETTE: OpeningPalette = {
  wall: "#d9d9d9",
  wallStroke: "#161616",
  gap: "#ffffff",
  window: "#2f80c9",
  door: "#2f9d55",
  arch: "#8b5cc9",
}

/** Цвета как на плане в кабинете: тёмный фон */
export const SCREEN_OPENING_PALETTE: OpeningPalette = {
  wall: "rgba(200,200,200,0.55)",
  wallStroke: "rgba(255,255,255,0.8)",
  gap: "#141414",
  window: "#7FB5E8",
  door: "#8BD48B",
  arch: "#C9A0E8",
}

export const OPENING_KINDS: OpeningKind[] = ["window", "door", "arch"]

export const OPENING_HINTS: Record<OpeningKind, string> = {
  window: "откосы и переплёт",
  door: "полотно и дуга открывания",
  arch: "проём без заполнения",
}

/**
 * Образец условного знака: кусок стены с вырезом и обозначением, как на плане.
 * Стена горизонтальная, вырез посередине
 */
export function openingSwatchSvg(kind: OpeningKind, p: OpeningPalette, w = 52, h = 26): string {
  const wallH = Math.min(8, Math.max(5, h * 0.32))
  const wallY = kind === "door" ? h - wallH - 0.5 : (h - wallH) / 2
  // У двери дуга открывания уходит вверх от стены — проём не шире свободного места над ней
  const gapW = kind === "door" ? Math.min(w * 0.46, wallY - 1) : w * 0.46
  const gx1 = (w - gapW) / 2
  const gx2 = gx1 + gapW
  const col = p[kind]
  const top = wallY
  const bot = wallY + wallH
  const mid = wallY + wallH / 2
  const parts: string[] = [
    `<rect x="0.5" y="${top}" width="${gx1 - 0.5}" height="${wallH}" fill="${p.wall}" stroke="${p.wallStroke}" stroke-width="1"/>`,
    `<rect x="${gx2}" y="${top}" width="${w - gx2 - 0.5}" height="${wallH}" fill="${p.wall}" stroke="${p.wallStroke}" stroke-width="1"/>`,
    `<rect x="${gx1}" y="${top}" width="${gx2 - gx1}" height="${wallH}" fill="${p.gap}"/>`,
    `<line x1="${gx1}" y1="${top}" x2="${gx1}" y2="${bot}" stroke="${p.wallStroke}" stroke-width="1.3"/>`,
    `<line x1="${gx2}" y1="${top}" x2="${gx2}" y2="${bot}" stroke="${p.wallStroke}" stroke-width="1.3"/>`,
  ]
  if (kind === "window") {
    parts.push(
      `<line x1="${gx1}" y1="${mid}" x2="${gx2}" y2="${mid}" stroke="${col}" stroke-width="2"/>`,
      `<line x1="${gx1}" y1="${top}" x2="${gx2}" y2="${top}" stroke="${col}" stroke-width="0.8"/>`,
      `<line x1="${gx1}" y1="${bot}" x2="${gx2}" y2="${bot}" stroke="${col}" stroke-width="0.8"/>`,
    )
  } else if (kind === "door") {
    const r = gx2 - gx1
    const hy = top
    parts.push(
      `<line x1="${gx1}" y1="${hy}" x2="${gx1}" y2="${hy - r}" stroke="${col}" stroke-width="1.6"/>`,
      `<path d="M ${gx1} ${hy - r} A ${r} ${r} 0 0 1 ${gx2} ${hy}" fill="none" stroke="${col}" stroke-width="0.9" stroke-dasharray="3 2"/>`,
    )
  } else {
    parts.push(
      `<line x1="${gx1}" y1="${top}" x2="${gx2}" y2="${top}" stroke="${col}" stroke-width="1.6"/>`,
      `<line x1="${gx1}" y1="${bot}" x2="${gx2}" y2="${bot}" stroke="${col}" stroke-width="1.6"/>`,
    )
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${parts.join("")}</svg>`
}

/** Образец как data-URI: так html2canvas в PDF рисует его без обрезки */
export const openingSwatchImg = (kind: OpeningKind, p: OpeningPalette, w = 52, h = 26) =>
  `<img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(openingSwatchSvg(kind, p, w, h))}" width="${w}" height="${h}" style="vertical-align:middle;display:inline-block"/>`

export interface OpeningLegendItem {
  kind: OpeningKind
  label: string
  count: number
  /** Встречающиеся размеры ширина×высота, мм */
  sizes: string[]
}

/** Какие проёмы есть на плане — для легенды */
export function openingLegendItems(openings: PlanOpening[]): OpeningLegendItem[] {
  return OPENING_KINDS.map((kind) => {
    const list = openings.filter((o) => o.kind === kind)
    const sizes = [...new Set(list.map((o) => `${toMm(o.width)}×${toMm(o.height)}`))]
    return { kind, label: OPENING_PRESETS[kind].label, count: list.length, sizes }
  }).filter((i) => i.count > 0)
}
