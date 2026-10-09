import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
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
import { ContractPartiesSection } from "@/components/crm/contract-edit/ContractPartiesSection"
import { ContractSubjectSection } from "@/components/crm/contract-edit/ContractSubjectSection"
import { ContractPaymentSection } from "@/components/crm/contract-edit/ContractPaymentSection"
import { ContractLegalSection } from "@/components/crm/contract-edit/ContractLegalSection"
import { defaultOptions } from "@/components/crm/contract-edit/constants"

/** Статус подрядчика по типу компании из раздела «Компания» */
function contractorTypeOf(comp: CompanyData | null): string | null {
  switch (comp?.entity_type) {
    case "Индивидуальный предприниматель":
      return "entrepreneur"
    case "Юридическое лицо":
      return "legal"
    case "Самозанятый":
      return "self_employed"
    case "Физическое лицо":
      return "individual"
    default:
      return null
  }
}

/**
 * Данные подрядчика из компании. ИП и физлицо — это человек: берём ФИО, а не название бренда.
 * Юрлицо — наименование, руководитель и ОГРН. Пустые поля компании не затирают введённое вручную
 */
function contractorFromCompany(comp: CompanyData | null, type: string): Partial<Required<ContractOptions>> {
  if (!comp) return {}
  const person = comp.contact_full_name || comp.name || ""
  const out: Partial<Required<ContractOptions>> = {}
  if (type === "legal") {
    if (comp.name) out.contractor_org_name = comp.name
    if (comp.director_position) out.contractor_director_position = comp.director_position
    if (comp.director_name || comp.contact_full_name) out.contractor_director_name = comp.director_name || comp.contact_full_name
    if (comp.ogrn) out.contractor_ogrnip = comp.ogrn
    out.contractor_name = comp.name || person
  } else {
    if (person) out.contractor_name = person
    if (type === "entrepreneur" && comp.ogrn) out.contractor_ogrnip = comp.ogrn
  }
  return out
}

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
          const saved = { ...defaultOptions, ...contract.options }
          // В старых договорах у ИП/физлица в подрядчике стоит название компании — меняем на ФИО,
          // и подставляем ОГРН(ИП), если он не был заполнен
          if (contract.status !== "signed" && comp) {
            if (saved.contractor_type !== "legal" && comp.contact_full_name && saved.contractor_name === comp.name) {
              saved.contractor_name = comp.contact_full_name
            }
            if (!saved.contractor_ogrnip && comp.ogrn && ["entrepreneur", "legal"].includes(saved.contractor_type)) {
              saved.contractor_ogrnip = comp.ogrn
            }
          }
          setOptions(saved)
        } else {
          const qsEstimate = searchParams.get("estimate_id")
          const initialEstimateId = qsEstimate || (estimatesList[0] ? String(estimatesList[0].id) : "")
          setEstimateId(initialEstimateId)
          setOptions((prev) => {
            const type = contractorTypeOf(comp) ?? prev.contractor_type
            return {
              ...prev,
              customer_name: obj.client_name || "",
              ...contractorFromCompany(comp, type),
              contractor_type: type as Required<ContractOptions>["contractor_type"],
              object_address: obj.address || "",
            }
          })
        }
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectId, contractId])

  const updateOption = <K extends keyof ContractOptions>(key: K, value: ContractOptions[K]) => {
    setOptions((prev) => {
      const next = { ...prev, [key]: value as Required<ContractOptions>[K] }
      // Сменили статус подрядчика — подставляем данные своей компании под этот статус
      if (key === "contractor_type" && company) {
        Object.assign(next, contractorFromCompany(company, String(value)))
      }
      return next
    })
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
          <div className="h-full bg-[#D4AF37] transition-all duration-300" style={{ width: "100%" }} />
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
            className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] font-medium text-sm px-4 py-2 rounded-lg disabled:opacity-60"
          >
            {saving && <Icon name="Loader2" size={15} className="animate-spin" />}
            Сохранить и закрыть
          </button>
        </div>
      </div>

      {/* Живой документ */}
      <div className="max-w-3xl mx-auto bg-[#1c1c1c] border border-white/10 rounded-2xl px-6 sm:px-10 py-8 text-[15px] leading-relaxed text-white/80 contract-live">
        <ContractPartiesSection
          contractNumber={contractNumber}
          setContractNumber={setContractNumber}
          contractDate={contractDate}
          setContractDate={setContractDate}
          options={options}
          updateOption={updateOption}
        />

        <ContractSubjectSection
          options={options}
          updateOption={updateOption}
          estimateId={estimateId}
          setEstimateId={setEstimateId}
          estimates={estimates}
          isStaged={isStaged}
          durationNum={durationNum}
        />

        <ContractPaymentSection
          options={options}
          updateOption={updateOption}
          total={total}
          fixedAmountNum={fixedAmountNum}
        />

        <ContractLegalSection
          options={options}
          updateOption={updateOption}
          guaranteeNum={guaranteeNum}
          company={company}
          object={object}
          status={status}
          setStatus={setStatus}
          error={error}
        />
      </div>
    </CrmLayout>
  )
}
