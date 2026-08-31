import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"

declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void
    __ymId?: number
    __ymReady?: boolean
    __isCabinet?: boolean
    gtag?: (command: string, ...args: unknown[]) => void
  }
}

const isCabinetPath = (pathname: string) =>
  pathname === "/cabinet" || pathname.startsWith("/cabinet/")

export function MetrikaTracker() {
  const location = useLocation()
  const previous = useRef<string | null>(null)

  useEffect(() => {
    const id = window.__ymId
    if (!id || typeof window.ym !== "function") return

    const path = location.pathname
    if (isCabinetPath(path)) {
      previous.current = null
      return
    }

    if (!window.__ymReady) {
      window.ym(id, "init", {
        trustedDomains: ["poehali.dev"],
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
        trackHash: true,
      })
      window.__ymReady = true
      previous.current = path + location.search
      return
    }

    const current = path + location.search
    if (previous.current === null) {
      previous.current = current
      return
    }
    if (previous.current === current) return

    window.ym(id, "hit", current, { referer: previous.current })

    document.querySelectorAll("script[src*='metrika/tag.js']").forEach((el) => {
      const match = (el.getAttribute("src") || "").match(/[?&]id=(\d+)/)
      const extra = match ? Number(match[1]) : null
      if (extra && extra !== id) {
        window.ym?.(extra, "hit", current, { referer: previous.current })
      }
    })

    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", { page_path: current })
    }

    previous.current = current
  }, [location.pathname, location.search])

  return null
}

export default MetrikaTracker
