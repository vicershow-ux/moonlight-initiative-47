import { distToSegment, pointInPolygon, roomDimensions } from "./geometry"
import { NodeKind, PlanPoint, PlanRoom } from "./types"

export type V = [number, number]

/** Простейшие элементы значка: ломаная или окружность */
export type SymbolPrim =
  | { kind: "poly"; pts: V[]; closed?: boolean; fill?: boolean }
  | { kind: "circle"; c: V; r: number; fill?: boolean }

const arc = (cx: number, cy: number, r: number, a0: number, a1: number, n = 14): V[] => {
  const pts: V[] = []
  for (let i = 0; i <= n; i++) {
    const t = a0 + ((a1 - a0) * i) / n
    pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)])
  }
  return pts
}

/**
 * Выключатель: кружок, наклонная черта и штрихи на конце.
 * Число штрихов — число клавиш
 */
const switchSymbol = (ticks: number, pass = false): SymbolPrim[] => {
  const c: V = [0, 0.55]
  const r = 0.4
  const d: V = [Math.SQRT1_2, Math.SQRT1_2]
  const p: V = [d[1], -d[0]]
  const at = (k: number): V => [c[0] + d[0] * k, c[1] + d[1] * k]
  const prims: SymbolPrim[] = [
    { kind: "circle", c, r },
    { kind: "poly", pts: [at(r), at(1.75)] },
  ]
  for (let i = 0; i < ticks; i++) {
    const q = at(1.75 - i * 0.35)
    prims.push({ kind: "poly", pts: [q, [q[0] + p[0] * 0.5, q[1] + p[1] * 0.5]] })
  }
  // Проходной: черта продолжается через кружок в обратную сторону со своими штрихами —
  // так на схемах показывают переключатель на две линии
  if (pass) {
    prims.push({ kind: "poly", pts: [at(-r), at(-1.75)] })
    for (let i = 0; i < ticks; i++) {
      const q = at(-1.75 + i * 0.35)
      prims.push({ kind: "poly", pts: [q, [q[0] - p[0] * 0.5, q[1] - p[1] * 0.5]] })
    }
  }
  return prims
}

const rect = (x0: number, y0: number, x1: number, y1: number, fill = false): SymbolPrim => ({
  kind: "poly",
  pts: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]],
  closed: true,
  fill,
})

/**
 * Значки нарисованы в своей системе координат: стена — линия y = 0,
 * помещение — в сторону +y. При выводе значок поворачивается к стене
 */
const SYMBOLS: Partial<Record<NodeKind, SymbolPrim[]>> = {
  // Розетка с заземляющим контактом: полукруг и черта по касательной
  socket: [
    { kind: "poly", pts: arc(0, 0, 1, 0, Math.PI), closed: true },
    { kind: "poly", pts: [[-0.75, 1], [0.75, 1]] },
  ],
  // Силовая розетка: залитый полукруг с тремя чертами — трёхполюсная
  socket_power: [
    { kind: "poly", pts: arc(0, 0, 1, 0, Math.PI), closed: true, fill: true },
    ...[60, 90, 120].map((deg): SymbolPrim => {
      const t = (deg * Math.PI) / 180
      return {
        kind: "poly",
        pts: [
          [Math.cos(t), Math.sin(t)],
          [Math.cos(t) * 1.6, Math.sin(t) * 1.6],
        ],
      }
    }),
  ],
  switch: switchSymbol(1),
  switch_double: switchSymbol(2),
  switch_pass: switchSymbol(1, true),
  switch_pass_double: switchSymbol(2, true),
  // Щит: прямоугольник у стены, наполовину залитый по диагонали
  panel: [
    { kind: "poly", pts: [[-1.3, 0], [1.3, 0], [1.3, 1.1], [-1.3, 1.1]], closed: true },
    { kind: "poly", pts: [[-1.3, 1.1], [1.3, 1.1], [1.3, 0]], closed: true, fill: true },
  ],
  // Распаячная коробка: квадрат с точкой
  junction: [
    { kind: "poly", pts: [[-0.6, -0.6], [0.6, -0.6], [0.6, 0.6], [-0.6, 0.6]], closed: true },
    { kind: "circle", c: [0, 0], r: 0.16, fill: true },
  ],
  // Светильник: круг с косым крестом
  light: [
    { kind: "circle", c: [0, 0], r: 1 },
    { kind: "poly", pts: [[-0.71, -0.71], [0.71, 0.71]] },
    { kind: "poly", pts: [[-0.71, 0.71], [0.71, -0.71]] },
  ],
  // Точечный светильник: малый круг с залитым центром
  spot: [
    { kind: "circle", c: [0, 0], r: 0.65 },
    { kind: "circle", c: [0, 0], r: 0.26, fill: true },
  ],

  // ——— Сантехника ———
  // Ввод воды: круг со стрелкой внутрь помещения
  water_in: [
    { kind: "circle", c: [0, 0.9], r: 0.8 },
    { kind: "poly", pts: [[0, 0.3], [0, 1.4]] },
    { kind: "poly", pts: [[-0.35, 1.05], [0, 1.4], [0.35, 1.05]] },
  ],
  // Выводы воды: залитый круг — горячая, пустой — холодная; у стены черта отвода
  water_hot: [
    { kind: "poly", pts: [[0, 0], [0, 0.45]] },
    { kind: "circle", c: [0, 0.85], r: 0.4, fill: true },
  ],
  water_cold: [
    { kind: "poly", pts: [[0, 0], [0, 0.45]] },
    { kind: "circle", c: [0, 0.85], r: 0.4 },
  ],
  // Канализационный выпуск: круг с крестом-трапом
  sewer: [
    { kind: "circle", c: [0, 0.9], r: 0.75 },
    { kind: "poly", pts: [[-0.75, 0.9], [0.75, 0.9]] },
    { kind: "poly", pts: [[0, 0.15], [0, 1.65]] },
  ],
  // Смеситель: точка подключения и излив
  mixer: [
    rect(-0.6, 0, 0.6, 0.35),
    { kind: "poly", pts: [[0, 0.35], [0, 0.95], [0.55, 0.95]] },
    { kind: "circle", c: [0, 0.35], r: 0.14, fill: true },
  ],
  // Унитаз в плане: бачок у стены и чаша
  toilet: [
    rect(-0.7, 0, 0.7, 0.45),
    { kind: "poly", pts: [[-0.5, 0.45], [0.5, 0.45], ...arc(0, 0.95, 0.55, 0, Math.PI, 14)], closed: true },
    { kind: "poly", pts: [[-0.45, 0.45], [-0.55, 0.85]] },
    { kind: "poly", pts: [[0.45, 0.45], [0.55, 0.85]] },
  ],
  // Раковина: прямоугольник с полукруглой чашей и сливом
  sink: [
    rect(-0.9, 0, 0.9, 1.1),
    { kind: "poly", pts: [[-0.6, 0.2], ...arc(0, 0.2, 0.6, Math.PI, 0, 12), [0.6, 0.2]] },
    { kind: "circle", c: [0, 0.55], r: 0.1, fill: true },
  ],
  // Водонагреватель: круг с залитой половиной
  boiler: [
    { kind: "circle", c: [0, 0.95], r: 0.85 },
    { kind: "poly", pts: arc(0, 0.95, 0.85, 0, Math.PI, 12), closed: true, fill: true },
  ],
  // Радиатор: вытянутый прямоугольник с секциями
  radiator: [
    rect(-1.3, 0.1, 1.3, 0.6),
    ...[-0.65, 0, 0.65].map((x): SymbolPrim => ({ kind: "poly", pts: [[x, 0.1], [x, 0.6]] })),
  ],
}

/** Что ставится на стену и должно смотреть в помещение */
export const WALL_MOUNTED = new Set<NodeKind>([
  "socket",
  "socket_power",
  "switch",
  "switch_double",
  "switch_pass",
  "switch_pass_double",
  "panel",
  "water_in",
  "water_hot",
  "water_cold",
  "sewer",
  "mixer",
  "toilet",
  "sink",
  "boiler",
  "radiator",
])

export const gostSymbol = (kind: NodeKind): SymbolPrim[] | null => SYMBOLS[kind] ?? null

/**
 * Направление от ближайшей стены внутрь помещения.
 * Сначала смотрим стены комнаты, в которой стоит точка, — иначе у общей
 * перегородки значок мог бы развернуться в соседнюю комнату
 */
export function wallDirection(
  p: PlanPoint,
  rooms: PlanRoom[],
  maxDist = 0.6,
): { x: number; y: number } | null {
  const inside = rooms.filter((r) => pointInPolygon(p, r.points))
  const pool = inside.length > 0 ? inside : rooms
  let best: { d: number; x: number; y: number } | null = null
  for (const room of pool) {
    for (const dim of roomDimensions(room)) {
      const d = distToSegment(p, dim.a, dim.b)
      if (d < maxDist && (!best || d < best.d)) best = { d, x: -dim.nx, y: -dim.ny }
    }
  }
  return best ? { x: best.x, y: best.y } : null
}

/** Переносит значок в точку на экране, масштабирует и поворачивает к стене */
export function placeSymbol(
  prims: SymbolPrim[],
  c: { x: number; y: number },
  size: number,
  dir?: { x: number; y: number } | null,
): SymbolPrim[] {
  const ey = dir ?? { x: 0, y: 1 }
  const ex = { x: ey.y, y: -ey.x }
  const tf = ([lx, ly]: V): V => [
    c.x + size * (lx * ex.x + ly * ey.x),
    c.y + size * (lx * ex.y + ly * ey.y),
  ]
  return prims.map((p) =>
    p.kind === "poly" ? { ...p, pts: p.pts.map(tf) } : { ...p, c: tf(p.c), r: p.r * size },
  )
}

/** Значок, вписанный по центру в рамку w × h, — для кнопок и условных обозначений */
export function symbolIcon(kind: NodeKind, w: number, h: number, size: number): SymbolPrim[] | null {
  const prims = gostSymbol(kind)
  if (!prims) return null
  const placed = placeSymbol(prims, { x: 0, y: 0 }, size)

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of placed) {
    const pts: V[] =
      p.kind === "poly"
        ? p.pts
        : [
            [p.c[0] - p.r, p.c[1] - p.r],
            [p.c[0] + p.r, p.c[1] + p.r],
          ]
    for (const [x, y] of pts) {
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }
  const dx = w / 2 - (minX + maxX) / 2
  const dy = h / 2 - (minY + maxY) / 2
  return placed.map((p) =>
    p.kind === "poly"
      ? { ...p, pts: p.pts.map(([x, y]): V => [x + dx, y + dy]) }
      : { ...p, c: [p.c[0] + dx, p.c[1] + dy] },
  )
}

const f = (n: number) => n.toFixed(2)

/** Значок в виде SVG-строки — для PDF */
export function symbolToSvg(placed: SymbolPrim[], color: string, bg: string, sw = 1.2): string {
  return placed
    .map((p) => {
      if (p.kind === "circle") {
        return `<circle cx="${f(p.c[0])}" cy="${f(p.c[1])}" r="${f(p.r)}" fill="${p.fill ? color : bg}" stroke="${color}" stroke-width="${sw}"/>`
      }
      const pts = p.pts.map(([x, y]) => `${f(x)},${f(y)}`).join(" ")
      const tag = p.closed ? "polygon" : "polyline"
      const fill = p.fill ? color : p.closed ? bg : "none"
      return `<${tag} points="${pts}" fill="${fill}" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`
    })
    .join("")
}

export function symbolIconSvg(
  kind: NodeKind,
  w: number,
  h: number,
  size: number,
  color: string,
  bg: string,
): string | null {
  const placed = symbolIcon(kind, w, h, size)
  if (!placed) return null
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${symbolToSvg(placed, color, bg, 1.1)}</svg>`
}