import Icon from "@/components/ui/icon"
import { fmtNum } from "@/lib/planner/geometry"
import { HEATING_PRESETS, PlanHeating, PlanScheme } from "@/lib/planner/types"
import { heatingCalc, heatingSupply, thermostatZones } from "@/lib/planner/interior"
import { groupSummaries } from "@/lib/planner/groups"

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-[#D4AF37]/50"

interface Props {
  scheme: PlanScheme
  onUpdateHeating: (id: string, patch: Partial<PlanHeating>) => void
  onSelectNode: (id: string) => void
}

/**
 * Тёплый пол на слое «Электрика»: по каждой зоне — площадь, мощность, ток,
 * терморегулятор, рекомендуемый автомат и кабель питания, в какой группе щита
 */
export function HeatingElectricCard({ scheme, onUpdateHeating, onSelectNode }: Props) {
  const zones = (scheme.heating || []).filter((h) => h.kind !== "water")
  if (!zones.length) return null
  const ths = (scheme.nodes || []).filter((n) => n.kind === "thermostat")
  const byThermostat = thermostatZones(scheme)
  const zoneTh = new Map<string, string>()
  for (const [tid, list] of byThermostat) for (const h of list) zoneTh.set(h.id, tid)

  // В какой группе терморегулятор — по кабелю, который к нему подходит
  const sums = groupSummaries(scheme)
  const groupOf = (tid: string) => {
    const l = (scheme.links || []).find((x) => x.layer === "electric" && (x.fromId === tid || x.toId === tid) && x.groupId)
    return l ? (scheme.groups || []).find((g) => g.id === l.groupId) || null : null
  }
  const roomName = (id: string | null) => scheme.rooms.find((r) => r.id === id)?.name || "—"
  const total = zones.reduce((s, h) => s + heatingCalc(scheme, h).watts, 0)

  return (
    <div className="rounded-xl border border-[#f97316]/30 bg-[#1f1f1f] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs uppercase text-white/40">
          <Icon name="Thermometer" size={13} />
          Тёплый пол
        </div>
        <span className="text-sm font-semibold text-[#fdba74]">{fmtNum(total / 1000, 2)} кВт</span>
      </div>

      <div className="space-y-3">
        {zones.map((h) => {
          const c = heatingCalc(scheme, h)
          const tid = zoneTh.get(h.id) || null
          const th = ths.find((t) => t.id === tid) || null
          const thW = tid ? (byThermostat.get(tid) || []).reduce((s, z) => s + heatingCalc(scheme, z).watts, 0) : c.watts
          const sup = heatingSupply(thW)
          const g = tid ? groupOf(tid) : null
          const gs = g ? sums.find((s) => s.group?.id === g.id) : null
          const issues: string[] = []
          if (!th) issues.push("нет терморегулятора — поставьте точку «Терморегулятор тёплого пола»")
          if (th && !g) issues.push("терморегулятор не подключён к группе щита — проведите к нему кабель")
          if (g && gs && gs.minSection > 0 && gs.minSection < Number(sup.section.replace(/[^0-9.]/g, ""))) issues.push(`кабель группы ${String(gs.minSection).replace(".", ",")} мм² — нужен от ${sup.section.replace(".", ",")}`)
          if (sup.contactor) issues.push("больше 16 А — терморегулятор через контактор или две зоны")
          return (
            <div key={h.id} className="rounded-lg bg-[#161616] p-3 text-sm">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="font-medium">
                  {roomName(h.roomId)} · {HEATING_PRESETS[h.kind].label.toLowerCase()}
                </span>
                <span className="shrink-0 text-[#fdba74]">{c.watts} Вт</span>
              </div>
              <div className="mb-2 grid grid-cols-3 gap-1.5 text-xs text-white/55">
                <span>{fmtNum(c.net, 2)} м²</span>
                <span>{h.power} Вт/м²</span>
                <span>{fmtNum(c.amps, 1)} А</span>
                {c.length > 0 && <span className="col-span-3">кабель {fmtNum(c.length, 1)} м, шаг {Math.round((h.step ?? 0.1) * 1000)} мм</span>}
              </div>
              <label className="mb-1 block text-[11px] text-white/40">Терморегулятор</label>
              <select
                className={inputCls}
                value={h.thermostatId && ths.some((t) => t.id === h.thermostatId) ? h.thermostatId : ""}
                onChange={(e) => onUpdateHeating(h.id, { thermostatId: e.target.value || null })}
              >
                <option value="">{th ? `Авто: ${th.label || "ТР"} в ${roomName(th.roomId)}` : "Авто — ближайший в комнате"}</option>
                {ths.map((t, i) => (
                  <option key={t.id} value={t.id}>
                    ТР{i + 1} {t.label ? `«${t.label}»` : ""} — {roomName(t.roomId)}
                  </option>
                ))}
              </select>
              <div className="mt-2 rounded-md border border-white/10 p-2 text-xs text-white/60">
                Питание: автомат <b className="text-white">{sup.breaker}</b>, кабель <b className="text-white">ВВГнг-LS 3×{sup.section.replace(" мм²", "").replace(".", ",")}</b>
                {sup.contactor ? ", контактор 25 А" : ""}
                {g ? (
                  <span>
                    {" "}· группа <b className="text-[#D4AF37]">{g.num}</b> ({g.breaker})
                  </span>
                ) : null}
                {th && (
                  <button onClick={() => onSelectNode(th.id)} className="ml-2 text-[#D4AF37] hover:underline">
                    показать ТР
                  </button>
                )}
              </div>
              {issues.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-xs text-amber-400">
                  {issues.map((t) => (
                    <li key={t}>• {t}</li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-2 text-[11px] text-white/35">
        Мощность тёплого пола входит в нагрузку группы и в распределение по фазам. Зоны рисуются на слое «Мебель и отделка» или здесь — инструментом «Тёплый пол»
      </div>
    </div>
  )
}

export default HeatingElectricCard
