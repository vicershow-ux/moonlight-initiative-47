import Icon from "@/components/ui/icon"
import { PlanTool } from "@/components/crm/planner/PlanCanvas"
import { LAYERS, PlanLayer, PlanPoint } from "@/lib/planner/types"

export const goldBtn =
  "flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 min-h-[44px] rounded-lg disabled:opacity-40"

export const ghostBtn =
  "flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 transition-colors text-sm px-4 min-h-[44px] rounded-lg disabled:opacity-40"

const TOOLS: { key: PlanTool; label: string; icon: string }[] = [
  { key: "select", label: "Выбор", icon: "MousePointer2" },
  { key: "draw", label: "Стены", icon: "PenLine" },
  { key: "window", label: "Окно", icon: "RectangleHorizontal" },
  { key: "door", label: "Дверь", icon: "DoorOpen" },
  { key: "arch", label: "Проём", icon: "Frame" },
]

const ENGINEER_TOOLS: { key: PlanTool; label: string; icon: string }[] = [
  { key: "select", label: "Выбор", icon: "MousePointer2" },
  { key: "node", label: "Поставить точку", icon: "CirclePlus" },
  { key: "link", label: "Соединить", icon: "Spline" },
]

interface LayerProps {
  layer: PlanLayer
  changeLayer: (next: PlanLayer) => void
}

/** Переключатель слоёв: планировка, электрика, сантехника */
export function PlannerLayerBar({ layer, changeLayer }: LayerProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-[#1f1f1f] p-2">
      <span className="px-2 text-xs uppercase text-white/40">Слой</span>
      {LAYERS.map((l) => (
        <button
          key={l.value}
          onClick={() => changeLayer(l.value)}
          className={`flex min-h-[40px] items-center gap-2 rounded-lg px-4 text-sm transition-colors ${
            layer === l.value
              ? "bg-[#D4AF37] text-[#161616]"
              : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          <Icon name={l.icon} size={16} />
          {l.label}
        </button>
      ))}
      {layer !== "plan" && (
        <span className="ml-auto pr-2 text-xs text-white/40">
          Планировка показана подложкой — менять её можно на слое «Планировка»
        </span>
      )}
    </div>
  )
}

interface ToolbarProps {
  layer: PlanLayer
  tool: PlanTool
  setTool: (t: PlanTool) => void
  draft: PlanPoint[]
  setDraft: (p: PlanPoint[]) => void
  setLinkFromId: (id: string | null) => void
  finishRoom: (points: PlanPoint[]) => void
  exportPdf: () => void
  save: () => void
  exporting: boolean
  saving: boolean
}

/** Инструменты рисования и кнопки «Скачать PDF» и «Сохранить» */
export function PlannerToolbar({
  layer,
  tool,
  setTool,
  draft,
  setDraft,
  setLinkFromId,
  finishRoom,
  exportPdf,
  save,
  exporting,
  saving,
}: ToolbarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        {(layer === "plan" ? TOOLS : ENGINEER_TOOLS).map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTool(t.key)
              if (t.key !== "draw") setDraft([])
              if (t.key !== "link") setLinkFromId(null)
            }}
            className={`flex min-h-[42px] items-center gap-2 rounded-lg px-3 text-sm transition-colors ${
              tool === t.key
                ? "bg-[#D4AF37] text-[#161616]"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            <Icon name={t.icon} size={16} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {draft.length > 0 && (
          <>
            <button className={ghostBtn} onClick={() => setDraft(draft.slice(0, -1))}>
              <Icon name="Undo2" size={16} />
              Отменить точку
            </button>
            {draft.length >= 3 && (
              <button className={goldBtn} onClick={() => finishRoom(draft)}>
                <Icon name="Check" size={16} />
                Замкнуть
              </button>
            )}
          </>
        )}
        <button className={ghostBtn} onClick={exportPdf} disabled={exporting}>
          <Icon
            name={exporting ? "Loader2" : "Download"}
            size={16}
            className={exporting ? "animate-spin" : ""}
          />
          Скачать PDF
        </button>
        <button className={goldBtn} onClick={save} disabled={saving}>
          <Icon
            name={saving ? "Loader2" : "Save"}
            size={16}
            className={saving ? "animate-spin" : ""}
          />
          Сохранить
        </button>
      </div>
    </div>
  )
}

export default PlannerToolbar
