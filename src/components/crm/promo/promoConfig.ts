import { PromoData, PromoKind } from "@/lib/api"

export const MM_PX = 96 / 25.4
export const DEFAULT_LOGO = "/fixkey-logo.svg"

export interface PromoTheme {
  bg: string
  text: string
  muted: string
  accent: string
  box: string
  line: string
}

export const THEMES: Record<NonNullable<PromoData["theme"]>, PromoTheme & { label: string }> = {
  dark: { label: "Тёмная", bg: "#141414", text: "#ffffff", muted: "rgba(255,255,255,0.72)", accent: "#D4AF37", box: "rgba(212,175,55,0.14)", line: "rgba(212,175,55,0.45)" },
  light: { label: "Светлая", bg: "#ffffff", text: "#161616", muted: "#555555", accent: "#A8801F", box: "#F7F1DE", line: "#E3D6AE" },
  gold: { label: "Золотая", bg: "#D4AF37", text: "#161616", muted: "#3b321c", accent: "#161616", box: "rgba(0,0,0,0.08)", line: "rgba(0,0,0,0.25)" },
}

export const themeOf = (d: PromoData) => THEMES[d.theme || "dark"] || THEMES.dark

/** Визитка 90×50 мм; на листе А4 помещается 10 штук */
export const CARD = { w: 90, h: 50 }

export function cardSheet(orientation: PromoData["orientation"]) {
  const vertical = orientation === "portrait"
  const cw = vertical ? CARD.h : CARD.w
  const ch = vertical ? CARD.w : CARD.h
  const sheetW = vertical ? 297 : 210
  const sheetH = vertical ? 210 : 297
  const cols = vertical ? 5 : 2
  const rows = vertical ? 2 : 5
  return { cw, ch, sheetW, sheetH, cols, rows, x0: (sheetW - cols * cw) / 2, y0: (sheetH - rows * ch) / 2 }
}

export function sheetSize(kind: PromoKind, d: PromoData) {
  if (kind === "card") {
    const s = cardSheet(d.orientation)
    return { w: s.sheetW, h: s.sheetH }
  }
  return d.orientation === "landscape" ? { w: 297, h: 210 } : { w: 210, h: 297 }
}

export interface Contacts {
  phone: string
  email: string
  website: string
  brand: string
}

export function flyerPresets(c: Contacts): { label: string; title: string; data: PromoData }[] {
  const base: PromoData = {
    orientation: "portrait",
    theme: "dark",
    phone: c.phone,
    website: c.website,
    qr_enabled: true,
    qr_url: `https://${c.website}`,
    qr_caption: "Цены и примеры работ",
    tear_off: true,
  }
  return [
    {
      label: "Ремонт под ключ",
      title: "Объявление — ремонт под ключ",
      data: {
        ...base,
        headline: "Ремонт квартир и домов под ключ",
        subtitle: "Хабаровск и Хабаровский район",
        bullets: "Фиксированная смета до начала работ\nГарантия 3 года\nФотоотчёт по каждому этапу\nБесплатный выезд на замер",
        offer: "Замер и смета — бесплатно",
      },
    },
    {
      label: "Акция",
      title: "Объявление — акция",
      data: {
        ...base,
        theme: "gold",
        headline: "Скидка 10% на ремонт",
        subtitle: "При заключении договора до конца месяца",
        bullets: "Ванная и санузел под ключ\nЭлектрика и сантехника\nЧерновая и чистовая отделка",
        offer: "Назовите код «ЛИСТОВКА» при звонке",
      },
    },
    {
      label: "Простое",
      title: "Объявление",
      data: {
        ...base,
        theme: "light",
        headline: "Нужен ремонт? Звоните!",
        subtitle: "Бригада мастеров FixKey",
        bullets: "Плитка, электрика, сантехника\nПотолки, полы, стены\nРаботаем по договору",
        offer: "",
      },
    },
  ]
}

export function cardPreset(c: Contacts): { title: string; data: PromoData } {
  return {
    title: "Визитка",
    data: {
      orientation: "landscape",
      theme: "dark",
      name: c.brand,
      role: "Ремонт квартир и домов под ключ",
      phone: c.phone,
      email: c.email,
      website: c.website,
      address: "Хабаровск",
      qr_enabled: true,
      qr_url: `https://${c.website}`,
    },
  }
}
