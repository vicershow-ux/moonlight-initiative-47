import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { PlanPoint, PlanRoom } from "@/lib/planner/types"

export const GRID_STEP = 0.5
export const SNAP_STEP = 0.1
export const CLOSE_DISTANCE = 0.45

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

  const zoomBy = (factor: number) => {
    const cx = size.w / 2
    const cy = size.h / 2
    const before = toWorld(cx, cy)
    const scale = Math.min(Math.max(view.scale * factor, 8), 200)
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
    const clamped = Math.min(Math.max(scale, 8), 200)
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

  return { wrapRef, size, view, setView, toScreen, toWorld, gridLines, zoomBy, fitView }
}
