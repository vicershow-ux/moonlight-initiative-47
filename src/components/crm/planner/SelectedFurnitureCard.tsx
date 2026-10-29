import Icon from "@/components/ui/icon"
import { DeleteButton } from "@/components/ui/delete-button"
import { fromMm, toMm } from "@/lib/planner/geometry"
import { useState } from "react"
import { FURNITURE_PRESETS, LibraryItem, PlanFurniture, PlanScheme, furnitureProps } from "@/lib/planner/types"
import { furnitureWallDims, setFurnitureGap, snapFurnitureToWall } from "@/lib/planner/interior"

const SIDE = { back: "Сзади (к стене)", front: "Спереди", left: "Слева", right: "Справа" } as const

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"
const labelCls = "mb-1.5 block text-xs text-white/50"

interface Props {
  item: PlanFurniture
  scheme: PlanScheme
  onUpdate: (id: string, patch: Partial<PlanFurniture>) => void
  onDelete: (id: string) => void
  onSaveToLibrary?: (f: PlanFurniture) => Promise<LibraryItem>
  library?: LibraryItem[]
  onUpdateLibraryItem?: (item: LibraryItem) => Promise<void>
}

/** Карточка предмета мебели: подпись, размеры, поворот, прижать к стене */
export function SelectedFurnitureCard({ item, scheme, onUpdate, onDelete, onSaveToLibrary, library = [], onUpdateLibraryItem }: Props) {
  const [libBusy, setLibBusy] = useState(false)
  const [libNote, setLibNote] = useState("")
  const libItem = item.libraryId ? library.find((l) => l.id === item.libraryId) || null : null
  // Отличается ли предмет на плане от сохранённого в библиотеке — тогда можно обновить библиотеку
  const libDiffers =
    !!libItem &&
    (Math.abs(libItem.width - item.w) > 0.0005 ||
      Math.abs(libItem.depth - item.d) > 0.0005 ||
      Math.abs(libItem.height - item.h) > 0.0005 ||
      (item.label && item.label !== libItem.name))
  const toLibrary = async () => {
    if (!onSaveToLibrary) return
    setLibBusy(true)
    setLibNote("")
    try {
      if (libItem && onUpdateLibraryItem) {
        await onUpdateLibraryItem({ ...libItem, name: item.label || libItem.name, width: item.w, depth: item.d, height: item.h })
        setLibNote("Библиотека обновлена")
      } else {
        const it = await onSaveToLibrary(item)
        setLibNote(`«${it.name}» сохранён — он в разделе «Мои» на любом объекте`)
      }
    } catch (e) {
      setLibNote(e instanceof Error ? e.message : "Не удалось сохранить")
    } finally {
      setLibBusy(false)
    }
  }
  const pr = { ...FURNITURE_PRESETS[item.kind], ...furnitureProps(item) }
  const dims = furnitureWallDims(scheme, item)
  const num = (field: "w" | "d" | "h", label: string) => (
    <div>
      <label className={labelCls}>{label}, мм</label>
      <input
        className={inputCls}
        type="number"
        min="50"
        step="10"
        value={toMm(item[field])}
        onChange={(e) => onUpdate(item.id, { [field]: Math.max(fromMm(Number(e.target.value)), 0.05) })}
      />
    </div>
  )
  return (
    <div className="rounded-xl border border-[#D4AF37]/30 bg-[#1f1f1f] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon name="Sofa" size={15} />
          {pr.label}
        </div>
        <DeleteButton onConfirm={() => onDelete(item.id)} title="Удалить предмет?" />
      </div>
      <div className="mb-3">
        <label className={labelCls}>Подпись</label>
        <input className={inputCls} placeholder={pr.label} value={item.label} onChange={(e) => onUpdate(item.id, { label: e.target.value })} />
      </div>
      <div className="mb-3 grid grid-cols-3 gap-2">
        {num("w", "Ширина")}
        {num("d", "Глубина")}
        {num("h", "Высота")}
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {[0, 90, 180, 270].map((r) => (
          <button
            key={r}
            onClick={() => onUpdate(item.id, { rot: r })}
            className={`min-h-[34px] rounded-lg px-3 text-sm ${item.rot === r ? "bg-[#D4AF37] text-[#161616]" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
          >
            {r}°
          </button>
        ))}
        <button
          onClick={() => onUpdate(item.id, { rot: (item.rot + 90) % 360 })}
          className="flex min-h-[34px] items-center gap-1 rounded-lg bg-white/5 px-3 text-sm text-white/60 hover:bg-white/10"
          title="Повернуть на 90°"
        >
          <Icon name="RotateCw" size={14} />
        </button>
        <button
          onClick={() => {
            const sn = snapFurnitureToWall(scheme, item, 3)
            if (sn) onUpdate(item.id, sn)
          }}
          className="flex min-h-[34px] items-center gap-1 rounded-lg bg-white/5 px-3 text-sm text-white/60 hover:bg-white/10"
        >
          <Icon name="PanelTop" size={14} />
          К стене
        </button>
      </div>
      <div className="mb-3">
        <div className={labelCls}>Отступ от стен, мм</div>
        <div className="grid grid-cols-2 gap-2">
          {(["back", "front", "left", "right"] as const).map((side) => {
            const d = dims.find((x) => x.side === side)
            return (
              <div key={side}>
                <label className="mb-1 block text-[11px] text-white/40">{SIDE[side]}</label>
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  step="10"
                  disabled={!d}
                  value={d ? toMm(d.length) : ""}
                  onChange={(e) => {
                    const p = setFurnitureGap(scheme, item, side, Math.max(fromMm(Number(e.target.value)), 0))
                    if (p) onUpdate(item.id, p)
                  }}
                />
              </div>
            )
          })}
        </div>
        <div className="mt-1 text-[11px] text-white/35">Сзади — сторона, которой предмет стоит к стене. Введите число — предмет сдвинется</div>
      </div>

      {onSaveToLibrary && (
        <div className="mb-3">
          {(!libItem || libDiffers) && (
            <button
              onClick={toLibrary}
              disabled={libBusy}
              className="flex min-h-[38px] w-full items-center justify-center gap-2 rounded-lg border border-[#D4AF37]/40 text-sm text-[#D4AF37] hover:bg-[#D4AF37]/10 disabled:opacity-50"
            >
              <Icon name={libBusy ? "Loader2" : "BookmarkPlus"} size={15} className={libBusy ? "animate-spin" : ""} />
              {libItem ? "Обновить в библиотеке" : "В библиотеку"}
            </button>
          )}
          {libItem && !libDiffers && (
            <div className="flex items-center gap-1.5 text-xs text-[#D4AF37]/80">
              <Icon name="BookmarkCheck" size={13} />
              Из библиотеки: {libItem.name}
            </div>
          )}
          {libNote && <div className="mt-1 text-xs text-white/50">{libNote}</div>}
        </div>
      )}

      <div className="text-xs text-white/40">
        {pr.blocksHeating ? "Под предметом тёплый пол не укладывается. " : ""}
        {pr.blocksSockets ? "Закрывает розетки на стене за собой — проверьте их высоту." : ""}
      </div>
    </div>
  )
}

export default SelectedFurnitureCard
