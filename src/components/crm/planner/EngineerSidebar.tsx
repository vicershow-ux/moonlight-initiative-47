import Icon from "@/components/ui/icon"
import { DeleteButton } from "@/components/ui/delete-button"
import { fmtNum, fromMm, linkGeometry, toMm } from "@/lib/planner/geometry"
import {
  LINK_SPECS,
  NODE_PRESETS,
  PlanLayer,
  PlanLink,
  PlanNode,
  PlanScheme,
} from "@/lib/planner/types"

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"

const labelCls = "mb-1.5 block text-xs text-white/50"

interface Props {
  scheme: PlanScheme
  layer: Exclude<PlanLayer, "plan">
  selectedNode: PlanNode | null
  selectedLink: PlanLink | null
  onUpdateNode: (id: string, patch: Partial<PlanNode>) => void
  onDeleteNode: (id: string) => void
  onUpdateLink: (id: string, patch: Partial<PlanLink>) => void
  onDeleteLink: (id: string) => void
  onSelectNode: (id: string) => void
}

export function EngineerSidebar({
  scheme,
  layer,
  selectedNode,
  selectedLink,
  onUpdateNode,
  onDeleteNode,
  onUpdateLink,
  onDeleteLink,
  onSelectNode,
}: Props) {
  const nodes = (scheme.nodes || []).filter((n) => n.layer === layer)
  const links = (scheme.links || []).filter((l) => l.layer === layer)
  const nodeById = new Map(nodes.map((n) => [n.id, n]))

  // Длина по трассе со всеми поворотами — именно столько кабеля уйдёт в стену
  const linkLength = (l: PlanLink) => linkGeometry(l, nodeById)?.length ?? 0

  // Итог по сечениям — сразу видно, сколько кабеля или трубы каждого типа
  const totalsBySpec = links.reduce<Record<string, number>>((acc, l) => {
    acc[l.spec] = (acc[l.spec] || 0) + linkLength(l)
    return acc
  }, {})

  const countsByKind = nodes.reduce<Record<string, number>>((acc, n) => {
    acc[n.kind] = (acc[n.kind] || 0) + 1
    return acc
  }, {})

  const roomName = (roomId: string | null) =>
    scheme.rooms.find((r) => r.id === roomId)?.name || "вне помещений"

  return (
    <div className="flex flex-col gap-4">
      {selectedNode && (
        <div className="rounded-xl border border-[#D4AF37]/30 bg-[#1f1f1f] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Icon name={NODE_PRESETS[selectedNode.kind].icon} size={15} />
              {NODE_PRESETS[selectedNode.kind].label}
            </div>
            <DeleteButton onConfirm={() => onDeleteNode(selectedNode.id)} title="Удалить точку?" />
          </div>

          <div className="mb-3">
            <label className={labelCls}>Подпись на плане</label>
            <input
              className={inputCls}
              placeholder={NODE_PRESETS[selectedNode.kind].label}
              value={selectedNode.label}
              onChange={(e) => onUpdateNode(selectedNode.id, { label: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className={labelCls}>Высота от пола, мм</label>
            <input
              className={inputCls}
              type="number"
              min="0"
              step="10"
              value={toMm(selectedNode.height)}
              onChange={(e) =>
                onUpdateNode(selectedNode.id, { height: fromMm(Number(e.target.value)) })
              }
            />
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>X, мм</label>
              <input
                className={inputCls}
                type="number"
                step="10"
                value={toMm(selectedNode.x)}
                onChange={(e) => onUpdateNode(selectedNode.id, { x: fromMm(Number(e.target.value)) })}
              />
            </div>
            <div>
              <label className={labelCls}>Y, мм</label>
              <input
                className={inputCls}
                type="number"
                step="10"
                value={toMm(selectedNode.y)}
                onChange={(e) => onUpdateNode(selectedNode.id, { y: fromMm(Number(e.target.value)) })}
              />
            </div>
          </div>

          <div className="text-xs text-white/40">Помещение: {roomName(selectedNode.roomId)}</div>
        </div>
      )}

      {selectedLink && (
        <div className="rounded-xl border border-[#D4AF37]/30 bg-[#1f1f1f] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Icon name="Spline" size={15} />
              {layer === "electric" ? "Кабель" : "Труба"}
            </div>
            <DeleteButton onConfirm={() => onDeleteLink(selectedLink.id)} title="Удалить линию?" />
          </div>

          <div className="mb-3">
            <label className={labelCls}>
              {layer === "electric" ? "Сечение" : "Диаметр"}
            </label>
            <select
              className={inputCls}
              value={selectedLink.spec}
              onChange={(e) => onUpdateLink(selectedLink.id, { spec: e.target.value })}
            >
              {LINK_SPECS[layer].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={selectedLink.ortho !== false}
              onChange={(e) => onUpdateLink(selectedLink.id, { ortho: e.target.checked })}
              className="h-4 w-4 accent-[#D4AF37]"
            />
            Только прямые углы (по ГОСТ)
          </label>

          <div className="mb-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-white/40">Длина по трассе</span>
              <span className="text-[#D4AF37]">{fmtNum(toMm(linkLength(selectedLink)), 0)} мм</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Поворотов задано</span>
              <span>{(selectedLink.points || []).length}</span>
            </div>
          </div>

          {(selectedLink.points || []).length > 0 && (
            <button
              onClick={() => onUpdateLink(selectedLink.id, { points: [] })}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10"
            >
              <Icon name="RotateCcw" size={14} />
              Сбросить повороты
            </button>
          )}

          <div className="mt-2 text-xs text-white/40">
            Квадратики на трассе — повороты, их можно перетаскивать мышью
          </div>
        </div>
      )}

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
                    <span className="text-white/60">
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
                  {layer === "electric" ? "Кабель по сечениям" : "Труба по диаметрам"}
                </div>
                <div className="space-y-1">
                  {Object.entries(totalsBySpec).map(([spec, len]) => (
                    <div key={spec} className="flex justify-between text-sm">
                      <span className="text-white/60">{spec}</span>
                      <span className="text-[#D4AF37]">{fmtNum(len, 2)} м</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {nodes.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-[#1f1f1f] p-4">
          <div className="mb-3 text-xs uppercase text-white/40">Список точек</div>
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {nodes.map((n) => (
              <button
                key={n.id}
                onClick={() => onSelectNode(n.id)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                  n.id === selectedNode?.id ? "bg-[#D4AF37]/15 text-white" : "hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <Icon name={NODE_PRESETS[n.kind].icon} size={14} />
                  <span className="truncate">{n.label || NODE_PRESETS[n.kind].label}</span>
                </span>
                <span className="shrink-0 text-xs text-white/40">{roomName(n.roomId)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default EngineerSidebar
