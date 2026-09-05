import fs from "node:fs"
import path from "node:path"

const SITE_URL = process.env.VITE_SITE_URL || "https://fixkey.ru"
const API = process.env.VITE_API_BASE
  ? `${process.env.VITE_API_BASE.replace(/\/$/, "")}/site`
  : "https://functions.poehali.dev/bda13702-0c6f-4b74-8da0-007b85e92f50"

const TRANSLIT = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .split("")
    .map((ch) => (ch in TRANSLIT ? TRANSLIT[ch] : ch))
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function fetchCategories() {
  const res = await fetch(`${API}?resource=public_services`, {
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return (data.categories || []).map((c) => c.category).filter(Boolean)
}

function buildXml(categories, today) {
  const url = (loc, priority, changefreq, lastmod = today) =>
    `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n` +
    `    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`

  const urls = [
    url(`${SITE_URL}/`, "1.0", "daily"),
    url(`${SITE_URL}/uslugi`, "0.9", "weekly"),
    ...categories.map((c) => url(`${SITE_URL}/uslugi/${slugify(c)}`, "0.8", "weekly")),
  ]

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`
}

export async function generateSitemap(outDir) {
  const today = new Date().toISOString().slice(0, 10)
  let categories = []

  try {
    categories = await fetchCategories()
  } catch (err) {
    console.warn(`[sitemap] не удалось получить услуги (${err.message}), беру прошлую карту`)
    const existing = path.join(process.cwd(), "public", "sitemap.xml")
    if (fs.existsSync(existing)) {
      const prev = fs.readFileSync(existing, "utf8")
      categories = [...prev.matchAll(/\/uslugi\/([a-z0-9-]+)</g)].map((m) => m[1])
      const xml = buildXml([], today).replace(
        "</urlset>",
        categories
          .map(
            (s) =>
              `  <url>\n    <loc>${SITE_URL}/uslugi/${s}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
          )
          .join("\n") + "\n</urlset>",
      )
      fs.writeFileSync(path.join(outDir, "sitemap.xml"), xml)
      return categories.length
    }
    return 0
  }

  const xml = buildXml(categories, today)
  fs.writeFileSync(path.join(outDir, "sitemap.xml"), xml)
  const publicPath = path.join(process.cwd(), "public", "sitemap.xml")
  fs.writeFileSync(publicPath, xml)
  return categories.length
}

export function sitemapPlugin() {
  return {
    name: "generate-sitemap",
    apply: "build",
    async closeBundle() {
      const outDir = path.join(process.cwd(), "dist")
      if (!fs.existsSync(outDir)) return
      const count = await generateSitemap(outDir)
      console.log(`[sitemap] карта сайта собрана: ${count} направлений`)
    },
  }
}