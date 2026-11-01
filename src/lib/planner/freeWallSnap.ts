import type { PlanPoint, PlanScheme } from "./types"

export type FreeSnapKind = "corner" | "edge" | "end" | "axis" | null

/** Отрезки, к которым прилипает конец стены: контуры помещений и другие отдельные стены */
function segments(scheme: PlanScheme, excludeId?: string) {
  const out: { a: PlanPoint; b: PlanPoint; free: boolean }[] = []
  for (const r of scheme.rooms) {
    const n = r.points.length
    for (let i = 0; i < n; i++) out.push({ a: r.points[i], b: r.points[(i + 1) % n], free: false })
  }
  for (const w of scheme.freeWalls || []) if (w.id !== excludeId) out.push({ a: w.a, b: w.b, free: true })
  return out
}

const project = (p: PlanPoint, a: PlanPoint, b: PlanPoint) => {
  const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2
  if (l2 < 1e-9) return { q: a, d: Math.hypot(p.x - a.x, p.y - a.y) }
  const t = Math.min(Math.max(((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2, 0), 1)
  const q = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
  return { q, d: Math.hypot(p.x - q.x, p.y - q.y) }
}

/**
 * Конец отдельной стены при перетаскивании: рядом с углом помещения или концом другой
 * стены — точно в эту точку; рядом со стеной — на её линию. Иначе — с шагом сетки и
 * выпрямлением по горизонтали/вертикали относительно другого конца
 */
export function snapFreeEnd(
  scheme: PlanScheme,
  raw: PlanPoint,
  other: PlanPoint,
  scale: number,
  excludeId?: string,
  free = false,
): { point: PlanPoint; kind: FreeSnapKind } {
  if (free) return { point: raw, kind: null }
  const cornerTol = 14 / scale
  const edgeTol = 10 / scale

  let best: { p: PlanPoint; d: number; kind: FreeSnapKind } | null = null
  for (const r of scheme.rooms)
    for (const p of r.points) {
      const d = Math.hypot(p.x - raw.x, p.y - raw.y)
      if (d < cornerTol && (!best || d < best.d)) best = { p, d, kind: "corner" }
    }
  for (const w of scheme.freeWalls || []) {
    if (w.id === excludeId) continue
    for (const p of [w.a, w.b]) {
      const d = Math.hypot(p.x - raw.x, p.y - raw.y)
      if (d < cornerTol && (!best || d < best.d)) best = { p, d, kind: "end" }
    }
  }
  if (best) return { point: { ...best.p }, kind: best.kind }

  // На линию стены; если идём почти перпендикулярно — сохраняем прямой угол к другому концу
  let edge: { q: PlanPoint; d: number; a: PlanPoint; b: PlanPoint; free: boolean } | null = null
  for (const s of segments(scheme, excludeId)) {
    const { q, d } = project(raw, s.a, s.b)
    if (d < edgeTol && (!edge || d < edge.d)) edge = { q, d, a: s.a, b: s.b, free: s.free }
  }
  if (edge) {
    const len = Math.hypot(edge.b.x - edge.a.x, edge.b.y - edge.a.y) || 1
    const ux = (edge.b.x - edge.a.x) / len
    const uy = (edge.b.y - edge.a.y) / len
    // Точка на линии стены, где наша стена встаёт под 90°
    const t = (other.x - edge.a.x) * ux + (other.y - edge.a.y) * uy
    const perp = { x: edge.a.x + ux * t, y: edge.a.y + uy * t }
    const inSeg = t >= 0 && t <= len
    const point = inSeg && Math.hypot(perp.x - edge.q.x, perp.y - edge.q.y) < cornerTol ? perp : edge.q
    return { point: { x: round(point.x), y: round(point.y) }, kind: edge.free ? "axis" : "edge" }
  }

  // Свободно: шаг 1 см и выпрямление, если почти горизонтально или вертикально (до 4°)
  let p = { x: round(raw.x, 100), y: round(raw.y, 100) }
  const dx = p.x - other.x
  const dy = p.y - other.y
  const ang = Math.abs(Math.atan2(dy, dx) * (180 / Math.PI))
  if (Math.min(ang, 180 - ang) < 4) p = { x: p.x, y: other.y }
  else if (Math.abs(90 - ang) < 4) p = { x: other.x, y: p.y }
  return { point: p, kind: null }
}

const round = (v: number, k = 1000) => Math.round(v * k) / k

/** Куда сейчас прилип конец — для подсветки ручки */
export function endSnapKind(scheme: PlanScheme, p: PlanPoint, excludeId: string): FreeSnapKind {
  const tol = 0.005
  if (scheme.rooms.some((r) => r.points.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < tol))) return "corner"
  if ((scheme.freeWalls || []).some((w) => w.id !== excludeId && [w.a, w.b].some((q) => Math.hypot(q.x - p.x, q.y - p.y) < tol))) return "end"
  for (const s of segments(scheme, excludeId)) if (project(p, s.a, s.b).d < tol) return s.free ? "axis" : "edge"
  return null
}
