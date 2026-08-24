import { formatPhone } from "@/lib/phone"

interface ObjectCreateStep2Props {
  clientName: string
  setClientName: (v: string) => void
  clientPhone: string
  setClientPhone: (v: string) => void
  email: string
  setEmail: (v: string) => void
}

export function ObjectCreateStep2({
  clientName,
  setClientName,
  clientPhone,
  setClientPhone,
  email,
  setEmail,
}: ObjectCreateStep2Props) {
  return (
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
            onChange={(e) => setClientPhone(formatPhone(e.target.value))}
            onFocus={() => {
              if (!clientPhone) setClientPhone("+7 (")
            }}
            onBlur={() => {
              if (clientPhone === "+7 (" || clientPhone === "+7") setClientPhone("")
            }}
            inputMode="tel"
            placeholder="+7 (___) ___-__-__"
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
  )
}