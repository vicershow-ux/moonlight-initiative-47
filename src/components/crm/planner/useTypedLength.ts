import { useEffect, useRef, useState } from "react"
import { dist } from "@/lib/planner/geometry"
import { PlanPoint } from "@/lib/planner/types"
import type { PlanTool } from "./PlanCanvas"

interface Args {
  tool: PlanTool
  draft: PlanPoint[]
  cursor: PlanPoint | null
  onDraftChange: (points: PlanPoint[]) => void
  onFinishRoom: (points: PlanPoint[]) => void
}

/** Ввод длины стены с клавиатуры во время черчения: 3000 + Enter — стена ровно 3 м */
export function useTypedLength({ tool, draft, cursor, onDraftChange, onFinishRoom }: Args) {
  /** Длина стены, набранная с клавиатуры, мм */
  const [typed, setTyped] = useState("")

  useEffect(() => {
    if (tool !== "draw" || draft.length === 0) setTyped("")
  }, [tool, draft.length])

  /** Точка на набранном расстоянии от последнего угла в сторону курсора */
  const typedPoint = (): PlanPoint | null => {
    const mm = parseFloat(typed.replace(",", "."))
    if (!typed || !Number.isFinite(mm) || mm <= 0 || !cursor || draft.length === 0) return null
    const prev = draft[draft.length - 1]
    const dx = cursor.x - prev.x
    const dy = cursor.y - prev.y
    const len = Math.hypot(dx, dy)
    if (len < 1e-6) return null
    const m = mm / 1000
    return { x: Math.round((prev.x + (dx / len) * m) * 10000) / 10000, y: Math.round((prev.y + (dy / len) * m) * 10000) / 10000 }
  }

  const placePoint = (p: PlanPoint) => {
    if (draft.length >= 3 && dist(p, draft[0]) < 0.005) {
      onFinishRoom(draft)
      return
    }
    onDraftChange([...draft, p])
  }

  // Набор длины стены цифрами: 3000 + Enter — стена ровно 3 м в сторону курсора
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => undefined)
  keyRef.current = (e: KeyboardEvent) => {
    if (tool !== "draw" || draft.length === 0) return
    const target = e.target as HTMLElement | null
    if (target && (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable)) return
    if (/^[0-9]$/.test(e.key) || ((e.key === "," || e.key === ".") && !/[.,]/.test(typed))) {
      e.preventDefault()
      if (typed.length < 7) setTyped((t) => t + e.key)
    } else if (e.key === "Backspace") {
      e.preventDefault()
      if (typed) setTyped((t) => t.slice(0, -1))
      else onDraftChange(draft.slice(0, -1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const p = typedPoint()
      if (p) {
        placePoint(p)
        setTyped("")
      } else if (!typed && draft.length >= 3) onFinishRoom(draft)
    } else if (e.key === "Escape") {
      if (typed) setTyped("")
      else onDraftChange([])
    }
  }
  useEffect(() => {
    const h = (e: KeyboardEvent) => keyRef.current(e)
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [])

  return { typed, setTyped, typedPoint, placePoint }
}

export default useTypedLength
