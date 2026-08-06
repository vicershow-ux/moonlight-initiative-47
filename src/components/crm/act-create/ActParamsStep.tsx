import Icon from "@/components/ui/icon"
import { ActOptions, Contract, Estimate, ObjectItem } from "@/lib/api"
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
  options: ActOptions
  setOpt: (key: keyof ActOptions, value: string) => void
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
  options,
  setOpt,
  estimates,
  selectedEstimateId,
  setSelectedEstimateId,
  error,
  saving,
  goToWorks,
}: ActParamsStepProps) {
  return (
    <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-6 flex flex-col gap-5">
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

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-white/50">Дата акта</label>
        <input type="date" value={actDate} onChange={(e) => setActDate(e.target.value)} className={fieldClass} />
      </div>

      <div className="border border-white/10 rounded-lg p-4">
        <p className="text-sm font-medium mb-1">Параметры сдачи и приёмки</p>
        <p className="text-xs text-white/40 mb-4">
          Выбранные варианты попадут в акт. Перед выгрузкой их можно проверить и отредактировать в предпросмотре.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
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
              Смета №{est.id} — {formatMoney(est.total_amount)}
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
        className="flex items-center justify-center gap-2 bg-white text-[#161616] text-sm font-medium px-5 py-3 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-60"
      >
        {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : null}
        Далее: подобрать работы
      </button>
    </div>
  )
}

export default ActParamsStep
