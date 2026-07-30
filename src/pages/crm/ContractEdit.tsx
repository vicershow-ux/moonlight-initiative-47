import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { ToggleGroup } from "@/components/crm/contract-create/ToggleGroup"
import {
  objectsApi,
  estimatesApi,
  contractsApi,
  ObjectItem,
  Estimate,
  ContractOptions,
} from "@/lib/api"

const formatMoney = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " ₽"

const defaultOptions: Required<ContractOptions> = {
  customer_type: "individual",
  contractor_type: "individual",
  design_project: "none",
  work_order: "staged",
  subcontractors: "allowed",
  work_start: "advance_and_handover",
  cost_type: "fixed",
  payment_order: "advance_staged",
  payment_schedule: "advance_4_stages",
  duration_months: "6",
}

const REQUIRED_STEPS = 9

export default function ContractEdit() {
  const { id, contractId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const objectId = Number(id)
  const editMode = Boolean(contractId)

  const [object, setObject] = useState<ObjectItem | null>(null)
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [contractNumber, setContractNumber] = useState("")
  const [contractDate, setContractDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [estimateId, setEstimateId] = useState("")
  const [status, setStatus] = useState<"draft" | "signed">("draft")
  const [options, setOptions] = useState<Required<ContractOptions>>(defaultOptions)

  const [previewHtml, setPreviewHtml] = useState("")
  const [totalAmount, setTotalAmount] = useState(0)
  const [previewLoading, setPreviewLoading] = useState(false)
  const generateSeq = useRef(0)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      objectsApi.get(objectId).catch(() => null),
      estimatesApi.listByObject(objectId).then((d) => d.estimates).catch(() => []),
      editMode ? contractsApi.get(Number(contractId)).catch(() => null) : Promise.resolve(null),
    ])
      .then(([obj, estimatesList, contract]) => {
        if (!obj) {
          navigate("/cabinet/objects")
          return
        }
        setObject(obj)
        setEstimates(estimatesList)

        if (contract) {
          setContractNumber(contract.contract_number)
          setContractDate(contract.contract_date?.slice(0, 10) || contractDate)
          setEstimateId(contract.estimate_id ? String(contract.estimate_id) : "")
          setStatus(contract.status === "signed" ? "signed" : "draft")
          setOptions({ ...defaultOptions, ...contract.options })
          setPreviewHtml(contract.content_html)
          setTotalAmount(contract.total_amount)
        } else {
          const qsEstimate = searchParams.get("estimate_id")
          if (qsEstimate) setEstimateId(qsEstimate)
        }
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectId, contractId])

  useEffect(() => {
    if (!object) return
    const seq = ++generateSeq.current
    setPreviewLoading(true)
    const timer = setTimeout(() => {
      contractsApi
        .generate({
          object_id: object.id,
          estimate_id: estimateId ? Number(estimateId) : undefined,
          options,
          contract_number: contractNumber,
          contract_date: contractDate,
        })
        .then((data) => {
          if (seq !== generateSeq.current) return
          setPreviewHtml(data.content_html)
          setTotalAmount(data.total_amount)
        })
        .finally(() => {
          if (seq === generateSeq.current) setPreviewLoading(false)
        })
    }, 400)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [object, estimateId, contractDate, JSON.stringify(options)])

  const updateOption = <K extends keyof ContractOptions>(key: K, value: ContractOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value as Required<ContractOptions>[K] }))
  }

  const filledSteps = [
    !!contractNumber || true,
    !!estimateId || true,
    options.customer_type,
    options.contractor_type,
    options.design_project,
    options.work_order,
    options.cost_type,
    options.payment_order,
    options.payment_schedule,
  ].filter(Boolean).length
  const progressPercent = Math.round((filledSteps / REQUIRED_STEPS) * 100)

  const doSave = async (): Promise<boolean> => {
    if (!object) return false
    setSaving(true)
    setError("")
    try {
      const payload = {
        object_id: object.id,
        estimate_id: estimateId ? Number(estimateId) : undefined,
        contract_number: contractNumber,
        contract_date: contractDate,
        template_key: "apartment_renovation",
        options,
        content_html: previewHtml,
        total_amount: totalAmount,
        status,
      }
      if (editMode) {
        await contractsApi.update(Number(contractId), payload)
      } else {
        const created = await contractsApi.create(payload)
        navigate(`/cabinet/objects/${objectId}/contracts/${created.id}/edit`, { replace: true })
      }
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения договора")
      return false
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAndClose = async () => {
    const ok = await doSave()
    if (ok) navigate(`/cabinet/objects/${objectId}`)
  }

  if (loading || !object) {
    return (
      <CrmLayout title="Конструктор договора">
        <div className="flex items-center justify-center py-24">
          <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
        </div>
      </CrmLayout>
    )
  }

  return (
    <CrmLayout title="Конструктор договора" subtitle={`Объект: ${object.object_code} · ${object.client_name}`}>
      <div className="flex items-center justify-between gap-4 mb-5">
        <button
          onClick={() => navigate(`/cabinet/objects/${objectId}`)}
          className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
        >
          <Icon name="ChevronLeft" size={16} />
          К документу
        </button>

        <div className="flex-1 max-w-md h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#D4463C] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={doSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-60"
          >
            Сохранить
          </button>
          <button
            onClick={handleSaveAndClose}
            disabled={saving}
            className="flex items-center gap-2 bg-[#D4463C] hover:bg-[#B8342B] transition-colors text-white text-sm px-4 py-2 rounded-lg disabled:opacity-60"
          >
            {saving && <Icon name="Loader2" size={15} className="animate-spin" />}
            Сохранить и закрыть
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-2 flex flex-col gap-4 order-2 xl:order-1">
          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
            <p className="font-medium mb-4">Реквизиты договора</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Номер договора</label>
                <input
                  value={contractNumber}
                  onChange={(e) => setContractNumber(e.target.value)}
                  placeholder="Авто"
                  className="bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Дата договора</label>
                <input
                  value={contractDate}
                  onChange={(e) => setContractDate(e.target.value)}
                  type="date"
                  className="bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 mt-4">
              <label className="text-xs text-white/50">Смета для договора</label>
              <select
                value={estimateId}
                onChange={(e) => setEstimateId(e.target.value)}
                className="bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"
              >
                <option value="">Без привязки к смете</option>
                {estimates.map((est) => (
                  <option key={est.id} value={est.id}>
                    Смета №{est.id} — {formatMoney(est.total_amount)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-xs text-white/40 uppercase tracking-wide px-1">1. Предмет договора</p>
          <ToggleGroup
            label="Статус Заказчика"
            value={options.customer_type}
            onChange={(v) => updateOption("customer_type", v)}
            options={[
              { value: "individual", label: "Физическое лицо" },
              { value: "legal", label: "Юридическое лицо" },
              { value: "entrepreneur", label: "Индивидуальный предприниматель" },
            ]}
          />
          <ToggleGroup
            label="Статус Подрядчика"
            value={options.contractor_type}
            onChange={(v) => updateOption("contractor_type", v)}
            options={[
              { value: "individual", label: "Физическое лицо" },
              { value: "self_employed", label: "Самозанятый (НПД)" },
              { value: "foreign_citizen", label: "Иностранный гражданин" },
              { value: "entrepreneur", label: "Индивидуальный предприниматель" },
              { value: "legal", label: "Юридическое лицо" },
            ]}
          />
          <ToggleGroup
            label="Дизайн-проект"
            value={options.design_project}
            onChange={(v) => updateOption("design_project", v)}
            options={[
              { value: "none", label: "Без дизайн-проекта" },
              { value: "with_project", label: "По дизайн-проекту" },
            ]}
          />
          <ToggleGroup
            label="Порядок выполнения работ"
            value={options.work_order}
            onChange={(v) => updateOption("work_order", v)}
            options={[
              { value: "staged", label: "Поэтапно (стандартные 4 этапа)" },
              { value: "single", label: "Единым комплексом" },
              { value: "custom", label: "Свой состав этапов" },
            ]}
          />
          <ToggleGroup
            label="Привлечение субподрядчиков"
            value={options.subcontractors}
            onChange={(v) => updateOption("subcontractors", v)}
            options={[
              { value: "allowed", label: "Вправе привлекать" },
              { value: "personal_only", label: "Только лично" },
            ]}
          />

          <p className="text-xs text-white/40 uppercase tracking-wide px-1 mt-2">2. Сроки выполнения работ</p>
          <div className="bg-[#161616] border border-white/10 rounded-xl p-4">
            <label className="text-xs text-white/50">Общий срок выполнения работ (месяцев)</label>
            <input
              value={options.duration_months}
              onChange={(e) => updateOption("duration_months", e.target.value)}
              type="number"
              min={1}
              className="w-full mt-1.5 bg-[#0f0f0f] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"
            />
          </div>
          <ToggleGroup
            label="Начало течения срока работ"
            value={options.work_start}
            onChange={(v) => updateOption("work_start", v)}
            options={[
              { value: "advance_and_handover", label: "Аванс + передача ключей" },
              { value: "advance_only", label: "С момента аванса" },
              { value: "signing", label: "С момента подписания" },
            ]}
          />

          <p className="text-xs text-white/40 uppercase tracking-wide px-1 mt-2">3. Стоимость работ и порядок оплаты</p>
          <ToggleGroup
            label="Стоимость работ"
            value={options.cost_type}
            onChange={(v) => updateOption("cost_type", v)}
            options={[
              { value: "fixed", label: "Фиксированная стоимость" },
              { value: "by_estimate", label: "Стоимость по смете" },
            ]}
          />
          <ToggleGroup
            label="Порядок оплаты"
            value={options.payment_order}
            onChange={(v) => updateOption("payment_order", v)}
            options={[
              { value: "advance_staged", label: "Аванс + поэтапно по актам" },
              { value: "full_prepayment", label: "100% предоплата" },
              { value: "on_completion", label: "Оплата по факту" },
            ]}
          />
          <ToggleGroup
            label="График платежей"
            value={options.payment_schedule}
            onChange={(v) => updateOption("payment_schedule", v)}
            options={[
              { value: "advance_4_stages", label: "Аванс + 4 этапа" },
              { value: "advance_3_stages", label: "Аванс + 3 этапа" },
              { value: "advance_2_stages", label: "Аванс + 2 этапа" },
              { value: "custom_schedule", label: "Свой график" },
            ]}
          />

          <ToggleGroup
            label="Статус договора"
            value={status}
            onChange={(v) => setStatus(v)}
            options={[
              { value: "draft", label: "Черновик" },
              { value: "signed", label: "Подписан" },
            ]}
          />

          {error && (
            <p className="text-sm text-red-400 flex items-center gap-1.5 px-1">
              <Icon name="CircleAlert" size={15} />
              {error}
            </p>
          )}
        </div>

        <div className="xl:col-span-3 order-1 xl:order-2">
          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-6 sticky top-4 max-h-[calc(100vh-140px)] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="font-medium">Предпросмотр договора</p>
              {previewLoading && <Icon name="Loader2" size={16} className="animate-spin text-white/40" />}
            </div>
            <div
              className="prose prose-invert prose-sm max-w-none contract-preview"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      </div>
    </CrmLayout>
  )
}
