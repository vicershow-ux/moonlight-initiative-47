import { PlaceAssist } from "@/lib/planner/placeAssist"
import { fmtMm } from "@/lib/planner/geometry"
import { ToScreen } from "./usePlanView"

const WALL = "#D4AF37"
const NODE = "#38bdf8"
const CENTER = "#f472b6"

/** Размеры до стен и соседних точек и линии выравнивания при расстановке на потолке */
export function PlaceAssistLayer({ assist, toScreen }: { assist: PlaceAssist; toScreen: ToScreen }) {
  return (
    <g pointerEvents="none">
      {assist.guides.map((g, i) => {
        const a = toScreen(g.from)
        const b = toScreen(g.to)
        const color = g.kind === "center" ? CENTER : NODE
        return (
          <g key={`g${i}`}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={1.2} strokeDasharray="5 4" />
            {g.kind === "center" ? (
              <g transform={`translate(${a.x} ${a.y})`}>
                <line x1={-6} y1={0} x2={6} y2={0} stroke={color} strokeWidth={1.5} />
                <line x1={0} y1={-6} x2={0} y2={6} stroke={color} strokeWidth={1.5} />
              </g>
            ) : (
              <circle cx={a.x} cy={a.y} r={5} fill="none" stroke={color} strokeWidth={1.5} />
            )}
          </g>
        )
      })}

      {assist.dims.map((d, i) => {
        const a = toScreen(d.a)
        const b = toScreen(d.b)
        const len = Math.hypot(b.x - a.x, b.y - a.y)
        if (len < 14) return null
        const color = d.kind === "wall" ? WALL : NODE
        const horiz = Math.abs(a.y - b.y) < 0.5
        const mx = (a.x + b.x) / 2
        const my = (a.y + b.y) / 2
        const text = fmtMm(d.length)
        const tw = text.length * 6.6 + 10
        const tick = (x: number, y: number) =>
          horiz ? <line x1={x} y1={y - 5} x2={x} y2={y + 5} stroke={color} strokeWidth={1.5} /> : <line x1={x - 5} y1={y} x2={x + 5} y2={y} stroke={color} strokeWidth={1.5} />
        return (
          <g key={`d${i}`}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={1.2} />
            {tick(b.x, b.y)}
            <g transform={`translate(${horiz ? mx : mx + 4} ${horiz ? my - 12 : my})`}>
              <rect x={horiz ? -tw / 2 : 0} y={-9} width={tw} height={17} rx={4} fill="#161616" stroke={color} strokeWidth={1} />
              <text x={horiz ? 0 : tw / 2} y={4} textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>
                {text}
              </text>
            </g>
          </g>
        )
      })}

      {assist.equal.map((p, i) => {
        const s = toScreen(p)
        return <circle key={`e${i}`} cx={s.x} cy={s.y} r={14} fill="none" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="3 3" />
      })}
      {assist.equal.length > 0 && (() => {
        const s = toScreen(assist.point)
        return (
          <g transform={`translate(${s.x + 16} ${s.y + 22})`}>
            <rect x={0} y={-9} width={86} height={17} rx={4} fill="#161616" stroke="#22c55e" strokeWidth={1} />
            <text x={43} y={4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#22c55e">
              равный шаг
            </text>
          </g>
        )
      })()}
    </g>
  )
}

export default PlaceAssistLayer
