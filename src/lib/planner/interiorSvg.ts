import {
  FLOOR_FINISHES,
  FURNITURE_PRESETS,
  FloorFinish,
  HEATING_PRESETS,
  PlanFurniture,
  PlanHeating,
} from "./types"
import { furnitureCorners } from "./interior"

type Pt = { x: number; y: number }
type ToScreen = (p: Pt) => Pt

/**
 * Узоры покрытий пола: доска — полосы со стыками вразбежку, ёлочка — паркет,
 * плитка — клетка со швом. Размер в метрах переводится в пиксели масштабом плана
 */
export function floorPattern(id: string, finish: FloorFinish, scale: number, color?: string, line = "rgba(0,0,0,0.28)"): string {
  const info = FLOOR_FINISHES[finish]
  const fill = color || info.color
  if (finish === "none") return ""
  const px = (m: number) => Math.max(m * scale, 3)
  if (info.pattern === "planks") {
    const w = px(1.2)
    const h = px(0.19)
    return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${w}" height="${h * 2}"><rect width="${w}" height="${h * 2}" fill="${fill}"/><line x1="0" y1="${h}" x2="${w}" y2="${h}" stroke="${line}" stroke-width="0.6"/><line x1="0" y1="${h * 2}" x2="${w}" y2="${h * 2}" stroke="${line}" stroke-width="0.6"/><line x1="${w * 0.35}" y1="0" x2="${w * 0.35}" y2="${h}" stroke="${line}" stroke-width="0.6"/><line x1="${w * 0.85}" y1="${h}" x2="${w * 0.85}" y2="${h * 2}" stroke="${line}" stroke-width="0.6"/></pattern>`
  }
  if (info.pattern === "herring") {
    const s = px(0.14)
    return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${s * 2}" height="${s * 2}" patternTransform="rotate(45)"><rect width="${s * 2}" height="${s * 2}" fill="${fill}"/><path d="M0 0 H${s} V${s} H${s * 2} V${s * 2} H${s} V${s} H0 Z" fill="rgba(0,0,0,0.08)" stroke="${line}" stroke-width="0.5"/></pattern>`
  }
  if (info.pattern === "tiles") {
    const s = px(finish === "porcelain" ? 0.6 : 0.3)
    return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${s}" height="${s}"><rect width="${s}" height="${s}" fill="${fill}"/><path d="M${s} 0 V${s} H0" fill="none" stroke="${line}" stroke-width="0.8"/></pattern>`
  }
  return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="10" height="10"><rect width="10" height="10" fill="${fill}"/></pattern>`
}

/** Узор зоны тёплого пола: змейка кабеля/трубы или сетка мата */
export function heatingPattern(id: string, h: PlanHeating, scale: number, ink?: string): string {
  const c = ink || HEATING_PRESETS[h.kind].color
  const step = Math.max((h.step ?? HEATING_PRESETS[h.kind].step ?? 0.1) * scale, 4)
  if (h.kind === "film") {
    const w = Math.max(0.5 * scale, 8)
    return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${w}" height="${w}"><rect width="${w}" height="${w}" fill="${c}" fill-opacity="0.14"/><line x1="${w * 0.05}" y1="0" x2="${w * 0.05}" y2="${w}" stroke="${c}" stroke-width="1"/><line x1="${w * 0.95}" y1="0" x2="${w * 0.95}" y2="${w}" stroke="${c}" stroke-width="1"/><line x1="0" y1="${w * 0.5}" x2="${w}" y2="${w * 0.5}" stroke="${c}" stroke-width="0.5" stroke-dasharray="2 2"/></pattern>`
  }
  // Змейка: дуга на каждом шаге — читается как уложенный кабель или труба
  const s = step
  return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${s * 2}" height="${s * 6}"><rect width="${s * 2}" height="${s * 6}" fill="${c}" fill-opacity="0.1"/><path d="M${s * 0.5} 0 V${s * 5.5} A${s * 0.5} ${s * 0.5} 0 0 0 ${s * 1.5} ${s * 5.5} V0" fill="none" stroke="${c}" stroke-width="${h.kind === "water" ? 1.4 : 1}"/></pattern>`
}

/**
 * Мебель в плане: контур и типовой рисунок предмета — кровать с подушками,
 * диван со спинкой, ванна с чашей, унитаз, раковина, плита с конфорками
 */
export function furnitureSvg(f: PlanFurniture, toScreen: ToScreen, stroke: string, fill: string, sw = 1.2): string {
  const corners = furnitureCorners(f).map(toScreen)
  const r = (f.rot * Math.PI) / 180
  const c = Math.cos(r)
  const s = Math.sin(r)
  // Точка в локальных координатах предмета (доли ширины и глубины от центра) → экран
  const L = (u: number, v: number) => toScreen({ x: f.x + u * f.w * c - v * f.d * s, y: f.y + u * f.w * s + v * f.d * c })
  const poly = (pts: Pt[], extra = "") =>
    `<polygon points="${pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`
  const line = (a: Pt, b: Pt, w = sw * 0.8) =>
    `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${stroke}" stroke-width="${w}"/>`
  const rect = (u0: number, v0: number, u1: number, v1: number, extra = "") => poly([L(u0, v0), L(u1, v0), L(u1, v1), L(u0, v1)], extra)
  const k = Math.hypot(toScreen({ x: 1, y: 0 }).x - toScreen({ x: 0, y: 0 }).x, toScreen({ x: 1, y: 0 }).y - toScreen({ x: 0, y: 0 }).y)
  const circle = (u: number, v: number, rm: number, extra = "") => {
    const p = L(u, v)
    return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(rm * k).toFixed(1)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw * 0.8}" ${extra}/>`
  }
  const ellipse = (u: number, v: number, ru: number, rv: number) => {
    const p = L(u, v)
    return `<ellipse cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" rx="${(ru * f.w * k).toFixed(1)}" ry="${(rv * f.d * k).toFixed(1)}" transform="rotate(${f.rot} ${p.x.toFixed(1)} ${p.y.toFixed(1)})" fill="${fill}" stroke="${stroke}" stroke-width="${sw * 0.8}"/>`
  }

  const parts: string[] = [poly(corners)]
  switch (f.kind) {
    case "bed_double":
      parts.push(rect(-0.45, -0.46, -0.03, -0.3), rect(0.03, -0.46, 0.45, -0.3), line(L(-0.5, -0.2), L(0.5, -0.2)))
      break
    case "bed_single":
      parts.push(rect(-0.4, -0.46, 0.4, -0.3), line(L(-0.5, -0.2), L(0.5, -0.2)))
      break
    case "sofa":
      parts.push(rect(-0.5, -0.5, 0.5, -0.22), rect(-0.5, -0.22, -0.42, 0.5), rect(0.42, -0.22, 0.5, 0.5), line(L(0, -0.22), L(0, 0.5)))
      break
    case "armchair":
      parts.push(rect(-0.5, -0.5, 0.5, -0.25), rect(-0.5, -0.25, -0.33, 0.5), rect(0.33, -0.25, 0.5, 0.5))
      break
    case "wardrobe":
    case "shelf":
      parts.push(line(L(0, -0.5), L(0, 0.5)), line(L(-0.5, 0.5), L(0.5, -0.5), sw * 0.4))
      break
    case "kitchen_base":
      parts.push(...[-0.25, 0, 0.25].map((u) => line(L(u, -0.5), L(u, 0.5), sw * 0.5)), line(L(-0.5, 0.35), L(0.5, 0.35), sw * 0.5))
      break
    case "kitchen_wall":
      parts.push(line(L(-0.5, -0.5), L(0.5, 0.5), sw * 0.4), line(L(-0.5, 0.5), L(0.5, -0.5), sw * 0.4))
      break
    case "fridge":
      parts.push(line(L(-0.5, 0.35), L(0.5, 0.35)), `<text x="${L(0, -0.05).x}" y="${L(0, -0.05).y + 3}" text-anchor="middle" font-size="${Math.max(6, 0.12 * k)}" fill="${stroke}" font-family="Arial">Х</text>`)
      break
    case "stove":
      parts.push(circle(-0.22, -0.2, 0.08), circle(0.22, -0.2, 0.1), circle(-0.22, 0.22, 0.1), circle(0.22, 0.22, 0.08))
      break
    case "sink_kitchen":
      parts.push(rect(-0.4, -0.3, 0.05, 0.35, `rx="3"`), rect(0.1, -0.3, 0.4, 0.35, `rx="3"`), circle(-0.17, 0.05, 0.02))
      break
    case "dishwasher":
    case "washer":
      parts.push(circle(0, 0.05, Math.min(f.w, f.d) * 0.3))
      break
    case "bath":
      parts.push(ellipse(0.02, 0.05, 0.43, 0.36), circle(-0.36, 0.05, 0.025))
      break
    case "shower":
      parts.push(line(L(-0.5, -0.5), L(0.5, 0.5), sw * 0.5), line(L(-0.5, 0.5), L(0.5, -0.5), sw * 0.5), circle(0, 0, 0.03))
      break
    case "toilet_f":
      parts.push(rect(-0.5, -0.5, 0.5, -0.22), ellipse(0, 0.2, 0.42, 0.3))
      break
    case "washbasin":
      parts.push(ellipse(0, 0.08, 0.36, 0.3), circle(0, -0.22, 0.02))
      break
    case "boiler_f":
      parts.push(circle(0, 0, Math.min(f.w, f.d) * 0.4))
      break
    case "table":
    case "desk":
      parts.push(rect(-0.44, -0.4, 0.44, 0.4, `fill-opacity="0"`))
      break
    case "tv_stand":
      parts.push(line(L(-0.4, -0.5), L(0.4, -0.5), sw * 2.2))
      break
    case "towel_rail":
      parts.push(...[-0.3, 0, 0.3].map((u) => line(L(u, -0.5), L(u, 0.5), sw * 0.5)))
      break
    default:
      break
  }
  return parts.join("")
}

export const furnitureName = (f: PlanFurniture) => f.label || FURNITURE_PRESETS[f.kind].label
