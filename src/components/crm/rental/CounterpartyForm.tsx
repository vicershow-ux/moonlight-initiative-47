import { RentalCounterparty, RentalPartyKind } from "@/lib/api"
import { PARTY_LABEL } from "@/lib/rental"

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"

interface Props {
  value: Partial<RentalCounterparty>
  onChange: (patch: Partial<RentalCounterparty>) => void
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  wide,
}: {
  label: string
  value?: string | null
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  wide?: boolean
}) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label className="mb-1.5 block text-xs text-white/50">{label}</label>
      <input
        className={inputCls}
        type={type}
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export function CounterpartyForm({ value, onChange }: Props) {
  const kind = (value.party_kind || "individual") as RentalPartyKind
  const isOrg = kind === "legal" || kind === "entrepreneur"

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs text-white/50">Кто это</label>
        <div className="flex flex-wrap gap-2">
          {(["individual", "entrepreneur", "legal"] as RentalPartyKind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => onChange({ party_kind: k })}
              className={`min-h-[40px] rounded-lg px-4 text-sm transition-colors ${
                kind === k
                  ? "bg-[#D4AF37] text-[#161616]"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {PARTY_LABEL[k]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Как отображать в списке"
          value={value.display_name}
          onChange={(v) => onChange({ display_name: v })}
          placeholder={isOrg ? 'ООО "Стройка"' : "Иванов И. И."}
          wide
        />
        <Field
          label="Телефон"
          value={value.phone}
          onChange={(v) => onChange({ phone: v })}
          placeholder="+7 (___) ___-__-__"
        />
        <Field
          label="Email"
          value={value.email}
          onChange={(v) => onChange({ email: v })}
          placeholder="mail@example.ru"
        />
      </div>

      {isOrg ? (
        <div className="rounded-lg border border-white/10 p-4">
          <div className="mb-3 text-xs uppercase text-white/40">Реквизиты для договора</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label={kind === "legal" ? "Полное название" : "ФИО предпринимателя"}
              value={kind === "legal" ? value.org_name : value.full_name}
              onChange={(v) => onChange(kind === "legal" ? { org_name: v } : { full_name: v, org_name: v })}
              placeholder={kind === "legal" ? 'ООО "Стройка"' : "Иванов Иван Иванович"}
              wide
            />
            <Field label="ИНН" value={value.inn} onChange={(v) => onChange({ inn: v })} />
            {kind === "legal" && (
              <Field label="КПП" value={value.kpp} onChange={(v) => onChange({ kpp: v })} />
            )}
            <Field
              label={kind === "legal" ? "ОГРН" : "ОГРНИП"}
              value={value.ogrn}
              onChange={(v) => onChange({ ogrn: v })}
            />
            <Field
              label="Юридический адрес"
              value={value.legal_address}
              onChange={(v) => onChange({ legal_address: v })}
              wide
            />
            <Field label="Банк" value={value.bank_name} onChange={(v) => onChange({ bank_name: v })} />
            <Field label="БИК" value={value.bik} onChange={(v) => onChange({ bik: v })} />
            <Field
              label="Расчётный счёт"
              value={value.account_number}
              onChange={(v) => onChange({ account_number: v })}
            />
            <Field
              label="Корр. счёт"
              value={value.correspondent_account}
              onChange={(v) => onChange({ correspondent_account: v })}
            />
            {kind === "legal" && (
              <>
                <Field
                  label="Должность подписанта"
                  value={value.director_position}
                  onChange={(v) => onChange({ director_position: v })}
                  placeholder="генеральный директор"
                />
                <Field
                  label="ФИО подписанта"
                  value={value.director_name}
                  onChange={(v) => onChange({ director_name: v })}
                />
                <Field
                  label="Действует на основании"
                  value={value.acts_basis}
                  onChange={(v) => onChange({ acts_basis: v })}
                  placeholder="Устава"
                />
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-white/10 p-4">
          <div className="mb-3 text-xs uppercase text-white/40">Паспортные данные для договора</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="ФИО полностью"
              value={value.full_name}
              onChange={(v) => onChange({ full_name: v })}
              placeholder="Иванов Иван Иванович"
              wide
            />
            <Field
              label="Серия паспорта"
              value={value.passport_series}
              onChange={(v) => onChange({ passport_series: v })}
              placeholder="0000"
            />
            <Field
              label="Номер паспорта"
              value={value.passport_number}
              onChange={(v) => onChange({ passport_number: v })}
              placeholder="000000"
            />
            <Field
              label="Кем выдан"
              value={value.passport_issued_by}
              onChange={(v) => onChange({ passport_issued_by: v })}
              placeholder="УМВД России по..."
              wide
            />
            <Field
              label="Дата выдачи"
              type="date"
              value={value.passport_issued_date}
              onChange={(v) => onChange({ passport_issued_date: v })}
            />
            <Field
              label="Код подразделения"
              value={value.passport_department_code}
              onChange={(v) => onChange({ passport_department_code: v })}
              placeholder="000-000"
            />
            <Field
              label="Дата рождения"
              type="date"
              value={value.birth_date}
              onChange={(v) => onChange({ birth_date: v })}
            />
            <Field
              label="Адрес регистрации"
              value={value.registration_address}
              onChange={(v) => onChange({ registration_address: v })}
              wide
            />
          </div>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-xs text-white/50">Заметка</label>
        <textarea
          className={`${inputCls} min-h-[70px] resize-y`}
          value={value.notes || ""}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Например: постоянный клиент, работает на объекте в Южном"
        />
      </div>
    </div>
  )
}

export default CounterpartyForm
