import { Dispatch, SetStateAction } from "react"
import Icon from "@/components/ui/icon"
import type { PromoDesign } from "@/lib/promoTypes"
import { ToolBtn } from "./ui"

interface Props {
  design: PromoDesign
  sideIdx: number
  isCard: boolean
  w: number
  h: number
  zoom: number
  fitZoom: number
  setZoom: Dispatch<SetStateAction<number>>
  onSelectSide: (i: number) => void
  onAddBack: () => void
  onCopySide: () => void
  onDeleteBack: () => void
  onClearSide: () => void
}

/** Нижняя панель: стороны макета, очистка и масштаб */
export function EditorFooter({ design, sideIdx, isCard, w, h, zoom, fitZoom, setZoom, onSelectSide, onAddBack, onCopySide, onDeleteBack, onClearSide }: Props) {
  return (
    <footer className="flex h-14 shrink-0 items-center gap-3 border-t border-white/10 bg-[#1a1a1a] px-3">
      {design.sides.length > 1 ? (
        <div className="flex rounded-lg bg-[#161616] p-1">
          {design.sides.map((_, i) => (
            <button
              key={i}
              onClick={() => onSelectSide(i)}
              className={`rounded-md px-3 py-1.5 text-xs ${sideIdx === i ? "bg-[#D4AF37] font-medium text-[#161616]" : "text-white/60 hover:text-white"}`}
            >
              {i === 0 ? "Лицевая сторона" : "Оборотная сторона"}
            </button>
          ))}
        </div>
      ) : (
        <button onClick={onAddBack} className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10">
          <Icon name="Plus" size={13} /> Добавить оборот
        </button>
      )}
      {design.sides.length > 1 && (
        <>
          <ToolBtn icon="Copy" title="Скопировать эту сторону на другую" onClick={onCopySide} />
          {!isCard && <ToolBtn icon="Trash2" title="Удалить оборот" onClick={onDeleteBack} />}
        </>
      )}
      <ToolBtn icon="Eraser" title="Очистить сторону" onClick={onClearSide} />
      <span className="hidden text-xs text-white/35 md:inline">
        {w}×{h} мм · пунктир — безопасная зона
      </span>
      <div className="ml-auto flex items-center gap-1">
        <ToolBtn icon="Minus" title="Уменьшить" onClick={() => setZoom((z) => Math.max(0.5, z / 1.2))} />
        <button onClick={() => setZoom(fitZoom)} className="w-14 rounded-md py-1.5 text-center text-xs text-white/70 hover:bg-white/10" title="Вписать в экран">
          {Math.round((zoom / fitZoom) * 100)}%
        </button>
        <ToolBtn icon="Plus" title="Увеличить" onClick={() => setZoom((z) => Math.min(40, z * 1.2))} />
      </div>
    </footer>
  )
}

export default EditorFooter
