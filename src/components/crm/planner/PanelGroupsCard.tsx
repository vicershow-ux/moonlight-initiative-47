import Icon from "@/components/ui/icon"
import { DeleteButton } from "@/components/ui/delete-button"
import { fmtNum } from "@/lib/planner/geometry"
import {
  BREAKERS,
  PROTECTION_LABELS,
  PlanGroup,
  PanelSettings,
  PHASES,
  PHASE_COLORS,
  groupColor,
} from "@/lib/planner/types"
import { PhaseBalance, groupPower, kwToAmps } from "@/lib/planner/phases"
import { GroupSummary, describeNodes } from "@/lib/planner/groups"
import { PanelInputEditor } from "./PanelInputEditor"
import { LineDevicesEditor } from "./LineDevicesEditor"

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"

interface Props {
  panel: PanelSettings
  panelIssues: string[]
  groups: PlanGroup[]
  summaries: GroupSummary[]
  onAddGroup: () => string
  onUpdateGroup: (id: string, patch: Partial<PlanGroup>) => void
  onDeleteGroup: (id: string) => void
  onUpdatePanel: (patch: Partial<PanelSettings>) => void
  balance?: PhaseBalance | null
}

export function PanelGroupsCard({
  panel,
  panelIssues,
  groups,
  summaries,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
  onUpdatePanel,
  balance = null,
}: Props) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1f1f1f] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs uppercase text-white/40">Группы щита</div>
        <button
          onClick={() => onAddGroup()}
          className="flex items-center gap-1 text-sm text-[#D4AF37] hover:text-[#B8860B]"
        >
          <Icon name="Plus" size={14} />
          Группа
        </button>
      </div>

      {/* Ввод щита — шапка однолинейной схемы в PDF */}
      <PanelInputEditor panel={panel} issues={panelIssues} onUpdate={onUpdatePanel} />

      {balance && (
        <div className="mb-3 rounded-lg border border-white/10 bg-[#161616] p-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-white/50">Нагрузка по фазам</span>
            <span className={balance.imbalance > 30 ? "text-amber-400" : "text-white/40"}>
              перекос {balance.imbalance}%
            </span>
          </div>
          {(() => {
            const max = Math.max(...balance.loads.map((l) => l.kw), 0.01)
            return balance.loads.map((l) => (
              <div key={l.phase} className="mb-1 flex items-center gap-2 text-xs">
                <span className="w-5 font-semibold" style={{ color: l.phase === "L2" ? "#e5e5e5" : PHASE_COLORS[l.phase] }}>
                  {l.phase}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded bg-white/10">
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${(l.kw / max) * 100}%`,
                      background: l.phase === "L2" ? "#e5e5e5" : PHASE_COLORS[l.phase],
                    }}
                  />
                </div>
                <span className="w-24 text-right text-white/70">
                  {fmtNum(l.kw, 2)} кВт · {fmtNum(l.amps, 1)} А
                </span>
              </div>
            ))
          })()}
          <div className="mt-1 text-[11px] text-white/40">
            Всего {fmtNum(balance.totalKw, 2)} кВт. Фазу «Авто» программа подбирает для наименьшего перекоса.
          </div>
        </div>
      )}

      {groups.length === 0 ? (
        <div className="text-sm text-white/40">
          Создайте группу и выберите её перед прокладкой — кабель сразу попадёт в неё.
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => {
            const sum = summaries.find((x) => x.group?.id === g.id)
            return (
              <div key={g.id} className="rounded-lg border border-white/10 bg-[#161616] p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: groupColor(g.num) }} />
                  <input
                    className="w-12 rounded border border-white/10 bg-transparent px-1.5 py-1 text-center text-sm outline-none focus:border-[#D4AF37]/50"
                    type="number"
                    min="1"
                    value={g.num}
                    title="Номер группы"
                    onChange={(e) => onUpdateGroup(g.id, { num: Math.max(1, Number(e.target.value) || 1) })}
                  />
                  <input
                    className="min-w-0 flex-1 rounded border border-white/10 bg-transparent px-2 py-1 text-sm outline-none focus:border-[#D4AF37]/50"
                    placeholder="Розетки кухни"
                    value={g.name}
                    onChange={(e) => onUpdateGroup(g.id, { name: e.target.value })}
                  />
                  <DeleteButton onConfirm={() => onDeleteGroup(g.id)} title="Удалить группу? Трассы останутся без группы" />
                </div>

                <div className="mb-2 grid grid-cols-2 gap-2">
                  <select
                    className={inputCls}
                    value={g.breaker}
                    onChange={(e) => onUpdateGroup(g.id, { breaker: e.target.value })}
                  >
                    {BREAKERS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <select
                    className={inputCls}
                    value={g.protection}
                    onChange={(e) =>
                      onUpdateGroup(g.id, { protection: e.target.value as PlanGroup["protection"] })
                    }
                  >
                    {Object.entries(PROTECTION_LABELS).map(([v, label]) => (
                      <option key={v} value={v}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {g.protection !== "mcb" && (
                  <div className="mb-2 flex items-center gap-2 text-xs text-white/50">
                    Утечка
                    {[10, 30, 100].map((mA) => (
                      <button
                        key={mA}
                        onClick={() => onUpdateGroup(g.id, { leakage: mA })}
                        className={`rounded px-2 py-1 transition-colors ${
                          g.leakage === mA ? "bg-white/20 text-white" : "bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        {mA} мА
                      </button>
                    ))}
                  </div>
                )}

                <div className="mb-2 flex items-center gap-2 text-xs text-white/50">
                  <span className="shrink-0">Мощность</span>
                  <input
                    className="w-16 rounded border border-white/10 bg-transparent px-1.5 py-1 text-center text-xs outline-none focus:border-[#D4AF37]/50"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder={sum ? fmtNum(groupPower(sum).kw, 2) : "0"}
                    value={g.power ?? ""}
                    title="Расчётная мощность группы, кВт. Пусто — оценка по точкам"
                    onChange={(e) => {
                      const v = Number(e.target.value.replace(",", "."))
                      onUpdateGroup(g.id, { power: e.target.value === "" || !(v > 0) ? undefined : v })
                    }}
                  />
                  <span className="shrink-0">кВт</span>
                  {sum && (
                    <span className="truncate text-white/30">
                      {g.power ? "" : "≈ "}
                      {fmtNum(kwToAmps(groupPower(sum).kw), 1)} А
                    </span>
                  )}
                </div>

                {balance && (
                  <div className="mb-2 flex items-center gap-1 text-xs text-white/50">
                    <span className="mr-1">Фаза</span>
                    {[null, ...PHASES].map((ph) => {
                      const active = (g.phase ?? null) === ph
                      const auto = balance.byGroup.get(g.id)
                      return (
                        <button
                          key={ph ?? "auto"}
                          onClick={() => onUpdateGroup(g.id, { phase: ph })}
                          className={`rounded px-2 py-1 transition-colors ${
                            active ? "bg-white/20 text-white" : "bg-white/5 hover:bg-white/10"
                          }`}
                        >
                          {ph ?? `Авто${!g.phase && auto ? ` · ${auto}` : ""}`}
                        </button>
                      )
                    })}
                  </div>
                )}

                <LineDevicesEditor group={g} onChange={(devices) => onUpdateGroup(g.id, { devices })} />

                <div className="space-y-0.5 text-xs">
                  {sum && sum.linkCount > 0 ? (
                    <>
                      <div className="flex justify-between text-white/30">
                        <span>Сечение</span>
                        <span>по плану → с запасом</span>
                      </div>
                      {Object.entries(sum.bySpec).map(([spec, c]) => (
                        <div key={spec} className="flex justify-between">
                          <span className="text-white/50">{spec}</span>
                          <span>
                            <span className="text-white/50">{fmtNum(c.plan, 2)}</span>
                            <span className="text-white/30"> → </span>
                            <span className="text-[#D4AF37]">{fmtNum(c.total, 2)} м</span>
                          </span>
                        </div>
                      ))}
                      {describeNodes(sum.nodeCounts) && (
                        <div className="pt-1 text-white/40">{describeNodes(sum.nodeCounts)}</div>
                      )}
                      {sum.warning && (
                        <div className="flex items-start gap-1.5 pt-1 text-amber-400">
                          <Icon name="TriangleAlert" size={12} className="mt-0.5 shrink-0" />
                          {sum.warning}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-white/30">Трасс пока нет</div>
                  )}
                </div>
              </div>
            )
          })}

          {summaries.some((x) => !x.group) && (
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <Icon name="CircleAlert" size={12} />
              Без группы: {summaries.find((x) => !x.group)?.linkCount} трасс,{" "}
              {fmtNum(summaries.find((x) => !x.group)?.total || 0, 2)} м
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PanelGroupsCard
