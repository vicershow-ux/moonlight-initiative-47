import { funcUrl, PageSeo } from "@/lib/api"

export const SITE_ORIGIN = "https://fixkey.ru"
export const DEFAULT_OG_IMAGE =
  "https://cdn.poehali.dev/projects/17c1a9d3-9c72-4270-abec-e542b49c03f2/files/og-image-1792749059216.png"

export interface PublicSiteSeo {
  brand_name: string
  og_image: string
  seo_region: string
  meta_title: string
  meta_description: string
  meta_keywords: string
}

export interface PublicSeoData {
  pages: PageSeo[]
  site: Partial<PublicSiteSeo>
}

/** Тексты для поиска из кабинета: грузятся при открытии страницы, чтобы поисковик сразу видел свои у каждой страницы */
export async function loadPublicSeo(): Promise<PublicSeoData> {
  try {
    const res = await fetch(`${funcUrl("site")}?resource=public_page_seo`, { signal: AbortSignal.timeout(4000) })
    if (!res.ok) return { pages: [], site: {} }
    const data = (await res.json()) as Partial<PublicSeoData>
    return { pages: data.pages || [], site: data.site || {} }
  } catch {
    return { pages: [], site: {} }
  }
}

export function findPage(data: PublicSeoData | undefined, path: string) {
  return data?.pages.find((p) => p.page_path === path)
}

interface HeadInput {
  title: string
  description: string
  path: string
  keywords?: string
  image?: string
  noindex?: boolean
}

export function buildHead({ title, description, path, keywords, image, noindex }: HeadInput) {
  const url = `${SITE_ORIGIN}${path === "/" ? "/" : path}`
  const img = image || DEFAULT_OG_IMAGE
  return {
    meta: [
      { title },
      { name: "description", content: description },
      ...(keywords ? [{ name: "keywords", content: keywords }] : []),
      ...(noindex ? [{ name: "robots", content: "noindex, follow" }] : []),
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: img },
      { property: "og:image:alt", content: title },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: img },
    ],
    links: [{ rel: "canonical", href: url }],
  }
}
