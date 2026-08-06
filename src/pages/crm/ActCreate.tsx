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
import { ActParamsStep } from "@/components/crm/act-create/ActParamsStep"
import { ActWorksStep } from "@/components/crm/act-create/ActWorksStep"
import { ActPreviewStep } from "@/components/crm/act-create/ActPreviewStep"
import { num } from "@/components/crm/act-create/constants"

export default function ActCreate() {
  const { id, actId } = useParams()
  const objectId = Number(id)
  const editingActId = actId ? Number(actId) : null
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
      editingActId ? actsApi.get(editingActId).catch(() => null) : Promise.resolve(null),
    ])
      .then(async ([obj, ests, existingAct]) => {
        setObject(obj)
        setEstimates(ests)

        if (existingAct) {
          setActType(existingAct.act_type || "acceptance")
          setActDate((existingAct.act_date || "").slice(0, 10) || new Date().toISOString().slice(0, 10))
          setOptions({
            period_from: existingAct.options?.period_from || "",
            period_to: existingAct.options?.period_to || "",
            scope: existingAct.options?.scope || "all",
            inspection_result: existingAct.options?.inspection_result || "",
            calculation: existingAct.options?.calculation || "contract",
            appendix: existingAct.options?.appendix || "",
          })
          setItems(existingAct.items || [])
          setSelectedEstimateId(existingAct.estimate_id || null)
          setPreviewHtml(existingAct.content_html || "")
          if (existingAct.contract_id) {
            const contr = await contractsApi.get(existingAct.contract_id).catch(() => null)
            setContract(contr)
          }
          setStep(2)
          return
        }

        const contr = contractIdParam ? await contractsApi.get(Number(contractIdParam)).catch(() => null) : null
        setContract(contr)
        const preferred = contr?.estimate_id || ests[0]?.id || null
        setSelectedEstimateId(preferred)
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectId, contractIdParam, editingActId])

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
      if (editingActId) {
        await actsApi.update(editingActId, {
          act_type: actType,
          act_date: actDate,
          options,
          items,
          content_html: previewHtml,
          total_amount: total,
        })
        navigate(`/cabinet/objects/${objectId}/acts/${editingActId}`)
        return
      }
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
    <CrmLayout title={editingActId ? "Редактирование акта" : "Составление акта"}>
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
          <ActParamsStep
            contract={contract}
            object={object}
            actType={actType}
            setActType={setActType}
            actDate={actDate}
            setActDate={setActDate}
            options={options}
            setOpt={setOpt}
            estimates={estimates}
            selectedEstimateId={selectedEstimateId}
            setSelectedEstimateId={setSelectedEstimateId}
            error={error}
            saving={saving}
            goToWorks={goToWorks}
          />
        )}

        {step === 2 && (
          <ActWorksStep
            items={items}
            total={total}
            error={error}
            saving={saving}
            updateField={updateField}
            updateQuantity={updateQuantity}
            removeItem={removeItem}
            addCustomItem={addCustomItem}
            goToPreview={goToPreview}
          />
        )}

        {step === 3 && (
          <ActPreviewStep
            previewHtml={previewHtml}
            error={error}
            saving={saving}
            editingActId={editingActId}
            setStep={setStep}
            handleSave={handleSave}
          />
        )}
      </div>
    </CrmLayout>
  )
}
