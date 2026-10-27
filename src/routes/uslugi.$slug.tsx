import { createFileRoute } from "@tanstack/react-router"
import ServiceLanding from "@/pages/ServiceLanding"
import { buildHead, findPage, loadPublicSeo } from "@/lib/pageHead"
import { findLandingBySlug } from "@/lib/serviceLanding"
import { serviceImage } from "@/lib/serviceImages"

export const Route = createFileRoute("/uslugi/$slug")({
  loader: ({ params }) => loadPublicSeo().then((seo) => ({ ...seo, slug: params.slug })),
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
  component: ServiceLanding,
})
