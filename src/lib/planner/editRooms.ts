import type { PlanPoint, PlanRoom, PlanScheme, WallProps } from "./types"
import { pointInPolygon, wallSegments } from "./geometry"
import { dropCollinear, traceOutline } from "./detectRooms"
import { glueRoom } from "./glueRooms"

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
export function mergeRooms(scheme0: PlanScheme, keepId: string, otherId: string): PlanScheme | null {
  // Между комнатами зазор толщиной стены — сначала сводим их на общую линию
  let scheme = scheme0
  {
    const b0 = scheme0.rooms.find((r) => r.id === otherId)
    const a0 = scheme0.rooms.find((r) => r.id === keepId)
    if (a0 && b0) {
      const g = glueRoom({ ...scheme0, rooms: [a0] }, b0)
      if (g.glued) scheme = { ...scheme0, rooms: scheme0.rooms.map((r) => (r.id === keepId ? g.scheme.rooms[0] : r.id === otherId ? g.room : r)) }
    }
  }
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
    // Соседа ищем и через толщину стены: распознанные комнаты стоят с зазором до 45 см
    for (const off of [0.05, 0.15, 0.3, 0.45])
      for (const k of [1, -1]) {
        const p = { x: m.x - uy * off * k, y: m.y + ux * off * k }
        const inSelf = { x: m.x - uy * 0.05 * k, y: m.y + ux * 0.05 * k }
        if (pointInPolygon(inSelf, room.points)) continue
        const other = scheme.rooms.find((r) => r.id !== room.id && pointInPolygon(p, r.points))
        if (other) return other
      }
  }
  return null
}
/** Ближайшая точка на стене любого помещения: помещение, стена, точка */
export function pointOnRoomEdge(scheme: PlanScheme, p: PlanPoint, tol: number): { roomId: string; edge: number; point: PlanPoint } | null {
  let best: { roomId: string; edge: number; point: PlanPoint; d: number } | null = null
  for (const r of scheme.rooms) {
    const n = r.points.length
    for (let i = 0; i < n; i++) {
      const a = r.points[i]
      const b = r.points[(i + 1) % n]
      const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2
      if (l2 < 1e-9) continue
      const t = Math.min(Math.max(((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2, 0), 1)
      const q = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
      const d = Math.hypot(q.x - p.x, q.y - p.y)
      if (d < tol && (!best || d < best.d)) best = { roomId: r.id, edge: i, point: q, d }
    }
  }
  return best ? { roomId: best.roomId, edge: best.edge, point: best.point } : null
}

/**
 * Разрезать помещение перегородкой: линия от стены до стены (с изломами внутри).
 * Получаются два помещения с общей стеной-перегородкой
 */
export function splitRoom(
  scheme: PlanScheme,
  roomId: string,
  cut: PlanPoint[],
  newId: string,
  partition: WallProps = { material: "brick", thickness: 0.12 },
): PlanScheme | null {
  const room = scheme.rooms.find((r) => r.id === roomId)
  if (!room || cut.length < 2) return null
  const tol = 0.02
  const s = pointOnRoomEdge({ ...scheme, rooms: [room] }, cut[0], tol)
  const e = pointOnRoomEdge({ ...scheme, rooms: [room] }, cut[cut.length - 1], tol)
  if (!s || !e) return null
  const inner = cut.slice(1, -1)
  if (inner.some((p) => !pointInPolygon(p, room.points))) return null
  const P = room.points
  const n = P.length
  let i = s.edge
  let j = e.edge
  let sp = s.point
  let ep = e.point
  let mid = inner
  // Обе точки на одной стене — разрез отсекает кусок только с изломами, порядок по ходу стены
  if (i === j) {
    if (!inner.length) return null
    const a = P[i]
    const da = Math.hypot(sp.x - a.x, sp.y - a.y)
    const db = Math.hypot(ep.x - a.x, ep.y - a.y)
    if (Math.abs(da - db) < 0.05) return null
    if (da > db) {
      ;[sp, ep] = [ep, sp]
      mid = [...inner].reverse()
    }
    const cutPoly = [sp, ...mid, ep]
    const rest: PlanPoint[] = [ep]
    for (let k = 1; k <= n; k++) rest.push(P[(i + k) % n])
    rest.push(sp, ...[...mid].reverse())
    return finishSplit(scheme, room, rest, cutPoly, newId, partition)
  }
  const A: PlanPoint[] = [sp]
  for (let k = (i + 1) % n; ; k = (k + 1) % n) {
    A.push(P[k])
    if (k === j) break
  }
  A.push(ep, ...[...mid].reverse())
  const B: PlanPoint[] = [ep]
  for (let k = (j + 1) % n; ; k = (k + 1) % n) {
    B.push(P[k])
    if (k === i) break
  }
  B.push(sp, ...mid)
  return finishSplit(scheme, room, A, B, newId, partition)
}

function finishSplit(scheme: PlanScheme, room: PlanRoom, A: PlanPoint[], B: PlanPoint[], newId: string, partition: WallProps): PlanScheme | null {
  const clean = (pts: PlanPoint[]) => dropCollinear(pts.filter((p, k) => Math.hypot(p.x - pts[(k + 1) % pts.length].x, p.y - pts[(k + 1) % pts.length].y) > 0.005), 0.004)
  const a = clean(A)
  const b = clean(B)
  if (a.length < 3 || b.length < 3) return null
  const area = (pts: PlanPoint[]) => Math.abs(pts.reduce((s, p, k) => s + p.x * pts[(k + 1) % pts.length].y - pts[(k + 1) % pts.length].x * p.y, 0)) / 2
  if (area(a) < 0.2 || area(b) < 0.2) return null
  // Большая часть остаётся прежним помещением (с отделкой и названием), меньшая — новое
  const [big, small] = area(a) >= area(b) ? [a, b] : [b, a]
  const keep: PlanRoom = { ...room, points: big, fixedWalls: [] }
  const add: PlanRoom = { ...room, id: newId, name: `${room.name} (часть)`, points: small, fixedWalls: [] }
  const next = remap(scheme, [room], [keep, add])
  const rooms = [...next.rooms]
  if (!rooms.some((r) => r.id === newId)) rooms.push(add)
  // Стены, которых не было в старом контуре, — перегородка
  const oldSegs = wallSegments(room)
  const onOld = (p: PlanPoint, q: PlanPoint) =>
    oldSegs.some((sg) => {
      const m = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 }
      const r = along(sg, m)
      return r.d < 0.01 && r.s > -0.01 && r.s < sg.length + 0.01
    })
  const walls = { ...(next.walls || {}) }
  for (const r of [keep, add])
    r.points.forEach((p, k) => {
      const q = r.points[(k + 1) % r.points.length]
      if (!onOld(p, q)) walls[`${r.id}:${k}`] = partition
    })
  const finishes = { ...(next.finishes || {}) }
  if (finishes[room.id]) finishes[newId] = finishes[room.id]
  return {
    ...next,
    rooms,
    walls,
    finishes,
    nodes: (next.nodes || []).map((nd) => (nd.roomId === room.id && pointInPolygon(nd, small) ? { ...nd, roomId: newId } : nd)),
    furniture: (next.furniture || []).map((f) => (f.roomId === room.id && pointInPolygon(f, small) ? { ...f, roomId: newId } : f)),
  }
}
