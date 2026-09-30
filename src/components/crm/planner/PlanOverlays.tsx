import { dist, fmtNum } from "@/lib/planner/geometry"
import { PlanPoint } from "@/lib/planner/types"
import { ToScreen } from "./usePlanView"
import type { PlanTool } from "./PlanCanvas"

interface DraftProps {
  draft: PlanPoint[]
  tool: PlanTool
  cursor: PlanPoint | null
  toScreen: ToScreen
}

/** Контур помещения, которое сейчас рисуют, с длиной последнего отрезка */
export function PlanDraftLayer({ draft, tool, cursor, toScreen }: DraftProps) {
  const draftScreen = draft.map(toScreen)
  if (draftScreen.length === 0) return null

  return (
    <g>
      <path
        d={
          draftScreen.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") +
          (cursor && tool === "draw" ? ` L${toScreen(cursor).x},${toScreen(cursor).y}` : "")
        }
        fill="none"
        stroke="#D4AF37"
        strokeWidth={2.5}
        strokeDasharray="6 4"
      />
      {draftScreen.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === 0 ? 7 : 5}
          fill={i === 0 ? "#D4AF37" : "#161616"}
          stroke="#D4AF37"
          strokeWidth={2}
        />
      ))}
      {cursor && draft.length > 0 && tool === "draw" && (
        <text
          x={toScreen(cursor).x + 12}
          y={toScreen(cursor).y - 10}
          fontSize="12"
          fill="#D4AF37"
        >
          {fmtNum(dist(draft[draft.length - 1], cursor), 2)} м
        </text>
      )}
    </g>
  )
}

interface ControlsProps {
  cursor: PlanPoint | null
  zoomBy: (factor: number) => void
  fitView: () => void
}

/** Кнопки масштаба и подсказка с координатами курсора */
export function PlanControls({ cursor, zoomBy, fitView }: ControlsProps) {
  return (
    <>
      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
        <button
          onClick={() => zoomBy(1.25)}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1f1f1f]/90 text-lg text-white/70 hover:bg-white/10"
        >
          +
        </button>
        <button
          onClick={() => zoomBy(1 / 1.25)}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1f1f1f]/90 text-lg text-white/70 hover:bg-white/10"
        >
          −
        </button>
        <button
          onClick={fitView}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1f1f1f]/90 text-xs text-white/70 hover:bg-white/10"
          title="Вписать в экран"
        >
          ⤢
        </button>
      </div>

      {cursor && (
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-[#1f1f1f]/90 px-2.5 py-1.5 text-xs text-white/50">
          {fmtNum(cursor.x, 1)} : {fmtNum(cursor.y, 1)} м · масштаб 1 кл = 0,5 м
        </div>
      )}
    </>
  )
}

export default PlanDraftLayer
