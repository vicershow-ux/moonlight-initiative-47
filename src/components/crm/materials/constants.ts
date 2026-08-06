export const money = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(n || 0) + " ₽"

export const num = (n: unknown) => Number(n || 0)

export const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"

export const UNITS = ["шт", "м²", "м", "м.п.", "м³", "кг", "т", "л", "уп", "рул", "меш", "компл"]

export const WORK_TYPES = [
  "Демонтажные работы",
  "Подготовительные работы",
  "Черновые работы",
  "Чистовые работы",
  "Плиточные работы",
  "Устройство полов",
  "Потолочные работы",
  "Гипсокартонные работы",
  "Малярные работы",
  "Электромонтажные работы",
  "Сантехнические работы",
  "Столярные работы",
]

export const goldBtn =
  "flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg disabled:opacity-40"

export interface EditFormState {
  material_id: string
  name: string
  unit: string
  qty: string
  price: string
  shop_name: string
  room_id: string
  work_type: string
  note: string
}

export interface RoomGroup {
  key: string
  title: string
  items: import("@/lib/api").ObjectMaterial[]
  sum: number
}
