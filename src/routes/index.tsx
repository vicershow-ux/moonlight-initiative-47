import { createFileRoute } from "@tanstack/react-router"
import Index from "@/pages/Index"
import { buildHead, findPage, loadPublicSeo } from "@/lib/pageHead"

const TITLE = "Ремонт квартир под ключ в Хабаровске — FixKey"
const DESCRIPTION =
  "Ремонт квартир и домов под ключ в Хабаровске и Хабаровском р-не. Фиксированная смета до начала работ, гарантия 3 года, контроль на каждом этапе."

export const Route = createFileRoute("/")({
  loader: () => loadPublicSeo(),
  head: ({ loaderData }) => {
    const page = findPage(loaderData, "/")
    const site = loaderData?.site
    return buildHead({
      path: "/",
      title: page?.meta_title || site?.meta_title || TITLE,
      description: page?.meta_description || site?.meta_description || DESCRIPTION,
      keywords: page?.meta_keywords || site?.meta_keywords,
      image: page?.og_image || site?.og_image,
      noindex: page ? !page.is_indexed : false,
    })
  },
  component: Index,
})
