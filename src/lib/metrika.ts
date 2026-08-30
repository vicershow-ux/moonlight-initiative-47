export type MetrikaGoal = "lead_submit" | "lead_form_start" | "phone_click" | "calc_used"

interface GoalParams {
  [key: string]: string | number | undefined
}

export function reachGoal(goal: MetrikaGoal, params?: GoalParams) {
  if (typeof window === "undefined") return
  const id = window.__ymId
  if (!id || typeof window.ym !== "function") return
  if (window.__isCabinet) return

  const clean: GoalParams = {}
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") clean[key] = value
    })
  }

  try {
    if (Object.keys(clean).length) {
      window.ym(id, "reachGoal", goal, clean)
    } else {
      window.ym(id, "reachGoal", goal)
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
