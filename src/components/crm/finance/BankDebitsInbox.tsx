import { useEffect, useState } from "react"
import { Link } from "@/lib/router-compat"
import Icon from "@/components/ui/icon"
import { BankDebit, FinanceData, bankApi, financeApi } from "@/lib/api"
import { EXPENSE_COLORS, EXPENSE_ICONS } from "./expenseMeta"
import { card, dateRu, rub } from "./format"

type Choice = { category: string; object_id: number | null }

const select = "rounded-lg border border-white/10 bg-[#161616] px-2.5 py-2 text-sm outline-none focus:border-[#D4AF37]/50"

/** Списания из выписки Т-Банка, ожидающие разнесения по расходам */
export function BankDebitsInbox({ data, onChanged }: { data: FinanceData; onChanged: () => void }) {
  const [items, setItems] = useState<BankDebit[]>([])
  const [connected, setConnected] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [choice, setChoice] = useState<Record<number, Choice>>({})
  const [busy, setBusy] = useState<number | "all" | "sync" | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [error, setError] = useState("")

  const load = () =>
    financeApi
      .bankInbox()
      .then((r) => {
        setConnected(r.connected)
        setItems(r.items)
        setChoice((prev) => {
          const next: Record<number, Choice> = {}
          r.items.forEach((it) => (next[it.id] = prev[it.id] || { category: it.category, object_id: it.object_id }))
          return next
        })
      })
      .catch(() => null)
      .finally(() => setLoaded(true))

  useEffect(() => {
    load()
    const h = () => load()
    window.addEventListener("bank-debits", h)
    return () => window.removeEventListener("bank-debits", h)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!loaded || !connected) return null

  const set = (id: number, patch: Partial<Choice>) => setChoice((c) => ({ ...c, [id]: { ...c[id], ...patch } }))
  const ready = items.filter((it) => choice[it.id]?.category)

  const accept = async (list: BankDebit[], key: number | "all") => {
    setBusy(key)
    setError("")
    try {
      await financeApi.acceptDebits(list.map((it) => ({ id: it.id, ...choice[it.id] })))
      await load()
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить")
    } finally {
      setBusy(null)
    }
  }

  const skip = async (id: number) => {
    setBusy(id)
    try {
      await financeApi.skipDebits([id])
      setItems((l) => l.filter((x) => x.id !== id))
    } finally {
      setBusy(null)
    }
  }

  const sync = async () => {
    setBusy("sync")
    setError("")
    try {
      await bankApi.sync()
      await load()
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось обновить выписку")
    } finally {
      setBusy(null)
    }
  }

  const visible = showAll ? items : items.slice(0, 8)
  const total = items.reduce((a, it) => a + it.amount, 0)

  return (
    <div className={`${card} flex flex-col gap-4 border-[#D4AF37]/30`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium flex items-center gap-2">
            <Icon name="Landmark" size={16} className="text-[#D4AF37]" />
            Списания с расчётного счёта
            {items.length > 0 && (
              <span className="rounded-full bg-[#D4AF37] px-2 py-0.5 text-xs font-semibold text-[#161616]">{items.length}</span>
            )}
          </p>
          <p className="mt-1 text-xs text-white/40">
            {items.length
              ? `Из выписки Т-Банка на ${rub(total)}. Проверьте категорию и объект — и добавьте в расходы.`
              : "Все списания из выписки Т-Банка разнесены по расходам."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
          <button
            onClick={sync}
            disabled={busy !== null}
            className="flex justify-center sm:justify-start min-h-[44px] sm:min-h-0 items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70 hover:bg-white/10 disabled:opacity-60"
          >
            <Icon name="RefreshCw" size={14} className={busy === "sync" ? "animate-spin" : ""} />
            Обновить
          </button>
          {ready.length > 1 && (
            <button
              onClick={() => accept(ready, "all")}
              disabled={busy !== null}
              className="flex justify-center sm:justify-start min-h-[44px] sm:min-h-0 items-center gap-1.5 rounded-lg bg-[#D4AF37] px-3 py-2 text-sm font-medium text-[#161616] hover:bg-[#B8860B] disabled:opacity-60"
            >
              {busy === "all" ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="CheckCheck" size={14} />}
              Добавить все с категорией ({ready.length})
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {items.length > 0 && (
        <div className="flex flex-col divide-y divide-white/5 -my-1">
          {visible.map((it) => {
            const c = choice[it.id] || { category: "", object_id: null }
            return (
              <div key={it.id} className="flex flex-col gap-2.5 py-3 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: `${EXPENSE_COLORS[c.category] || "#6b7280"}26`,
                      color: EXPENSE_COLORS[c.category] || "#9ca3af",
                    }}
                  >
                    <Icon name={EXPENSE_ICONS[c.category] || "CircleHelp"} size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                      <span className="font-semibold text-red-300 whitespace-nowrap">−{rub(it.amount)}</span>
                      <span className="truncate">{it.payee || "Получатель не указан"}</span>
                    </p>
                    <p className="text-xs text-white/40 line-clamp-2">
                      {dateRu(it.operation_date)}
                      {it.purpose && ` · ${it.purpose}`}
                    </p>
                    {it.remembered && (
                      <p className="mt-0.5 text-[11px] text-[#D4AF37]/80">Категория и объект — как в прошлый раз для этого получателя</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-[1fr_auto] sm:flex sm:flex-wrap items-center gap-2 lg:flex-nowrap">
                  <select value={c.category} onChange={(e) => set(it.id, { category: e.target.value })} className={`${select} col-span-2 w-full sm:w-40`}>
                    <option value="">Категория…</option>
                    {Object.entries(data.categories).map(([k, l]) => (
                      <option key={k} value={k}>
                        {l}
                      </option>
                    ))}
                  </select>
                  <select
                    value={c.object_id ?? ""}
                    onChange={(e) => set(it.id, { object_id: e.target.value ? Number(e.target.value) : null })}
                    className={`${select} col-span-2 w-full sm:w-44`}
                  >
                    <option value="">Без объекта</option>
                    {data.object_options.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.object_code}
                        {o.client_name ? ` · ${o.client_name}` : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => accept([it], it.id)}
                    disabled={!c.category || busy !== null}
                    title={c.category ? "Добавить в расходы" : "Сначала выберите категорию"}
                    className="flex h-11 sm:h-9 justify-center items-center gap-1.5 rounded-lg bg-[#D4AF37] px-3 text-sm font-medium text-[#161616] hover:bg-[#B8860B] disabled:opacity-40"
                  >
                    {busy === it.id ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Check" size={14} />}
                    В расходы
                  </button>
                  <button
                    onClick={() => skip(it.id)}
                    disabled={busy !== null}
                    title="Не расход: перевод себе, возврат и т.п."
                    className="flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-40"
                  >
                    <Icon name="EyeOff" size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {items.length > 8 && (
        <button onClick={() => setShowAll((v) => !v)} className="self-start text-sm text-[#D4AF37] hover:underline">
          {showAll ? "Свернуть" : `Показать все ${items.length}`}
        </button>
      )}

      <p className="text-[11px] text-white/30">
        Выписка подтягивается автоматически каждые 10 минут, пока открыт кабинет.{" "}
        <Link to="/cabinet/integrations/tbank" className="hover:text-white/60 underline">
          Настройки Т-Банка
        </Link>
      </p>
    </div>
  )
}

export default BankDebitsInbox
