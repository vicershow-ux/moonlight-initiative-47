import Icon from "@/components/ui/icon"
import { fmtNum, fromMm, toMm } from "@/lib/planner/geometry"
import { gostSymbol } from "@/lib/planner/symbols"
import { NodeSymbolIcon } from "./NodeSymbol"
import { NODE_PRESETS, PlanLayer, PlanLink, PlanNode, CableSettings, LAYING_METHODS, LayingMethod } from "@/lib/planner/types"
import { CableTotals } from "@/lib/planner/cable"

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"

const labelCls = "mb-1.5 block text-xs text-white/50"

/** Одинаковые точки в помещении — одной строкой с количеством */
function groupNodes(nodes: PlanNode[], roomName: (id: string | null) => string) {
  const rooms = new Map<string, Map<string, { key: string; kind: PlanNode["kind"]; name: string; ids: string[] }>>()
  for (const n of nodes) {
    const room = roomName(n.roomId)
    const name = n.label || NODE_PRESETS[n.kind].label
    const key = `${n.kind}|${name}`
    if (!rooms.has(room)) rooms.set(room, new Map())
    const m = rooms.get(room)!
    const it = m.get(key)
    if (it) it.ids.push(n.id)
    else m.set(key, { key, kind: n.kind, name, ids: [n.id] })
  }
  return [...rooms.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "ru"))
    .map(([room, m]) => ({ room, items: [...m.values()] }))
}

interface Props {
  layer: Exclude<PlanLayer, "plan">
  isElectric: boolean
  nodes: PlanNode[]
  links: PlanLink[]
  countsByKind: Record<string, number>
  totalsBySpec: Record<string, CableTotals>
  layerTotal: CableTotals
  cfg: CableSettings
  selectedNode: PlanNode | null
  roomName: (roomId: string | null) => string
  onUpdateCable: (patch: Partial<CableSettings>) => void
  onSelectNode: (id: string) => void
}

/** Итоги по слою, настройки запаса кабеля и список точек */
export function LayerSummaryCard({
  layer,
  isElectric,
  nodes,
  links,
  countsByKind,
  totalsBySpec,
  layerTotal,
  cfg,
  selectedNode,
  roomName,
  onUpdateCable,
  onSelectNode,
}: Props) {
  return (
    <>
      <div className="rounded-xl border border-white/10 bg-[#1f1f1f] p-4">
        <div className="mb-3 text-xs uppercase text-white/40">
          Итого по слою «{layer === "electric" ? "Электрика" : "Сантехника"}»
        </div>

        {nodes.length === 0 && links.length === 0 ? (
          <div className="text-sm text-white/40">
            Пока пусто. Выберите, что поставить, и кликните по плану.
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <div className="mb-1.5 text-xs text-white/50">Точки</div>
              <div className="space-y-1">
                {Object.entries(countsByKind).map(([kind, count]) => (
                  <div key={kind} className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-white/60">
                      {gostSymbol(kind as keyof typeof NODE_PRESETS) && (
                        <NodeSymbolIcon kind={kind as keyof typeof NODE_PRESETS} height={16} />
                      )}
                      {NODE_PRESETS[kind as keyof typeof NODE_PRESETS].label}
                    </span>
                    <span>{count} шт</span>
                  </div>
                ))}
              </div>
            </div>

            {links.length > 0 && (
              <div className="border-t border-white/10 pt-3">
                <div className="mb-1.5 text-xs text-white/50">
                  {isElectric ? "Кабель по сечениям" : "Труба по диаметрам"}
                </div>
                {isElectric ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-white/30">
                        <th className="pb-1 text-left font-normal">Сечение</th>
                        <th className="pb-1 text-right font-normal">По плану</th>
                        <th className="pb-1 text-right font-normal">С запасом</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(totalsBySpec).map(([spec, c]) => (
                        <tr key={spec}>
                          <td className="py-0.5 text-white/60">{spec}</td>
                          <td className="py-0.5 text-right text-white/60">{fmtNum(c.plan, 2)} м</td>
                          <td className="py-0.5 text-right text-[#D4AF37]">{fmtNum(c.total, 2)} м</td>
                        </tr>
                      ))}
                      <tr className="border-t border-white/10">
                        <td className="pt-1 text-white/60">Всего</td>
                        <td className="pt-1 text-right">{fmtNum(layerTotal.plan, 2)} м</td>
                        <td className="pt-1 text-right font-medium text-[#D4AF37]">
                          {fmtNum(layerTotal.total, 2)} м
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <div className="space-y-1">
                    {Object.entries(totalsBySpec).map(([spec, c]) => (
                      <div key={spec} className="flex justify-between text-sm">
                        <span className="text-white/60">{spec}</span>
                        <span className="text-[#D4AF37]">{fmtNum(c.plan, 2)} м</span>
                      </div>
                    ))}
                  </div>
                )}
                {isElectric && (
                  <div className="mt-2 text-xs text-white/40">
                    Из них спуски к точкам {fmtNum(layerTotal.drops, 2)} м,
                    {layerTotal.wall > 0 ? ` заход в откосы ${fmtNum(layerTotal.wall, 2)} м,` : ""} запас на концы{" "}
                    {fmtNum(layerTotal.reserve, 2)} м
                  </div>
                )}
              </div>
            )}

            {isElectric && (
              <div className="border-t border-white/10 pt-3">
                <div className="mb-1.5 text-xs text-white/50">Как считать запас</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Трасса ниже потолка, мм</label>
                    <input
                      className={inputCls}
                      type="number"
                      min="0"
                      step="10"
                      value={toMm(cfg.traceFromCeiling)}
                      onChange={(e) =>
                        onUpdateCable({ traceFromCeiling: Math.max(fromMm(Number(e.target.value)), 0) })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Запас на конец, мм</label>
                    <input
                      className={inputCls}
                      type="number"
                      min="0"
                      step="10"
                      value={toMm(cfg.endReserve)}
                      onChange={(e) =>
                        onUpdateCable({ endReserve: Math.max(fromMm(Number(e.target.value)), 0) })
                      }
                    />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Прокладка по умолчанию</label>
                    <select
                      className={inputCls}
                      value={cfg.laying || "chase"}
                      onChange={(e) => onUpdateCable({ laying: e.target.value as LayingMethod })}
                    >
                      {(Object.keys(LAYING_METHODS) as LayingMethod[]).map((m) => (
                        <option key={m} value={m}>
                          {LAYING_METHODS[m].label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Гофру крепить на</label>
                    <select
                      className={inputCls}
                      value={cfg.corrugatedFix || "dowel"}
                      onChange={(e) => onUpdateCable({ corrugatedFix: e.target.value as "dowel" | "screw" })}
                    >
                      <option value="dowel">Дюбель-гвозди</option>
                      <option value="screw">Саморезы</option>
                    </select>
                  </div>
                </div>
                <div className="mt-1.5 text-xs text-white/40">
                  Кабель идёт под потолком и спускается к каждой точке на её высоту. Потолок берётся из
                  высоты помещения. Способ прокладки можно поменять у каждой трассы — крепёж посчитается в смете.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {nodes.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-[#1f1f1f] p-4">
          <div className="mb-3 text-xs uppercase text-white/40">Список точек</div>
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {groupNodes(nodes, roomName).map((room) => (
              <div key={room.room}>
                <div className="mb-1 px-1 text-[11px] text-white/40">{room.room}</div>
                {room.items.map((it) => {
                  const active = it.ids.includes(selectedNode?.id ?? "")
                  // Щелчок перебирает одинаковые точки по очереди
                  const next = active ? it.ids[(it.ids.indexOf(selectedNode!.id) + 1) % it.ids.length] : it.ids[0]
                  return (
                    <button
                      key={it.key}
                      onClick={() => onSelectNode(next)}
                      className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                        active ? "bg-[#D4AF37]/15 text-white" : "hover:bg-white/5"
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        {gostSymbol(it.kind) ? (
                          <NodeSymbolIcon kind={it.kind} height={16} />
                        ) : (
                          <Icon name={NODE_PRESETS[it.kind].icon} size={14} />
                        )}
                        <span className="truncate">{it.name}</span>
                      </span>
                      <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-xs text-white/70">
                        {it.ids.length} шт
                      </span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default LayerSummaryCard
