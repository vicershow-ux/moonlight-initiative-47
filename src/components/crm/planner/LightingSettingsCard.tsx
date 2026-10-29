import Icon from "@/components/ui/icon"
import { fmtNum } from "@/lib/planner/geometry"
import { LightingSettings, PlanScheme, lightingSettings } from "@/lib/planner/types"
import { fixtureLength, floatingContour, floatingPerimeter } from "@/lib/planner/fixtures"

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"
const labelCls = "mb-1.5 block text-xs text-white/50"

interface Props {
  scheme: PlanScheme
  onUpdate: (patch: Partial<LightingSettings>) => void
}

/** Мощности трековых светильников и ленты — по ним в смете подбираются блоки питания */
export function LightingSettingsCard({ scheme, onUpdate }: Props) {
  const fixtures = scheme.fixtures || []
  const tracks = fixtures.filter((f) => f.kind === "track")
  const floats = fixtures.filter((f) => f.kind === "floating")
  if (!tracks.length && !floats.length) return null

  const lt = lightingSettings(scheme.lighting)
  const k = 1 + lt.psuReserve / 100
  const trackW = tracks.reduce((s, t) => s + fixtureLength(t), 0) * lt.trackWPerM
  const stripW =
    floats.reduce((s, f) => {
      const c = floatingContour(scheme, f)
      return s + (c ? floatingPerimeter(c) : 0)
    }, 0) * lt.stripWPerM

  const num = (v: string, min = 0) => Math.max(Number(v.replace(",", ".")) || 0, min)

  return (
    <div className="rounded-xl border border-white/10 bg-[#1f1f1f] p-4">
      <div className="mb-3 flex items-center gap-2 text-xs uppercase text-white/40">
        <Icon name="Zap" size={13} />
        Блоки питания освещения
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        {tracks.length > 0 && (
          <div>
            <label className={labelCls}>Светильники на треке, Вт/м</label>
            <input
              className={inputCls}
              type="number"
              min="0"
              step="1"
              value={lt.trackWPerM}
              onChange={(e) => onUpdate({ trackWPerM: num(e.target.value) })}
            />
          </div>
        )}
        {floats.length > 0 && (
          <div>
            <label className={labelCls}>Лента парящего потолка, Вт/м</label>
            <input
              className={inputCls}
              type="number"
              min="0"
              step="0.1"
              value={lt.stripWPerM}
              onChange={(e) => onUpdate({ stripWPerM: num(e.target.value) })}
            />
          </div>
        )}
        <div>
          <label className={labelCls}>Запас мощности, %</label>
          <input
            className={inputCls}
            type="number"
            min="0"
            step="5"
            value={lt.psuReserve}
            onChange={(e) => onUpdate({ psuReserve: num(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-1 text-xs text-white/50">
        {tracks.length > 0 && (
          <div className="flex justify-between">
            <span>Треки, всего с запасом</span>
            <span className="text-[#D4AF37]">{fmtNum(trackW * k, 0)} Вт</span>
          </div>
        )}
        {floats.length > 0 && (
          <div className="flex justify-between">
            <span>Лента, всего с запасом</span>
            <span className="text-[#D4AF37]">{fmtNum(stripW * k, 0)} Вт</span>
          </div>
        )}
        <div className="pt-1 text-white/35">
          Мощность светильников на метр — сумма ватт светильников на треке, делённая на его длину. Блок питания подбирается на каждый трек и контур.
        </div>
      </div>
    </div>
  )
}

export default LightingSettingsCard
