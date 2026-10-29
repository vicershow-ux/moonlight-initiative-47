import { useMemo } from "react"
import { PlanLayer, PlanScheme, WALL_FINISHES, roomFinish, wallFinishOf } from "@/lib/planner/types"
import { fmtNum } from "@/lib/planner/geometry"
import { heatingCalc, interiorWarnings } from "@/lib/planner/interior"
import { floorPattern, furnitureSvg, heatingPattern } from "@/lib/planner/interiorSvg"
import { roomWalls } from "@/lib/planner/walls"
import { ToScreen } from "./usePlanView"

interface Props {
  scheme: PlanScheme
  layer: PlanLayer
  scale: number
  toScreen: ToScreen
  selectedFurnitureId: string | null
  selectedHeatingId: string | null
}

const halo = { paintOrder: "stroke" as const, stroke: "#141414", strokeWidth: 3, strokeLinejoin: "round" as const }

/**
 * Интерьер на плане: покрытие пола узором, полоса отделки по внутренней грани стен,
 * зоны тёплого пола и мебель. На слое «Мебель и отделка» — в полную силу,
 * на электрике мебель видна бледно — по ней ставят светильники и розетки
 */
export function PlanInteriorLayer({ scheme, layer, scale, toScreen, selectedFurnitureId, selectedHeatingId }: Props) {
  const active = layer === "interior"
  const furniture = scheme.furniture || []
  const heating = scheme.heating || []
  const warnings = useMemo(() => (active || layer === "electric" ? interiorWarnings(scheme) : []), [scheme, active, layer])

  // На планировке интерьер не показываем — там только стены и проёмы
  if (layer === "plan") return null

  const poly = (pts: { x: number; y: number }[]) =>
    pts
      .map((p) => {
        const s = toScreen(p)
        return `${s.x},${s.y}`
      })
      .join(" ")

  const defs: string[] = []
  const floors: React.ReactNode[] = []
  const wallBands: React.ReactNode[] = []
  if (active) {
    for (const room of scheme.rooms) {
      if (room.points.length < 3) continue
      const f = roomFinish(scheme, room.id)
      if (f.floor !== "none") {
        const id = `floor-${room.id}`
        defs.push(floorPattern(id, f.floor, scale, f.floorColor))
        floors.push(<polygon key={id} points={poly(room.points)} fill={`url(#${id})`} opacity={0.85} />)
      }
      // Отделка стен — цветная полоса по внутренней грани; у акцентной стены — свой цвет и толще.
      // Плитка до высоты без основной отделки — пунктиром
      for (const w of roomWalls(room, scheme)) {
        const wf = wallFinishOf(f, w.id)
        if (wf.wall === "none" && !(f.tileHeight || 0)) continue
        const col = wf.wall !== "none" ? wf.wallColor || WALL_FINISHES[wf.wall].color : WALL_FINISHES.tile.color
        const k = w.inner + (wf.own ? 0.05 : 0.03)
        const a = toScreen({ x: w.a.x - w.nx * k, y: w.a.y - w.ny * k })
        const b = toScreen({ x: w.b.x - w.nx * k, y: w.b.y - w.ny * k })
        wallBands.push(
          <line
            key={`wb-${w.id}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={col}
            strokeWidth={wf.own ? 7 : 4}
            strokeDasharray={wf.wall === "none" ? "6 3" : undefined}
            opacity={0.95}
          />,
        )
        if (wf.own) {
          const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
          const n = { x: -w.nx, y: -w.ny }
          wallBands.push(
            <text key={`wt-${w.id}`} x={m.x + n.x * 16} y={m.y + n.y * 16 + 3} textAnchor="middle" fontSize="9" fontWeight="700" fill={col} style={halo}>
              акцент
            </text>,
          )
        }
      }
    }
  }

  const zones = heating.map((h) => {
    const id = `heat-${h.id}`
    defs.push(heatingPattern(id, h, scale))
    const sel = h.id === selectedHeatingId
    const c = heatingCalc(scheme, h)
    const pts = h.points.map(toScreen)
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length
    return (
      <g key={h.id} opacity={active ? 1 : 0.55}>
        <polygon points={poly(h.points)} fill={`url(#${id})`} stroke={sel ? "#D4AF37" : "#f97316"} strokeWidth={sel ? 2.4 : 1.4} strokeDasharray="5 3" />
        {(active || sel) && (
          <text x={cx} y={cy + 24} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fdba74" style={halo}>
            ТП {fmtNum(c.net, 2)} м² · {c.watts} Вт
          </text>
        )}
      </g>
    )
  })

  const items = furniture.map((f) => {
    const sel = f.id === selectedFurnitureId
    const stroke = sel ? "#D4AF37" : active ? "#e5e5e5" : "rgba(229,229,229,0.55)"
    const fill = active ? "rgba(30,30,30,0.92)" : "rgba(30,30,30,0.35)"
    return <g key={f.id} dangerouslySetInnerHTML={{ __html: furnitureSvg(f, toScreen, stroke, fill, sel ? 1.8 : 1.1) }} />
  })

  return (
    <g pointerEvents="none">
      <defs dangerouslySetInnerHTML={{ __html: defs.join("") }} />
      {floors}
      {wallBands}
      {zones}
      {items}
      {warnings.map((w, i) => {
        const p = toScreen(w.at)
        return (
          <g key={`w${i}`}>
            <circle cx={p.x} cy={p.y} r={13} fill="none" stroke="#f87171" strokeWidth={1.6} strokeDasharray="3 2" />
            <text x={p.x + 15} y={p.y - 8} fontSize="10" fontWeight="700" fill="#f87171" style={halo}>
              {w.text}
            </text>
          </g>
        )
      })}
    </g>
  )
}

export default PlanInteriorLayer
