import Icon from "@/components/ui/icon"
import { ROOM_TYPES, PlanPoint } from "@/lib/planner/types"
import type { NamedContour } from "@/lib/planner/roomNames"
import { fmtNum } from "@/lib/planner/geometry"

interface Props {
  detected: NamedContour[]
  toScreen: (p: PlanPoint) => PlanPoint
  onType: (index: number, type: string) => void
  onAccept: (index: number) => void
  onDropOpening: (index: number, k: number) => void
}

const OP_LABEL = { window: "окно", door: "дверь", arch: "проём" } as const

const area = (pts: PlanPoint[]) =>
  Math.abs(pts.reduce((s, p, k) => s + p.x * pts[(k + 1) % pts.length].y - pts[(k + 1) % pts.length].x * p.y, 0)) / 2

/** Плашки над найденными контурами: тип помещения, площадь с плана, окна и проёмы, кнопка «Добавить» */
export function DetectedOverlay({ detected, toScreen, onType, onAccept, onDropOpening }: Props) {
  return (
    <>
      {detected.map((d, i) => {
        const sp = d.points.map(toScreen)
        const cx = sp.reduce((s, p) => s + p.x, 0) / sp.length
        const cy = sp.reduce((s, p) => s + p.y, 0) / sp.length
        const drawn = area(d.points)
        const diff = d.planArea ? drawn - d.planArea : 0
        const off = d.planArea ? Math.abs(diff) > Math.max(0.15, d.planArea * 0.03) : false
        return (
          <div
            key={i}
            className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-lg border border-[#D4AF37]/50 bg-[#161616]/90 p-1.5 text-[11px] text-white shadow-lg"
            style={{ left: cx, top: cy }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <select
              className="max-w-[130px] rounded bg-[#232323] px-1.5 py-1 text-xs text-[#D4AF37] outline-none"
              value={d.room_type}
              onChange={(e) => onType(i, e.target.value)}
              title="Тип помещения"
            >
              <option value="">Помещение</option>
              {ROOM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <div className={off ? "text-amber-300" : "text-white/60"} title={d.planArea ? "Площадь с плана / нарисовано" : "Нарисованная площадь"}>
              {d.planNo ? `№${d.planNo} · ` : ""}
              {d.planArea ? `${fmtNum(d.planArea, 1)} м² по плану` : `${fmtNum(drawn, 1)} м²`}
              {off ? ` (≈${fmtNum(drawn, 1)})` : ""}
            </div>
            {(d.openings || []).length > 0 && (
              <div className="flex max-w-[160px] flex-wrap justify-center gap-1">
                {(d.openings || []).map((o, k) => (
                  <button
                    key={k}
                    onClick={() => onDropOpening(i, k)}
                    className={`flex items-center gap-0.5 rounded px-1 ${o.kind === "window" ? "bg-sky-400/15 text-sky-300" : "bg-orange-400/15 text-orange-300"} hover:bg-red-500/20 hover:text-red-300`}
                    title="Не добавлять"
                  >
                    {OP_LABEL[o.kind]} {Math.round(o.width * 1000)}
                    <Icon name="X" size={10} />
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => onAccept(i)}
              className="flex items-center gap-1 rounded bg-[#D4AF37] px-2 py-0.5 font-medium text-[#161616] hover:bg-[#B8860B]"
            >
              <Icon name="Plus" size={11} />
              Добавить
            </button>
          </div>
        )
      })}
    </>
  )
}
