import type { HeatingKind, PlanPoint } from "./types"

/**
 * Раскладка тёплого пола по зоне: полосы («дорожки») вдоль длинной стороны,
 * в обход мебели без ножек. Кабель и труба — змейкой с поворотами на концах,
 * мат — полосами 0,5 м с разворотом сетки, плёнка — отдельными полосами с шиной подключения.
 * Чистая геометрия: координаты в метрах, без зависимостей от схемы
 */

export interface LayoutLane {
  /** Ось полосы и её концы */
  y: number
  x0: number
  x1: number
}

export interface LayoutRun {
  /** Полосы одной змейки по порядку укладки; dirs — куда идёт полоса (+1 — к x1) */
  lanes: LayoutLane[]
  dirs: (1 | -1)[]
}

export interface HeatingLayout {
  kind: HeatingKind
  /** Шаг между осями полос, м */
  step: number
  /** Ширина полосы мата/плёнки, м (для кабеля и трубы — 0) */
  band: number
  /** Ось укладки: полосы идут вдоль X или вдоль Y плана */
  axis: "x" | "y"
  runs: LayoutRun[]
  /** Сплошная линия укладки (кабель, труба) — уже в координатах плана, с поворотами */
  path: PlanPoint[]
  /** Переходы между змейками в обход мебели — тоже кабель/труба */
  jumpers: [PlanPoint, PlanPoint][]
  /** Длина нагревательного кабеля / трубы по раскладке, м */
  length: number
  /** Уложенная площадь полос мата/плёнки, м² */
  laid: number
  /** Сколько полос */
  lanes: number
  /** Начало укладки (к терморегулятору) и конец */
  start: PlanPoint | null
  end: PlanPoint | null
  /** Точка датчика пола — между витками, не ближе 0,5 м к стене */
  sensor: PlanPoint | null
  /** Шина подключения плёнки — концы полос со стороны терморегулятора */
  bus: PlanPoint[]
}

export interface LayoutOptions {
  kind: HeatingKind
  step: number
  /** Отступ от контура зоны и от мебели, м */
  margin?: number
  /** Направление полос: авто — вдоль длинной стороны */
  dir?: "auto" | "x" | "y"
  /** Препятствия — контуры мебели без ножек */
  blocked: PlanPoint[][]
  /** Терморегулятор: укладка начинается с ближней к нему стороны */
  thermostat?: PlanPoint | null
}

type Iv = [number, number]

/** Пересечения горизонтали y с многоугольником: отрезки внутри */
function cut(poly: PlanPoint[], y: number): Iv[] {
  const xs: number[] = []
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    if ((a.y <= y && b.y > y) || (b.y <= y && a.y > y)) xs.push(a.x + ((y - a.y) / (b.y - a.y)) * (b.x - a.x))
  }
  xs.sort((p, q) => p - q)
  const out: Iv[] = []
  for (let i = 0; i + 1 < xs.length; i += 2) out.push([xs[i], xs[i + 1]])
  return out
}

const intersect = (a: Iv[], b: Iv[]): Iv[] => {
  const out: Iv[] = []
  for (const p of a) for (const q of b) {
    const lo = Math.max(p[0], q[0])
    const hi = Math.min(p[1], q[1])
    if (hi > lo) out.push([lo, hi])
  }
  return out.sort((p, q) => p[0] - q[0])
}

const subtract = (a: Iv[], cuts: Iv[]): Iv[] => {
  let cur = a
  for (const c of cuts) {
    const next: Iv[] = []
    for (const p of cur) {
      if (c[1] <= p[0] || c[0] >= p[1]) next.push(p)
      else {
        if (c[0] > p[0]) next.push([p[0], c[0]])
        if (c[1] < p[1]) next.push([c[1], p[1]])
      }
    }
    cur = next
  }
  return cur
}

const swap = (p: PlanPoint): PlanPoint => ({ x: p.y, y: p.x })
const len2 = (a: PlanPoint, b: PlanPoint) => Math.hypot(a.x - b.x, a.y - b.y)

/** Плёнку режут кратно 25 см, мат — полосой; для кабеля и трубы полосы не короче 2 шагов */
const minLane = (kind: HeatingKind, step: number) => (kind === "film" ? 1 : kind === "mat" ? 0.5 : step * 2)

export function heatingLayout(zone: PlanPoint[], o: LayoutOptions): HeatingLayout {
  const kind = o.kind
  const band = kind === "mat" || kind === "film" ? 0.5 : 0
  const step = band ? band + (kind === "film" ? 0.02 : 0) : Math.max(o.step, 0.05)
  const margin = o.margin ?? 0.05
  const empty: HeatingLayout = { kind, step, band, axis: "x", runs: [], path: [], jumpers: [], length: 0, laid: 0, lanes: 0, start: null, end: null, sensor: null, bus: [] }
  if (zone.length < 3) return empty

  const xs = zone.map((p) => p.x)
  const ys = zone.map((p) => p.y)
  const w = Math.max(...xs) - Math.min(...xs)
  const h = Math.max(...ys) - Math.min(...ys)
  // Полосы вдоль длинной стороны — меньше поворотов
  const axis: "x" | "y" = o.dir === "x" || o.dir === "y" ? o.dir : w >= h ? "x" : "y"
  const tf = axis === "x" ? (p: PlanPoint) => p : swap
  const poly = zone.map(tf)
  const blocked = o.blocked.map((b) => b.map(tf))
  const th = o.thermostat ? tf(o.thermostat) : null

  const y0 = Math.min(...poly.map((p) => p.y))
  const y1 = Math.max(...poly.map((p) => p.y))
  // Полоса целиком внутри зоны: проверяем по краям полосы и по оси
  const half = band ? band / 2 : step / 2
  const edge = band ? half : margin
  const lanesY: number[] = []
  for (let y = y0 + edge + (band ? 0 : 0); y <= y1 - edge + 1e-9; y += step) lanesY.push(y)
  // Центрируем сетку по зоне — равные отступы сверху и снизу
  if (lanesY.length) {
    const shift = (y1 - edge - lanesY[lanesY.length - 1]) / 2
    for (let i = 0; i < lanesY.length; i++) lanesY[i] += shift
  }

  const rows: Iv[][] = lanesY.map((y) => {
    const samples = band ? [y - half + 0.005, y, y + half - 0.005] : [y - 0.005, y, y + 0.005]
    let iv = cut(poly, samples[0])
    for (const sy of samples.slice(1)) iv = intersect(iv, cut(poly, sy))
    iv = iv.map(([a, b]) => [a + margin, b - margin] as Iv).filter(([a, b]) => b > a)
    // Мебель вырезаем с отступом; для полосы мата — по всей её ширине
    const cuts: Iv[] = []
    for (const bl of blocked) {
      const bs = band ? [y - half, y, y + half] : [y - step / 2 + 0.01, y, y + step / 2 - 0.01]
      const by = bl.map((p) => p.y)
      if (Math.max(...bs) < Math.min(...by) - margin || Math.min(...bs) > Math.max(...by) + margin) continue
      for (const sy of [...bs, Math.min(Math.max(y, Math.min(...by) + 0.001), Math.max(...by) - 0.001)]) {
        for (const c of cut(bl, sy)) cuts.push([c[0] - margin, c[1] + margin])
      }
    }
    iv = subtract(iv, cuts)
    // Плёнку режут кратно 25 см
    if (kind === "film") iv = iv.map(([a, b]) => [a, a + Math.floor((b - a) / 0.25) * 0.25] as Iv)
    return iv.filter(([a, b]) => b - a >= minLane(kind, step) - 1e-6)
  })

  // Змейки: полоса продолжает змейку соседнего ряда, если они перекрываются
  type Snake = { lanes: LayoutLane[]; lastRow: number }
  const snakes: Snake[] = []
  rows.forEach((iv, r) => {
    const used = new Set<Snake>()
    for (const [a, b] of iv) {
      const lane = { y: lanesY[r], x0: a, x1: b }
      const s = kind === "film" ? null : snakes.find((sn) => !used.has(sn) && sn.lastRow === r - 1 && Math.min(sn.lanes[sn.lanes.length - 1].x1, b) - Math.max(sn.lanes[sn.lanes.length - 1].x0, a) > step)
      if (s) {
        s.lanes.push(lane)
        s.lastRow = r
        used.add(s)
      } else {
        const ns = { lanes: [lane], lastRow: r }
        snakes.push(ns)
        used.add(ns)
      }
    }
  })
  if (!snakes.length) return { ...empty, axis }

  // Порядок обхода: первая змейка — ближайшая к терморегулятору, дальше — ближайшая к концу предыдущей
  const endsOf = (sn: Snake, reversed: boolean, firstDir: 1 | -1) => {
    const lanes = reversed ? [...sn.lanes].reverse() : sn.lanes
    const dirs = lanes.map((_, i) => ((i % 2 === 0 ? firstDir : -firstDir) as 1 | -1))
    const f = lanes[0]
    const l = lanes[lanes.length - 1]
    const ld = dirs[dirs.length - 1]
    return {
      lanes,
      dirs,
      start: { x: firstDir === 1 ? f.x0 : f.x1, y: f.y },
      end: { x: ld === 1 ? l.x1 : l.x0, y: l.y },
    }
  }
  const options = (sn: Snake) => [endsOf(sn, false, 1), endsOf(sn, false, -1), endsOf(sn, true, 1), endsOf(sn, true, -1)]
  const left = [...snakes]
  let anchor: PlanPoint = th || { x: Math.min(...poly.map((p) => p.x)), y: y0 }
  const runs: ReturnType<typeof endsOf>[] = []
  while (left.length) {
    let best: { i: number; v: ReturnType<typeof endsOf>; d: number } | null = null
    left.forEach((sn, i) => {
      for (const v of options(sn)) {
        const d = len2(anchor, v.start)
        if (!best || d < best.d - 1e-9) best = { i, v, d }
      }
    })
    const b = best as unknown as { i: number; v: ReturnType<typeof endsOf> }
    runs.push(b.v)
    anchor = b.v.end
    left.splice(b.i, 1)
  }

  // Линия укладки с поворотами; повороты — полуокружности на концах полос
  const back = axis === "x" ? (p: PlanPoint) => p : swap
  const path: PlanPoint[] = []
  const jumpers: [PlanPoint, PlanPoint][] = []
  let length = 0
  let laid = 0
  let prevEnd: PlanPoint | null = null
  const bus: PlanPoint[] = []
  for (const run of runs) {
    if (prevEnd && kind !== "film") {
      jumpers.push([back(prevEnd), back(run.start)])
      length += Math.abs(prevEnd.x - run.start.x) + Math.abs(prevEnd.y - run.start.y)
    }
    run.lanes.forEach((ln, i) => {
      const d = run.dirs[i]
      const a = { x: d === 1 ? ln.x0 : ln.x1, y: ln.y }
      const b = { x: d === 1 ? ln.x1 : ln.x0, y: ln.y }
      laid += (ln.x1 - ln.x0) * (band || 0)
      length += ln.x1 - ln.x0
      if (kind === "film") {
        // Контакты плёнки — со стороны терморегулятора
        bus.push(back({ x: th && Math.abs(th.x - ln.x1) < Math.abs(th.x - ln.x0) ? ln.x1 : ln.x0, y: ln.y }))
        return
      }
      if (kind !== "mat") path.push(back(a))
      if (kind !== "mat") path.push(back(b))
      const next = run.lanes[i + 1]
      if (next && kind !== "mat") {
        // Поворот: полуокружность радиусом в полшага, с подтяжкой до начала следующей полосы
        const nx = d === 1 ? next.x1 : next.x0
        const xEdge = d === 1 ? Math.max(b.x, nx) : Math.min(b.x, nx)
        const r = Math.abs(next.y - ln.y) / 2
        if (Math.abs(xEdge - b.x) > 1e-6) {
          path.push(back({ x: xEdge, y: ln.y }))
          length += Math.abs(xEdge - b.x)
        }
        for (let t = 1; t < 8; t++) {
          const ang = -Math.PI / 2 + (t / 8) * Math.PI
          path.push(back({ x: xEdge + d * r * Math.cos(ang), y: (ln.y + next.y) / 2 + r * Math.sin(ang) * Math.sign(next.y - ln.y) }))
        }
        length += Math.PI * r
        if (Math.abs(xEdge - nx) > 1e-6) {
          path.push(back({ x: xEdge, y: next.y }))
          length += Math.abs(xEdge - nx)
        }
      }
    })
    if (kind !== "mat" && kind !== "film" && path.length) {
      // Разрыв линии между змейками отмечаем NaN — при отрисовке переход рисуется отдельно
      path.push({ x: Number.NaN, y: Number.NaN })
    }
    prevEnd = run.end
  }
  while (path.length && Number.isNaN(path[path.length - 1].x)) path.pop()

  // Датчик: между двумя средними полосами первой длинной змейки, в 0,5–0,6 м от края
  let sensor: PlanPoint | null = null
  const longest = [...runs].sort((p, q) => q.lanes.length - p.lanes.length)[0]
  if (longest) {
    const k = Math.max(Math.floor(longest.lanes.length / 2) - 1, 0)
    const a = longest.lanes[k]
    const b = longest.lanes[Math.min(k + 1, longest.lanes.length - 1)]
    const lo = Math.max(a.x0, b.x0)
    const hi = Math.min(a.x1, b.x1)
    const near = th ? (Math.abs(th.x - lo) < Math.abs(th.x - hi) ? lo : hi) : lo
    const x = near === lo ? Math.min(lo + 0.6, (lo + hi) / 2) : Math.max(hi - 0.6, (lo + hi) / 2)
    sensor = back({ x, y: a === b ? a.y : (a.y + b.y) / 2 })
  }

  const first = runs[0]
  const last = runs[runs.length - 1]
  // Для мата полоса считается одной «змейкой» сетки; длину кабеля в мате не считаем — он в паспорте мата
  return {
    kind,
    step,
    band,
    axis,
    runs: runs.map((r) => ({ lanes: r.lanes, dirs: r.dirs })),
    path,
    jumpers,
    length: Math.round(length * 10) / 10,
    laid: Math.round(laid * 100) / 100,
    lanes: runs.reduce((a, r) => a + r.lanes.length, 0),
    start: first ? back(first.start) : null,
    end: last ? back(last.end) : null,
    sensor,
    bus,
  }
}
