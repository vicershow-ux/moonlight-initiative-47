import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { ToggleGroup } from "@/components/crm/contract-create/ToggleGroup"
import { InlineInput, InlineSelect } from "@/components/crm/contract-create/InlineField"
import {
  objectsApi,
  estimatesApi,
  contractsApi,
  companyApi,
  ObjectItem,
  Estimate,
  CompanyData,
  ContractOptions,
} from "@/lib/api"
import { buildContractHtml } from "@/lib/buildContractHtml"
import { moneyInWords, durationWordsOnlyRu } from "@/lib/numberToWordsRu"

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
  duration_unit: "months",
  work_stages: [
    "Подготовительные и черновые работы: демонтаж, возведение перегородок, грунтовка, штукатурка стен, стяжка пола, частичное выполнение инженерных и электромонтажных работ",
    "Санузел и ванная: гидроизоляция, укладка плитки, монтаж сантехнических коммуникаций и оборудования, электромонтаж, монтаж вентиляции",
  ],
  guarantee_months: "12",
  city: "",
  customer_gender: "m",
  contractor_gender: "m",
  customer_org_name: "",
  customer_ogrnip: "",
  customer_ogrn: "",
  customer_director_position: "",
  customer_director_name: "",
  customer_basis: "",
  contractor_ogrnip: "",
  contractor_country: "",
  contractor_residence_basis: "",
  contractor_work_permit: "",
  contractor_org_name: "",
  contractor_director_position: "",
  contractor_director_name: "",
  contractor_basis: "",
  design_author: "",
  custom_stages_text: "",
  fixed_amount: "",
  schedule_amounts: {},
  customer_name: "",
  contractor_name: "",
  object_address: "",
  hidden_defects: "include",
  materials: "customer",
  materials_return_days: "3",
  materials_return_days_kind: "working",
  doc_delivery: "personal_messengers",
  custom_stages: [
    { label: "Аванс", amount: "", when: "до начала выполнения Работ" },
    { label: "Этап 1", amount: "", when: "по завершении Работ и подписания Акта сдачи-приёмки" },
  ],
  payment_days: "5",
  payment_days_kind: "working",
  acceptance_days: "5",
  acceptance_days_kind: "working",
  unilateral_days: "5",
  unilateral_days_kind: "working",
  payment_method: "cash_or_bank",
  warranty_mode: "custom",
  defect_fix_days: "10",
  defect_fix_days_kind: "working",
  penalty_work_pct: "0,1",
  penalty_work_max_pct: "10",
  penalty_pay_pct: "0,1",
  penalty_pay_max_pct: "10",
  claim_days: "10",
  claim_days_kind: "working",
  dispute_venue: "customer",
  dispute_court: "",
  copies_total: "двух",
  copies_per_party: "одному",
}

const copiesTotalOptions = [
  { value: "двух", label: "двух" },
  { value: "трёх", label: "трёх" },
  { value: "четырёх", label: "четырёх" },
]

const copiesPerPartyOptions = [
  { value: "одному", label: "одному" },
  { value: "двум", label: "двум" },
]

const genderOptions = [
  { value: "m" as const, label: "ий" },
  { value: "f" as const, label: "ая" },
]

const daysKindOptions = [
  { value: "working" as const, label: "рабочих дней" },
  { value: "calendar" as const, label: "календарных дней" },
]

const durationUnitOptions = [
  { value: "months" as const, label: "месяцев" },
  { value: "working_days" as const, label: "рабочих дней" },
  { value: "calendar_days" as const, label: "календарных дней" },
]

export default function ContractEdit() {
  const { id, contractId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const objectId = Number(id)
  const editMode = Boolean(contractId)

  const [object, setObject] = useState<ObjectItem | null>(null)
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [contractNumber, setContractNumber] = useState("3")
  const [contractDate, setContractDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [estimateId, setEstimateId] = useState("")
  const [status, setStatus] = useState<"draft" | "signed">("draft")
  const [options, setOptions] = useState<Required<ContractOptions>>(defaultOptions)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      objectsApi.get(objectId).catch(() => null),
      companyApi.get().catch(() => null),
      estimatesApi.listByObject(objectId).then((d) => d.estimates).catch(() => []),
      editMode ? contractsApi.get(Number(contractId)).catch(() => null) : Promise.resolve(null),
    ])
      .then(([obj, comp, estimatesList, contract]) => {
        if (!obj) {
          navigate("/cabinet/objects")
          return
        }
        setObject(obj)
        setCompany(comp)
        setEstimates(estimatesList)

        if (contract) {
          setContractNumber(contract.contract_number)
          setContractDate(contract.contract_date?.slice(0, 10) || new Date().toISOString().slice(0, 10))
          setEstimateId(contract.estimate_id ? String(contract.estimate_id) : "")
          setStatus(contract.status === "signed" ? "signed" : "draft")
          setOptions({ ...defaultOptions, ...contract.options })
        } else {
          const qsEstimate = searchParams.get("estimate_id")
          const initialEstimateId = qsEstimate || (estimatesList[0] ? String(estimatesList[0].id) : "")
          setEstimateId(initialEstimateId)
          setOptions((prev) => ({
            ...prev,
            customer_name: obj.client_name || "",
            contractor_name: comp?.name || comp?.contact_full_name || "",
            object_address: obj.address || "",
          }))
        }
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectId, contractId])

  const updateOption = <K extends keyof ContractOptions>(key: K, value: ContractOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value as Required<ContractOptions>[K] }))
  }

  const estimate = useMemo(
    () => estimates.find((e) => String(e.id) === estimateId) || null,
    [estimates, estimateId]
  )
  const total = estimate?.total_amount ?? 0
  const durationNum = Number(options.duration_months) || 6
  const guaranteeNum = Number(options.guarantee_months) || 12
  const fixedAmountNum = options.fixed_amount ? Number(options.fixed_amount) || 0 : total

  const doSave = async (): Promise<boolean> => {
    if (!object) return false
    setSaving(true)
    setError("")
    try {
      const contentHtml = buildContractHtml({
        object,
        company,
        estimate,
        options,
        contractNumber,
        contractDate,
      })
      const payload = {
        object_id: object.id,
        estimate_id: estimateId ? Number(estimateId) : undefined,
        contract_number: contractNumber,
        contract_date: contractDate,
        template_key: "apartment_renovation",
        options,
        content_html: contentHtml,
        total_amount: total,
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

  const isStaged = options.work_order === "staged"

  return (
    <CrmLayout title="Конструктор договора" subtitle={`Объект: ${object.object_code} · ${object.client_name}`}>
      {/* Панель действий */}
      <div className="flex items-center justify-between gap-4 mb-6 sticky top-0 z-10 bg-[#161616]/95 backdrop-blur py-2 -mx-2 px-2 rounded-lg">
        <button
          onClick={() => navigate(`/cabinet/objects/${objectId}`)}
          className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
        >
          <Icon name="ChevronLeft" size={16} />
          К документу
        </button>

        <div className="flex-1 max-w-md h-1 bg-white/10 rounded-full overflow-hidden hidden sm:block">
          <div className="h-full bg-[#D4463C] transition-all duration-300" style={{ width: "100%" }} />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={doSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm text-white/70 hover:text-white transition-colors disabled:opacity-60"
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

      {/* Живой документ */}
      <div className="max-w-3xl mx-auto bg-[#1c1c1c] border border-white/10 rounded-2xl px-6 sm:px-10 py-8 text-[15px] leading-relaxed text-white/80 contract-live">
        {/* Смета */}
        <div className="border border-dashed border-white/15 rounded-lg px-4 py-3 mb-6 flex flex-wrap items-center gap-3">
          <span className="text-xs text-white/40 uppercase tracking-wide">Смета для договора</span>
          <select
            value={estimateId}
            onChange={(e) => setEstimateId(e.target.value)}
            className="bg-[#2a2320] border border-[#D4463C]/40 rounded px-2 py-1 text-sm outline-none focus:border-[#D4463C]"
          >
            <option value="">Без сметы</option>
            {estimates.map((est) => (
              <option key={est.id} value={est.id} className="bg-[#1f1f1f]">
                Смета №{est.id} — {formatMoney(est.total_amount)}
              </option>
            ))}
          </select>
        </div>

        {/* Заголовок */}
        <h2 className="text-center text-lg font-semibold text-white mb-2">
          Договор подряда на ремонт квартиры №{" "}
          <InlineInput value={contractNumber} onChange={setContractNumber} placeholder="№" minWidth={56} />
        </h2>
        <div className="flex items-center justify-between text-sm mb-6">
          <span>
            г.{" "}
            <InlineInput value={options.city} onChange={(v) => updateOption("city", v)} placeholder="г. Обнинск" minWidth={90} />
          </span>
          <input
            type="date"
            value={contractDate}
            onChange={(e) => setContractDate(e.target.value)}
            className="bg-[#2a2320] border border-[#D4463C]/40 rounded px-2 py-1 text-sm outline-none focus:border-[#D4463C]"
          />
        </div>

        {/* Статус Заказчика */}
        <ToggleGroup
          label="Статус Заказчика"
          required
          value={options.customer_type}
          onChange={(v) => updateOption("customer_type", v)}
          options={[
            { value: "individual", label: "Физическое лицо" },
            { value: "legal", label: "Юридическое лицо" },
            { value: "entrepreneur", label: "Индивидуальный предприниматель" },
          ]}
        />

        {options.customer_type === "individual" && (
          <p>
            <InlineInput value={options.customer_name} onChange={(v) => updateOption("customer_name", v)} placeholder="ФИО заказчика" minWidth={120} />
            , действующ
            <InlineSelect value={options.customer_gender} onChange={(v) => updateOption("customer_gender", v)} options={genderOptions} />
            как физическое лицо (далее — «Заказчик»), с одной стороны, и
          </p>
        )}
        {options.customer_type === "entrepreneur" && (
          <p>
            Индивидуальный предприниматель{" "}
            <InlineInput value={options.customer_name} onChange={(v) => updateOption("customer_name", v)} placeholder="ФИО" minWidth={100} />
            , зарегистрирован
            <InlineSelect
              value={options.customer_gender}
              onChange={(v) => updateOption("customer_gender", v)}
              options={[{ value: "m", label: "ный" }, { value: "f", label: "ная" }]}
            />
            в реестре индивидуальных предпринимателей под №{" "}
            <InlineInput value={options.customer_ogrnip} onChange={(v) => updateOption("customer_ogrnip", v)} placeholder="указать ОГРНИП" minWidth={110} />
            {" "}(далее — «Заказчик»), с одной стороны, и
          </p>
        )}
        {options.customer_type === "legal" && (
          <p>
            <InlineInput value={options.customer_org_name} onChange={(v) => updateOption("customer_org_name", v)} placeholder="Укажите наименование" minWidth={150} />
            , именуемое в дальнейшем «Заказчик», от имени которого действует{" "}
            <InlineInput value={options.customer_director_position} onChange={(v) => updateOption("customer_director_position", v)} placeholder="генеральный директор" minWidth={130} />
            {" "}
            <InlineInput value={options.customer_director_name} onChange={(v) => updateOption("customer_director_name", v)} placeholder="ФИО" minWidth={90} />
            {" "}на основании{" "}
            <InlineInput value={options.customer_basis} onChange={(v) => updateOption("customer_basis", v)} placeholder="Устава" minWidth={70} />
            , с одной стороны, и
          </p>
        )}

        {/* Статус Подрядчика */}
        <ToggleGroup
          label="Статус Подрядчика"
          required
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
        {options.contractor_type === "individual" && (
          <p>
            <InlineInput value={options.contractor_name} onChange={(v) => updateOption("contractor_name", v)} placeholder="ФИО подрядчика" minWidth={150} />
            , действующ
            <InlineSelect value={options.contractor_gender} onChange={(v) => updateOption("contractor_gender", v)} options={genderOptions} />
            как физическое лицо (далее — «Подрядчик»), с другой стороны,
          </p>
        )}
        {options.contractor_type === "self_employed" && (
          <p>
            <InlineInput value={options.contractor_name} onChange={(v) => updateOption("contractor_name", v)} placeholder="ФИО подрядчика" minWidth={150} />
            , действующ
            <InlineSelect value={options.contractor_gender} onChange={(v) => updateOption("contractor_gender", v)} options={genderOptions} />
            как физическое лицо с применением налогового режима «налог на профессиональный доход» (далее — «Подрядчик»), с другой
            стороны,
          </p>
        )}
        {options.contractor_type === "foreign_citizen" && (
          <p>
            <InlineInput value={options.contractor_name} onChange={(v) => updateOption("contractor_name", v)} placeholder="ФИО подрядчика" minWidth={150} />
            , граждан
            <InlineSelect
              value={options.contractor_gender}
              onChange={(v) => updateOption("contractor_gender", v)}
              options={[{ value: "m", label: "ин" }, { value: "f", label: "ка" }]}
            />
            {" "}
            <InlineInput value={options.contractor_country} onChange={(v) => updateOption("contractor_country", v)} placeholder="укажите страну" minWidth={110} />
            , основанием пребывания на территории Российской Федерации является{" "}
            <InlineInput value={options.contractor_residence_basis} onChange={(v) => updateOption("contractor_residence_basis", v)} placeholder="например ВНЖ" minWidth={100} />
            , наличие разрешения на работу подтверждается{" "}
            <InlineInput value={options.contractor_work_permit} onChange={(v) => updateOption("contractor_work_permit", v)} placeholder="например патент" minWidth={110} />
            , действующ
            <InlineSelect value={options.contractor_gender} onChange={(v) => updateOption("contractor_gender", v)} options={genderOptions} />
            как физическое лицо (далее — «Подрядчик»), с другой стороны,
          </p>
        )}
        {options.contractor_type === "entrepreneur" && (
          <p>
            Индивидуальный предприниматель{" "}
            <InlineInput value={options.contractor_name} onChange={(v) => updateOption("contractor_name", v)} placeholder="ФИО" minWidth={130} />
            , зарегистрирован
            <InlineSelect
              value={options.contractor_gender}
              onChange={(v) => updateOption("contractor_gender", v)}
              options={[{ value: "m", label: "ный" }, { value: "f", label: "ная" }]}
            />
            в реестре индивидуальных предпринимателей под №{" "}
            <InlineInput value={options.contractor_ogrnip} onChange={(v) => updateOption("contractor_ogrnip", v)} placeholder="указать ОГРНИП" minWidth={110} />
            {" "}(далее — «Подрядчик»), с другой стороны,
          </p>
        )}
        {options.contractor_type === "legal" && (
          <p>
            <InlineInput value={options.contractor_org_name} onChange={(v) => updateOption("contractor_org_name", v)} placeholder="Наименование" minWidth={130} />
            , именуемое в дальнейшем «Подрядчик», от имени которого действует{" "}
            <InlineInput value={options.contractor_director_position} onChange={(v) => updateOption("contractor_director_position", v)} placeholder="Директор" minWidth={90} />
            {" "}
            <InlineInput value={options.contractor_director_name} onChange={(v) => updateOption("contractor_director_name", v)} placeholder="ФИО" minWidth={90} />
            {" "}на основании{" "}
            <InlineInput value={options.contractor_basis} onChange={(v) => updateOption("contractor_basis", v)} placeholder="Устава" minWidth={70} />
            , с другой стороны,
          </p>
        )}
        <p>
          вместе именуемые «Стороны», а индивидуально — «Сторона», заключили настоящий договор подряда на ремонт квартиры
          (далее — «Договор») о нижеследующем:
        </p>

        {/* 1. Предмет договора */}
        <h3 className="text-white font-semibold mt-6 mb-2">1. Предмет договора</h3>
        <p>
          1.1. Подрядчик обязуется по заданию Заказчика выполнить ремонтно-отделочные работы (далее — «Работы») в квартире по
          адресу:{" "}
          <InlineInput value={options.object_address} onChange={(v) => updateOption("object_address", v)} placeholder="адрес объекта" minWidth={150} />
          {" "}(далее — «Объект»), а Заказчик обязуется принять результат Работ и оплатить его.
        </p>
        <p>
          1.2. Перечень, объёмы и стоимость Работ, а также график их выполнения определяются в{" "}
          <span className="text-[#D4463C]">
            {estimate ? `Смете №${estimate.id} — ${formatMoney(estimate.total_amount)}` : "Смете"}
          </span>
          , являющейся неотъемлемой частью настоящего Договора (Приложение №1 — Смета/Техническое задание).
        </p>

        {/* Дизайн-проект */}
        <ToggleGroup
          label="Дизайн-проект"
          value={options.design_project}
          onChange={(v) => updateOption("design_project", v)}
          options={[
            { value: "none", label: "Без дизайн-проекта" },
            { value: "with_project", label: "По дизайн-проекту" },
          ]}
        />
        {options.design_project === "with_project" && (
          <p>
            Работы выполняются в соответствии с дизайн-проектом, разработанным{" "}
            <InlineInput value={options.design_author} onChange={(v) => updateOption("design_author", v)} placeholder="студией / архитектором ..." minWidth={160} />
            {" "}и согласованным Сторонами, который является неотъемлемой частью настоящего Договора (Приложение №2).
          </p>
        )}
        <p>
          1.3. Качество работ должно соответствовать действующим строительным нормам и правилам (СНиП), сводам правил (СП),
          государственным стандартам (ГОСТ) и техническим регламентам. При отсутствии конкретных требований качество определяется
          общепринятой практикой выполнения строительных и отделочных работ.
        </p>

        {/* Порядок выполнения работ */}
        <ToggleGroup
          label="Порядок выполнения работ"
          required
          value={options.work_order}
          onChange={(v) => updateOption("work_order", v)}
          options={[
            { value: "staged", label: "Поэтапно (стандартные 4 этапа)" },
            { value: "single", label: "Единым комплексом" },
            { value: "custom", label: "Свой состав этапов" },
          ]}
        />
        {isStaged ? (
          <>
            <p>1.4. Работы выполняются поэтапно в соответствии со следующим графиком:</p>
            <p>1.4.1. Этап 1 — Подготовительные и черновые работы: демонтаж, возведение перегородок, грунтовка, штукатурка стен, стяжка пола, частичное выполнение инженерных и электромонтажных работ.</p>
            <p>1.4.2. Этап 2 — Санузел и ванная: гидроизоляция, укладка плитки, монтаж сантехнических коммуникаций и оборудования, электромонтаж, монтаж вентиляции.</p>
            <p>1.4.3. Этап 3 — Подготовка и инженерия: шпатлёвка, армирование, выравнивание и шлифовка стен, завершение электромонтажных и сантехнических работ, подготовка полов.</p>
            <p>1.4.4. Этап 4 — Финишные работы: напольные покрытия, обои/покраска, натяжные потолки, двери, чистовая сантехника, розетки, светильники, плинтусы.</p>
          </>
        ) : options.work_order === "single" ? (
          <p>
            1.4. Работы выполняются единым комплексом без разбивки на отдельные этапы. Промежуточные сроки и объёмы определяются
            Сметой (Приложение №1).
          </p>
        ) : (
          <WorkStages stages={options.work_stages || []} onChange={(next) => updateOption("work_stages", next)} />
        )}

        {/* Субподрядчики */}
        <ToggleGroup
          label="Привлечение субподрядчиков"
          value={options.subcontractors}
          onChange={(v) => updateOption("subcontractors", v)}
          options={[
            { value: "allowed", label: "Вправе привлекать" },
            { value: "personal_only", label: "Только лично" },
          ]}
        />
        <p>
          1.5.{" "}
          {options.subcontractors === "allowed"
            ? "Подрядчик вправе привлекать субподрядчиков для выполнения отдельных видов Работ, оставаясь ответственным перед Заказчиком за результат их деятельности."
            : "Подрядчик выполняет Работы лично, без привлечения субподрядчиков."}
        </p>

        {/* 2. Сроки */}
        <h3 className="text-white font-semibold mt-6 mb-2">2. Сроки выполнения работ</h3>
        <ToggleGroup
          label="Начало течения срока работ"
          required
          value={options.work_start}
          onChange={(v) => updateOption("work_start", v)}
          options={[
            { value: "advance_and_handover", label: "Аванс + передача ключей" },
            { value: "advance_only", label: "С момента аванса" },
            { value: "signing", label: "С момента подписания" },
          ]}
        />
        <p>
          2.1. Общий срок выполнения Работ составляет{" "}
          <InlineInput value={options.duration_months} onChange={(v) => updateOption("duration_months", v)} placeholder="6" minWidth={56} type="number" />
          {" "}
          <InlineSelect value={options.duration_unit || "months"} onChange={(v) => updateOption("duration_unit", v)} options={durationUnitOptions} />
          {" "}(<span className="text-[#D4463C]">{durationWordsOnlyRu(durationNum, options.duration_unit || "months")}</span>). Течение срока начинается{" "}
          {{
            advance_and_handover:
              "с момента выполнения Заказчиком двух условий: внесения аванса, предусмотренного п. 3.2.1 настоящего Договора, и передачи Подрядчику ключей от Объекта с подписанием Сторонами Акта приёма-передачи Объекта в ремонт",
            advance_only: "с момента внесения Заказчиком аванса, предусмотренного п. 3.2.1 настоящего Договора",
            signing: "с момента подписания настоящего Договора обеими Сторонами",
          }[options.work_start]}
          .
        </p>
        <p>
          2.2. При нарушении Заказчиком обязательств, препятствующих выполнению Работ, Подрядчик вправе приостановить их выполнение.
          2.3. Сроки соразмерно отодвигаются на время просрочки со стороны Заказчика.
        </p>

        {/* 3. Стоимость */}
        <h3 className="text-white font-semibold mt-6 mb-2">3. Стоимость работ и порядок оплаты</h3>
        <ToggleGroup
          label="Стоимость работ"
          required
          value={options.cost_type}
          onChange={(v) => updateOption("cost_type", v)}
          options={[
            { value: "fixed", label: "Фиксированная стоимость" },
            { value: "by_estimate", label: "Стоимость по смете" },
          ]}
        />
        {options.cost_type === "fixed" ? (
          <p>
            3.1. Общая стоимость Работ по настоящему Договору составляет{" "}
            <InlineInput
              value={options.fixed_amount}
              onChange={(v) => updateOption("fixed_amount", v)}
              placeholder={total ? String(Math.round(total)) : "сумма"}
              minWidth={90}
              type="number"
            />
            {" "}рублей (<span className="text-[#D4463C]">{moneyInWords(fixedAmountNum)}</span>) и является твёрдой и окончательной.
          </p>
        ) : (
          <p>
            3.1. Стоимость Работ определяется в соответствии со Сметой (Приложение №1) и может уточняться по соглашению Сторон при
            изменении объёмов Работ.
          </p>
        )}

        <ToggleGroup
          label="Порядок оплаты"
          required
          value={options.payment_order}
          onChange={(v) => updateOption("payment_order", v)}
          options={[
            { value: "advance_staged", label: "Аванс + поэтапно по актам" },
            { value: "full_prepayment", label: "100% предоплата" },
            { value: "on_completion", label: "Оплата по факту" },
          ]}
        />
        <p>
          3.2.{" "}
          {{
            advance_staged: "Оплата производится Заказчиком поэтапно, в соответствии с Актами сдачи-приёмки выполненных Работ.",
            full_prepayment: "Оплата производится Заказчиком в размере 100% стоимости Работ до начала их выполнения.",
            on_completion: "Оплата производится Заказчиком по факту выполнения и приёмки Работ в полном объёме.",
          }[options.payment_order]}
        </p>

        {options.payment_order === "advance_staged" && (
          <>
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
            <PaymentSchedule
              scheduleKey={options.payment_schedule}
              total={options.cost_type === "fixed" ? fixedAmountNum : total}
              amounts={options.schedule_amounts}
              onAmountChange={(idx, v) => {
                const next = { ...(options.schedule_amounts || {}), [idx]: v }
                updateOption("schedule_amounts", next)
              }}
              customStages={options.custom_stages || []}
              onCustomStagesChange={(next) => updateOption("custom_stages", next)}
            />
          </>
        )}

        <p>
          3.3. Оплата по каждому этапу производится в течение{" "}
          <InlineInput value={options.payment_days} onChange={(v) => updateOption("payment_days", v)} placeholder="5" minWidth={56} type="number" />
          {" "}
          <InlineSelect value={options.payment_days_kind || "working"} onChange={(v) => updateOption("payment_days_kind", v)} options={daysKindOptions} />
          {" "}с момента подписания Заказчиком соответствующего Акта сдачи-приёмки Работ.
        </p>

        {/* Способ оплаты */}
        <ToggleGroup
          label="Способ оплаты"
          value={options.payment_method}
          onChange={(v) => updateOption("payment_method", v)}
          options={[
            { value: "cash_or_bank", label: "Наличные или безнал" },
            { value: "bank_only", label: "Только безнал" },
            { value: "cash_only", label: "Только наличные" },
          ]}
        />
        <p>
          3.4. Способ оплаты:{" "}
          {{
            cash_or_bank: "наличные денежные средства или безналичный перевод на расчётный счёт Подрядчика",
            bank_only: "безналичный перевод на расчётный счёт Подрядчика",
            cash_only: "наличные денежные средства",
          }[options.payment_method]}
          , указанный в разделе с реквизитами настоящего Договора.
        </p>

        {/* Скрытые дефекты */}
        <ToggleGroup
          label="Условие о скрытых дефектах"
          value={options.hidden_defects}
          onChange={(v) => updateOption("hidden_defects", v)}
          options={[
            { value: "include", label: "Включить" },
            { value: "exclude", label: "Не включать" },
          ]}
        />
        {options.hidden_defects === "include" && (
          <p>
            3.5. Стоимость Договора не учитывает скрытые дефекты Объекта, которые невозможно было обнаружить при первоначальном
            осмотре. При выявлении в процессе ремонта необходимости проведения дополнительных скрытых работ Подрядчик обязан
            приостановить работы и уведомить об этом Заказчика. Объём и стоимость таких работ оформляются Дополнительным соглашением.
          </p>
        )}

        {/* 4. Закупка материалов */}
        <h3 className="text-white font-semibold mt-6 mb-2">4. Материалы и закупка</h3>
        <ToggleGroup
          label="Закупка материалов"
          value={options.materials}
          onChange={(v) => updateOption("materials", v)}
          options={[
            { value: "customer", label: "За счёт Заказчика" },
            { value: "contractor", label: "За счёт Подрядчика" },
            { value: "mixed", label: "Смешанно" },
          ]}
        />
        {options.materials === "customer" && (
          <>
            <p>
              4.1. Закупка строительных и отделочных материалов, необходимых для выполнения Работ, осуществляется за счёт
              Заказчика.
            </p>
            <p>
              4.2. Заказчик может выделить Подрядчику денежные средства на закупку материалов по предварительному согласованию
              Сторон. Способ передачи денежных средств: наличные денежные средства или безналичный перевод на расчётный счёт
              Подрядчика, указанный в разделе с реквизитами настоящего Договора.
            </p>
            <p>
              4.3. В случае закупки материалов Подрядчиком за счёт средств Заказчика Подрядчик обязуется использовать средства
              строго по назначению, предоставлять отчёт по каждой закупке, передавать Заказчику оригиналы чеков, накладных и иных
              подтверждающих документов на приобретённые материалы, а также предоставлять отчёт по доставке и сопутствующим
              расходам.
            </p>
            <p>
              4.4. Все неиспользованные денежные средства, выделенные Заказчиком на закупку, подлежат возврату Заказчику в течение{" "}
              <InlineInput value={options.materials_return_days} onChange={(v) => updateOption("materials_return_days", v)} placeholder="3" minWidth={56} type="number" />
              {" "}
              <InlineSelect value={options.materials_return_days_kind || "working"} onChange={(v) => updateOption("materials_return_days_kind", v)} options={daysKindOptions} />
              {" "}с момента завершения закупок по соответствующему этапу.
            </p>
            <p>
              4.5. Подрядчик своими силами и за свой счёт осуществляет погрузочно-разгрузочные работы, а также подъём и спуск
              материалов, инструментов и мусора на Объекте. Заказчик самостоятельно оплачивает доставку материалов до Объекта, а
              также аренду и вывоз контейнера для строительного мусора.
            </p>
            <p>
              4.6. Подрядчик не несёт ответственности за качество строительных и отделочных материалов, приобретённых Заказчиком
              самостоятельно, и вправе отказаться от их использования, если они имеют явные дефекты или не соответствуют
              технологическим требованиям.
            </p>
          </>
        )}

        {options.materials === "contractor" && (
          <>
            <p>
              4.1. Закупка строительных и отделочных материалов, необходимых для выполнения Работ, осуществляется Подрядчиком, их
              стоимость включена в общую стоимость Работ по настоящему Договору.
            </p>
            <p>
              4.2. Подрядчик своими силами и за свой счёт осуществляет доставку материалов до Объекта, погрузочно-разгрузочные
              работы, а также подъём и спуск материалов, инструментов и мусора на Объекте.
            </p>
            <p>
              4.3. Подрядчик гарантирует, что используемые материалы являются новыми, надлежащего качества и соответствуют
              действующим стандартам и технологическим требованиям.
            </p>
          </>
        )}

        {options.materials === "mixed" && (
          <>
            <p>
              4.1. Черновые материалы приобретаются Подрядчиком и включаются в стоимость Работ, чистовые (отделочные) материалы
              приобретаются за счёт Заказчика. Распределение материалов по видам определяется Сметой (Приложение №1).
            </p>
            <p>
              4.2. Подрядчик своими силами и за свой счёт осуществляет погрузочно-разгрузочные работы, а также подъём и спуск
              материалов, инструментов и мусора на Объекте.
            </p>
            <p>
              4.3. Подрядчик не несёт ответственности за качество материалов, приобретённых Заказчиком самостоятельно, и вправе
              отказаться от их использования при наличии явных дефектов или несоответствия технологическим требованиям.
            </p>
          </>
        )}

        {/* 5. Порядок сдачи и приёмки работ */}
        <h3 className="text-white font-semibold mt-6 mb-2">5. Порядок сдачи и приёмки работ</h3>
        <p>
          5.1. По завершении каждого этапа Работ (а по завершении всех Работ — по завершении последнего этапа) Подрядчик
          предоставляет Заказчику Акт сдачи-приёмки выполненных работ и отчётную документацию.
        </p>
        <p>
          5.2. Заказчик обязан в течение{" "}
          <InlineInput value={options.acceptance_days} onChange={(v) => updateOption("acceptance_days", v)} placeholder="5" minWidth={56} type="number" />
          {" "}
          <InlineSelect value={options.acceptance_days_kind || "working"} onChange={(v) => updateOption("acceptance_days_kind", v)} options={daysKindOptions} />
          {" "}с момента получения Акта либо принять работы и подписать Акт, либо направить Подрядчику мотивированный отказ от
          приёмки с указанием выявленных замечаний.
        </p>

        {/* Направление документов */}
        <ToggleGroup
          label="Направление документов"
          value={options.doc_delivery}
          onChange={(v) => updateOption("doc_delivery", v)}
          options={[
            { value: "personal_messengers", label: "Лично + мессенджеры" },
            { value: "personal_mail", label: "Лично / почтой" },
            { value: "email", label: "По электронной почте" },
          ]}
        />
        <p>
          5.3.{" "}
          {{
            personal_messengers: "Направление Актов сдачи-приёмки, отчётов, уведомлений о дополнительных работах и иных документов осуществляется Сторонами путём личного вручения либо с использованием мессенджеров (WhatsApp, Telegram) по номерам телефонов Сторон, указанным в разделе с реквизитами настоящего Договора. Документ считается полученным в день его отправки в мессенджере.",
            personal_mail: "Направление документов осуществляется путём личного вручения под расписку либо заказным письмом с уведомлением о вручении по адресам Сторон, указанным в разделе с реквизитами настоящего Договора.",
            email: "Направление документов осуществляется по адресам электронной почты Сторон, указанным в разделе с реквизитами настоящего Договора. Документ считается полученным на следующий рабочий день после его отправки.",
          }[options.doc_delivery]}
        </p>
        <p>
          5.4. В случае если в течение{" "}
          <InlineInput value={options.unilateral_days} onChange={(v) => updateOption("unilateral_days", v)} placeholder="5" minWidth={56} type="number" />
          {" "}
          <InlineSelect value={options.unilateral_days_kind || "working"} onChange={(v) => updateOption("unilateral_days_kind", v)} options={daysKindOptions} />
          {" "}с момента отправки Акта сдачи-приёмки Заказчик не подпишет его или не направит Подрядчику письменный мотивированный
          отказ, работы по соответствующему этапу считаются принятыми Заказчиком в полном объёме и надлежащего качества. В этом
          случае односторонний Акт, подписанный Подрядчиком, имеет полную юридическую силу и является основанием для оплаты.
        </p>

        {/* 6. Гарантия на работы */}
        <h3 className="text-white font-semibold mt-6 mb-2">6. Гарантия на работы</h3>
        <ToggleGroup
          label="Гарантия на работы"
          value={options.warranty_mode}
          onChange={(v) => updateOption("warranty_mode", v)}
          options={[
            { value: "custom", label: "Установить гарантию" },
            { value: "by_law", label: "По закону" },
          ]}
        />
        {options.warranty_mode === "by_law" ? (
          <p>6.1. Гарантийный срок на выполненные Работы Договором не устанавливается. Стороны руководствуются гарантийными сроками, предусмотренными действующим законодательством Российской Федерации.</p>
        ) : (
          <p>
            6.1. Гарантийный срок на выполненные Работы составляет{" "}
            <InlineInput value={options.guarantee_months} onChange={(v) => updateOption("guarantee_months", v)} placeholder="6" minWidth={56} type="number" />
            {" "}(<span className="text-[#D4463C]">{durationWordsOnlyRu(guaranteeNum, "months")}</span>) с даты подписания итогового Акта сдачи-приёмки Работ по Договору.
          </p>
        )}
        <p>
          6.2. Подрядчик несёт ответственность за недостатки Работ, обнаруженные в пределах гарантийного срока, и обязуется устранить
          их за свой счёт в течение{" "}
          <InlineInput value={options.defect_fix_days} onChange={(v) => updateOption("defect_fix_days", v)} placeholder="10" minWidth={56} type="number" />
          {" "}
          <InlineSelect value={options.defect_fix_days_kind || "working"} onChange={(v) => updateOption("defect_fix_days_kind", v)} options={daysKindOptions} />
          {" "}с момента получения соответствующего уведомления от Заказчика, если не докажет, что они произошли вследствие
          нормального износа Объекта, неправильной его эксплуатации либо ненадлежащего ремонта Объекта, произведённого самим
          Заказчиком или привлечёнными им третьими лицами.
        </p>
        <p>
          6.3. Ответственность за нарушение сроков. В случае просрочки выполнения Работ по вине Подрядчика Заказчик вправе
          потребовать уплаты неустойки (пени) в размере{" "}
          <InlineInput value={options.penalty_work_pct} onChange={(v) => updateOption("penalty_work_pct", v)} placeholder="0,1" minWidth={56} />
          {" "}% от стоимости невыполненного этапа Работ за каждый день просрочки, но не более{" "}
          <InlineInput value={options.penalty_work_max_pct} onChange={(v) => updateOption("penalty_work_max_pct", v)} placeholder="10" minWidth={56} />
          {" "}% от общей стоимости Договора.
        </p>
        <p>
          6.4. Ответственность за нарушение оплаты. В случае просрочки оплаты выполненных Работ по вине Заказчика Подрядчик вправе
          потребовать уплаты неустойки (пени) в размере{" "}
          <InlineInput value={options.penalty_pay_pct} onChange={(v) => updateOption("penalty_pay_pct", v)} placeholder="0,1" minWidth={56} />
          {" "}% от суммы просроченного платежа за каждый день просрочки, но не более{" "}
          <InlineInput value={options.penalty_pay_max_pct} onChange={(v) => updateOption("penalty_pay_max_pct", v)} placeholder="10" minWidth={56} />
          {" "}% от общей стоимости Договора.
        </p>
        <p>
          6.5. Стороны несут ответственность за неисполнение или ненадлежащее исполнение своих обязательств в соответствии с
          законодательством Российской Федерации.
        </p>

        {/* 7. Форс-мажор */}
        <h3 className="text-white font-semibold mt-6 mb-2">7. Форс-мажор</h3>
        <p>
          7.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему Договору,
          если это неисполнение явилось следствием обстоятельств непреодолимой силы (форс-мажор), возникших после заключения
          Договора, которые Стороны не могли предвидеть или предотвратить разумными мерами.
        </p>

        {/* 8. Разрешение споров */}
        <h3 className="text-white font-semibold mt-6 mb-2">8. Разрешение споров</h3>
        <p>
          8.1. Споры и разногласия, возникающие между Сторонами, решаются путём переговоров и предъявления письменной претензии.
          Срок рассмотрения претензии —{" "}
          <InlineInput value={options.claim_days} onChange={(v) => updateOption("claim_days", v)} placeholder="10" minWidth={56} type="number" />
          {" "}
          <InlineSelect value={options.claim_days_kind || "working"} onChange={(v) => updateOption("claim_days_kind", v)} options={daysKindOptions} />
          {" "}с момента её получения.
        </p>
        <ToggleGroup
          label="Порядок разрешения споров"
          value={options.dispute_venue}
          onChange={(v) => updateOption("dispute_venue", v)}
          options={[
            { value: "customer", label: "По месту Заказчика" },
            { value: "contractor", label: "По месту Подрядчика" },
            { value: "specific", label: "Конкретный суд" },
          ]}
        />
        <p>
          8.2. В случае недостижения согласия спор передаётся на рассмотрение в суд{" "}
          {options.dispute_venue === "specific" ? (
            <>
              <InlineInput value={options.dispute_court} onChange={(v) => updateOption("dispute_court", v)} placeholder="наименование суда" minWidth={160} />{" "}
              в соответствии с законодательством Российской Федерации.
            </>
          ) : options.dispute_venue === "contractor" ? (
            "по месту нахождения Подрядчика в соответствии с законодательством Российской Федерации."
          ) : (
            "по месту нахождения Заказчика в соответствии с законодательством Российской Федерации."
          )}
        </p>

        {/* 9. Заключительные положения */}
        <h3 className="text-white font-semibold mt-6 mb-2">9. Заключительные положения</h3>
        <p>
          9.1. Настоящий Договор вступает в силу с момента его подписания обеими Сторонами и действует до полного исполнения
          Сторонами своих обязательств.
        </p>
        <p>
          9.2. Договор составлен в{" "}
          <InlineSelect value={options.copies_total} onChange={(v) => updateOption("copies_total", v)} options={copiesTotalOptions} />
          {" "}экземплярах, имеющих равную юридическую силу, — по{" "}
          <InlineSelect value={options.copies_per_party} onChange={(v) => updateOption("copies_per_party", v)} options={copiesPerPartyOptions} />
          {" "}для каждой из Сторон.
        </p>

        {/* 10. Реквизиты и подписи сторон */}
        <h3 className="text-white font-semibold mt-6 mb-2">10. Реквизиты и подписи сторон</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/10 pt-4">
          <div className="md:border-r md:border-white/10 md:pr-6">
            <p className="text-xs uppercase tracking-wide text-white/50 mb-2">Подрядчик (Исполнитель)</p>
            <p className="font-semibold text-white">{company?.name || company?.contact_full_name || options.contractor_name || "—"}</p>
            {company?.phone && <p className="text-sm text-white/70">Тел.: {company.phone}</p>}
            {company?.email && <p className="text-sm text-white/70">Email: {company.email}</p>}
            {company?.inn && <p className="text-sm text-white/70">ИНН: {company.inn}</p>}
            {company?.legal_address && <p className="text-sm text-white/70">Юр. адрес: {company.legal_address}</p>}
            {company?.bank_name && <p className="text-sm text-white/70">Банк: {company.bank_name}</p>}
            {company?.account_number && <p className="text-sm text-white/70">Р/с: {company.account_number}</p>}
            <div className="mt-10">
              <p className="text-xs uppercase tracking-wide text-white/50 mb-6">От имени Подрядчика</p>
              <div className="border-t border-white/30 pt-1 max-w-[240px]">
                <p className="font-semibold text-white text-sm">{company?.contact_full_name || options.contractor_name || "—"}</p>
                <p className="text-xs text-white/40">(подпись, М.П.)</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-white/50 mb-2">Заказчик</p>
            <p className="font-semibold text-white">{options.customer_name || object?.client_name || "—"}</p>
            {object?.client_phone && <p className="text-sm text-white/70">Тел.: {object.client_phone}</p>}
            {object?.email && <p className="text-sm text-white/70">Email: {object.email}</p>}
            {options.object_address && <p className="text-sm text-white/70">Адрес: {options.object_address}</p>}
            <div className="mt-10">
              <p className="text-xs uppercase tracking-wide text-white/50 mb-6">От имени Заказчика</p>
              <div className="border-t border-white/30 pt-1 max-w-[240px]">
                <p className="font-semibold text-white text-sm">{options.customer_name || object?.client_name || "—"}</p>
                <p className="text-xs text-white/40">(подпись)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Статус договора */}
        <div className="mt-6">
          <ToggleGroup
            label="Статус договора"
            value={status}
            onChange={(v) => setStatus(v)}
            options={[
              { value: "draft", label: "Черновик" },
              { value: "signed", label: "Подписан" },
            ]}
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 flex items-center gap-1.5 mt-4">
            <Icon name="CircleAlert" size={15} />
            {error}
          </p>
        )}
      </div>
    </CrmLayout>
  )
}

type CustomStage = { label: string; amount: string; when: string }

function PaymentSchedule({
  scheduleKey,
  total,
  amounts,
  onAmountChange,
  customStages,
  onCustomStagesChange,
}: {
  scheduleKey: string
  total: number
  amounts?: Record<string, string>
  onAmountChange: (idx: number, value: string) => void
  customStages: CustomStage[]
  onCustomStagesChange: (next: CustomStage[]) => void
}) {
  if (scheduleKey === "custom_schedule") {
    return (
      <CustomSchedule stages={customStages} onChange={onCustomStagesChange} />
    )
  }
  const scheduleMap: Record<string, [string, number, string][]> = {
    advance_4_stages: [
      ["Аванс", 25, "до начала выполнения Работ"],
      ["Этап 1", 25, "по завершении чернового этапа"],
      ["Этап 2", 25, "по завершении инженерного этапа"],
      ["Этап 3", 25, "по завершении финишных работ и подписания Акта сдачи-приёмки"],
    ],
    advance_3_stages: [
      ["Аванс", 30, "до начала выполнения Работ"],
      ["Этап 1", 40, "по завершении чернового и инженерного этапов"],
      ["Этап 2", 30, "по завершении финишных работ и подписания Акта сдачи-приёмки"],
    ],
    advance_2_stages: [
      ["Аванс", 50, "до начала выполнения Работ"],
      ["Этап 1", 50, "по завершении Работ и подписания Акта сдачи-приёмки"],
    ],
  }
  const schedule = scheduleMap[scheduleKey] || scheduleMap.advance_4_stages
  return (
    <>
      {schedule.map(([label, pct, when], i) => {
        const manual = amounts?.[i]
        const amountNum = manual ? Number(manual) || 0 : (total * pct) / 100
        return (
          <p key={i}>
            3.2.{i + 1}. {label} —{" "}
            <InlineInput
              value={manual ?? ""}
              onChange={(v) => onAmountChange(i, v)}
              placeholder={String(Math.round((total * pct) / 100))}
              minWidth={90}
              type="number"
            />
            {" "}рублей (<span className="text-[#D4463C]">{moneyInWords(amountNum)}</span>). Оплачивается Заказчиком {when}.
          </p>
        )
      })}
    </>
  )
}

function CustomSchedule({ stages, onChange }: { stages: CustomStage[]; onChange: (next: CustomStage[]) => void }) {
  const update = (i: number, patch: Partial<CustomStage>) => {
    onChange(stages.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
  }
  const remove = (i: number) => onChange(stages.filter((_, idx) => idx !== i))
  const add = () =>
    onChange([...stages, { label: `Этап ${stages.length}`, amount: "", when: "по завершении Работ и подписания Акта сдачи-приёмки" }])

  return (
    <>
      {stages.map((s, i) => {
        const amountNum = Number(s.amount) || 0
        return (
          <p key={i} className="group flex items-baseline flex-wrap gap-y-1">
            <span>3.2.{i + 1}.{" "}</span>
            <InlineInput value={s.label} onChange={(v) => update(i, { label: v })} placeholder="Название этапа" minWidth={80} />
            {" "}—{" "}
            <InlineInput value={s.amount} onChange={(v) => update(i, { amount: v })} placeholder="сумма" minWidth={90} type="number" />
            {" "}рублей (<span className="text-[#D4463C]">{moneyInWords(amountNum)}</span>). Оплачивается Заказчиком{" "}
            <InlineInput value={s.when} onChange={(v) => update(i, { when: v })} placeholder="условие оплаты" minWidth={200} />.
            {stages.length > 1 && (
              <button
                type="button"
                onClick={() => remove(i)}
                className="ml-1 text-white/30 hover:text-[#D4463C] opacity-0 group-hover:opacity-100 transition"
                title="Удалить этап"
              >
                <Icon name="X" size={15} />
              </button>
            )}
          </p>
        )
      })}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1 text-sm text-[#D4463C] hover:text-[#e85c52] transition mt-1"
      >
        <Icon name="Plus" size={15} />
        Добавить этап
      </button>
    </>
  )
}

function WorkStages({ stages, onChange }: { stages: string[]; onChange: (next: string[]) => void }) {
  const update = (i: number, value: string) => onChange(stages.map((s, idx) => (idx === i ? value : s)))
  const remove = (i: number) => onChange(stages.filter((_, idx) => idx !== i))
  const add = () => onChange([...stages, ""])

  return (
    <div className="space-y-2">
      <p className="mb-1">1.4. Работы выполняются поэтапно в соответствии со следующим графиком:</p>
      {stages.map((s, i) => (
        <div key={i} className="group flex items-start gap-2">
          <span className="pt-2 shrink-0 whitespace-nowrap">1.4.{i + 1}. Этап {i + 1} —</span>
          <textarea
            value={s}
            onChange={(e) => update(i, e.target.value)}
            placeholder="Опишите работы этапа..."
            rows={2}
            className="flex-1 bg-[#2a2320] border border-[#D4463C]/40 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-[#D4463C] focus:ring-1 focus:ring-[#D4463C]/40 placeholder:text-white/30 resize-y"
          />
          {stages.length > 1 && (
            <button
              type="button"
              onClick={() => remove(i)}
              className="pt-2 text-white/30 hover:text-[#D4463C] opacity-0 group-hover:opacity-100 transition shrink-0"
              title="Удалить этап"
            >
              <Icon name="X" size={16} />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1 text-sm text-[#D4463C] hover:text-[#e85c52] transition"
      >
        <Icon name="Plus" size={15} />
        Добавить этап
      </button>
    </div>
  )
}