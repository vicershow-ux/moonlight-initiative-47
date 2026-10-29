import { Dispatch, SetStateAction, useEffect, useRef } from "react"
import { PlanPoint } from "@/lib/planner/types"
import { MAX_SCALE, MIN_SCALE } from "./usePlanView"

interface View {
  scale: number
  tx: number
  ty: number
}

/**
 * Колёсико масштабирует план и не прокручивает страницу. React вешает onWheel пассивно —
 * там preventDefault не работает, поэтому слушаем событие напрямую с passive: false
 */
export function useWheelZoom(view: View, setView: Dispatch<SetStateAction<View>>, toWorld: (sx: number, sy: number) => PlanPoint) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const wheelRef = useRef<(e: WheelEvent) => void>(() => undefined)
  wheelRef.current = (e: WheelEvent) => {
    e.preventDefault()
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const before = toWorld(sx, sy)
    // Тачпад шлёт много мелких шагов — масштабируем плавно, пропорционально прокрутке
    const step = Math.max(-1, Math.min(1, -e.deltaY / 100))
    const factor = Math.pow(1.12, step)
    const scale = Math.min(Math.max(view.scale * factor, MIN_SCALE), MAX_SCALE)
    setView({ scale, tx: sx - before.x * scale, ty: sy - before.y * scale })
  }
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => wheelRef.current(e)
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [])

  return svgRef
}

export default useWheelZoom
