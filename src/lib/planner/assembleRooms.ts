import { pointInPolygon } from "./geometry"
import type { PlanPoint, PlanRoom, PlanScheme, WallProps } from "./types"
import { wallProps } from "./walls"

/** Самая толстая перегородка между найденными комнатами, м */
const MAX_GAP = 0.45
const MIN_OVERLAP = 0.2
/** Тоньше этого перегородку не делаем, м */
const MIN_THICK = 0.08

interface Edge {
  room: number
  i: number
  axis: "x" | "y"
  /** Координата линии стены */
  c: number
  lo: number
  hi: number
  /** +1 — снаружи комнаты бо́льшая координата, −1 — меньшая */
  side: 1 | -1
  fixed: boolean
}

/**
 * Сборка найденных на подложке комнат в один план. Найденный контур идёт по внутренней
 * грани стен, поэтому между соседями остаётся зазор толщиной в перегородку. Все грани,
 * смотрящие друг на друга через такой зазор, сводятся на одну общую ось — стена между
 * комнатами становится одной общей стеной нужной толщины, а не набором отрезков.
 * Уже нарисованные помещения не двигаются: новые прилипают к их стенам
 */
export function assembleRooms(scheme: PlanScheme, added: PlanRoom[]): { scheme: PlanScheme; rooms: PlanRoom[] } {
  const all = [...scheme.rooms, ...added]
  const nFixed = scheme.rooms.length
  const pts = all.map((r) => r.points.map((p) => ({ ...p })))
  const edges: Edge[] = []
  all.forEach((r, ri) => {
    const P = pts[ri]
    const n = P.length
    if (n < 3) return
    for (let i = 0; i < n; i++) {
      const a = P[i]
      const b = P[(i + 1) % n]
      const vert = Math.abs(a.x - b.x) < 1e-4 && Math.abs(a.y - b.y) > 0.05
      const horiz = Math.abs(a.y - b.y) < 1e-4 && Math.abs(a.x - b.x) > 0.05
      if (!vert && !horiz) continue
      const axis = vert ? "x" : "y"
      const c = vert ? a.x : a.y
      const lo = vert ? Math.min(a.y, b.y) : Math.min(a.x, b.x)
      const hi = vert ? Math.max(a.y, b.y) : Math.max(a.x, b.x)
      const mid = (lo + hi) / 2
      const probe = vert ? { x: c + 0.02, y: mid } : { x: mid, y: c + 0.02 }
      const side = pointInPolygon(probe, P) ? -1 : 1
      edges.push({ room: ri, i, axis, c, lo, hi, side, fixed: ri < nFixed })
    }
  })

  const parent = edges.map((_, i) => i)
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])))
  for (let a = 0; a < edges.length; a++)
    for (let b = 0; b < edges.length; b++) {
      const A = edges[a]
      const B = edges[b]
      if (A.room === B.room || A.axis !== B.axis || A.side !== 1 || B.side !== -1) continue
      if (A.fixed && B.fixed) continue
      const gap = B.c - A.c
      if (gap < -0.05 || gap > MAX_GAP) continue
      if (Math.min(A.hi, B.hi) - Math.max(A.lo, B.lo) < MIN_OVERLAP) continue
      parent[find(a)] = find(b)
    }

  const groups = new Map<number, number[]>()
  edges.forEach((_, i) => {
    const r = find(i)
    const g = groups.get(r)
    if (g) g.push(i)
    else groups.set(r, [i])
  })

  const walls: Record<string, WallProps> = { ...(scheme.walls || {}) }
  const mean = (v: number[]) => v.reduce((s, x) => s + x, 0) / v.length
  for (const g of groups.values()) {
    if (g.length < 2) continue
    const list = g.map((i) => edges[i])
    const fixed = list.filter((e) => e.fixed)
    let axis: number
    let props: WallProps
    if (fixed.length) {
      axis = mean(fixed.map((e) => e.c))
      props = wallProps(scheme, `${all[fixed[0].room].id}:${fixed[0].i}`)
    } else {
      const left = list.filter((e) => e.side === 1).map((e) => e.c)
      const right = list.filter((e) => e.side === -1).map((e) => e.c)
      const l = mean(left)
      const r = mean(right)
      axis = (l + r) / 2
      props = { ...wallProps(scheme, ""), thickness: Math.max(MIN_THICK, Math.round((r - l) * 100) / 100) }
    }
    axis = Math.round(axis * 1000) / 1000
    for (const e of list) {
      if (e.fixed) continue
      const P = pts[e.room]
      const j = (e.i + 1) % P.length
      P[e.i] = { ...P[e.i], [e.axis]: axis }
      P[j] = { ...P[j], [e.axis]: axis }
      walls[`${all[e.room].id}:${e.i}`] = { ...props }
    }
  }

  // Почти совпадающие уровни углов разных комнат — в один, чтобы не было ступенек в пару сантиметров
  const free = pts.slice(nFixed)
  const anchors = pts.slice(0, nFixed).flat()
  for (const key of ["x", "y"] as const) {
    const vals = [...anchors.map((p) => ({ v: p[key], fixed: true, p })), ...free.flat().map((p) => ({ v: p[key], fixed: false, p }))]
    vals.sort((a, b) => a.v - b.v)
    let start = 0
    for (let k = 1; k <= vals.length; k++) {
      if (k < vals.length && vals[k].v - vals[k - 1].v < 0.03) continue
      const grp = vals.slice(start, k)
      if (grp.length > 1) {
        const f = grp.filter((x) => x.fixed)
        const m = Math.round(mean((f.length ? f : grp).map((x) => x.v)) * 1000) / 1000
        for (const x of grp) if (!x.fixed) (x.p as PlanPoint)[key] = m
      }
      start = k
    }
  }

  const rooms = added.map((r, k) => ({ ...r, points: pts[nFixed + k] }))
  return { scheme: { ...scheme, walls }, rooms }
}
