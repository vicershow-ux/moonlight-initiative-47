import { dist, fmtMm, pointInPolygon } from "@/lib/planner/geometry"
import { FLOATING_OFFSET, insetPolygon } from "@/lib/planner/fixtures"
import { PlanPoint, PlanScheme } from "@/lib/planner/types"
import { ToScreen } from "./usePlanView"
import { FLOATING_COLOR, TRACK_COLOR } from "./PlanFixturesLayer"

const halo = { paintOrder: "stroke" as const, stroke: "#141414", strokeWidth: 3, strokeLinejoin: "round" as const }

/** Рисуемый трек: поставленные точки и участок до курсора, с длиной всего трека и участка */
export function TrackDraft({ pts, b, toScreen }: { pts: PlanPoint[]; b: PlanPoint; toScreen: ToScreen }) {
  const all = [...pts, b]
  const scr = all.map(toScreen)
  const last = pts[pts.length - 1]
  const seg = dist(last, b)
  const total = all.slice(1).reduce((s, p, i) => s + dist(all[i], p), 0)
  const pa = scr[scr.length - 2]
  const pb = scr[scr.length - 1]
  const mx = (pa.x + pb.x) / 2
  const my = (pa.y + pb.y) / 2
  const horiz = Math.abs(pb.y - pa.y) < Math.abs(pb.x - pa.x)
  return (
    <g pointerEvents="none">
      <polyline points={scr.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={TRACK_COLOR} strokeWidth={4} strokeLinejoin="miter" opacity={0.7} />
      {scr.slice(0, -1).map((p, i) => (
        <rect key={i} x={p.x - 3.5} y={p.y - 3.5} width={7} height={7} fill={i === 0 ? TRACK_COLOR : "#D4AF37"} />
      ))}
      {seg > 0.02 && (
        <text
          x={horiz ? mx : mx - 10}
          y={horiz ? my - 14 : my}
          textAnchor={horiz ? "middle" : "end"}
          fontSize="12"
          fontWeight="700"
          fill="#fff"
          style={halo}
        >
          {fmtMm(seg)} мм{pts.length > 1 ? ` · всего ${fmtMm(total)}` : ""}
        </text>
      )}
    </g>
  )
}

/** Призрак парящего потолка в комнате под курсором */
export function FloatingDraft({ scheme, at, toScreen }: { scheme: PlanScheme; at: PlanPoint; toScreen: ToScreen }) {
  const room = [...scheme.rooms].reverse().find((r) => r.points.length > 2 && pointInPolygon(at, r.points))
  if (!room) return null
  const same = (scheme.fixtures || []).filter((f) => f.kind === "floating" && f.roomId === room.id)
  const offset = same.length ? Math.max(...same.map((f) => f.offset ?? FLOATING_OFFSET)) + FLOATING_OFFSET : FLOATING_OFFSET
  const c = insetPolygon(room.points, offset)
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
        {same.length ? `Ещё один контур · отступ ${fmtMm(offset)} мм` : `Парящий потолок · отступ ${fmtMm(offset)} мм`}
      </text>
    </g>
  )
}
