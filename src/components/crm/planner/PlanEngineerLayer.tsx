import { dist, fmtMmText, linkGeometry, linkRoute, longestSegment } from "@/lib/planner/geometry"
import {
  NODE_PRESETS,
  NodeKind,
  PlanLayer,
  PlanLink,
  PlanNode,
  PlanPoint,
  PlanGroup,
  PlanRoom,
  groupColor,
} from "@/lib/planner/types"
import { WALL_MOUNTED, gostSymbol, placeSymbol, wallDirection } from "@/lib/planner/symbols"
import { ToScreen } from "./usePlanView"
import { SymbolShapes } from "./NodeSymbol"
import type { PlanTool } from "./PlanCanvas"

interface Props {
  layer: PlanLayer
  tool: PlanTool
  nodeKind: NodeKind
  scale: number
  nodes: PlanNode[]
  links: PlanLink[]
  rooms: PlanRoom[]
  groups: PlanGroup[]
  /** Группа, в которую уйдёт прокладываемая трасса */
  linkGroupId: string | null
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
  rooms,
  groups,
  linkGroupId,
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
  const groupById = new Map(groups.map((g) => [g.id, g]))
  // На электрике трасса окрашивается в цвет своей группы
  const colorOf = (groupId?: string | null) => {
    const g = groupId ? groupById.get(groupId) : null
    return layer === "electric" && g ? groupColor(g.num) : color
  }

  const renderLink = (l: PlanLink) => {
    const g = linkGeometry(l, nodeById)
    if (!g) return null
    const selected = l.id === selectedLinkId
    const seg = longestSegment(g.route)
    const lc = colorOf(l.groupId)
    const grp = l.groupId ? groupById.get(l.groupId) : null

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
          fill={lc}
          transform={`rotate(${angle}, ${mx}, ${my})`}
        >
          {grp ? `Гр.${grp.num} · ` : ""}
          {l.spec} · {fmtMmText(g.length)}
        </text>
      )
    }

    return (
      <g key={l.id}>
        <polyline
          points={polyPoints(g.route, toScreen)}
          fill="none"
          stroke={lc}
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
                stroke={lc}
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
    const prims = gostSymbol(n.kind)
    // Настенные значки разворачиваем от ближайшей стены внутрь комнаты
    const dir = WALL_MOUNTED.has(n.kind) ? wallDirection(n, rooms) : null

    return (
      <g key={n.id} style={{ cursor: tool === "select" ? "grab" : "pointer" }}>
        {/* Прозрачный круг — чтобы в маленький значок было легко попасть мышью */}
        <circle cx={p.x} cy={p.y} r={r + 3} fill="transparent" />
        {(selected || isFrom) && (
          <circle
            cx={p.x}
            cy={p.y}
            r={r + 6}
            fill="none"
            stroke={isFrom ? "#fff" : preset.color}
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />
        )}
        {prims ? (
          <SymbolShapes
            prims={placeSymbol(prims, p, 9, dir)}
            color={preset.color}
            bg="#161616"
            strokeWidth={selected ? 2.2 : 1.6}
          />
        ) : (
          <>
            <circle
              cx={p.x}
              cy={p.y}
              r={r}
              fill="#161616"
              stroke={preset.color}
              strokeWidth={selected ? 3 : 2}
            />
            <circle cx={p.x} cy={p.y} r={4} fill={preset.color} />
          </>
        )}
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
            stroke={colorOf(linkGroupId)}
            strokeWidth={2}
            strokeDasharray="6 4"
            strokeLinejoin="round"
          />
          {bends.map((p, i) => {
            const s = toScreen(p)
            return <rect key={i} x={s.x - 4} y={s.y - 4} width={8} height={8} fill={colorOf(linkGroupId)} />
          })}
        </>
      )}
      {tool === "node" && cursor && (() => {
        const prims = gostSymbol(nodeKind)
        const c = toScreen(cursor)
        if (!prims) {
          return (
            <circle
              cx={c.x}
              cy={c.y}
              r={11}
              fill="none"
              stroke={NODE_PRESETS[nodeKind].color}
              strokeWidth={2}
              strokeDasharray="4 3"
            />
          )
        }
        // Призрак значка под курсором — уже развёрнутый, как встанет
        const dir = WALL_MOUNTED.has(nodeKind) ? wallDirection(cursor, rooms) : null
        return (
          <SymbolShapes
            prims={placeSymbol(prims, c, 9, dir)}
            color={NODE_PRESETS[nodeKind].color}
            bg="transparent"
            strokeWidth={1.5}
            opacity={0.6}
          />
        )
      })()}
    </g>
  )
}

export default PlanEngineerLayer
