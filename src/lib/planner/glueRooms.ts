import type { PlanPoint, PlanRoom, PlanScheme, WallProps } from "./types"
import { wallProps } from "./walls"

/** Самая толстая стена, которую считаем общей перегородкой при обводке по подложке, м */
const MAX_GAP = 0.45
const MIN_OVERLAP = 0.2

const centroid = (pts: PlanPoint[]) => ({
  x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
  y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
})

/**
 * Прилипание нового помещения к уже нарисованным: если стена новой комнаты идёт
 * параллельно стене соседней на расстоянии толщины перегородки — это одна общая стена.
 * Контуры обеих комнат сводятся на её ось, толщина берётся из зазора на подложке
 */
export function glueRoom(scheme: PlanScheme, room: PlanRoom): { scheme: PlanScheme; room: PlanRoom; glued: number } {
  const pts = room.points.map((p) => ({ ...p }))
  const n = pts.length
  const others = scheme.rooms.map((r) => ({ ...r, points: r.points.map((p) => ({ ...p })) }))
  const walls: Record<string, WallProps> = { ...(scheme.walls || {}) }
  let glued = 0
  const cNew = centroid(pts)

  for (let i = 0; i < n; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % n]
    const len = Math.hypot(b.x - a.x, b.y - a.y)
    if (len < 0.1) continue
    const ux = (b.x - a.x) / len
    const uy = (b.y - a.y) / len

    let best: { r: number; j: number; d: number; nx: number; ny: number; overlap: number; elen: number } | null = null
    for (let r = 0; r < others.length; r++) {
      const op = others[r].points
      if (op.length < 3) continue
      const cOld = centroid(op)
      for (let j = 0; j < op.length; j++) {
        const p = op[j]
        const q = op[(j + 1) % op.length]
        const elen = Math.hypot(q.x - p.x, q.y - p.y)
        if (elen < 0.1) continue
        const ex = (q.x - p.x) / elen
        const ey = (q.y - p.y) / elen
        if (Math.abs(ux * ey - uy * ex) > 0.03) continue
        // Наружная нормаль стены соседа
        let nx = -ey
        let ny = ex
        if ((cOld.x - p.x) * nx + (cOld.y - p.y) * ny > 0) {
          nx = -nx
          ny = -ny
        }
        // Центр новой комнаты должен быть по другую сторону стены
        if ((cNew.x - p.x) * nx + (cNew.y - p.y) * ny <= 0.1) continue
        const d = (a.x - p.x) * nx + (a.y - p.y) * ny
        const d2 = (b.x - p.x) * nx + (b.y - p.y) * ny
        if (Math.abs(d - d2) > 0.03 || d < -MAX_GAP || d > MAX_GAP) continue
        const t1 = (a.x - p.x) * ex + (a.y - p.y) * ey
        const t2 = (b.x - p.x) * ex + (b.y - p.y) * ey
        const overlap = Math.min(Math.max(t1, t2), elen) - Math.max(Math.min(t1, t2), 0)
        if (overlap < MIN_OVERLAP) continue
        if (!best || Math.abs(d) < Math.abs(best.d)) best = { r, j, d: (d + d2) / 2, nx, ny, overlap, elen }
      }
    }
    if (!best) continue
    glued++
    const gap = best.d
    if (Math.abs(gap) < 0.005) continue
    const op = others[best.r].points
    const jb = (best.j + 1) % op.length
    // Стена соседа целиком за перегородкой — сводим обе комнаты на ось; иначе двигаем только новую
    const both = gap > 0.03 && best.overlap >= best.elen * 0.8
    // Зашли на соседа — просто возвращаем стену на его линию
    const newShift = both ? gap / 2 : gap
    for (const k of [i, (i + 1) % n]) {
      pts[k] = { x: pts[k].x - best.nx * newShift, y: pts[k].y - best.ny * newShift }
    }
    if (both) {
      for (const k of [best.j, jb]) op[k] = { x: op[k].x + best.nx * (gap / 2), y: op[k].y + best.ny * (gap / 2) }
      const t = Math.round(gap * 100) / 100
      const wid = `${others[best.r].id}:${best.j}`
      walls[wid] = { ...wallProps(scheme, wid), thickness: t }
      walls[`${room.id}:${i}`] = { ...wallProps(scheme, wid), thickness: t }
    } else {
      walls[`${room.id}:${i}`] = { ...wallProps(scheme, `${others[best.r].id}:${best.j}`) }
    }
  }

  const next = { ...room, points: pts }
  return { scheme: { ...scheme, rooms: others, walls }, room: next, glued }
}
