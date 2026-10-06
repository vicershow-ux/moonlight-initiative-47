import {
  fmtMm,
  fmtNum,
  openingPosition,
  polygonArea,
  polygonCentroid,
  wallSegments,
} from "@/lib/planner/geometry"
import { PlanLayer, PlanOpening, PlanScheme } from "@/lib/planner/types"
import { ToScreen } from "./usePlanView"

interface Props {
  scheme: PlanScheme
  layer: PlanLayer
  scale: number
  selectedRoomId: string | null
  selectedOpeningId: string | null
  toScreen: ToScreen
}

/** Помещения с размерами стен и подписью площади, а также окна, двери и проёмы */
export function PlanRoomsLayer({
  scheme,
  layer,
  scale,
  selectedRoomId,
  selectedOpeningId,
  toScreen,
}: Props) {
  const renderRoom = (room: PlanScheme["rooms"][number]) => {
    const pts = room.points.map(toScreen)
    if (pts.length < 2) return null
    const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z"
    const selected = room.id === selectedRoomId
    const centroid = toScreen(polygonCentroid(room.points))
    const area = polygonArea(room.points)
    // На слоях электрики и сантехники подпись уходит под верхнюю стену,
    // чтобы не перекрывать оборудование в центре помещения
    const topY = toScreen({ x: 0, y: Math.min(...room.points.map((p) => p.y)) }).y
    const labelY = layer === "plan" ? centroid.y - 4 : topY + 22

    return (
      <g key={room.id}>
        <path
          d={d}
          fill={selected ? "rgba(212,175,55,0.16)" : "rgba(255,255,255,0.06)"}
          stroke={selected ? "#D4AF37" : "rgba(255,255,255,0.55)"}
          strokeWidth={selected ? 3 : 2.5}
          strokeLinejoin="round"
        />

        {/* На слое планировки длины показывают размерные линии снаружи контура,
            поэтому подписи на самих стенах не дублируем */}
        {layer !== "plan" && wallSegments(room).map((seg) => {
          const a = toScreen(seg.a)
          const b = toScreen(seg.b)
          const mx = (a.x + b.x) / 2
          const my = (a.y + b.y) / 2
          if (seg.length * scale < 34) return null
          const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
          const flip = angle > 90 || angle < -90
          return (
            <text
              key={seg.id}
              x={mx}
              y={my - 6}
              textAnchor="middle"
              fontSize="11"
              fill="rgba(255,255,255,0.75)"
              transform={`rotate(${flip ? angle + 180 : angle}, ${mx}, ${my})`}
            >
              {fmtMm(seg.length)}
            </text>
          )
        })}

        {room.points.length > 2 && (
          <>
            <text
              x={centroid.x}
              y={labelY}
              textAnchor="middle"
              fontSize="13"
              fontWeight="600"
              fill="#fff"
            >
              {room.name}
            </text>
            <text
              x={centroid.x}
              y={labelY + 18}
              textAnchor="middle"
              fontSize="11"
              fill="rgba(255,255,255,0.6)"
            >
              {fmtNum(area, 2)} м²
            </text>
          </>
        )}

        {selected &&
          pts.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={6}
              fill="#D4AF37"
              stroke="#161616"
              strokeWidth={2}
              style={{ cursor: "grab" }}
            />
          ))}
      </g>
    )
  }

  const renderOpening = (o: PlanOpening) => {
    const pos = openingPosition(scheme, o)
    if (!pos) return null
    const a = toScreen(pos.a)
    const b = toScreen(pos.b)
    const selected = o.id === selectedOpeningId
    const color = o.kind === "window" ? "#7FB5E8" : o.kind === "door" ? "#8BD48B" : "#C9A0E8"

    return (
      <g key={o.id}>
        <line
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke="#161616"
          strokeWidth={9}
          strokeLinecap="butt"
        />
        <line
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke={color}
          strokeWidth={selected ? 7 : 5}
          strokeLinecap="butt"
        />
        {selected && (
          <circle cx={(a.x + b.x) / 2} cy={(a.y + b.y) / 2} r={5} fill="#fff" />
        )}
      </g>
    )
  }

  return (
    <>
      {/* На инженерных слоях планировка уходит на второй план — она служит подложкой */}
      <g opacity={layer === "plan" ? 1 : 0.42}>
        {scheme.rooms.map(renderRoom)}
        {scheme.openings.map(renderOpening)}
      </g>
    </>
  )
}

export default PlanRoomsLayer