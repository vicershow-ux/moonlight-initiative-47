import Icon from "@/components/ui/icon"
import { ROOM_TYPES, PlanPoint } from "@/lib/planner/types"
import type { NamedContour } from "@/lib/planner/roomNames"
import { fmtNum } from "@/lib/planner/geometry"

interface Props {
  detected: NamedContour[]
  active: number | null
  toScreen: (p: PlanPoint) => PlanPoint
  onActive: (index: number | null) => void
  onType: (index: number, type: string) => void
  onAccept: (index: number) => void
  onDropOpening: (index: number, k: number) => void
  onDiscard: (index: number) => void
}

const OP_LABEL = { window: "Окно", door: "Дверь", arch: "Проём" } as const

const area = (pts: PlanPoint[]) =>
  Math.abs(pts.reduce((s, p, k) => s + p.x * pts[(k + 1) % pts.length].y - pts[(k + 1) % pts.length].x * p.y, 0)) / 2

/**
 * Найденные контуры: на плане — только номер; карточка с типом, площадью и проёмами
 * открывается для одного выбранного контура и стоит у края холста, ничего не закрывая
 */
export function DetectedOverlay({ detected, active, toScreen, onActive, onType, onAccept, onDropOpening, onDiscard }: Props) {
  const d = active !== null ? detected[active] : null
  return (
    <>
      {detected.map((c, i) => {
        const sp = c.points.map(toScreen)
        const cx = sp.reduce((s, p) => s + p.x, 0) / sp.length
        const cy = sp.reduce((s, p) => s + p.y, 0) / sp.length
        const on = active === i
        return (
          <button
            key={i}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => onActive(on ? null : i)}
            className={`absolute z-10 flex h-6 min-w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold shadow ${
              on ? "bg-[#D4AF37] text-[#161616] ring-2 ring-white" : "bg-[#161616]/90 text-[#D4AF37] ring-1 ring-[#D4AF37]/60 hover:bg-[#D4AF37]/30"
            }`}
            style={{ left: cx, top: cy }}
            title={`${c.name} — нажмите, чтобы проверить и добавить`}
          >
            {i + 1}
          </button>
        )
      })}

      {d && active !== null && (
        <div
          className="absolute left-3 top-14 z-20 w-64 rounded-xl border border-[#D4AF37]/40 bg-[#161616]/95 p-3 text-xs text-white shadow-xl"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="font-semibold text-[#D4AF37]">
              Контур {active + 1} из {detected.length}
            </span>
            <button onClick={() => onActive(null)} className="text-white/40 hover:text-white">
              <Icon name="X" size={14} />
            </button>
          </div>

          <label className="mb-1 block text-white/50">Что это за помещение?</label>
          <select
            className="mb-2 w-full rounded-lg border border-white/10 bg-[#232323] px-2 py-1.5 text-sm outline-none focus:border-[#D4AF37]/50"
            value={d.room_type}
            onChange={(e) => onType(active, e.target.value)}
          >
            <option value="">Помещение</option>
            {ROOM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <div className="mb-2 space-y-0.5 text-white/60">
            <div className="flex justify-between">
              <span>Название</span>
              <span className="text-white">{d.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Площадь контура</span>
              <span className="text-white">{fmtNum(area(d.points), 1)} м²</span>
            </div>
            {d.planArea && (
              <div className="flex justify-between">
                <span>По плану{d.planNo ? ` (№${d.planNo})` : ""}</span>
                <span className="text-white">{fmtNum(d.planArea, 1)} м²</span>
              </div>
            )}
          </div>

          {(d.openings || []).length > 0 && (
            <div className="mb-2">
              <div className="mb-1 text-white/50">Найдено на стенах — лишнее уберите:</div>
              <div className="flex flex-wrap gap-1">
                {(d.openings || []).map((o, k) => (
                  <button
                    key={k}
                    onClick={() => onDropOpening(active, k)}
                    className={`flex items-center gap-1 rounded px-1.5 py-0.5 ${
                      o.kind === "window" ? "bg-sky-400/15 text-sky-300" : "bg-orange-400/15 text-orange-300"
                    } hover:bg-red-500/20 hover:text-red-300`}
                  >
                    {OP_LABEL[o.kind]} {Math.round(o.width * 1000)} мм
                    <Icon name="X" size={10} />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => onAccept(active)}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#D4AF37] px-2 py-1.5 font-medium text-[#161616] hover:bg-[#B8860B]"
            >
              <Icon name="Plus" size={12} />
              Добавить
            </button>
            <button
              onClick={() => onDiscard(active)}
              className="rounded-lg bg-white/5 px-2 py-1.5 text-white/60 hover:bg-red-500/15 hover:text-red-300"
              title="Это не помещение"
            >
              Не нужен
            </button>
          </div>
        </div>
      )}
    </>
  )
}
