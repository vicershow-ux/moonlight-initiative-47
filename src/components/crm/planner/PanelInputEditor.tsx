import Icon from "@/components/ui/icon"
import {
  inputDeviceModules,
  inputDevicePositions,
  inputLimitAmps,
  newInputDevice,
} from "@/lib/planner/panelInput"
import {
  INPUT_CABLES,
  INPUT_DEVICE_INFO,
  InputDevice,
  InputDeviceKind,
  PanelSettings,
} from "@/lib/planner/types"

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-[#D4AF37]/50"

const KINDS = Object.keys(INPUT_DEVICE_INFO) as InputDeviceKind[]

interface Props {
  panel: PanelSettings
  issues: string[]
  onUpdate: (patch: Partial<PanelSettings>) => void
}

/**
 * Ввод щита — цепочка аппаратов от кабеля до шины групп.
 * Порядок в списке = порядок на однолинейной схеме и на DIN-рейке.
 * Любой аппарат можно заменить другим прямо на его месте
 */
export function PanelInputEditor({ panel, issues, onUpdate }: Props) {
  const devices = panel.devices
  const pos = inputDevicePositions(devices)
  const limit = inputLimitAmps(devices)
  const inputModules = devices.reduce((s, d) => s + inputDeviceModules(d, panel.phases), 0)

  const setDevices = (next: InputDevice[]) => onUpdate({ devices: next })
  const patch = (id: string, p: Partial<InputDevice>) =>
    setDevices(devices.map((d) => (d.id === id ? { ...d, ...p } : d)))

  /** Замена на месте: другой вид аппарата встаёт в ту же позицию цепочки */
  const replace = (id: string, kind: InputDeviceKind) =>
    setDevices(
      devices.map((d) =>
        d.id === id ? { ...newInputDevice(kind, d.rating || limit || 40), id: d.id } : d,
      ),
    )

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= devices.length) return
    const next = [...devices]
    ;[next[i], next[j]] = [next[j], next[i]]
    setDevices(next)
  }

  return (
    <div className="mb-3 rounded-lg border border-white/10 bg-[#161616] p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs text-white/50">Ввод щита</div>
        <div className="text-xs text-white/40">{inputModules} мод.</div>
      </div>

      <div className="mb-2 grid grid-cols-2 gap-2">
        <input
          className={inputCls}
          value={panel.name}
          placeholder="ЩР-1"
          title="Обозначение щита"
          onChange={(e) => onUpdate({ name: e.target.value })}
        />
        <select
          className={inputCls}
          value={panel.phases}
          onChange={(e) => onUpdate({ phases: Number(e.target.value) as 1 | 3 })}
        >
          <option value={1}>1 фаза, 220 В</option>
          <option value={3}>3 фазы, 380 В</option>
        </select>
        <select
          className={`${inputCls} col-span-2`}
          value={panel.inputCable}
          title="Вводной кабель"
          onChange={(e) => onUpdate({ inputCable: e.target.value })}
        >
          {INPUT_CABLES.map((c) => (
            <option key={c} value={c}>
              Вводной кабель {c}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-white/40">
        <Icon name="ArrowDown" size={11} />
        Сверху вниз — по линии питания, от кабеля к шине групп
      </div>

      <div className="space-y-1.5">
        {devices.map((d, i) => {
          const info = INPUT_DEVICE_INFO[d.kind]
          const mods = inputDeviceModules(d, panel.phases)
          return (
            <div key={d.id} className="rounded-lg border border-white/10 bg-[#1c1c1c] p-2">
              <div className="mb-1.5 flex items-center gap-1.5">
                <span className="w-11 shrink-0 text-xs font-medium text-[#D4AF37]">{pos.get(d.id)}</span>
                <select
                  className={inputCls}
                  value={d.kind}
                  title="Заменить аппарат"
                  onChange={(e) => replace(d.id, e.target.value as InputDeviceKind)}
                >
                  {KINDS.map((k) => (
                    <option key={k} value={k}>
                      {INPUT_DEVICE_INFO[k].label}
                    </option>
                  ))}
                </select>
                <div className="flex shrink-0">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    title="Выше по линии"
                    className="rounded p-1 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-20"
                  >
                    <Icon name="ChevronUp" size={14} />
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === devices.length - 1}
                    title="Ниже по линии"
                    className="rounded p-1 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-20"
                  >
                    <Icon name="ChevronDown" size={14} />
                  </button>
                  <button
                    onClick={() => setDevices(devices.filter((x) => x.id !== d.id))}
                    title="Убрать с ввода"
                    className="rounded p-1 text-white/40 hover:bg-red-500/15 hover:text-red-400"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pl-[50px]">
                {d.kind !== "spd" && (
                  <select
                    className={`${inputCls} w-auto`}
                    value={d.rating}
                    title={d.kind === "meter" ? "Максимальный ток счётчика" : "Номинальный ток"}
                    onChange={(e) => patch(d.id, { rating: Number(e.target.value) })}
                  >
                    {info.ratings.map((r) => (
                      <option key={r} value={r}>
                        {d.kind === "meter" ? `до ${r} А` : `${r} А`}
                      </option>
                    ))}
                  </select>
                )}

                {(d.kind === "breaker" || d.kind === "rcbo") && (
                  <select
                    className={`${inputCls} w-auto`}
                    value={d.curve || "C"}
                    title="Характеристика"
                    onChange={(e) => patch(d.id, { curve: e.target.value as "B" | "C" | "D" })}
                  >
                    {["B", "C", "D"].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}

                {(d.kind === "rcd" || d.kind === "rcbo") && (
                  <select
                    className={`${inputCls} w-auto`}
                    value={d.leakage ?? 30}
                    title="Ток утечки"
                    onChange={(e) => patch(d.id, { leakage: Number(e.target.value) })}
                  >
                    {[10, 30, 100, 300].map((m) => (
                      <option key={m} value={m}>
                        {m} мА
                      </option>
                    ))}
                  </select>
                )}

                {d.kind === "meter" && (
                  <select
                    className={`${inputCls} w-auto`}
                    value={d.meterType || "din"}
                    onChange={(e) => patch(d.id, { meterType: e.target.value as "din" | "panel" })}
                  >
                    <option value="din">на DIN-рейку</option>
                    <option value="panel">навесной</option>
                  </select>
                )}

                {!(d.kind === "meter" && d.meterType === "panel") && (
                  <label className="flex items-center gap-1 text-xs text-white/40" title="Ширина модели в DIN-модулях">
                    <input
                      className={`${inputCls} w-12 px-1.5 text-center`}
                      type="number"
                      min="1"
                      max="12"
                      value={mods}
                      onChange={(e) => {
                        const v = Number(e.target.value)
                        patch(d.id, { modules: v > 0 ? v : undefined })
                      }}
                    />
                    мод.
                  </label>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <select
        className={`${inputCls} mt-2 text-[#D4AF37]`}
        value=""
        onChange={(e) => {
          if (!e.target.value) return
          setDevices([...devices, newInputDevice(e.target.value as InputDeviceKind, limit || 40)])
        }}
      >
        <option value="">+ Добавить аппарат на ввод…</option>
        {KINDS.map((k) => (
          <option key={k} value={k}>
            {INPUT_DEVICE_INFO[k].label}
          </option>
        ))}
      </select>

      {issues.length > 0 && (
        <div className="mt-2 space-y-1 text-xs text-amber-400">
          {issues.map((w) => (
            <div key={w} className="flex items-start gap-1.5">
              <Icon name="TriangleAlert" size={12} className="mt-0.5 shrink-0" />
              {w}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PanelInputEditor
