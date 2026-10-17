import { Act, Contract, InvoiceItem } from "@/lib/api"
import { subjectTitle } from "@/lib/contractSubject"

/** Платёж по договору, который можно выставить счётом: аванс, этап или вся сумма */
export interface ContractPayment {
  key: string
  label: string
  amount: number
}

const PCT: Record<string, [string, number][]> = {
  advance_4_stages: [["Аванс", 25], ["Этап 1", 25], ["Этап 2", 25], ["Этап 3", 25]],
  advance_3_stages: [["Аванс", 30], ["Этап 1", 40], ["Этап 2", 30]],
  advance_2_stages: [["Аванс", 50], ["Этап 1", 50]],
}

/** Варианты платежей из графика договора */
export function contractPayments(c: Contract): ContractPayment[] {
  const o = c.options || {}
  const base = o.cost_type === "fixed" && o.fixed_amount ? Number(o.fixed_amount) || 0 : Number(c.total_amount) || 0
  const list: ContractPayment[] = [{ key: "full", label: "Полная стоимость работ", amount: base }]
  if (o.payment_order !== "advance_staged") return list
  if (o.payment_schedule === "custom_schedule") {
    ;(o.custom_stages || []).forEach((s, i) =>
      list.push({ key: `s${i}`, label: s.label || `Этап ${i + 1}`, amount: Number(s.amount) || 0 }),
    )
    return list
  }
  const sched = PCT[o.payment_schedule || "advance_4_stages"] || PCT.advance_4_stages
  sched.forEach(([label, pct], i) => {
    const manual = o.schedule_amounts?.[i]
    list.push({ key: `s${i}`, label: `${label} (${pct}%)`, amount: manual ? Number(manual) || 0 : Math.round((base * pct) / 100) })
  })
  return list
}

/** Строка счёта по договору */
export function contractInvoiceItem(c: Contract, p: ContractPayment): InvoiceItem {
  const what = subjectTitle(c.options?.work_subject)
  const name =
    p.key === "full"
      ? `Работы: ${what} по Договору подряда № ${c.contract_number}`
      : `${p.label.replace(/\s*\(\d+%\)/, "")} по Договору подряда № ${c.contract_number} (${what})`
  return { name, unit: "усл.", quantity: 1, price: p.amount, amount: p.amount }
}

/** Строки счёта по акту — перечень принятых работ */
export function actInvoiceItems(a: Act): InvoiceItem[] {
  const items = (a.items || []).map((it) => {
    const qty = Number(it.quantity) || 0
    const price = Number(it.price) || 0
    return { name: it.name, unit: it.unit || "шт.", quantity: qty, price, amount: qty * price }
  })
  if (items.length) return items
  const total = Number(a.total_amount) || 0
  return [{ name: `Работы по Акту № ${a.act_number}`, unit: "усл.", quantity: 1, price: total, amount: total }]
}
