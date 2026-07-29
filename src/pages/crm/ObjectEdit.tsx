import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { objectsApi, ObjectItem } from "@/lib/api"
import { ObjectCreateStep1 } from "@/components/crm/object-create/ObjectCreateStep1"
import { ObjectCreateStep2 } from "@/components/crm/object-create/ObjectCreateStep2"
import { ObjectCreateStep3 } from "@/components/crm/object-create/ObjectCreateStep3"

export default function ObjectEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const objectId = Number(id)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [objectType, setObjectType] = useState("")
  const [area, setArea] = useState("")
  const [address, setAddress] = useState("")
  const [legalStatus, setLegalStatus] = useState("")
  const [paymentType, setPaymentType] = useState("")
  const [residenceDuringWorks, setResidenceDuringWorks] = useState(false)
  const [warrantyWaiver, setWarrantyWaiver] = useState(false)
  const [measurerComment, setMeasurerComment] = useState("")

  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [email, setEmail] = useState("")

  const [hasElevator, setHasElevator] = useState("")
  const [completionType, setCompletionType] = useState("")
  const [materialUnloading, setMaterialUnloading] = useState("")
  const [roughMaterial, setRoughMaterial] = useState("")
  const [finishMaterial, setFinishMaterial] = useState("")
  const [kitchenFurniture, setKitchenFurniture] = useState("")
  const [designProjects, setDesignProjects] = useState<string[]>([])

  const toggleDesignProject = (value: string) => {
    setDesignProjects((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const fillForm = (object: ObjectItem) => {
    setObjectType(object.object_type || "")
    setArea(String(object.area ?? ""))
    setAddress(object.address || "")
    setLegalStatus(object.legal_status || "")
    setPaymentType(object.payment_type || "")
    setResidenceDuringWorks(!!object.residence_during_works)
    setWarrantyWaiver(!!object.warranty_waiver)
    setMeasurerComment(object.measurer_comment || "")
    setClientName(object.client_name || "")
    setClientPhone(object.client_phone || "")
    setEmail(object.email || "")
    setHasElevator(object.has_elevator || "")
    setCompletionType(object.completion_type || "")
    setMaterialUnloading(object.material_unloading || "")
    setRoughMaterial(object.rough_material || "")
    setFinishMaterial(object.finish_material || "")
    setKitchenFurniture(object.kitchen_furniture || "")
    try {
      const list = object.design_project ? JSON.parse(object.design_project) : []
      setDesignProjects(Array.isArray(list) ? list : [])
    } catch {
      setDesignProjects([])
    }
  }

  useEffect(() => {
    if (!id) return
    setLoading(true)
    objectsApi
      .get(objectId)
      .then(fillForm)
      .catch(() => navigate("/cabinet/objects"))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const validate = () => {
    if (!objectType) {
      setError("Выберите тип объекта")
      return false
    }
    if (!area || Number(area) <= 0) {
      setError("Укажите площадь объекта")
      return false
    }
    if (clientName.trim().length < 2) {
      setError("Введите ФИО заказчика")
      return false
    }
    if (!clientPhone.trim()) {
      setError("Укажите телефон заказчика")
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    setError("")
    if (!validate()) return
    setSaving(true)
    try {
      await objectsApi.update(objectId, {
        object_type: objectType,
        area: Number(area) || 0,
        address,
        legal_status: legalStatus,
        payment_type: paymentType,
        residence_during_works: residenceDuringWorks,
        warranty_waiver: warrantyWaiver,
        measurer_comment: measurerComment,
        client_name: clientName,
        client_phone: clientPhone,
        email,
        has_elevator: hasElevator,
        completion_type: completionType,
        material_unloading: materialUnloading,
        rough_material: roughMaterial,
        finish_material: finishMaterial,
        kitchen_furniture: kitchenFurniture,
        design_project: JSON.stringify(designProjects),
      })
      navigate(`/cabinet/objects/${objectId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <CrmLayout title="Редактирование объекта">
        <div className="flex items-center justify-center py-24">
          <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
        </div>
      </CrmLayout>
    )
  }

  return (
    <CrmLayout title="Редактирование объекта" subtitle="Измените информацию об объекте">
      <Link
        to={`/cabinet/objects/${objectId}`}
        className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors mb-4"
      >
        <Icon name="ChevronLeft" size={16} />
        Назад к объекту
      </Link>

      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-6 max-w-4xl flex flex-col gap-8">
        <ObjectCreateStep1
          objectType={objectType}
          setObjectType={setObjectType}
          area={area}
          setArea={setArea}
          address={address}
          setAddress={setAddress}
          legalStatus={legalStatus}
          setLegalStatus={setLegalStatus}
          paymentType={paymentType}
          setPaymentType={setPaymentType}
          residenceDuringWorks={residenceDuringWorks}
          setResidenceDuringWorks={setResidenceDuringWorks}
          warrantyWaiver={warrantyWaiver}
          setWarrantyWaiver={setWarrantyWaiver}
          measurerComment={measurerComment}
          setMeasurerComment={setMeasurerComment}
        />

        <div className="border-t border-white/10 pt-8">
          <ObjectCreateStep2
            clientName={clientName}
            setClientName={setClientName}
            clientPhone={clientPhone}
            setClientPhone={setClientPhone}
            email={email}
            setEmail={setEmail}
          />
        </div>

        <div className="border-t border-white/10 pt-8">
          <ObjectCreateStep3
            hasElevator={hasElevator}
            setHasElevator={setHasElevator}
            completionType={completionType}
            setCompletionType={setCompletionType}
            materialUnloading={materialUnloading}
            setMaterialUnloading={setMaterialUnloading}
            roughMaterial={roughMaterial}
            setRoughMaterial={setRoughMaterial}
            finishMaterial={finishMaterial}
            setFinishMaterial={setFinishMaterial}
            kitchenFurniture={kitchenFurniture}
            setKitchenFurniture={setKitchenFurniture}
            designProjects={designProjects}
            toggleDesignProject={toggleDesignProject}
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 flex items-center gap-1.5">
            <Icon name="CircleAlert" size={15} />
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-5 border-t border-white/10">
          <Link
            to={`/cabinet/objects/${objectId}`}
            className="px-4 py-2.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 transition-colors"
          >
            Отмена
          </Link>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-5 py-2.5 rounded-lg disabled:opacity-60"
          >
            {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : null}
            Сохранить изменения
          </button>
        </div>
      </div>
    </CrmLayout>
  )
}
