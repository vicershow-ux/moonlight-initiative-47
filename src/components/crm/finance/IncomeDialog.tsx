import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FinanceData, FinanceIncome, IncomePayload, financeApi } from "@/lib/api"
import { INCOME_ICONS } from "./incomeMeta"

const field = "w-full rounded-lg border border-white/10 bg-[#161616] px-3 py-2.5 text-sm text-white outline-none focus:border-[#D4AF37]/50"
const today = () => new Date().toISOString().slice(0, 10)

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  income: FinanceIncome | null
  categories: FinanceData["income_categories"]
  objects: FinanceData["object_options"]
  onSaved: () => void
}

export function IncomeDialog({ open, onOpenChange, income, categories, objects, onSaved }: Props) {
  const [form, setForm] = useState<IncomePayload>({ object_id: null, category: "cash", amount: 0, income_date: today(), description: "", payer: "" })
  const [amount, setAmount] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    setError("")
    if (income) {
      setForm({
        object_id: income.object_id,
        category: income.category,
        amount: income.amount,
        income_date: String(income.income_date).slice(0, 10),
        description: income.description,
        payer: income.payer,
      })
      setAmount(String(income.amount))
    } else {
      setForm((f) => ({ ...f, amount: 0, income_date: today(), description: "", payer: "" }))
      setAmount("")
    }
  }, [open, income])

  const set = <K extends keyof IncomePayload>(k: K, v: IncomePayload[K]) => setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    const value = Number(amount.replace(/\s/g, "").replace(",", "."))
    if (!value || value <= 0) {
      setError("Укажите сумму дохода")
      return
    }
    setSaving(true)
    setError("")
    try {
      await financeApi.saveIncome({ ...form, amount: value }, income?.id)
      onSaved()
      onOpenChange(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto border-white/10 bg-[#1f1f1f] text-white">
        <DialogHeader>
          <DialogTitle>{income ? "Изменить доход" : "Новый доход"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p className="text-xs text-white/40">
            Оплаты по счетам и аренда попадают в доходы сами. Здесь — деньги, которые пришли без счёта: наличные, переводы, авансы.
          </p>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-white/50">Вид дохода</span>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(categories).map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => set("category", k)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-left transition-colors ${
                    form.category === k ? "bg-[#D4AF37] text-[#161616] font-medium" : "bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  <Icon name={INCOME_ICONS[k] || "Circle"} size={14} />
                  <span className="truncate">{l}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-white/50">Сумма, ₽</span>
              <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="50 000" className={field} autoFocus />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-white/50">Дата</span>
              <input type="date" value={form.income_date} onChange={(e) => set("income_date", e.target.value)} className={field} />
            </label>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-white/50">Объект</span>
            <select value={form.object_id ?? ""} onChange={(e) => set("object_id", e.target.value ? Number(e.target.value) : null)} className={field}>
              <option value="">Общий доход компании (без объекта)</option>
              {objects.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.object_code}
                  {o.client_name ? ` · ${o.client_name}` : ""}
                </option>
              ))}
            </select>
            <span className="text-xs text-white/40">Доход по объекту увеличит его прибыль.</span>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-white/50">От кого</span>
            <input value={form.payer} onChange={(e) => set("payer", e.target.value)} placeholder="Например, Петров А. (заказчик)" className={field} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-white/50">Комментарий</span>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} placeholder="За что получены деньги" className={`${field} resize-none`} />
          </label>
          {error && (
            <p className="flex items-center gap-1.5 text-sm text-red-400">
              <Icon name="CircleAlert" size={15} />
              {error}
            </p>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-3 text-sm font-medium text-[#161616] hover:bg-[#B8860B] disabled:opacity-60"
          >
            {saving ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Check" size={15} />}
            {income ? "Сохранить" : "Добавить доход"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default IncomeDialog
