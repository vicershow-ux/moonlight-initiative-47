import { useState } from "react"
import Icon from "@/components/ui/icon"
import { ClientRequisites, objectsApi } from "@/lib/api"

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
  { key: "basis", label: "Действует на основании", placeholder: "Устава — если пусто, в договор не попадёт" },
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
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null)
  const inn = value.inn || ""
  const fill = async () => {
    setLoading(true)
    setNote(null)
    try {
      const { status, ...found } = await objectsApi.partyByInn(inn)
      // Банковские реквизиты в реестре нет — их оставляем как были
      const next: ClientRequisites = { ...value }
      for (const [k, v] of Object.entries(found) as [Key, string][]) if (v) next[k] = v
      onChange(next)
      setNote(
        status && status !== "ACTIVE"
          ? { ok: false, text: "Заполнено, но организация в реестре не действующая — проверьте" }
          : { ok: true, text: "Заполнено по ЕГРЮЛ — банк и счёт введите вручную" },
      )
    } catch (e) {
      setNote({ ok: false, text: e instanceof Error ? e.message : "Не удалось получить реквизиты" })
    } finally {
      setLoading(false)
    }
  }
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
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-white/50">
          ИНН <span className="text-red-400">*</span>
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={inn}
            inputMode="numeric"
            onChange={(e) => set("inn", e.target.value, 12)}
            onKeyDown={(e) => e.key === "Enter" && (inn.length === 10 || inn.length === 12) && (e.preventDefault(), fill())}
            placeholder="10 цифр для ООО, 12 — для ИП"
            className={input}
          />
          <button
            type="button"
            onClick={fill}
            disabled={loading || (inn.length !== 10 && inn.length !== 12)}
            className="flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-lg bg-[#D4AF37] px-4 text-sm text-[#161616] transition-colors hover:bg-[#B8860B] disabled:opacity-40"
          >
            <Icon name={loading ? "Loader2" : "Sparkles"} size={15} className={loading ? "animate-spin" : ""} />
            Заполнить по ИНН
          </button>
        </div>
        {note && (
          <p className={`text-xs ${note.ok ? "text-emerald-400" : "text-amber-400"}`}>
            {note.text}
            {!note.ok && /Интеграции/.test(note.text) && (
              <>
                {" "}
                <a href="/cabinet/integrations/dadata" className="text-[#D4AF37] underline">
                  Открыть настройки
                </a>
              </>
            )}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{FIELDS.filter((f) => f.key !== "inn").map(field)}</div>
      <p className="text-xs uppercase tracking-wide text-white/40">Банковские реквизиты</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{BANK.map(field)}</div>
    </div>
  )
}

export default ClientRequisitesForm
