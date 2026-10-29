import Icon from "@/components/ui/icon"
import type { Orientation, PromoDesign, PromoFormat } from "@/lib/promoTypes"
import { FORMATS } from "./formats"
import { ToolBtn } from "./ui"

interface Props {
  title: string
  design: PromoDesign
  isCard: boolean
  canUndo: boolean
  canRedo: boolean
  saving: boolean
  dirty: boolean
  onClose: () => void
  onTitleChange: (v: string) => void
  onFormat: (format: PromoFormat, orientation: Orientation) => void
  onUndo: () => void
  onRedo: () => void
  onPrint: () => void
  onSave: () => void
}

/** Верхняя панель редактора: название, формат, отмена, печать и сохранение */
export function EditorHeader({ title, design, isCard, canUndo, canRedo, saving, dirty, onClose, onTitleChange, onFormat, onUndo, onRedo, onPrint, onSave }: Props) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 bg-[#1a1a1a] px-3">
      <button onClick={onClose} className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-white/70 hover:bg-white/10">
        <Icon name="ArrowLeft" size={16} />
        <span className="hidden sm:inline">Макеты</span>
      </button>
      <input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="h-9 w-44 min-w-0 rounded-md border border-transparent bg-transparent px-2 text-sm font-medium outline-none hover:border-white/10 focus:border-[#D4AF37]/50 md:w-64"
      />
      <div className="hidden items-center gap-1 rounded-lg bg-[#161616] p-1 lg:flex">
        {(Object.keys(FORMATS) as PromoFormat[])
          .filter((f) => (isCard ? f === "card" : f !== "card"))
          .map((f) => (
            <button key={f} onClick={() => onFormat(f, design.orientation)} className={`rounded-md px-2.5 py-1.5 text-xs ${design.format === f ? "bg-white/15 text-white" : "text-white/50 hover:text-white"}`}>
              {FORMATS[f].label}
            </button>
          ))}
      </div>
      <div className="flex items-center gap-1 rounded-lg bg-[#161616] p-1">
        <ToolBtn icon="RectangleVertical" title="Вертикально" active={design.orientation === "portrait"} onClick={() => onFormat(design.format, "portrait")} />
        <ToolBtn icon="RectangleHorizontal" title="Горизонтально" active={design.orientation === "landscape"} onClick={() => onFormat(design.format, "landscape")} />
      </div>
      <div className="ml-auto flex items-center gap-1">
        <ToolBtn icon="Undo2" title="Отменить (Ctrl+Z)" disabled={!canUndo} onClick={onUndo} />
        <ToolBtn icon="Redo2" title="Повторить (Ctrl+Y)" disabled={!canRedo} onClick={onRedo} />
        <button onClick={onPrint} className="ml-1 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/15">
          <Icon name="Printer" size={15} />
          <span className="hidden sm:inline">Печать</span>
        </button>
        <button onClick={onSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-medium text-[#161616] hover:bg-[#B8860B] disabled:opacity-50">
          <Icon name={saving ? "Loader2" : "Save"} size={15} className={saving ? "animate-spin" : ""} />
          <span className="hidden sm:inline">{dirty ? "Сохранить" : "Сохранено"}</span>
        </button>
      </div>
    </header>
  )
}

export default EditorHeader
