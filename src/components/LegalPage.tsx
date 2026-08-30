import { useEffect } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { LegalContent } from "@/components/LegalContent"
import { useSiteContent } from "@/hooks/useSiteContent"
import Icon from "@/components/ui/icon"

interface LegalPageProps {
  title: string
  metaDescription: string
  introField: "privacy_intro" | "terms_intro" | "cookies_intro"
  bodyField: "privacy_body" | "terms_body" | "cookies_body"
  introDefault: string
  bodyDefault: string
}

export function LegalPage({
  title,
  metaDescription,
  introField,
  bodyField,
  introDefault,
  bodyDefault,
}: LegalPageProps) {
  const { content, loading } = useSiteContent()
  const s = content?.settings

  useEffect(() => {
    document.title = `${title} — ${s?.brand_name || "FixKey"}`

    let robots = document.querySelector('meta[name="robots"]')
    if (!robots) {
      robots = document.createElement("meta")
      robots.setAttribute("name", "robots")
      document.head.appendChild(robots)
    }
    robots.setAttribute("content", "noindex, follow")

    let desc = document.querySelector('meta[name="description"]')
    if (!desc) {
      desc = document.createElement("meta")
      desc.setAttribute("name", "description")
      document.head.appendChild(desc)
    }
    desc.setAttribute("content", metaDescription)

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement("link")
      canonical.setAttribute("rel", "canonical")
      document.head.appendChild(canonical)
    }
    canonical.setAttribute("href", window.location.origin + window.location.pathname)

    window.scrollTo(0, 0)
  }, [title, metaDescription, s?.brand_name])

  const company = s?.legal_company_name || s?.brand_name || "FixKey"
  const email = s?.email || ""
  const site = typeof window !== "undefined" ? window.location.host : "fixkey.ru"
  const updatedAt = s?.legal_updated_at || "17 августа 2026 года"

  const fill = (value: string) =>
    value.replace(/\{company\}/g, company).replace(/\{email\}/g, email).replace(/\{site\}/g, site)

  const intro = fill((s?.[introField] || "").trim() || introDefault)
  const body = fill((s?.[bodyField] || "").trim() || bodyDefault)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">{title}</h1>
            <p className="text-sm text-muted-foreground mb-12">Редакция от {updatedAt}</p>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Icon name="Loader2" size={26} className="animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>{intro}</p>
                <LegalContent text={body} />

                <div className="pt-10 mt-10 border-t border-border flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <a href="/privacy" className="hover:text-foreground transition-colors">
                    Политика конфиденциальности
                  </a>
                  <a href="/terms" className="hover:text-foreground transition-colors">
                    Условия использования
                  </a>
                  <a href="/cookies" className="hover:text-foreground transition-colors">
                    Файлы cookie
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}