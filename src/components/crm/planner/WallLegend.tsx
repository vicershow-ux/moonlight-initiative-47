import { useMemo, useState } from "react"
import Icon from "@/components/ui/icon"
import { PlanScheme, WALL_MATERIALS } from "@/lib/planner/types"
import { schemeWalls } from "@/lib/planner/walls"
import { toMm } from "@/lib/planner/geometry"
import { materialSwatchSvg, usedMaterials } from "@/lib/planner/wallHatch"

/** Условные обозначения материалов стен поверх плана — сворачиваются */
export function WallLegend({ scheme }: { scheme: PlanScheme }) {
  const [open, setOpen] = useState(true)
  const items = useMemo(() => {
    const all = schemeWalls(scheme).all
    return usedMaterials(all.map((w) => w.material)).map((m) => ({
      m,
      th: [...new Set(all.filter((w) => w.material === m).map((w) => toMm(w.thickness)))].sort((a, b) => a - b),
    }))
  }, [scheme])

  if (!items.length) return null

  return (
    <div className="absolute left-3 top-3 z-10 max-w-[260px] rounded-lg border border-white/10 bg-[#1f1f1f]/95 text-xs shadow-lg">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-white/60 hover:text-white">
        <Icon name="Layers" size={13} />
        <span className="flex-1 text-left">Материалы стен</span>
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={13} />
      </button>
      {open && (
        <div className="space-y-1.5 border-t border-white/10 px-2.5 py-2">
          {items.map(({ m, th }) => (
            <div key={m} className="flex items-center gap-2">
              <span className="shrink-0 leading-none" dangerouslySetInnerHTML={{ __html: materialSwatchSvg(m, 30, 14) }} />
              <span className="min-w-0 flex-1 truncate text-white/85">{WALL_MATERIALS[m].label}</span>
              <span className="shrink-0 text-white/40">{th.join(", ")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WallLegend
