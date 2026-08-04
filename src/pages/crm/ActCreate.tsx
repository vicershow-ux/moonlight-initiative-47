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
    () => items.reduce((sum, it) => sum + num(it.amount), 0),
    [items]
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
      setStep(2)
    } catch {
      setError("Не удалось загрузить работы из сметы")
    } finally {
      setSaving(false)
    }
  }

  const updateQuantity = (i: number, value: string) => {
    const qty = num(value)
    setItems((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, quantity: qty, amount: qty * num(it.price) } : it))
    )
  }

  const updateField = (i: number, key: "name" | "unit" | "price", value: string) => {
    setItems((prev) =>
      prev.map((it, idx) => {
        if (idx !== i) return it
        if (key === "price") {
          const price = num(value)
          return { ...it, price, amount: num(it.quantity) * price }
        }
        return { ...it, [key]: value }
      })
    )
  }

  const removeItem = (i: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== i))
  }

  const addCustomItem = () => {
    setItems((prev) => [...prev, { name: "Новая услуга", unit: "шт.", price: 0, quantity: 1, amount: 0 }])
  }

  const goToPreview = async () => {
    setError("")
    if (items.length === 0) {
      setError("Добавьте хотя бы одну работу")
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
        items,
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
    setSaving(true)
    try {
      const res = await actsApi.create({
        object_id: objectId,
        contract_id: contract?.id || null,
        estimate_id: selectedEstimateId,
        act_type: actType,
        act_date: actDate,
        options,
        items,
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
      <div className={step === 2 ? "max-w-4xl mx-auto" : "max-w-2xl mx-auto"}>
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
            <div className="flex items-start justify-between mb-5 gap-4">
              <div>
                <p className="text-base font-semibold">Работы по акту</p>
                <p className="text-xs text-white/40 mt-1">
                  Отредактируйте количество, удалите лишнее или добавьте новые услуги.
                </p>
              </div>
              <div className="text-right whitespace-nowrap">
                <p className="text-xs text-white/40">Итого по акту:</p>
                <p className="text-xl font-bold">{formatMoney(total)}</p>
              </div>
            </div>

            {items.length === 0 ? (
              <p className="text-sm text-white/40 py-8 text-center">Работ пока нет — добавьте услугу</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wide text-white/40 border-b border-white/10">
                      <th className="text-left font-medium py-2 pr-2">Наименование</th>
                      <th className="text-center font-medium py-2 px-2 w-20">Ед.</th>
                      <th className="text-center font-medium py-2 px-2 w-24">Кол-во</th>
                      <th className="text-right font-medium py-2 px-2 w-28">Цена</th>
                      <th className="text-right font-medium py-2 px-2 w-28">Сумма</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, i) => (
                      <tr key={i} className="border-b border-white/5 last:border-0">
                        <td className="py-2 pr-2">
                          <input
                            value={it.name}
                            onChange={(e) => updateField(i, "name", e.target.value)}
                            className="w-full bg-transparent outline-none focus:bg-[#161616] rounded px-1 py-1"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            value={it.unit}
                            onChange={(e) => updateField(i, "unit", e.target.value)}
                            className="w-full bg-transparent text-center text-white/60 outline-none focus:bg-[#161616] rounded px-1 py-1"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min={0}
                            value={it.quantity}
                            onChange={(e) => updateQuantity(i, e.target.value)}
                            className="w-full bg-[#161616] border border-white/10 rounded text-center outline-none focus:border-[#D4AF37]/50 px-1 py-1"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min={0}
                            value={it.price}
                            onChange={(e) => updateField(i, "price", e.target.value)}
                            className="w-full bg-transparent text-right text-white/70 outline-none focus:bg-[#161616] rounded px-1 py-1"
                          />
                        </td>
                        <td className="py-2 px-2 text-right font-medium whitespace-nowrap">
                          {formatMoney(it.amount)}
                        </td>
                        <td className="py-2 pl-2 text-center">
                          <button
                            onClick={() => removeItem(i)}
                            className="text-white/30 hover:text-red-400 transition-colors"
                            title="Удалить"
                          >
                            <Icon name="X" size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button
              onClick={addCustomItem}
              className="mt-4 inline-flex items-center gap-2 border border-white/15 hover:border-white/30 hover:bg-white/5 transition-colors text-sm px-4 py-2.5 rounded-lg"
            >
              <Icon name="Plus" size={15} />
              Добавить произвольную услугу
            </button>

            {error && (
              <p className="text-sm text-red-400 flex items-center gap-1.5 mt-4">
                <Icon name="CircleAlert" size={15} />
                {error}
              </p>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={goToPreview}
                disabled={saving}
                className="flex items-center justify-center gap-2 bg-white text-[#161616] text-sm font-medium px-5 py-3 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-60"
              >
                {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : null}
                Предпросмотр документа
                <Icon name="ArrowRight" size={16} />
              </button>
            </div>
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