import Icon from "@/components/ui/icon"
import { DeleteButton } from "@/components/ui/delete-button"
import { fromMm, toMm } from "@/lib/planner/geometry"
import { PlanFreeWall, WALL_MATERIALS, WallMaterial } from "@/lib/planner/types"

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"

interface Props {
  wall: PlanFreeWall
  onUpdate: (id: string, patch: Partial<PlanFreeWall>) => void
  onDelete: (id: string) => void
  onClose: () => void
}

/** Отдельная стена-отрезок: материал, толщина и длина (конец двигается по направлению стены) */
export function FreeWallCard({ wall, onUpdate, onDelete, onClose }: Props) {
  const len = Math.hypot(wall.b.x - wall.a.x, wall.b.y - wall.a.y)
  const setLen = (m: number) => {
    if (!(m > 0.05) || len < 1e-6) return
    const k = m / len
    onUpdate(wall.id, { b: { x: wall.a.x + (wall.b.x - wall.a.x) * k, y: wall.a.y + (wall.b.y - wall.a.y) * k } })
  }
  const mat = WALL_MATERIALS[wall.material]
  return (
    <div className="rounded-xl border border-[#D4AF37]/30 bg-[#1f1f1f] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs uppercase text-white/40">Отдельная стена</div>
        <div className="flex items-center gap-1">
          <DeleteButton onConfirm={() => onDelete(wall.id)} />
          <button onClick={onClose} className="rounded p-1 text-white/40 hover:text-white">
            <Icon name="X" size={14} />
          </button>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-white/50">Материал</label>
          <select
            className={inputCls}
            value={wall.material}
            onChange={(e) => {
              const m = e.target.value as WallMaterial
              const th = WALL_MATERIALS[m].thicknesses
              onUpdate(wall.id, { material: m, thickness: th.includes(wall.thickness) ? wall.thickness : th[0] })
            }}
          >
            {(Object.keys(WALL_MATERIALS) as WallMaterial[]).map((m) => (
              <option key={m} value={m}>
                {WALL_MATERIALS[m].label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-white/50">Толщина, мм</label>
            <input
              className={inputCls}
              type="number"
              min="40"
              step="10"
              list={`fw-th-${wall.id}`}
              value={toMm(wall.thickness)}
              onChange={(e) => Number(e.target.value) > 0 && onUpdate(wall.id, { thickness: fromMm(Number(e.target.value)) })}
            />
            <datalist id={`fw-th-${wall.id}`}>
              {mat.thicknesses.map((t) => (
                <option key={t} value={toMm(t)} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/50">Длина, мм</label>
            <input
              key={`${wall.id}-${toMm(len)}`}
              className={inputCls}
              type="number"
              min="50"
              step="10"
              defaultValue={toMm(len)}
              onBlur={(e) => setLen(fromMm(Number(e.target.value)))}
              onKeyDown={(e) => e.key === "Enter" && setLen(fromMm(Number((e.target as HTMLInputElement).value)))}
            />
          </div>
        </div>
        <div className="text-[11px] text-white/40">
          Концы тяните мышью: у угла или стены комнаты конец прилипает к ней (зелёная метка), Alt — без прилипания. Стена не делит помещение. Удалить — клавиша Delete.
        </div>
      </div>
    </div>
  )
}
