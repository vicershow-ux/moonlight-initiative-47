import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { objectsApi } from "@/lib/api"

const OBJECT_TYPES = ["Новостройка", "Вторичка", "Дом", "Частичный ремонт"]
const LEGAL_STATUSES = [
  { value: "физическое лицо", label: "Физическое лицо" },
  { value: "юридическое лицо", label: "Юридическое лицо" },
]
const PAYMENT_TYPES = [
  { value: "наличный расчет", label: "Наличный расчет" },
  { value: "безналичный расчет", label: "Безналичный расчет" },
]
const YES_NO = [
  { value: "", label: "Не указано" },
  { value: "есть", label: "Есть" },
  { value: "нет", label: "Нет" },
]
const MATERIAL_OPTIONS = [
  { value: "", label: "Не указано" },
  { value: "наш", label: "Наш" },
  { value: "заказчика", label: "Заказчика" },
  { value: "частично", label: "Частично" },
]
const DESIGN_PROJECTS = [
  "Планировочное решение",
  "Экспресс проект",
  "Экспресс + визуализация",
  "Стандарт проект",
  "Стандарт + визуализация",
  "Премиум проект",
  "Премиум + визуализация",
  "Инженерный проект (ЭОМ, ВИК)",
  "Авторский надзор",
]

const steps = [
  { label: "Основные данные" },
  { label: "Данные заказчика" },
  { label: "Дополнительно" },
]

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

      <div className="flex items-center mb-6 max-w-2xl">
        {steps.map((s, idx) => {
          const num = idx + 1
          const isActive = step === num
          const isDone = step > num
          return (
            <div key={s.label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isDone
                      ? "bg-green-500 text-white"
                      : isActive
                        ? "bg-[#D4AF37] text-[#161616]"
                        : "bg-white/10 text-white/40"
                  }`}
                >
                  {isDone ? <Icon name="Check" size={16} /> : num}
                </div>
                <span className={`text-xs whitespace-nowrap ${isActive || isDone ? "text-white" : "text-white/40"}`}>
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-5 ${isDone ? "bg-green-500" : "bg-white/10"}`} />
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-6 max-w-4xl">
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <p className="font-medium">Основная информация об объекте</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">
                  Тип объекта <span className="text-red-400">*</span>
                </label>
                <select
                  value={objectType}
                  onChange={(e) => setObjectType(e.target.value)}
                  className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none"
                >
                  <option value="">Выберите тип</option>
                  {OBJECT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">
                  Площадь объекта (м²) <span className="text-red-400">*</span>
                </label>
                <input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="0.00"
                  type="number"
                  className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs text-white/50">Адрес объекта (необязательно)</label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="г. Москва, ул. Примерная, д. 1, кв. 1"
                  className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">
                  Правовой статус <span className="text-red-400">*</span>
                </label>
                <select
                  value={legalStatus}
                  onChange={(e) => setLegalStatus(e.target.value)}
                  className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none"
                >
                  <option value="">Выберите статус</option>
                  {LEGAL_STATUSES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">
                  Тип оплаты <span className="text-red-400">*</span>
                </label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none"
                >
                  <option value="">Выберите тип</option>
                  {PAYMENT_TYPES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={residenceDuringWorks}
                    onChange={(e) => setResidenceDuringWorks(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-[#161616]"
                  />
                  Проживание на объекте
                </label>
              </div>

              <div className="flex items-center gap-2 sm:col-span-2 -mt-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={warrantyWaiver}
                    onChange={(e) => setWarrantyWaiver(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-[#161616]"
                  />
                  Отказ от гарантии
                </label>
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs text-white/50">Комментарий замерщика (необязательно)</label>
                <textarea
                  value={measurerComment}
                  onChange={(e) => setMeasurerComment(e.target.value)}
                  placeholder="Дополнительные заметки о замерах объекта..."
                  rows={4}
                  className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none resize-none focus:border-[#D4AF37]/50"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <p className="font-medium">Информация о заказчике</p>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">
                ФИО заказчика <span className="text-red-400">*</span>
              </label>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Иванов Иван Иванович или наименование компании"
                className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">
                  Телефон <span className="text-red-400">*</span>
                </label>
                <input
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                  className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Email (необязательно)</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.ru"
                  type="email"
                  className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="font-medium">Дополнительные параметры</p>
              <p className="text-xs text-white/40 mt-1">Эти поля необязательны для заполнения</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Наличие лифта</label>
                <select
                  value={hasElevator}
                  onChange={(e) => setHasElevator(e.target.value)}
                  className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none"
                >
                  {YES_NO.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Разгрузка материала</label>
                <select
                  value={materialUnloading}
                  onChange={(e) => setMaterialUnloading(e.target.value)}
                  className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none"
                >
                  {YES_NO.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Черновой материал</label>
                <select
                  value={roughMaterial}
                  onChange={(e) => setRoughMaterial(e.target.value)}
                  className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none"
                >
                  {MATERIAL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Чистовой материал</label>
                <select
                  value={finishMaterial}
                  onChange={(e) => setFinishMaterial(e.target.value)}
                  className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none"
                >
                  {MATERIAL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Кухня и мебель</label>
                <select
                  value={kitchenFurniture}
                  onChange={(e) => setKitchenFurniture(e.target.value)}
                  className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none"
                >
                  {MATERIAL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <p className="text-xs text-white/50 mb-2">Дизайн-проект (можно выбрать несколько)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DESIGN_PROJECTS.map((dp) => (
                  <label
                    key={dp}
                    className="flex items-center gap-2 text-sm bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 cursor-pointer hover:border-white/20 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={designProjects.includes(dp)}
                      onChange={() => toggleDesignProject(dp)}
                      className="w-4 h-4 rounded border-white/20 bg-[#161616]"
                    />
                    {dp}
                  </label>
                ))}
              </div>
            </div>
          </div>
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
