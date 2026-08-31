export interface PlanPoint {
  x: number
  y: number
}

export type OpeningKind = "window" | "door" | "arch"

export interface PlanOpening {
  id: string
  kind: OpeningKind
  wallId: string
  offset: number
  width: number
  height: number
  sill: number
}

export interface PlanWall {
  id: string
  a: PlanPoint
  b: PlanPoint
  roomId: string
}

export interface PlanRoom {
  id: string
  name: string
  room_type: string
  points: PlanPoint[]
  height: number
  notes: string
}

export interface PlanScheme {
  version: 1
  rooms: PlanRoom[]
  openings: PlanOpening[]
  defaultHeight: number
}

export interface RoomMetrics {
  id: string
  name: string
  room_type: string
  height: number
  area: number
  perimeter: number
  wallAreaGross: number
  openingsArea: number
  wallAreaNet: number
  windows: number
  doors: number
  wallCount: number
}

export interface PlanTotals {
  floor: number
  ceiling: number
  wall: number
  wallNet: number
  perimeter: number
  openingsArea: number
  windows: number
  doors: number
  rooms: number
}

export const ROOM_TYPES = [
  "Ванная",
  "Санузел",
  "Кухня",
  "Спальня",
  "Гостиная",
  "Прихожая",
  "Коридор",
  "Балкон/лоджия",
  "Кладовая",
  "Детская",
  "Кабинет",
]

export const OPENING_PRESETS: Record<
  OpeningKind,
  { label: string; width: number; height: number; sill: number }
> = {
  window: { label: "Окно", width: 1.4, height: 1.4, sill: 0.9 },
  door: { label: "Дверь", width: 0.9, height: 2.1, sill: 0 },
  arch: { label: "Проём", width: 1.2, height: 2.1, sill: 0 },
}

export const emptyScheme = (): PlanScheme => ({
  version: 1,
  rooms: [],
  openings: [],
  defaultHeight: 2.7,
})
