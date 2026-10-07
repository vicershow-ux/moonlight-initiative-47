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
  | "switch_pass"
  | "switch_pass_double"
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

/**
 * Линия между точками: кабель с сечением или труба с диаметром.
 * points — изломы трассы, которые расставил монтажник.
 * ortho — трасса идёт только по горизонталям и вертикалям (по умолчанию да)
 */
export interface PlanLink {
  id: string
  layer: Exclude<PlanLayer, "plan">
  fromId: string
  toId: string
  spec: string
  points: PlanPoint[]
  ortho?: boolean
  /** Группа щита, к которой относится кабель (только на слое электрики) */
  groupId?: string | null
}

/** Группа электрощита: номер на схеме, автомат и назначение */
export interface PlanGroup {
  id: string
  /** Номер группы — как подписан на щите: 1, 2, 3… */
  num: number
  name: string
  /** Номинал автомата, например «C16» */
  breaker: string
  /** Защита от утечки: обычный автомат, УЗО или дифавтомат */
  protection: "mcb" | "rcd" | "rcbo"
  /** Ток утечки для УЗО/дифавтомата, мА */
  leakage: number
  /** Дополнительные аппараты на линии после защиты — сверху вниз */
  devices?: LineDevice[]
}

/** Аппараты, которые можно поставить на линию группы после автомата */
export type LineDeviceKind =
  | "contactor"
  | "timer"
  | "impulse"
  | "switch"
  | "dimmer"
  | "thermostat"
  | "socket"
  | "lamp"

export interface LineDevice {
  id: string
  kind: LineDeviceKind
  /** Номинальный ток, А */
  rating: number
  /** Своя ширина в модулях, если у модели не типовая */
  modules?: number
}

export const LINE_DEVICE_INFO: Record<
  LineDeviceKind,
  { label: string; short: string; pos: string; ratings: number[]; modules: number }
> = {
  contactor: { label: "Контактор модульный", short: "контактор", pos: "KM", ratings: [16, 20, 25, 40, 63], modules: 1 },
  timer: { label: "Реле времени", short: "реле времени", pos: "KT", ratings: [16], modules: 1 },
  impulse: { label: "Импульсное реле", short: "импульсное реле", pos: "KI", ratings: [16], modules: 1 },
  switch: { label: "Выключатель модульный", short: "выключатель", pos: "SA", ratings: [16, 20, 32, 63], modules: 1 },
  dimmer: { label: "Диммер модульный", short: "диммер", pos: "UD", ratings: [2], modules: 2 },
  thermostat: { label: "Терморегулятор на DIN", short: "терморегулятор", pos: "SK", ratings: [16], modules: 2 },
  socket: { label: "Розетка на DIN-рейку", short: "розетка", pos: "XS", ratings: [16], modules: 3 },
  lamp: { label: "Индикатор наличия фазы", short: "индикатор", pos: "HL", ratings: [0], modules: 1 },
}

/**
 * Цвета сечений кабеля на однолинейной схеме — чтобы линии различались без подписей.
 * Насыщенные, хорошо различимые на белом листе и при чёрно-белой печати по толщине
 */
export const SECTION_STYLE: Record<string, { color: string; width: number }> = {
  "1.5 мм²": { color: "#1f77d0", width: 1.4 },
  "2.5 мм²": { color: "#2a9d3a", width: 1.8 },
  "4 мм²": { color: "#e08a00", width: 2.3 },
  "6 мм²": { color: "#d62f2f", width: 2.8 },
  "10 мм²": { color: "#7b3fc4", width: 3.3 },
}

export const sectionStyle = (spec: string) =>
  SECTION_STYLE[spec] || { color: "#161616", width: 1.4 }

/** Как считать кабель: трасса под потолком, спуски к точкам и запас на концы */
export interface CableSettings {
  /** Отступ трассы от потолка, м */
  traceFromCeiling: number
  /** Запас на разделку на каждом конце кабеля, м */
  endReserve: number
}

/** Аппараты, которые можно поставить на вводе щита — до шины групп */
export type InputDeviceKind =
  | "switch"
  | "breaker"
  | "meter"
  | "relay"
  | "rcd"
  | "rcbo"
  | "spd"

/**
 * Один аппарат на вводе. Порядок в списке — порядок по линии питания сверху вниз.
 * rating — номинальный ток, А; leakage — ток утечки, мА (для УЗО и дифавтомата)
 */
export interface InputDevice {
  id: string
  kind: InputDeviceKind
  rating: number
  /** Для автомата — характеристика B/C/D */
  curve?: "B" | "C" | "D"
  leakage?: number
  /** Счётчик: прямого включения или на DIN-рейку (у части моделей своё место) */
  meterType?: "din" | "panel"
  /** Своя ширина в модулях — если у выбранной модели она отличается от типовой */
  modules?: number
}

export const INPUT_DEVICE_INFO: Record<
  InputDeviceKind,
  { label: string; pos: string; ratings: number[] }
> = {
  switch: { label: "Выключатель нагрузки", pos: "QS", ratings: [25, 32, 40, 63, 80, 100] },
  breaker: { label: "Автомат вводной", pos: "QF", ratings: [16, 20, 25, 32, 40, 50, 63] },
  meter: { label: "Электросчётчик", pos: "PI", ratings: [60, 80, 100] },
  relay: { label: "Реле напряжения", pos: "KV", ratings: [32, 40, 50, 63, 80] },
  rcd: { label: "УЗО", pos: "QD", ratings: [25, 40, 63, 80, 100] },
  rcbo: { label: "Дифавтомат", pos: "QFD", ratings: [16, 20, 25, 32, 40] },
  spd: { label: "УЗИП (защита от перенапряжения)", pos: "FV", ratings: [0] },
}

/** Вводная часть щита — для однолинейной схемы */
export interface PanelSettings {
  /** Обозначение щита на схеме, например «ЩР-1» */
  name: string
  phases: 1 | 3
  /** Сечение вводного кабеля */
  inputCable: string
  /** Аппараты ввода сверху вниз */
  devices: InputDevice[]
  /** Устарело: раньше ввод задавался этими полями, сейчас — списком devices */
  inputBreaker?: string
  mainRcd?: 0 | 100 | 300
}

export const DEFAULT_PANEL: PanelSettings = {
  name: "ЩР-1",
  phases: 1,
  inputCable: "10 мм²",
  devices: [
    { id: "in-meter", kind: "meter", rating: 80, meterType: "din" },
    { id: "in-qf", kind: "breaker", rating: 40, curve: "C" },
    { id: "in-relay", kind: "relay", rating: 63 },
  ],
}

export const INPUT_CABLES = ["6 мм²", "10 мм²", "16 мм²", "25 мм²"]

export interface PlanScheme {
  version: 1
  rooms: PlanRoom[]
  openings: PlanOpening[]
  defaultHeight: number
  nodes?: PlanNode[]
  links?: PlanLink[]
  groups?: PlanGroup[]
  cable?: CableSettings
  panel?: PanelSettings
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
  switch_pass: { label: "Выключатель проходной", layer: "electric", height: 0.9, color: "#A6E07A", icon: "ToggleRight" },
  switch_pass_double: { label: "Проходной двойной", layer: "electric", height: 0.9, color: "#8FCF5C", icon: "ToggleRight" },
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

/** Номиналы автоматов, которые чаще всего ставят в квартирный щит */
export const BREAKERS = ["B6", "B10", "C6", "C10", "C16", "C20", "C25", "C32", "C40", "C50", "C63"]

export const PROTECTION_LABELS: Record<PlanGroup["protection"], string> = {
  mcb: "Автомат",
  rcd: "Автомат + УЗО",
  rcbo: "Дифавтомат",
}

/**
 * Какое минимальное сечение медного кабеля нужно под автомат.
 * Используется только для подсказки, решение остаётся за электриком
 */
export const MIN_SECTION: Record<string, number> = {
  B6: 1.5, B10: 1.5, C6: 1.5, C10: 1.5,
  C16: 2.5, C20: 2.5, C25: 4, C32: 6, C40: 10, C50: 10, C63: 16,
}

export const breakerAmps = (b: string) => Number(String(b).replace(/[^0-9.]/g, "")) || 0
export const sectionOf = (spec: string) => Number(String(spec).replace(",", ".").replace(/[^0-9.]/g, "")) || 0

/** Цвета групп на схеме — чтобы трассы разных групп различались на глаз */
export const GROUP_COLORS = [
  "#E8B23A", "#5EB8F0", "#7BD47B", "#F07E7E", "#C08BF0",
  "#F0A35E", "#4FD1C5", "#E87FC0", "#B8C94A", "#9AA5FF",
]
export const groupColor = (num: number) => GROUP_COLORS[(Math.max(num, 1) - 1) % GROUP_COLORS.length]

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
  groups: [],
})