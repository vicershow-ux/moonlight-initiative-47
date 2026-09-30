import { useMemo, useState } from "react"
import {
  dist,
  distToSegment,
  openingPosition,
  pointInPolygon,
  snap,
  wallSegments,
} from "@/lib/planner/geometry"
import {
  NodeKind,
  PlanLayer,
  PlanNode,
  PlanPoint,
  PlanScheme,
} from "@/lib/planner/types"
import {
  CLOSE_DISTANCE,
  SNAP_STEP,
  eventPoint,
  usePlanView,
} from "./usePlanView"
import { PlanRoomsLayer } from "./PlanRoomsLayer"
import { PlanEngineerLayer } from "./PlanEngineerLayer"
import { PlanControls, PlanDraftLayer } from "./PlanOverlays"

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
  const { wrapRef, size, view, setView, toScreen, toWorld, gridLines, zoomBy, fitView } =
    usePlanView(scheme.rooms)

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

        <PlanRoomsLayer
          scheme={scheme}
          layer={layer}
          scale={view.scale}
          selectedRoomId={selectedRoomId}
          selectedOpeningId={selectedOpeningId}
          toScreen={toScreen}
        />

        {layer !== "plan" && (
          <PlanEngineerLayer
            layer={layer}
            tool={tool}
            nodeKind={nodeKind}
            scale={view.scale}
            nodes={nodes}
            links={links}
            nodeById={nodeById}
            linkFromId={linkFromId}
            selectedNodeId={selectedNodeId}
            selectedLinkId={selectedLinkId}
            cursor={cursor}
            toScreen={toScreen}
          />
        )}

        <PlanDraftLayer draft={draft} tool={tool} cursor={cursor} toScreen={toScreen} />
      </svg>

      <PlanControls cursor={cursor} zoomBy={zoomBy} fitView={fitView} />
    </div>
  )
}

export default PlanCanvas
