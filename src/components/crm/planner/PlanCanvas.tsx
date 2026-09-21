import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  dist,
  distToSegment,
  openingPosition,
  polygonCentroid,
  pointInPolygon,
  polygonArea,
  snap,
  wallSegments,
  fmtNum,
} from "@/lib/planner/geometry"
import {
  NODE_PRESETS,
  NodeKind,
  PlanLayer,
  PlanLink,
  PlanNode,
  PlanOpening,
  PlanPoint,
  PlanScheme,
} from "@/lib/planner/types"

export type PlanTool = "select" | "draw" | "window" | "door" | "arch" | "node" | "link"

interface Props {
  scheme: PlanScheme
  tool: PlanTool
  layer: PlanLayer
  nodeKind: NodeKind
  linkFromId: string | null
  draft: PlanPoint[]
  selectedRoomId: string | null
  selectedOpeningId: string | null
  selectedNodeId: string | null
  selectedLinkId: string | null
  onDraftChange: (points: PlanPoint[]) => void
  onFinishRoom: (points: PlanPoint[]) => void
  onSelectRoom: (id: string | null) => void
  onSelectOpening: (id: string | null) => void
  onSelectNode: (id: string | null) => void
  onSelectLink: (id: string | null) => void
  onAddOpening: (wallId: string, offset: number) => void
  onMoveVertex: (roomId: string, index: number, point: PlanPoint) => void
  onAddNode: (point: PlanPoint) => void
  onMoveNode: (id: string, point: PlanPoint) => void
  onLinkClick: (nodeId: string) => void
}

const GRID_STEP = 0.5
const SNAP_STEP = 0.1
const CLOSE_DISTANCE = 0.45

export function PlanCanvas({
  scheme,
  tool,
  layer,
  nodeKind,
  linkFromId,
  draft,
  selectedRoomId,
  selectedOpeningId,
  selectedNodeId,
  selectedLinkId,
  onDraftChange,
  onFinishRoom,
  onSelectRoom,
  onSelectOpening,
  onSelectNode,
  onSelectLink,
  onAddOpening,
  onMoveVertex,
  onAddNode,
  onMoveNode,
  onLinkClick,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 800, h: 560 })
  const [view, setView] = useState({ scale: 40, tx: 60, ty: 60 })
  const [cursor, setCursor] = useState<PlanPoint | null>(null)
  const [drag, setDrag] = useState<
    | { type: "pan"; startX: number; startY: number; tx: number; ty: number }
    | { type: "vertex"; roomId: string; index: number }
    | { type: "node"; nodeId: string }
    | null
  >(null)

  const nodes = useMemo(
    () => (scheme.nodes || []).filter((n) => n.layer === layer),
    [scheme.nodes, layer],
  )
  const links = useMemo(
    () => (scheme.links || []).filter((l) => l.layer === layer),
    [scheme.links, layer],
  )
  const nodeById = useMemo(() => {
    const map = new Map<string, PlanNode>()
    for (const n of scheme.nodes || []) map.set(n.id, n)
    return map
  }, [scheme.nodes])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight })
    })
    ro.observe(el)
    setSize({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  const toScreen = useCallback(
    (p: PlanPoint) => ({ x: p.x * view.scale + view.tx, y: p.y * view.scale + view.ty }),
    [view],
  )

  const toWorld = useCallback(
    (sx: number, sy: number) => ({
      x: (sx - view.tx) / view.scale,
      y: (sy - view.ty) / view.scale,
    }),
    [view],
  )

  const eventPoint = (e: React.MouseEvent | React.TouchEvent) => {
    const svg = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
    const src = "touches" in e ? e.touches[0] || e.changedTouches[0] : e
    return { sx: src.clientX - svg.left, sy: src.clientY - svg.top }
  }

  const gridLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; major: boolean }[] = []
    const stepPx = GRID_STEP * view.scale
    if (stepPx < 6) return lines

    const startX = -view.tx / view.scale
    const endX = (size.w - view.tx) / view.scale
    const startY = -view.ty / view.scale
    const endY = (size.h - view.ty) / view.scale

    for (let x = Math.floor(startX / GRID_STEP) * GRID_STEP; x < endX; x += GRID_STEP) {
      const px = x * view.scale + view.tx
      lines.push({ x1: px, y1: 0, x2: px, y2: size.h, major: Math.abs(x % 1) < 1e-6 })
    }
    for (let y = Math.floor(startY / GRID_STEP) * GRID_STEP; y < endY; y += GRID_STEP) {
      const py = y * view.scale + view.ty
      lines.push({ x1: 0, y1: py, x2: size.w, y2: py, major: Math.abs(y % 1) < 1e-6 })
    }
    return lines
  }, [view, size])

  const handleDown = (e: React.MouseEvent) => {
    const { sx, sy } = eventPoint(e)
    const world = toWorld(sx, sy)

    if (e.button === 1 || e.button === 2 || (tool === "select" && e.shiftKey)) {
      setDrag({ type: "pan", startX: sx, startY: sy, tx: view.tx, ty: view.ty })
      return
    }

    const hitNode = () =>
      [...nodes].reverse().find((n) => dist({ x: n.x, y: n.y }, world) * view.scale < 14) || null

    if (tool === "node") {
      onAddNode({ x: snap(world.x, SNAP_STEP), y: snap(world.y, SNAP_STEP) })
      return
    }

    if (tool === "link") {
      const n = hitNode()
      if (n) onLinkClick(n.id)
      return
    }

    if (tool === "select") {
      // На инженерных слоях сначала ищем точку — её можно двигать
      if (layer !== "plan") {
        const n = hitNode()
        if (n) {
          setDrag({ type: "node", nodeId: n.id })
          onSelectNode(n.id)
          return
        }

        const link = links.find((l) => {
          const a = nodeById.get(l.fromId)
          const b = nodeById.get(l.toId)
          if (!a || !b) return false
          return distToSegment(world, { x: a.x, y: a.y }, { x: b.x, y: b.y }) * view.scale < 10
        })
        if (link) {
          onSelectLink(link.id)
          return
        }
        onSelectNode(null)
        onSelectLink(null)
      }

      for (const room of scheme.rooms) {
        const idx = room.points.findIndex((p) => dist(p, world) * view.scale < 10)
        if (idx >= 0) {
          setDrag({ type: "vertex", roomId: room.id, index: idx })
          onSelectRoom(room.id)
          return
        }
      }

      const opening = scheme.openings.find((o) => {
        const pos = openingPosition(scheme, o)
        if (!pos) return false
        return dist(pos.mid, world) * view.scale < 12
      })
      if (opening) {
        onSelectOpening(opening.id)
        return
      }

      const room = [...scheme.rooms].reverse().find((r) => pointInPolygon(world, r.points))
      onSelectRoom(room ? room.id : null)
      if (!room) onSelectOpening(null)
      return
    }

    if (tool === "draw") {
      const snapped = { x: snap(world.x, SNAP_STEP), y: snap(world.y, SNAP_STEP) }
      if (draft.length >= 3 && dist(snapped, draft[0]) < CLOSE_DISTANCE) {
        onFinishRoom(draft)
        return
      }
      onDraftChange([...draft, snapped])
      return
    }

    let best: { wallId: string; offset: number; d: number } | null = null
    for (const room of scheme.rooms) {
      for (const seg of wallSegments(room)) {
        const len = seg.length
        if (len < 1e-6) continue
        const ux = (seg.b.x - seg.a.x) / len
        const uy = (seg.b.y - seg.a.y) / len
        const t = (world.x - seg.a.x) * ux + (world.y - seg.a.y) * uy
        const clamped = Math.min(Math.max(t, 0), len)
        const proj = { x: seg.a.x + ux * clamped, y: seg.a.y + uy * clamped }
        const d = dist(proj, world)
        if (!best || d < best.d) best = { wallId: seg.id, offset: clamped, d }
      }
    }
    if (best && best.d * view.scale < 28) {
      onAddOpening(best.wallId, best.offset)
    }
  }

  const handleMove = (e: React.MouseEvent) => {
    const { sx, sy } = eventPoint(e)
    const world = toWorld(sx, sy)
    setCursor({ x: snap(world.x, SNAP_STEP), y: snap(world.y, SNAP_STEP) })

    if (!drag) return
    if (drag.type === "pan") {
      setView((v) => ({ ...v, tx: drag.tx + (sx - drag.startX), ty: drag.ty + (sy - drag.startY) }))
      return
    }
    if (drag.type === "node") {
      onMoveNode(drag.nodeId, {
        x: snap(world.x, SNAP_STEP),
        y: snap(world.y, SNAP_STEP),
      })
      return
    }
    onMoveVertex(drag.roomId, drag.index, {
      x: snap(world.x, SNAP_STEP),
      y: snap(world.y, SNAP_STEP),
    })
  }

  const handleUp = () => setDrag(null)

  const handleWheel = (e: React.WheelEvent) => {
    const { sx, sy } = eventPoint(e)
    const before = toWorld(sx, sy)
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12
    const scale = Math.min(Math.max(view.scale * factor, 8), 200)
    const tx = sx - before.x * scale
    const ty = sy - before.y * scale
    setView({ scale, tx, ty })
  }

  const zoomBy = (factor: number) => {
    const cx = size.w / 2
    const cy = size.h / 2
    const before = toWorld(cx, cy)
    const scale = Math.min(Math.max(view.scale * factor, 8), 200)
    setView({ scale, tx: cx - before.x * scale, ty: cy - before.y * scale })
  }

  const fitView = useCallback(() => {
    const pts = scheme.rooms.flatMap((r) => r.points)
    if (pts.length === 0 || size.w < 10) {
      setView({ scale: 40, tx: 60, ty: 60 })
      return
    }
    const xs = pts.map((p) => p.x)
    const ys = pts.map((p) => p.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const w = Math.max(maxX - minX, 1)
    const h = Math.max(maxY - minY, 1)
    const scale = Math.min((size.w - 100) / w, (size.h - 100) / h)
    const clamped = Math.min(Math.max(scale, 8), 200)
    setView({
      scale: clamped,
      tx: (size.w - w * clamped) / 2 - minX * clamped,
      ty: (size.h - h * clamped) / 2 - minY * clamped,
    })
  }, [scheme.rooms, size])

  useEffect(() => {
    if (scheme.rooms.length > 0) fitView()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheme.rooms.length])

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

        {wallSegments(room).map((seg) => {
          const a = toScreen(seg.a)
          const b = toScreen(seg.b)
          const mx = (a.x + b.x) / 2
          const my = (a.y + b.y) / 2
          if (seg.length * view.scale < 34) return null
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
              {fmtNum(seg.length, 2)} м
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
        {len * view.scale > 46 && (
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
        {view.scale > 26 && (
          <text x={p.x + r + 4} y={p.y + 4} fontSize="10" fill="rgba(255,255,255,0.75)">
            {n.label || preset.label}
          </text>
        )}
      </g>
    )
  }

  const draftScreen = draft.map(toScreen)

  return (
    <div ref={wrapRef} className="relative h-[440px] w-full md:h-[620px]">
      <svg
        width={size.w}
        height={size.h}
        className="touch-none rounded-xl bg-[#141414]"
        style={{
          cursor:
            tool === "draw" || tool === "node" || tool === "link"
              ? "crosshair"
              : drag
                ? "grabbing"
                : "default",
        }}
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onMouseLeave={handleUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      >
        {gridLines.map((l, i) => (
          <line
            key={i}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke={l.major ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.04)"}
            strokeWidth={1}
          />
        ))}

        {/* На инженерных слоях планировка уходит на второй план — она служит подложкой */}
        <g opacity={layer === "plan" ? 1 : 0.42}>
          {scheme.rooms.map(renderRoom)}
          {scheme.openings.map(renderOpening)}
        </g>

        {layer !== "plan" && (
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
        )}

        {draftScreen.length > 0 && (
          <g>
            <path
              d={
                draftScreen.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") +
                (cursor && tool === "draw" ? ` L${toScreen(cursor).x},${toScreen(cursor).y}` : "")
              }
              fill="none"
              stroke="#D4AF37"
              strokeWidth={2.5}
              strokeDasharray="6 4"
            />
            {draftScreen.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={i === 0 ? 7 : 5}
                fill={i === 0 ? "#D4AF37" : "#161616"}
                stroke="#D4AF37"
                strokeWidth={2}
              />
            ))}
            {cursor && draft.length > 0 && tool === "draw" && (
              <text
                x={toScreen(cursor).x + 12}
                y={toScreen(cursor).y - 10}
                fontSize="12"
                fill="#D4AF37"
              >
                {fmtNum(dist(draft[draft.length - 1], cursor), 2)} м
              </text>
            )}
          </g>
        )}
      </svg>

      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
        <button
          onClick={() => zoomBy(1.25)}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1f1f1f]/90 text-lg text-white/70 hover:bg-white/10"
        >
          +
        </button>
        <button
          onClick={() => zoomBy(1 / 1.25)}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1f1f1f]/90 text-lg text-white/70 hover:bg-white/10"
        >
          −
        </button>
        <button
          onClick={fitView}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1f1f1f]/90 text-xs text-white/70 hover:bg-white/10"
          title="Вписать в экран"
        >
          ⤢
        </button>
      </div>

      {cursor && (
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-[#1f1f1f]/90 px-2.5 py-1.5 text-xs text-white/50">
          {fmtNum(cursor.x, 1)} : {fmtNum(cursor.y, 1)} м · масштаб 1 кл = 0,5 м
        </div>
      )}
    </div>
  )
}

export default PlanCanvas