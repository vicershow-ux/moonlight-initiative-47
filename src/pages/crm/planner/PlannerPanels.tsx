import Icon from "@/components/ui/icon"
import { PlanTool } from "@/components/crm/planner/PlanCanvas"
import {
  LINK_SPECS,
  NODE_PRESETS,
  NodeKind,
  PlanLayer,
  PlanScheme,
} from "@/lib/planner/types"

interface PickerProps {
  layer: Exclude<PlanLayer, "plan">
  tool: PlanTool
  setTool: (t: PlanTool) => void
  nodeKind: NodeKind
  setNodeKind: (k: NodeKind) => void
  linkSpec: string
  setLinkSpec: (s: string) => void
  linkFromId: string | null
}

/** Выбор элемента для установки на план либо сечения новой линии */
export function PlannerEngineerPicker({
  layer,
  tool,
  setTool,
  nodeKind,
  setNodeKind,
  linkSpec,
  setLinkSpec,
  linkFromId,
}: PickerProps) {
  return (
    <div className="mb-4 rounded-xl border border-white/10 bg-[#1f1f1f] p-3">
      <div className="mb-2 text-xs uppercase text-white/40">
        {tool === "link" ? "Сечение / диаметр новой линии" : "Что ставим на план"}
      </div>

      {tool === "link" ? (
        <div className="flex flex-wrap gap-2">
          {LINK_SPECS[layer].map((s) => (
            <button
              key={s}
              onClick={() => setLinkSpec(s)}
              className={`min-h-[38px] rounded-lg px-3 text-sm transition-colors ${
                linkSpec === s
                  ? "bg-[#D4AF37] text-[#161616]"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {s}
            </button>
          ))}
          <span className="flex items-center pl-2 text-xs text-white/40">
            {linkFromId
              ? "Кликните по второй точке — линия соединит их"
              : "Кликните по первой точке, затем по второй"}
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {(Object.keys(NODE_PRESETS) as NodeKind[])
            .filter((k) => NODE_PRESETS[k].layer === layer)
            .map((k) => (
              <button
                key={k}
                onClick={() => {
                  setNodeKind(k)
                  setTool("node")
                }}
                className={`flex min-h-[38px] items-center gap-2 rounded-lg px-3 text-sm transition-colors ${
                  nodeKind === k && tool === "node"
                    ? "bg-[#D4AF37] text-[#161616]"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                <Icon name={NODE_PRESETS[k].icon} size={15} />
                {NODE_PRESETS[k].label}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}

interface SettingsProps {
  scheme: PlanScheme
  setAllHeights: (height: number) => void
  syncRooms: boolean
  setSyncRooms: (v: boolean) => void
  fileUrl: string | null
  dirty: boolean
}

/** Высота стен, перенос метража в помещения, ссылка на PDF и метка изменений */
export function PlannerSettingsBar({
  scheme,
  setAllHeights,
  syncRooms,
  setSyncRooms,
  fileUrl,
  dirty,
}: SettingsProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-[#1f1f1f] p-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-white/50">Высота стен, м</span>
        <input
          className="w-24 rounded-lg border border-white/10 bg-[#161616] px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"
          type="number"
          min="1"
          step="0.05"
          value={scheme.defaultHeight}
          onChange={(e) => setAllHeights(Number(e.target.value))}
        />
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-white/60">
        <input
          type="checkbox"
          checked={syncRooms}
          onChange={(e) => setSyncRooms(e.target.checked)}
          className="h-4 w-4 accent-[#D4AF37]"
        />
        Переносить метраж в помещения объекта
      </label>
      {fileUrl && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-sm text-[#D4AF37] hover:text-[#B8860B]"
        >
          <Icon name="FileText" size={15} />
          Открыть сохранённый PDF
        </a>
      )}
      {dirty && (
        <span className="flex items-center gap-1.5 text-xs text-amber-400">
          <Icon name="CircleAlert" size={13} />
          Есть несохранённые изменения
        </span>
      )}
    </div>
  )
}

export default PlannerSettingsBar
