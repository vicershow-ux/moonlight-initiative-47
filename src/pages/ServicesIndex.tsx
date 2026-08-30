import { useEffect } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { HighlightedText } from "@/components/HighlightedText"
import { useSiteContent } from "@/hooks/useSiteContent"
import { useServiceLandings } from "@/hooks/useServiceLandings"
import Icon from "@/components/ui/icon"
import { reachGoal } from "@/lib/metrika"

const META_TITLE = "Услуги по ремонту и строительству в Хабаровске — цены | FixKey"
const META_DESCRIPTION =
  "Все услуги FixKey в Хабаровске: электромонтаж, сантехника, плитка, отделка, потолки, кровля, фасады. Прайс по каждой позиции, фиксированная смета, гарантия 3 года."

const formatPrice = (value: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value)

export default function ServicesIndex() {
  const { content } = useSiteContent()
  const s = content?.settings
  const phone = s?.phone || "+7 (495) 123-45-67"
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`

  const { landings, statsByCategory, loading } = useServiceLandings()

  useEffect(() => {
    document.title = META_TITLE

    const params = new URLSearchParams(window.location.search)
    let junk = false
    params.forEach((_v, key) => {
      if (!/^(utm_|yclid|gclid|from|ysclid)/.test(key)) junk = true
    })
    if (!junk) document.querySelector('meta[name="robots"]')?.remove()

    let desc = document.querySelector('meta[name="description"]')
    if (!desc) {
      desc = document.createElement("meta")
      desc.setAttribute("name", "description")
      document.head.appendChild(desc)
    }
    desc.setAttribute("content", META_DESCRIPTION)

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement("link")
      canonical.setAttribute("rel", "canonical")
      document.head.appendChild(canonical)
    }
    canonical.setAttribute("href", `${window.location.origin}/uslugi`)

    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <section className="pt-32 pb-16 md:pt-40">
          <div className="container mx-auto px-6 md:px-12">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <a href="/" className="hover:text-[#D4AF37] transition-colors">
                Главная
              </a>
              <Icon name="ChevronRight" size={14} />
              <span className="text-foreground">Услуги</span>
            </nav>

            <div className="max-w-3xl">
              <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6">
                Направления работ
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.15] tracking-tight mb-6 text-balance">
                Услуги по ремонту <HighlightedText>в Хабаровске</HighlightedText>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Берём объект целиком или отдельное направление — электрику, сантехнику, плитку,
                отделку. По каждому виду работ открытый прайс и фиксированная смета до начала
                работ.
              </p>
            </div>
          </div>
        </section>

        <section className="pb-20 md:pb-28">
          <div className="container mx-auto px-6 md:px-12">
            {loading && landings.length === 0 && (
              <div className="flex items-center justify-center py-16">
                <Icon name="Loader2" size={26} className="animate-spin text-muted-foreground" />
              </div>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {landings.map((c) => {
                const stat = statsByCategory[c.category]
                return (
                  <a
                    key={c.slug}
                    href={`/uslugi/${c.slug}`}
                    className="group flex flex-col p-6 rounded-2xl border border-border hover:border-[#D4AF37] transition-colors"
                  >
                    <span className="w-11 h-11 rounded-full bg-[#D4AF37]/15 flex items-center justify-center mb-5">
                      <Icon
                        name={c.icon}
                        fallback="Wrench"
                        size={19}
                        className="text-[#D4AF37]"
                      />
                    </span>

                    <h2 className="text-lg font-medium mb-2 group-hover:text-[#D4AF37] transition-colors">
                      {c.category}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                      {c.intro.length > 120 ? `${c.intro.slice(0, 120).trim()}…` : c.intro}
                    </p>

                    <div className="flex items-center justify-between text-sm pt-4 border-t border-border">
                      <span className="text-muted-foreground">
                        {stat ? `${stat.count} позиций` : "Прайс"}
                      </span>
                      {stat?.min_price ? (
                        <span className="font-medium">от {formatPrice(stat.min_price)} ₽</span>
                      ) : (
                        <Icon name="ArrowRight" size={16} className="text-[#D4AF37]" />
                      )}
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 bg-foreground text-primary-foreground">
          <div className="container mx-auto px-6 md:px-12 text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight mb-6 text-balance">
              Не нашли нужную работу?
            </h2>
            <p className="text-primary-foreground/70 text-lg mb-10 max-w-2xl mx-auto">
              Позвоните или оставьте заявку — подскажем по объёму и рассчитаем смету бесплатно.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="/#contact"
                className="inline-flex items-center gap-2 text-sm px-6 py-3 rounded-full bg-[#D4AF37] text-[#161616] font-medium hover:bg-[#B8860B] transition-colors"
              >
                Оставить заявку
                <Icon name="ArrowRight" size={16} />
              </a>
              <a
                href={phoneHref}
                onClick={() => reachGoal("phone_click", { mesto: "Раздел услуг" })}
                className="text-sm text-primary-foreground/60 hover:text-[#D4AF37] transition-colors"
              >
                {phone}
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}