import { NODE_PRESETS, NodeKind, PlanFixture, PlanNode, PlanRoom, PlanScheme, sectionColor } from "./types"
import { pointInPolygon, toMm } from "./geometry"
import { gostSymbol, placeSymbol, symbolToSvg } from "./symbols"
import { linkGeometry } from "./geometry"
import { FLOATING_OFFSET, fixtureLength, fixtureRoom, floatingContour, trackPath, trackTurns } from "./fixtures"

/** Что ставится на потолок или под ним — светильники, споты, распаечные коробки */
export const CEILING_KINDS = new Set<NodeKind>(["light", "spot", "junction"])

export interface CeilingPoint {
  node: PlanNode
  no: number
  /** От левой (мин. X) и верхней (мин. Y) стены помещения по плану, м */
  dx: number
  dy: number
  /** До правой и нижней стены, м */
  rx: number
  ry: number
}

/** Трек на потолке: начало и конец от левой и верхней стены, м */
export interface CeilingTrack {
  fixture: PlanFixture
  no: number
  horiz: boolean
  /** Начало (левый/верхний конец) и конец */
  x1: number
  y1: number
  x2: number
  y2: number
  length: number
  /** Все точки трека от левой и верхней стены: концы и повороты, м */
  path: { x: number; y: number }[]
  turns: number
  /** До правой и нижней стены от дальнего конца, м */
  rx: number
  ry: number
}

export interface CeilingPlan {
  room: PlanRoom
  tracks: CeilingTrack[]
  /** Парящие потолки помещения */
  floating: PlanFixture[]
  minX: number
  minY: number
  width: number
  depth: number
  points: CeilingPoint[]
}

/**
 * Потолок помещения: точки в его контуре. Размеры даём от стен по осям X и Y
 * (по габариту помещения) — так монтажник размечает потолок рулеткой от двух стен
 */
export function ceilingPlan(scheme: PlanScheme, room: PlanRoom): CeilingPlan | null {
  if (room.points.length < 3) return null
  const xs = room.points.map((p) => p.x)
  const ys = room.points.map((p) => p.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const maxX = Math.max(...xs)
  const maxY = Math.max(...ys)
  const pts = (scheme.nodes || [])
    .filter((n) => n.layer === "electric" && CEILING_KINDS.has(n.kind))
    .filter((n) => (n.roomId ? n.roomId === room.id : pointInPolygon(n, room.points)))
    .sort((a, b) => a.y - b.y || a.x - b.x)
  const own = (scheme.fixtures || []).filter((f) => fixtureRoom(scheme, f)?.id === room.id)
  const tracks = own
    .filter((f) => f.kind === "track")
    .map((f) => {
      // Начало — тот конец, что ближе к левому верхнему углу; путь идёт от него
      const raw = trackPath(f)
      const path = raw[0].x + raw[0].y <= raw[raw.length - 1].x + raw[raw.length - 1].y ? raw : [...raw].reverse()
      return { f, path }
    })
    .sort((a, b) => a.path[0].y - b.path[0].y || a.path[0].x - b.path[0].x)
    .map(({ f, path }, i): CeilingTrack => {
      const lo = path[0]
      const hi = path[path.length - 1]
      const xs = path.map((p) => p.x)
      const ys = path.map((p) => p.y)
      return {
        fixture: f,
        no: i + 1,
        horiz: Math.max(...xs) - Math.min(...xs) >= Math.max(...ys) - Math.min(...ys),
        x1: lo.x - minX,
        y1: lo.y - minY,
        x2: hi.x - minX,
        y2: hi.y - minY,
        length: fixtureLength(f),
        path: path.map((p) => ({ x: p.x - minX, y: p.y - minY })),
        turns: trackTurns(f),
        rx: maxX - Math.max(...xs),
        ry: maxY - Math.max(...ys),
      }
    })
  return {
    room,
    tracks,
    floating: own.filter((f) => f.kind === "floating").sort((a, b) => (a.offset ?? 0) - (b.offset ?? 0)),
    minX,
    minY,
    width: maxX - minX,
    depth: maxY - minY,
    points: pts.map((n, i) => ({
      node: n,
      no: i + 1,
      dx: n.x - minX,
      dy: n.y - minY,
      rx: maxX - n.x,
      ry: maxY - n.y,
    })),
  }
}

const FONT = 'font-family="Arial, sans-serif"'
const INK = "#161616"
const ACC = "#B8860B"
const TRK = "#2563eb"
const FLOAT = "#0891b2"

/** Цепочка размеров вдоль оси: от стены через все отметки до противоположной стены */
function chain(marks: number[], L: number, fixed: number, s: (m: number) => number, horizontal: boolean, color: string): string {
  const xs = [0, ...marks, L]
    .map((v) => Math.min(Math.max(v, 0), L))
    .sort((a, b) => a - b)
    .filter((v, i, arr) => i === 0 || v - arr[i - 1] > 0.004)
  const P = (a: number, o = 0) => (horizontal ? `${s(a)},${fixed + o}` : `${fixed + o},${s(a)}`)
  const parts: string[] = []
  const [x1, y1] = P(0).split(",")
  const [x2, y2] = P(L).split(",")
  parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="0.7"/>`)
  for (const v of xs) {
    const [ax, ay] = P(v, -5).split(",")
    const [bx, by] = P(v, 5).split(",")
    parts.push(`<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="${color}" stroke-width="0.7"/>`)
  }
  for (let i = 1; i < xs.length; i++) {
    const a = s(xs[i - 1])
    const b = s(xs[i])
    const txt = String(toMm(xs[i] - xs[i - 1]))
    const fits = Math.abs(b - a) > txt.length * 5.4 + 4
    const m = (a + b) / 2
    const off = fits ? -4 : i % 2 ? -4 : 11
    parts.push(
      horizontal
        ? `<text x="${m}" y="${fixed + off}" text-anchor="middle" font-size="8.5" font-weight="bold" fill="${color}" ${FONT}>${txt}</text>`
        : `<text transform="translate(${fixed + off}, ${m}) rotate(-90)" text-anchor="middle" font-size="8.5" font-weight="bold" fill="${color}" ${FONT}>${txt}</text>`,
    )
  }
  return parts.join("")
}

/**
 * Развёртка потолка в SVG: контур помещения, точки со своими обозначениями и номерами,
 * трассы электрики между ними цветом сечения, цепочки размеров по X и Y от стен
 */
export function ceilingSvg(scheme: PlanScheme, c: CeilingPlan, width = 700): string {
  const both = c.points.length > 0 && c.tracks.length > 0
  const pad = { l: both ? 68 : 50, r: 30, t: both ? 64 : 46, b: 30 }
  const k = Math.min((width - pad.l - pad.r) / Math.max(c.width, 0.5), 340 / Math.max(c.depth, 0.5))
  const H = c.depth * k
  const height = pad.t + H + pad.b + 30
  const sx = (x: number) => pad.l + (x - c.minX) * k
  const sy = (y: number) => pad.t + (y - c.minY) * k
  const parts: string[] = [`<rect width="${width}" height="${height}" fill="#ffffff"/>`]

  const poly = c.room.points.map((p) => `${sx(p.x)},${sy(p.y)}`).join(" ")
  parts.push(`<polygon points="${poly}" fill="#fbfbfb" stroke="${INK}" stroke-width="1.8"/>`)

  // Трассы электрики, где оба конца на потолке этого помещения
  const ids = new Set(c.points.map((p) => p.node.id))
  const byId = new Map((scheme.nodes || []).map((n) => [n.id, n]))
  for (const l of scheme.links || []) {
    if (l.layer !== "electric" || !(ids.has(l.fromId) && ids.has(l.toId))) continue
    const g = linkGeometry(l, byId)
    if (!g) continue
    parts.push(
      `<polyline points="${g.route.map((p) => `${sx(p.x)},${sy(p.y)}`).join(" ")}" fill="none" stroke="${sectionColor(l.spec, true)}" stroke-width="1.6" stroke-dasharray="6 3"/>`,
    )
  }

  // Парящие потолки — штрихпунктирные контуры, подписаны отступом от стен
  c.floating.forEach((f, i) => {
    const cn = floatingContour(scheme, f)
    if (!cn) return
    parts.push(
      `<polygon points="${cn.map((p) => `${sx(p.x)},${sy(p.y)}`).join(" ")}" fill="none" stroke="${FLOAT}" stroke-width="1.3" stroke-dasharray="9 3 2 3"/>`,
    )
    const off = f.offset ?? FLOATING_OFFSET
    const tx = sx(c.minX + off) + 4 + i * 2
    const ty = sy(c.minY + c.depth) - off * k - 5 - i * 11
    parts.push(
      `<text x="${tx}" y="${ty}" font-size="8" font-weight="bold" fill="${FLOAT}" ${FONT} stroke="#fff" stroke-width="2.5" paint-order="stroke">ПП${c.floating.length > 1 ? i + 1 : ""} · ${toMm(off)}</text>`,
    )
  })

  // Треки — толстой линией с засечками, номер в квадрате
  for (const t of c.tracks) {
    const pts = t.path.map((p) => ({ x: pad.l + p.x * k, y: pad.t + p.y * k }))
    const poly = pts.map((p) => `${p.x},${p.y}`).join(" ")
    const tick = (p: { x: number; y: number }, q: { x: number; y: number }) => {
      const L = Math.hypot(q.x - p.x, q.y - p.y) || 1
      const nx = -(q.y - p.y) / L
      const ny = (q.x - p.x) / L
      return `<line x1="${p.x - nx * 5}" y1="${p.y - ny * 5}" x2="${p.x + nx * 5}" y2="${p.y + ny * 5}" stroke="${INK}" stroke-width="1.4"/>`
    }
    parts.push(
      `<polyline points="${poly}" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linejoin="miter"/>`,
      `<polyline points="${poly}" fill="none" stroke="#fff" stroke-width="0.8" stroke-linejoin="miter"/>`,
      tick(pts[0], pts[1]),
      tick(pts[pts.length - 1], pts[pts.length - 2]),
      ...pts.slice(1, -1).map((p) => `<rect x="${p.x - 3}" y="${p.y - 3}" width="6" height="6" fill="${INK}"/>`),
      // Оси концов и поворотов трека — к цепочкам размеров
      ...pts.flatMap(({ x, y }) => [
        `<line x1="${x}" y1="${pad.t - 14}" x2="${x}" y2="${y}" stroke="${TRK}" stroke-width="0.4" stroke-dasharray="2 2"/>`,
        `<line x1="${pad.l - 14}" y1="${y}" x2="${x}" y2="${y}" stroke="${TRK}" stroke-width="0.4" stroke-dasharray="2 2"/>`,
      ]),
    )
    // Номер — у середины самого длинного участка
    let bi = 0
    let bl = -1
    for (let i = 1; i < pts.length; i++) {
      const l = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
      if (l > bl) {
        bl = l
        bi = i
      }
    }
    const p1 = pts[bi - 1]
    const p2 = pts[bi]
    const L = bl || 1
    const nx = -(p2.y - p1.y) / L
    const ny = (p2.x - p1.x) / L
    const mx = (p1.x + p2.x) / 2 + nx * 11
    const my = (p1.y + p2.y) / 2 + ny * 11
    parts.push(
      `<rect x="${mx - 9}" y="${my - 7}" width="18" height="12" rx="2" fill="${TRK}"/>`,
      `<text x="${mx}" y="${my + 2}" text-anchor="middle" font-size="7.5" font-weight="bold" fill="#fff" ${FONT}>Т${t.no}</text>`,
    )
  }

  // Оси через каждую точку — тонко, чтобы размеры читались
  for (const p of c.points) {
    const x = sx(p.node.x)
    const y = sy(p.node.y)
    parts.push(
      `<line x1="${x}" y1="${pad.t - 14}" x2="${x}" y2="${y}" stroke="${ACC}" stroke-width="0.4" stroke-dasharray="2 2"/>`,
      `<line x1="${pad.l - 14}" y1="${y}" x2="${x}" y2="${y}" stroke="${ACC}" stroke-width="0.4" stroke-dasharray="2 2"/>`,
    )
  }

  for (const p of c.points) {
    const x = sx(p.node.x)
    const y = sy(p.node.y)
    const prims = gostSymbol(p.node.kind)
    if (prims) parts.push(symbolToSvg(placeSymbol(prims, { x, y }, 8), INK, "#ffffff", 1.2))
    else parts.push(`<circle cx="${x}" cy="${y}" r="6" fill="#fff" stroke="${INK}" stroke-width="1.2"/>`)
    parts.push(
      `<circle cx="${x + 11}" cy="${y - 10}" r="6" fill="${INK}"/>`,
      `<text x="${x + 11}" y="${y - 7}" text-anchor="middle" font-size="8" font-weight="bold" fill="#fff" ${FONT}>${p.no}</text>`,
    )
  }

  // Цепочки размеров: светильники — сверху/слева, треки (концы) — отдельной цепочкой ещё дальше от плана
  const hasPts = c.points.length > 0
  const hasTr = c.tracks.length > 0
  if (hasPts) {
    parts.push(chain(c.points.map((p) => p.dx), c.width, pad.t - 18, (m) => pad.l + m * k, true, ACC))
    parts.push(chain(c.points.map((p) => p.dy), c.depth, pad.l - 18, (m) => pad.t + m * k, false, ACC))
  }
  if (hasTr) {
    const tx = c.tracks.flatMap((t) => t.path.map((p) => p.x))
    const ty = c.tracks.flatMap((t) => t.path.map((p) => p.y))
    parts.push(chain(tx, c.width, pad.t - (hasPts ? 36 : 18), (m) => pad.l + m * k, true, TRK))
    parts.push(chain(ty, c.depth, pad.l - (hasPts ? 36 : 18), (m) => pad.t + m * k, false, TRK))
  }
  parts.push(chain([], c.width, pad.t + H + 18, (m) => pad.l + m * k, true, INK))
  parts.push(
    `<text x="${pad.l}" y="${height - 6}" font-size="8.5" fill="#666" ${FONT}>Вид снизу на потолок, ориентация как на плане. Размеры, мм: золотые — до центров светильников, синие — до концов и поворотов треков.</text>`,
  )
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join("")}</svg>`
}

export function ceilingRows(c: CeilingPlan) {
  return c.points.map((p) => ({
    no: p.no,
    name: p.node.label || NODE_PRESETS[p.node.kind].label,
    kind: p.node.kind,
    fromLeft: toMm(p.dx),
    fromTop: toMm(p.dy),
    fromRight: toMm(p.rx),
    fromBottom: toMm(p.ry),
    height: toMm(p.node.height),
  }))
}

/** Ведомость треков потолка: отступы концов от стен */
export function ceilingTrackRows(c: CeilingPlan) {
  return c.tracks.map((t) => ({
    no: t.no,
    name: t.fixture.label || "Магнитный трек",
    length: toMm(t.length),
    dir: t.turns ? `${t.turns} пов.: ${t.path.map((p) => `${toMm(p.x)}×${toMm(p.y)}`).join(" → ")}` : t.horiz ? "вдоль X" : "вдоль Y",
    fromLeft: toMm(t.x1),
    fromTop: toMm(t.y1),
    toRight: toMm(t.rx),
    toBottom: toMm(t.ry),
    height: toMm(t.fixture.height),
  }))
}
