import { useEffect, useMemo, useState } from "react"
import { Navigate, useParams } from "react-router-dom"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { useSiteContent } from "@/hooks/useSiteContent"
import { siteApi, PublicServiceItem } from "@/lib/api"
import { resolveLandingBySlug } from "@/lib/serviceLanding"
import { useServiceLandings } from "@/hooks/useServiceLandings"
import { usePageSeo } from "@/hooks/usePageSeo"
import { getServiceFaq } from "@/lib/serviceFaq"
import Icon from "@/components/ui/icon"
import PageNotFound from "@/pages/PageNotFound"
import { WorkCartBar } from "@/components/services/WorkCartBar"
import { useServiceLandingSeo } from "@/components/service-landing/useServiceLandingSeo"
import { ServiceLandingHero } from "@/components/service-landing/ServiceLandingHero"
import { ServiceLandingPrices } from "@/components/service-landing/ServiceLandingPrices"
import { ServiceLandingBottom } from "@/components/service-landing/ServiceLandingBottom"

export default function ServiceLanding() {
  const { slug } = useParams<{ slug: string }>()
  const { landings, categories, loading: catsLoading } = useServiceLandings()
  const meta = resolveLandingBySlug(slug, categories)
  // Тексты, заданные владельцем в кабинете, важнее шаблонных
  const customSeo = usePageSeo(slug ? `/uslugi/${slug}` : undefined)
  const { content } = useSiteContent()
  const s = content?.settings

  const [items, setItems] = useState<PublicServiceItem[]>([])
  const [loading, setLoading] = useState(true)

  const faq = useMemo(() => (meta ? getServiceFaq(meta) : []), [meta])

  const minPrice = useMemo(
    () => (items.length ? Math.min(...items.map((i) => i.price)) : 0),
    [items],
  )

  const maxPrice = useMemo(
    () => (items.length ? Math.max(...items.map((i) => i.price)) : 0),
    [items],
  )

  const phone = s?.phone || "+7 (495) 123-45-67"
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`

  useServiceLandingSeo({
    meta,
    customSeo,
    faq,
    phone,
    brandName: s?.brand_name,
    items,
    minPrice,
    maxPrice,
  })

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

  if (slug === "ventilyaciya-i-kondicionirovanie") return <Navigate to="/uslugi/ventilyaciya" replace />
  if (!meta) return <PageNotFound />

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <ServiceLandingHero
          meta={meta}
          customSeo={customSeo}
          phone={phone}
          phoneHref={phoneHref}
          loading={loading}
          itemsCount={items.length}
          minPrice={minPrice}
        />

        <ServiceLandingPrices meta={meta} loading={loading} items={items} grouped={grouped} />

        <ServiceLandingBottom meta={meta} faq={faq} phone={phone} phoneHref={phoneHref} others={others} />
      </main>

      <Footer />
      <WorkCartBar />
    </div>
  )
}
