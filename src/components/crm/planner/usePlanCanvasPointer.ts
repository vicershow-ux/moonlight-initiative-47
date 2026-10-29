import { useState } from "react"
import {
  dist,
  distToPolyline,
  linkGeometry,
  openingPosition,
  pointInPolygon,
  snap,
  wallSegments,
} from "@/lib/planner/geometry"
import { PlanFixture, PlanLink, PlanNode, PlanPoint } from "@/lib/planner/types"
import { hitFixture, shiftTrack } from "@/lib/planner/fixtures"
import { hitFurniture, hitHeating, snapFurnitureToWall } from "@/lib/planner/interior"
import { furnitureProps } from "@/lib/planner/types"
import { hitWall } from "@/lib/planner/walls"
import { PlaceAssist, placeAssist } from "@/lib/planner/placeAssist"
import { SNAP_STEP, eventPoint } from "./usePlanView"
import { DrawAssist, assistPoint } from "./drawAssist"
import type { PlanCanvasProps, PlanDrag } from "./planCanvasTypes"
import type { usePlanCanvasAssist } from "./usePlanCanvasAssist"

type View = { tx: number; ty: number; scale: number }

interface Args {
  props: PlanCanvasProps
  view: View
  setView: (fn: (v: View) => View) => void
  toWorld: (sx: number, sy: number) => PlanPoint
  nodes: PlanNode[]
  links: PlanLink[]
  fixtures: PlanFixture[]
  nodeById: Map<string, PlanNode>
  assistApi: ReturnType<typeof usePlanCanvasAssist>
  bends: PlanPoint[]
  setBends: (fn: (b: PlanPoint[]) => PlanPoint[]) => void
  nextBend: (world: PlanPoint, free: boolean) => PlanPoint
  typedPoint: () => PlanPoint | null
  placePoint: (p: PlanPoint) => void
  setTyped: (v: string) => void
  cursorState: [PlanPoint | null, (p: PlanPoint | null) => void]
}

/** Мышь на холсте: щелчки по инструментам, выбор, перетаскивание и подсказки под курсором */
export function usePlanCanvasPointer({
  props,
  view,
  setView,
  toWorld,
  nodes,
  links,
  fixtures,
  nodeById,
  assistApi,
  bends,
  setBends,
  nextBend,
  typedPoint,
  placePoint,
  setTyped,
  cursorState,
}: Args) {
  const {
    scheme,
    tool,
    layer,
    nodeKind,
    linkFromId,
    draft,
    selectedLinkId,
    onDraftChange,
    onFinishRoom,
    onSelectRoom,
    onSelectOpening,
    onSelectNode,
    onSelectLink,
    onAddOpening,
    onSelectWall,
    onMoveVertex,
    onAddNode,
    onMoveNode,
    onLinkClick,
    onUpdateLink,
    onSelectFixture,
    onAddFixture,
    onUpdateFixture,
    onSelectFurniture,
    onAddFurniture,
    onUpdateFurniture,
    onSelectHeating,
    onAddHeating,
    onUpdateHeating,
  } = props
  const furniture = scheme.furniture || []
  const { trackStart, trackPts, setTrackPts, finishTrack, snapPoint, ceilingRefs, placeFor, trackEnd, assistRefs, drawAssist } = assistApi
  const [, setCursor] = cursorState

  const [assist, setAssist] = useState<DrawAssist | null>(null)
  const [place, setPlace] = useState<PlaceAssist | null>(null)
  const [drag, setDrag] = useState<PlanDrag>(null)

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
        setTrackPts([pa.point])
        return
      }
      // Двойной щелчок или щелчок в ту же точку — конец трека, иначе ещё один поворот
      if (e.detail >= 2 || dist(trackStart, pa.point) <= 0.05) {
        finishTrack(dist(trackStart, pa.point) > 0.05 ? [...trackPts, pa.point] : trackPts)
        return
      }
      setTrackPts([...trackPts, pa.point])
      return
    }

    if (tool === "furniture") {
      onAddFurniture?.(snapPoint(world))
      return
    }

    // Контур тёплого пола рисуется как стены: щелчки по углам, замыкание у первой точки
    if (tool === "heating") {
      const snapped = drawAssist(world, e.altKey).point
      if (draft.length >= 3 && dist(snapped, draft[0]) * view.scale < 12) {
        onAddHeating?.(draft)
        return
      }
      onDraftChange([...draft, snapped])
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

    if (tool === "select" && layer === "interior") {
      const fu = hitFurniture(furniture, world)
      if (fu) {
        onSelectFurniture?.(fu.id)
        onSelectHeating?.(null)
        setDrag({ type: "furniture", id: fu.id, grab: world, x: fu.x, y: fu.y })
        return
      }
      onSelectFurniture?.(null)
      onSelectHeating?.(null)
      const room = [...scheme.rooms].reverse().find((r) => pointInPolygon(world, r.points))
      onSelectRoom(room ? room.id : null)
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
          if (fx.kind === "track") setDrag({ type: "fixture", id: fx.id, grab: world, a: fx.a, b: fx.b, points: fx.points || [] })
          return
        }
        // Тёплый пол на электрике: углы выбранной зоны тянутся, зона целиком — переносится
        if (layer === "electric") {
          const selZone = (scheme.heating || []).find((h) => h.id === props.selectedHeatingId)
          if (selZone) {
            const vi = selZone.points.findIndex((p) => dist(p, world) * view.scale < 9)
            if (vi >= 0) {
              setDrag({ type: "heatingVertex", id: selZone.id, index: vi })
              return
            }
          }
          const hz = hitHeating(scheme.heating || [], world)
          if (hz) {
            onSelectHeating?.(hz.id)
            onSelectFixture?.(null)
            onSelectNode(null)
            onSelectLink(null)
            setDrag({ type: "heating", id: hz.id, grab: world, points: hz.points })
            return
          }
          onSelectHeating?.(null)
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
    if ((tool === "draw" || tool === "heating") && !drag) {
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
      onUpdateFixture?.(drag.id, shiftTrack(drag, dx, dy))
      setPlace({ ...pa, dims: [] })
      return
    }
    if (drag.type === "heating") {
      const d = snapPoint({ x: world.x - drag.grab.x, y: world.y - drag.grab.y })
      onUpdateHeating?.(drag.id, { points: drag.points.map((p) => ({ x: p.x + d.x, y: p.y + d.y })) })
      return
    }
    if (drag.type === "heatingVertex") {
      const zone = (scheme.heating || []).find((h) => h.id === drag.id)
      if (!zone) return
      const p = snapPoint(world)
      onUpdateHeating?.(drag.id, { points: zone.points.map((q, i) => (i === drag.index ? p : q)) })
      return
    }
    if (drag.type === "furniture") {
      const item = furniture.find((f) => f.id === drag.id)
      if (!item) return
      const raw = snapPoint({ x: drag.x + world.x - drag.grab.x, y: drag.y + world.y - drag.grab.y })
      // У стены — прилипает тыльной стороной и разворачивается; Alt — свободно
      const sn = !e.altKey && furnitureProps(item).wall ? snapFurnitureToWall(scheme, { ...item, ...raw }, 0.25) : null
      onUpdateFurniture?.(drag.id, sn ? sn : raw)
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

  const handleLeave = () => {
    handleUp()
    setAssist(null)
    setPlace(null)
  }

  return { assist, place, drag, handleDown, handleMove, handleUp, handleLeave }
}

export default usePlanCanvasPointer
