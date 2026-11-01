import type { PlanPoint } from "./types"

export interface NamedContour {
  points: PlanPoint[]
  name: string
  room_type: string
  /** Номер и площадь, прочитанные с плана */
  planNo?: string
  planArea?: number
  /** Найденные на стенах контура окна и проёмы: номер стены, отступ и ширина, м */
  openings?: { kind: "window" | "door" | "arch"; edge: number; offset: number; width: number }[]
}

/** Название для выбранного типа: с номером, если такой тип уже есть */
export function nameForType(type: string, taken: string[]): string {
  const base = type || "Помещение"
  const n = taken.filter((t) => t.replace(/\s\d+$/, "") === base).length + 1
  return n > 1 ? `${base} ${n}` : base
}

const area = (pts: PlanPoint[]) =>
  Math.abs(pts.reduce((s, p, k) => s + p.x * pts[(k + 1) % pts.length].y - pts[(k + 1) % pts.length].x * p.y, 0)) / 2

/** Ширина и длина описанного прямоугольника и насколько контур его заполняет */
function shape(pts: PlanPoint[]) {
  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  const w = Math.max(...xs) - Math.min(...xs)
  const h = Math.max(...ys) - Math.min(...ys)
  const a = area(pts)
  return { a, short: Math.min(w, h), long: Math.max(w, h), fill: a / (w * h || 1) }
}

/**
 * Названия по площади и форме, как обычно бывает в квартире:
 * узкое длинное или изломанное — коридор, самое большое жилое — гостиная,
 * меньшее из жилых — кухня, остальные жилые — спальни, крупное мелкое — ванная, совсем мелкое — санузел
 */
export function guessRoomNames(list: PlanPoint[][], taken: string[] = []): NamedContour[] {
  const info = list.map((pts, i) => ({ i, pts, ...shape(pts) }))
  const type: string[] = list.map(() => "")
  for (const r of info) {
    const narrow = r.short < 1.6 && r.long / (r.short || 1) > 2.2
    if (r.a >= 3 && (narrow || r.fill < 0.7)) type[r.i] = "Коридор"
    else if (r.a < 1.3 && r.short < 0.9) type[r.i] = "Кладовая"
  }
  const living = info.filter((r) => !type[r.i] && r.a >= 6).sort((a, b) => b.a - a.a)
  if (living.length >= 2) {
    type[living[0].i] = "Гостиная"
    type[living[living.length - 1].i] = "Кухня"
    living.slice(1, -1).forEach((r) => (type[r.i] = "Спальня"))
  } else if (living.length === 1) type[living[0].i] = "Гостиная"
  const small = info.filter((r) => !type[r.i]).sort((a, b) => b.a - a.a)
  small.forEach((r, k) => {
    if (r.a >= 4.5) type[r.i] = "Прихожая"
    else if (k === 0 && r.a >= 2) type[r.i] = "Ванная"
    else type[r.i] = "Санузел"
  })

  const used = new Map<string, number>()
  for (const t of taken) {
    const base = t.replace(/\s\d+$/, "")
    used.set(base, (used.get(base) || 0) + 1)
  }
  return list.map((pts, i) => {
    const t = type[i] || "Помещение"
    const n = (used.get(t) || 0) + 1
    used.set(t, n)
    return { points: pts, name: n > 1 ? `${t} ${n}` : t, room_type: t === "Гостиная" || t === "Помещение" ? (t === "Гостиная" ? "Гостиная" : "") : t }
  })
}
