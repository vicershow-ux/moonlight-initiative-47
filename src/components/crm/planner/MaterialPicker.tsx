import { useMemo, useState } from "react"
import Icon from "@/components/ui/icon"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { fromMm, toMm } from "@/lib/planner/geometry"
import { FinishMaterial, MATERIAL_CATEGORIES, MaterialCategory, MaterialRef, materialRef } from "@/lib/planner/types"
import { useMaterialLibrary } from "./MaterialLibraryContext"

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"
const labelCls = "mb-1 block text-xs text-white/50"

/** Сжимаем фото до 2048 px по длинной стороне — быстрее грузится в 3D и в PDF */
export async function shrinkImage(file: File): Promise<{ data: string; type: string; ratio: number }> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image()
      i.onload = () => res(i)
      i.onerror = () => rej(new Error("Не удалось открыть картинку"))
      i.src = url
    })
    const k = Math.min(1, 2048 / Math.max(img.width, img.height))
    const c = document.createElement("canvas")
    c.width = Math.round(img.width * k)
    c.height = Math.round(img.height * k)
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height)
    const png = file.type === "image/png" && file.size < 1.5e6
    return { data: c.toDataURL(png ? "image/png" : "image/jpeg", 0.88), type: png ? "image/png" : "image/jpeg", ratio: img.height / img.width }
  } finally {
    URL.revokeObjectURL(url)
  }
}

interface AddProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  defaultCategory?: MaterialCategory
  onCreated?: (m: FinishMaterial) => void
}

/** Новый материал: фото + размер рисунка. Для фрески — размер всего панно */
export function AddMaterialDialog({ open, onOpenChange, defaultCategory = "wallpaper", onCreated }: AddProps) {
  const lib = useMaterialLibrary()
  const [cat, setCat] = useState<MaterialCategory>(defaultCategory)
  const [name, setName] = useState("")
  const [note, setNote] = useState("")
  const [w, setW] = useState(MATERIAL_CATEGORIES[defaultCategory].w)
  const [h, setH] = useState(MATERIAL_CATEGORIES[defaultCategory].h)
  const [gloss, setGloss] = useState(false)
  const [img, setImg] = useState<{ data: string; type: string; ratio: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")
  const mode = MATERIAL_CATEGORIES[cat].mode

  const pickCat = (c: MaterialCategory) => {
    setCat(c)
    setW(MATERIAL_CATEGORIES[c].w)
    setH(img ? Math.round(MATERIAL_CATEGORIES[c].w * img.ratio * 1000) / 1000 : MATERIAL_CATEGORIES[c].h)
  }

  const onFile = async (f: File | undefined) => {
    if (!f) return
    setErr("")
    try {
      const r = await shrinkImage(f)
      setImg(r)
      // Высота рисунка — по пропорциям фото, ширину оставляем
      setH(Math.round(w * r.ratio * 1000) / 1000)
      if (!name) setName(f.name.replace(/\.[^.]+$/, "").slice(0, 80))
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Не удалось открыть картинку")
    }
  }

  const save = async () => {
    if (!img) return setErr("Загрузите фото материала")
    if (!name.trim()) return setErr("Укажите название")
    setBusy(true)
    setErr("")
    try {
      const m = await lib.create({ name: name.trim(), category: cat, width: w, height: h, mode, gloss, unit: "m2", note: note.trim() || null, image: img.data, content_type: img.type })
      onCreated?.(m)
      onOpenChange(false)
      setImg(null)
      setName("")
      setNote("")
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Не удалось сохранить")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-white/10 bg-[#1a1a1a] text-white">
        <DialogHeader>
          <DialogTitle>Свой материал в библиотеку</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(MATERIAL_CATEGORIES) as MaterialCategory[]).map((c) => (
              <button
                key={c}
                onClick={() => pickCat(c)}
                className={`rounded-lg px-2.5 py-1.5 text-xs ${cat === c ? "bg-[#D4AF37] text-[#161616]" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
              >
                {MATERIAL_CATEGORIES[c].label}
              </button>
            ))}
          </div>

          <label className="flex min-h-[150px] cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/20 bg-[#161616] hover:border-[#D4AF37]/50">
            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            {img ? (
              <img src={img.data} alt="" className="max-h-[220px] w-full object-contain" />
            ) : (
              <div className="p-4 text-center text-sm text-white/50">
                <Icon name="ImagePlus" size={26} className="mx-auto mb-2 text-white/40" />
                Фото или скан материала: фреска, обои, ткань, фасад, плитка из каталога
                <div className="mt-1 text-xs text-white/35">JPG, PNG, WEBP до 8 МБ</div>
              </div>
            )}
          </label>

          <div>
            <label className={labelCls}>Название</label>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Фреска Фламинго, Affresco" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>{mode === "panel" ? "Ширина панно, мм" : "Ширина рисунка (повтора), мм"}</label>
              <input className={inputCls} type="number" min="10" step="10" value={toMm(w)} onChange={(e) => setW(Math.max(fromMm(Number(e.target.value)), 0.01))} />
            </div>
            <div>
              <label className={labelCls}>{mode === "panel" ? "Высота панно, мм" : "Высота рисунка, мм"}</label>
              <input className={inputCls} type="number" min="10" step="10" value={toMm(h)} onChange={(e) => setH(Math.max(fromMm(Number(e.target.value)), 0.01))} />
            </div>
          </div>
          <div className="text-[11px] text-white/40">
            {mode === "panel"
              ? "Панно ставится на стену одной картинкой этого размера — как фреска в изголовье."
              : "Сколько реальных миллиметров занимает фото: для плитки — размер плитки, для обоев — ширина рулона и раппорт, для ткани — примерно 300×300."}
          </div>
          <div className="grid grid-cols-[1fr_auto] items-center gap-2">
            <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Артикул, поставщик (для сметы)" />
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" checked={gloss} onChange={(e) => setGloss(e.target.checked)} />
              Глянец
            </label>
          </div>
          {err && <div className="text-sm text-red-300">{err}</div>}
          <button
            onClick={save}
            disabled={busy}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#D4AF37] text-sm text-[#161616] hover:bg-[#B8860B] disabled:opacity-50"
          >
            <Icon name={busy ? "Loader2" : "Save"} size={16} className={busy ? "animate-spin" : ""} />
            Сохранить в библиотеку
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface PickerProps {
  value?: MaterialRef | null
  onChange: (m: MaterialRef | undefined) => void
  /** Какие категории показывать первыми */
  prefer?: MaterialCategory[]
  /** Только повтором или только панно */
  only?: "repeat" | "panel"
  label?: string
}

/** Выбор своего материала: миниатюры из библиотеки, «Без материала», «Добавить» */
export function MaterialPicker({ value, onChange, prefer = [], only, label = "Свой материал с фото" }: PickerProps) {
  const lib = useMaterialLibrary()
  const [open, setOpen] = useState(false)
  const [add, setAdd] = useState(false)
  const list = useMemo(() => {
    const items = lib.items.filter((m) => !only || m.mode === only)
    const rank = (m: FinishMaterial) => (prefer.includes(m.category) ? prefer.indexOf(m.category) : 99)
    return [...items].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, "ru"))
  }, [lib.items, prefer, only])

  return (
    <div>
      <div className="mb-1 text-[11px] text-white/45">{label}</div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen((v) => !v)}
          className={`flex min-h-[40px] flex-1 items-center gap-2 rounded-lg border px-2 text-left text-sm ${value ? "border-[#D4AF37]/40 bg-[#D4AF37]/5" : "border-white/10 bg-[#161616] text-white/50"}`}
        >
          {value ? (
            <>
              <img src={value.url} alt="" className="h-7 w-7 shrink-0 rounded object-cover" />
              <span className="truncate">{value.name}</span>
              <span className="ml-auto shrink-0 text-[11px] text-white/40">
                {value.mode === "panel" ? "панно " : ""}
                {toMm(value.w)}×{toMm(value.h)}
              </span>
            </>
          ) : (
            <>
              <Icon name="Image" size={15} />
              Выбрать из библиотеки
            </>
          )}
        </button>
        {value && (
          <button onClick={() => onChange(undefined)} title="Убрать материал" className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/50 hover:text-red-300">
            <Icon name="X" size={15} />
          </button>
        )}
      </div>
      {open && (
        <div className="mt-2 grid grid-cols-3 gap-1.5 rounded-lg border border-white/10 bg-[#161616] p-2 sm:grid-cols-4">
          {list.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                onChange(materialRef(m))
                setOpen(false)
              }}
              className={`group overflow-hidden rounded-md border text-left ${value?.id === m.id ? "border-[#D4AF37]" : "border-white/10 hover:border-white/30"}`}
              title={`${m.name}${m.note ? ` · ${m.note}` : ""}`}
            >
              <img src={m.image_url} alt="" className="aspect-square w-full object-cover" loading="lazy" />
              <div className="truncate px-1 py-0.5 text-[10px] text-white/60">{m.name}</div>
            </button>
          ))}
          <button
            onClick={() => setAdd(true)}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed border-[#D4AF37]/40 text-[11px] text-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            <Icon name="Plus" size={18} />
            Добавить
          </button>
          {lib.loaded && list.length === 0 && <div className="col-span-2 self-center text-[11px] text-white/40">Загрузите фото фрески, обоев, ткани или плитки</div>}
        </div>
      )}
      <AddMaterialDialog
        open={add}
        onOpenChange={setAdd}
        defaultCategory={only === "panel" ? "fresco" : prefer[0] || "wallpaper"}
        onCreated={(m) => {
          onChange(materialRef(m))
          setOpen(false)
        }}
      />
    </div>
  )
}

export default MaterialPicker
