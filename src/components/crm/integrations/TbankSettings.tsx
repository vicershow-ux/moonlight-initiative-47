import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { Switch } from "@/components/ui/switch"
import { bankApi, BankOperation, BankSettings } from "@/lib/api"

const field = "w-full rounded-lg border border-white/10 bg-[#161616] px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
const card = "rounded-xl border border-white/10 bg-[#1f1f1f] p-5 flex flex-col gap-4"
const money = (v: unknown) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(Number(v) || 0) + " ₽"
const dt = (d?: string | null) =>
  d ? new Date(d).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"

const OP_STATUS: Record<BankOperation["match_status"], { l: string; c: string }> = {
  auto: { l: "Отмечен автоматически", c: "bg-green-500/20 text-green-300" },
  manual: { l: "Привязан вручную", c: "bg-green-500/20 text-green-300" },
  suggested: { l: "Нужна проверка", c: "bg-[#D4AF37]/15 text-[#D4AF37]" },
  unmatched: { l: "Не сопоставлен", c: "bg-white/10 text-white/50" },
  ignored: { l: "Скрыт", c: "bg-white/5 text-white/30" },
}

function OperationRow({
  op,
  invoices,
  onMatch,
  onIgnore,
}: {
  op: BankOperation
  invoices: BankSettings["open_invoices"]
  onMatch: (invoiceId: number) => Promise<void>
  onIgnore: () => Promise<void>
}) {
  const [sel, setSel] = useState<number | "">(op.match_status === "suggested" && op.invoice_id ? op.invoice_id : "")
  const [busy, setBusy] = useState(false)
  const st = OP_STATUS[op.match_status] || OP_STATUS.unmatched
  const open = op.match_status === "suggested" || op.match_status === "unmatched"
  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="flex flex-col gap-2 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{op.payer_name || "Плательщик не указан"}</p>
          <p className="text-xs text-white/40">{dt(op.operation_date)}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold text-green-300">+{money(op.amount)}</p>
          <span className={`rounded-full px-2 py-0.5 text-[10px] ${st.c}`}>{st.l}</span>
        </div>
      </div>
      <p className="text-xs text-white/60 line-clamp-2">{op.purpose || "Без назначения платежа"}</p>
      {(op.match_status === "auto" || op.match_status === "manual") && op.invoice_number && (
        <p className="text-xs text-green-300/80 flex items-center gap-1">
          <Icon name="Link" size={12} />
          Счёт № {op.invoice_number}
        </p>
      )}
      {open && (
        <>
          {op.match_reason && <p className="text-xs text-white/40">{op.match_reason}</p>}
          <div className="flex flex-wrap gap-2">
            <select value={sel} onChange={(e) => setSel(e.target.value ? Number(e.target.value) : "")} className={`${field} py-1.5 flex-1 min-w-[200px]`}>
              <option value="">Выберите счёт…</option>
              {invoices.map((i) => (
                <option key={i.id} value={i.id}>
                  № {i.number} · {money(i.due)} · {i.client_name}
                </option>
              ))}
            </select>
            <button
              disabled={!sel || busy}
              onClick={() => run(() => onMatch(Number(sel)))}
              className="rounded-lg bg-[#D4AF37] px-3 py-1.5 text-sm font-medium text-[#161616] hover:bg-[#B8860B] disabled:opacity-50"
            >
              Отметить оплаченным
            </button>
            <button disabled={busy} onClick={() => run(onIgnore)} className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white/60 hover:bg-white/10">
              Не счёт
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function TbankSettings({ onChange }: { onChange?: (s: BankSettings) => void }) {
  const [s, setS] = useState<BankSettings | null>(null)
  const [token, setToken] = useState("")
  const [accounts, setAccounts] = useState<{ account_number: string; name: string; main: boolean }[]>([])
  const [busy, setBusy] = useState<"" | "save" | "accounts" | "sync">("")
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<"todo" | "all">("todo")

  const apply = (d: BankSettings) => {
    setS(d)
    onChange?.(d)
  }

  useEffect(() => {
    bankApi.get().then(apply).catch((e) => setError(e instanceof Error ? e.message : "Ошибка загрузки"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const upd = (patch: Partial<BankSettings>) => setS((p) => (p ? { ...p, ...patch } : p))

  const act = async (kind: "save" | "accounts" | "sync", fn: () => Promise<void>) => {
    setBusy(kind)
    setMsg(null)
    try {
      await fn()
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Ошибка" })
    } finally {
      setBusy("")
    }
  }

  const loadAccounts = () =>
    act("accounts", async () => {
      const r = await bankApi.accounts(token.trim() || undefined)
      setAccounts(r.accounts)
      if (r.accounts.length && s && !s.account_number) {
        upd({ account_number: (r.accounts.find((a) => a.main) || r.accounts[0]).account_number })
      }
      setMsg({ ok: true, text: r.accounts.length ? `Токен работает. Найдено рублёвых счетов: ${r.accounts.length}` : "Токен работает, но рублёвых счетов не найдено" })
    })

  const save = () =>
    act("save", async () => {
      if (!s) return
      const r = await bankApi.save({
        enabled: s.enabled,
        token: token.trim() || undefined,
        account_number: s.account_number,
        auto_mark: s.auto_mark,
        match_by_amount: s.match_by_amount,
      })
      apply(r)
      setToken("")
      setMsg({ ok: true, text: "Настройки сохранены" })
    })

  const sync = () =>
    act("sync", async () => {
      const r = await bankApi.sync()
      apply(r)
      const l = r.sync?.loaded || 0
      const m = r.sync?.marked || 0
      setMsg({ ok: true, text: l ? `Новых поступлений: ${l}. Отмечено оплаченными: ${m}` : "Новых поступлений нет" })
    })

  if (!s) {
    return error ? (
      <p className="text-sm text-red-400">{error}</p>
    ) : (
      <div className="flex justify-center py-24">
        <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
      </div>
    )
  }

  const todo = s.operations.filter((o) => o.match_status === "suggested" || o.match_status === "unmatched")
  const list = filter === "todo" ? todo : s.operations.filter((o) => o.match_status !== "ignored")

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_440px] gap-4 items-start">
      <div className="flex flex-col gap-4">
        <div className={card}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-[#FFDD2D]/15 flex items-center justify-center">
                <Icon name="Landmark" size={22} className="text-[#FFDD2D]" />
              </div>
              <div>
                <p className="font-medium">Т-Банк Бизнес</p>
                <p className="text-xs text-white/50">Сверка поступлений на расчётный счёт со счетами на оплату</p>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <span className={s.enabled ? "text-green-300" : "text-white/50"}>{s.enabled ? "Включено" : "Выключено"}</span>
              <Switch checked={s.enabled} onCheckedChange={(v) => upd({ enabled: v })} />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-white/80">Токен T-API</span>
            <div className="flex gap-2">
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder={s.has_token ? s.token_masked : "t.XXXXXXXXXXXXXXXX"}
                autoComplete="new-password"
                className={field}
              />
              <button
                onClick={loadAccounts}
                disabled={busy !== "" || (!token.trim() && !s.has_token)}
                className="shrink-0 rounded-lg bg-white/5 hover:bg-white/10 px-3 text-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <Icon name={busy === "accounts" ? "Loader2" : "PlugZap"} size={14} className={busy === "accounts" ? "animate-spin" : ""} />
                Проверить
              </button>
            </div>
            <span className="text-xs text-white/40">
              Т-Бизнес → Интеграции → T-API → «Выпустить токен». Нужны права «Информация о счетах» и «Информация об операциях». {s.has_token && "Оставьте пустым, чтобы не менять."}
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-white/80">Расчётный счёт</span>
            {accounts.length ? (
              <select value={s.account_number} onChange={(e) => upd({ account_number: e.target.value })} className={field}>
                {accounts.map((a) => (
                  <option key={a.account_number} value={a.account_number}>
                    {a.account_number} · {a.name}
                    {a.main ? " (основной)" : ""}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={s.account_number}
                onChange={(e) => upd({ account_number: e.target.value.replace(/\D/g, "").slice(0, 20) })}
                inputMode="numeric"
                placeholder="40702810..."
                className={field}
              />
            )}
            <span className="text-xs text-white/40">Нажмите «Проверить», чтобы выбрать счёт из списка</span>
          </label>

          <div className="flex flex-col gap-3 border-t border-white/5 pt-4">
            <label className="flex items-start justify-between gap-4 text-sm">
              <span>
                Отмечать счета оплаченными автоматически
                <span className="block text-xs text-white/40">Когда номер счёта и сумма в платеже совпали. Иначе поступление попадёт в список «Нужна проверка»</span>
              </span>
              <Switch checked={s.auto_mark} onCheckedChange={(v) => upd({ auto_mark: v })} />
            </label>
            <label className="flex items-start justify-between gap-4 text-sm">
              <span>
                Искать счёт по сумме, если номера нет в назначении
                <span className="block text-xs text-white/40">Срабатывает, если сумма совпадает ровно с одним счётом и плательщик похож на заказчика</span>
              </span>
              <Switch checked={s.match_by_amount} onCheckedChange={(v) => upd({ match_by_amount: v })} />
            </label>
          </div>

          {msg && (
            <p className={`text-sm flex items-start gap-2 ${msg.ok ? "text-green-300" : "text-red-400"}`}>
              <Icon name={msg.ok ? "CircleCheck" : "CircleAlert"} size={16} className="mt-0.5 shrink-0" />
              {msg.text}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={save}
              disabled={busy !== ""}
              className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] px-5 py-2.5 text-sm font-medium text-[#161616] disabled:opacity-60"
            >
              {busy === "save" && <Icon name="Loader2" size={15} className="animate-spin" />}
              Сохранить
            </button>
            <button
              onClick={sync}
              disabled={busy !== "" || !s.enabled || !s.has_token || !s.account_number}
              className="inline-flex items-center gap-2 rounded-lg bg-white/5 hover:bg-white/10 px-5 py-2.5 text-sm disabled:opacity-50"
            >
              <Icon name={busy === "sync" ? "Loader2" : "RefreshCw"} size={15} className={busy === "sync" ? "animate-spin" : ""} />
              Загрузить выписку сейчас
            </button>
          </div>
          <p className="text-xs text-white/40">
            Последняя сверка: {dt(s.last_synced_at)}. Пока кабинет открыт, выписка проверяется автоматически раз в 10 минут.
            {s.last_error && <span className="block text-red-400 mt-1">Ошибка банка: {s.last_error}</span>}
          </p>
        </div>

        <div className="rounded-lg bg-white/5 px-4 py-3 text-xs text-white/60 leading-relaxed">
          Чтобы оплата находилась автоматически, в счёте укажите назначение платежа с номером — например, «Оплата по счёту № 15». Тогда при поступлении на расчётный
          счёт счёт отметится оплаченным, обновится график платежей, вам придёт уведомление, а заказчику — письмо с благодарностью.
        </div>
      </div>

      <div className={card}>
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium flex items-center gap-2">
            <Icon name="ArrowDownToLine" size={16} className="text-[#D4AF37]" />
            Поступления
          </p>
          <div className="flex rounded-lg bg-white/5 p-0.5 text-xs">
            {(
              [
                ["todo", `Проверить${todo.length ? ` (${todo.length})` : ""}`],
                ["all", "Все"],
              ] as const
            ).map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} className={`rounded-md px-2.5 py-1 ${filter === k ? "bg-[#D4AF37] text-[#161616]" : "text-white/60"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
        {list.length === 0 ? (
          <p className="text-sm text-white/30 py-6 text-center">{filter === "todo" ? "Все поступления разобраны" : "Поступлений пока нет"}</p>
        ) : (
          <div className="flex flex-col divide-y divide-white/5 -my-3">
            {list.map((op) => (
              <OperationRow
                key={op.id}
                op={op}
                invoices={s.open_invoices}
                onMatch={async (invId) => {
                  try {
                    apply(await bankApi.match(op.id, invId))
                    setMsg({ ok: true, text: "Счёт отмечен оплаченным" })
                  } catch (e) {
                    setMsg({ ok: false, text: e instanceof Error ? e.message : "Ошибка" })
                  }
                }}
                onIgnore={async () => apply(await bankApi.ignore(op.id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TbankSettings
