import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { DeleteButton } from "@/components/ui/delete-button"
import { useAuth } from "@/contexts/AuthContext"
import { executorsApi, ExecutorPayment } from "@/lib/executorsApi"
import { formatMoney, formatDate } from "@/components/crm/documents/constants"

interface Props {
  contractId: number
  total: number
  onChanged?: () => void
}

const input =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 min-h-[44px] text-base sm:text-sm outline-none focus:border-[#D4AF37]/50"

/** Оплаты нанятому исполнителю — каждая сразу становится расходом объекта в «Финансах» */
export function ContractPaymentsCard({ contractId, total, onChanged }: Props) {
  const { user } = useAuth()
  const canPay = user?.role === "owner" || user?.role === "admin"
  const [payments, setPayments] = useState<ExecutorPayment[]>([])
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const load = () =>
    executorsApi
      .payments({ contract_id: contractId })
      .then((d) => setPayments(d.payments || []))
      .catch(() => setPayments([]))

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId])

  const paid = payments.reduce((s, p) => s + p.amount, 0)
  const left = Math.max(0, total - paid)

  const add = async () => {
    const value = Number(amount.replace(",", ".").replace(/\s/g, ""))
    if (!value || value <= 0) {
      setError("Укажите сумму")
      return
    }
    setBusy(true)
    setError("")
    try {
      await executorsApi.addPayment({ contract_id: contractId, amount: value, payment_date: date, note })
      setAmount("")
      setNote("")
      await load()
      onChanged?.()
    } catch (e) {
      setError((e as Error)?.message || "Не удалось сохранить оплату")
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id: number) => {
    await executorsApi.removePayment(id).catch(() => null)
    await load()
    onChanged?.()
  }

  return (
    <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="font-medium flex items-center gap-2">
          <Icon name="Banknote" size={16} className="text-[#D4AF37]" />
          Оплаты исполнителю
        </p>
        <span className="text-xs text-white/40">попадают в расходы объекта</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="rounded-lg bg-[#161616] p-2">
          <p className="text-[11px] text-white/40">По договору</p>
          <p className="text-sm font-medium">{formatMoney(total)}</p>
        </div>
        <div className="rounded-lg bg-[#161616] p-2">
          <p className="text-[11px] text-white/40">Оплачено</p>
          <p className="text-sm font-medium text-emerald-400">{formatMoney(paid)}</p>
        </div>
        <div className="rounded-lg bg-[#161616] p-2">
          <p className="text-[11px] text-white/40">Осталось</p>
          <p className="text-sm font-medium text-[#D4AF37]">{formatMoney(left)}</p>
        </div>
      </div>

      {payments.length > 0 && (
        <ul className="mb-4 divide-y divide-white/5">
          {payments.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-2 text-sm">
              <span className="text-white/50 w-20 shrink-0">{formatDate(p.expense_date)}</span>
              <span className="flex-1 min-w-0 truncate text-white/60" title={p.description}>
                {p.description.replace(/^Оплата исполнителю по договору № [^—]+(— )?/, "") || "Оплата"}
              </span>
              <span className="font-medium shrink-0">{formatMoney(p.amount)}</span>
              {canPay && <DeleteButton onConfirm={() => remove(p.id)} />}
            </li>
          ))}
        </ul>
      )}

      {canPay ? (
        <div className="grid grid-cols-2 sm:grid-cols-[1fr_150px_1fr_auto] gap-2">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.,\s]/g, ""))}
            inputMode="decimal"
            placeholder={left ? `Сумма, напр. ${Math.round(left)}` : "Сумма"}
            className={input}
          />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={input} />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Комментарий: аванс, этап…" className={`${input} col-span-2 sm:col-span-1`} />
          <button
            onClick={add}
            disabled={busy}
            className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] text-[#161616] text-sm font-medium disabled:opacity-60"
          >
            <Icon name={busy ? "Loader2" : "Plus"} size={15} className={busy ? "animate-spin" : ""} />
            Внести оплату
          </button>
        </div>
      ) : (
        <p className="text-xs text-white/40">Оплаты вносит руководитель</p>
      )}
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  )
}

export default ContractPaymentsCard
