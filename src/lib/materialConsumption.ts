import { MaterialItem } from "@/lib/api"

export type ConsumptionMode = "coverage" | "per_unit"

export const CONSUMPTION_MODES: { value: ConsumptionMode; label: string; hint: string }[] = [
  {
    value: "coverage",
    label: "1 единица материала покрывает N площади",
    hint: "Например: 1 мешок покрывает 20 м²",
  },
  {
    value: "per_unit",
    label: "N единиц материала на 1 единицу площади",
    hint: "Например: 3 шт на 1 м² или 0.3 л на 1 м²",
  },
]

export const getMode = (m?: Pick<MaterialItem, "consumption_mode"> | null): ConsumptionMode =>
  m?.consumption_mode === "per_unit" ? "per_unit" : "coverage"

const num = (v: unknown) => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v)
  return Number.isFinite(n) ? n : 0
}

/**
 * Сколько единиц материала нужно на заданную площадь / длину.
 *
 * coverage: 1 мешок покрывает 20 м²  ->  площадь / 20
 * per_unit: 3 шт на 1 м²             ->  площадь * 3
 */
export function calcMaterialQty(
  area: number,
  consumption: number,
  mode: ConsumptionMode
): number {
  const a = num(area)
  const c = num(consumption)
  if (a <= 0 || c <= 0) return 0
  return mode === "per_unit" ? a * c : a / c
}

/** Понятная человеку расшифровка нормы: "1 меш = 20 м²" или "3 шт на 1 м²" */
export function consumptionLabel(m: Pick<
  MaterialItem,
  "unit" | "consumption" | "consumption_unit" | "consumption_mode"
>): string {
  const c = num(m.consumption)
  if (c <= 0) return ""
  const cu = m.consumption_unit || "м²"
  return getMode(m) === "per_unit"
    ? `${c} ${m.unit} на 1 ${cu}`
    : `1 ${m.unit} = ${c} ${cu}`
}
