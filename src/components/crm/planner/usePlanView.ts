import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { PlanPoint, PlanRoom } from "@/lib/planner/types"

/** Привязка курсора — 10 мм. Точные размеры вводятся числом в панели справа */
export const SNAP_STEP = 0.01
export const MIN_SCALE = 8
/** До 3 пикселей на миллиметр — можно разглядеть детали узлов */
export const MAX_SCALE = 3000

/** Шаг сетки подбирается под масштаб: 10 мм, 100 мм, 500 мм или 1 м */
const GRID_STEPS = [0.01, 0.1, 0.5, 1]
export const gridStepFor = (scale: number) =>
  GRID_STEPS.find((s) => s * scale >= 10) ?? 1

export type ToScreen = (p: PlanPoint) => { x: number; y: number }

export const eventPoint = (e: React.MouseEvent | React.TouchEvent) => {
  const svg = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
  const src = "touches" in e ? e.touches[0] || e.changedTouches[0] : e
  return { sx: src.clientX - svg.left, sy: src.clientY - svg.top }
}

/**
 * Область просмотра плана: размер холста, масштаб, сдвиг, сетка,
 * пересчёт координат между планом и экраном.
 */
export function usePlanView(rooms: PlanRoom[]) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 800, h: 560 })
  const [view, setView] = useState({ scale: 40, tx: 60, ty: 60 })

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

  const toScreen = useCallback<ToScreen>(
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

  const gridStep = gridStepFor(view.scale)

  const gridLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; major: boolean }[] = []
    const step = gridStep
    // Жирная линия — каждые 100 мм на мелкой сетке и каждый метр на крупной
    const majorEvery = Math.round((step < 0.1 ? 0.1 : 1) / step)

    const startX = -view.tx / view.scale
    const endX = (size.w - view.tx) / view.scale
    const startY = -view.ty / view.scale
    const endY = (size.h - view.ty) / view.scale

    // Считаем по целому номеру линии, чтобы не копилась погрешность дробей
    for (let i = Math.floor(startX / step); i * step < endX; i++) {
      const px = i * step * view.scale + view.tx
      lines.push({ x1: px, y1: 0, x2: px, y2: size.h, major: i % majorEvery === 0 })
    }
    for (let i = Math.floor(startY / step); i * step < endY; i++) {
      const py = i * step * view.scale + view.ty
      lines.push({ x1: 0, y1: py, x2: size.w, y2: py, major: i % majorEvery === 0 })
    }
    return lines
  }, [view, size, gridStep])

  const zoomBy = (factor: number) => {
    const cx = size.w / 2
    const cy = size.h / 2
    const before = toWorld(cx, cy)
    const scale = Math.min(Math.max(view.scale * factor, MIN_SCALE), MAX_SCALE)
    setView({ scale, tx: cx - before.x * scale, ty: cy - before.y * scale })
  }

  const fitView = useCallback(() => {
    const pts = rooms.flatMap((r) => r.points)
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
    const clamped = Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE)
    setView({
      scale: clamped,
      tx: (size.w - w * clamped) / 2 - minX * clamped,
      ty: (size.h - h * clamped) / 2 - minY * clamped,
    })
  }, [rooms, size])

  useEffect(() => {
    if (rooms.length > 0) fitView()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms.length])

  return { wrapRef, size, view, setView, toScreen, toWorld, gridLines, gridStep, zoomBy, fitView }
}