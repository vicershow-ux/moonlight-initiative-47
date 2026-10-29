import { useEffect, useState } from "react"
import { snap } from "@/lib/planner/geometry"
import { NodeKind, PlanFixture, PlanLayer, PlanNode, PlanPoint, PlanScheme } from "@/lib/planner/types"
import { fixtureRefs } from "@/lib/planner/fixtures"
import { FORCE_WALL } from "@/lib/planner/walls"
import { CEILING_KINDS } from "@/lib/planner/ceiling"
import { placeAssist } from "@/lib/planner/placeAssist"
import { SNAP_STEP } from "./usePlanView"
import { assistPoint } from "./drawAssist"
import type { PlanTool } from "./planCanvasTypes"

interface Args {
  scheme: PlanScheme
  tool: PlanTool
  layer: PlanLayer
  draft: PlanPoint[]
  nodes: PlanNode[]
  fixtures: PlanFixture[]
  scale: number
}

/**
 * Привязки при рисовании и расстановке: шаг сетки, прилипание к осям
 * потолочных точек и треков, конец рисуемого трека, уровни углов помещений
 */
export function usePlanCanvasAssist({ scheme, tool, layer, draft, nodes, fixtures, scale }: Args) {
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

  const snapPoint = (p: PlanPoint) => ({ x: snap(p.x, SNAP_STEP), y: snap(p.y, SNAP_STEP) })

  /** Потолочные точки (светильники, споты, коробки) ставятся с размерами до стен и соседей */
  const ceilingRefs = (excludeNode?: string, excludeFixture?: string) => [
    ...nodes.filter((n) => n.id !== excludeNode && CEILING_KINDS.has(n.kind)).map((n) => ({ x: n.x, y: n.y })),
    ...fixtureRefs(fixtures, excludeFixture),
  ]
  const placeFor = (world: PlanPoint, kind: NodeKind, free: boolean, excludeId?: string) => {
    if (FORCE_WALL.has(kind) || !CEILING_KINDS.has(kind)) return null
    return placeAssist(snapPoint(world), scheme.rooms, ceilingRefs(excludeId), scale, free)
  }

  /** Конец трека: от начала строго по горизонтали или вертикали (Alt — под любым углом) */
  const trackEnd = (world: PlanPoint, free: boolean) => {
    if (!trackStart) return placeAssist(snapPoint(world), scheme.rooms, ceilingRefs(), scale, free)
    let p = snapPoint(world)
    if (!free) {
      p = Math.abs(p.x - trackStart.x) >= Math.abs(p.y - trackStart.y) ? { x: p.x, y: trackStart.y } : { x: trackStart.x, y: p.y }
    }
    const pa = placeAssist(p, scheme.rooms, ceilingRefs(), scale, free)
    // Прилипание не должно сбивать трек с оси
    const q = free ? pa.point : trackStart.y === p.y ? { x: pa.point.x, y: trackStart.y } : { x: trackStart.x, y: pa.point.y }
    return { ...pa, point: q }
  }

  /** Все углы на плане и в текущем контуре — к их уровню прилипает новая точка */
  const assistRefs = (exclude?: { roomId: string; index: number }) => [
    ...scheme.rooms.flatMap((r) => r.points.filter((_, i) => !(exclude && r.id === exclude.roomId && i === exclude.index))),
    ...draft,
  ]

  const drawAssist = (world: PlanPoint, free: boolean) => {
    const prev = draft.length ? draft[draft.length - 1] : null
    const before = draft.length > 1 ? draft[draft.length - 2] : null
    return assistPoint(snapPoint(world), prev, before, assistRefs(), scale, free)
  }

  return { trackStart, setTrackStart, snapPoint, ceilingRefs, placeFor, trackEnd, assistRefs, drawAssist }
}

export default usePlanCanvasAssist
