import { useEffect, useMemo, useState } from "react"
import {
  dist,
  distToPolyline,
  linkGeometry,
  openingPosition,
  pointInPolygon,
  snap,
  wallSegments,
} from "@/lib/planner/geometry"
import {
  NodeKind,
  PlanLayer,
  PlanLink,
  PlanNode,
  PlanPoint,
  PlanScheme,
  FixtureKind,
  PlanFixture,
} from "@/lib/planner/types"
import { fixtureRefs, hitFixture } from "@/lib/planner/fixtures"
import { FloatingDraft, TrackDraft } from "./FixtureDrafts"
import {
  SNAP_STEP,
  eventPoint,
  usePlanView,
} from "./usePlanView"
import { PlanRoomsLayer } from "./PlanRoomsLayer"
import { FORCE_WALL, hitWall, schemeWalls } from "@/lib/planner/walls"
import { CEILING_KINDS } from "@/lib/planner/ceiling"
import { PlaceAssist, placeAssist } from "@/lib/planner/placeAssist"
import { PlaceAssistLayer } from "./PlaceAssistLayer"
import { PlanDimensionsLayer } from "./PlanDimensionsLayer"
import { PlanEngineerLayer } from "./PlanEngineerLayer"
import { PlanControls, PlanDraftLayer } from "./PlanOverlays"
import { DrawAssist, assistPoint } from "./drawAssist"
import { useTypedLength } from "./useTypedLength"
import { useLinkRoute } from "./useLinkRoute"
import { useWheelZoom } from "./useWheelZoom"
import { TypedLengthHint } from "./TypedLengthHint"
import { WallLegend } from "./WallLegend"
import { NodeLegend } from "./NodeLegend"

export type PlanTool = "select" | "draw" | "window" | "door" | "arch" | "node" | "link" | "track" | "floating"

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
  selectedWallId?: string | null
  /** Щелчок по стене на слое планировки */
  onSelectWall?: (wallId: string | null) => void
  onMoveVertex: (roomId: string, index: number, point: PlanPoint) => void
  onAddNode: (point: PlanPoint) => void
  onMoveNode: (id: string, point: PlanPoint) => void
  onLinkClick: (nodeId: string, bends: PlanPoint[]) => void
  onCancelLink: () => void
  onUpdateLink: (id: string, patch: Partial<PlanLink>) => void
  linkGroupId?: string | null
  linkSpec?: string | null
  /** Подсвеченная группа щита: её кабели и точки ярко, остальное бледно */
  highlightGroupId?: string | null
  selectedFixtureId?: string | null
  onSelectFixture?: (id: string | null) => void
  onAddFixture?: (kind: FixtureKind, a: PlanPoint, b: PlanPoint) => void
  onUpdateFixture?: (id: string, patch: Partial<PlanFixture>) => void
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
  selectedWallId = null,
  onSelectWall,
  onMoveVertex,
  onAddNode,
  onMoveNode,
  onLinkClick,
  onCancelLink,
  onUpdateLink,
  linkGroupId = null,
  linkSpec = null,
  highlightGroupId = null,
  selectedFixtureId = null,
  onSelectFixture,
  onAddFixture,
  onUpdateFixture,
}: Props) {
  const { wrapRef, size, view, setView, toScreen, toWorld, gridLines, gridStep, zoomBy, fitView } =
    usePlanView(scheme.rooms)

  const [cursor, setCursor] = useState<PlanPoint | null>(null)
  const [assist, setAssist] = useState<DrawAssist | null>(null)
  const [place, setPlace] = useState<PlaceAssist | null>(null)
  const [drag, setDrag] = useState<
    | { type: "pan"; startX: number; startY: number; tx: number; ty: number }
    | { type: "vertex"; roomId: string; index: number }
    | { type: "node"; nodeId: string }
    | { type: "bend"; linkId: string; index: number }
    | { type: "fixture"; id: string; grab: PlanPoint; a: PlanPoint; b: PlanPoint }
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
  const fixtures = useMemo(() => (layer === "electric" ? scheme.fixtures || [] : []), [scheme.fixtures, layer])
  /** Начало рисуемого трека */
  const [trackStart, setTrackStart] = useState<PlanPoint | null>(null)
  useEffect(() => {
    setTrackStart(null)
  }, [tool, layer])
  useEffect(() => {
    if (!trackStart) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTrackStart(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [trackStart])

  const nodeById = useMemo(() => {
    const map = new Map<string, PlanNode>()
    for (const n of scheme.nodes || []) map.set(n.id, n)
    return map
  }, [scheme.nodes])

  const { typed, setTyped, typedPoint, placePoint } = useTypedLength({ tool, draft, cursor, onDraftChange, onFinishRoom })

  const wallById = new Map(schemeWalls(scheme).all.map((w) => [w.id, w]))

  const snapPoint = (p: PlanPoint) => ({ x: snap(p.x, SNAP_STEP), y: snap(p.y, SNAP_STEP) })

  /** Потолочные точки (светильники, споты, коробки) ставятся с размерами до стен и соседей */
  const ceilingRefs = (excludeNode?: string, excludeFixture?: string) => [
    ...nodes.filter((n) => n.id !== excludeNode && CEILING_KINDS.has(n.kind)).map((n) => ({ x: n.x, y: n.y })),
    ...fixtureRefs(fixtures, excludeFixture),
  ]
  const placeFor = (world: PlanPoint, kind: NodeKind, free: boolean, excludeId?: string) => {
    if (FORCE_WALL.has(kind) || !CEILING_KINDS.has(kind)) return null
    return placeAssist(snapPoint(world), scheme.rooms, ceilingRefs(excludeId), view.scale, free)
  }

  /** Конец трека: от начала строго по горизонтали или вертикали (Alt — под любым углом) */
  const trackEnd = (world: PlanPoint, free: boolean) => {
    if (!trackStart) return placeAssist(snapPoint(world), scheme.rooms, ceilingRefs(), view.scale, free)
    let p = snapPoint(world)
    if (!free) {
      p = Math.abs(p.x - trackStart.x) >= Math.abs(p.y - trackStart.y) ? { x: p.x, y: trackStart.y } : { x: trackStart.x, y: p.y }
    }
    const pa = placeAssist(p, scheme.rooms, ceilingRefs(), view.scale, free)
    // Прилипание не должно сбивать трек с оси
    const q = free ? pa.point : trackStart.y === p.y ? { x: pa.point.x, y: trackStart.y } : { x: trackStart.x, y: pa.point.y }
    return { ...pa, point: q }
  }

  const { bends, setBends, nextBend } = useLinkRoute({ tool, layer, linkFromId, nodeById, onCancelLink, snapPoint })

  /** Все углы на плане и в текущем контуре — к их уровню прилипает новая точка */
  const assistRefs = (exclude?: { roomId: string; index: number }) => [
    ...scheme.rooms.flatMap((r) => r.points.filter((_, i) => !(exclude && r.id === exclude.roomId && i === exclude.index))),
    ...draft,
  ]

  const drawAssist = (world: PlanPoint, free: boolean) => {
    const prev = draft.length ? draft[draft.length - 1] : null
    const before = draft.length > 1 ? draft[draft.length - 2] : null
    return assistPoint(snapPoint(world), prev, before, assistRefs(), view.scale, free)
  }

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
      const pa = placeFor(world, nodeKind, e.altKey)
      onAddNode(pa ? pa.point : { x: snap(world.x, SNAP_STEP), y: snap(world.y, SNAP_STEP) })
      return
    }

    if (tool === "track") {
      const pa = trackEnd(world, e.altKey)
      if (!trackStart) {
        setTrackStart(pa.point)
        return
      }
      if (dist(trackStart, pa.point) > 0.05) onAddFixture?.("track", trackStart, pa.point)
      setTrackStart(null)
      return
    }

    if (tool === "floating") {
      onAddFixture?.("floating", world, world)
      return
    }

    if (tool === "link") {
      const n = hitNode()
      if (n) {
        onLinkClick(n.id, linkFromId && n.id !== linkFromId ? bends : [])
        return
      }
      // Щелчок по пустому месту — ещё один поворот трассы
      if (linkFromId) setBends((b) => [...b, nextBend(world, e.altKey)])
      return
    }

    if (tool === "select") {
      // На инженерных слоях сначала ищем точку — её можно двигать
      if (layer !== "plan") {
        const n = hitNode()
        if (n) {
          setDrag({ type: "node", nodeId: n.id })
          onSelectNode(n.id)
          onSelectFixture?.(null)
          return
        }

        // Изломы выбранной трассы можно таскать мышью
        const sel = links.find((l) => l.id === selectedLinkId)
        if (sel) {
          const idx = (sel.points || []).findIndex((p) => dist(p, world) * view.scale < 9)
          if (idx >= 0) {
            setDrag({ type: "bend", linkId: sel.id, index: idx })
            return
          }
        }

        const link = links.find((l) => {
          const g = linkGeometry(l, nodeById)
          return g ? distToPolyline(world, g.route) * view.scale < 8 : false
        })
        if (link) {
          onSelectLink(link.id)
          onSelectFixture?.(null)
          return
        }
        const fx = hitFixture(scheme, fixtures, world, 8 / view.scale)
        if (fx) {
          onSelectFixture?.(fx.id)
          onSelectNode(null)
          onSelectLink(null)
          if (fx.kind === "track") setDrag({ type: "fixture", id: fx.id, grab: world, a: fx.a, b: fx.b })
          return
        }
        onSelectFixture?.(null)
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

      // Стена: щелчок по её полосе на плане. Тонкие перегородки ловим с запасом 6 пикселей
      if (layer === "plan" && onSelectWall) {
        const wall = hitWall(scheme, world, 6 / view.scale)
        if (wall) {
          onSelectWall(wall.id)
          return
        }
      }

      const room = [...scheme.rooms].reverse().find((r) => pointInPolygon(world, r.points))
      onSelectRoom(room ? room.id : null)
      if (!room) onSelectOpening(null)
      onSelectWall?.(null)
      return
    }

    if (tool === "draw") {
      const tp = typedPoint()
      if (tp) {
        placePoint(tp)
        setTyped("")
        return
      }
      const snapped = drawAssist(world, e.altKey).point
      // Замыкаем контур, если щёлкнули рядом с первой точкой (12 пикселей на экране)
      if (draft.length >= 3 && dist(snapped, draft[0]) * view.scale < 12) {
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
    if (tool === "draw" && !drag) {
      const a = drawAssist(world, e.altKey)
      setAssist(a)
      setCursor(a.point)
    } else if (tool === "track" && !drag) {
      if (assist) setAssist(null)
      const pa = trackEnd(world, e.altKey)
      setPlace(pa)
      setCursor(pa.point)
    } else if (tool === "node" && !drag) {
      if (assist) setAssist(null)
      const pa = placeFor(world, nodeKind, e.altKey)
      setPlace(pa)
      setCursor(pa ? pa.point : snapPoint(world))
    } else {
      if (assist && !drag) setAssist(null)
      if (place && !drag) setPlace(null)
      setCursor(snapPoint(world))
    }

    if (!drag) return
    if (drag.type === "pan") {
      setView((v) => ({ ...v, tx: drag.tx + (sx - drag.startX), ty: drag.ty + (sy - drag.startY) }))
      return
    }
    if (drag.type === "node") {
      const moving = nodes.find((n) => n.id === drag.nodeId)
      const pa = moving ? placeFor(world, moving.kind, e.altKey, moving.id) : null
      setPlace(pa)
      onMoveNode(drag.nodeId, pa ? pa.point : snapPoint(world))
      return
    }
    if (drag.type === "fixture") {
      // Трек двигается целиком; к осям светильников прилипает его начало
      const raw = { x: drag.a.x + world.x - drag.grab.x, y: drag.a.y + world.y - drag.grab.y }
      const pa = placeAssist(snapPoint(raw), scheme.rooms, ceilingRefs(undefined, drag.id), view.scale, e.altKey)
      const dx = pa.point.x - drag.a.x
      const dy = pa.point.y - drag.a.y
      onUpdateFixture?.(drag.id, { a: pa.point, b: { x: drag.b.x + dx, y: drag.b.y + dy } })
      setPlace({ ...pa, dims: [] })
      return
    }
    if (drag.type === "bend") {
      const link = links.find((l) => l.id === drag.linkId)
      if (!link) return
      const pts = (link.points || []).map((p, i) => (i === drag.index ? snapPoint(world) : p))
      onUpdateLink(link.id, { points: pts })
      return
    }
    const a = assistPoint(snapPoint(world), null, null, assistRefs({ roomId: drag.roomId, index: drag.index }), view.scale, e.altKey)
    setAssist(a)
    setCursor(a.point)
    onMoveVertex(drag.roomId, drag.index, a.point)
  }

  const handleUp = () => {
    if (drag?.type === "vertex") setAssist(null)
    if (drag?.type === "node" || drag?.type === "fixture") setPlace(null)
    setDrag(null)
  }

  const svgRef = useWheelZoom(view, setView, toWorld)

  return (
    <div ref={wrapRef} className="relative h-[440px] w-full overscroll-contain md:h-[620px]">
      <svg
        ref={svgRef}
        width={size.w}
        height={size.h}
        className="touch-none rounded-xl bg-[#141414]"
        style={{
          cursor:
            tool === "draw" || tool === "node" || tool === "link" || tool === "track" || tool === "floating"
              ? "crosshair"
              : drag
                ? "grabbing"
                : "default",
        }}
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onMouseLeave={() => {
          handleUp()
          setAssist(null)
          setPlace(null)
        }}
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
          selectedWallId={selectedWallId}
        />

        {layer === "plan" && (
          <PlanDimensionsLayer
            rooms={scheme.rooms}
            scale={view.scale}
            toScreen={toScreen}
            wallOut={(id) => {
              const w = wallById.get(id)
              return w ? w.thickness - w.inner : 0
            }}
          />
        )}

        {layer !== "plan" && (
          <PlanEngineerLayer
            layer={layer}
            tool={tool}
            nodeKind={nodeKind}
            scale={view.scale}
            nodes={nodes}
            links={links}
            rooms={scheme.rooms}
            groups={scheme.groups || []}
            linkGroupId={linkGroupId}
            highlightGroupId={highlightGroupId}
            fixtures={fixtures}
            selectedFixtureId={selectedFixtureId}
            linkSpec={linkSpec}
            nodeById={nodeById}
            linkFromId={linkFromId}
            selectedNodeId={selectedNodeId}
            selectedLinkId={selectedLinkId}
            cursor={cursor}
            bends={bends}
            previewBend={tool === "link" && linkFromId && cursor ? nextBend(cursor, false) : null}
            toScreen={toScreen}
            scheme={scheme}
          />
        )}

        {tool === "track" && trackStart && cursor && (
          <TrackDraft scheme={scheme} a={trackStart} b={cursor} toScreen={toScreen} />
        )}
        {tool === "floating" && cursor && <FloatingDraft scheme={scheme} at={cursor} toScreen={toScreen} />}

        {place && layer !== "plan" && <PlaceAssistLayer assist={place} toScreen={toScreen} />}

        <PlanDraftLayer draft={draft} tool={tool} cursor={typedPoint() || cursor} assist={assist} scale={view.scale} toScreen={toScreen} />
      </svg>

      {tool === "draw" && draft.length > 0 && cursor && <TypedLengthHint cursor={cursor} typed={typed} toScreen={toScreen} />}

      {layer === "plan" ? <WallLegend scheme={scheme} /> : <NodeLegend scheme={scheme} layer={layer} />}

      <PlanControls cursor={cursor} gridStep={gridStep} zoomBy={zoomBy} fitView={fitView} />
    </div>
  )
}

export default PlanCanvas