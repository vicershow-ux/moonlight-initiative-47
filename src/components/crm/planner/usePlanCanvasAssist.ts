import { useEffect, useState } from "react"
import { snap } from "@/lib/planner/geometry"
import { NodeKind, PlanFixture, PlanLayer, PlanNode, PlanPoint, PlanScheme } from "@/lib/planner/types"
import { fixtureRefs } from "@/lib/planner/fixtures"
import { FORCE_WALL } from "@/lib/planner/walls"
import { CEILING_KINDS } from "@/lib/planner/ceiling"
import { placeAssist } from "@/lib/planner/placeAssist"
import { SNAP_STEP } from "./usePlanView"
import { assistPoint } from "./drawAssist"
import { furnitureRefs } from "@/lib/planner/interior"
import type { PlanTool } from "./planCanvasTypes"

interface Args {
  scheme: PlanScheme
  tool: PlanTool
  layer: PlanLayer
  draft: PlanPoint[]
  nodes: PlanNode[]
  fixtures: PlanFixture[]
  scale: number
  /** Закончили рисовать трек: все его точки по порядку */
  onFinishTrack?: (pts: PlanPoint[]) => void
}

/**
 * Привязки при рисовании и расстановке: шаг сетки, прилипание к осям
 * потолочных точек и треков, конец рисуемого трека, уровни углов помещений
 */
export function usePlanCanvasAssist({ scheme, tool, layer, draft, nodes, fixtures, scale, onFinishTrack }: Args) {
  /** Рисуемый трек: начало и уже поставленные повороты */
  const [trackPts, setTrackPts] = useState<PlanPoint[]>([])
  const trackStart = trackPts.length ? trackPts[trackPts.length - 1] : null
  useEffect(() => {
    setTrackPts([])
  }, [tool, layer])

  /** Готовый трек уходит в план; меньше двух точек или нулевая длина — отбрасываем */
  const finishTrack = (pts: PlanPoint[]) => {
    const clean = pts.filter((p, i) => i === 0 || Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y) > 0.02)
    // Точки на одной прямой — не поворот, убираем
    const out = clean.filter((p, i) => {
      if (i === 0 || i === clean.length - 1) return true
      const a = clean[i - 1]
      const b = clean[i + 1]
      return Math.abs((p.x - a.x) * (b.y - p.y) - (p.y - a.y) * (b.x - p.x)) > 1e-9
    })
    if (out.length >= 2) onFinishTrack?.(out)
    setTrackPts([])
  }

  // Enter — закончить трек, Backspace — убрать последний поворот, Esc — отмена
  useEffect(() => {
    if (!trackPts.length) return
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
      if (e.key === "Escape") setTrackPts([])
      else if (e.key === "Enter") finishTrack(trackPts)
      else if (e.key === "Backspace") {
        e.preventDefault()
        setTrackPts((p) => p.slice(0, -1))
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const snapPoint = (p: PlanPoint) => ({ x: snap(p.x, SNAP_STEP), y: snap(p.y, SNAP_STEP) })

  /** Потолочные точки (светильники, споты, коробки) ставятся с размерами до стен и соседей */
  const ceilingRefs = (excludeNode?: string, excludeFixture?: string) => [
    ...nodes.filter((n) => n.id !== excludeNode && CEILING_KINDS.has(n.kind)).map((n) => ({ x: n.x, y: n.y })),
    ...fixtureRefs(fixtures, excludeFixture),
  ]
  const placeFor = (world: PlanPoint, kind: NodeKind, free: boolean, excludeId?: string) => {
    if (FORCE_WALL.has(kind) || !CEILING_KINDS.has(kind)) return null
    // Светильники прилипают и к центрам/краям мебели — ровно над столом или кроватью
    return placeAssist(snapPoint(world), scheme.rooms, [...ceilingRefs(excludeId), ...furnitureRefs(scheme)], scale, free)
  }

  /** Следующая точка трека: от последней строго по горизонтали или вертикали — повороты под 90° (Alt — под любым углом) */
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
    // Рядом с углом соседнего помещения — точно в угол, рядом со стеной — на её линию
    if (!free) {
      let bestP: PlanPoint | null = null
      let bestD = 12 / scale
      for (const r of scheme.rooms)
        for (const p of r.points) {
          const d = Math.hypot(p.x - world.x, p.y - world.y)
          if (d < bestD) {
            bestD = d
            bestP = p
          }
        }
      if (bestP) return { point: { ...bestP }, guides: [], angle: assistPoint(bestP, prev, before, [], scale, true).angle }
      let edgeP: PlanPoint | null = null
      let edgeD = 7 / scale
      for (const r of scheme.rooms)
        for (let i = 0; i < r.points.length; i++) {
          const a = r.points[i]
          const b = r.points[(i + 1) % r.points.length]
          const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2
          if (l2 < 1e-9) continue
          const t = Math.min(Math.max(((world.x - a.x) * (b.x - a.x) + (world.y - a.y) * (b.y - a.y)) / l2, 0), 1)
          const q = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
          const d = Math.hypot(q.x - world.x, q.y - world.y)
          if (d < edgeD) {
            edgeD = d
            edgeP = q
          }
        }
      if (edgeP) {
        const ap = assistPoint(snapPoint(edgeP), prev, before, assistRefs(), scale, false)
        return { ...ap, point: { x: Math.abs(ap.point.x - edgeP.x) < 0.02 ? ap.point.x : edgeP.x, y: Math.abs(ap.point.y - edgeP.y) < 0.02 ? ap.point.y : edgeP.y } }
      }
    }
    return assistPoint(snapPoint(world), prev, before, assistRefs(), scale, free)
  }

  return { trackStart, trackPts, setTrackPts, finishTrack, snapPoint, ceilingRefs, placeFor, trackEnd, assistRefs, drawAssist }
}

export default usePlanCanvasAssist
