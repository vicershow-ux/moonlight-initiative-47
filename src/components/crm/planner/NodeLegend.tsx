import { useMemo, useState } from "react"
import Icon from "@/components/ui/icon"
import { PlanLayer, PlanScheme } from "@/lib/planner/types"
import { nodeLegendItems } from "@/lib/planner/nodeLegend"
import { NodeSymbolIcon } from "./NodeSymbol"

/** Условные обозначения точек на слое электрики или сантехники — сворачиваются */
export function NodeLegend({ scheme, layer }: { scheme: PlanScheme; layer: Exclude<PlanLayer, "plan"> }) {
  const [open, setOpen] = useState(true)
  const items = useMemo(() => nodeLegendItems(scheme.nodes || [], layer), [scheme.nodes, layer])

  if (!items.length) return null

  return (
    <div className="absolute left-3 top-3 z-10 max-h-[70%] max-w-[270px] overflow-y-auto rounded-lg border border-white/10 bg-[#1f1f1f]/95 text-xs shadow-lg">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-white/60 hover:text-white">
        <Icon name="Layers" size={13} />
        <span className="flex-1 text-left">Условные обозначения</span>
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={13} />
      </button>
      {open && (
        <div className="space-y-1.5 border-t border-white/10 px-2.5 py-2">
          {items.map((i) => (
            <div key={i.kind} className="flex items-center gap-2">
              <span className="flex w-8 shrink-0 justify-center text-white/90">
                <NodeSymbolIcon kind={i.kind} height={16} />
              </span>
              {i.code && <span className="w-9 shrink-0 font-bold text-[#D4AF37]">{i.code}</span>}
              <span className="min-w-0 flex-1 truncate text-white/85">{i.label}</span>
              <span className="shrink-0 text-white/40">{i.count} шт.</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NodeLegend
