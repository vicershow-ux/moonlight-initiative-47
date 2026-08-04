import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import {
  actsApi,
  contractsApi,
  estimatesApi,
  objectsApi,
  ActItem,
  ActOptions,
  Contract,
  Estimate,
  ObjectItem,
} from "@/lib/api"

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v)
  return Number.isFinite(n) ? n : fallback
}

const formatMoney = (n: unknown) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(num(n)) + " ₽"

const ACT_TYPES = [
  { value: "acceptance", label: "Акт сдачи-приёмки выполненных работ" },
  { value: "intermediate", label: "Промежуточный акт выполненных работ" },
  { value: "hidden_works", label: "Акт освидетельствования скрытых работ" },
  { value: "defect", label: "Дефектный акт" },
]

const SCOPE_OPTIONS = [
  { value: "all", label: "Все работы, перечисленные в акте" },
  { value: "stage", label: "Отдельный этап работ" },
]

const INSPECTION_OPTIONS = [
  { value: "", label: "Выберите результат осмотра" },
  { value: "no_defects", label: "Без замечаний" },
  { value: "minor_defects", label: "Незначительные недостатки" },
  { value: "defects", label: "Есть замечания" },
]

const CALCULATION_OPTIONS = [
  { value: "contract", label: "По условиям договора" },
  { value: "paid", label: "Оплачено полностью" },
  { value: "remainder", label: "Есть остаток к оплате" },
]

const fieldClass =
  "bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 w-full"

export default function ActCreate() {
  const { id } = useParams()
  const objectId = Number(id)
  const [searchParams] = useSearchParams()
  const contractIdParam = searchParams.get("contract_id")
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [object, setObject] = useState<ObjectItem | null>(null)
  const [contract, setContract] = useState<Contract | null>(null)
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [selectedEstimateId, setSelectedEstimateId] = useState<number | null>(null)

  const [actType, setActType] = useState("acceptance")
  const [actDate, setActDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [options, setOptions] = useState<ActOptions>({
    period_from: "",
    period_to: "",
    scope: "all",
    inspection_result: "",
    calculation: "contract",
    appendix: "",
  })

  const [items, setItems] = useState<ActItem[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [previewHtml, setPreviewHtml] = useState("")

  useEffect(() => {
    setLoading(true)
    Promise.all([
      objectsApi.get(objectId).catch(() => null),
      estimatesApi.listByObject(objectId).then((d) => d.estimates).catch(() => []),
      contractIdParam ? contractsApi.get(Number(contractIdParam)).catch(() => null) : Promise.resolve(null),
    ])
      .then(([obj, ests, contr]) => {
        setObject(obj)
        setEstimates(ests)
        setContract(contr)
        const preferred = contr?.estimate_id || ests[0]?.id || null
        setSelectedEstimateId(preferred)
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectId, contractIdParam])

  const setOpt = (key: keyof ActOptions, value: string) =>
    setOptions((prev) => ({ ...prev, [key]: value }))

  const total = useMemo(
    () => items.filter((_, i) => selected.has(i)).reduce((sum, it) => sum + num(it.amount), 0),
    [items, selected]
  )

  const goToWorks = async () => {
    setError("")
    if (!selectedEstimateId) {
      setError("Выберите смету, из которой подобрать работы")
      return
    }
    setSaving(true)
    try {
      const full = await estimatesApi.get(selectedEstimateId)
      const estItems: ActItem[] = (full.items || []).map((it) => ({
        name: it.name,
        unit: it.unit,
        price: num(it.price),
        quantity: num(it.quantity),
        amount: num(it.amount),
        room_name: it.room_name || "",
        category: it.category || "",
      }))
      setItems(estItems)
      setSelected(new Set(estItems.map((_, i) => i)))
      setStep(2)
    } catch {
      setError("Не удалось загрузить работы из сметы")
    } finally {
      setSaving(false)
    }
  }

  const toggleItem = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const toggleAll = () => {
    setSelected((prev) => (prev.size === items.length ? new Set() : new Set(items.map((_, i) => i))))
  }

  const goToPreview = async () => {
    setError("")
    const chosen = items.filter((_, i) => selected.has(i))
    if (chosen.length === 0) {
      setError("Отметьте хотя бы одну работу")
      return
    }
    setSaving(true)
    try {
      const res = await actsApi.generate({
        object_id: objectId,
        contract_id: contract?.id || null,
        estimate_id: selectedEstimateId,
        act_type: actType,
        act_date: actDate,
        options,
        items: chosen,
      })
      setPreviewHtml(res.content_html)
      setStep(3)
    } catch {
      setError("Не удалось сформировать акт")
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    setError("")
    const chosen = items.filter((_, i) => selected.has(i))
    setSaving(true)
    try {
      const res = await actsApi.create({
        object_id: objectId,
        contract_id: contract?.id || null,
        estimate_id: selectedEstimateId,
        act_type: actType,
        act_date: actDate,
        options,
        items: chosen,
        content_html: previewHtml,
        total_amount: total,
        status: "draft",
      })
      navigate(`/cabinet/objects/${objectId}/acts/${res.id}`)
    } catch {
      setError("Не удалось сохранить акт")
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <CrmLayout title="Составление акта">
        <div className="flex items-center justify-center py-24">
          <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
        </div>
      </CrmLayout>
    )
  }

  return (
    <CrmLayout title="Составление акта">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
            className="text-white/50 hover:text-white transition-colors"
          >
            <Icon name="ArrowLeft" size={20} />
          </button>
          <div className="flex-1 flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${s <= step ? "bg-[#D4AF37]" : "bg-white/10"}`}
              />
            ))}
          </div>
          <span className="text-xs text-white/50 whitespace-nowrap">Шаг {step} из 3</span>
        </div>

        {step === 1 && (
          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Договор</label>
              <input
                disabled
                value={contract ? `Договор №${contract.contract_number} от ${contract.contract_date}` : "Без договора"}
                className={`${fieldClass} opacity-70`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Объект</label>
              <input disabled value={object?.address || object?.object_code || "—"} className={`${fieldClass} opacity-70`} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Тип акта</label>
              <select value={actType} onChange={(e) => setActType(e.target.value)} className={fieldClass}>
                {ACT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Дата акта</label>
              <input type="date" value={actDate} onChange={(e) => setActDate(e.target.value)} className={fieldClass} />
            </div>

            <div className="border border-white/10 rounded-lg p-4">
              <p className="text-sm font-medium mb-1">Параметры сдачи и приёмки</p>
              <p className="text-xs text-white/40 mb-4">
                Выбранные варианты попадут в акт. Перед выгрузкой их можно проверить и отредактировать в предпросмотре.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/50">Период с (необязательно)</label>
                  <input type="date" value={options.period_from} onChange={(e) => setOpt("period_from", e.target.value)} className={fieldClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/50">Период по (необязательно)</label>
                  <input type="date" value={options.period_to} onChange={(e) => setOpt("period_to", e.target.value)} className={fieldClass} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-xs text-white/50">Объём приёмки</label>
                <select value={options.scope} onChange={(e) => setOpt("scope", e.target.value)} className={fieldClass}>
                  {SCOPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-xs text-white/50">Результат осмотра</label>
                <select value={options.inspection_result} onChange={(e) => setOpt("inspection_result", e.target.value)} className={fieldClass}>
                  {INSPECTION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-xs text-white/50">Расчёты по акту</label>
                <select value={options.calculation} onChange={(e) => setOpt("calculation", e.target.value)} className={fieldClass}>
                  {CALCULATION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Приложения и переданные документы (необязательно)</label>
                <textarea
                  value={options.appendix}
                  onChange={(e) => setOpt("appendix", e.target.value)}
                  placeholder="Фото, дефектная ведомость, гарантийные документы..."
                  rows={3}
                  className={`${fieldClass} resize-none`}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Выберите смету</label>
              <select
                value={selectedEstimateId ?? ""}
                onChange={(e) => setSelectedEstimateId(e.target.value ? Number(e.target.value) : null)}
                className={fieldClass}
              >
                <option value="">Смета не выбрана</option>
                {estimates.map((est) => (
                  <option key={est.id} value={est.id}>
                    Смета №{est.id} — {formatMoney(est.total_amount)}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-sm text-red-400 flex items-center gap-1.5">
                <Icon name="CircleAlert" size={15} />
                {error}
              </p>
            )}

            <button
              onClick={goToWorks}
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-white text-[#161616] text-sm font-medium px-5 py-3 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-60"
            >
              {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : null}
              Далее: подобрать работы
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium">Подбор работ для акта</p>
              <button onClick={toggleAll} className="text-xs text-[#D4AF37] hover:underline">
                {selected.size === items.length ? "Снять все" : "Выбрать все"}
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-sm text-white/40 py-8 text-center">В выбранной смете нет работ</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
                {items.map((it, i) => (
                  <label
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selected.has(i) ? "border-[#D4AF37]/50 bg-[#D4AF37]/5" : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(i)}
                      onChange={() => toggleItem(i)}
                      className="mt-0.5 accent-[#D4AF37]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{it.name}</p>
                      <p className="text-xs text-white/40">
                        {it.room_name ? `${it.room_name} · ` : ""}{it.quantity} {it.unit} × {formatMoney(it.price)}
                      </p>
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap">{formatMoney(it.amount)}</span>
                  </label>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <span className="text-sm text-white/60">Выбрано: {selected.size} · Итого</span>
              <span className="text-lg font-semibold">{formatMoney(total)}</span>
            </div>

            {error && (
              <p className="text-sm text-red-400 flex items-center gap-1.5 mt-3">
                <Icon name="CircleAlert" size={15} />
                {error}
              </p>
            )}

            <button
              onClick={goToPreview}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-white text-[#161616] text-sm font-medium px-5 py-3 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-60 mt-4"
            >
              {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : null}
              Далее: предпросмотр
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="bg-white text-[#161616] rounded-xl p-8 shadow-lg mb-4">
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>

            {error && (
              <p className="text-sm text-red-400 flex items-center gap-1.5 mb-3">
                <Icon name="CircleAlert" size={15} />
                {error}
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-3 rounded-lg text-sm bg-white/5 hover:bg-white/10 transition-colors"
              >
                Назад
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm font-medium px-5 py-3 rounded-lg disabled:opacity-60"
              >
                {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Check" size={16} />}
                Сохранить акт
              </button>
            </div>
          </div>
        )}
      </div>
    </CrmLayout>
  )
}