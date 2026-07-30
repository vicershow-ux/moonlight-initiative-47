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
import { moneyWordsRu, moneyInWords, monthsWordsRu } from "@/lib/numberToWordsRu"

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
  customer_name: "",
  contractor_name: "",
  object_address: "",
  hidden_defects: "include",
  payment_days: "5",
  payment_method: "cash_or_bank",
}

const genderOptions = [
  { value: "m" as const, label: "ий" },
  { value: "f" as const, label: "ая" },
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
          <InlineInput value={contractNumber} onChange={setContractNumber} placeholder="№" minWidth={40} />
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
          <div>
            <p className="mb-1">1.4. Состав и порядок этапов работ:</p>
            <textarea
              value={options.custom_stages_text}
              onChange={(e) => updateOption("custom_stages_text", e.target.value)}
              placeholder="Введите свой вариант текста..."
              rows={4}
              className="w-full bg-[#2a2320] border border-[#D4463C]/40 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#D4463C] focus:ring-1 focus:ring-[#D4463C]/40 placeholder:text-white/30 resize-y"
            />
          </div>
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
          <InlineInput value={options.duration_months} onChange={(v) => updateOption("duration_months", v)} placeholder="6" minWidth={40} type="number" />
          {" "}месяцев ({monthsWordsRu(durationNum)}). Течение срока начинается{" "}
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
        <PaymentSchedule scheduleKey={options.payment_schedule} total={options.cost_type === "fixed" ? fixedAmountNum : total} />

        <p>
          3.3. Оплата по каждому этапу производится в течение{" "}
          <InlineInput value={options.payment_days} onChange={(v) => updateOption("payment_days", v)} placeholder="5" minWidth={40} type="number" />
          {" "}рабочих дней с момента подписания Заказчиком соответствующего Акта сдачи-приёмки Работ.
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

        {/* Остальные разделы (без переключателей) */}
        <h3 className="text-white font-semibold mt-6 mb-2">4. Права и обязанности сторон</h3>
        <p>4.1. Подрядчик обязуется выполнить Работы качественно, в срок и передать результат Заказчику по Акту сдачи-приёмки.</p>
        <p>4.2. Заказчик обязуется обеспечить доступ на Объект, своевременно принимать этапы Работ и производить оплату.</p>

        <h3 className="text-white font-semibold mt-6 mb-2">5. Ответственность сторон</h3>
        <p>5.1. За нарушение сроков по вине Подрядчика — неустойка 0,1% от стоимости не выполненного в срок этапа за каждый день просрочки.</p>
        <p>5.2. За нарушение сроков оплаты по вине Заказчика — неустойка 0,1% от неоплаченной суммы за каждый день просрочки.</p>

        <h3 className="text-white font-semibold mt-6 mb-2">6. Гарантии</h3>
        <p>6.1. Гарантия на выполненные Работы — 12 месяцев с момента подписания Акта сдачи-приёмки.</p>

        <h3 className="text-white font-semibold mt-6 mb-2">7. Порядок приёмки работ</h3>
        <p>7.1. Заказчик принимает Работы в течение 3 рабочих дней либо предоставляет мотивированный отказ. Приёмка оформляется двусторонним Актом.</p>

        <h3 className="text-white font-semibold mt-6 mb-2">8. Форс-мажор и разрешение споров</h3>
        <p>8.1. Стороны не отвечают за неисполнение обязательств вследствие обстоятельств непреодолимой силы. Споры разрешаются переговорами, а при недостижении согласия — в суде по месту нахождения Объекта.</p>

        <h3 className="text-white font-semibold mt-6 mb-2">9. Заключительные положения</h3>
        <p>9.1. Договор составлен в двух экземплярах, имеющих одинаковую юридическую силу, и действует до полного исполнения обязательств.</p>

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

function PaymentSchedule({ scheduleKey, total }: { scheduleKey: string; total: number }) {
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
    custom_schedule: [],
  }
  const schedule = scheduleMap[scheduleKey] || scheduleMap.advance_4_stages
  if (!schedule.length) {
    return <p>3.2.1. График платежей определяется индивидуальным соглашением Сторон (Приложение №4).</p>
  }
  return (
    <>
      {schedule.map(([label, pct, when], i) => (
        <p key={i}>
          3.2.{i + 1}. {label} — {moneyWordsRu((total * pct) / 100)} ({pct}%). Оплачивается Заказчиком {when}.
        </p>
      ))}
    </>
  )
}