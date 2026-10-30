import { createFileRoute } from "@tanstack/react-router"
import { sitemapResponse } from "./sitemap[.]xml"

/** Полная карта сайта со всеми услугами — отдельным адресом, его указываем в robots.txt и Search Console */
export const Route = createFileRoute("/sitemap-pages.xml")({
  server: { handlers: { GET: sitemapResponse } },
})
