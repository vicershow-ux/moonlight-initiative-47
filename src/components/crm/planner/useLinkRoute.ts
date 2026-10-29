import { useEffect, useState } from "react"
import { orthoPoint } from "@/lib/planner/geometry"
import { PlanLayer, PlanNode, PlanPoint } from "@/lib/planner/types"
import type { PlanTool } from "./PlanCanvas"

interface Args {
  tool: PlanTool
  layer: PlanLayer
  linkFromId: string | null
  nodeById: Map<string, PlanNode>
  onCancelLink: () => void
  snapPoint: (p: PlanPoint) => PlanPoint
}

/** Изломы прокладываемой трассы: повороты под 90°, Backspace и Esc */
export function useLinkRoute({ tool, layer, linkFromId, nodeById, onCancelLink, snapPoint }: Args) {
  /** Изломы трассы, которую сейчас прокладывают */
  const [bends, setBends] = useState<PlanPoint[]>([])

  // Начали новую трассу или закончили — изломы предыдущей больше не нужны
  useEffect(() => {
    setBends([])
  }, [linkFromId, tool, layer])

  // Backspace убирает последний излом, Esc отменяет прокладку трассы
  useEffect(() => {
    if (tool !== "link" || !linkFromId) return
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
      if (e.key === "Escape") {
        setBends([])
        onCancelLink()
      } else if (e.key === "Backspace") {
        e.preventDefault()
        setBends((b) => b.slice(0, -1))
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [tool, linkFromId, onCancelLink])

  /** Последняя точка прокладываемой трассы: излом либо начальная точка */
  const routeTail = (): PlanPoint | null => {
    if (bends.length > 0) return bends[bends.length - 1]
    const from = linkFromId ? nodeById.get(linkFromId) : null
    return from ? { x: from.x, y: from.y } : null
  }

  /** Излом всегда ставится строго по горизонтали или вертикали от предыдущего */
  const nextBend = (world: PlanPoint, free: boolean): PlanPoint => {
    const p = snapPoint(world)
    const tail = routeTail()
    return tail && !free ? orthoPoint(tail, p) : p
  }

  return { bends, setBends, nextBend }
}

export default useLinkRoute
