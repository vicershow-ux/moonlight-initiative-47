import { fmtMm } from "@/lib/planner/geometry"
import { FurnitureDim } from "@/lib/planner/interior"
import { ToScreen } from "./usePlanView"

const SIDE_LABEL: Record<FurnitureDim["side"], string> = { left: "слева", right: "справа", back: "сзади", front: "спереди" }

/**
 * Размеры от предмета до стен: золотые выноски со значением в мм.
 * Нулевой зазор (вплотную к стене) подписывается «у стены»
 */
export function FurnitureDimsLayer({ dims, toScreen }: { dims: FurnitureDim[]; toScreen: ToScreen }) {
  return (
    <g pointerEvents="none">
      {dims.map((d, i) => {
        const a = toScreen(d.a)
        const b = toScreen(d.b)
        const len = Math.hypot(b.x - a.x, b.y - a.y)
        const flush = d.length < 0.005
        const mx = (a.x + b.x) / 2
        const my = (a.y + b.y) / 2
        const text = flush ? `у стены` : `${fmtMm(d.length)}`
        const tw = text.length * 6.6 + 10
        if (flush) {
          return (
            <g key={i}>
              <rect x={a.x - 24} y={a.y - 8} width={48} height={15} rx={3} fill="#161616" stroke="#4ade80" strokeWidth={1} opacity={0.9} />
              <text x={a.x} y={a.y + 3} textAnchor="middle" fontSize="9" fontWeight="700" fill="#4ade80">
                у стены
              </text>
            </g>
          )
        }
        if (len < 6) return null
        const ux = (b.x - a.x) / len
        const uy = (b.y - a.y) / len
        const tick = (p: { x: number; y: number }) => (
          <line x1={p.x - uy * 5} y1={p.y + ux * 5} x2={p.x + uy * 5} y2={p.y - ux * 5} stroke="#D4AF37" strokeWidth={1.5} />
        )
        return (
          <g key={i}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#D4AF37" strokeWidth={1.2} strokeDasharray="4 3" />
            {tick(a)}
            {tick(b)}
            <g transform={`translate(${mx} ${my})`}>
              <rect x={-tw / 2} y={-9} width={tw} height={17} rx={4} fill="#161616" stroke="#D4AF37" strokeWidth={1} />
              <text x={0} y={4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#D4AF37">
                <title>{SIDE_LABEL[d.side]}</title>
                {text}
              </text>
            </g>
          </g>
        )
      })}
    </g>
  )
}

export default FurnitureDimsLayer
