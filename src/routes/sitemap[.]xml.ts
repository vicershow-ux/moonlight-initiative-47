import { createFileRoute } from "@tanstack/react-router"
import { funcUrl } from "@/lib/api"
import { SITE_ORIGIN } from "@/lib/pageHead"

interface SitemapPage {
  path: string
  lastmod: string | null
  kind: "home" | "catalog" | "service"
}

const FALLBACK: SitemapPage[] = [
  { path: "/", lastmod: null, kind: "home" },
  { path: "/uslugi", lastmod: null, kind: "catalog" },
]

const SETTINGS: Record<SitemapPage["kind"], { changefreq: string; priority: string }> = {
  home: { changefreq: "daily", priority: "1.0" },
  catalog: { changefreq: "weekly", priority: "0.9" },
  service: { changefreq: "weekly", priority: "0.8" },
}

const escapeXml = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

async function loadPages(): Promise<{ pages: SitemapPage[]; ok: boolean }> {
  try {
    const res = await fetch(`${funcUrl("site")}?resource=public_sitemap`, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return { pages: FALLBACK, ok: false }
    const data = (await res.json()) as { pages?: SitemapPage[] }
    return data.pages?.length ? { pages: data.pages, ok: true } : { pages: FALLBACK, ok: false }
  } catch {
    return { pages: FALLBACK, ok: false }
  }
}

function buildXml(pages: SitemapPage[]) {
  const urls = pages.map((p) => {
    const s = SETTINGS[p.kind] || SETTINGS.service
    const loc = `${SITE_ORIGIN}${p.path === "/" ? "/" : p.path}`
    return [
      "  <url>",
      `    <loc>${escapeXml(loc)}</loc>`,
      ...(p.lastmod ? [`    <lastmod>${p.lastmod}</lastmod>`] : []),
      `    <changefreq>${s.changefreq}</changefreq>`,
      `    <priority>${s.priority}</priority>`,
      "  </url>",
    ].join("\n")
  })
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`
}

export async function sitemapResponse() {
  const { pages, ok } = await loadPages()
  return new Response(buildXml(pages), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": ok ? "public, max-age=3600" : "no-store",
    },
  })
}

export const Route = createFileRoute("/sitemap.xml")({
  server: { handlers: { GET: sitemapResponse } },
})
