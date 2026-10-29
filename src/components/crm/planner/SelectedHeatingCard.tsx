import Icon from "@/components/ui/icon"
import { DeleteButton } from "@/components/ui/delete-button"
import { fmtNum, fromMm, toMm } from "@/lib/planner/geometry"
import { HEATING_PRESETS, HeatingKind, PlanHeating, PlanScheme } from "@/lib/planner/types"
import { heatingCalc, zoneLayout } from "@/lib/planner/interior"

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"
const labelCls = "mb-1.5 block text-xs text-white/50"

interface Props {
  zone: PlanHeating
  scheme: PlanScheme
  onUpdate: (id: string, patch: Partial<PlanHeating>) => void
  onDelete: (id: string) => void
}

/** Карточка зоны тёплого пола: тип, мощность, шаг укладки и расчёт площади, мощности, длины */
export function SelectedHeatingCard({ zone, scheme, onUpdate, onDelete }: Props) {
  const c = heatingCalc(scheme, zone)
  const lay = zoneLayout(scheme, zone)
  const pr = HEATING_PRESETS[zone.kind]
  const hasStep = zone.kind === "cable" || zone.kind === "water"
  const room = scheme.rooms.find((r) => r.id === zone.roomId)
  return (
    <div className="rounded-xl border border-[#f97316]/40 bg-[#1f1f1f] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon name="Thermometer" size={15} />
          Тёплый пол{room ? ` · ${room.name}` : ""}
        </div>
        <DeleteButton onConfirm={() => onDelete(zone.id)} title="Удалить зону тёплого пола?" />
      </div>

      <div className="mb-3">
        <label className={labelCls}>Тип</label>
        <select
          className={inputCls}
          value={zone.kind}
          onChange={(e) => {
            const k = e.target.value as HeatingKind
            onUpdate(zone.id, { kind: k, power: HEATING_PRESETS[k].power, step: HEATING_PRESETS[k].step })
          }}
        >
          {(Object.keys(HEATING_PRESETS) as HeatingKind[]).map((k) => (
            <option key={k} value={k}>
              {HEATING_PRESETS[k].label} — {HEATING_PRESETS[k].hint}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>{zone.kind === "water" ? "Теплоотдача" : "Мощность"}, Вт/м²</label>
          <input
            className={inputCls}
            type="number"
            min="50"
            step="10"
            value={zone.power}
            onChange={(e) => onUpdate(zone.id, { power: Math.max(Number(e.target.value) || 0, 0) })}
          />
        </div>
        {hasStep && (
          <div>
            <label className={labelCls}>Шаг укладки, мм</label>
            <input
              className={inputCls}
              type="number"
              min="50"
              step="10"
              value={toMm(zone.step ?? pr.step ?? 0.1)}
              onChange={(e) => onUpdate(zone.id, { step: Math.max(fromMm(Number(e.target.value)), 0.03) })}
            />
          </div>
        )}
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Направление укладки</label>
          <select className={inputCls} value={zone.dir || "auto"} onChange={(e) => onUpdate(zone.id, { dir: e.target.value as PlanHeating["dir"] })}>
            <option value="auto">Авто — вдоль длинной стороны</option>
            <option value="x">По горизонтали плана</option>
            <option value="y">По вертикали плана</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Отступ от стен и мебели, мм</label>
          <input
            className={inputCls}
            type="number"
            min="0"
            step="10"
            value={toMm(zone.margin ?? 0.05)}
            onChange={(e) => onUpdate(zone.id, { margin: Math.max(fromMm(Number(e.target.value)), 0) })}
          />
        </div>
      </div>

      <label className="mb-3 flex items-center gap-2 text-sm text-white/70">
        <input type="checkbox" checked={zone.cutFurniture} onChange={(e) => onUpdate(zone.id, { cutFurniture: e.target.checked })} />
        Не укладывать под мебелью без ножек и сантехникой
      </label>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          ["Площадь контура", `${fmtNum(c.gross, 2)} м²`],
          ["Под мебелью", `${fmtNum(c.blocked, 2)} м²`],
          ["Обогрев", `${fmtNum(c.net, 2)} м²`],
          [zone.kind === "water" ? "Теплоотдача" : "Мощность", `${c.watts} Вт${c.amps ? ` · ${fmtNum(c.amps, 1)} А` : ""}`],
          ...(hasStep ? [[zone.kind === "water" ? "Труба по раскладке" : "Кабель по раскладке", `${fmtNum(c.length, 1)} м`]] : []),
          ["Полос / рядов", `${lay.lanes}${lay.runs.length > 1 ? ` · ${lay.runs.length} участка` : ""}`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-[#161616] p-2">
            <div className="text-white/40">{k}</div>
            <div className="font-semibold">{v}</div>
          </div>
        ))}
      </div>
      {zone.kind === "water" && c.length > 90 && (
        <div className="mt-2 text-xs text-amber-400">Контур длиннее 90 м — разбейте зону на две петли</div>
      )}
      <div className="mt-2 text-[11px] text-white/40">
        На плане: синяя точка — датчик пола, зелёная — начало укладки и подводка к терморегулятору. Тяните зону или её углы мышью
      </div>
      {zone.kind !== "water" && c.amps > 16 && (
        <div className="mt-2 text-xs text-amber-400">Больше 16 А — нужен контактор или разделение на две зоны с отдельными терморегуляторами</div>
      )}
    </div>
  )
}

export default SelectedHeatingCard
