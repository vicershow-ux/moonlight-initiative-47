import Icon from "@/components/ui/icon"
import { lineDeviceModules, lineDevicePositions } from "@/lib/planner/panelDiagram"
import {
  LINE_DEVICE_INFO,
  LineDevice,
  LineDeviceKind,
  PlanGroup,
  breakerAmps,
} from "@/lib/planner/types"

const inputCls =
  "bg-[#161616] border border-white/10 rounded-lg px-2 py-1 text-xs outline-none focus:border-[#D4AF37]/50"

const KINDS = Object.keys(LINE_DEVICE_INFO) as LineDeviceKind[]
const uid = () => Math.random().toString(36).slice(2, 10)

interface Props {
  group: PlanGroup
  onChange: (devices: LineDevice[]) => void
}

/**
 * Аппараты на линии группы после автомата: контактор, реле времени и т.д.
 * Порядок — как на схеме сверху вниз; любой аппарат меняется на другой на том же месте
 */
export function LineDevicesEditor({ group, onChange }: Props) {
  const devices = group.devices || []
  const pos = lineDevicePositions(group)
  const amps = breakerAmps(group.breaker)

  const make = (kind: LineDeviceKind, id = uid()): LineDevice => {
    const r = LINE_DEVICE_INFO[kind].ratings
    return { id, kind, rating: r.find((x) => x >= amps) ?? r[r.length - 1] }
  }
  const patch = (id: string, p: Partial<LineDevice>) =>
    onChange(devices.map((d) => (d.id === id ? { ...d, ...p } : d)))
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= devices.length) return
    const next = [...devices]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div className="mb-2">
      {devices.length > 0 && (
        <div className="mb-1.5 space-y-1">
          {devices.map((d, i) => {
            const info = LINE_DEVICE_INFO[d.kind]
            const weak = info.ratings[0] > 2 && d.rating < amps
            return (
              <div key={d.id} className="flex items-center gap-1">
                <span className="w-9 shrink-0 text-[11px] font-medium text-[#D4AF37]">{pos.get(d.id)}</span>
                <select
                  className={`${inputCls} min-w-0 flex-1`}
                  value={d.kind}
                  title="Заменить аппарат"
                  onChange={(e) => onChange(devices.map((x) => (x.id === d.id ? make(e.target.value as LineDeviceKind, d.id) : x)))}
                >
                  {KINDS.map((k) => (
                    <option key={k} value={k}>
                      {LINE_DEVICE_INFO[k].label}
                    </option>
                  ))}
                </select>
                {info.ratings.length > 1 && (
                  <select
                    className={`${inputCls} ${weak ? "border-amber-500/60 text-amber-400" : ""}`}
                    value={d.rating}
                    title={weak ? `Номинал меньше автомата группы (${amps} А)` : "Номинальный ток"}
                    onChange={(e) => patch(d.id, { rating: Number(e.target.value) })}
                  >
                    {info.ratings.map((r) => (
                      <option key={r} value={r}>
                        {r} А
                      </option>
                    ))}
                  </select>
                )}
                <input
                  className={`${inputCls} w-9 px-1 text-center`}
                  type="number"
                  min="1"
                  max="12"
                  title="Ширина в DIN-модулях"
                  value={lineDeviceModules(d)}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    patch(d.id, { modules: v > 0 ? v : undefined })
                  }}
                />
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  title="Выше по линии"
                  className="rounded p-0.5 text-white/50 hover:bg-white/10 disabled:opacity-20"
                >
                  <Icon name="ChevronUp" size={13} />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === devices.length - 1}
                  title="Ниже по линии"
                  className="rounded p-0.5 text-white/50 hover:bg-white/10 disabled:opacity-20"
                >
                  <Icon name="ChevronDown" size={13} />
                </button>
                <button
                  onClick={() => onChange(devices.filter((x) => x.id !== d.id))}
                  title="Убрать с линии"
                  className="rounded p-0.5 text-white/40 hover:bg-red-500/15 hover:text-red-400"
                >
                  <Icon name="X" size={13} />
                </button>
              </div>
            )
          })}
        </div>
      )}
      <select
        className={`${inputCls} w-full text-[#D4AF37]`}
        value=""
        onChange={(e) => e.target.value && onChange([...devices, make(e.target.value as LineDeviceKind)])}
      >
        <option value="">+ Аппарат на линию (контактор, реле…)</option>
        {KINDS.map((k) => (
          <option key={k} value={k}>
            {LINE_DEVICE_INFO[k].label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default LineDevicesEditor
