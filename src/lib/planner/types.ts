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
  /** Двери: петли у начала или у конца проёма по ходу стены */
  hinge?: "start" | "end"
  /** Двери: открывание в помещение или наружу */
  swing?: "in" | "out"
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

export type PlanLayer = "plan" | "interior" | "electric" | "plumbing"
/** Инженерные слои — на них ставятся точки и прокладываются линии */
export type EngLayer = "electric" | "plumbing"
export const isEngLayer = (l: PlanLayer): l is EngLayer => l === "electric" || l === "plumbing"

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
  | "thermostat"
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
  layer: EngLayer
  kind: NodeKind
  x: number
  y: number
  height: number
  label: string
  roomId: string | null
  /** Привязка к стене или откосу проёма; x/y пересчитываются из неё */
  mount?: NodeMount | null
}

/**
 * Где закреплена точка: на внутренней грани стены или в откосе проёма.
 * offset — расстояние вдоль стены от её начала, м.
 * В откосе: side — у какого края проёма (начало/конец по ходу стены),
 * depth — глубина от внутренней грани стены, м
 */
export interface NodeMount {
  wallId: string
  offset: number
  place: "wall" | "reveal"
  openingId?: string
  side?: "start" | "end"
  depth?: number
}

export type WallMaterial =
  | "brick"
  | "concrete"
  | "aerated"
  | "block"
  | "pgp"
  | "gkl"
  | "wood"

export interface WallProps {
  /** Толщина, м */
  thickness: number
  material: WallMaterial
}

export const WALL_MATERIALS: Record<
  WallMaterial,
  { label: string; thicknesses: number[]; color: string }
> = {
  brick: { label: "Кирпич", thicknesses: [0.12, 0.25, 0.38, 0.51, 0.64], color: "#D2553A" },
  concrete: { label: "Бетон / монолит", thicknesses: [0.16, 0.18, 0.2, 0.25, 0.3], color: "#7B8794" },
  aerated: { label: "Газобетон", thicknesses: [0.1, 0.15, 0.2, 0.3, 0.375, 0.4], color: "#EBD95E" },
  block: { label: "Керамзито- / шлакоблок", thicknesses: [0.09, 0.19, 0.39], color: "#8B5A34" },
  pgp: { label: "Пазогребневые плиты", thicknesses: [0.08, 0.1], color: "#F4F4F4" },
  gkl: { label: "Гипсокартон на каркасе", thicknesses: [0.075, 0.1, 0.125, 0.15], color: "#4FA3E8" },
  wood: { label: "Дерево / брус", thicknesses: [0.1, 0.15, 0.2], color: "#E39A3B" },
}

export const DEFAULT_WALL: WallProps = { thickness: 0.25, material: "brick" }

/**
 * Линия между точками: кабель с сечением или труба с диаметром.
 * points — изломы трассы, которые расставил монтажник.
 * ortho — трасса идёт только по горизонталям и вертикалям (по умолчанию да)
 */
export interface PlanLink {
  id: string
  layer: EngLayer
  fromId: string
  toId: string
  spec: string
  points: PlanPoint[]
  ortho?: boolean
  /** Группа щита, к которой относится кабель (только на слое электрики) */
  groupId?: string | null
  /** Способ прокладки; не задан — берётся способ по умолчанию из настроек кабеля */
  laying?: LayingMethod
}

/** Способ прокладки кабеля — от него зависит крепёж в смете */
export type LayingMethod = "chase" | "tray" | "duct" | "corrugated"

export const LAYING_METHODS: Record<LayingMethod, { label: string; hint: string }> = {
  chase: { label: "В штробе", hint: "дюбель-хомуты, стяжки при 2 кабелях в штробе" },
  tray: { label: "В лотке", hint: "лоток, болты, гайки и пресс-шайбы" },
  duct: { label: "В кабель-канале", hint: "кабель-канал, дюбель-гвоздь 6 мм и бур 6 мм" },
  corrugated: { label: "В гофре", hint: "гофра, клипсы, дюбель-гвозди или саморезы, стяжки" },
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
  /** Расчётная мощность группы, кВт; не задана — оценивается по точкам */
  power?: number
  /** Фаза при трёхфазном вводе; не задана — распределяется автоматически */
  phase?: Phase | null
}

export type Phase = "L1" | "L2" | "L3"
export const PHASES: Phase[] = ["L1", "L2", "L3"]

/** Цвета фаз по ГОСТ: L1 коричневый, L2 чёрный, L3 серый */
export const PHASE_COLORS: Record<Phase, string> = {
  L1: "#8B4A1C",
  L2: "#161616",
  L3: "#8A8A8A",
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
  /** Способ прокладки по умолчанию для всех трасс */
  laying?: LayingMethod
  /** Для гофры: крепить на дюбель-гвозди (бетон, кирпич) или саморезы (дерево, ГКЛ) */
  corrugatedFix?: "dowel" | "screw"
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

/**
 * Линейные элементы потолка: магнитный трек (отрезок a–b)
 * и парящий потолок (светящийся контур с отступом от стен помещения)
 */
export type FixtureKind = "track" | "floating"

export interface PlanFixture {
  id: string
  kind: FixtureKind
  a: PlanPoint
  b: PlanPoint
  roomId: string | null
  label: string
  /** Высота установки от пола, м */
  height: number
  /** Парящий потолок: отступ контура от стен, м */
  offset?: number
  /** Трек: повороты под 90° между началом a и концом b */
  points?: PlanPoint[]
}

/** Мощности для подбора блоков питания трековых светильников и ленты */
export interface LightingSettings {
  /** Светильники на метр магнитного трека, Вт/м */
  trackWPerM: number
  /** Светодиодная лента парящего потолка, Вт/м */
  stripWPerM: number
  /** Запас мощности блока питания, % */
  psuReserve: number
}

export const DEFAULT_LIGHTING: LightingSettings = { trackWPerM: 20, stripWPerM: 14.4, psuReserve: 25 }

export const lightingSettings = (l?: Partial<LightingSettings> | null): LightingSettings => ({ ...DEFAULT_LIGHTING, ...(l || {}) })

export const FIXTURE_PRESETS: Record<FixtureKind, { label: string; code: string; height: number; icon: string }> = {
  track: { label: "Магнитный трек", code: "Тр", height: 2.7, icon: "Minus" },
  floating: { label: "Парящий потолок", code: "ПП", height: 2.7, icon: "Square" },
}

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
  /** Толщина и материал стен по id стены «помещение:номер» */
  walls?: Record<string, WallProps>
  /** Магнитные треки и парящие потолки — слой электрики */
  fixtures?: PlanFixture[]
  /** Мощности трековых светильников и ленты для сметы */
  lighting?: LightingSettings
  /** Мебель и сантехника на плане */
  furniture?: PlanFurniture[]
  /** Зоны тёплого пола */
  heating?: PlanHeating[]
  /** Отделка помещений по id помещения */
  finishes?: Record<string, RoomFinish>
  /** Снимки 3D-вида комнат для PDF: по id помещения — несколько ракурсов */
  renders?: Record<string, RoomRender[]>
}

export interface RoomRender {
  id: string
  url: string
  /** Когда снят — чтобы понимать, актуален ли вид после правок */
  at: string
}

// ——— Мебель ———

export type FurnitureKind =
  | "bed_double" | "bed_single" | "sofa" | "armchair" | "wardrobe" | "dresser" | "nightstand"
  | "table" | "desk" | "chair" | "tv_stand" | "shelf"
  | "kitchen_base" | "kitchen_wall" | "fridge" | "stove" | "sink_kitchen" | "dishwasher"
  | "bath" | "shower" | "toilet_f" | "washbasin" | "washer" | "boiler_f" | "towel_rail"
  | "custom"

export interface FurniturePreset {
  label: string
  group: "Спальня" | "Гостиная" | "Кухня" | "Санузел" | "Прочее"
  /** Ширина × глубина × высота, м */
  w: number
  d: number
  h: number
  /** Стоит у стены — при расстановке прилипает тыльной стороной */
  wall: boolean
  /** Под ним нельзя класть тёплый пол */
  blocksHeating: boolean
  /** Закрывает розетки и выключатели на стене за собой */
  blocksSockets: boolean
}

export const FURNITURE_PRESETS: Record<FurnitureKind, FurniturePreset> = {
  bed_double: { label: "Кровать двуспальная", group: "Спальня", w: 1.6, d: 2.0, h: 0.5, wall: true, blocksHeating: true, blocksSockets: false },
  bed_single: { label: "Кровать односпальная", group: "Спальня", w: 0.9, d: 2.0, h: 0.5, wall: true, blocksHeating: true, blocksSockets: false },
  wardrobe: { label: "Шкаф", group: "Спальня", w: 1.8, d: 0.6, h: 2.4, wall: true, blocksHeating: true, blocksSockets: true },
  dresser: { label: "Комод", group: "Спальня", w: 1.0, d: 0.45, h: 0.85, wall: true, blocksHeating: true, blocksSockets: false },
  nightstand: { label: "Тумба прикроватная", group: "Спальня", w: 0.45, d: 0.4, h: 0.5, wall: true, blocksHeating: false, blocksSockets: false },
  sofa: { label: "Диван", group: "Гостиная", w: 2.2, d: 0.95, h: 0.85, wall: true, blocksHeating: true, blocksSockets: false },
  armchair: { label: "Кресло", group: "Гостиная", w: 0.85, d: 0.85, h: 0.85, wall: false, blocksHeating: false, blocksSockets: false },
  table: { label: "Стол обеденный", group: "Гостиная", w: 1.4, d: 0.85, h: 0.75, wall: false, blocksHeating: false, blocksSockets: false },
  desk: { label: "Стол письменный", group: "Гостиная", w: 1.2, d: 0.6, h: 0.75, wall: true, blocksHeating: false, blocksSockets: false },
  chair: { label: "Стул", group: "Гостиная", w: 0.45, d: 0.5, h: 0.9, wall: false, blocksHeating: false, blocksSockets: false },
  tv_stand: { label: "ТВ-тумба", group: "Гостиная", w: 1.8, d: 0.4, h: 0.5, wall: true, blocksHeating: true, blocksSockets: false },
  shelf: { label: "Стеллаж", group: "Гостиная", w: 0.8, d: 0.35, h: 2.0, wall: true, blocksHeating: true, blocksSockets: true },
  kitchen_base: { label: "Кухня нижние шкафы", group: "Кухня", w: 2.4, d: 0.6, h: 0.9, wall: true, blocksHeating: true, blocksSockets: true },
  kitchen_wall: { label: "Кухня верхние шкафы", group: "Кухня", w: 2.4, d: 0.32, h: 0.7, wall: true, blocksHeating: false, blocksSockets: false },
  fridge: { label: "Холодильник", group: "Кухня", w: 0.6, d: 0.65, h: 1.9, wall: true, blocksHeating: true, blocksSockets: false },
  stove: { label: "Плита / варочная", group: "Кухня", w: 0.6, d: 0.6, h: 0.9, wall: true, blocksHeating: true, blocksSockets: true },
  sink_kitchen: { label: "Мойка кухонная", group: "Кухня", w: 0.8, d: 0.6, h: 0.9, wall: true, blocksHeating: true, blocksSockets: true },
  dishwasher: { label: "Посудомойка", group: "Кухня", w: 0.6, d: 0.6, h: 0.85, wall: true, blocksHeating: true, blocksSockets: false },
  bath: { label: "Ванна", group: "Санузел", w: 1.7, d: 0.75, h: 0.6, wall: true, blocksHeating: true, blocksSockets: true },
  shower: { label: "Душевой поддон", group: "Санузел", w: 0.9, d: 0.9, h: 0.15, wall: true, blocksHeating: true, blocksSockets: true },
  toilet_f: { label: "Унитаз", group: "Санузел", w: 0.38, d: 0.65, h: 0.4, wall: true, blocksHeating: true, blocksSockets: false },
  washbasin: { label: "Раковина с тумбой", group: "Санузел", w: 0.6, d: 0.48, h: 0.85, wall: true, blocksHeating: true, blocksSockets: false },
  washer: { label: "Стиральная машина", group: "Санузел", w: 0.6, d: 0.6, h: 0.85, wall: true, blocksHeating: true, blocksSockets: false },
  boiler_f: { label: "Водонагреватель", group: "Санузел", w: 0.45, d: 0.45, h: 0.8, wall: true, blocksHeating: false, blocksSockets: false },
  towel_rail: { label: "Полотенцесушитель", group: "Санузел", w: 0.5, d: 0.12, h: 0.8, wall: true, blocksHeating: false, blocksSockets: false },
  custom: { label: "Свой предмет", group: "Прочее", w: 1.0, d: 0.6, h: 0.8, wall: false, blocksHeating: true, blocksSockets: false },
}

export interface PlanFurniture {
  id: string
  kind: FurnitureKind
  /** Центр, м */
  x: number
  y: number
  /** Ширина вдоль «лица», глубина от стены, высота, м */
  w: number
  d: number
  h: number
  /** Поворот, градусы: 0 — тыльной стороной вверх (к стене с меньшим Y) */
  rot: number
  label: string
  roomId: string | null
}

// ——— Тёплый пол ———

export type HeatingKind = "mat" | "cable" | "film" | "water"

export const HEATING_PRESETS: Record<
  HeatingKind,
  { label: string; hint: string; power: number; step?: number; color: string }
> = {
  mat: { label: "Нагревательный мат", hint: "в клей под плитку", power: 150, color: "#f97316" },
  cable: { label: "Нагревательный кабель", hint: "в стяжку", power: 150, step: 0.1, color: "#ef4444" },
  film: { label: "Плёночный (ИК)", hint: "под ламинат и паркет", power: 150, color: "#eab308" },
  water: { label: "Водяной", hint: "трубы в стяжке, коллектор", power: 80, step: 0.15, color: "#38bdf8" },
}

export interface PlanHeating {
  id: string
  kind: HeatingKind
  /** Контур зоны, м */
  points: PlanPoint[]
  roomId: string | null
  /** Удельная мощность, Вт/м² (у водяного — расчётная теплоотдача) */
  power: number
  /** Шаг укладки кабеля или трубы, м */
  step?: number
  /** Вырезать места под мебелью, которая не пропускает тепло */
  cutFurniture: boolean
  label: string
  /** Терморегулятор, который управляет зоной (точка на слое «Электрика») */
  thermostatId?: string | null
}

// ——— Отделка ———

export type FloorFinish = "none" | "parquet" | "laminate" | "engineered" | "tile" | "porcelain" | "linoleum" | "vinyl" | "carpet"
export type WallFinish = "none" | "wallpaper" | "paint" | "tile" | "plaster" | "panels"
export type CeilingFinish = "none" | "paint" | "stretch" | "gkl" | "rack"

export interface FinishInfo {
  label: string
  color: string
  /** Запас на подрезку, доля */
  waste: number
}

export const FLOOR_FINISHES: Record<FloorFinish, FinishInfo & { pattern: "planks" | "tiles" | "plain" | "herring" }> = {
  none: { label: "Не задано", color: "transparent", waste: 0, pattern: "plain" },
  parquet: { label: "Паркет (ёлочка)", color: "#b5834a", waste: 0.15, pattern: "herring" },
  engineered: { label: "Инженерная доска", color: "#a8794a", waste: 0.08, pattern: "planks" },
  laminate: { label: "Ламинат", color: "#c49a6c", waste: 0.07, pattern: "planks" },
  vinyl: { label: "Кварцвинил (SPC)", color: "#b9a58a", waste: 0.07, pattern: "planks" },
  tile: { label: "Плитка керамическая", color: "#cfd6dc", waste: 0.1, pattern: "tiles" },
  porcelain: { label: "Керамогранит", color: "#9aa3aa", waste: 0.1, pattern: "tiles" },
  linoleum: { label: "Линолеум", color: "#9fb8a8", waste: 0.05, pattern: "plain" },
  carpet: { label: "Ковролин", color: "#8e8aa8", waste: 0.05, pattern: "plain" },
}

export const WALL_FINISHES: Record<WallFinish, FinishInfo> = {
  none: { label: "Не задано", color: "#888888", waste: 0 },
  wallpaper: { label: "Обои", color: "#c084fc", waste: 0 },
  paint: { label: "Покраска", color: "#60a5fa", waste: 0 },
  tile: { label: "Плитка", color: "#2dd4bf", waste: 0.1 },
  plaster: { label: "Декоративная штукатурка", color: "#f59e0b", waste: 0.05 },
  panels: { label: "Стеновые панели", color: "#a3e635", waste: 0.08 },
}

export const CEILING_FINISHES: Record<CeilingFinish, FinishInfo> = {
  none: { label: "Не задано", color: "#888888", waste: 0 },
  paint: { label: "Покраска", color: "#e5e7eb", waste: 0 },
  stretch: { label: "Натяжной", color: "#f0f9ff", waste: 0 },
  gkl: { label: "ГКЛ под покраску", color: "#e2e8f0", waste: 0.1 },
  rack: { label: "Реечный", color: "#cbd5e1", waste: 0.1 },
}

export interface RoomFinish {
  floor: FloorFinish
  /** Цвет пола для визуализации (если свой) */
  floorColor?: string
  wall: WallFinish
  wallColor?: string
  /** Плитка на стенах до высоты, м (для санузла — на всю, для кухни — фартук) */
  tileHeight?: number
  /** Обои: ширина рулона, длина рулона, раппорт, м */
  rollWidth?: number
  rollLength?: number
  rapport?: number
  /** Покраска: число слоёв, расход л/м² за слой */
  paintCoats?: number
  ceiling: CeilingFinish
  /** Плинтус напольный */
  skirting: boolean
  /** Потолочный плинтус/багет */
  cornice: boolean
  /** Черновые: стяжка пола, толщина, м (0 — не нужна) */
  screed?: number
  /** Черновые: выравнивание стен штукатуркой, толщина, м */
  wallPlaster?: number
}

export const DEFAULT_FINISH: RoomFinish = {
  floor: "none",
  wall: "none",
  ceiling: "none",
  skirting: true,
  cornice: false,
  rollWidth: 1.06,
  rollLength: 10.05,
  rapport: 0,
  paintCoats: 2,
  tileHeight: 0,
  screed: 0,
  wallPlaster: 0,
}

export const roomFinish = (scheme: Pick<PlanScheme, "finishes">, roomId: string): RoomFinish => ({
  ...DEFAULT_FINISH,
  ...(scheme.finishes?.[roomId] || {}),
})

export const LAYERS: { value: PlanLayer; label: string; icon: string }[] = [
  { value: "plan", label: "Планировка", icon: "Ruler" },
  { value: "interior", label: "Мебель и отделка", icon: "Sofa" },
  { value: "electric", label: "Электрика", icon: "Zap" },
  { value: "plumbing", label: "Сантехника", icon: "Droplets" },
]

export const NODE_PRESETS: Record<
  NodeKind,
  { label: string; layer: EngLayer; height: number; color: string; icon: string }
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
  thermostat: { label: "Терморегулятор тёплого пола", layer: "electric", height: 0.9, color: "#f97316", icon: "Thermometer" },

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
export const LINK_SPECS: Record<EngLayer, string[]> = {
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
/**
 * Цвет кабеля по сечению — один и тот же на плане и в PDF.
 * Тонкий — холодные цвета, толстый — тёплые: так сечение читается на глаз
 */
export const SECTION_COLORS: Record<string, { screen: string; print: string; label: string }> = {
  "1.5": { screen: "#5EB8F0", print: "#1f6fb2", label: "синий" },
  "2.5": { screen: "#7BD47B", print: "#23893a", label: "зелёный" },
  "4": { screen: "#F0A35E", print: "#c46a12", label: "оранжевый" },
  "6": { screen: "#F07E7E", print: "#c62828", label: "красный" },
  "10": { screen: "#C08BF0", print: "#7b3fb8", label: "фиолетовый" },
  "16": { screen: "#E87FC0", print: "#a8327a", label: "розовый" },
}
export const sectionColor = (spec: string, print = false) => {
  const c = SECTION_COLORS[String(sectionOf(spec))]
  return c ? (print ? c.print : c.screen) : print ? "#555555" : "#B0B0B0"
}

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