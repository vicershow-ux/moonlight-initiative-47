import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { useAuth } from "@/contexts/AuthContext"
import { INVOICES_WEBHOOK_URL, paySettingsApi, PaySettings } from "@/lib/api"
import { Switch } from "@/components/ui/switch"

const TAX_SYSTEMS = [
  { v: 0, l: "Не указывать (как в настройках кассы)" },
  { v: 1, l: "ОСН — общая система" },
  { v: 2, l: "УСН «Доходы»" },
  { v: 3, l: "УСН «Доходы минус расходы»" },
  { v: 5, l: "ЕСХН" },
  { v: 6, l: "Патент (ПСН)" },
]

const VAT_CODES = [
  { v: 1, l: "Без НДС" },
  { v: 2, l: "НДС 0%" },
  { v: 7, l: "НДС 5%" },
  { v: 9, l: "НДС 7%" },
  { v: 3, l: "НДС 10%" },
  { v: 4, l: "НДС 20%" },
  { v: 11, l: "НДС 22%" },
  { v: 5, l: "НДС 10/110" },
  { v: 6, l: "НДС 20/120" },
  { v: 12, l: "НДС 22/122" },
]

const SUBJECTS = [
  { v: "service", l: "Услуга" },
  { v: "job", l: "Работа" },
  { v: "commodity", l: "Товар" },
  { v: "payment", l: "Платёж" },
  { v: "another", l: "Иное" },
]

const MODES = [
  { v: "auto", l: "Автоматически: аванс — «Аванс», остальное — «Полный расчёт»" },
  { v: "full_payment", l: "Полный расчёт" },
  { v: "full_prepayment", l: "Предоплата 100%" },
  { v: "prepayment", l: "Частичная предоплата" },
  { v: "advance", l: "Аванс" },
  { v: "partial_payment", l: "Частичный расчёт и кредит" },
]

const STATUS: Record<string, { l: string; c: string }> = {
  succeeded: { l: "Оплачен", c: "bg-green-500/20 text-green-300" },
  pending: { l: "Ожидает", c: "bg-white/10 text-white/60" },
  canceled: { l: "Отменён", c: "bg-red-500/20 text-red-300" },
}

const money = (v: unknown) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(Number(v) || 0) + " ₽"
const field = "w-full rounded-lg border border-white/10 bg-[#161616] px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-white/80">{label}</span>
      {children}
      {hint && <span className="text-xs text-white/40">{hint}</span>}
    </label>
  )
}

export function YookassaSettings({ onChange }: { onChange?: (s: PaySettings) => void }) {
  const { user } = useAuth()
  const canEdit = user?.role === "owner" || user?.role === "admin"
  const [s, setS] = useState<PaySettings | null>(null)
  const [secret, setSecret] = useState("")
  const [showSecret, setShowSecret] = useState(false)
  const [saving, setSaving] = useState(false)
  const [checking, setChecking] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!canEdit) return
    paySettingsApi.get().then((d) => { setS(d); onChange?.(d) }).catch((e) => setError(e instanceof Error ? e.message : "Ошибка загрузки"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit])

  const upd = (patch: Partial<PaySettings>) => setS((p) => (p ? { ...p, ...patch } : p))

  const save = async () => {
    if (!s) return
    setSaving(true)
    setMsg(null)
    try {
      const res = await paySettingsApi.save({
        enabled: s.enabled,
        shop_id: s.shop_id,
        secret_key: secret.trim() || undefined,
        receipts_enabled: s.receipts_enabled,
        tax_system_code: s.tax_system_code,
        default_vat_code: s.default_vat_code,
        use_invoice_vat: s.use_invoice_vat,
        payment_subject: s.payment_subject,
        payment_mode: s.payment_mode,
      })
      setS(res)
      onChange?.(res)
      setSecret("")
      setMsg({ ok: true, text: "Настройки сохранены" })
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Не удалось сохранить" })
    } finally {
      setSaving(false)
    }
  }

  const check = async () => {
    setChecking(true)
    setMsg(null)
    try {
      const { check: c } = await paySettingsApi.check()
      if (!c.ok) setMsg({ ok: false, text: `ЮKassa не приняла ключи: ${c.error}` })
      else
        setMsg({
          ok: true,
          text: `Подключение работает${c.test ? " (тестовый магазин)" : ""}. ${
            c.fiscalization ? "Онлайн-касса в ЮKassa подключена." : "Онлайн-касса в ЮKassa не подключена — чеки не будут формироваться."
          }`,
        })
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Проверка не удалась" })
    } finally {
      setChecking(false)
    }
  }

  const copy = async () => {
    await navigator.clipboard.writeText(INVOICES_WEBHOOK_URL)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (!canEdit) {
    return (
      <p className="text-white/50">Раздел доступен руководителю компании.</p>
    )
  }

  if (!s) {
    return (
      <>
        {error ? (
          <p className="text-red-400 text-sm">{error}</p>
        ) : (
          <div className="flex justify-center py-24">
            <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
          </div>
        )}
      </>
    )
  }

  const card = "rounded-xl border border-white/10 bg-[#1f1f1f] p-5 flex flex-col gap-4"

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-4 items-start">
        <div className="flex flex-col gap-4">
          <div className={card}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-[#0070F0]/15 flex items-center justify-center">
                  <Icon name="CreditCard" size={22} className="text-[#4A9BFF]" />
                </div>
                <div>
                  <p className="font-medium">ЮKassa</p>
                  <p className="text-xs text-white/50">Приём оплаты по счетам картой, СБП и кошельками</p>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <span className={s.enabled ? "text-green-300" : "text-white/50"}>{s.enabled ? "Включено" : "Выключено"}</span>
                <Switch checked={s.enabled} onCheckedChange={(v) => upd({ enabled: v })} />
              </label>
            </div>
            {s.from_env && (
              <p className="text-xs rounded-lg bg-white/5 px-3 py-2 text-white/60">
                Сейчас используются ключи из настроек проекта. Сохраните форму, чтобы управлять ими отсюда.
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Row label="shopId (идентификатор магазина)" hint="ЮKassa → Интеграция → Ключи API">
                <input
                  value={s.shop_id}
                  onChange={(e) => upd({ shop_id: e.target.value.replace(/\D/g, "") })}
                  inputMode="numeric"
                  placeholder="123456"
                  className={field}
                />
              </Row>
              <Row label="Секретный ключ" hint={s.has_secret ? `Сохранён: ${s.secret_key_masked}. Оставьте пустым, чтобы не менять` : "Начинается с live_ или test_"}>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder={s.has_secret ? "••••••••" : "live_..."}
                    autoComplete="new-password"
                    className={`${field} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    aria-label="Показать ключ"
                  >
                    <Icon name={showSecret ? "EyeOff" : "Eye"} size={16} />
                  </button>
                </div>
              </Row>
            </div>
            <Row label="Адрес для HTTP-уведомлений" hint="ЮKassa → Интеграция → HTTP-уведомления. Отметьте события payment.succeeded и payment.canceled">
              <div className="flex gap-2">
                <input readOnly value={INVOICES_WEBHOOK_URL} className={`${field} text-white/60 text-xs`} onFocus={(e) => e.target.select()} />
                <button onClick={copy} className="shrink-0 rounded-lg bg-white/5 hover:bg-white/10 px-3 text-sm flex items-center gap-1.5">
                  <Icon name={copied ? "Check" : "Copy"} size={14} />
                  {copied ? "Скопировано" : "Копировать"}
                </button>
              </div>
            </Row>
          </div>

          <div className={card}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium flex items-center gap-2">
                  <Icon name="ReceiptText" size={17} className="text-[#D4AF37]" />
                  Онлайн-чеки по 54-ФЗ
                </p>
                <p className="text-xs text-white/50 mt-1">
                  Чек формирует касса, подключённая в ЮKassa («Чеки от ЮKassa» или ваша онлайн-касса), и отправляет заказчику на почту
                </p>
              </div>
              <Switch checked={s.receipts_enabled} onCheckedChange={(v) => upd({ receipts_enabled: v })} />
            </div>
            {s.receipts_enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Row label="Система налогообложения">
                  <select value={s.tax_system_code} onChange={(e) => upd({ tax_system_code: Number(e.target.value) })} className={field}>
                    {TAX_SYSTEMS.map((t) => (
                      <option key={t.v} value={t.v}>
                        {t.l}
                      </option>
                    ))}
                  </select>
                </Row>
                <Row label="Ставка НДС по умолчанию" hint="Используется, если в счёте НДС не указан или выключено «брать из счёта»">
                  <select value={s.default_vat_code} onChange={(e) => upd({ default_vat_code: Number(e.target.value) })} className={field}>
                    {VAT_CODES.map((t) => (
                      <option key={t.v} value={t.v}>
                        {t.l}
                      </option>
                    ))}
                  </select>
                </Row>
                <Row label="Признак предмета расчёта">
                  <select value={s.payment_subject} onChange={(e) => upd({ payment_subject: e.target.value })} className={field}>
                    {SUBJECTS.map((t) => (
                      <option key={t.v} value={t.v}>
                        {t.l}
                      </option>
                    ))}
                  </select>
                </Row>
                <Row label="Признак способа расчёта" hint="В режиме «Автоматически» признак берётся из этапа оплаты по договору">
                  <select value={s.payment_mode} onChange={(e) => upd({ payment_mode: e.target.value })} className={field}>
                    {MODES.map((t) => (
                      <option key={t.v} value={t.v}>
                        {t.l}
                      </option>
                    ))}
                  </select>
                </Row>
                <label className="sm:col-span-2 flex items-center gap-2 text-sm text-white/80">
                  <input type="checkbox" checked={s.use_invoice_vat} onChange={(e) => upd({ use_invoice_vat: e.target.checked })} />
                  Брать ставку НДС из счёта (если в счёте выбран НДС)
                </label>
                <div className="sm:col-span-2 rounded-lg bg-white/5 px-3 py-2.5 text-xs text-white/60 leading-relaxed">
                  В чек попадает весь перечень работ из сметы договора: наименование, количество и цена каждой позиции, итог равен сумме
                  платежа. При оплате этапа цены позиций пересчитываются пропорционально, к названию добавляется этап —{" "}
                  <span className="text-white/90">«Монтаж кабеля 2.5 мм2 (аванс) — 150 × 75 ₽»</span>. Если сметы нет, в чеке одна строка:{" "}
                  <span className="text-white/90">«Электромонтажные работы — аванс по договору № 46»</span>. Для счетов по акту — позиции акта.
                </div>
              </div>
            )}
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
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] px-5 py-2.5 text-sm font-medium text-[#161616] disabled:opacity-60"
            >
              {saving && <Icon name="Loader2" size={15} className="animate-spin" />}
              Сохранить
            </button>
            <button
              onClick={check}
              disabled={checking || !s.shop_id || !s.has_secret}
              className="inline-flex items-center gap-2 rounded-lg bg-white/5 hover:bg-white/10 px-5 py-2.5 text-sm disabled:opacity-50"
              title={!s.has_secret ? "Сначала сохраните ключи" : ""}
            >
              <Icon name={checking ? "Loader2" : "PlugZap"} size={15} className={checking ? "animate-spin" : ""} />
              Проверить подключение
            </button>
          </div>
        </div>

        <div className={card}>
          <p className="font-medium flex items-center gap-2">
            <Icon name="History" size={16} className="text-[#D4AF37]" />
            Последние онлайн-платежи
          </p>
          {s.recent.length === 0 ? (
            <p className="text-sm text-white/30">Платежей пока не было</p>
          ) : (
            <div className="flex flex-col divide-y divide-white/5">
              {s.recent.map((p, i) => {
                const st = STATUS[p.status] || STATUS.pending
                return (
                  <div key={i} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate">
                        Счёт № {p.invoice_number} · {p.object_code}
                      </p>
                      <p className="text-xs text-white/40">
                        {new Date(p.paid_at || p.created_at).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        {p.receipt_sent ? " · с чеком" : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-medium">{money(p.amount)}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${st.c}`}>{st.l}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default YookassaSettings
