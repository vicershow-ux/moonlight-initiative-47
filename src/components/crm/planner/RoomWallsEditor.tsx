import { useState } from "react"
import { fromMm, setWallLength, toMm, wallSegments } from "@/lib/planner/geometry"
import { PlanRoom, PlanScheme, WALL_MATERIALS, WallMaterial, WallProps } from "@/lib/planner/types"
import { roomWalls, wallProps } from "@/lib/planner/walls"

const cell =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-[#D4AF37]/50"

const MATERIALS = Object.keys(WALL_MATERIALS) as WallMaterial[]

interface Props {
  room: PlanRoom
  scheme: PlanScheme
  onUpdateRoom: (id: string, patch: Partial<PlanRoom>) => void
  onUpdateWall: (wallId: string, patch: Partial<WallProps>, applyToRoom?: boolean) => void
  onHoverWall?: (wallId: string | null) => void
}

/**
 * Стены помещения: длина, толщина и материал каждой.
 * Длина — по внутренней грани (контур помещения), толщина растёт наружу.
 * Общая с соседом перегородка делится пополам
 */
export function RoomWallsEditor({ room, scheme, onUpdateRoom, onUpdateWall, onHoverWall }: Props) {
  const [all, setAll] = useState<WallProps>(() => wallProps(scheme, `${room.id}:0`))
  const info = new Map(roomWalls(room, scheme).map((w) => [w.id, w]))

  return (
    <div>
      <div className="mb-1.5 text-xs text-white/50">Стены, мм</div>

      <div className="mb-2 rounded-lg border border-white/10 bg-[#161616] p-2">
        <div className="mb-1.5 text-[11px] text-white/40">Все стены помещения</div>
        <div className="flex gap-1.5">
          <select
            className={`${cell} flex-1`}
            value={all.material}
            onChange={(e) => {
              const material = e.target.value as WallMaterial
              const t = WALL_MATERIALS[material].thicknesses
              const thickness = t.includes(all.thickness) ? all.thickness : t[Math.min(1, t.length - 1)]
              setAll({ material, thickness })
            }}
          >
            {MATERIALS.map((m) => (
              <option key={m} value={m}>
                {WALL_MATERIALS[m].label}
              </option>
            ))}
          </select>
          <input
            className={`${cell} w-20`}
            type="number"
            min="40"
            step="10"
            list={`th-${all.material}`}
            value={toMm(all.thickness)}
            onChange={(e) => setAll({ ...all, thickness: fromMm(Number(e.target.value)) })}
          />
          <button
            onClick={() => onUpdateWall(`${room.id}:0`, all, true)}
            className="shrink-0 rounded-lg bg-[#D4AF37] px-2.5 text-xs font-medium text-[#161616] hover:bg-[#B8860B]"
          >
            Ко всем
          </button>
        </div>
      </div>

      {MATERIALS.map((m) => (
        <datalist key={m} id={`th-${m}`}>
          {WALL_MATERIALS[m].thicknesses.map((t) => (
            <option key={t} value={toMm(t)} />
          ))}
        </datalist>
      ))}

      <div className="space-y-1.5">
        <div className="grid grid-cols-[18px_1fr_64px_1fr] gap-1.5 px-0.5 text-[10px] uppercase text-white/30">
          <span>№</span>
          <span>Длина</span>
          <span>Толщ.</span>
          <span>Материал</span>
        </div>
        {wallSegments(room).map((seg, i) => {
          const w = wallProps(scheme, seg.id)
          const shared = info.get(seg.id)?.shared
          return (
            <div
              key={seg.id}
              className="grid grid-cols-[18px_1fr_64px_1fr] items-center gap-1.5"
              onMouseEnter={() => onHoverWall?.(seg.id)}
              onMouseLeave={() => onHoverWall?.(null)}
            >
              <span
                className="text-xs text-white/40"
                title={shared ? "Общая стена с соседним помещением" : undefined}
              >
                {i + 1}
                {shared ? "*" : ""}
              </span>
              <input
                className={cell}
                type="number"
                min="10"
                step="10"
                value={toMm(seg.length)}
                onChange={(e) => {
                  const mm = Number(e.target.value)
                  if (!mm || mm <= 0) return
                  onUpdateRoom(room.id, { points: setWallLength(room.points, i, fromMm(mm)) })
                }}
              />
              <input
                className={`${cell} px-1.5`}
                type="number"
                min="40"
                step="10"
                list={`th-${w.material}`}
                title="Толщина стены, мм"
                value={toMm(w.thickness)}
                onChange={(e) => {
                  const mm = Number(e.target.value)
                  if (!mm || mm <= 0) return
                  onUpdateWall(seg.id, { thickness: fromMm(mm) })
                }}
              />
              <select
                className={`${cell} px-1.5 text-xs`}
                value={w.material}
                onChange={(e) => onUpdateWall(seg.id, { material: e.target.value as WallMaterial })}
              >
                {MATERIALS.map((m) => (
                  <option key={m} value={m}>
                    {WALL_MATERIALS[m].label}
                  </option>
                ))}
              </select>
            </div>
          )
        })}
      </div>
      <div className="mt-1.5 text-[11px] leading-snug text-white/40">
        Длина — по внутренней стороне помещения, стена растёт наружу. «*» — общая стена с соседним
        помещением, она делится между ними пополам.
      </div>
    </div>
  )
}

export default RoomWallsEditor
