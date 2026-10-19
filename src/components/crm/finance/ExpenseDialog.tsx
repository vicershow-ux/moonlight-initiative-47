import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ExpensePayload, FinanceData, FinanceExpense, financeApi } from "@/lib/api"
import { EXPENSE_ICONS } from "./expenseMeta"
import { ExpenseFilesField } from "./ExpenseFiles"

const field = "w-full rounded-lg border border-white/10 bg-[#161616] px-3 py-2.5 text-sm text-white outline-none focus:border-[#D4AF37]/50"
const today = () => new Date().toISOString().slice(0, 10)

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  expense: FinanceExpense | null
  categories: FinanceData["categories"]
  objects: FinanceData["object_options"]
  onSaved: () => void
}

export function ExpenseDialog({ open, onOpenChange, expense, categories, objects, onSaved }: Props) {
  const [form, setForm] = useState<ExpensePayload>({ object_id: null, category: "salary", amount: 0, expense_date: today(), description: "", payee: "", attachments: [] })
  const [amount, setAmount] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    setError("")
    if (expense) {
      setForm({
        object_id: expense.object_id,
        category: expense.category,
        amount: expense.amount,
        expense_date: expense.expense_date.slice(0, 10),
        description: expense.description,
        payee: expense.payee,
        attachments: expense.attachments || [],
      })
      setAmount(String(expense.amount))
    } else {
      setForm((f) => ({ ...f, amount: 0, expense_date: today(), description: "", payee: "", attachments: [] }))
      setAmount("")
    }
  }, [open, expense])

  const set = <K extends keyof ExpensePayload>(k: K, v: ExpensePayload[K]) => setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    const value = Number(amount.replace(/\s/g, "").replace(",", "."))
    if (!value || value <= 0) {
      setError("Укажите сумму расхода")
      return
    }
    setSaving(true)
    setError("")
    try {
      await financeApi.saveExpense({ ...form, amount: value }, expense?.id)
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
          <DialogTitle>{expense ? "Изменить расход" : "Новый расход"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-white/50">Категория</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {Object.entries(categories).map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => set("category", k)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-left transition-colors ${
                    form.category === k ? "bg-[#D4AF37] text-[#161616] font-medium" : "bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  <Icon name={EXPENSE_ICONS[k] || "Circle"} size={14} />
                  <span className="truncate">{l}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-white/50">Сумма, ₽</span>
              <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="15 000" className={field} autoFocus />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-white/50">Дата</span>
              <input type="date" value={form.expense_date} onChange={(e) => set("expense_date", e.target.value)} className={field} />
            </label>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-white/50">Объект</span>
            <select value={form.object_id ?? ""} onChange={(e) => set("object_id", e.target.value ? Number(e.target.value) : null)} className={field}>
              <option value="">Общий расход компании (без объекта)</option>
              {objects.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.object_code}
                  {o.client_name ? ` · ${o.client_name}` : ""}
                </option>
              ))}
            </select>
            <span className="text-xs text-white/40">Расход по объекту уменьшит его прибыль. Общие расходы учитываются только в итоге компании.</span>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-white/50">Кому заплатили</span>
            <input value={form.payee} onChange={(e) => set("payee", e.target.value)} placeholder="Например, Иванов С. (электрик)" className={field} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-white/50">Комментарий</span>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} placeholder="За что расход" className={`${field} resize-none`} />
          </label>
          <ExpenseFilesField value={form.attachments || []} onChange={(v) => set("attachments", v)} />
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
            {expense ? "Сохранить" : "Добавить расход"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ExpenseDialog
