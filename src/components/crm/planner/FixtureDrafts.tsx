import { dist, fmtMm, pointInPolygon } from "@/lib/planner/geometry"
import { FLOATING_OFFSET, insetPolygon } from "@/lib/planner/fixtures"
import { PlanPoint, PlanScheme } from "@/lib/planner/types"
import { ToScreen } from "./usePlanView"
import { FLOATING_COLOR, TRACK_COLOR } from "./PlanFixturesLayer"

const halo = { paintOrder: "stroke" as const, stroke: "#141414", strokeWidth: 3, strokeLinejoin: "round" as const }

/** Рисуемый трек: от первого щелчка до курсора, с длиной у середины */
export function TrackDraft({ a, b, toScreen }: { scheme: PlanScheme; a: PlanPoint; b: PlanPoint; toScreen: ToScreen }) {
  const pa = toScreen(a)
  const pb = toScreen(b)
  const len = dist(a, b)
  const mx = (pa.x + pb.x) / 2
  const my = (pa.y + pb.y) / 2
  const horiz = Math.abs(pb.y - pa.y) < Math.abs(pb.x - pa.x)
  return (
    <g pointerEvents="none">
      <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={TRACK_COLOR} strokeWidth={4} opacity={0.7} />
      <circle cx={pa.x} cy={pa.y} r={4} fill={TRACK_COLOR} />
      {len > 0.02 && (
        <text
          x={horiz ? mx : mx - 10}
          y={horiz ? my - 14 : my}
          textAnchor={horiz ? "middle" : "end"}
          fontSize="12"
          fontWeight="700"
          fill="#fff"
          style={halo}
        >
          Трек {fmtMm(len)} мм
        </text>
      )}
    </g>
  )
}

/** Призрак парящего потолка в комнате под курсором */
export function FloatingDraft({ scheme, at, toScreen }: { scheme: PlanScheme; at: PlanPoint; toScreen: ToScreen }) {
  const room = [...scheme.rooms].reverse().find((r) => r.points.length > 2 && pointInPolygon(at, r.points))
  if (!room) return null
  const has = (scheme.fixtures || []).some((f) => f.kind === "floating" && f.roomId === room.id)
  const c = insetPolygon(room.points, FLOATING_OFFSET)
  const pts = c
    .map((p) => {
      const s = toScreen(p)
      return `${s.x},${s.y}`
    })
    .join(" ")
  const s = toScreen(at)
  return (
    <g pointerEvents="none">
      <polygon points={pts} fill={FLOATING_COLOR} fillOpacity={0.05} stroke={FLOATING_COLOR} strokeWidth={1.5} strokeDasharray="10 4 2 4" opacity={0.7} />
      <text x={s.x + 12} y={s.y - 10} fontSize="11" fontWeight="700" fill={FLOATING_COLOR} style={halo}>
        {has ? "Уже есть — щёлкните, чтобы выбрать" : `Парящий потолок · отступ ${fmtMm(FLOATING_OFFSET)} мм`}
      </text>
    </g>
  )
}
