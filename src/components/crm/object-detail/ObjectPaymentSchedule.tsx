import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { objectHubApi, ObjectPayment } from "@/lib/api"

const n = (v: unknown) => {
  const x = typeof v === "string" ? parseFloat(v.replace(",", ".").replace(/\s/g, "")) : Number(v)
  return Number.isFinite(x) ? x : 0
}
const money = (v: unknown) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n(v)) + " ₽"
const dateLabel = (d?: string | null) => (d ? new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" }) : "—")
const today = () => new Date().toISOString().slice(0, 10)

const TEMPLATE: ObjectPayment[] = [
  { title: "Аванс перед началом работ", amount: "", due_date: null, paid_amount: 0, paid_at: null },
  { title: "Черновые работы", amount: "", due_date: null, paid_amount: 0, paid_at: null },
  { title: "Чистовые работы", amount: "", due_date: null, paid_amount: 0, paid_at: null },
  { title: "Сдача объекта", amount: "", due_date: null, paid_amount: 0, paid_at: null },
]

function statusOf(p: ObjectPayment) {
  const amount = n(p.amount)
  const paid = n(p.paid_amount)
  if (amount > 0 && paid >= amount) return { label: "Оплачено", cls: "bg-green-500/20 text-green-300", icon: "CircleCheck" }
  if (paid > 0) return { label: "Частично", cls: "bg-blue-500/20 text-blue-300", icon: "CircleDot" }
  if (p.due_date && p.due_date.slice(0, 10) < today()) return { label: "Просрочено", cls: "bg-red-500/20 text-red-300", icon: "CircleAlert" }
  return { label: "Ожидается", cls: "bg-white/10 text-white/60", icon: "Circle" }
}

export function ObjectPaymentSchedule({ objectId, isClient, suggestedTotal }: { objectId: number; isClient: boolean; suggestedTotal?: number }) {
  const [rows, setRows] = useState<ObjectPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<ObjectPayment[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    objectHubApi
      .payments(objectId)
      .then((d) => setRows(d.payments || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [objectId])

  const total = rows.reduce((s, r) => s + n(r.amount), 0)
  const paid = rows.reduce((s, r) => s + Math.min(n(r.paid_amount), n(r.amount) || n(r.paid_amount)), 0)
  const left = Math.max(0, total - paid)
  const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0
  const next = rows.find((r) => n(r.paid_amount) < n(r.amount))

  const startEdit = () => {
    setDraft(rows.length ? rows.map((r) => ({ ...r, due_date: r.due_date?.slice(0, 10) || null, paid_at: r.paid_at?.slice(0, 10) || null })) : TEMPLATE.map((r) => ({ ...r })))
    setEditing(true)
    setError("")
  }

  const upd = (i: number, patch: Partial<ObjectPayment>) => setDraft((d) => d.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  const splitEvenly = () => {
    if (!suggestedTotal || !draft.length) return
    const part = Math.floor(suggestedTotal / draft.length)
    setDraft((d) => d.map((r, i) => ({ ...r, amount: i === d.length - 1 ? suggestedTotal - part * (d.length - 1) : part })))
  }

  const save = async () => {
    setSaving(true)
    setError("")
    try {
      const res = await objectHubApi.savePayments(
        objectId,
        draft.filter((r) => r.title.trim()).map((r) => ({ ...r, amount: n(r.amount), paid_amount: n(r.paid_amount) })),
      )
      setRows(res.payments)
      setEditing(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить")
    } finally {
      setSaving(false)
    }
  }

  const input = "bg-[#161616] border border-white/10 rounded-lg px-2.5 py-2 text-sm outline-none focus:border-[#D4AF37]/50 w-full"

  return (
    <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="font-medium flex items-center gap-2">
          <Icon name="CalendarClock" size={17} className="text-[#D4AF37]" />
          График платежей
        </p>
        {!isClient && !editing && (
          <button onClick={startEdit} className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 hover:bg-white/10 px-3 py-2 text-sm">
            <Icon name={rows.length ? "Pencil" : "Plus"} size={14} />
            {rows.length ? "Изменить" : "Составить график"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Icon name="Loader2" size={20} className="animate-spin text-white/40" />
        </div>
      ) : editing ? (
        <div className="flex flex-col gap-3">
          {draft.map((r, i) => (
            <div key={i} className="rounded-lg border border-white/10 bg-[#161616]/60 p-3 grid grid-cols-2 sm:grid-cols-[2fr_1fr_1fr] gap-2">
              <input value={r.title} onChange={(e) => upd(i, { title: e.target.value })} placeholder="Этап" className={`${input} col-span-2 sm:col-span-1`} />
              <label className="flex flex-col gap-1 text-[11px] text-white/40">
                Сумма, ₽
                <input value={String(r.amount ?? "")} inputMode="decimal" onChange={(e) => upd(i, { amount: e.target.value })} className={input} />
              </label>
              <label className="flex flex-col gap-1 text-[11px] text-white/40">
                Срок оплаты
                <input type="date" value={r.due_date || ""} onChange={(e) => upd(i, { due_date: e.target.value || null })} className={input} />
              </label>
              <label className="flex flex-col gap-1 text-[11px] text-white/40 sm:col-start-2">
                Оплачено, ₽
                <div className="flex gap-1">
                  <input
                    value={String(r.paid_amount ?? "")}
                    inputMode="decimal"
                    onChange={(e) => upd(i, { paid_amount: e.target.value, paid_at: r.paid_at || today() })}
                    className={input}
                  />
                  <button
                    type="button"
                    title="Отметить полностью оплаченным"
                    onClick={() => upd(i, { paid_amount: r.amount, paid_at: r.paid_at || today() })}
                    className="shrink-0 w-9 rounded-lg bg-green-500/15 text-green-300 hover:bg-green-500/25 flex items-center justify-center"
                  >
                    <Icon name="Check" size={15} />
                  </button>
                </div>
              </label>
              <label className="flex flex-col gap-1 text-[11px] text-white/40">
                Дата оплаты
                <div className="flex gap-1">
                  <input type="date" value={r.paid_at || ""} onChange={(e) => upd(i, { paid_at: e.target.value || null })} className={input} />
                  <button
                    type="button"
                    title="Удалить этап"
                    onClick={() => setDraft((d) => d.filter((_, j) => j !== i))}
                    className="shrink-0 w-9 rounded-lg bg-white/5 text-white/50 hover:text-red-400 flex items-center justify-center"
                  >
                    <Icon name="Trash2" size={15} />
                  </button>
                </div>
              </label>
            </div>
          ))}
          <div className="flex flex-wrap gap-3 text-sm">
            <button
              onClick={() => setDraft((d) => [...d, { title: "", amount: "", due_date: null, paid_amount: 0, paid_at: null }])}
              className="inline-flex items-center gap-1.5 text-[#D4AF37] hover:underline"
            >
              <Icon name="Plus" size={14} />
              Добавить этап
            </button>
            {suggestedTotal ? (
              <button onClick={splitEvenly} className="inline-flex items-center gap-1.5 text-white/60 hover:text-white">
                <Icon name="Divide" size={14} />
                Разделить {money(suggestedTotal)} поровну
              </button>
            ) : null}
            <span className="ml-auto text-white/50">Итого: {money(draft.reduce((s, r) => s + n(r.amount), 0))}</span>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] px-4 py-2 text-sm font-medium text-[#161616] disabled:opacity-60"
            >
              {saving && <Icon name="Loader2" size={15} className="animate-spin" />}
              Сохранить график
            </button>
            <button onClick={() => setEditing(false)} className="rounded-lg bg-white/5 hover:bg-white/10 px-4 py-2 text-sm">
              Отмена
            </button>
          </div>
        </div>
      ) : rows.length === 0 ? (
        <p className="text-center py-8 text-white/30 text-sm">
          {isClient ? "График платежей появится после согласования сметы" : "График ещё не составлен"}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <p className="text-xs text-white/40">Всего</p>
              <p className="font-semibold">{money(total)}</p>
            </div>
            <div>
              <p className="text-xs text-white/40">Оплачено</p>
              <p className="font-semibold text-green-300">{money(paid)}</p>
            </div>
            <div>
              <p className="text-xs text-white/40">Осталось</p>
              <p className="font-semibold text-[#D4AF37]">{money(left)}</p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-4">
            <div className="h-full bg-green-400 transition-all" style={{ width: `${pct}%` }} />
          </div>
          {next && (
            <p className="text-xs text-white/50 mb-3">
              Следующий платёж: <span className="text-white">{next.title}</span> — {money(n(next.amount) - n(next.paid_amount))}
              {next.due_date ? ` до ${dateLabel(next.due_date)}` : ""}
            </p>
          )}
          <div className="flex flex-col divide-y divide-white/5 rounded-lg border border-white/10">
            {rows.map((r) => {
              const st = statusOf(r)
              return (
                <div key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2.5">
                  <Icon name={st.icon} size={16} className={st.cls.split(" ")[1]} />
                  <div className="flex-1 min-w-[140px]">
                    <p className="text-sm">{r.title}</p>
                    <p className="text-xs text-white/40">
                      срок {dateLabel(r.due_date)}
                      {n(r.paid_amount) > 0 && r.paid_at ? ` · оплачено ${dateLabel(r.paid_at)}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{money(r.amount)}</p>
                    {n(r.paid_amount) > 0 && n(r.paid_amount) < n(r.amount) && (
                      <p className="text-xs text-white/40">внесено {money(r.paid_amount)}</p>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${st.cls}`}>{st.label}</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default ObjectPaymentSchedule
