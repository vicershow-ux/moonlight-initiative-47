import type { IconEl, ImageEl, PromoDesign, PromoEl, QrEl, ShapeEl, TearEl, TextEl } from "@/lib/promoTypes"
import { uid } from "./formats"

export interface Contacts {
  brand: string
  phone: string
  email: string
  website: string
  telegram: string
  city: string
}

const GOLD = "#D4AF37"
const INK = "#161616"
const LOGO = "/fixkey-logo.svg"

type P<T> = Omit<T, "id" | "type"> & Partial<Pick<T, keyof T>>

const txt = (p: Partial<TextEl> & Pick<TextEl, "text" | "x" | "y" | "w" | "h">): TextEl => ({
  id: uid(),
  type: "text",
  font: "Montserrat",
  size: 10,
  color: "#ffffff",
  weight: 400,
  align: "left",
  valign: "top",
  lh: 1.2,
  ...p,
})
const img = (p: P<ImageEl>): ImageEl => ({ id: uid(), type: "image", fit: "cover", ...p })
const rect = (p: P<ShapeEl>): ShapeEl => ({ id: uid(), type: "rect", ...p })
const qr = (p: Partial<QrEl> & Pick<QrEl, "x" | "y" | "w" | "value">): QrEl => ({ id: uid(), type: "qr", h: p.w, fg: INK, bg: "#ffffff", ...p })
const icon = (p: Partial<IconEl> & Pick<IconEl, "x" | "y" | "w" | "name">): IconEl => ({ id: uid(), type: "icon", h: p.w, color: GOLD, ...p })
const tear = (p: Partial<TearEl> & Pick<TearEl, "x" | "y" | "w" | "h" | "text">): TearEl => ({
  id: uid(),
  type: "tear",
  count: 8,
  sub: "",
  color: INK,
  bg: "#ffffff",
  size: 10,
  ...p,
})

/** Строка контакта: иконка + текст */
const contact = (name: string, value: string, x: number, y: number, w: number, color: string, size = 7, iconColor = GOLD, bold = false): PromoEl[] => [
  icon({ name, x, y: y + 0.2, w: size * 0.42, color: iconColor }),
  txt({ text: value, x: x + size * 0.62, y, w, h: size * 0.5, size, color, weight: bold ? 700 : 400, valign: "middle" }),
]

const site = (c: Contacts) => `https://${c.website}`

export interface Template {
  id: string
  name: string
  kind: "card" | "flyer"
  build: (c: Contacts) => PromoDesign
}

export const TEMPLATES: Template[] = [
  {
    id: "card-gold",
    name: "Золотой ключ",
    kind: "card",
    build: (c) => ({
      format: "card",
      orientation: "landscape",
      sides: [
        {
          bg: "#121212",
          elements: [
            rect({ x: 3, y: 3, w: 84, h: 44, fill: "transparent", stroke: GOLD, sw: 0.3 }),
            img({ src: LOGO, x: 27, y: 7, w: 36, h: 21.6, fit: "contain" }),
            txt({ text: c.brand, x: 10, y: 29.5, w: 70, h: 7, size: 15, weight: 700, color: GOLD, align: "center", font: "Montserrat" }),
            txt({ text: "РЕМОНТ ПОД КЛЮЧ", x: 10, y: 37.5, w: 70, h: 4, size: 6, color: "#bdbdbd", align: "center", ls: 0.3 }),
          ],
        },
        {
          bg: "#121212",
          elements: [
            txt({ text: "Иван Петров", x: 6, y: 5.5, w: 56, h: 6, size: 12, weight: 700 }),
            txt({ text: "Прораб · " + c.brand, x: 6, y: 12, w: 56, h: 4, size: 6.5, color: GOLD, weight: 600 }),
            rect({ x: 6, y: 18, w: 16, h: 0.5, fill: GOLD }),
            ...contact("Phone", c.phone, 6, 22, 52, "#ffffff", 8, GOLD, true),
            ...contact("Mail", c.email, 6, 28, 52, "#cfcfcf", 6.5),
            ...contact("Globe", c.website, 6, 33.5, 52, "#cfcfcf", 6.5),
            ...contact("MapPin", c.city, 6, 39, 52, "#cfcfcf", 6.5),
            qr({ value: site(c), x: 65, y: 17, w: 20 }),
            txt({ text: "наш сайт", x: 62, y: 38.5, w: 26, h: 3.5, size: 5, color: "#9a9a9a", align: "center" }),
          ],
        },
      ],
    }),
  },
  {
    id: "card-photo",
    name: "Фото и имя",
    kind: "card",
    build: (c) => ({
      format: "card",
      orientation: "landscape",
      sides: [
        {
          bg: "#0b0b0b",
          elements: [
            img({ src: "/promo/worker.jpg", x: 0, y: 0, w: 45, h: 50, filter: "gray" }),
            txt({ text: c.brand.toUpperCase(), x: 45, y: 15, w: 45, h: 11, size: 22, font: "Forum", align: "center", valign: "middle", ls: 0.05 }),
            txt({ text: "РЕМОНТ КВАРТИР И ДОМОВ", x: 47, y: 27, w: 41, h: 6, size: 6, weight: 600, color: GOLD, align: "center", ls: 0.12 }),
          ],
        },
        {
          bg: "#0b0b0b",
          elements: [
            txt({ text: c.brand.toUpperCase(), x: 10, y: 7, w: 70, h: 7, size: 14, font: "Forum", align: "center", ls: 0.1 }),
            rect({ x: 39, y: 16, w: 12, h: 0.3, fill: GOLD }),
            txt({ text: "РЕМОНТ ПОД КЛЮЧ · ГАРАНТИЯ 3 ГОДА · ФОТООТЧЁТЫ", x: 6, y: 19, w: 78, h: 4, size: 5.5, color: "#bdbdbd", align: "center", ls: 0.08 }),
            txt({ text: c.phone, x: 6, y: 27, w: 78, h: 6, size: 12, weight: 700, align: "center" }),
            txt({ text: `${c.website}   ·   ${c.city}`, x: 6, y: 38, w: 78, h: 4, size: 6, color: "#9a9a9a", align: "center" }),
          ],
        },
      ],
    }),
  },
  {
    id: "card-marble",
    name: "Мрамор",
    kind: "card",
    build: (c) => ({
      format: "card",
      orientation: "landscape",
      sides: [
        {
          bg: "#111111",
          bgImage: "/promo/marble.jpg",
          bgDim: 0.2,
          elements: [
            rect({ x: 15, y: 11, w: 60, h: 28, fill: "#0b0b0b", stroke: GOLD, sw: 0.35, opacity: 0.85 }),
            txt({ text: c.brand, x: 15, y: 14, w: 60, h: 11, size: 22, font: "Playfair Display", weight: 700, color: GOLD, align: "center", valign: "middle" }),
            txt({ text: "ремонт под ключ", x: 15, y: 27, w: 60, h: 5, size: 7.5, font: "Playfair Display", italic: true, color: "#e7e2d6", align: "center" }),
          ],
        },
        {
          bg: "#111111",
          elements: [
            img({ src: "/promo/marble.jpg", x: 0, y: 0, w: 28, h: 50 }),
            qr({ value: site(c), x: 5, y: 16, w: 18 }),
            txt({ text: "Иван Петров", x: 33, y: 6, w: 52, h: 6, size: 12, font: "Playfair Display", weight: 700, color: GOLD }),
            txt({ text: "руководитель проектов", x: 33, y: 12.5, w: 52, h: 4, size: 6.5, italic: true, color: "#cfcfcf" }),
            ...contact("Phone", c.phone, 33, 22, 52, "#ffffff", 8, GOLD, true),
            ...contact("Mail", c.email, 33, 29, 52, "#cfcfcf", 6.5),
            ...contact("Globe", c.website, 33, 34.5, 52, "#cfcfcf", 6.5),
            ...contact("MapPin", c.city, 33, 40, 52, "#cfcfcf", 6.5),
          ],
        },
      ],
    }),
  },
  {
    id: "card-white",
    name: "Белая с золотом",
    kind: "card",
    build: (c) => ({
      format: "card",
      orientation: "landscape",
      sides: [
        {
          bg: "#ffffff",
          elements: [
            rect({ x: 0, y: 0, w: 4, h: 50, fill: GOLD }),
            img({ src: LOGO, x: 9, y: 6, w: 24, h: 14.4, fit: "contain" }),
            txt({ text: "Иван Петров", x: 9, y: 26, w: 38, h: 6, size: 11, weight: 700, color: INK }),
            txt({ text: "прораб", x: 9, y: 32, w: 38, h: 4, size: 6.5, color: "#8a6a1e", weight: 600 }),
            rect({ x: 49, y: 8, w: 0.3, h: 34, fill: "#e3d6ae" }),
            ...contact("Phone", c.phone, 53, 12, 34, INK, 7.5, "#B8860B", true),
            ...contact("Mail", c.email, 53, 19, 34, "#555555", 6),
            ...contact("Globe", c.website, 53, 25, 34, "#555555", 6),
            ...contact("MapPin", c.city, 53, 31, 34, "#555555", 6),
          ],
        },
        {
          bg: INK,
          elements: [
            qr({ value: site(c), x: 9, y: 12, w: 26, fg: INK }),
            txt({ text: "Цены, примеры работ\nи онлайн-расчёт", x: 41, y: 14, w: 44, h: 10, size: 8, weight: 600, lh: 1.3 }),
            txt({ text: "Наведите камеру телефона на QR-код", x: 41, y: 27, w: 44, h: 8, size: 6, color: GOLD, lh: 1.3 }),
          ],
        },
      ],
    }),
  },
  {
    id: "card-build",
    name: "Стройка",
    kind: "card",
    build: (c) => ({
      format: "card",
      orientation: "landscape",
      sides: [
        {
          bg: "#1c1c1c",
          elements: [
            img({ src: "/promo/tools.jpg", x: 0, y: 0, w: 90, h: 50 }),
            rect({ x: 45, y: 0, w: 45, h: 50, fill: "#0b0b0b", opacity: 0.82 }),
            icon({ name: "House", x: 62, y: 8, w: 11 }),
            txt({ text: c.brand.toUpperCase(), x: 45, y: 21, w: 45, h: 8, size: 17, font: "Oswald", weight: 700, align: "center", ls: 0.08 }),
            txt({ text: "ремонтно-отделочная бригада", x: 47, y: 30.5, w: 41, h: 4, size: 6, color: GOLD, align: "center" }),
          ],
        },
        {
          bg: "#1c1c1c",
          elements: [
            txt({ text: "Ремонт квартир\nВанные под ключ\nЭлектрика и сантехника\nОтделочные работы", x: 6, y: 5, w: 52, h: 22, size: 7.5, lh: 1.55, weight: 500 }),
            rect({ x: 0, y: 34, w: 90, h: 16, fill: GOLD }),
            ...contact("Phone", c.phone, 6, 37, 50, INK, 7.5, INK, true),
            ...contact("Globe", c.website, 6, 43, 50, INK, 6.5, INK),
            qr({ value: site(c), x: 66, y: 6, w: 19 }),
          ],
        },
      ],
    }),
  },
  {
    id: "card-vertical",
    name: "Вертикальная",
    kind: "card",
    build: (c) => ({
      format: "card",
      orientation: "portrait",
      sides: [
        {
          bg: "#121212",
          elements: [
            img({ src: LOGO, x: 9, y: 10, w: 32, h: 19.2, fit: "contain" }),
            txt({ text: c.brand, x: 4, y: 31, w: 42, h: 7, size: 15, weight: 700, color: GOLD, align: "center" }),
            txt({ text: "РЕМОНТ ПОД КЛЮЧ", x: 4, y: 39, w: 42, h: 4, size: 5.5, color: "#bdbdbd", align: "center", ls: 0.25 }),
            rect({ x: 19, y: 48, w: 12, h: 0.4, fill: GOLD }),
            txt({ text: "Иван Петров", x: 4, y: 52, w: 42, h: 5, size: 9, weight: 700, align: "center" }),
            txt({ text: c.phone, x: 4, y: 58, w: 42, h: 5, size: 8, align: "center" }),
            qr({ value: site(c), x: 17, y: 68, w: 16 }),
          ],
        },
        {
          bg: GOLD,
          elements: [
            txt({ text: "СКИДКА", x: 4, y: 22, w: 42, h: 8, size: 14, font: "Oswald", weight: 700, color: INK, align: "center", ls: 0.2 }),
            txt({ text: "5%", x: 4, y: 30, w: 42, h: 18, size: 44, font: "Oswald", weight: 700, color: INK, align: "center" }),
            txt({ text: "на любой ремонт\nпри предъявлении\nэтой визитки", x: 4, y: 52, w: 42, h: 14, size: 7, color: INK, align: "center", lh: 1.35 }),
            txt({ text: c.website, x: 4, y: 78, w: 42, h: 4, size: 6.5, weight: 700, color: INK, align: "center" }),
          ],
        },
      ],
    }),
  },
  {
    id: "flyer-turnkey",
    name: "Ремонт под ключ",
    kind: "flyer",
    build: (c) => ({
      format: "a4",
      orientation: "portrait",
      sides: [
        {
          bg: "#121212",
          elements: [
            img({ src: "/promo/hously-background.jpg", x: 0, y: 0, w: 210, h: 118 }),
            rect({ x: 0, y: 0, w: 210, h: 36, fill: "#000000", opacity: 0.45 }),
            img({ src: LOGO, x: 14, y: 8, w: 34, h: 20.4, fit: "contain" }),
            txt({ text: c.website, x: 120, y: 14, w: 76, h: 8, size: 12, align: "right", valign: "middle", weight: 600 }),
            txt({ text: "Ремонт квартир\nи домов под ключ", x: 14, y: 126, w: 182, h: 30, size: 36, weight: 800, lh: 1.05 }),
            txt({ text: `${c.city} и пригород`, x: 14, y: 158, w: 182, h: 8, size: 16, color: GOLD, weight: 600 }),
            ...["Фиксированная смета до начала работ", "Гарантия 3 года по договору", "Фотоотчёт по каждому этапу", "Бесплатный выезд на замер"].flatMap((t, i) => [
              icon({ name: "CircleCheck", x: 14, y: 174 + i * 10, w: 6.5 }),
              txt({ text: t, x: 24, y: 174 + i * 10, w: 172, h: 6.5, size: 15, weight: 500, valign: "middle" }),
            ]),
            rect({ x: 14, y: 217, w: 182, h: 15, fill: "rgba(212,175,55,0.14)", stroke: GOLD, sw: 0.4, radius: 3 }),
            txt({ text: "Замер и смета — бесплатно", x: 20, y: 217, w: 170, h: 15, size: 18, weight: 700, color: GOLD, valign: "middle" }),
            txt({ text: "Звоните или пишите", x: 14, y: 238, w: 120, h: 5, size: 11, color: "#bdbdbd" }),
            txt({ text: c.phone, x: 14, y: 244, w: 140, h: 12, size: 30, weight: 800 }),
            qr({ value: site(c), x: 168, y: 233, w: 28 }),
            tear({ text: c.phone, sub: c.website, x: 0, y: 263, w: 210, h: 34, count: 8 }),
          ],
        },
      ],
    }),
  },
  {
    id: "flyer-sale",
    name: "Акция −10%",
    kind: "flyer",
    build: (c) => ({
      format: "a4",
      orientation: "portrait",
      sides: [
        {
          bg: GOLD,
          elements: [
            txt({ text: "АКЦИЯ", x: 0, y: 14, w: 210, h: 10, size: 20, font: "Oswald", weight: 700, color: INK, align: "center", ls: 0.4 }),
            txt({ text: "−10%", x: 0, y: 24, w: 210, h: 50, size: 120, font: "Unbounded", weight: 700, color: INK, align: "center", lh: 1 }),
            txt({ text: "на ремонт под ключ", x: 0, y: 78, w: 210, h: 12, size: 28, weight: 800, color: INK, align: "center" }),
            txt({ text: "при заключении договора до конца месяца", x: 0, y: 92, w: 210, h: 8, size: 14, color: "#3b321c", align: "center" }),
            img({ src: "/promo/worker.jpg", x: 30, y: 106, w: 150, h: 100, radius: 4 }),
            txt({ text: "Ванные и санузлы  ·  Электрика  ·  Сантехника  ·  Отделка", x: 10, y: 212, w: 190, h: 8, size: 13, weight: 600, color: INK, align: "center" }),
            txt({ text: "Звоните:", x: 14, y: 230, w: 120, h: 6, size: 12, color: "#3b321c" }),
            txt({ text: c.phone, x: 14, y: 236, w: 140, h: 13, size: 30, weight: 800, color: INK }),
            qr({ value: site(c), x: 170, y: 228, w: 26, bg: "#ffffff" }),
            tear({ text: c.phone, sub: "скидка 10%", x: 0, y: 263, w: 210, h: 34, count: 9, bg: "#ffffff" }),
          ],
        },
      ],
    }),
  },
  {
    id: "flyer-price",
    name: "Прайс-лист",
    kind: "flyer",
    build: (c) => {
      const sections: [string, string, string][] = [
        ["Черновые работы", "Демонтаж перегородок\nШтукатурка стен\nСтяжка пола\nЭлектромонтаж", "от 350 ₽/м²\nот 550 ₽/м²\nот 500 ₽/м²\nот 600 ₽/точка"],
        ["Чистовая отделка", "Укладка плитки\nПокраска стен\nУкладка ламината\nНатяжной потолок", "от 1 500 ₽/м²\nот 350 ₽/м²\nот 450 ₽/м²\nот 600 ₽/м²"],
        ["Ремонт под ключ", "Санузел под ключ\nКосметический ремонт\nКапитальный ремонт\nДизайнерский ремонт", "от 150 000 ₽\nот 4 500 ₽/м²\nот 9 000 ₽/м²\nот 15 000 ₽/м²"],
      ]
      return {
        format: "a4",
        orientation: "portrait",
        sides: [
          {
            bg: "#f5f1e8",
            elements: [
              rect({ x: 8, y: 8, w: 194, h: 281, fill: "transparent", stroke: GOLD, sw: 0.5 }),
              txt({ text: "Прайс-лист", x: 0, y: 16, w: 210, h: 22, size: 48, font: "Marck Script", color: INK, align: "center" }),
              txt({ text: `${c.brand.toUpperCase()} · РЕМОНТ ПОД КЛЮЧ`, x: 0, y: 40, w: 210, h: 6, size: 10, color: "#8a6a1e", align: "center", ls: 0.25, weight: 600 }),
              ...sections.flatMap(([h, names, prices], i) => {
                const y = 54 + i * 48
                return [
                  txt({ text: h, x: 0, y, w: 210, h: 8, size: 17, weight: 700, color: INK, align: "center" }),
                  txt({ text: names, x: 26, y: y + 11, w: 110, h: 30, size: 12, color: "#2a2a2a", lh: 1.8 }),
                  txt({ text: prices, x: 124, y: y + 11, w: 60, h: 30, size: 12, color: INK, lh: 1.8, align: "right", weight: 600 }),
                ]
              }),
              txt({ text: "Цены ориентировочные. Точная смета — после бесплатного замера.", x: 20, y: 202, w: 170, h: 6, size: 9.5, italic: true, color: "#7a7a7a", align: "center" }),
              img({ src: LOGO, x: 24, y: 218, w: 38, h: 22.8, fit: "contain" }),
              qr({ value: site(c), x: 160, y: 216, w: 26 }),
              txt({ text: c.phone, x: 0, y: 250, w: 210, h: 11, size: 24, weight: 800, color: INK, align: "center" }),
              txt({ text: c.website, x: 0, y: 263, w: 210, h: 6, size: 12, color: "#8a6a1e", align: "center", weight: 600 }),
            ],
          },
        ],
      }
    },
  },
  {
    id: "flyer-photo",
    name: "Фото на весь лист",
    kind: "flyer",
    build: (c) => ({
      format: "a4",
      orientation: "portrait",
      sides: [
        {
          bg: "#000000",
          bgImage: "/promo/exterior.jpg",
          bgDim: 0.5,
          elements: [
            img({ src: LOGO, x: 80, y: 16, w: 50, h: 30, fit: "contain" }),
            txt({ text: "Строим и ремонтируем\nдома под ключ", x: 10, y: 130, w: 190, h: 38, size: 38, font: "Playfair Display", weight: 700, align: "center", lh: 1.1 }),
            txt({ text: "от фундамента до чистовой отделки", x: 10, y: 172, w: 190, h: 8, size: 16, color: GOLD, align: "center", italic: true }),
            txt({ text: c.phone, x: 10, y: 236, w: 190, h: 14, size: 32, weight: 800, align: "center" }),
            txt({ text: c.website, x: 10, y: 252, w: 190, h: 7, size: 13, align: "center", color: "#e7e2d6" }),
            qr({ value: site(c), x: 172, y: 262, w: 24 }),
          ],
        },
      ],
    }),
  },
  {
    id: "flyer-simple",
    name: "С отрывными номерами",
    kind: "flyer",
    build: (c) => ({
      format: "a4",
      orientation: "portrait",
      sides: [
        {
          bg: "#ffffff",
          elements: [
            txt({ text: "НУЖЕН РЕМОНТ?", x: 0, y: 18, w: 210, h: 20, size: 46, font: "Russo One", color: INK, align: "center" }),
            txt({ text: "Приедем на замер бесплатно", x: 0, y: 42, w: 210, h: 9, size: 18, color: "#8a6a1e", align: "center", weight: 600 }),
            img({ src: "/promo/tools.jpg", x: 14, y: 60, w: 182, h: 86, radius: 3 }),
            txt({ text: "• Ремонт квартир, домов и офисов\n• Плитка, электрика, сантехника\n• Работаем по договору, гарантия 3 года", x: 18, y: 156, w: 176, h: 36, size: 16, color: INK, lh: 1.6, weight: 500 }),
            rect({ x: 14, y: 204, w: 182, h: 36, fill: INK, radius: 3 }),
            txt({ text: c.phone, x: 14, y: 204, w: 182, h: 36, size: 34, weight: 800, color: GOLD, align: "center", valign: "middle" }),
            tear({ text: c.phone, sub: "ремонт", x: 0, y: 255, w: 210, h: 42, count: 9, size: 11 }),
          ],
        },
      ],
    }),
  },
]

export const blankDesign = (kind: "card" | "flyer"): PromoDesign =>
  kind === "card"
    ? { format: "card", orientation: "landscape", sides: [{ bg: "#ffffff", elements: [] }, { bg: "#ffffff", elements: [] }] }
    : { format: "a4", orientation: "portrait", sides: [{ bg: "#ffffff", elements: [] }] }
