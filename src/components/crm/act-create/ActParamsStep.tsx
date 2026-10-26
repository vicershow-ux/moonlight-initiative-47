import Icon from "@/components/ui/icon"
import { ActOptions, CompanyData, Contract, Estimate, ObjectItem } from "@/lib/api"
import { contractPayments } from "@/lib/invoiceSources"
import { SignStampToggles } from "@/components/crm/common/SignStampToggles"
import { ActAttachments } from "./ActAttachments"
import {
  ACT_TYPES,
  SCOPE_OPTIONS,
  INSPECTION_OPTIONS,
  CALCULATION_OPTIONS,
  fieldClass,
  formatMoney,
} from "./constants"

interface ActParamsStepProps {
  contract: Contract | null
  object: ObjectItem | null
  actType: string
  setActType: (v: string) => void
  actDate: string
  setActDate: (v: string) => void
  actNumber: string
  setActNumber: (v: string) => void
  options: ActOptions
  setOpt: (key: keyof ActOptions, value: ActOptions[keyof ActOptions]) => void
  company?: CompanyData | null
  estimates: Estimate[]
  selectedEstimateId: number | null
  setSelectedEstimateId: (v: number | null) => void
  error: string
  saving: boolean
  goToWorks: () => void
}

export function ActParamsStep({
  contract,
  object,
  actType,
  setActType,
  actDate,
  setActDate,
  actNumber,
  setActNumber,
  options,
  setOpt,
  company,
  estimates,
  selectedEstimateId,
  setSelectedEstimateId,
  error,
  saving,
  goToWorks,
}: ActParamsStepProps) {
  return (
    <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-6 flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-white/50">Договор</label>
        <input
          disabled
          value={contract ? `Договор №${contract.contract_number} от ${contract.contract_date}` : "Без договора"}
          className={`${fieldClass} opacity-70`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-white/50">Объект</label>
        <input disabled value={object?.address || object?.object_code || "—"} className={`${fieldClass} opacity-70`} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-white/50">Тип акта</label>
        <select value={actType} onChange={(e) => setActType(e.target.value)} className={fieldClass}>
          {ACT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/50">Номер акта</label>
          <input
            value={actNumber}
            onChange={(e) => setActNumber(e.target.value)}
            placeholder="Присвоится автоматически"
            className={fieldClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/50">Дата акта</label>
          <input type="date" value={actDate} onChange={(e) => setActDate(e.target.value)} className={fieldClass} />
        </div>
      </div>

      <div className="border border-white/10 rounded-lg p-3 sm:p-4">
        <p className="text-sm font-medium mb-1">Параметры сдачи и приёмки</p>
        <p className="text-xs text-white/40 mb-4">
          Выбранные варианты попадут в акт. Перед выгрузкой их можно проверить и отредактировать в предпросмотре.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50">Период с (необязательно)</label>
            <input type="date" value={options.period_from} onChange={(e) => setOpt("period_from", e.target.value)} className={fieldClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50">Период по (необязательно)</label>
            <input type="date" value={options.period_to} onChange={(e) => setOpt("period_to", e.target.value)} className={fieldClass} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs text-white/50">Объём приёмки</label>
          <select value={options.scope} onChange={(e) => setOpt("scope", e.target.value)} className={fieldClass}>
            {SCOPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {options.scope === "stage" && contract && (() => {
          const stages = contractPayments(contract).filter((p) => p.key !== "full" && p.amount > 0)
          if (!stages.length) {
            return (
              <p className="text-xs text-white/40 mb-4 -mt-2">
                В договоре нет графика этапов — отметьте выполненные работы вручную на следующем шаге.
              </p>
            )
          }
          return (
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-xs text-white/50">Этап по договору</label>
              <div className="flex flex-wrap gap-2">
                {stages.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => {
                      setOpt("stage_key", p.key)
                      setOpt("stage_label", p.label)
                      setOpt("stage_amount", p.amount)
                    }}
                    className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                      options.stage_key === p.key ? "bg-[#D4AF37] text-[#161616]" : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {p.label} · {formatMoney(p.amount)}
                  </button>
                ))}
              </div>
              <p className="text-xs text-white/40">
                В акт попадёт весь перечень работ из сметы на сумму этапа — с теми же количеством и ценами, что в счёте и чеке.
              </p>
            </div>
          )
        })()}

        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs text-white/50">Результат осмотра</label>
          <select value={options.inspection_result} onChange={(e) => setOpt("inspection_result", e.target.value)} className={fieldClass}>
            {INSPECTION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs text-white/50">Расчёты по акту</label>
          <select value={options.calculation} onChange={(e) => setOpt("calculation", e.target.value)} className={fieldClass}>
            {CALCULATION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/50">Приложения и переданные документы (необязательно)</label>
          <textarea
            value={options.appendix}
            onChange={(e) => setOpt("appendix", e.target.value)}
            placeholder="Фото, дефектная ведомость, гарантийные документы..."
            rows={3}
            className={`${fieldClass} resize-none`}
          />
          {object && (
            <ActAttachments
              objectId={object.id}
              value={options.attachments || []}
              onChange={(v) => setOpt("attachments", v)}
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {([
            ["executor_gender", "Исполнитель в тексте акта"],
            ["customer_gender", "Заказчик в тексте акта"],
          ] as const).map(([key, label]) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">{label}</label>
              <div className="flex rounded-lg bg-white/5 p-1">
                {([
                  ["m", "именуемый"],
                  ["f", "именуемая"],
                ] as const).map(([val, text]) => {
                  const active = (options[key] || "m") === val
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setOpt(key, val)}
                      className={`flex-1 rounded-md px-3 py-2 text-sm transition-colors ${active ? "bg-[#D4AF37] text-[#161616] font-medium" : "text-white/60 hover:text-white"}`}
                    >
                      {text}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1.5 mt-4">
          <label className="text-xs text-white/50">
            {contract?.options?.our_role === "customer" ? "Ваша подпись и печать — как Заказчика" : "Подпись и печать Исполнителя"}
          </label>
          <SignStampToggles
            signatureUrl={company?.signature_url}
            stampUrl={company?.stamp_url}
            applySignature={Boolean(options.apply_signature)}
            applyStamp={Boolean(options.apply_stamp)}
            onChange={(k, v) => setOpt(k, v)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-white/50">Выберите смету</label>
        <select
          value={selectedEstimateId ?? ""}
          onChange={(e) => setSelectedEstimateId(e.target.value ? Number(e.target.value) : null)}
          className={fieldClass}
        >
          <option value="">Смета не выбрана</option>
          {estimates.map((est) => (
            <option key={est.id} value={est.id}>
              Смета №{est.estimate_number || est.id} — {formatMoney(est.total_amount)}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1.5">
          <Icon name="CircleAlert" size={15} />
          {error}
        </p>
      )}

      <button
        onClick={goToWorks}
        disabled={saving}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-[#161616] text-sm font-medium px-5 py-3 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-60"
      >
        {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : null}
        Далее: подобрать работы
      </button>
    </div>
  )
}

export default ActParamsStep
