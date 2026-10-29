import { WALL_MATERIALS, WallMaterial } from "@/lib/planner/types"

export interface HatchSpec {
  size: number
  rot: number
  /** Внутренность узора SVG-разметкой, цвет штрихов подставляется */
  body: (ink: string) => string
}

/**
 * Штриховка материалов стен по ГОСТ 2.306: кирпич — частая косая,
 * бетон — косая с точками, газобетон — редкая косая, блок — в точку,
 * перегородки (ПГП, ГКЛ) — в клетку, дерево — волокна вдоль
 */
export const WALL_HATCH: Record<WallMaterial, HatchSpec> = {
  brick: { size: 6, rot: 45, body: (c) => `<line x1="0" y1="0" x2="0" y2="6" stroke="${c}" stroke-width="1.2"/>` },
  concrete: {
    size: 8,
    rot: 45,
    body: (c) =>
      `<line x1="0" y1="0" x2="0" y2="8" stroke="${c}" stroke-width="0.8"/><circle cx="4" cy="2" r="0.9" fill="${c}"/><circle cx="5.5" cy="6" r="0.7" fill="${c}"/>`,
  },
  aerated: { size: 10, rot: 45, body: (c) => `<line x1="0" y1="0" x2="0" y2="10" stroke="${c}" stroke-width="0.8"/>` },
  block: { size: 8, rot: 0, body: (c) => `<circle cx="2" cy="2" r="1" fill="${c}"/><circle cx="6" cy="6" r="1" fill="${c}"/>` },
  pgp: {
    size: 7,
    rot: 45,
    body: (c) => `<line x1="0" y1="0" x2="0" y2="7" stroke="${c}" stroke-width="0.6"/><line x1="0" y1="0" x2="7" y2="0" stroke="${c}" stroke-width="0.6"/>`,
  },
  gkl: {
    size: 7,
    rot: 45,
    body: (c) => `<line x1="0" y1="0" x2="0" y2="7" stroke="${c}" stroke-width="0.7"/><line x1="0" y1="0" x2="7" y2="0" stroke="${c}" stroke-width="0.7"/>`,
  },
  wood: { size: 10, rot: 0, body: (c) => `<path d="M0 3 Q 2.5 1.5 5 3 T 10 3" fill="none" stroke="${c}" stroke-width="0.8"/>` },
}

/** Цвет штрихов: на тёмном гипсокартоне — светлые, на остальных — тёмные */
export const hatchInk = (m: WallMaterial) => (m === "gkl" ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)")

/** SVG-паттерн материала: заливка цветом + штриховка */
export function hatchPattern(m: WallMaterial, id: string, opacity = 1, ink = hatchInk(m)): string {
  const h = WALL_HATCH[m]
  return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${h.size}" height="${h.size}" patternTransform="rotate(${h.rot})"><rect width="${h.size}" height="${h.size}" fill="${WALL_MATERIALS[m].color}" fill-opacity="${opacity}"/>${h.body(ink)}</pattern>`
}

/** Материалы стен, которые есть в планировке, в порядке справочника */
export function usedMaterials(materials: WallMaterial[]): WallMaterial[] {
  const set = new Set(materials)
  return (Object.keys(WALL_MATERIALS) as WallMaterial[]).filter((m) => set.has(m))
}

/** Отдельная картинка-образец материала для таблиц и легенд */
export function materialSwatchSvg(m: WallMaterial, w = 34, h = 16, opacity = 0.9, ink = hatchInk(m)): string {
  const id = `sw-${m}`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${hatchPattern(m, id, opacity, ink)}</defs><rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="url(#${id})" stroke="#161616" stroke-width="1"/></svg>`
}

/** Образец как data-URI: так html2canvas в PDF рисует его без обрезки */
export const materialSwatchImg = (m: WallMaterial, w = 34, h = 16, opacity = 0.9, ink = hatchInk(m)) =>
  `<img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(materialSwatchSvg(m, w, h, opacity, ink))}" width="${w}" height="${h}" style="vertical-align:middle;display:inline-block"/>`
