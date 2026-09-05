import { RentalContractOptions } from "@/lib/buildRentalContractHtml"

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"

interface Props {
  options: RentalContractOptions
  onChange: (patch: Partial<RentalContractOptions>) => void
}

export function ContractOptionsPanel({ options, onChange }: Props) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1f1f1f] p-4">
      <div className="mb-3 text-xs uppercase text-white/40">Реквизиты договора</div>
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-xs text-white/50">Номер</label>
          <input
            className={inputCls}
            value={options.contract_number || ""}
            onChange={(e) => onChange({ contract_number: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-white/50">Дата</label>
          <input
            className={inputCls}
            type="date"
            value={options.contract_date || ""}
            onChange={(e) => onChange({ contract_date: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-white/50">Город</label>
          <input
            className={inputCls}
            value={options.city || ""}
            onChange={(e) => onChange({ city: e.target.value })}
            placeholder="Хабаровск"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-white/50">Цель использования</label>
          <input
            className={inputCls}
            value={options.purpose || ""}
            onChange={(e) => onChange({ purpose: e.target.value })}
            placeholder="ремонтные работы на объекте"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-white/50">Передача имущества</label>
          <select
            className={inputCls}
            value={options.delivery || "self_pickup"}
            onChange={(e) =>
              onChange({ delivery: e.target.value as "self_pickup" | "by_lessor" })
            }
          >
            <option value="self_pickup">Забирает арендатор</option>
            <option value="by_lessor">Доставляет арендодатель</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Пени, %</label>
            <input
              className={inputCls}
              value={options.penalty_pct || ""}
              onChange={(e) => onChange({ penalty_pct: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Претензия, дн.</label>
            <input
              className={inputCls}
              value={options.claim_days || ""}
              onChange={(e) => onChange({ claim_days: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-white/50">Дополнительные условия</label>
          <textarea
            className={`${inputCls} min-h-[80px] resize-y`}
            value={options.extra_terms || ""}
            onChange={(e) => onChange({ extra_terms: e.target.value })}
            placeholder="Отдельным пунктом в конце договора"
          />
        </div>
      </div>
    </div>
  )
}

export default ContractOptionsPanel
