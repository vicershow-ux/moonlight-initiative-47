import {
  CEILING_FINISHES,
  FLOOR_FINISHES,
  PlanRoom,
  PlanScheme,
  RoomFinish,
  WALL_FINISHES,
  roomFinish,
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
  const tileOpenings = ops.reduce((s, o) => {
    const bottom = o.kind === "window" ? o.sill || 0 : 0
    const overlap = Math.max(0, Math.min(bottom + o.height, tileH) - bottom)
    return s + overlap * o.width
  }, 0)
  const wallTile = tileH > 0 ? Math.max(perimeter * tileH - tileOpenings, 0) : 0
  const wallMain = f.wall === "tile" ? 0 : Math.max(wallNet - wallTile, 0)

  // Обои — полосами: высота полосы = высота стены над плиткой + раппорт + 5 см на подрезку
  const stripH = height - (f.wall === "tile" ? 0 : tileH) + (f.rapport || 0) + 0.05
  const stripsPerRoll = f.wall === "wallpaper" && stripH > 0 ? Math.max(Math.floor((f.rollLength || 10.05) / stripH), 1) : 0
  const openPerim = Math.max(perimeter - ops.reduce((s, o) => s + (o.kind === "window" ? o.width * 0.5 : o.width * 0.8), 0), 0)
  const strips = f.wall === "wallpaper" ? Math.ceil(openPerim / (f.rollWidth || 1.06)) : 0
  const rolls = stripsPerRoll ? Math.ceil(strips / stripsPerRoll) : 0

  const coats = f.paintCoats || 2
  const paintWall = f.wall === "paint" ? wallMain * coats * PAINT_L_PER_M2 : 0
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
    wallTile,
    wallMain,
    stripsPerRoll,
    rolls,
    paintWall,
    paintCeiling,
    ceilingArea,
    skirting,
    cornice,
  }
}

export const hasFinish = (f: RoomFinish) => f.floor !== "none" || f.wall !== "none" || f.ceiling !== "none" || (f.tileHeight || 0) > 0

/** Короткое описание отделки помещения для подписи и PDF */
export function finishSummary(f: RoomFinish): string {
  const parts: string[] = []
  if (f.floor !== "none") parts.push(`пол — ${FLOOR_FINISHES[f.floor].label.toLowerCase()}`)
  if (f.wall !== "none") parts.push(`стены — ${WALL_FINISHES[f.wall].label.toLowerCase()}`)
  if (f.wall !== "tile" && (f.tileHeight || 0) > 0) parts.push(`плитка до ${Math.round((f.tileHeight || 0) * 1000)} мм`)
  if (f.ceiling !== "none") parts.push(`потолок — ${CEILING_FINISHES[f.ceiling].label.toLowerCase()}`)
  return parts.join(", ")
}
