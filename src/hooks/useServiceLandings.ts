import { useEffect, useState } from "react"
import { siteApi, PublicServiceCategory } from "@/lib/api"
import { ServiceLandingMeta, resolveLandings } from "@/lib/serviceLanding"

let cache: PublicServiceCategory[] | null = null
let inflight: Promise<PublicServiceCategory[]> | null = null

function load(): Promise<PublicServiceCategory[]> {
  if (cache) return Promise.resolve(cache)
  if (!inflight) {
    inflight = siteApi
      .getPublicServiceCategories()
      .then((res) => {
        cache = res.categories || []
        return cache
      })
      .catch(() => {
        inflight = null
        return []
      })
  }
  return inflight
}

export function useServiceLandings() {
  const [stats, setStats] = useState<PublicServiceCategory[]>(cache || [])
  const [loading, setLoading] = useState(!cache)

  useEffect(() => {
    let alive = true
    load()
      .then((data) => {
        if (alive) setStats(data)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const categories = stats.map((s) => s.category)
  const landings: ServiceLandingMeta[] = resolveLandings(categories)

  const statsByCategory: Record<string, PublicServiceCategory> = {}
  stats.forEach((s) => {
    statsByCategory[s.category] = s
  })

  return { landings, categories, statsByCategory, loading }
}
