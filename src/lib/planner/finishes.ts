import {
  CEILING_FINISHES,
  FLOOR_FINISHES,
  PlanRoom,
  PlanScheme,
  RoomFinish,
  WALL_FINISHES,
  WallOverride,
  roomFinish,
  wallFinishOf,
} from "./types"
import { openingArea, polygonArea, polygonPerimeter, wallSegments } from "./geometry"

export interface FinishCalc {
  room: PlanRoom
  finish: RoomFinish
  floorArea: number
  perimeter: number
  /** Ширина дверных проёмов — плинтус в них не кладут, м */
  doorWidth: number
  wallGross: number
  openings: number
  wallNet: number
  /** Площадь плитки на стенах, м² */
  wallTile: number
  /** Площадь под основную отделку стен (обои/краска) за вычетом плитки, м² */
  wallMain: number
  /** Обои: полос из рулона, рулонов */
  stripsPerRoll: number
  rolls: number
  /** Покраска стен и потолка, л */
  paintWall: number
  paintCeiling: number
  ceilingArea: number
  skirting: number
  cornice: number
  /** Расчёт по каждой стене — с учётом акцентных */
  walls: WallCalc[]
  /** Группы одинаковой отделки стен: обои одного рулона, краска одного цвета — для сметы */
  groups: WallGroup[]
}

export interface WallCalc {
  id: string
  index: number
  length: number
  finish: WallOverride & { own: boolean }
  /** Площадь без проёмов, м² */
  net: number
  /** Плитка до высоты на этой стене, м² */
  tile: number
  /** Под основную отделку, м² */
  main: number
  /** Ширина стены по полосам обоев за вычетом проёмов, м */
  stripRun: number
}

export interface WallGroup {
  key: string
  finish: WallOverride
  walls: number[]
  main: number
  /** Обои: полос из рулона, рулонов */
  stripsPerRoll: number
  rolls: number
  /** Краска, л */
  paint: number
  accent: boolean
}

/** Расход краски за слой, л/м² — типовой для водно-дисперсионных */
export const PAINT_L_PER_M2 = 0.12

/** Расчёт отделки помещения: пол, стены (обои, краска, плитка), потолок, плинтусы */
export function finishCalc(scheme: PlanScheme, room: PlanRoom): FinishCalc {
  const f = roomFinish(scheme, room.id)
  const segs = wallSegments(room)
  const ids = new Set(segs.map((s) => s.id))
  const ops = scheme.openings.filter((o) => ids.has(o.wallId))
  const floorArea = Math.abs(polygonArea(room.points))
  const perimeter = room.points.length > 2 ? polygonPerimeter(room.points) : 0
  const height = room.height || scheme.defaultHeight
  const doorWidth = ops.filter((o) => o.kind !== "window").reduce((s, o) => s + o.width, 0)
  const wallGross = perimeter * height
  const openings = ops.reduce((s, o) => s + openingArea(o), 0)
  const wallNet = Math.max(wallGross - openings, 0)

  // Плитка на всю высоту или до заданной высоты (фартук, панель в санузле)
  const tileH = f.wall === "tile" ? height : Math.min(f.tileHeight || 0, height)
  // По стенам: у акцентной стены свой материал. Плитка до высоты — общая для комнаты
  const coats = f.paintCoats || 2
  const walls: WallCalc[] = segs.map((seg, index) => {
    const wf = wallFinishOf(f, seg.id)
    const wops = ops.filter((o) => o.wallId === seg.id)
    const net = Math.max(seg.length * height - wops.reduce((a, o) => a + openingArea(o), 0), 0)
    const th = wf.wall === "tile" ? height : tileH
    const tOps = wops.reduce((a, o) => {
      const bottom = o.kind === "window" ? o.sill || 0 : 0
      return a + Math.max(0, Math.min(bottom + o.height, th) - bottom) * o.width
    }, 0)
    const tile = th > 0 ? Math.max(seg.length * th - tOps, 0) : 0
    const main = wf.wall === "tile" || wf.wall === "none" ? 0 : Math.max(net - tile, 0)
    const stripRun = Math.max(seg.length - wops.reduce((a, o) => a + (o.kind === "window" ? o.width * 0.5 : o.width * 0.8), 0), 0)
    return { id: seg.id, index, length: seg.length, finish: wf, net, tile, main, stripRun }
  })

  const groupsMap = new Map<string, WallGroup>()
  const runs = new Map<string, number>()
  for (const w of walls) {
    const wf = w.finish
    if (wf.wall === "none" || wf.wall === "tile") continue
    const key =
      wf.wall === "wallpaper"
        ? `wp|${wf.rollWidth || 1.06}|${wf.rollLength || 10.05}|${wf.rapport || 0}|${wf.own ? wf.note || w.id : ""}`
        : `${wf.wall}|${(wf.wallColor || "").toLowerCase()}|${wf.own ? wf.note || "" : ""}`
    const keyM = wf.material ? `${key}|m${wf.material.id}` : key
    const g = groupsMap.get(keyM) || { key: keyM, finish: wf, walls: [], main: 0, stripsPerRoll: 0, rolls: 0, paint: 0, accent: wf.own }
    g.walls.push(w.index + 1)
    g.main += w.main
    runs.set(keyM, (runs.get(keyM) || 0) + w.stripRun)
    g.accent = g.accent || wf.own
    groupsMap.set(keyM, g)
  }
  const groups = [...groupsMap.values()].map((g) => {
    const run = runs.get(g.key) || 0
    if (g.finish.wall === "wallpaper") {
      // Обои — полосами: высота полосы = высота стены над плиткой + раппорт + 5 см на подрезку
      const stripH = height - tileH + (g.finish.rapport || 0) + 0.05
      g.stripsPerRoll = stripH > 0 ? Math.max(Math.floor((g.finish.rollLength || 10.05) / stripH), 1) : 0
      const strips = Math.ceil(run / (g.finish.rollWidth || 1.06))
      g.rolls = g.stripsPerRoll ? Math.ceil(strips / g.stripsPerRoll) : 0
    }
    if (g.finish.wall === "paint") g.paint = g.main * coats * PAINT_L_PER_M2
    return g
  })

  const wallTileAll = walls.reduce((a, w) => a + w.tile, 0)
  const wallMainAll = walls.reduce((a, w) => a + w.main, 0)
  const wp = groups.filter((g) => g.finish.wall === "wallpaper")
  const stripsPerRoll = wp[0]?.stripsPerRoll || 0
  const rolls = wp.reduce((a, g) => a + g.rolls, 0)

  const paintWall = groups.filter((g) => g.finish.wall === "paint").reduce((a, g) => a + g.paint, 0)
  const ceilingArea = floorArea
  const paintCeiling = f.ceiling === "paint" || f.ceiling === "gkl" ? ceilingArea * coats * PAINT_L_PER_M2 : 0
  const skirting = f.skirting && f.floor !== "none" ? Math.max(perimeter - doorWidth, 0) : 0
  const cornice = f.cornice ? perimeter : 0

  return {
    room,
    finish: f,
    floorArea,
    perimeter,
    doorWidth,
    wallGross,
    openings,
    wallNet,
    wallTile: wallTileAll,
    wallMain: wallMainAll,
    stripsPerRoll,
    rolls,
    paintWall,
    paintCeiling,
    ceilingArea,
    skirting,
    cornice,
    walls,
    groups,
  }
}

export const hasFinish = (f: RoomFinish) =>
  f.floor !== "none" || f.wall !== "none" || f.ceiling !== "none" || (f.tileHeight || 0) > 0 || Object.keys(f.walls || {}).length > 0

/** Короткое описание отделки помещения для подписи и PDF */
export function finishSummary(f: RoomFinish): string {
  const parts: string[] = []
  if (f.floor !== "none") parts.push(`пол — ${FLOOR_FINISHES[f.floor].label.toLowerCase()}`)
  if (f.wall !== "none") parts.push(`стены — ${WALL_FINISHES[f.wall].label.toLowerCase()}`)
  if (f.wall !== "tile" && (f.tileHeight || 0) > 0) parts.push(`плитка до ${Math.round((f.tileHeight || 0) * 1000)} мм`)
  const acc = Object.values(f.walls || {})
  if (acc.length) parts.push(`${acc.length === 1 ? "акцентная стена" : `${acc.length} акцентные стены`} — ${[...new Set(acc.map((a) => WALL_FINISHES[a.wall].label.toLowerCase()))].join(", ")}`)
  if (f.ceiling !== "none") parts.push(`потолок — ${CEILING_FINISHES[f.ceiling].label.toLowerCase()}`)
  return parts.join(", ")
}
