import fs from "node:fs"
import path from "node:path"

const SITE_URL = "https://fixkey.ru"
const API = "https://functions.poehali.dev/bda13702-0c6f-4b74-8da0-007b85e92f50"

const TRANSLIT = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
}

const slugify = (v) =>
  v.toLowerCase().trim().split("")
    .map((ch) => (ch in TRANSLIT ? TRANSLIT[ch] : ch)).join("")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")

const CITY = "Хабаровске"

const CURATED = {
  "Электромонтажные работы": "Электромонтаж под ключ в Хабаровске: замена проводки, сборка щита, розетки и выключатели. Прайс по каждой позиции, фиксированная смета, гарантия 3 года.",
  "Сантехнические работы": "Услуги сантехника в Хабаровске: разводка труб, замена стояков, установка сантехники и счётчиков. Прайс по позициям, опрессовка, гарантия 3 года.",
  "Плиточные работы": "Укладка плитки и керамогранита в Хабаровске: пол, стены, ванная под ключ. Прайс по позициям, ровные швы, гидроизоляция, гарантия 3 года.",
  "Демонтажные работы": "Демонтаж стен и перегородок в Хабаровске: снос, вскрытие полов, демонтаж отделки. Прайс по позициям, вывоз мусора, работа без пыли по квартире.",
  "Черновые отделочные работы": "Черновые отделочные работы в Хабаровске: штукатурка по маякам, стяжка пола, шпаклёвка. Прайс по позициям, ровная геометрия, гарантия 3 года.",
  "Чистовые отделочные работы": "Чистовые отделочные работы в Хабаровске: покраска стен, поклейка обоев, декоративная штукатурка, плинтус. Прайс по позициям, гарантия 3 года.",
  "Устройство полов": "Устройство полов в Хабаровске: стяжка, наливной пол, укладка ламината и кварцвинила. Прайс по позициям, контроль перепада, гарантия 3 года.",
  "Потолочные работы": "Монтаж потолков в Хабаровске: натяжные, подвесные, многоуровневые, световые линии. Прайс по позициям, закладные под свет, гарантия 3 года.",
}

const HOME_TITLE = "Ремонт квартир под ключ в Хабаровске — FixKey"
const HOME_DESC =
  "Ремонт квартир и домов под ключ в Хабаровске и Хабаровском р-не. Фиксированная смета до начала работ, гарантия 3 года, контроль на каждом этапе."

async function fetchCategories() {
  const res = await fetch(`${API}?resource=public_services`, {
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return (data.categories || []).map((c) => c.category).filter(Boolean)
}

function buildRoutes(categories) {
  const routes = [
    { url: "/", title: HOME_TITLE, description: HOME_DESC, index: true },
    {
      url: "/uslugi",
      title: `Услуги по ремонту и строительству в ${CITY} — цены | FixKey`,
      description:
        "Все услуги FixKey в Хабаровске: электромонтаж, сантехника, плитка, отделка, потолки, кровля, фасады. Прайс по каждой позиции, фиксированная смета, гарантия 3 года.",
      index: true,
    },
  ]

  categories.forEach((cat) => {
    routes.push({
      url: `/uslugi/${slugify(cat)}`,
      title: `${cat} в ${CITY} — цены на услуги | FixKey`,
      description:
        CURATED[cat] ||
        `${cat} в ${CITY}: прайс по каждой позиции, фиксированная смета до начала работ, бесплатный замер, гарантия 3 года.`,
      index: true,
    })
  })

  const legal = [
    ["/privacy", "Политика конфиденциальности"],
    ["/terms", "Условия использования"],
    ["/cookies", "Файлы cookie"],
  ]
  legal.forEach(([url, name]) => {
    routes.push({
      url,
      title: `${name} — FixKey`,
      description: `${name} сайта FixKey — ремонт квартир под ключ в Хабаровске.`,
      index: false,
    })
  })

  return routes
}

function renderHtml(template, route) {
  let html = template

  html = html.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${esc(route.title)}</title>`,
  )
  html = html.replace(
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${esc(route.description)}"/>`,
  )
  html = html.replace(
    /<meta property="og:title" content="[^"]*">/,
    `<meta property="og:title" content="${esc(route.title)}">`,
  )
  html = html.replace(
    /<meta property="og:description" content="[^"]*">/,
    `<meta property="og:description" content="${esc(route.description)}">`,
  )

  const head = []
  head.push(`<link rel="canonical" href="${SITE_URL}${route.url}"/>`)
  head.push(`<meta property="og:url" content="${SITE_URL}${route.url}">`)
  if (!route.index) {
    head.push(`<meta name="robots" content="noindex, follow"/>`)
  }

  return html.replace("</head>", `    ${head.join("\n    ")}\n  </head>`)
}

function writeRoute(outDir, route, html) {
  const targets = [
    route.url === "/"
      ? path.join(outDir, "index.html")
      : path.join(outDir, route.url.replace(/^\//, ""), "index.html"),
  ]

  if (route.url !== "/") {
    targets.push(
      path.join(process.cwd(), "public", route.url.replace(/^\//, ""), "index.html"),
    )
  }

  targets.forEach((target) => {
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, html)
  })
}

function cleanPublicRoutes() {
  const dir = path.join(process.cwd(), "public", "uslugi")
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true })
  ;["privacy", "terms", "cookies"].forEach((p) => {
    const legal = path.join(process.cwd(), "public", p)
    if (fs.existsSync(legal)) fs.rmSync(legal, { recursive: true, force: true })
  })
}

export function prerenderPlugin() {
  return {
    name: "prerender-routes",
    apply: "build",
    async closeBundle() {
      const outDir = path.join(process.cwd(), "dist")
      const indexPath = path.join(outDir, "index.html")
      if (!fs.existsSync(indexPath)) return

      const template = fs.readFileSync(indexPath, "utf8")

      cleanPublicRoutes()

      let categories = []
      try {
        categories = await fetchCategories()
      } catch (err) {
        console.warn(`[prerender] услуги недоступны (${err.message}), беру карту сайта`)
        const sm = path.join(outDir, "sitemap.xml")
        if (fs.existsSync(sm)) {
          const prev = fs.readFileSync(sm, "utf8")
          const slugs = [...prev.matchAll(/\/uslugi\/([a-z0-9-]+)</g)].map((m) => m[1])
          slugs.forEach((s) => {
            const route = {
              url: `/uslugi/${s}`,
              title: `Услуги в ${CITY} — цены | FixKey`,
              description: `Прайс по каждой позиции, фиксированная смета, гарантия 3 года.`,
              index: true,
            }
            writeRoute(outDir, route, renderHtml(template, route))
          })
        }
      }

      const routes = buildRoutes(categories)
      routes.forEach((route) => {
        writeRoute(outDir, route, renderHtml(template, route))
      })

      console.log(`[prerender] подготовлено страниц: ${routes.length}`)
    },
  }
}