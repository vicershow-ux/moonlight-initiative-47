import { fromMm, toMm } from "@/lib/planner/geometry"
import { OPENING_PRESETS, PlanNode, PlanScheme, WALL_MATERIALS } from "@/lib/planner/types"
import { FORCE_WALL, findWall, openingSpan, roomWalls, snapToWall } from "@/lib/planner/walls"

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"
const labelCls = "mb-1.5 block text-xs text-white/50"

interface Props {
  node: PlanNode
  scheme: PlanScheme
  onUpdateNode: (id: string, patch: Partial<PlanNode>) => void
  onHoverWall?: (wallId: string | null) => void
}

/**
 * Место установки настенной точки: стена помещения или откос окна/двери/проёма.
 * Розетки, выключатели и щит со стены не снимаются — только переезжают
 */
export function NodeMountEditor({ node, scheme, onUpdateNode, onHoverWall }: Props) {
  const m = node.mount
  const room = scheme.rooms.find((r) => r.id === (m?.wallId.split(":")[0] ?? node.roomId))
  if (!room) return null
  const walls = roomWalls(room, scheme)
  const forced = FORCE_WALL.has(node.kind)

  if (!m) {
    return (
      <div className="mb-3">
        <button
          onClick={() => {
            const mount = snapToWall(scheme, node)
            if (mount) onUpdateNode(node.id, { mount })
          }}
          className="w-full rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70 hover:bg-white/10"
        >
          Закрепить на ближайшей стене
        </button>
      </div>
    )
  }

  const w = findWall(scheme, m.wallId)
  if (!w) return null
  const openings = scheme.openings.filter((o) => o.wallId === w.id)
  const opening = m.place === "reveal" ? openings.find((o) => o.id === m.openingId) : undefined
  // Если смотреть на стену из помещения, левая рука — (ny, −nx) в экранных координатах.
  // Совпадает с направлением стены — значит конец проёма слева
  const endIsLeft = w.ux * w.ny - w.uy * w.nx > 0
  const sideLabel = (side: "start" | "end") => ((side === "end") === endIsLeft ? "Левый" : "Правый")

  const setWall = (wallId: string) => {
    const nw = walls.find((x) => x.id === wallId)
    if (!nw) return
    onUpdateNode(node.id, { mount: { wallId, offset: Math.min(m.offset, nw.length), place: "wall" } })
  }

  return (
    <div className="mb-3 rounded-lg border border-white/10 bg-[#161616] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-white/50">Место установки</span>
        {!forced && (
          <button
            onClick={() => onUpdateNode(node.id, { mount: null })}
            className="text-xs text-white/40 hover:text-white"
          >
            Открепить
          </button>
        )}
      </div>

      <div className="mb-2 grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Стена</label>
          <select
            className={inputCls}
            value={w.id}
            onChange={(e) => setWall(e.target.value)}
            onMouseEnter={() => onHoverWall?.(w.id)}
            onMouseLeave={() => onHoverWall?.(null)}
          >
            {walls.map((x) => (
              <option key={x.id} value={x.id}>
                {x.index + 1} · {toMm(x.length)} мм
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Где</label>
          <select
            className={inputCls}
            value={m.place === "reveal" && opening ? opening.id : "wall"}
            onChange={(e) => {
              if (e.target.value === "wall") {
                onUpdateNode(node.id, { mount: { wallId: w.id, offset: m.offset, place: "wall" } })
                return
              }
              const o = openings.find((x) => x.id === e.target.value)
              if (!o) return
              const sp = openingSpan(o, w)
              onUpdateNode(node.id, {
                mount: {
                  wallId: w.id,
                  offset: sp.start,
                  place: "reveal",
                  openingId: o.id,
                  side: "start",
                  depth: w.thickness / 2,
                },
              })
            }}
          >
            <option value="wall">На стене</option>
            {openings.map((o, i) => (
              <option key={o.id} value={o.id}>
                Откос: {OPENING_PRESETS[o.kind].label.toLowerCase()}
                {openings.length > 1 ? ` ${i + 1}` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {m.place === "reveal" && opening ? (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelCls}>Край проёма</label>
            <div className="flex gap-1">
              {(endIsLeft ? (["end", "start"] as const) : (["start", "end"] as const)).map((side) => (
                <button
                  key={side}
                  onClick={() => onUpdateNode(node.id, { mount: { ...m, side } })}
                  className={`flex-1 rounded-lg px-2 py-2 text-sm transition-colors ${
                    (m.side ?? "start") === side ? "bg-white/20 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {sideLabel(side)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Глубина в откосе, мм</label>
            <input
              className={inputCls}
              type="number"
              min="0"
              max={toMm(w.thickness)}
              step="10"
              value={toMm(m.depth ?? w.thickness / 2)}
              onChange={(e) =>
                onUpdateNode(node.id, {
                  mount: { ...m, depth: Math.min(Math.max(fromMm(Number(e.target.value)), 0), w.thickness) },
                })
              }
            />
          </div>
          <div className="col-span-2 text-[11px] text-white/40">
            Откос {toMm(w.thickness)} мм ({WALL_MATERIALS[w.material].label.toLowerCase()}). Глубина — от внутренней
            стороны стены. Левый и правый — если смотреть на проём из помещения.
          </div>
        </div>
      ) : (
        <div>
          <label className={labelCls}>От начала стены, мм</label>
          <input
            className={inputCls}
            type="number"
            min="0"
            max={toMm(w.length)}
            step="10"
            value={toMm(m.offset)}
            onChange={(e) =>
              onUpdateNode(node.id, {
                mount: { ...m, offset: Math.min(Math.max(fromMm(Number(e.target.value)), 0), w.length) },
              })
            }
          />
        </div>
      )}
    </div>
  )
}

export default NodeMountEditor
