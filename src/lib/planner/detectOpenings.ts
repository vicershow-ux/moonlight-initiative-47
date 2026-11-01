import type { OpeningKind, PlanPoint, PlanUnderlay } from "./types"

export interface DetectedOpening {
  kind: OpeningKind
  /** Индекс найденного контура и номер его стены */
  room: number
  edge: number
  offset: number
  width: number
}

const pip = (p: PlanPoint, poly: PlanPoint[]) => {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]
    const b = poly[j]
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside
  }
  return inside
}

/** Отрезки, где условие выполняется подряд, — в долях шага */
function runsOf(flags: boolean[], step: number, min: number, max: number, gapTol = 1) {
  const out: { s: number; e: number }[] = []
  let i = 0
  while (i < flags.length) {
    if (!flags[i]) {
      i++
      continue
    }
    let j = i
    let gap = 0
    let last = i
    while (j < flags.length && gap <= gapTol) {
      if (flags[j]) {
        gap = 0
        last = j
      } else gap++
      j++
    }
    const len = (last - i + 1) * step
    if (len >= min && len <= max) out.push({ s: i * step, e: (last + 1) * step })
    i = last + 1
  }
  return out
}

/**
 * Окна и проёмы по фото плана. Вдоль каждой стены найденной комнаты смотрим полосу за ней:
 * пусто насквозь — дверной проём; на наружной стене полоса светлее сплошной стены, но с
 * тонкими линиями рамы — окно
 */
export function detectOpenings(gray: Float32Array, W: number, H: number, u: PlanUnderlay, rooms: PlanPoint[][]): DetectedOpening[] {
  const pxPerM = W / u.w
  const px = (p: PlanPoint) => ({ x: ((p.x - u.x) / u.w) * W, y: ((p.y - u.y) / u.h) * H })
  const at = (p: PlanPoint) => {
    const q = px(p)
    const x = Math.round(q.x)
    const y = Math.round(q.y)
    return x < 0 || y < 0 || x >= W || y >= H ? 255 : gray[y * W + x]
  }
  const sorted = Float32Array.from(gray).sort()
  const paper = sorted[Math.floor(sorted.length * 0.6)]
  const ink = sorted[Math.floor(sorted.length * 0.02)]
  const darkThr = ink + (paper - ink) * 0.55
  const step = Math.max(0.02, 1 / pxPerM)
  const depth = 0.5
  const out: DetectedOpening[] = []
  const taken: { a: PlanPoint; b: PlanPoint }[] = []

  rooms.forEach((pts, ri) => {
    const n = pts.length
    for (let ei = 0; ei < n; ei++) {
      const a = pts[ei]
      const b = pts[(ei + 1) % n]
      const len = Math.hypot(b.x - a.x, b.y - a.y)
      if (len < 0.5) continue
      const ux = (b.x - a.x) / len
      const uy = (b.y - a.y) / len
      let nx = -uy
      let ny = ux
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      if (pip({ x: mid.x + nx * 0.05, y: mid.y + ny * 0.05 }, pts)) {
        nx = -nx
        ny = -ny
      }
      // Что за стеной: другая комната — стена внутренняя
      const behind = rooms.some((o, k) => k !== ri && pip({ x: mid.x + nx * 0.45, y: mid.y + ny * 0.45 }, o))
      const count = Math.floor(len / step)
      const darkFrac: number[] = []
      const meanG: number[] = []
      // Толщину стены меряем по сплошным местам
      for (let k = 0; k < count; k++) {
        const s = (k + 0.5) * step
        const base = { x: a.x + ux * s, y: a.y + uy * s }
        let d = 0
        let sum = 0
        let cnt = 0
        for (let t = 0.03; t <= depth; t += step) {
          const g = at({ x: base.x + nx * t, y: base.y + ny * t })
          if (g < darkThr) d++
          sum += g
          cnt++
        }
        darkFrac.push(d / cnt)
        meanG.push(sum / cnt)
      }
      const solid = [...darkFrac].sort((x, y) => x - y)[Math.floor(darkFrac.length * 0.7)] || 0
      if (solid < 0.08) continue
      const solidG = [...meanG].sort((x, y) => x - y)[Math.floor(meanG.length * 0.3)] || paper

      const add = (kind: OpeningKind, s: number, e: number) => {
        // У самых углов проём не ставим — там примыкание стен
        if (s < 0.08 || e > len - 0.08) return
        const pa = { x: a.x + ux * s, y: a.y + uy * s }
        const pb = { x: a.x + ux * e, y: a.y + uy * e }
        const pm = { x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2 }
        // Проём в общей стене найдут обе комнаты — оставляем один
        if (taken.some((t) => Math.hypot((t.a.x + t.b.x) / 2 - pm.x, (t.a.y + t.b.y) / 2 - pm.y) < 0.6)) return
        taken.push({ a: pa, b: pb })
        out.push({ kind, room: ri, edge: ei, offset: Math.round(s * 100) / 100, width: Math.round((e - s) * 100) / 100 })
      }

      // Проём: за стеной пусто на ширину двери
      const empty = darkFrac.map((f) => f < Math.min(0.06, solid * 0.25))
      for (const r of runsOf(empty, step, 0.55, 1.9, 2)) add(r.e - r.s > 1.05 ? "arch" : "door", r.s, r.e)

      // Окно: наружная стена, полоса светлее сплошной стены, но рамы видны
      if (!behind) {
        const lighter = meanG.map((g, k) => !empty[k] && g > solidG + (paper - solidG) * 0.35 && darkFrac[k] > 0.04)
        for (const r of runsOf(lighter, step, 0.6, 3, 3)) add("window", r.s, r.e)
      }
    }
  })
  return out
}
