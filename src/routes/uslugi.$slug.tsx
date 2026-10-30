import { createFileRoute } from "@tanstack/react-router"
import { funcUrl, type PublicServiceCategory, type PublicServiceItem } from "@/lib/api"
import { resolveLandingBySlug } from "@/lib/serviceLanding"
import ServiceLanding from "@/pages/ServiceLanding"
import { buildHead, findPage, loadPublicSeo } from "@/lib/pageHead"
import { findLandingBySlug } from "@/lib/serviceLanding"
import { serviceImage } from "@/lib/serviceImages"

export const Route = createFileRoute("/uslugi/$slug")({
  // Прайс и текст услуги — в готовой странице: поисковик видит у каждой услуги своё содержимое, а не пустой шаблон
  loader: async ({ params }) => {
    const get = async <T,>(q: string): Promise<T | null> => {
      try {
        const r = await fetch(`${funcUrl("site")}?${q}`, { signal: AbortSignal.timeout(4000) })
        return r.ok ? ((await r.json()) as T) : null
      } catch {
        return null
      }
    }
    const [seo, cats] = await Promise.all([loadPublicSeo(), get<{ categories: PublicServiceCategory[] }>("resource=public_services")])
    const categories = cats?.categories || []
    const meta = resolveLandingBySlug(params.slug, categories.map((c) => c.category))
    const items = meta ? (await get<{ items: PublicServiceItem[] }>(`resource=public_services&category=${encodeURIComponent(meta.category)}`))?.items || [] : []
    return { ...seo, slug: params.slug, categories, items }
  },
  head: ({ loaderData, params }) => {
    const path = `/uslugi/${params.slug}`
    const page = findPage(loaderData, path)
    const curated = findLandingBySlug(params.slug)
    const label = page?.page_label || curated?.category || "Услуги"
    return buildHead({
      path,
      title: page?.meta_title || curated?.metaTitle || `${label} в Хабаровске — цены | FixKey`,
      description:
        page?.meta_description ||
        curated?.metaDescription ||
        `${label} в Хабаровске: прайс по каждой позиции, фиксированная смета, гарантия 3 года.`,
      keywords: page?.meta_keywords,
      image: page?.og_image || page?.image_url || serviceImage(params.slug),
      noindex: page ? !page.is_indexed : false,
    })
  },
  component: ServiceLandingRoute,
})

function ServiceLandingRoute() {
  const data = Route.useLoaderData()
  return <ServiceLanding initialCategories={data?.categories} initialItems={data?.items} />
}
