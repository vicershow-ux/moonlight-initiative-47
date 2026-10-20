import { useEffect } from "react"
import { PublicServiceItem } from "@/lib/api"
import { ServiceLandingMeta } from "@/lib/serviceLanding"
import { usePageSeo } from "@/hooks/usePageSeo"
import { getServiceFaq } from "@/lib/serviceFaq"

type PageSeo = ReturnType<typeof usePageSeo>
type FaqItem = ReturnType<typeof getServiceFaq>[number]

interface Params {
  meta: ServiceLandingMeta | null | undefined
  customSeo: PageSeo
  faq: FaqItem[]
  phone: string
  brandName: string | undefined
  items: PublicServiceItem[]
  minPrice: number
  maxPrice: number
}

export function useServiceLandingSeo({ meta, customSeo, faq, phone, brandName, items, minPrice, maxPrice }: Params) {
  useEffect(() => {
    if (!meta) return
    document.title = customSeo?.meta_title || meta.metaTitle

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
    desc.setAttribute("content", customSeo?.meta_description || meta.metaDescription)

    if (customSeo?.meta_keywords) {
      let kw = document.querySelector('meta[name="keywords"]')
      if (!kw) {
        kw = document.createElement("meta")
        kw.setAttribute("name", "keywords")
        document.head.appendChild(kw)
      }
      kw.setAttribute("content", customSeo.meta_keywords)
    }

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement("link")
      canonical.setAttribute("rel", "canonical")
      document.head.appendChild(canonical)
    }
    canonical.setAttribute("href", `${window.location.origin}/uslugi/${meta.slug}`)

    window.scrollTo(0, 0)
  }, [meta, customSeo])

  useEffect(() => {
    if (!meta || faq.length === 0) return

    const origin = window.location.origin
    const pageUrl = `${origin}/uslugi/${meta.slug}`
    const brand = brandName || "FixKey"

    const provider = {
      "@type": "LocalBusiness",
      name: brand,
      telephone: phone,
      address: { "@type": "PostalAddress", addressLocality: "Хабаровск", addressCountry: "RU" },
    }

    const priceBlock =
      items.length > 0
        ? {
            offers: {
              "@type": "AggregateOffer",
              priceCurrency: "RUB",
              lowPrice: minPrice,
              highPrice: maxPrice,
              offerCount: items.length,
              availability: "https://schema.org/InStock",
              areaServed: { "@type": "City", name: "Хабаровск" },
              seller: provider,
            },
          }
        : {}

    const priceList =
      items.length > 0
        ? [
            {
              "@type": "OfferCatalog",
              name: `Цены: ${meta.h1}`,
              url: pageUrl,
              itemListElement: items.slice(0, 60).map((item, i) => ({
                "@type": "Offer",
                position: i + 1,
                name: item.name,
                description: item.description || undefined,
                price: item.price,
                priceCurrency: "RUB",
                availability: "https://schema.org/InStock",
                url: pageUrl,
                priceSpecification: {
                  "@type": "UnitPriceSpecification",
                  price: item.price,
                  priceCurrency: "RUB",
                  unitText: item.unit || "усл.",
                },
                itemOffered: {
                  "@type": "Service",
                  name: item.name,
                  serviceType: item.subcategory || meta.category,
                },
                seller: provider,
              })),
            },
          ]
        : []

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
          provider,
          url: pageUrl,
          ...priceBlock,
        },
        ...priceList,
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
  }, [meta, faq, phone, brandName, items, minPrice, maxPrice])
}
