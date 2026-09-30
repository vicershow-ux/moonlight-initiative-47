import { dist, fmtNum } from "@/lib/planner/geometry"
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
  toScreen: ToScreen
}

/** Точки электрики и сантехники, линии между ними и подсказка при рисовании */
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
  toScreen,
}: Props) {
  const renderLink = (l: PlanLink) => {
    const a = nodeById.get(l.fromId)
    const b = nodeById.get(l.toId)
    if (!a || !b) return null
    const pa = toScreen({ x: a.x, y: a.y })
    const pb = toScreen({ x: b.x, y: b.y })
    const selected = l.id === selectedLinkId
    const color = layer === "electric" ? "#E8B23A" : "#7FB5E8"
    const mx = (pa.x + pb.x) / 2
    const my = (pa.y + pb.y) / 2
    const angle = (Math.atan2(pb.y - pa.y, pb.x - pa.x) * 180) / Math.PI
    const flip = angle > 90 || angle < -90
    const len = dist({ x: a.x, y: a.y }, { x: b.x, y: b.y })

    return (
      <g key={l.id}>
        <line
          x1={pa.x}
          y1={pa.y}
          x2={pb.x}
          y2={pb.y}
          stroke={color}
          strokeWidth={selected ? 4 : 2.5}
          strokeDasharray={layer === "plumbing" ? "8 4" : undefined}
          strokeLinecap="round"
          opacity={selected ? 1 : 0.85}
        />
        {len * scale > 46 && (
          <text
            x={mx}
            y={my - 5}
            textAnchor="middle"
            fontSize="10"
            fill={color}
            transform={`rotate(${flip ? angle + 180 : angle}, ${mx}, ${my})`}
          >
            {l.spec} · {fmtNum(len, 2)} м
          </text>
        )}
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

  return (
    <g>
      {links.map(renderLink)}
      {nodes.map(renderNode)}
      {tool === "link" && linkFromId && cursor && nodeById.get(linkFromId) && (
        <line
          x1={toScreen({
            x: nodeById.get(linkFromId)!.x,
            y: nodeById.get(linkFromId)!.y,
          }).x}
          y1={toScreen({
            x: nodeById.get(linkFromId)!.x,
            y: nodeById.get(linkFromId)!.y,
          }).y}
          x2={toScreen(cursor).x}
          y2={toScreen(cursor).y}
          stroke={layer === "electric" ? "#E8B23A" : "#7FB5E8"}
          strokeWidth={2}
          strokeDasharray="6 4"
        />
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
