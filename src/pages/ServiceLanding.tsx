import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { LeadForm } from "@/components/LeadForm"
import { HighlightedText } from "@/components/HighlightedText"
import { useSiteContent } from "@/hooks/useSiteContent"
import { siteApi, PublicServiceItem } from "@/lib/api"
import { resolveLandingBySlug } from "@/lib/serviceLanding"
import { useServiceLandings } from "@/hooks/useServiceLandings"
import { getServiceFaq } from "@/lib/serviceFaq"
import Icon from "@/components/ui/icon"
import PageNotFound from "@/pages/PageNotFound"

const formatPrice = (value: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value)

export default function ServiceLanding() {
  const { slug } = useParams<{ slug: string }>()
  const { landings, categories, loading: catsLoading } = useServiceLandings()
  const meta = resolveLandingBySlug(slug, categories)
  const { content } = useSiteContent()
  const s = content?.settings

  const [items, setItems] = useState<PublicServiceItem[]>([])
  const [loading, setLoading] = useState(true)

  const faq = useMemo(() => (meta ? getServiceFaq(meta) : []), [meta])

  const phone = s?.phone || "+7 (495) 123-45-67"
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`

  useEffect(() => {
    if (!meta) return
    document.title = meta.metaTitle

    document.querySelector('meta[name="robots"]')?.remove()

    let desc = document.querySelector('meta[name="description"]')
    if (!desc) {
      desc = document.createElement("meta")
      desc.setAttribute("name", "description")
      document.head.appendChild(desc)
    }
    desc.setAttribute("content", meta.metaDescription)

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement("link")
      canonical.setAttribute("rel", "canonical")
      document.head.appendChild(canonical)
    }
    canonical.setAttribute("href", `${window.location.origin}/uslugi/${meta.slug}`)

    window.scrollTo(0, 0)
  }, [meta])

  useEffect(() => {
    if (!meta || faq.length === 0) return

    const origin = window.location.origin
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        },
        {
          "@type": "Service",
          name: meta.h1,
          serviceType: meta.category,
          description: meta.metaDescription,
          areaServed: { "@type": "City", name: "Хабаровск" },
          provider: {
            "@type": "LocalBusiness",
            name: s?.brand_name || "FixKey",
            telephone: phone,
            address: { "@type": "PostalAddress", addressLocality: "Хабаровск", addressCountry: "RU" },
          },
          url: `${origin}/uslugi/${meta.slug}`,
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Главная", item: origin },
            { "@type": "ListItem", position: 2, name: "Услуги", item: `${origin}/uslugi` },
            { "@type": "ListItem", position: 3, name: meta.category },
          ],
        },
      ],
    }

    const el = document.createElement("script")
    el.type = "application/ld+json"
    el.dataset.serviceSchema = "true"
    el.textContent = JSON.stringify(schema)
    document.head.appendChild(el)

    return () => {
      el.remove()
    }
  }, [meta, faq, phone, s?.brand_name])

  useEffect(() => {
    if (!meta) return
    let alive = true
    setLoading(true)
    siteApi
      .getPublicServices(meta.category)
      .then((res) => {
        if (alive) setItems(res.items || [])
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [meta])

  const grouped = useMemo(() => {
    const map = new Map<string, PublicServiceItem[]>()
    items.forEach((item) => {
      const key = item.subcategory || "Основные работы"
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    })
    return Array.from(map.entries())
  }, [items])

  const minPrice = useMemo(
    () => (items.length ? Math.min(...items.map((i) => i.price)) : 0),
    [items],
  )

  const others = useMemo(
    () => landings.filter((c) => c.slug !== meta?.slug).slice(0, 8),
    [landings, meta?.slug],
  )

  if (catsLoading && !meta) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-40">
          <Icon name="Loader2" size={28} className="animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    )
  }

  if (!meta) return <PageNotFound />

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <section className="pt-32 pb-16 md:pt-40 md:pb-20">
          <div className="container mx-auto px-6 md:px-12">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <a href="/" className="hover:text-[#D4AF37] transition-colors">
                Главная
              </a>
              <Icon name="ChevronRight" size={14} />
              <a href="/uslugi" className="hover:text-[#D4AF37] transition-colors">
                Услуги
              </a>
              <Icon name="ChevronRight" size={14} />
              <span className="text-foreground">{meta.navLabel}</span>
            </nav>

            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-start">
              <div>
                <div className="inline-flex items-center gap-2.5 mb-6 text-sm text-muted-foreground">
                  <span className="w-9 h-9 rounded-full bg-[#D4AF37]/15 flex items-center justify-center">
                    <Icon name={meta.icon} fallback="Wrench" size={17} className="text-[#D4AF37]" />
                  </span>
                  {meta.category}
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.15] tracking-tight mb-6 text-balance">
                  {meta.h1.replace(" в Хабаровске", "")}{" "}
                  <HighlightedText>в Хабаровске</HighlightedText>
                </h1>

                <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-2xl">
                  {meta.intro}
                </p>

                <ul className="space-y-3 mb-10">
                  {meta.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm md:text-base">
                      <Icon name="Check" size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-center gap-4">
                  <a
                    href="#zayavka"
                    className="inline-flex items-center gap-2 text-sm px-6 py-3 rounded-full bg-[#D4AF37] text-[#161616] font-medium hover:bg-[#B8860B] transition-colors"
                  >
                    Оставить заявку
                    <Icon name="ArrowRight" size={16} />
                  </a>
                  <a
                    href={phoneHref}
                    className="text-sm text-muted-foreground hover:text-[#D4AF37] transition-colors"
                  >
                    Или позвоните: {phone}
                  </a>
                </div>
              </div>

              <div className="bg-foreground text-primary-foreground rounded-2xl p-6 md:p-8 w-full">
                <p className="text-primary-foreground/60 text-xs tracking-[0.2em] uppercase mb-4">
                  Кратко
                </p>
                <div className="space-y-5 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-primary-foreground/60">Позиций в прайсе</span>
                    <span className="font-medium">{loading ? "…" : items.length}</span>
                  </div>
                  {minPrice > 0 && (
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-primary-foreground/60">Цены от</span>
                      <span className="font-medium">{formatPrice(minPrice)} ₽</span>
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-primary-foreground/60">Гарантия</span>
                    <span className="font-medium">3 года</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-primary-foreground/60">Смета</span>
                    <span className="font-medium">Фиксируем до старта</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-primary-foreground/60">Выезд на замер</span>
                    <span className="font-medium">Бесплатно</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-20 md:pb-28">
          <div className="container mx-auto px-6 md:px-12">
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-3">
              Цены на {meta.category.toLowerCase()}
            </h2>
            <p className="text-muted-foreground mb-10 max-w-2xl">
              Стоимость указана за работу без учёта материалов. Точную сумму фиксируем в смете
              после бесплатного замера.
            </p>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Icon name="Loader2" size={26} className="animate-spin text-muted-foreground" />
              </div>
            ) : items.length === 0 ? (
              <p className="text-muted-foreground">
                Прайс на это направление уточняется — оставьте заявку, рассчитаем стоимость под ваш
                объект.
              </p>
            ) : (
              <div className="space-y-10">
                {grouped.map(([group, list]) => (
                  <div key={group}>
                    <h3 className="text-sm font-medium tracking-[0.15em] uppercase text-muted-foreground mb-4">
                      {group}
                    </h3>
                    <div className="rounded-xl border border-border overflow-hidden">
                      {list.map((item, i) => (
                        <div
                          key={`${item.name}-${i}`}
                          className={`flex items-baseline justify-between gap-6 px-4 md:px-6 py-3.5 ${
                            i % 2 ? "bg-muted/40" : ""
                          }`}
                        >
                          <span className="text-sm md:text-base">{item.name}</span>
                          <span className="text-sm md:text-base font-medium whitespace-nowrap">
                            {formatPrice(item.price)} ₽
                            <span className="text-muted-foreground font-normal">
                              {item.unit ? ` / ${item.unit}` : ""}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="pb-20 md:pb-28">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-3">
                Частые вопросы
              </h2>
              <p className="text-muted-foreground mb-10">
                Собрали то, что чаще всего спрашивают до начала работ.
              </p>

              <div className="divide-y divide-border border-y border-border">
                {faq.map((item, i) => (
                  <details key={item.question} className="group py-5" open={i === 0}>
                    <summary className="flex items-start justify-between gap-6 cursor-pointer list-none">
                      <h3 className="text-base md:text-lg font-medium pr-4">{item.question}</h3>
                      <Icon
                        name="Plus"
                        size={20}
                        className="shrink-0 mt-0.5 text-[#D4AF37] transition-transform duration-300 group-open:rotate-45"
                      />
                    </summary>
                    <p className="text-muted-foreground leading-relaxed mt-4 pr-10">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="zayavka" className="py-24 md:py-28 bg-foreground text-primary-foreground">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-primary-foreground/60 text-sm tracking-[0.3em] uppercase mb-8">
                Заявка
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.1] tracking-tight mb-8 text-balance">
                Нужны {meta.category.toLowerCase()}?
              </h2>
              <p className="text-primary-foreground/70 text-lg leading-relaxed mb-12 max-w-2xl mx-auto">
                Оставьте заявку на бесплатный замер — рассчитаем смету и сроки в течение 24 часов.
              </p>

              <LeadForm commentPlaceholder={`Что нужно сделать: ${meta.navLabel.toLowerCase()}`} />

              <p className="text-primary-foreground/50 text-sm mt-8">
                Или позвоните:{" "}
                <a href={phoneHref} className="hover:text-[#D4AF37] transition-colors">
                  {phone}
                </a>
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24">
          <div className="container mx-auto px-6 md:px-12">
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-10">
              Другие направления
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {others.map((c) => (
                <a
                  key={c.slug}
                  href={`/uslugi/${c.slug}`}
                  className="group p-5 rounded-xl border border-border hover:border-[#D4AF37] transition-colors"
                >
                  <Icon
                    name={c.icon}
                    fallback="Wrench"
                    size={20}
                    className="text-[#D4AF37] mb-3"
                  />
                  <p className="font-medium mb-1 group-hover:text-[#D4AF37] transition-colors">
                    {c.navLabel}
                  </p>
                  <p className="text-sm text-muted-foreground">{c.category}</p>
                </a>
              ))}
            </div>
            <a
              href="/uslugi"
              className="inline-flex items-center gap-2 mt-8 text-sm hover:text-[#D4AF37] transition-colors"
            >
              Все услуги
              <Icon name="ArrowRight" size={16} />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}