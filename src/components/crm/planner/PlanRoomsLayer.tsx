import {
  fmtMm,
  fmtNum,
  openingPosition,
  polygonArea,
  polygonCentroid,
  wallSegments,
} from "@/lib/planner/geometry"
import { PlanLayer, PlanOpening, PlanScheme, WALL_MATERIALS } from "@/lib/planner/types"
import { findWall, openingBand, schemeWalls, wallPieces } from "@/lib/planner/walls"
import { ToScreen } from "./usePlanView"

interface Props {
  scheme: PlanScheme
  layer: PlanLayer
  scale: number
  selectedRoomId: string | null
  selectedOpeningId: string | null
  toScreen: ToScreen
  /** Выбранная стена — подсвечивается */
  selectedWallId?: string | null
}

/** Помещения с размерами стен и подписью площади, а также окна, двери и проёмы */
export function PlanRoomsLayer({
  scheme,
  layer,
  scale,
  selectedRoomId,
  selectedOpeningId,
  toScreen,
  selectedWallId = null,
}: Props) {
  const walls = schemeWalls(scheme)
  const poly = (pts: { x: number; y: number }[]) =>
    pts.map((p) => {
      const s = toScreen(p)
      return `${s.x},${s.y}`
    }).join(" ")

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
          stroke={selected ? "#D4AF37" : "rgba(255,255,255,0.35)"}
          strokeWidth={selected ? 2 : 1}
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
    const w = findWall(scheme, o.wallId)

    // Проём в толще стены: видно откосы на всю глубину
    if (w) {
      const band = openingBand(w, o)
      const s0 = toScreen(band[0])
      const s1 = toScreen(band[1])
      const s2 = toScreen(band[2])
      const s3 = toScreen(band[3])
      const mid = (p: { x: number; y: number }, q: { x: number; y: number }) => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 })
      const m1 = mid(s0, s3)
      const m2 = mid(s1, s2)
      return (
        <g key={o.id}>
          <polygon points={poly(band)} fill="#141414" stroke={color} strokeWidth={selected ? 2 : 1} opacity={selected ? 1 : 0.9} />
          {/* Откосы — короткие стороны выреза */}
          <line x1={s0.x} y1={s0.y} x2={s3.x} y2={s3.y} stroke={color} strokeWidth={selected ? 3 : 2} />
          <line x1={s1.x} y1={s1.y} x2={s2.x} y2={s2.y} stroke={color} strokeWidth={selected ? 3 : 2} />
          {o.kind === "window" ? (
            <line x1={m1.x} y1={m1.y} x2={m2.x} y2={m2.y} stroke={color} strokeWidth={selected ? 3 : 2} />
          ) : o.kind === "door" ? (
            <line x1={s0.x} y1={s0.y} x2={s1.x} y2={s1.y} stroke={color} strokeWidth={selected ? 3 : 2} strokeDasharray="5 3" />
          ) : null}
          {selected && <circle cx={(a.x + b.x) / 2} cy={(a.y + b.y) / 2} r={5} fill="#fff" />}
        </g>
      )
    }

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
        {/* Стены в толщину, цвет — по материалу */}
        {walls.draw.map((w) => {
          const mat = WALL_MATERIALS[w.material]
          const sel = w.id === selectedWallId
          return wallPieces(w, scheme.openings).map((pc, i) => (
            <polygon
              key={`${w.id}-${i}`}
              points={poly(pc)}
              fill={mat.color}
              fillOpacity={0.55}
              stroke={sel ? "#D4AF37" : "rgba(255,255,255,0.8)"}
              strokeWidth={sel ? 2.5 : 1}
              strokeLinejoin="miter"
            />
          ))
        })}
        {scheme.openings.map(renderOpening)}
      </g>
    </>
  )
}

export default PlanRoomsLayer