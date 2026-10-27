import type { Orientation, PromoDesign, PromoEl, PromoFormat, PromoSide } from "@/lib/promoTypes"

export const MM_PX = 96 / 25.4
/** 1 pt в миллиметрах */
export const PT_MM = 25.4 / 72

export const FORMATS: Record<PromoFormat, { label: string; w: number; h: number; safe: number }> = {
  card: { label: "Визитка 90×50", w: 90, h: 50, safe: 3 },
  a4: { label: "Листовка А4", w: 210, h: 297, safe: 6 },
  a5: { label: "Листовка А5", w: 148, h: 210, safe: 5 },
  a6: { label: "Листовка А6", w: 105, h: 148, safe: 4 },
}

/** Размер стороны макета в мм */
export function pageSize(format: PromoFormat, orientation: Orientation) {
  const f = FORMATS[format]
  const long = Math.max(f.w, f.h)
  const short = Math.min(f.w, f.h)
  if (format === "card") return orientation === "portrait" ? { w: short, h: long } : { w: long, h: short }
  return orientation === "landscape" ? { w: long, h: short } : { w: short, h: long }
}

export const FONTS: { family: string; label: string; bold: boolean }[] = [
  { family: "Montserrat", label: "Montserrat", bold: true },
  { family: "Rubik", label: "Rubik", bold: true },
  { family: "Manrope", label: "Manrope", bold: true },
  { family: "Unbounded", label: "Unbounded", bold: true },
  { family: "Oswald", label: "Oswald", bold: true },
  { family: "Roboto Condensed", label: "Roboto Condensed", bold: true },
  { family: "Russo One", label: "Russo One", bold: false },
  { family: "Comfortaa", label: "Comfortaa", bold: true },
  { family: "Playfair Display", label: "Playfair Display", bold: true },
  { family: "Cormorant Garamond", label: "Cormorant Garamond", bold: true },
  { family: "Forum", label: "Forum", bold: false },
  { family: "PT Serif", label: "PT Serif", bold: true },
  { family: "Lobster", label: "Lobster", bold: false },
  { family: "Marck Script", label: "Marck Script", bold: false },
  { family: "Bad Script", label: "Bad Script", bold: false },
  { family: "Caveat", label: "Caveat", bold: true },
]

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  FONTS.map((f) => {
    const name = f.family.replace(/ /g, "+")
    if (f.family === "Montserrat") return `family=${name}:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,700`
    return f.bold ? `family=${name}:wght@400;700` : `family=${name}`
  }).join("&") +
  "&display=swap"

export const fontStack = (family: string) => `'${family}', 'Montserrat', Arial, sans-serif`

export const PALETTE = [
  "#ffffff", "#f5f1e8", "#e7e2d6", "#bdbdbd", "#7a7a7a", "#3a3a3a", "#1c1c1c", "#0b0b0b",
  "#D4AF37", "#B8860B", "#f0dfa8", "#8a6a1e", "#c0392b", "#e67e22", "#f1c40f", "#27ae60",
  "#16a085", "#2aa7e0", "#1f5fa8", "#0f2a4a", "#6c3fb5", "#d63384", "#f8c8d4", "#a8d5ba",
]

export const PHOTOS: { src: string; label: string }[] = [
  { src: "/promo/worker.jpg", label: "Мастер" },
  { src: "/promo/tools.jpg", label: "Инструменты" },
  { src: "/promo/marble.jpg", label: "Мрамор" },
  { src: "/promo/hously-1.jpg", label: "Интерьер 1" },
  { src: "/promo/hously-2.jpg", label: "Интерьер 2" },
  { src: "/promo/hously-background.jpg", label: "Кухня" },
  { src: "/promo/exterior.jpg", label: "Дом" },
]

export const ICONS = [
  "Phone", "Mail", "Globe", "MapPin", "Send", "MessageCircle", "Clock", "Calendar",
  "House", "Building2", "KeyRound", "Hammer", "Wrench", "Paintbrush", "PaintRoller", "Ruler",
  "Drill", "HardHat", "Bath", "Sofa", "Lightbulb", "Zap", "Droplets", "Thermometer",
  "Check", "CircleCheck", "ShieldCheck", "Award", "Star", "Percent", "Gift", "Sparkles",
  "Heart", "ThumbsUp", "ArrowRight", "Scissors",
]

export const uid = () => Math.random().toString(36).slice(2, 10)

/** Пересчёт элементов при смене формата или ориентации */
export function rescaleDesign(d: PromoDesign, format: PromoFormat, orientation: Orientation): PromoDesign {
  const from = pageSize(d.format, d.orientation)
  const to = pageSize(format, orientation)
  const sx = to.w / from.w
  const sy = to.h / from.h
  const s = Math.min(sx, sy)
  const scaleEl = (el: PromoEl): PromoEl => {
    const cx = (el.x + el.w / 2) * sx
    const cy = (el.y + el.h / 2) * sy
    const square = el.type === "qr" || el.type === "icon" || (el.type === "ellipse" && Math.abs(el.w - el.h) < 0.5)
    const keep = square || el.type === "text"
    let w = keep ? el.w * s : el.w * sx
    let h = keep ? el.h * s : el.h * sy
    const fullBleed = el.x <= 0.5 && el.y <= 0.5 && el.w >= from.w - 1 && el.h >= from.h - 1
    if (el.type === "text") w = Math.min(el.w * sx, to.w)
    if (fullBleed) return { ...el, x: 0, y: 0, w: to.w, h: to.h }
    if (el.type === "tear") {
      w = to.w
      h = el.h * s
      return { ...el, x: 0, y: to.h - h, w, h, size: el.size * s }
    }
    const next = { ...el, x: cx - w / 2, y: cy - h / 2, w, h }
    if (next.type === "text") next.size = Math.round(next.size * s * 10) / 10
    return next
  }
  return {
    ...d,
    format,
    orientation,
    sides: d.sides.map((side) => ({ ...side, elements: side.elements.map(scaleEl) })),
  }
}

export interface SheetLayout {
  sheetW: number
  sheetH: number
  cols: number
  rows: number
  x0: number
  y0: number
  w: number
  h: number
}

/** Раскладка макетов на листе А4 — сколько штук поместится */
export function sheetLayout(format: PromoFormat, orientation: Orientation, gap = 0): SheetLayout {
  const { w, h } = pageSize(format, orientation)
  const opts = [
    { sheetW: 210, sheetH: 297 },
    { sheetW: 297, sheetH: 210 },
  ].map((s) => {
    const cols = Math.max(1, Math.floor((s.sheetW - 8 + gap) / (w + gap)))
    const rows = Math.max(1, Math.floor((s.sheetH - 8 + gap) / (h + gap)))
    return { ...s, cols, rows }
  })
  const fitsExact = opts.find((o) => o.sheetW === w && o.sheetH === h)
  const best = fitsExact ? { ...fitsExact, cols: 1, rows: 1 } : opts.sort((a, b) => b.cols * b.rows - a.cols * a.rows)[0]
  const totalW = best.cols * w + (best.cols - 1) * gap
  const totalH = best.rows * h + (best.rows - 1) * gap
  return { ...best, w, h, x0: (best.sheetW - totalW) / 2, y0: (best.sheetH - totalH) / 2 }
}

export const emptySide = (bg = "#ffffff"): PromoSide => ({ bg, elements: [] })
