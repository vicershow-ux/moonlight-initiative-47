import { SiteSettings } from "@/lib/api"

export type RoomTypeKey = "apartment" | "newbuild" | "house" | "bathroom" | "commercial"
export type LevelKey = "cosmetic" | "standard" | "premium"

export interface RoomTypeOption {
  key: RoomTypeKey
  label: string
  hint: string
  icon: string
  settingsKey: keyof SiteSettings
  fallback: number
}

export interface LevelOption {
  key: LevelKey
  label: string
  hint: string
  includes: string[]
  settingsKey: keyof SiteSettings
  fallback: number
}

export const ROOM_TYPES: RoomTypeOption[] = [
  {
    key: "apartment",
    label: "Квартира",
    hint: "Вторичное жильё",
    icon: "Building2",
    settingsKey: "calc_k_apartment",
    fallback: 1,
  },
  {
    key: "newbuild",
    label: "Новостройка",
    hint: "Без отделки",
    icon: "Building",
    settingsKey: "calc_k_newbuild",
    fallback: 0.95,
  },
  {
    key: "house",
    label: "Дом",
    hint: "Частный дом, коттедж",
    icon: "Home",
    settingsKey: "calc_k_house",
    fallback: 1.15,
  },
  {
    key: "bathroom",
    label: "Санузел",
    hint: "Ванная, туалет",
    icon: "Bath",
    settingsKey: "calc_k_bathroom",
    fallback: 1.6,
  },
  {
    key: "commercial",
    label: "Коммерция",
    hint: "Офис, магазин",
    icon: "Store",
    settingsKey: "calc_k_commercial",
    fallback: 1.1,
  },
]

export const LEVELS: LevelOption[] = [
  {
    key: "cosmetic",
    label: "Косметический",
    hint: "Обновить, не трогая коммуникации",
    includes: [
      "выравнивание и покраска стен",
      "поклейка обоев, замена покрытий",
      "монтаж плинтусов и наличников",
    ],
    settingsKey: "calc_price_cosmetic",
    fallback: 4500,
  },
  {
    key: "standard",
    label: "Капитальный",
    hint: "Полный цикл с черновыми работами",
    includes: [
      "демонтаж и вывоз мусора",
      "электрика и сантехника с нуля",
      "стяжка, штукатурка, чистовая отделка",
    ],
    settingsKey: "calc_price_standard",
    fallback: 7500,
  },
  {
    key: "premium",
    label: "Премиум",
    hint: "Дизайнерский ремонт по проекту",
    includes: [
      "работы по дизайн-проекту",
      "сложные конструкции и подсветка",
      "премиальные материалы и техника",
    ],
    settingsKey: "calc_price_premium",
    fallback: 12000,
  },
]

export const AREA_MAX = 300

const AREA_LIMITS: Record<RoomTypeKey, { min: number; max: number; preset: number }> = {
  apartment: { min: 15, max: 300, preset: 55 },
  newbuild: { min: 15, max: 300, preset: 55 },
  house: { min: 40, max: 300, preset: 120 },
  bathroom: { min: 2, max: 30, preset: 5 },
  commercial: { min: 15, max: 300, preset: 80 },
}

export const areaLimits = (roomType: RoomTypeKey) => AREA_LIMITS[roomType] || AREA_LIMITS.apartment

const toNumber = (value: unknown, fallback: number) => {
  const parsed = typeof value === "number" ? value : parseFloat(String(value ?? ""))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export interface CalcResult {
  area: number
  basePrice: number
  coefficient: number
  pricePerMeter: number
  total: number
  totalMin: number
  totalMax: number
  roomLabel: string
  levelLabel: string
}

export function calculate(
  settings: SiteSettings | undefined,
  area: number,
  roomType: RoomTypeKey,
  level: LevelKey
): CalcResult {
  const room = ROOM_TYPES.find((r) => r.key === roomType) || ROOM_TYPES[0]
  const lvl = LEVELS.find((l) => l.key === level) || LEVELS[1]

  const basePrice = toNumber(settings?.[lvl.settingsKey], lvl.fallback)
  const coefficient = toNumber(settings?.[room.settingsKey], room.fallback)

  const limits = areaLimits(roomType)
  const safeArea = Math.min(Math.max(area || limits.preset, limits.min), limits.max)
  const pricePerMeter = Math.round(basePrice * coefficient)
  const total = Math.round((pricePerMeter * safeArea) / 1000) * 1000

  return {
    area: safeArea,
    basePrice,
    coefficient,
    pricePerMeter,
    total,
    totalMin: Math.round((total * 0.9) / 1000) * 1000,
    totalMax: Math.round((total * 1.15) / 1000) * 1000,
    roomLabel: room.label,
    levelLabel: lvl.label,
  }
}

export const formatMoney = (value: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value)

export function buildCalcComment(result: CalcResult): string {
  return (
    `Расчёт с сайта: ${result.roomLabel}, ${result.area} м², ` +
    `${result.levelLabel.toLowerCase()} ремонт. ` +
    `Ориентировочно ${formatMoney(result.totalMin)}–${formatMoney(result.totalMax)} ₽ ` +
    `(от ${formatMoney(result.pricePerMeter)} ₽/м²)`
  )
}