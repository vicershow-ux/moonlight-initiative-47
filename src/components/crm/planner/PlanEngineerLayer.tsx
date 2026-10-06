import { dist, fmtMmText, linkGeometry, linkRoute, longestSegment } from "@/lib/planner/geometry"
import {
  NODE_PRESETS,
  NodeKind,
  PlanLayer,
  PlanLink,
  PlanNode,
  PlanPoint,
} from "@/lib/planner/types"
import { ToScreen } from "./usePlanView"
import type { PlanTool } from "./PlanCanvas"

interface Props {
  layer: PlanLayer
  tool: PlanTool
  nodeKind: NodeKind
  scale: number
  nodes: PlanNode[]
  links: PlanLink[]
  nodeById: Map<string, PlanNode>
  linkFromId: string | null
  selectedNodeId: string | null
  selectedLinkId: string | null
  cursor: PlanPoint | null
  /** Изломы трассы, которую сейчас прокладывают */
  bends: PlanPoint[]
  /** Где встанет следующий излом, если щёлкнуть сейчас */
  previewBend: PlanPoint | null
  toScreen: ToScreen
}

const polyPoints = (pts: PlanPoint[], toScreen: ToScreen) =>
  pts
    .map((p) => {
      const s = toScreen(p)
      return `${s.x},${s.y}`
    })
    .join(" ")

/** Точки электрики и сантехники, трассы между ними и подсказка при прокладке */
export function PlanEngineerLayer({
  layer,
  tool,
  nodeKind,
  scale,
  nodes,
  links,
  nodeById,
  linkFromId,
  selectedNodeId,
  selectedLinkId,
  cursor,
  bends,
  previewBend,
  toScreen,
}: Props) {
  const color = layer === "electric" ? "#E8B23A" : "#7FB5E8"

  const renderLink = (l: PlanLink) => {
    const g = linkGeometry(l, nodeById)
    if (!g) return null
    const selected = l.id === selectedLinkId
    const seg = longestSegment(g.route)

    let label: React.ReactNode = null
    if (seg && dist(seg.a, seg.b) * scale > 60) {
      const pa = toScreen(seg.a)
      const pb = toScreen(seg.b)
      const mx = (pa.x + pb.x) / 2
      const my = (pa.y + pb.y) / 2
      let angle = (Math.atan2(pb.y - pa.y, pb.x - pa.x) * 180) / Math.PI
      if (angle > 90 || angle < -90) angle += 180
      label = (
        <text
          x={mx}
          y={my - 5}
          textAnchor="middle"
          fontSize="10"
          fill={color}
          transform={`rotate(${angle}, ${mx}, ${my})`}
        >
          {l.spec} · {fmtMmText(g.length)}
        </text>
      )
    }

    return (
      <g key={l.id}>
        <polyline
          points={polyPoints(g.route, toScreen)}
          fill="none"
          stroke={color}
          strokeWidth={selected ? 4 : 2.5}
          strokeDasharray={layer === "plumbing" ? "8 4" : undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={selected ? 1 : 0.85}
        />
        {label}
        {/* У выбранной трассы показываем изломы — их можно перетаскивать */}
        {selected &&
          (l.points || []).map((p, i) => {
            const s = toScreen(p)
            return (
              <rect
                key={i}
                x={s.x - 5}
                y={s.y - 5}
                width={10}
                height={10}
                fill="#161616"
                stroke={color}
                strokeWidth={2}
                style={{ cursor: "move" }}
              />
            )
          })}
      </g>
    )
  }

  const renderNode = (n: PlanNode) => {
    const p = toScreen({ x: n.x, y: n.y })
    const preset = NODE_PRESETS[n.kind]
    const selected = n.id === selectedNodeId
    const isFrom = n.id === linkFromId
    const r = 11

    return (
      <g key={n.id} style={{ cursor: tool === "select" ? "grab" : "pointer" }}>
        {(selected || isFrom) && (
          <circle cx={p.x} cy={p.y} r={r + 5} fill="none" stroke={isFrom ? "#fff" : preset.color} strokeWidth={2} />
        )}
        <circle
          cx={p.x}
          cy={p.y}
          r={r}
          fill="#161616"
          stroke={preset.color}
          strokeWidth={selected ? 3 : 2}
        />
        <circle cx={p.x} cy={p.y} r={4} fill={preset.color} />
        {scale > 26 && (
          <text x={p.x + r + 4} y={p.y + 4} fontSize="10" fill="rgba(255,255,255,0.75)">
            {n.label || preset.label}
          </text>
        )}
      </g>
    )
  }

  // Черновик трассы: от начальной точки через изломы к месту следующего щелчка
  const from = linkFromId ? nodeById.get(linkFromId) : null
  let draftRoute: PlanPoint[] | null = null
  if (tool === "link" && from && cursor) {
    const hover = nodes.find((n) => dist(n, cursor) * scale < 14 && n.id !== linkFromId)
    draftRoute = hover
      ? linkRoute({ x: from.x, y: from.y }, bends, { x: hover.x, y: hover.y })
      : [{ x: from.x, y: from.y }, ...bends, ...(previewBend ? [previewBend] : [])]
  }

  return (
    <g>
      {links.map(renderLink)}
      {nodes.map(renderNode)}
      {draftRoute && (
        <>
          <polyline
            points={polyPoints(draftRoute, toScreen)}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeDasharray="6 4"
            strokeLinejoin="round"
          />
          {bends.map((p, i) => {
            const s = toScreen(p)
            return <rect key={i} x={s.x - 4} y={s.y - 4} width={8} height={8} fill={color} />
          })}
        </>
      )}
      {tool === "node" && cursor && (
        <circle
          cx={toScreen(cursor).x}
          cy={toScreen(cursor).y}
          r={11}
          fill="none"
          stroke={NODE_PRESETS[nodeKind].color}
          strokeWidth={2}
          strokeDasharray="4 3"
        />
      )}
    </g>
  )
}

export default PlanEngineerLayer
