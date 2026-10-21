import { useEffect, useMemo, useState } from "react"
import Icon from "@/components/ui/icon"
import { estimatesApi, Estimate, servicesApi, ServiceItem } from "@/lib/api"

const money = (n: unknown) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Number(n) || 0) + " ₽"

const statusView: Record<string, { label: string; cls: string }> = {
  pending: { label: "На согласовании", cls: "bg-orange-500/20 text-orange-300" },
  approved: { label: "Согласовано", cls: "bg-green-500/20 text-green-300" },
  rejected: { label: "Отклонено", cls: "bg-red-500/20 text-red-300" },
}

interface Props {
  estimate: Estimate
  isClient: boolean
  onChanged: () => void
}

export function ExtraWorksPanel({ estimate, isClient, onChanged }: Props) {
  const [adding, setAdding] = useState(false)
  const [services, setServices] = useState<ServiceItem[]>([])
  const [query, setQuery] = useState("")
  const [picked, setPicked] = useState<ServiceItem | null>(null)
  const [custom, setCustom] = useState(false)
  const [name, setName] = useState("")
  const [unit, setUnit] = useState("шт")
  const [qty, setQty] = useState("1")
  const [comment, setComment] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [busyId, setBusyId] = useState<number | null>(null)
  const [prices, setPrices] = useState<Record<number, string>>({})

  const extras = (estimate.items || []).filter((it) => it.proposed_by)

  useEffect(() => {
    if (!adding || services.length) return
    servicesApi.list().then((d) => setServices((d.services || []).filter((s) => s.is_active && Number(s.price) > 0)))
  }, [adding, services.length])

  const found = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []
    return services.filter((s) => `${s.name} ${s.category}`.toLowerCase().includes(q)).slice(0, 30)
  }, [query, services])

  const reset = () => {
    setAdding(false)
    setPicked(null)
    setCustom(false)
    setQuery("")
    setName("")
    setUnit("шт")
    setQty("1")
    setComment("")
    setError("")
  }

  const submit = async () => {
    setError("")
    const quantity = Number(qty.replace(",", "."))
    if (!quantity || quantity <= 0) return setError("Укажите количество")
    if (!picked && (!custom || name.trim().length < 2)) return setError("Выберите работу из прайса или опишите свою")
    setSaving(true)
    try {
      await estimatesApi.propose({
        estimate_id: estimate.id,
        quantity,
        service_id: picked?.id,
        name: picked ? undefined : name.trim(),
        unit: picked ? undefined : unit.trim() || "шт",
        price: 0,
        comment: comment.trim() || undefined,
      })
      reset()
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось отправить")
    } finally {
      setSaving(false)
    }
  }

  const moderate = async (itemId: number, approve: boolean, needPrice = false) => {
    const price = Number((prices[itemId] || "").replace(",", "."))
    if (approve && needPrice && !(price > 0)) {
      setPrices((p) => ({ ...p, [itemId]: p[itemId] ?? "" }))
      return
    }
    setBusyId(itemId)
    try {
      await (approve ? estimatesApi.approveItem(itemId, needPrice ? price : undefined) : estimatesApi.rejectItem(itemId))
      onChanged()
    } finally {
      setBusyId(null)
    }
  }

  if (!isClient && extras.length === 0) return null

  const pendingSum = extras.filter((x) => x.status === "pending").reduce((s, x) => s + Number(x.amount || 0), 0)

  return (
    <div className="bg-[#1f1f1f] border border-white/10 rounded-xl mb-4 p-3 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <p className="font-medium flex items-center gap-2">
            <Icon name="ListPlus" size={16} className="text-[#D4AF37]" />
            Дополнительные работы
          </p>
          <p className="text-xs text-white/40 mt-0.5">
            {isClient
              ? "Нужно что-то ещё в процессе ремонта? Добавьте работу — она попадёт в смету после согласования"
              : "Предложения заказчика: согласуйте или отклоните — сумма сметы пересчитается"}
          </p>
        </div>
        {isClient && !adding && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex w-full sm:w-auto justify-center min-h-[44px] sm:min-h-0 items-center gap-2 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] px-3.5 py-2 text-sm font-medium text-[#161616] transition-colors"
          >
            <Icon name="Plus" size={16} />
            Добавить работу
          </button>
        )}
      </div>

      {adding && (
        <div className="rounded-lg border border-white/10 bg-[#161616] p-3 sm:p-4 mb-3 flex flex-col gap-3">
          {!picked && !custom && (
            <>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Найдите работу в прайсе: например, розетка"
                className="w-full bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
              />
              {found.length > 0 && (
                <div className="max-h-60 overflow-y-auto rounded-lg border border-white/10 divide-y divide-white/5">
                  {found.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setPicked(s)}
                      className="w-full flex items-start justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-white/5"
                    >
                      <span className="min-w-0">
                        <span className="block break-words">{s.name}</span>
                        <span className="block text-xs text-white/40">{s.category}</span>
                      </span>
                      <span className="whitespace-nowrap text-white/70">
                        {money(s.price)} / {s.unit}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {query.trim().length >= 2 && found.length === 0 && (
                <p className="text-xs text-white/40">В прайсе ничего не нашлось</p>
              )}
              <button onClick={() => setCustom(true)} className="self-start text-xs text-[#D4AF37] hover:underline">
                Нужной работы нет в прайсе — описать свою
              </button>
            </>
          )}

          {picked && (
            <div className="flex items-start justify-between gap-3 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3 py-2">
              <div className="text-sm">
                <p>{picked.name}</p>
                <p className="text-xs text-white/50">
                  {money(picked.price)} / {picked.unit}
                </p>
              </div>
              <button onClick={() => setPicked(null)} className="text-white/40 hover:text-white" aria-label="Выбрать другую">
                <Icon name="X" size={16} />
              </button>
            </div>
          )}

          {custom && !picked && (
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_90px] gap-2">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Что нужно сделать"
                className="bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
              />
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="ед."
                className="bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
              />
              <p className="sm:col-span-2 text-xs text-white/40">Стоимость рассчитает прораб при согласовании</p>
            </div>
          )}

          {(picked || custom) && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-xs text-white/50">Количество</label>
                <input
                  value={qty}
                  inputMode="decimal"
                  onChange={(e) => setQty(e.target.value.replace(/[^\d.,]/g, ""))}
                  className="w-24 bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"
                />
                <span className="text-xs text-white/50">{picked?.unit || unit}</span>
                {picked && (
                  <span className="ml-auto text-sm font-medium">
                    ≈ {money(Number(picked.price) * (Number(qty.replace(",", ".")) || 0))}
                  </span>
                )}
              </div>
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Комментарий: где и что именно (необязательно)"
                className="bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
              />
            </>
          )}

          {error && (
            <p className="text-sm text-red-400 flex items-center gap-1.5">
              <Icon name="CircleAlert" size={15} />
              {error}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            {(picked || custom) && (
              <button
                onClick={submit}
                disabled={saving}
                className="inline-flex w-full sm:w-auto justify-center min-h-[44px] sm:min-h-0 items-center gap-2 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] px-4 py-2 text-sm font-medium text-[#161616] disabled:opacity-60"
              >
                {saving && <Icon name="Loader2" size={15} className="animate-spin" />}
                Отправить на согласование
              </button>
            )}
            <button onClick={reset} className="w-full sm:w-auto min-h-[44px] sm:min-h-0 rounded-lg bg-white/5 hover:bg-white/10 px-4 py-2 text-sm">
              Отмена
            </button>
          </div>
        </div>
      )}

      {extras.length > 0 ? (
        <div className="flex flex-col divide-y divide-white/5 rounded-lg border border-white/10">
          {extras.map((it) => {
            const st = statusView[it.status || "pending"]
            return (
              <div key={it.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm break-words">{it.name}</p>
                  <p className="text-xs text-white/40">
                    {Number(it.quantity)} {it.unit}
                    {Number(it.price) > 0 ? ` × ${money(it.price)}` : " · цена уточняется"}
                    {!isClient && it.proposed_by_name ? ` · от ${it.proposed_by_name}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <span className="text-sm font-medium whitespace-nowrap">{Number(it.amount) > 0 ? money(it.amount) : "—"}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${st.cls}`}>{st.label}</span>
                  {!isClient && it.status === "pending" && it.id && (
                    <span className="flex gap-1 items-center w-full sm:w-auto">
                      {Number(it.price) <= 0 && (
                        <input
                          value={prices[it.id] ?? ""}
                          inputMode="decimal"
                          onChange={(e) => setPrices((p) => ({ ...p, [it.id as number]: e.target.value.replace(/[^\d.,]/g, "") }))}
                          placeholder={`цена за ${it.unit}`}
                          className="flex-1 sm:flex-none min-w-0 sm:w-28 min-h-[44px] sm:min-h-0 bg-[#161616] border border-white/10 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#D4AF37]/50"
                        />
                      )}
                      <button
                        onClick={() => moderate(it.id as number, true, Number(it.price) <= 0)}
                        disabled={busyId === it.id}
                        title="Согласовать"
                        className="w-11 h-11 sm:w-8 sm:h-8 rounded-lg bg-green-500/15 text-green-300 hover:bg-green-500/25 flex items-center justify-center disabled:opacity-50"
                      >
                        <Icon name="Check" size={15} />
                      </button>
                      <button
                        onClick={() => moderate(it.id as number, false)}
                        disabled={busyId === it.id}
                        title="Отклонить"
                        className="w-11 h-11 sm:w-8 sm:h-8 rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/25 flex items-center justify-center disabled:opacity-50"
                      >
                        <Icon name="X" size={15} />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )
          })}
          {pendingSum > 0 && (
            <p className="px-3 py-2 text-xs text-white/50">Ожидает согласования на сумму {money(pendingSum)}</p>
          )}
        </div>
      ) : (
        !adding && <p className="text-sm text-white/30">Дополнительных работ пока нет</p>
      )}
    </div>
  )
}

export default ExtraWorksPanel
