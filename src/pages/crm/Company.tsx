import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { useAuth } from "@/contexts/AuthContext"
import { companyApi, CompanyData } from "@/lib/api"

const ENTITY_TYPES = ["Физическое лицо", "Самозанятый", "Индивидуальный предприниматель", "Юридическое лицо"]

const ACTIVITY_TYPES = [
  "Не выбран",
  "Ремонт и отделка жилых и коммерческих помещений",
  "Строительство индивидуальных домов",
  "Бетонные работы",
  "Внутренние инженерные системы",
  "Разработка сметной документации",
  "Внешние инженерные системы",
  "Внутренняя отделка промышленных помещений",
  "Строительство промышленных и коммерческих зданий",
  "Благоустройство и ландшафтный дизайн",
  "Прочее",
]

const ESTIMATE_MODES = ["Работы и материалы", "Только работы", "Только материалы"]
const CURRENCIES = ["RUB", "USD", "EUR", "KZT"]
const UNIT_SYSTEMS = ["Метрика", "Имперская"]

const emptyForm: CompanyData = {
  name: "",
  entity_type: "Физическое лицо",
  contact_full_name: "",
  phone: "",
  email: "",
  website: "",
  activity_type: "Не выбран",
  inn: "",
  legal_address: "",
  bank_name: "",
  bik: "",
  account_number: "",
  bank_inn: "",
  bank_kpp: "",
  correspondent_account: "",
  estimate_mode: "Работы и материалы",
  currency: "RUB",
  unit_system: "Метрика",
  signature_url: "",
}

export default function Company() {
  const { user, updateCompanyName } = useAuth()
  const [form, setForm] = useState<CompanyData>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [signatureFile, setSignatureFile] = useState<{ name: string; dataUrl: string } | null>(null)
  const canEdit = user?.role === "owner" || user?.role === "admin"

  useEffect(() => {
    companyApi
      .get()
      .then((data) => setForm({ ...emptyForm, ...data }))
      .finally(() => setLoading(false))
  }, [])

  const update = (field: keyof CompanyData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setSignatureFile({ name: file.name, dataUrl: reader.result as string })
      setSaved(false)
    }
    reader.readAsDataURL(file)
  }

  const isIndividual = form.entity_type === "Физическое лицо" || form.entity_type === "Самозанятый"

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload: Partial<CompanyData> & { signature_file?: string } = { ...form }
      if (isIndividual) {
        payload.name = form.contact_full_name
      }
      if (signatureFile) {
        payload.signature_file = signatureFile.dataUrl
      }
      const updated = await companyApi.update(payload)
      setForm({ ...emptyForm, ...updated })
      setSignatureFile(null)
      setSaved(true)
      if (updated.name) updateCompanyName(updated.name)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <CrmLayout title="Настройки" subtitle="Управление профилем и настройками аккаунта">
        <div className="flex items-center justify-center py-24">
          <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
        </div>
      </CrmLayout>
    )
  }

  const inputClass =
    "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 disabled:opacity-50"
  const labelClass = "text-xs text-white/50 mb-1.5 block"

  return (
    <CrmLayout title="Настройки" subtitle="Управление профилем и настройками аккаунта">
      <div className="max-w-3xl">
        <div className="mb-6">
          <h2 className="text-base font-semibold">Компания</h2>
          <p className="text-sm text-white/40 mt-0.5">Реквизиты, брендинг и дефолтные настройки компании</p>
        </div>

        <Link
          to="/cabinet/company/pipeline"
          className="flex items-center justify-between gap-2 px-6 py-4 mb-6 border border-white/10 rounded-xl bg-[#1f1f1f] hover:border-[#D4AF37]/40 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <Icon name="GitBranch" size={16} className="text-[#D4AF37]" />
            <span className="text-sm font-medium">Воронка объектов</span>
          </div>
          <Icon name="ChevronRight" size={16} className="text-white/30 group-hover:text-white/60 transition-colors" />
        </Link>

        <div className="bg-[#1f1f1f] border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 space-y-5">
            <div>
              <label className={labelClass}>Тип субъекта</label>
              <select
                className={inputClass}
                value={form.entity_type}
                onChange={(e) => update("entity_type", e.target.value)}
                disabled={!canEdit}
              >
                {ENTITY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {isIndividual ? (
              <div>
                <label className={labelClass}>ФИО <span className="text-[#D4AF37]">*</span></label>
                <input
                  className={inputClass}
                  value={form.contact_full_name}
                  onChange={(e) => update("contact_full_name", e.target.value)}
                  placeholder="Иванов Иван Иванович"
                  disabled={!canEdit}
                />
              </div>
            ) : (
              <>
                <div>
                  <label className={labelClass}>Название компании <span className="text-[#D4AF37]">*</span></label>
                  <input
                    className={inputClass}
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="ООО «Название»"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className={labelClass}>ФИО руководителя <span className="text-[#D4AF37]">*</span></label>
                  <input
                    className={inputClass}
                    value={form.contact_full_name}
                    onChange={(e) => update("contact_full_name", e.target.value)}
                    placeholder="Иванов Иван Иванович"
                    disabled={!canEdit}
                  />
                </div>
              </>
            )}

            <div>
              <label className={labelClass}>Телефон</label>
              <input
                className={inputClass}
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+7 (999) 000-00-00"
                disabled={!canEdit}
              />
            </div>

            <div>
              <label className={labelClass}>Email компании</label>
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="info@company.ru"
                disabled={!canEdit}
              />
            </div>

            <div>
              <label className={labelClass}>Сайт</label>
              <input
                className={inputClass}
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                placeholder="company.ru"
                disabled={!canEdit}
              />
            </div>

            <div>
              <label className={labelClass}>Основной вид деятельности</label>
              <select
                className={inputClass}
                value={form.activity_type}
                onChange={(e) => update("activity_type", e.target.value)}
                disabled={!canEdit}
              >
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="border border-white/10 rounded-lg p-4 space-y-4">
              <p className="text-sm font-medium text-white/80">Реквизиты</p>

              <div>
                <label className={labelClass}>ИНН</label>
                <input
                  className={inputClass}
                  value={form.inn}
                  onChange={(e) => update("inn", e.target.value)}
                  disabled={!canEdit}
                />
              </div>

              <div>
                <label className={labelClass}>Фактический адрес проживания</label>
                <textarea
                  rows={3}
                  className={`${inputClass} resize-none`}
                  value={form.legal_address}
                  onChange={(e) => update("legal_address", e.target.value)}
                  disabled={!canEdit}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Банк-получатель</label>
                  <input
                    className={inputClass}
                    value={form.bank_name}
                    onChange={(e) => update("bank_name", e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className={labelClass}>БИК</label>
                  <input
                    className={inputClass}
                    value={form.bik}
                    onChange={(e) => update("bik", e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className={labelClass}>Номер счёта</label>
                  <input
                    className={inputClass}
                    value={form.account_number}
                    onChange={(e) => update("account_number", e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>ИНН банка</label>
                  <input
                    className={inputClass}
                    value={form.bank_inn}
                    onChange={(e) => update("bank_inn", e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className={labelClass}>КПП банка</label>
                  <input
                    className={inputClass}
                    value={form.bank_kpp}
                    onChange={(e) => update("bank_kpp", e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Корр. счёт</label>
                <input
                  className={inputClass}
                  value={form.correspondent_account}
                  onChange={(e) => update("correspondent_account", e.target.value)}
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Режим смет</label>
                <select
                  className={inputClass}
                  value={form.estimate_mode}
                  onChange={(e) => update("estimate_mode", e.target.value)}
                  disabled={!canEdit}
                >
                  {ESTIMATE_MODES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Валюта</label>
                <select
                  className={inputClass}
                  value={form.currency}
                  onChange={(e) => update("currency", e.target.value)}
                  disabled={!canEdit}
                >
                  {CURRENCIES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Система единиц</label>
                <select
                  className={inputClass}
                  value={form.unit_system}
                  onChange={(e) => update("unit_system", e.target.value)}
                  disabled={!canEdit}
                >
                  {UNIT_SYSTEMS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Подпись</label>
              {form.signature_url && !signatureFile && (
                <div className="mb-2 flex items-center gap-3 bg-[#161616] border border-white/10 rounded-lg px-3 py-2">
                  <img src={form.signature_url} alt="Подпись" className="h-10 object-contain bg-white rounded" />
                  <span className="text-xs text-white/40">Текущая подпись</span>
                </div>
              )}
              {canEdit && (
                <label className="flex items-center gap-2 bg-[#161616] border border-dashed border-white/15 rounded-lg px-3 py-2.5 text-sm text-white/60 cursor-pointer hover:border-[#D4AF37]/40 transition-colors w-fit">
                  <Icon name="Paperclip" size={15} />
                  {signatureFile ? signatureFile.name : "Прикрепить файл подписи"}
                  <span className="text-[10px] text-white/30 ml-1">PNG/JPG, до 2 MB</span>
                  <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleSignatureChange} />
                </label>
              )}
            </div>

            {canEdit && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm font-medium px-5 py-2.5 rounded-lg disabled:opacity-60"
                >
                  {saving ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Check" size={14} />}
                  Сохранить
                </button>
                {saved && <span className="text-xs text-green-400 flex items-center gap-1"><Icon name="CheckCircle2" size={14} />Сохранено</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </CrmLayout>
  )
}