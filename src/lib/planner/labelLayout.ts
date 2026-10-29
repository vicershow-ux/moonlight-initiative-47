/** Прямоугольник на экране: левый верхний угол и размер */
export interface Box {
  x: number
  y: number
  w: number
  h: number
}

export type Anchor = "start" | "middle" | "end"

export interface LabelSpot {
  /** Точка привязки текста (x — по anchor, y — базовая линия) */
  x: number
  y: number
  anchor: Anchor
  /** Поворот текста, градусы — для подписей вдоль вертикальных линий */
  rotate?: number
}

export interface LabelCandidate {
  spot: LabelSpot
  box: Box
}

/** Примерная ширина подписи в пикселях */
export const textWidth = (text: string, fontSize: number, bold = false) =>
  text.length * fontSize * (bold ? 0.62 : 0.56) + 2

export const boxesHit = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

const spotBox = (x: number, y: number, anchor: Anchor, w: number, h: number): LabelCandidate => {
  const left = anchor === "start" ? x : anchor === "end" ? x - w : x - w / 2
  return { spot: { x, y, anchor }, box: { x: left - 2, y: y - h * 0.8 - 1, w: w + 4, h: h + 2 } }
}

/** Места вокруг значка: справа, слева, сверху, снизу и по диагоналям */
export function aroundPoint(at: { x: number; y: number }, gap: number, w: number, h: number): LabelCandidate[] {
  const base = h * 0.32
  return [
    spotBox(at.x + gap + 3, at.y + base, "start", w, h),
    spotBox(at.x - gap - 3, at.y + base, "end", w, h),
    spotBox(at.x, at.y - gap - 3, "middle", w, h),
    spotBox(at.x, at.y + gap + h * 0.85, "middle", w, h),
    spotBox(at.x + gap, at.y - gap - 1, "start", w, h),
    spotBox(at.x + gap, at.y + gap + h * 0.75, "start", w, h),
    spotBox(at.x - gap, at.y - gap - 1, "end", w, h),
    spotBox(at.x - gap, at.y + gap + h * 0.75, "end", w, h),
  ]
}

/**
 * Места вдоль отрезка: над и под ним в нескольких точках по длине.
 * Вертикальный отрезок — текст повёрнут, рамка тоже вертикальная
 */
export function alongSegment(
  a: { x: number; y: number },
  b: { x: number; y: number },
  w: number,
  h: number,
  off = 5,
): LabelCandidate[] {
  const len = Math.hypot(b.x - a.x, b.y - a.y)
  if (len < w * 0.6) return []
  let angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
  if (angle > 90 || angle < -90) angle += 180
  const vertical = Math.abs(Math.abs(angle) - 90) < 20
  const ux = (b.x - a.x) / len
  const uy = (b.y - a.y) / len
  let nx = uy
  let ny = -ux
  // Нормаль «вверх по тексту», чтобы первый вариант был над линией
  const r = (angle * Math.PI) / 180
  if (nx * Math.sin(r) - ny * Math.cos(r) < 0) {
    nx = -nx
    ny = -ny
  }
  const out: LabelCandidate[] = []
  for (const t of [0.5, 0.3, 0.7]) {
    const mx = a.x + (b.x - a.x) * t
    const my = a.y + (b.y - a.y) * t
    for (const side of [1, -1]) {
      const d = side > 0 ? off : off + h * 0.75
      const x = mx + nx * d * side
      const y = my + ny * d * side
      const cx = mx + nx * (off + h / 2 - 2) * side
      const cy = my + ny * (off + h / 2 - 2) * side
      const box = vertical
        ? { x: cx - h / 2 - 1, y: cy - w / 2 - 2, w: h + 2, h: w + 4 }
        : Math.abs(angle) < 20
          ? { x: cx - w / 2 - 2, y: cy - h / 2 - 1, w: w + 4, h: h + 2 }
          : { x: cx - (w + h) / 2, y: cy - (w + h) / 2, w: w + h, h: w + h }
      out.push({ spot: { x, y, anchor: "middle", rotate: angle }, box })
    }
  }
  return out
}

/**
 * Раскладчик подписей: каждая подпись берёт первое свободное место,
 * не задевая значки и уже поставленные подписи. Нет места — null, подпись прячется
 */
export function createLabelPlacer(obstacles: Box[], bounds?: Box) {
  const taken: Box[] = [...obstacles]
  const inside = (b: Box) =>
    !bounds || (b.x >= bounds.x && b.y >= bounds.y && b.x + b.w <= bounds.x + bounds.w && b.y + b.h <= bounds.y + bounds.h)
  return {
    place(cands: LabelCandidate[]): LabelSpot | null {
      for (const c of cands) {
        if (!inside(c.box) || taken.some((t) => boxesHit(t, c.box))) continue
        taken.push(c.box)
        return c.spot
      }
      return null
    },
    block(b: Box) {
      taken.push(b)
    },
  }
}

/** Квадрат вокруг значка — подписи на него не залезают */
export const iconBox = (x: number, y: number, r: number): Box => ({ x: x - r, y: y - r, w: r * 2, h: r * 2 })

/** Атрибуты SVG-текста по найденному месту */
export const spotAttrs = (s: LabelSpot) => ({
  x: s.x,
  y: s.y,
  textAnchor: s.anchor,
  transform: s.rotate ? `rotate(${s.rotate}, ${s.x}, ${s.y})` : undefined,
})
