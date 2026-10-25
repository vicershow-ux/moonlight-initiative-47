import { ContractOptions } from "@/lib/api"

interface HiredContractorFieldsProps {
  options: Required<ContractOptions>
  updateOption: <K extends keyof ContractOptions>(key: K, value: ContractOptions[K]) => void
}

type Key =
  | "contractor_inn"
  | "contractor_passport"
  | "contractor_phone"
  | "contractor_email"
  | "contractor_address"
  | "contractor_account"
  | "contractor_bank_name"
  | "contractor_bik"
  | "contractor_corr_account"

const input =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 sm:py-2 text-base sm:text-sm outline-none focus:border-[#D4AF37]/50"

/** Реквизиты нанятого исполнителя — когда мы в договоре Заказчик */
export function HiredContractorFields({ options, updateOption }: HiredContractorFieldsProps) {
  const t = options.contractor_type
  const isPerson = t === "individual" || t === "self_employed" || t === "foreign_citizen"
  const showInn = t !== "individual" && t !== "foreign_citizen"

  const field = (key: Key, label: string, placeholder = "", mode: "text" | "numeric" | "tel" | "email" = "text") => (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-white/50">{label}</span>
      <input
        value={String(options[key] || "")}
        onChange={(e) => updateOption(key, e.target.value)}
        placeholder={placeholder}
        inputMode={mode === "text" ? undefined : mode === "numeric" ? "numeric" : mode}
        type={mode === "email" ? "email" : mode === "tel" ? "tel" : "text"}
        className={input}
      />
    </label>
  )

  return (
    <div className="my-4 rounded-xl border border-white/10 bg-[#161616]/60 p-3 sm:p-4">
      <p className="mb-3 text-sm font-medium text-white/90">Реквизиты исполнителя</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {showInn && field("contractor_inn", "ИНН", t === "legal" ? "10 цифр" : "12 цифр", "numeric")}
        {isPerson && field("contractor_passport", "Паспорт", "серия, номер, кем и когда выдан")}
        {field("contractor_phone", "Телефон", "+7 ___ ___-__-__", "tel")}
        {field("contractor_email", "E-mail", "", "email")}
        <div className="sm:col-span-2">{field("contractor_address", t === "legal" ? "Юридический адрес" : "Адрес регистрации")}</div>
      </div>
      <p className="mb-2 mt-4 text-xs uppercase tracking-wide text-white/40">Банк — для оплаты работ</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {field("contractor_account", "Расчётный счёт", "20 цифр", "numeric")}
        {field("contractor_bank_name", "Банк")}
        {field("contractor_bik", "БИК", "9 цифр", "numeric")}
        {field("contractor_corr_account", "Корр. счёт", "20 цифр", "numeric")}
      </div>
    </div>
  )
}

export default HiredContractorFields
