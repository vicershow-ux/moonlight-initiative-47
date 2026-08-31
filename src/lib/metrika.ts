export type MetrikaGoal = "lead_submit" | "lead_form_start" | "phone_click" | "calc_used"

interface GoalParams {
  [key: string]: string | number | undefined
}

function counterIds(): number[] {
  const ids = new Set<number>()
  if (window.__ymId) ids.add(window.__ymId)

  document.querySelectorAll("script[src*='metrika/tag.js']").forEach((el) => {
    const src = el.getAttribute("src") || ""
    const match = src.match(/[?&]id=(\d+)/)
    if (match) ids.add(Number(match[1]))
  })

  return [...ids]
}

export function reachGoal(goal: MetrikaGoal, params?: GoalParams) {
  if (typeof window === "undefined") return
  if (window.__isCabinet) return

  const clean: GoalParams = {}
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") clean[key] = value
    })
  }
  const hasParams = Object.keys(clean).length > 0

  try {
    if (typeof window.ym === "function") {
      counterIds().forEach((id) => {
        if (hasParams) window.ym?.(id, "reachGoal", goal, clean)
        else window.ym?.(id, "reachGoal", goal)
      })
    }

    if (typeof window.gtag === "function") {
      window.gtag("event", goal, hasParams ? clean : undefined)
    }
  } catch {
    /* аналитика не должна ломать интерфейс */
  }
}

export function sourceFromPath(pathname: string): string {
  if (pathname === "/") return "Главная"
  if (pathname === "/uslugi") return "Раздел услуг"
  if (pathname.startsWith("/uslugi/")) return pathname.replace("/uslugi/", "")
  return pathname
}