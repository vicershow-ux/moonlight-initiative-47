import type { ReactNode } from "react"
import { dist, fmtMmText, fmtNum, toMm } from "@/lib/planner/geometry"
import { PlanPoint } from "@/lib/planner/types"
import { ToScreen } from "./usePlanView"
import type { PlanTool } from "./PlanCanvas"
import { DrawAssist, fmtDeg } from "./drawAssist"

interface DraftProps {
  draft: PlanPoint[]
  tool: PlanTool
  cursor: PlanPoint | null
  assist?: DrawAssist | null
  scale?: number
  toScreen: ToScreen
}

const GUIDE = "#38bdf8"

/** Пунктир уровня и транспортир с отклонением стены в градусах */
export function PlanAssistLayer({ assist, toScreen }: { assist: DrawAssist; toScreen: ToScreen }) {
  const { guides, angle } = assist
  const R = 46
  let arc: ReactNode = null
  if (angle) {
    const o = toScreen(angle.origin)
    const pt = (a: number, r = R) => ({ x: o.x + Math.cos(a) * r, y: o.y + Math.sin(a) * r })
    const a0 = pt(angle.axis, R + 14)
    const s = pt(angle.axis)
    const e = pt(angle.line)
    const sweep = angle.line - angle.axis > 0 ? 1 : 0
    const deviated = Math.abs(angle.dev) >= 0.05
    const mid = pt(angle.axis + (angle.line - angle.axis) / 2, R + 16)
    const color = deviated ? "#f97316" : "#22c55e"
    arc = (
      <g pointerEvents="none">
        <line x1={o.x} y1={o.y} x2={a0.x} y2={a0.y} stroke="rgba(255,255,255,0.35)" strokeWidth={1} strokeDasharray="3 3" />
        {deviated && <path d={`M${s.x},${s.y} A${R},${R} 0 0 ${sweep} ${e.x},${e.y}`} fill="none" stroke={color} strokeWidth={1.5} />}
        <g transform={`translate(${deviated ? mid.x : pt(angle.axis + 0.35, R + 10).x}, ${deviated ? mid.y : pt(angle.axis + 0.35, R + 10).y})`}>
          <rect x={-22} y={-9} width={44} height={18} rx={4} fill="#161616" stroke={color} strokeWidth={1} />
          <text textAnchor="middle" y={4} fontSize="11" fontWeight="700" fill={color}>
            {deviated ? fmtDeg(angle.dev) : "0°"}
          </text>
        </g>
        {angle.turn !== null && (
          <text x={o.x - 10} y={o.y + 22} textAnchor="end" fontSize="10" fill="rgba(255,255,255,0.55)">
            угол {fmtDeg(angle.turn)}
          </text>
        )}
      </g>
    )
  }

  return (
    <g pointerEvents="none">
      {guides.map((g, i) => {
        const a = toScreen(g.from)
        const b = toScreen(g.to)
        const horiz = Math.abs(a.y - b.y) < 0.5
        const dx = Math.sign(b.x - a.x) || 1
        const dy = Math.sign(b.y - a.y) || 1
        return (
          <g key={i}>
            <line
              x1={horiz ? a.x - dx * 30 : a.x}
              y1={horiz ? a.y : a.y - dy * 30}
              x2={horiz ? b.x + dx * 40 : b.x}
              y2={horiz ? b.y : b.y + dy * 40}
              stroke={GUIDE}
              strokeWidth={1.2}
              strokeDasharray="5 4"
            />
            <circle cx={a.x} cy={a.y} r={4} fill="none" stroke={GUIDE} strokeWidth={1.5} />
          </g>
        )
      })}
      {guides.length > 0 && (() => {
        const p = toScreen(guides[0].to)
        return <rect x={p.x - 5} y={p.y - 5} width={10} height={10} fill="none" stroke={GUIDE} strokeWidth={1.5} transform={`rotate(45, ${p.x}, ${p.y})`} />
      })()}
      {arc}
    </g>
  )
}

/** Контур помещения, которое сейчас рисуют, с длиной последнего отрезка */
export function PlanDraftLayer({ draft, tool, cursor, assist, toScreen }: DraftProps) {
  const draftScreen = draft.map(toScreen)
  // Контур помещения и контур зоны тёплого пола рисуются одинаково
  const drawing = tool === "draw" || tool === "heating"
  const color = tool === "heating" ? "#f97316" : "#D4AF37"
  if (draftScreen.length === 0) return assist ? <PlanAssistLayer assist={assist} toScreen={toScreen} /> : null

  return (
    <g>
      {assist && drawing && <PlanAssistLayer assist={assist} toScreen={toScreen} />}
      <path
        d={
          draftScreen.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") +
          (cursor && drawing ? ` L${toScreen(cursor).x},${toScreen(cursor).y}` : "")
        }
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeDasharray="6 4"
      />
      {draftScreen.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === 0 ? 7 : 5}
          fill={i === 0 ? color : "#161616"}
          stroke={color}
          strokeWidth={2}
        />
      ))}
      {cursor && draft.length > 0 && drawing && (
        <text
          x={toScreen(cursor).x + 12}
          y={toScreen(cursor).y - 10}
          fontSize="12"
          fill={color}
        >
          {fmtMmText(dist(draft[draft.length - 1], cursor))}
        </text>
      )}
    </g>
  )
}

interface ControlsProps {
  cursor: PlanPoint | null
  gridStep: number
  zoomBy: (factor: number) => void
  fitView: () => void
}

/** Кнопки масштаба и подсказка с координатами курсора */
export function PlanControls({ cursor, gridStep, zoomBy, fitView }: ControlsProps) {
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
          X {fmtNum(toMm(cursor.x), 0)} · Y {fmtNum(toMm(cursor.y), 0)} мм · клетка {fmtNum(toMm(gridStep), 0)} мм
        </div>
      )}
    </>
  )
}

export default PlanDraftLayer
