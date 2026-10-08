import { NODE_PRESETS, NodeKind, OPENING_PRESETS, PlanNode, PlanOpening, PlanRoom, PlanScheme } from "./types"
import { WallInfo, mountPosition, openingSpan, roomWalls } from "./walls"
import { toMm } from "./geometry"

/** Что показываем на развёртке: всё, что крепится на стену на слое электрики */
const ELEVATION_KINDS = new Set<NodeKind>([
  "socket",
  "socket_power",
  "switch",
  "switch_double",
  "switch_pass",
  "switch_pass_double",
  "panel",
  "junction",
])

/** Насколько далеко от стены может стоять неприкреплённая точка, чтобы попасть на развёртку, м */
const LOOSE_DIST = 0.35

export interface ElevPoint {
  node: PlanNode
  /** Номер на развёртке */
  no: number
  /** От левого угла (вид из помещения), м — до центра коробки */
  x: number
  /** От чистого пола до центра, м */
  z: number
  /** Точка в откосе проёма */
  reveal?: { depth: number; opening: PlanOpening }
}

export interface ElevOpening {
  o: PlanOpening
  x0: number
  x1: number
  z0: number
  z1: number
}

export interface WallElevation {
  wall: WallInfo
  room: PlanRoom
  length: number
  height: number
  points: ElevPoint[]
  openings: ElevOpening[]
}

/**
 * Вид на стену из помещения: левый угол — слева от монтажника, который стоит лицом к стене.
 * Направление «вправо» при взгляде вдоль нормали наружу — (−ny, nx) в координатах плана
 */
const rightAligned = (w: WallInfo) => w.ux * w.ny - w.uy * w.nx < 0

export function wallElevation(scheme: PlanScheme, wall: WallInfo): WallElevation | null {
  const room = scheme.rooms.find((r) => r.id === wall.roomId)
  if (!room) return null
  const L = wall.length
  const toX = (s: number) => (rightAligned(wall) ? s : L - s)
  const walls = roomWalls(room, scheme)

  const openings: ElevOpening[] = scheme.openings
    .filter((o) => o.wallId === wall.id)
    .map((o) => {
      const sp = openingSpan(o, wall)
      const a = toX(sp.start)
      const b = toX(sp.end)
      return { o, x0: Math.min(a, b), x1: Math.max(a, b), z0: o.sill, z1: Math.min(o.sill + o.height, room.height) }
    })
    .sort((p, q) => p.x0 - q.x0)

  const raw: Omit<ElevPoint, "no">[] = []
  for (const n of scheme.nodes || []) {
    if (n.layer !== "electric" || !ELEVATION_KINDS.has(n.kind)) continue
    if (n.mount) {
      if (n.mount.wallId !== wall.id) continue
      const pos = mountPosition(scheme, n.mount)
      if (!pos) continue
      const s = (pos.p.x - wall.a.x) * wall.ux + (pos.p.y - wall.a.y) * wall.uy
      raw.push({
        node: n,
        x: toX(Math.min(Math.max(s, 0), L)),
        z: n.height,
        reveal: pos.opening ? { depth: n.mount.depth ?? wall.thickness / 2, opening: pos.opening } : undefined,
      })
      continue
    }
    // Старые точки без привязки: берём ближайшую стену помещения, если точка у самой стены
    if (n.roomId && n.roomId !== room.id) continue
    let best: { w: WallInfo; d: number; s: number } | null = null
    for (const w of walls) {
      const rx = n.x - w.a.x
      const ry = n.y - w.a.y
      const s = rx * w.ux + ry * w.uy
      if (s < -0.05 || s > w.length + 0.05) continue
      const d = Math.abs(rx * w.nx + ry * w.ny + w.inner)
      if (!best || d < best.d) best = { w, d, s }
    }
    if (!best || best.w.id !== wall.id || best.d > LOOSE_DIST) continue
    raw.push({ node: n, x: toX(Math.min(Math.max(best.s, 0), L)), z: n.height })
  }

  raw.sort((a, b) => a.x - b.x || a.z - b.z)
  return {
    wall,
    room,
    length: L,
    height: room.height,
    points: raw.map((p, i) => ({ ...p, no: i + 1 })),
    openings,
  }
}

export function roomElevations(scheme: PlanScheme, room: PlanRoom): WallElevation[] {
  return roomWalls(room, scheme)
    .map((w) => wallElevation(scheme, w))
    .filter((e): e is WallElevation => !!e)
}

const esc = (s: string) =>
  String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

const FONT = 'font-family="Arial, sans-serif"'
const INK = "#161616"
const DIM = "#555555"
const ACCENT = "#B8860B"

/** Размер коробки на развёртке, м: подрозетник Ø68, щит — условно 300×400 */
const boxSize = (kind: NodeKind) =>
  kind === "panel" ? { w: 0.3, h: 0.4 } : kind === "junction" ? { w: 0.1, h: 0.1 } : { w: 0.068, h: 0.068 }

/** Мини-план помещения: какая стена развёрнута и откуда смотрим */
function keyPlan(e: WallElevation, x: number, y: number, size: number): string {
  const pts = e.room.points
  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const w = Math.max(Math.max(...xs) - minX, 0.1)
  const h = Math.max(Math.max(...ys) - minY, 0.1)
  const k = (size - 10) / Math.max(w, h)
  const ox = x + (size - w * k) / 2
  const oy = y + (size - h * k) / 2
  const sx = (px: number) => ox + (px - minX) * k
  const sy = (py: number) => oy + (py - minY) * k
  const poly = pts.map((p) => `${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ")
  const a = e.wall.a
  const b = e.wall.b
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  // Глаз монтажника — внутри комнаты напротив стены
  const eye = { x: mx - e.wall.nx * Math.min(w, h) * 0.35, y: my - e.wall.ny * Math.min(w, h) * 0.35 }
  const tip = { x: mx - e.wall.nx * 0.08 * Math.min(w, h), y: my - e.wall.ny * 0.08 * Math.min(w, h) }
  return [
    `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="#ffffff" stroke="#dddddd"/>`,
    `<polygon points="${poly}" fill="#f6f6f6" stroke="#999999" stroke-width="1"/>`,
    `<line x1="${sx(a.x)}" y1="${sy(a.y)}" x2="${sx(b.x)}" y2="${sy(b.y)}" stroke="${ACCENT}" stroke-width="3.5" stroke-linecap="round"/>`,
    `<line x1="${sx(eye.x)}" y1="${sy(eye.y)}" x2="${sx(tip.x)}" y2="${sy(tip.y)}" stroke="${INK}" stroke-width="1"/>`,
    `<circle cx="${sx(eye.x)}" cy="${sy(eye.y)}" r="2.5" fill="${INK}"/>`,
    (() => {
      const ux = sx(tip.x) - sx(eye.x)
      const uy = sy(tip.y) - sy(eye.y)
      const l = Math.hypot(ux, uy) || 1
      const dx = ux / l
      const dy = uy / l
      const tx = sx(tip.x)
      const ty = sy(tip.y)
      return `<polygon points="${tx},${ty} ${tx - dx * 6 - dy * 3},${ty - dy * 6 + dx * 3} ${tx - dx * 6 + dy * 3},${ty - dy * 6 - dx * 3}" fill="${INK}"/>`
    })(),
  ].join("")
}

/** Условное изображение точки на развёртке */
function pointSymbol(p: ElevPoint, cx: number, cy: number, k: number): string {
  const kind = p.node.kind
  const bs = boxSize(kind)
  const w = Math.max(bs.w * k, 9)
  const h = Math.max(bs.h * k, 9)
  const fill = p.reveal ? "#fff4d6" : "#ffffff"
  if (kind === "panel") {
    return `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" fill="${fill}" stroke="${INK}" stroke-width="1.3"/><line x1="${cx - w / 2}" y1="${cy + h / 2}" x2="${cx + w / 2}" y2="${cy - h / 2}" stroke="${INK}" stroke-width="0.8"/>`
  }
  if (kind === "junction") {
    return `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" fill="${fill}" stroke="${INK}" stroke-width="1.1" stroke-dasharray="2 1.5"/>`
  }
  const r = w / 2
  const parts = [`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${INK}" stroke-width="1.2"/>`]
  // Перекрестье центра — сюда сверлить коронкой
  parts.push(
    `<line x1="${cx - r - 3}" y1="${cy}" x2="${cx + r + 3}" y2="${cy}" stroke="${INK}" stroke-width="0.5"/>`,
    `<line x1="${cx}" y1="${cy - r - 3}" x2="${cx}" y2="${cy + r + 3}" stroke="${INK}" stroke-width="0.5"/>`,
  )
  if (kind === "socket" || kind === "socket_power") {
    const d = r * 0.38
    parts.push(
      `<circle cx="${cx - d}" cy="${cy}" r="${Math.max(r * 0.13, 1)}" fill="${INK}"/>`,
      `<circle cx="${cx + d}" cy="${cy}" r="${Math.max(r * 0.13, 1)}" fill="${INK}"/>`,
    )
    if (kind === "socket_power") {
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${r + 2}" fill="none" stroke="${INK}" stroke-width="1.2"/>`)
    }
  } else {
    const keys = kind === "switch_double" || kind === "switch_pass_double" ? 2 : 1
    for (let i = 0; i < keys; i++) {
      const ox = keys === 1 ? 0 : (i === 0 ? -1 : 1) * r * 0.3
      parts.push(
        `<line x1="${cx + ox}" y1="${cy - r * 0.55}" x2="${cx + ox}" y2="${cy + r * 0.55}" stroke="${INK}" stroke-width="1.4"/>`,
      )
    }
  }
  return parts.join("")
}

/** Цепочка размеров по горизонтали: от левого угла через все отметки до правого */
function chain(
  marks: number[],
  L: number,
  y: number,
  sx: (m: number) => number,
  color: string,
  bold = false,
): string {
  const xs = [0, ...marks, L]
    .map((v) => Math.min(Math.max(v, 0), L))
    .sort((a, b) => a - b)
    .filter((v, i, arr) => i === 0 || v - arr[i - 1] > 0.004)
  const parts: string[] = [
    `<line x1="${sx(0)}" y1="${y}" x2="${sx(L)}" y2="${y}" stroke="${color}" stroke-width="0.7"/>`,
  ]
  xs.forEach((v) => {
    parts.push(
      `<line x1="${sx(v)}" y1="${y - 6}" x2="${sx(v)}" y2="${y + 6}" stroke="${color}" stroke-width="0.7"/>`,
      `<line x1="${sx(v) - 3}" y1="${y + 3}" x2="${sx(v) + 3}" y2="${y - 3}" stroke="${color}" stroke-width="1.2"/>`,
    )
  })
  for (let i = 1; i < xs.length; i++) {
    const a = sx(xs[i - 1])
    const b = sx(xs[i])
    const txt = String(toMm(xs[i] - xs[i - 1]))
    const fits = b - a > txt.length * 5.6 + 4
    const lift = fits ? 4 : i % 2 === 0 ? 4 : -10
    parts.push(
      `<text x="${(a + b) / 2}" y="${y - lift}" text-anchor="middle" font-size="${fits ? 9.5 : 8.5}" ${bold ? 'font-weight="bold"' : ""} fill="${INK}" ${FONT}>${txt}</text>`,
    )
  }
  return parts.join("")
}

/**
 * Развёртка стены в SVG: проёмы, точки на своей высоте, цепочки размеров
 * от углов по горизонтали и размеры от пола до центра каждой коробки
 */
export function elevationSvg(e: WallElevation, width = 700): string {
  const L = e.length
  const H = e.height
  const left = 62
  const right = 112
  const top = 34
  const k = Math.min((width - left - right) / Math.max(L, 0.3), 250 / Math.max(H, 0.5))
  const wallW = L * k
  const wallH = H * k
  const sx = (m: number) => left + m * k
  const sz = (m: number) => top + wallH - m * k
  const floorY = top + wallH

  const pointMarks = e.points.map((p) => p.x)
  const openMarks = e.openings.flatMap((o) => [o.x0, o.x1])
  const rows = [pointMarks.length ? 1 : 0, openMarks.length ? 1 : 0].reduce((a, b) => a + b, 0) + 1
  const height = floorY + 24 + rows * 26 + 10

  const parts: string[] = [`<rect width="${width}" height="${height}" fill="#ffffff"/>`]

  // Стена, пол и потолок
  parts.push(
    `<rect x="${sx(0)}" y="${top}" width="${wallW}" height="${wallH}" fill="#fbfbfb" stroke="${INK}" stroke-width="1.6"/>`,
    `<line x1="${sx(0) - 14}" y1="${floorY}" x2="${sx(L) + 14}" y2="${floorY}" stroke="${INK}" stroke-width="2.2"/>`,
    `<text x="${sx(0) - 16}" y="${floorY + 3}" text-anchor="end" font-size="8.5" fill="${DIM}" ${FONT}>пол</text>`,
    `<text x="${sx(0) - 16}" y="${top + 3}" text-anchor="end" font-size="8.5" fill="${DIM}" ${FONT}>потолок</text>`,
    `<text x="${sx(0)}" y="${top - 8}" font-size="9" fill="${DIM}" ${FONT}>левый угол</text>`,
    `<text x="${sx(L)}" y="${top - 8}" text-anchor="end" font-size="9" fill="${DIM}" ${FONT}>правый угол</text>`,
  )

  // Высота помещения — справа
  const hx = sx(L) + 16
  parts.push(
    `<line x1="${hx}" y1="${top}" x2="${hx}" y2="${floorY}" stroke="${DIM}" stroke-width="0.7"/>`,
    `<line x1="${hx - 3}" y1="${top + 3}" x2="${hx + 3}" y2="${top - 3}" stroke="${DIM}" stroke-width="1.2"/>`,
    `<line x1="${hx - 3}" y1="${floorY + 3}" x2="${hx + 3}" y2="${floorY - 3}" stroke="${DIM}" stroke-width="1.2"/>`,
    `<text transform="translate(${hx + 11}, ${(top + floorY) / 2}) rotate(-90)" text-anchor="middle" font-size="9.5" fill="${INK}" ${FONT}>${toMm(H)}</text>`,
  )

  // Проёмы
  for (const op of e.openings) {
    const x0 = sx(op.x0)
    const x1 = sx(op.x1)
    const y0 = sz(op.z1)
    const y1 = sz(op.z0)
    parts.push(`<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="#eef4fb" stroke="${INK}" stroke-width="1.1"/>`)
    if (op.o.kind === "window") {
      parts.push(
        `<line x1="${(x0 + x1) / 2}" y1="${y0}" x2="${(x0 + x1) / 2}" y2="${y1}" stroke="#7a9cc0" stroke-width="0.8"/>`,
        `<line x1="${x0}" y1="${y0}" x2="${(x0 + x1) / 2}" y2="${(y0 + y1) / 2}" stroke="#7a9cc0" stroke-width="0.6"/>`,
        `<line x1="${x0}" y1="${y1}" x2="${(x0 + x1) / 2}" y2="${(y0 + y1) / 2}" stroke="#7a9cc0" stroke-width="0.6"/>`,
      )
    } else if (op.o.kind === "door") {
      parts.push(
        `<line x1="${x0}" y1="${y1}" x2="${(x0 + x1) / 2}" y2="${y0}" stroke="#6aa57d" stroke-width="0.6"/>`,
        `<line x1="${x1}" y1="${y1}" x2="${(x0 + x1) / 2}" y2="${y0}" stroke="#6aa57d" stroke-width="0.6"/>`,
      )
    }
    const label = `${OPENING_PRESETS[op.o.kind].label} ${toMm(op.o.width)}×${toMm(op.o.height)}`
    parts.push(
      `<text x="${(x0 + x1) / 2}" y="${y0 + 11}" text-anchor="middle" font-size="8.5" fill="${DIM}" ${FONT}>${esc(label)}</text>`,
    )
    if (op.z0 > 0.01) {
      parts.push(
        `<text x="${(x0 + x1) / 2}" y="${y1 - 4}" text-anchor="middle" font-size="8" fill="${DIM}" ${FONT}>низ ${toMm(op.z0)}</text>`,
      )
    }
  }

  // Размеры от пола до центра: у каждой точки своя выносная, при совпадении по X — со сдвигом
  const sameX = new Map<number, number>()
  for (const p of e.points) {
    const key = Math.round(p.x * 200)
    const idx = sameX.get(key) ?? 0
    sameX.set(key, idx + 1)
    const cx = sx(p.x)
    const cy = sz(p.z)
    const bs = boxSize(p.node.kind)
    const lx = cx - Math.max(bs.w * k, 9) / 2 - 7 - idx * 12
    parts.push(
      `<line x1="${lx}" y1="${floorY}" x2="${lx}" y2="${cy}" stroke="${ACCENT}" stroke-width="0.7" stroke-dasharray="3 2"/>`,
      `<line x1="${lx - 3}" y1="${cy}" x2="${cx}" y2="${cy}" stroke="${ACCENT}" stroke-width="0.5"/>`,
      `<line x1="${lx - 3}" y1="${floorY + 3}" x2="${lx + 3}" y2="${floorY - 3}" stroke="${ACCENT}" stroke-width="1.1"/>`,
      `<line x1="${lx - 3}" y1="${cy + 3}" x2="${lx + 3}" y2="${cy - 3}" stroke="${ACCENT}" stroke-width="1.1"/>`,
    )
    if (floorY - cy > 24) {
      parts.push(
        `<text transform="translate(${lx - 3}, ${(floorY + cy) / 2}) rotate(-90)" text-anchor="middle" font-size="8.5" font-weight="bold" fill="${ACCENT}" ${FONT}>${toMm(p.z)}</text>`,
      )
    }
  }

  // Точки и номера
  for (const p of e.points) {
    const cx = sx(p.x)
    const cy = sz(p.z)
    parts.push(pointSymbol(p, cx, cy, k))
    const bs = boxSize(p.node.kind)
    const nx = cx + Math.max(bs.w * k, 9) / 2 + 3
    const ny = cy - Math.max(bs.h * k, 9) / 2 - 2
    parts.push(
      `<circle cx="${nx + 5}" cy="${ny - 3}" r="6" fill="${INK}"/>`,
      `<text x="${nx + 5}" y="${ny}" text-anchor="middle" font-size="8" font-weight="bold" fill="#ffffff" ${FONT}>${p.no}</text>`,
    )
  }

  // Цепочки: точки — к центрам коробок, проёмы — по краям
  let cy = floorY + 26
  if (pointMarks.length) {
    parts.push(chain(pointMarks, L, cy, sx, ACCENT, true))
    parts.push(`<text x="${sx(L) + 8}" y="${cy + 3}" font-size="8" fill="${ACCENT}" ${FONT}>до центров</text>`)
    cy += 26
  }
  if (openMarks.length) {
    parts.push(chain(openMarks, L, cy, sx, DIM))
    parts.push(`<text x="${sx(L) + 8}" y="${cy + 3}" font-size="8" fill="${DIM}" ${FONT}>проёмы</text>`)
    cy += 26
  }
  parts.push(chain([], L, cy, sx, INK, true))
  parts.push(`<text x="${sx(L) + 8}" y="${cy + 3}" font-size="8" fill="${INK}" ${FONT}>стена</text>`)

  parts.push(keyPlan(e, width - 76, 4, 70))

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join("")}</svg>`
}

/** Строки ведомости точек стены — для таблицы под развёрткой */
export function elevationRows(e: WallElevation) {
  return e.points.map((p) => ({
    no: p.no,
    name: p.node.label || NODE_PRESETS[p.node.kind].label,
    kind: NODE_PRESETS[p.node.kind].label,
    fromLeft: toMm(p.x),
    fromRight: toMm(e.length - p.x),
    fromFloor: toMm(p.z),
    toCeiling: toMm(e.height - p.z),
    note: p.reveal
      ? `в откосе: ${OPENING_PRESETS[p.reveal.opening.kind].label.toLowerCase()}, глубина ${toMm(p.reveal.depth)} мм от лица стены`
      : p.node.mount
        ? ""
        : "не закреплена на стене — проверьте место",
  }))
}
