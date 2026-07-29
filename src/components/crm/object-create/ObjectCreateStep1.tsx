const OBJECT_TYPES = ["Новостройка", "Вторичка", "Дом", "Частичный ремонт"]
const LEGAL_STATUSES = [
  { value: "физическое лицо", label: "Физическое лицо" },
  { value: "юридическое лицо", label: "Юридическое лицо" },
]
const PAYMENT_TYPES = [
  { value: "наличный расчет", label: "Наличный расчет" },
  { value: "безналичный расчет", label: "Безналичный расчет" },
]

interface ObjectCreateStep1Props {
  objectType: string
  setObjectType: (v: string) => void
  area: string
  setArea: (v: string) => void
  address: string
  setAddress: (v: string) => void
  legalStatus: string
  setLegalStatus: (v: string) => void
  paymentType: string
  setPaymentType: (v: string) => void
  residenceDuringWorks: boolean
  setResidenceDuringWorks: (v: boolean) => void
  warrantyWaiver: boolean
  setWarrantyWaiver: (v: boolean) => void
  measurerComment: string
  setMeasurerComment: (v: string) => void
}

export function ObjectCreateStep1({
  objectType,
  setObjectType,
  area,
  setArea,
  address,
  setAddress,
  legalStatus,
  setLegalStatus,
  paymentType,
  setPaymentType,
  residenceDuringWorks,
  setResidenceDuringWorks,
  warrantyWaiver,
  setWarrantyWaiver,
  measurerComment,
  setMeasurerComment,
}: ObjectCreateStep1Props) {
  return (
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
  )
}
