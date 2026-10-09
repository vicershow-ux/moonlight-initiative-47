import { NODE_PRESETS, NodeKind, PlanNode, PlanRoom, PlanScheme, sectionColor } from "./types"
import { pointInPolygon, toMm } from "./geometry"
import { gostSymbol, placeSymbol, symbolToSvg } from "./symbols"
import { linkGeometry } from "./geometry"

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

export interface CeilingPlan {
  room: PlanRoom
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
  return {
    room,
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
  const pad = { l: 50, r: 30, t: 46, b: 30 }
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

  parts.push(chain(c.points.map((p) => p.dx), c.width, pad.t - 18, (m) => pad.l + m * k, true, ACC))
  parts.push(chain(c.points.map((p) => p.dy), c.depth, pad.l - 18, (m) => pad.t + m * k, false, ACC))
  parts.push(chain([], c.width, pad.t + H + 18, (m) => pad.l + m * k, true, INK))
  parts.push(
    `<text x="${pad.l}" y="${height - 6}" font-size="8.5" fill="#666" ${FONT}>Вид снизу на потолок, ориентация как на плане. Размеры — до центра, мм.</text>`,
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
