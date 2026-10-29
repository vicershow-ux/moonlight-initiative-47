import { useMemo, useState } from "react"
import Icon from "@/components/ui/icon"
import { PlanScheme, WALL_MATERIALS } from "@/lib/planner/types"
import { schemeWalls } from "@/lib/planner/walls"
import { toMm } from "@/lib/planner/geometry"
import { materialSwatchSvg, usedMaterials } from "@/lib/planner/wallHatch"
import { SCREEN_OPENING_PALETTE, openingLegendItems, openingSwatchSvg } from "@/lib/planner/openingLegend"

/** Условные обозначения поверх плана: материалы стен, окна, двери и проёмы — сворачиваются */
export function WallLegend({ scheme }: { scheme: PlanScheme }) {
  const [open, setOpen] = useState(true)
  const items = useMemo(() => {
    const all = schemeWalls(scheme).all
    return usedMaterials(all.map((w) => w.material)).map((m) => ({
      m,
      th: [...new Set(all.filter((w) => w.material === m).map((w) => toMm(w.thickness)))].sort((a, b) => a - b),
    }))
  }, [scheme])
  const openings = useMemo(() => openingLegendItems(scheme.openings), [scheme.openings])

  if (!items.length && !openings.length) return null

  return (
    <div className="absolute left-3 top-3 z-10 max-w-[260px] rounded-lg border border-white/10 bg-[#1f1f1f]/95 text-xs shadow-lg">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-white/60 hover:text-white">
        <Icon name="Layers" size={13} />
        <span className="flex-1 text-left">Обозначения</span>
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={13} />
      </button>
      {open && (
        <div className="space-y-1.5 border-t border-white/10 px-2.5 py-2">
          {items.length > 0 && <div className="text-[10px] uppercase tracking-wide text-white/35">Материалы стен</div>}
          {items.map(({ m, th }) => (
            <div key={m} className="flex items-center gap-2">
              <span className="shrink-0 leading-none" dangerouslySetInnerHTML={{ __html: materialSwatchSvg(m, 30, 14) }} />
              <span className="min-w-0 flex-1 truncate text-white/85">{WALL_MATERIALS[m].label}</span>
              <span className="shrink-0 text-white/40">{th.join(", ")}</span>
            </div>
          ))}
          {openings.length > 0 && <div className={`text-[10px] uppercase tracking-wide text-white/35 ${items.length ? "pt-1" : ""}`}>Окна, двери, проёмы</div>}
          {openings.map((o) => (
            <div key={o.kind} className="flex items-center gap-2">
              <span className="shrink-0 leading-none" dangerouslySetInnerHTML={{ __html: openingSwatchSvg(o.kind, SCREEN_OPENING_PALETTE, 30, 16) }} />
              <span className="min-w-0 flex-1 truncate text-white/85">{o.label}</span>
              <span className="shrink-0 text-white/40">{o.count} шт.</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WallLegend
