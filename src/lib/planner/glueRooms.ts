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
export function glueRoom(scheme: PlanScheme, room: PlanRoom): { scheme: PlanScheme; room: PlanRoom; glued: number; welded: number } {
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

  const welded = weldCorners(pts, others)
  const next = { ...room, points: pts }
  return { scheme: { ...scheme, rooms: others, walls }, room: next, glued, welded }
}

/** Угол ближе этого к углу соседа — сводим в одну точку, м */
const WELD_CORNER = 0.15
/** Угол ближе этого к стене соседа — ставим ровно на стену, м */
const WELD_EDGE = 0.08

/**
 * Сварка углов: угол новой комнаты рядом с углом соседа встаёт точно в него,
 * рядом со стеной соседа — на её линию. Соседние углы двигаются вместе,
 * чтобы ровные стены остались ровными. Меняет pts на месте, возвращает число сваренных углов
 */
export function weldCorners(pts: PlanPoint[], others: { points: PlanPoint[] }[]): number {
  const n = pts.length
  if (n < 3 || !others.length) return 0
  const fixed = new Set<number>()
  let count = 0
  const corners = others.flatMap((r) => r.points)
  const edges = others.flatMap((r) => r.points.map((p, j) => ({ a: p, b: r.points[(j + 1) % r.points.length] })))
  const flat = (i: number, j: number, key: "x" | "y") => Math.abs(pts[i][key] - pts[j][key]) < 1e-4

  const moveTo = (i: number, target: PlanPoint) => {
    const dx = target.x - pts[i].x
    const dy = target.y - pts[i].y
    if (Math.hypot(dx, dy) < 1e-5) {
      fixed.add(i)
      return
    }
    const prev = (i - 1 + n) % n
    const next = (i + 1) % n
    // Ровная стена остаётся ровной: соседний угол сдвигаем по той же оси
    for (const j of [prev, next]) {
      if (fixed.has(j)) continue
      const horiz = flat(i, j, "y")
      const vert = flat(i, j, "x")
      if (horiz && Math.abs(dy) > 1e-5) pts[j] = { ...pts[j], y: pts[j].y + dy }
      if (vert && Math.abs(dx) > 1e-5) pts[j] = { ...pts[j], x: pts[j].x + dx }
    }
    pts[i] = { ...target }
    fixed.add(i)
    count++
  }

  // Сначала углы к углам — ближайшие пары первыми
  const pairs: { i: number; c: PlanPoint; d: number }[] = []
  for (let i = 0; i < n; i++)
    for (const c of corners) {
      const d = Math.hypot(c.x - pts[i].x, c.y - pts[i].y)
      if (d < WELD_CORNER) pairs.push({ i, c, d })
    }
  pairs.sort((a, b) => a.d - b.d)
  const usedCorner = new Set<PlanPoint>()
  for (const pr of pairs) {
    if (fixed.has(pr.i) || usedCorner.has(pr.c)) continue
    // Повторная проверка: точка могла сдвинуться вместе с соседом
    if (Math.hypot(pr.c.x - pts[pr.i].x, pr.c.y - pts[pr.i].y) > WELD_CORNER) continue
    usedCorner.add(pr.c)
    moveTo(pr.i, pr.c)
  }

  // Затем оставшиеся углы — на стены соседей (Т-образные примыкания)
  for (let i = 0; i < n; i++) {
    if (fixed.has(i)) continue
    const p = pts[i]
    let best: { q: PlanPoint; d: number } | null = null
    for (const e of edges) {
      const l2 = (e.b.x - e.a.x) ** 2 + (e.b.y - e.a.y) ** 2
      if (l2 < 1e-6) continue
      const t = ((p.x - e.a.x) * (e.b.x - e.a.x) + (p.y - e.a.y) * (e.b.y - e.a.y)) / l2
      if (t <= 0.001 || t >= 0.999) continue
      const q = { x: e.a.x + (e.b.x - e.a.x) * t, y: e.a.y + (e.b.y - e.a.y) * t }
      const d = Math.hypot(q.x - p.x, q.y - p.y)
      if (d > 1e-5 && d < WELD_EDGE && (!best || d < best.d)) best = { q, d }
    }
    if (best) moveTo(i, { x: Math.round(best.q.x * 10000) / 10000, y: Math.round(best.q.y * 10000) / 10000 })
  }
  return count
}
