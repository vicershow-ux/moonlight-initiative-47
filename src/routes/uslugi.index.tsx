import { createFileRoute } from "@tanstack/react-router"
import ServicesIndex from "@/pages/ServicesIndex"
import { buildHead, findPage, loadPublicSeo } from "@/lib/pageHead"

const TITLE = "Услуги по ремонту и строительству в Хабаровске — цены | FixKey"
const DESCRIPTION =
  "Все услуги FixKey в Хабаровске: электромонтаж, сантехника, плитка, отделка, потолки, кровля, фасады. Прайс по каждой позиции, фиксированная смета, гарантия 3 года."

export const Route = createFileRoute("/uslugi/")({
  loader: () => loadPublicSeo(),
  head: ({ loaderData }) => {
    const page = findPage(loaderData, "/uslugi")
    return buildHead({
      path: "/uslugi",
      title: page?.meta_title || TITLE,
      description: page?.meta_description || DESCRIPTION,
      keywords: page?.meta_keywords,
      image: page?.og_image || loaderData?.site.og_image,
      noindex: page ? !page.is_indexed : false,
    })
  },
  component: ServicesIndex,
})
