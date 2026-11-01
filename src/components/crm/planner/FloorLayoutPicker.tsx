import { FLOOR_DIRS, FloorDir, floorLayout } from "@/lib/planner/floorLayout"
import { toMm } from "@/lib/planner/geometry"
import type { PlanRoom, PlanScheme, RoomFinish } from "@/lib/planner/types"
import { roomWalls } from "@/lib/planner/walls"

interface Props {
  room: PlanRoom
  scheme: PlanScheme
  finish: RoomFinish
  onChange: (patch: Partial<RoomFinish>) => void
  onHoverWall?: (wallId: string | null) => void
}

const selectCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-2 py-2 text-sm outline-none focus:border-[#D4AF37]/50"

/** Укладка пола: направление досок/плитки и стена, от которой идёт первый ряд */
export function FloorLayoutPicker({ room, scheme, finish, onChange, onHoverWall }: Props) {
  const lay = floorLayout(room, finish)
  const walls = roomWalls(room, scheme)

  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      <div className="min-w-0">
        <div className="mb-1 text-[11px] text-white/45">Направление укладки</div>
        <div className="flex rounded-lg border border-white/10 bg-[#161616] p-0.5">
          {(Object.keys(FLOOR_DIRS) as FloorDir[]).map((d) => (
            <button
              key={d}
              onClick={() => onChange({ floorDir: d })}
              className={`flex-1 rounded-md px-1 py-1.5 text-xs ${lay.dir === d ? "bg-[#D4AF37] font-medium text-black" : "text-white/60 hover:text-white"}`}
            >
              {d === "along" ? "Вдоль" : "Поперёк"}
            </button>
          ))}
        </div>
      </div>
      <div className="min-w-0">
        <div className="mb-1 text-[11px] text-white/45">Начинать от стены</div>
        <select
          className={selectCls}
          value={finish.floorStartWall || ""}
          onChange={(e) => onChange({ floorStartWall: e.target.value || undefined })}
          onFocus={() => lay.start && onHoverWall?.(lay.start.id)}
          onBlur={() => onHoverWall?.(null)}
        >
          <option value="">Авто{lay.auto && lay.start ? ` (ст. ${(walls.find((w) => w.id === lay.start!.id)?.index ?? 0) + 1})` : ""}</option>
          {walls.map((w) => (
            <option key={w.id} value={w.id}>
              Стена {w.index + 1} · {toMm(w.length)} мм
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default FloorLayoutPicker
