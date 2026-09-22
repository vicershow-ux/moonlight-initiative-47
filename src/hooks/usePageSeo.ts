import { useEffect, useState } from "react"
import { PageSeo, siteApi } from "@/lib/api"

let cache: Map<string, PageSeo> | null = null
let pending: Promise<Map<string, PageSeo>> | null = null

/** Тексты грузим один раз на сессию — они одинаковы для всех страниц */
function loadPageSeo(): Promise<Map<string, PageSeo>> {
  if (cache) return Promise.resolve(cache)
  if (pending) return pending

  pending = siteApi
    .getPublicPageSeo()
    .then((data) => {
      const map = new Map<string, PageSeo>()
      for (const p of data.pages || []) {
        if (p && p.page_path) map.set(p.page_path, p)
      }
      cache = map
      return map
    })
    .catch(() => new Map<string, PageSeo>())
    .finally(() => {
      pending = null
    })

  return pending
}

/**
 * Возвращает SEO-тексты для адреса, заданные владельцем в кабинете.
 * Если их нет — undefined, и страница берёт свои обычные тексты.
 */
export function usePageSeo(path: string | undefined) {
  const [seo, setSeo] = useState<PageSeo | undefined>(() =>
    path && cache ? cache.get(path) : undefined,
  )

  useEffect(() => {
    if (!path) return
    let alive = true
    loadPageSeo().then((map) => {
      if (alive) setSeo(map.get(path))
    })
    return () => {
      alive = false
    }
  }, [path])

  return seo
}
