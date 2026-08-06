export const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v)
  return Number.isFinite(n) ? n : fallback
}

export const formatMoney = (n: unknown) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(num(n)) + " ₽"

export const ACT_TYPES = [
  { value: "acceptance", label: "Акт сдачи-приёмки выполненных работ" },
  { value: "intermediate", label: "Промежуточный акт выполненных работ" },
  { value: "hidden_works", label: "Акт освидетельствования скрытых работ" },
  { value: "defect", label: "Дефектный акт" },
]

export const SCOPE_OPTIONS = [
  { value: "all", label: "Все работы, перечисленные в акте" },
  { value: "stage", label: "Отдельный этап работ" },
]

export const INSPECTION_OPTIONS = [
  { value: "", label: "Выберите результат осмотра" },
  { value: "no_defects", label: "Без замечаний" },
  { value: "minor_defects", label: "Незначительные недостатки" },
  { value: "defects", label: "Есть замечания" },
]

export const CALCULATION_OPTIONS = [
  { value: "contract", label: "По условиям договора" },
  { value: "paid", label: "Оплачено полностью" },
  { value: "remainder", label: "Есть остаток к оплате" },
]

export const fieldClass =
  "bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 w-full"
