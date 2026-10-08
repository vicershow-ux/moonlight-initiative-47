import Icon from "@/components/ui/icon"
import { fmtNum, fromMm, setWallLength, toMm } from "@/lib/planner/geometry"
import {
  OPENING_PRESETS,
  PlanRoom,
  PlanScheme,
  WALL_MATERIALS,
  WallMaterial,
  WallProps,
} from "@/lib/planner/types"
import { findWall, openingSpan } from "@/lib/planner/walls"

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"
const labelCls = "mb-1.5 block text-xs text-white/50"

const MATERIALS = Object.keys(WALL_MATERIALS) as WallMaterial[]

interface Props {
  wallId: string
  scheme: PlanScheme
  onUpdateWall: (wallId: string, patch: Partial<WallProps>, applyToRoom?: boolean) => void
  onUpdateRoom: (id: string, patch: Partial<PlanRoom>) => void
  onSelectRoom: (id: string) => void
  onClose: () => void
  onShowElevation?: () => void
}

/** Карточка стены, выбранной щелчком на плане: толщина, материал, длина и проёмы */
export function SelectedWallCard({
  wallId,
  scheme,
  onUpdateWall,
  onUpdateRoom,
  onSelectRoom,
  onClose,
  onShowElevation,
}: Props) {
  const w = findWall(scheme, wallId)
  const room = scheme.rooms.find((r) => r.id === wallId.split(":")[0])
  if (!w || !room) return null

  // У общей перегородки соседняя сторона — стена другого помещения на той же линии
  const twins = w.shared
    ? scheme.rooms
        .filter((r) => r.id !== room.id)
        .flatMap((r) => r.points.map((_, i) => `${r.id}:${i}`))
        .map((id) => findWall(scheme, id))
        .filter(
          (x): x is NonNullable<typeof x> =>
            !!x &&
            Math.abs(x.ux * w.uy - x.uy * w.ux) < 1e-3 &&
            Math.abs((x.a.x - w.a.x) * w.uy - (x.a.y - w.a.y) * w.ux) < 0.02,
        )
    : []

  // Перегородка одна на два помещения — меняем обе её стороны сразу
  const update = (patch: Partial<WallProps>) => {
    onUpdateWall(w.id, patch)
    for (const t of twins) onUpdateWall(t.id, patch)
  }

  const openings = scheme.openings.filter((o) => o.wallId === w.id)
  const thicknesses = WALL_MATERIALS[w.material].thicknesses

  return (
    <div className="rounded-xl border border-[#D4AF37]/30 bg-[#1f1f1f] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span
            className="h-3 w-3 shrink-0 rounded-sm border border-white/40"
            style={{ background: WALL_MATERIALS[w.material].color }}
          />
          Стена {w.index + 1} · {room.name}
        </div>
        <button onClick={onClose} className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-white" title="Закрыть">
          <Icon name="X" size={15} />
        </button>
      </div>

      <div className="mb-3">
        <label className={labelCls}>Материал</label>
        <select
          className={inputCls}
          value={w.material}
          onChange={(e) => {
            const material = e.target.value as WallMaterial
            const t = WALL_MATERIALS[material].thicknesses
            // Толщина остаётся, если такая бывает у нового материала, иначе — ближайшая типовая
            const thickness = t.some((x) => Math.abs(x - w.thickness) < 1e-6)
              ? w.thickness
              : t.reduce((a, b) => (Math.abs(b - w.thickness) < Math.abs(a - w.thickness) ? b : a), t[0])
            update({ material, thickness })
          }}
        >
          {MATERIALS.map((m) => (
            <option key={m} value={m}>
              {WALL_MATERIALS[m].label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className={labelCls}>Толщина, мм</label>
        <div className="mb-1.5 flex flex-wrap gap-1">
          {thicknesses.map((t) => (
            <button
              key={t}
              onClick={() => update({ thickness: t })}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                Math.abs(t - w.thickness) < 1e-6 ? "bg-white/20 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {toMm(t)}
            </button>
          ))}
        </div>
        <input
          className={inputCls}
          type="number"
          min="40"
          step="10"
          value={toMm(w.thickness)}
          onChange={(e) => {
            const mm = Number(e.target.value)
            if (!mm || mm <= 0) return
            update({ thickness: fromMm(mm) })
          }}
        />
      </div>

      <div className="mb-3">
        <label className={labelCls}>Длина по помещению, мм</label>
        <input
          className={inputCls}
          type="number"
          min="10"
          step="10"
          value={toMm(w.length)}
          onChange={(e) => {
            const mm = Number(e.target.value)
            if (!mm || mm <= 0) return
            onUpdateRoom(room.id, { points: setWallLength(room.points, w.index, fromMm(mm)) })
          }}
        />
      </div>

      {w.shared && (
        <div className="mb-3 flex items-start gap-1.5 text-xs text-white/50">
          <Icon name="Info" size={12} className="mt-0.5 shrink-0" />
          Общая стена с соседним помещением — толщина делится пополам, правка применяется к обеим сторонам.
        </div>
      )}

      {openings.length > 0 && (
        <div className="mb-3 space-y-1 border-t border-white/10 pt-3 text-xs">
          <div className="text-white/50">Проёмы в стене</div>
          {openings.map((o) => {
            const sp = openingSpan(o, w)
            return (
              <div key={o.id} className="flex justify-between">
                <span className="text-white/60">{OPENING_PRESETS[o.kind].label}</span>
                <span>
                  {toMm(o.width)} мм, откос {toMm(w.thickness)} мм · от {toMm(sp.start)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {onShowElevation && (
        <button
          onClick={onShowElevation}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#D4AF37]/15 px-3 py-2 text-sm text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/25"
        >
          <Icon name="Ruler" size={14} />
          Развёртка стены — где сверлить
        </button>
      )}

      <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-white/40">
        <span>Площадь стены {fmtNum(w.length * room.height, 2)} м²</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateWall(w.id, { thickness: w.thickness, material: w.material }, true)}
            className="text-[#D4AF37] hover:text-[#B8860B]"
            title="Такую же толщину и материал — всем стенам помещения"
          >
            Ко всем стенам
          </button>
          <button onClick={() => onSelectRoom(room.id)} className="text-white/60 hover:text-white">
            Помещение
          </button>
        </div>
      </div>
    </div>
  )
}

export default SelectedWallCard
