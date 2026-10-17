import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { workCart, useWorkCart } from "@/hooks/useWorkCart"

interface Props {
  name: string
  category: string
  unit: string
  price: number
}

export function WorkQtyControl({ name, category, unit, price }: Props) {
  const { qtyOf } = useWorkCart()
  const qty = qtyOf({ name, category })
  const [text, setText] = useState(qty ? String(qty) : "")

  useEffect(() => {
    setText(qty ? String(qty) : "")
  }, [qty])

  const work = { name, category, unit, price }
  const step = 1

  if (!qty) {
    return (
      <button
        type="button"
        onClick={() => workCart.set(work, 1)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:border-[#D4AF37] hover:text-[#B8962E] transition-colors"
      >
        <Icon name="Plus" size={14} />
        Выбрать
      </button>
    )
  }

  const commit = () => {
    const v = Number(text.replace(",", "."))
    workCart.set(work, isFinite(v) ? v : 0)
  }

  return (
    <div className="inline-flex items-center rounded-full border border-[#D4AF37] bg-[#D4AF37]/10">
      <button
        type="button"
        onClick={() => workCart.set(work, qty - step)}
        className="w-8 h-8 flex items-center justify-center hover:text-[#B8962E]"
        aria-label="Меньше"
      >
        <Icon name={qty - step <= 0 ? "Trash2" : "Minus"} size={14} />
      </button>
      <input
        value={text}
        inputMode="decimal"
        onChange={(e) => setText(e.target.value.replace(/[^\d.,]/g, ""))}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        className="w-12 bg-transparent text-center text-sm font-medium outline-none"
        aria-label="Количество"
      />
      <button
        type="button"
        onClick={() => workCart.set(work, qty + step)}
        className="w-8 h-8 flex items-center justify-center hover:text-[#B8962E]"
        aria-label="Больше"
      >
        <Icon name="Plus" size={14} />
      </button>
    </div>
  )
}

export default WorkQtyControl
