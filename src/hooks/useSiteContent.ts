import { useEffect, useState } from "react"
import { siteApi, SitePublicContent } from "@/lib/api"

let cache: SitePublicContent | null = null
let inflight: Promise<SitePublicContent> | null = null

export function useSiteContent() {
  const [content, setContent] = useState<SitePublicContent | null>(cache)
  const [loading, setLoading] = useState(!cache)

  useEffect(() => {
    if (cache) {
      setContent(cache)
      setLoading(false)
      return
    }
    if (!inflight) {
      inflight = siteApi.getPublic()
    }
    inflight
      .then((data: SitePublicContent) => {
        cache = data
        setContent(data)
      })
      .finally(() => setLoading(false))
  }, [])

  return { content, loading }
}