import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { objectsApi } from "@/lib/api"
import { ObjectCreateStepper } from "@/components/crm/object-create/ObjectCreateStepper"
import { ObjectCreateStep1 } from "@/components/crm/object-create/ObjectCreateStep1"
import { ObjectCreateStep2 } from "@/components/crm/object-create/ObjectCreateStep2"
import { ObjectCreateStep3 } from "@/components/crm/object-create/ObjectCreateStep3"

export default function ObjectCreate() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
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

  const validateStep1 = () => {
    if (!objectType) {
      setError("Выберите тип объекта")
      return false
    }
    if (!area || Number(area) <= 0) {
      setError("Укажите площадь объекта")
      return false
    }
    return true
  }

  const validateStep2 = () => {
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

  const handleNext = () => {
    setError("")
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    setStep((s) => Math.min(3, s + 1))
  }

  const handleBack = () => {
    setError("")
    setStep((s) => Math.max(1, s - 1))
  }

  const handleSubmit = async () => {
    setError("")
    setSaving(true)
    try {
      await objectsApi.create({
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
      navigate("/cabinet/objects")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения")
    } finally {
      setSaving(false)
    }
  }

  return (
    <CrmLayout title="Создание объекта" subtitle="Заполните информацию об объекте в 3 шага">
      <Link
        to="/cabinet/objects"
        className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors mb-4"
      >
        <Icon name="ChevronLeft" size={16} />
        Назад к списку
      </Link>

      <ObjectCreateStepper step={step} />

      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-6 max-w-4xl">
        {step === 1 && (
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
        )}

        {step === 2 && (
          <ObjectCreateStep2
            clientName={clientName}
            setClientName={setClientName}
            clientPhone={clientPhone}
            setClientPhone={setClientPhone}
            email={email}
            setEmail={setEmail}
          />
        )}

        {step === 3 && (
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
        )}

        {error && (
          <p className="text-sm text-red-400 flex items-center gap-1.5 mt-5">
            <Icon name="CircleAlert" size={15} />
            {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 mt-6 pt-5 border-t border-white/10">
          <div>
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-4 py-2.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 transition-colors"
              >
                Назад
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/cabinet/objects"
              className="px-4 py-2.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 transition-colors"
            >
              Отмена
            </Link>
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-5 py-2.5 rounded-lg"
              >
                Далее
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-5 py-2.5 rounded-lg disabled:opacity-60"
              >
                {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : null}
                Создать объект
              </button>
            )}
          </div>
        </div>
      </div>
    </CrmLayout>
  )
}
