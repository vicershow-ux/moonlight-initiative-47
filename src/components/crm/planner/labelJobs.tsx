import type { CSSProperties, ReactNode } from "react"
import { Box, LabelCandidate, LabelSpot, createLabelPlacer } from "@/lib/planner/labelLayout"

/** Подпись, ждущая места: варианты размещения и как её нарисовать */
export interface LabelJob {
  /** Меньше — раньше получает место: выбранное, точки, размеры, трассы */
  prio: number
  cands: LabelCandidate[]
  /** Запасной короткий вариант, если полный не влез */
  fallback?: LabelCandidate[]
  render: (spot: LabelSpot, isFallback: boolean) => ReactNode
}

/** Тёмная обводка букв — текст читается поверх линий и сетки */
export const halo: CSSProperties = {
  paintOrder: "stroke",
  stroke: "#141414",
  strokeWidth: 3,
  strokeLinejoin: "round",
}

/** Раскладывает подписи по приоритету; которым не нашлось места — не рисуются */
export function layoutLabels(jobs: LabelJob[], obstacles: Box[]): ReactNode[] {
  const placer = createLabelPlacer(obstacles)
  const out: ReactNode[] = []
  const sorted = jobs.map((j, i) => ({ j, i })).sort((a, b) => a.j.prio - b.j.prio || a.i - b.i)
  for (const { j } of sorted) {
    const spot = placer.place(j.cands)
    if (spot) {
      out.push(j.render(spot, false))
      continue
    }
    if (j.fallback?.length) {
      const fb = placer.place(j.fallback)
      if (fb) out.push(j.render(fb, true))
    }
  }
  return out
}
