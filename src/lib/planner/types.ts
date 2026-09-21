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

export type PlanLayer = "plan" | "electric" | "plumbing"

export type NodeKind =
  | "panel"
  | "junction"
  | "socket"
  | "socket_power"
  | "switch"
  | "switch_double"
  | "light"
  | "spot"
  | "water_in"
  | "water_hot"
  | "water_cold"
  | "sewer"
  | "mixer"
  | "toilet"
  | "sink"
  | "boiler"
  | "radiator"

/** Точка на схеме: щит, розетка, выключатель, вывод воды и т.п. */
export interface PlanNode {
  id: string
  layer: Exclude<PlanLayer, "plan">
  kind: NodeKind
  x: number
  y: number
  height: number
  label: string
  roomId: string | null
}

/** Линия между точками: кабель с сечением или труба с диаметром */
export interface PlanLink {
  id: string
  layer: Exclude<PlanLayer, "plan">
  fromId: string
  toId: string
  spec: string
  points: PlanPoint[]
}

export interface PlanScheme {
  version: 1
  rooms: PlanRoom[]
  openings: PlanOpening[]
  defaultHeight: number
  nodes?: PlanNode[]
  links?: PlanLink[]
}

export const LAYERS: { value: PlanLayer; label: string; icon: string }[] = [
  { value: "plan", label: "Планировка", icon: "Ruler" },
  { value: "electric", label: "Электрика", icon: "Zap" },
  { value: "plumbing", label: "Сантехника", icon: "Droplets" },
]

export const NODE_PRESETS: Record<
  NodeKind,
  { label: string; layer: Exclude<PlanLayer, "plan">; height: number; color: string; icon: string }
> = {
  panel: { label: "Щит", layer: "electric", height: 1.6, color: "#E8B23A", icon: "LayoutGrid" },
  junction: { label: "Распаячная коробка", layer: "electric", height: 2.3, color: "#E8B23A", icon: "Box" },
  socket: { label: "Розетка", layer: "electric", height: 0.3, color: "#7FB5E8", icon: "Plug" },
  socket_power: { label: "Розетка силовая", layer: "electric", height: 0.3, color: "#5E93D6", icon: "PlugZap" },
  switch: { label: "Выключатель", layer: "electric", height: 0.9, color: "#8BD48B", icon: "ToggleRight" },
  switch_double: { label: "Выключатель двойной", layer: "electric", height: 0.9, color: "#6DBF6D", icon: "ToggleRight" },
  light: { label: "Светильник", layer: "electric", height: 2.7, color: "#F2DC7E", icon: "Lightbulb" },
  spot: { label: "Точечный светильник", layer: "electric", height: 2.7, color: "#F2DC7E", icon: "Circle" },

  water_in: { label: "Ввод воды", layer: "plumbing", height: 0.4, color: "#7FB5E8", icon: "Pipette" },
  water_hot: { label: "Горячая вода", layer: "plumbing", height: 0.6, color: "#E87F7F", icon: "Flame" },
  water_cold: { label: "Холодная вода", layer: "plumbing", height: 0.6, color: "#7FB5E8", icon: "Snowflake" },
  sewer: { label: "Канализация", layer: "plumbing", height: 0.1, color: "#A88C6A", icon: "ArrowDownToLine" },
  mixer: { label: "Смеситель", layer: "plumbing", height: 1.1, color: "#9FD4E8", icon: "ShowerHead" },
  toilet: { label: "Унитаз", layer: "plumbing", height: 0.2, color: "#C9C9C9", icon: "Toilet" },
  sink: { label: "Раковина", layer: "plumbing", height: 0.85, color: "#C9C9C9", icon: "CookingPot" },
  boiler: { label: "Водонагреватель", layer: "plumbing", height: 1.8, color: "#E8B23A", icon: "Cylinder" },
  radiator: { label: "Радиатор", layer: "plumbing", height: 0.5, color: "#E8A87F", icon: "Radiation" },
}

/** Сечения кабеля и диаметры труб — подставляются в подпись линии */
export const LINK_SPECS: Record<Exclude<PlanLayer, "plan">, string[]> = {
  electric: ["1.5 мм²", "2.5 мм²", "4 мм²", "6 мм²", "10 мм²"],
  plumbing: ["16 мм", "20 мм", "25 мм", "32 мм", "40 мм", "50 мм", "110 мм"],
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
  nodes: [],
  links: [],
})