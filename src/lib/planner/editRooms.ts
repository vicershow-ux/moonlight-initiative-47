import type { PlanPoint, PlanRoom, PlanScheme, WallProps } from "./types"
import { pointInPolygon, wallSegments } from "./geometry"
import { dropCollinear, traceOutline } from "./detectRooms"

type Seg = { id: string; a: PlanPoint; b: PlanPoint; length: number }

/** Точка p на отрезке seg: расстояние вдоль и поперёк */
function along(seg: Seg, p: PlanPoint) {
  const ux = (seg.b.x - seg.a.x) / (seg.length || 1)
  const uy = (seg.b.y - seg.a.y) / (seg.length || 1)
  const rx = p.x - seg.a.x
  const ry = p.y - seg.a.y
  return { s: rx * ux + ry * uy, d: Math.abs(rx * uy - ry * ux) }
}

/**
 * Помещения поменяли контур: проёмы, толщины стен и привязки точек
 * переносим на новые стены по положению на плане. Проём, у которого стены не стало, убираем
 */
function remap(scheme: PlanScheme, oldRooms: PlanRoom[], newRooms: PlanRoom[]): PlanScheme {
  const oldSegs = new Map(oldRooms.flatMap((r) => wallSegments(r)).map((s) => [s.id, s]))
  const newSegs = newRooms.flatMap((r) => wallSegments(r))
  const oldIds = new Set(oldRooms.map((r) => r.id))
  const isOld = (wallId: string) => oldIds.has(wallId.split(":")[0])
  const place = (wallId: string, s0: number, s1: number) => {
    const seg = oldSegs.get(wallId)
    if (!seg) return null
    const ux = (seg.b.x - seg.a.x) / (seg.length || 1)
    const uy = (seg.b.y - seg.a.y) / (seg.length || 1)
    const p0 = { x: seg.a.x + ux * s0, y: seg.a.y + uy * s0 }
    const p1 = { x: seg.a.x + ux * s1, y: seg.a.y + uy * s1 }
    for (const ns of newSegs) {
      const A = along(ns, p0)
      const B = along(ns, p1)
      if (A.d > 0.03 || B.d > 0.03) continue
      const lo = Math.min(A.s, B.s)
      const hi = Math.max(A.s, B.s)
      if (lo < -0.03 || hi > ns.length + 0.03) continue
      return { wallId: ns.id, offset: Math.max(lo, 0) }
    }
    return null
  }

  const openings = scheme.openings.flatMap((o) => {
    if (!isOld(o.wallId)) return [o]
    const p = place(o.wallId, o.offset, o.offset + o.width)
    return p ? [{ ...o, wallId: p.wallId, offset: p.offset }] : []
  })

  const walls: Record<string, WallProps> = {}
  for (const [id, w] of Object.entries(scheme.walls || {})) if (!isOld(id)) walls[id] = w
  for (const ns of newSegs) {
    const mid = { x: (ns.a.x + ns.b.x) / 2, y: (ns.a.y + ns.b.y) / 2 }
    for (const os of oldSegs.values()) {
      const m = along(os, mid)
      if (m.d < 0.03 && m.s > -0.01 && m.s < os.length + 0.01 && scheme.walls?.[os.id]) {
        walls[ns.id] = scheme.walls[os.id]
        break
      }
    }
  }

  const nodes = (scheme.nodes || []).map((n) => {
    if (!n.mount || !isOld(n.mount.wallId)) return n
    const p = place(n.mount.wallId, n.mount.offset, n.mount.offset)
    return p ? { ...n, mount: { ...n.mount, wallId: p.wallId, offset: p.offset, openingId: undefined, place: "wall" as const } } : { ...n, mount: null }
  })

  const replaced = new Map(newRooms.map((r) => [r.id, r]))
  const rooms = scheme.rooms.filter((r) => !oldIds.has(r.id) || replaced.has(r.id)).map((r) => replaced.get(r.id) || r)
  return { ...scheme, rooms, openings, walls, nodes }
}

/** Объединение двух помещений в одно: перегородка между ними исчезает */
export function mergeRooms(scheme: PlanScheme, keepId: string, otherId: string): PlanScheme | null {
  const A = scheme.rooms.find((r) => r.id === keepId)
  const B = scheme.rooms.find((r) => r.id === otherId)
  if (!A || !B) return null
  const all = [...A.points, ...B.points]
  const step = 0.01
  const minX = Math.min(...all.map((p) => p.x)) - step * 2
  const minY = Math.min(...all.map((p) => p.y)) - step * 2
  const W = Math.ceil((Math.max(...all.map((p) => p.x)) - minX) / step) + 3
  const H = Math.ceil((Math.max(...all.map((p) => p.y)) - minY) / step) + 3
  if (W * H > 6e6) return null
  const mask = new Uint8Array(W * H)
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const p = { x: minX + (x + 0.5) * step, y: minY + (y + 0.5) * step }
      if (pointInPolygon(p, A.points) || pointInPolygon(p, B.points)) mask[y * W + x] = 1
    }
  const outline = traceOutline(mask, W, H)
  if (outline.length < 3) return null
  // Углы контура — обратно на точные углы исходных помещений
  const pts = dropCollinear(
    outline.map((q) => {
      const p = { x: minX + q.x * step, y: minY + q.y * step }
      let best = p
      let bd = step * 1.6
      for (const o of all) {
        const d = Math.hypot(o.x - p.x, o.y - p.y)
        if (d < bd) {
          bd = d
          best = o
        }
      }
      return { ...best }
    }),
    0.004,
  )
  const merged: PlanRoom = { ...A, points: pts, fixedWalls: [] }
  const next = remap(scheme, [A, B], [merged])
  const finishes = { ...(next.finishes || {}) }
  delete finishes[B.id]
  const renders = { ...(next.renders || {}) }
  delete renders[B.id]
  return {
    ...next,
    finishes,
    renders,
    nodes: (next.nodes || []).map((n) => (n.roomId === B.id ? { ...n, roomId: A.id } : n)),
    furniture: (next.furniture || []).map((f) => (f.roomId === B.id ? { ...f, roomId: A.id } : f)),
  }
}

const lineHit = (a: PlanPoint, b: PlanPoint, c: PlanPoint, d: PlanPoint): PlanPoint | null => {
  const r = { x: b.x - a.x, y: b.y - a.y }
  const s = { x: d.x - c.x, y: d.y - c.y }
  const den = r.x * s.y - r.y * s.x
  if (Math.abs(den) < 1e-9) return null
  const t = ((c.x - a.x) * s.y - (c.y - a.y) * s.x) / den
  return { x: a.x + r.x * t, y: a.y + r.y * t }
}

/**
 * Убрать одну стену помещения: соседние стены продлеваются до пересечения.
 * Если соседи параллельны (стена прямоугольника) — продлить нечем, возвращаем null
 */
export function removeRoomWall(scheme: PlanScheme, wallId: string): PlanScheme | null {
  const [roomId, idxStr] = wallId.split(":")
  const room = scheme.rooms.find((r) => r.id === roomId)
  const i = Number(idxStr)
  if (!room || room.points.length <= 3) return null
  const n = room.points.length
  const pts = room.points
  const prevA = pts[(i - 1 + n) % n]
  const a = pts[i]
  const b = pts[(i + 1) % n]
  const nextB = pts[(i + 2) % n]
  const hit = lineHit(prevA, a, b, nextB)
  if (!hit) {
    // Ступенька: соседние стены параллельны — короткую из них переносим на линию длинной
    if (n <= 4) return null
    const prevLen = Math.hypot(a.x - prevA.x, a.y - prevA.y)
    const nextLen = Math.hypot(nextB.x - b.x, nextB.y - b.y)
    const out: PlanPoint[] = []
    for (let k = 2; k < n; k++) out.push({ ...pts[(i + k) % n] })
    // out[0] — nextB, out[last] — prevA
    if (nextLen <= prevLen) out[0] = { x: nextB.x + a.x - b.x, y: nextB.y + a.y - b.y }
    else out[out.length - 1] = { x: prevA.x + b.x - a.x, y: prevA.y + b.y - a.y }
    const clean = dropCollinear(out, 0.004)
    if (clean.length < 3) return null
    return remap(scheme, [room], [{ ...room, points: clean, fixedWalls: [] }])
  }
  // Пересечение должно быть рядом, иначе комната вытянется в бесконечность
  const span = Math.max(...pts.map((p) => Math.hypot(p.x - a.x, p.y - a.y)))
  if (Math.hypot(hit.x - a.x, hit.y - a.y) > span * 1.5) return null
  // Обходим контур с вершины после стены и в конце ставим новый угол
  const ordered: PlanPoint[] = []
  for (let k = 2; k < n; k++) ordered.push(pts[(i + k) % n])
  ordered.push(hit)
  return remap(scheme, [room], [{ ...room, points: ordered, fixedWalls: [] }])
}

/** Соседнее помещение по ту сторону стены (если стена общая) */
export function roomBehindWall(scheme: PlanScheme, wallId: string): PlanRoom | null {
  const [roomId, idxStr] = wallId.split(":")
  const room = scheme.rooms.find((r) => r.id === roomId)
  if (!room) return null
  const seg = wallSegments(room)[Number(idxStr)]
  if (!seg || seg.length < 1e-6) return null
  const ux = (seg.b.x - seg.a.x) / seg.length
  const uy = (seg.b.y - seg.a.y) / seg.length
  for (const t of [0.5, 0.3, 0.7]) {
    const m = { x: seg.a.x + (seg.b.x - seg.a.x) * t, y: seg.a.y + (seg.b.y - seg.a.y) * t }
    for (const k of [1, -1]) {
      const p = { x: m.x - uy * 0.05 * k, y: m.y + ux * 0.05 * k }
      if (pointInPolygon(p, room.points)) continue
      const other = scheme.rooms.find((r) => r.id !== room.id && pointInPolygon(p, r.points))
      if (other) return other
    }
  }
  return null
}