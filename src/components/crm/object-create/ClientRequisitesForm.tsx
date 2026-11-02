import { ClientRequisites } from "@/lib/api"

interface Props {
  value: ClientRequisites
  onChange: (v: ClientRequisites) => void
}

const input =
  "bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 w-full"

type Key = keyof ClientRequisites

const digits = (v: string, max: number) => v.replace(/\D/g, "").slice(0, max)

const FIELDS: { key: Key; label: string; placeholder?: string; span?: boolean; max?: number; required?: boolean }[] = [
  { key: "org_name", label: "Наименование организации", placeholder: "ООО «Ромашка»", span: true, required: true },
  { key: "inn", label: "ИНН", placeholder: "10 цифр", max: 12, required: true },
  { key: "kpp", label: "КПП", placeholder: "9 цифр", max: 9 },
  { key: "ogrn", label: "ОГРН", placeholder: "13 цифр", max: 15 },
  { key: "basis", label: "Действует на основании", placeholder: "Устава" },
  { key: "director_position", label: "Должность подписанта", placeholder: "Генеральный директор" },
  { key: "director_name", label: "ФИО подписанта", placeholder: "Иванов Иван Иванович" },
  { key: "legal_address", label: "Юридический адрес", span: true },
  { key: "postal_address", label: "Почтовый адрес", placeholder: "Если отличается от юридического", span: true },
]

const BANK: { key: Key; label: string; max?: number; span?: boolean }[] = [
  { key: "bank_name", label: "Банк", span: true },
  { key: "bik", label: "БИК", max: 9 },
  { key: "account", label: "Расчётный счёт", max: 20 },
  { key: "corr_account", label: "Корр. счёт", max: 20 },
]

/** Реквизиты заказчика-юрлица: подставляются в договор и счёт объекта */
export function ClientRequisitesForm({ value, onChange }: Props) {
  const set = (k: Key, v: string, max?: number) => onChange({ ...value, [k]: max ? digits(v, max) : v })
  const field = (f: { key: Key; label: string; placeholder?: string; span?: boolean; max?: number; required?: boolean }) => (
    <div key={f.key} className={`flex flex-col gap-1.5 ${f.span ? "sm:col-span-2" : ""}`}>
      <label className="text-xs text-white/50">
        {f.label} {f.required && <span className="text-red-400">*</span>}
      </label>
      <input
        value={value[f.key] || ""}
        inputMode={f.max ? "numeric" : undefined}
        onChange={(e) => set(f.key, e.target.value, f.max)}
        placeholder={f.placeholder}
        className={input}
      />
    </div>
  )
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/5 p-4">
      <div>
        <p className="font-medium">Реквизиты юрлица</p>
        <p className="mt-0.5 text-xs text-white/40">Подставятся в договор и счёт — в шапку, раздел реквизитов и подписи</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{FIELDS.map(field)}</div>
      <p className="text-xs uppercase tracking-wide text-white/40">Банковские реквизиты</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{BANK.map(field)}</div>
    </div>
  )
}

export default ClientRequisitesForm
