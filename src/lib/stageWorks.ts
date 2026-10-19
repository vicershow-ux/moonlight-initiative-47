import { ActItem, EstimateItem } from "@/lib/api"

const floor2 = (v: number) => Math.floor(v * 100 + 1e-6) / 100
const round2 = (v: number) => Math.round(v * 100) / 100

/** Название этапа без процента: «Аванс (50%)» → «Аванс» */
export const stageName = (label: string) => label.replace(/\s*\(\d+%\)/, "").trim()

/**
 * Перечень работ сметы на сумму этапа — тот же расчёт, что в счёте и чеке:
 * количество как в смете, цена пропорциональна доле этапа, копейки — в отдельной строке.
 */
export function stageWorks(estimateItems: EstimateItem[], total: number, stageLabel: string): ActItem[] {
  let rows = estimateItems
    .filter((it) => !it.status || it.status === "approved")
    .map((it) => ({
      name: String(it.name || "Работы").trim(),
      unit: it.unit || "усл.",
      qty: Number(it.quantity || 0) * (Number(it.times) || 1),
      amount: Number(it.amount) || 0,
      category: it.category || "",
      room_name: it.room_name || "",
    }))
    .map((r) => ({ ...r, qty: Math.round(r.qty * 1000) / 1000 }))
    .filter((r) => r.qty > 0 && r.amount > 0)
  const base = rows.reduce((s, r) => s + r.amount, 0)
  if (!rows.length || base <= 0 || total <= 0) return []
  if (rows.length > 100) {
    const groups = new Map<string, (typeof rows)[number]>()
    rows.forEach((r) => {
      const key = r.category || "Прочие работы"
      const g = groups.get(key) || { name: key, unit: "усл.", qty: 1, amount: 0, category: key, room_name: "" }
      g.amount += r.amount
      groups.set(key, g)
    })
    rows = [...groups.values()].slice(0, 100)
  }
  const k = total / base
  const stage = stageName(stageLabel)
  const suffix = stage && Math.abs(k - 1) > 0.0001 ? ` (${stage.toLowerCase()})` : ""
  const lines = rows
    .map((r) => ({ ...r, name: r.name.slice(0, 128 - suffix.length) + suffix, price: floor2((r.amount * k) / r.qty) }))
    .filter((r) => r.price > 0)
  if (!lines.length) return []
  const diff = round2(total - lines.reduce((s, l) => s + round2(l.qty * l.price), 0))
  if (Math.abs(diff) >= 0.01) {
    const ones = lines.filter((l) => l.qty === 1 && l.price + diff > 0)
    const whole = lines.filter((l) => l.qty > 1 && Number.isInteger(l.qty) && l.price + diff > 0)
    if (ones.length) {
      const l = ones[ones.length - 1]
      l.price = round2(l.price + diff)
    } else if (whole.length && lines.length < 100) {
      const l = whole[whole.length - 1]
      l.qty -= 1
      lines.splice(lines.indexOf(l) + 1, 0, { ...l, qty: 1, price: round2(l.price + diff) })
    } else {
      return []
    }
  }
  return lines.map((l) => ({
    name: l.name,
    unit: l.unit,
    quantity: l.qty,
    price: l.price,
    amount: round2(l.qty * l.price),
    category: l.category,
    room_name: l.room_name,
  }))
}
