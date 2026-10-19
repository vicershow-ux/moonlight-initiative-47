import { ReceiptLine } from "@/lib/api"

const money = (v: number) => new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v || 0) + " ₽"
const qty = (v: number) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 3 }).format(v || 0)

/** Строки чека: наименование, количество × цена, сумма и итог */
export function ReceiptLines({ items, compact = false }: { items: ReceiptLine[]; compact?: boolean }) {
  const total = items.reduce((s, it) => s + Math.round(it.quantity * it.price * 100) / 100, 0)
  return (
    <div className={`flex flex-col ${compact ? "text-xs" : "text-sm"}`}>
      <div className="flex flex-col divide-y divide-white/5">
        {items.map((it, i) => (
          <div key={i} className="flex items-start justify-between gap-3 py-1.5">
            <div className="min-w-0">
              <p className="leading-snug">
                {i + 1}. {it.name}
              </p>
              <p className="text-white/40">
                {qty(it.quantity)} × {money(it.price)}
                {it.mode ? ` · ${it.mode}` : ""}
              </p>
            </div>
            <span className="shrink-0 whitespace-nowrap">{money(Math.round(it.quantity * it.price * 100) / 100)}</span>
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between border-t border-white/10 pt-2 font-semibold">
        <span>Итого</span>
        <span>{money(total)}</span>
      </div>
    </div>
  )
}

export default ReceiptLines
