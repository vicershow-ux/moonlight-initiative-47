import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { fromMm, toMm } from "@/lib/planner/geometry"
import { FURNITURE_PRESETS, FurnitureKind, LibraryItem } from "@/lib/planner/types"
import { furnitureLibraryApi, type FurnitureLibraryInput } from "@/lib/api"

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"
const labelCls = "mb-1.5 block text-xs text-white/50"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  /** Редактирование существующего; без него — новый предмет */
  item?: LibraryItem | null
  onSave: (data: FurnitureLibraryInput, id?: number) => Promise<void>
}

const empty: FurnitureLibraryInput = {
  name: "",
  base_kind: "custom",
  width: 1,
  depth: 0.6,
  height: 0.8,
  at_wall: true,
  blocks_heating: true,
  blocks_sockets: false,
  color: null,
  model_url: null,
}

/** Свой предмет в библиотеку компании: название, вид на плане, размеры и свойства */
export function LibraryItemDialog({ open, onOpenChange, item, onSave }: Props) {
  const [v, setV] = useState<FurnitureLibraryInput>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [modelBusy, setModelBusy] = useState(false)
  const [modelInfo, setModelInfo] = useState("")

  /** GLB: размеры берём из самой модели (подставляем в поля), файл — в хранилище */
  const onModel = async (file: File | undefined) => {
    if (!file) return
    if (!/\.glb$/i.test(file.name)) return setError("Нужен файл .glb")
    if (file.size > 20 * 1024 * 1024) return setError("Модель больше 20 МБ — упростите её")
    setModelBusy(true)
    setError("")
    try {
      const buf = await file.arrayBuffer()
      const { measureGlb } = await import("@/lib/planner/glbModels")
      const dims = await measureGlb(buf)
      const b64 = await new Promise<string>((res, rej) => {
        const r = new FileReader()
        r.onload = () => res(String(r.result).split(",")[1] || "")
        r.onerror = rej
        r.readAsDataURL(file)
      })
      const { url } = await furnitureLibraryApi.uploadModel(b64)
      const patch: Partial<FurnitureLibraryInput> = { model_url: url }
      // Размеры модели — если они похожи на реальные (в метрах), подставляем
      if (dims && dims.w > 0.05 && dims.w < 10 && dims.h > 0.01 && dims.h < 5) Object.assign(patch, { width: dims.w, depth: Math.max(dims.d, 0.02), height: dims.h })
      if (!v.name.trim()) patch.name = file.name.replace(/\.glb$/i, "")
      set(patch)
      setModelInfo(dims ? `Модель ${toMm(dims.w)}×${toMm(dims.d)}×${toMm(dims.h)} мм, ${(file.size / 1048576).toFixed(1)} МБ` : "Модель загружена")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось загрузить модель")
    } finally {
      setModelBusy(false)
    }
  }

  useEffect(() => {
    if (!open) return
    setError("")
    setV(item ? { ...item } : empty)
  }, [open, item])

  const set = (patch: Partial<FurnitureLibraryInput>) => setV((x) => ({ ...x, ...patch }))
  const pickKind = (k: FurnitureKind) => {
    const p = FURNITURE_PRESETS[k]
    // Новый предмет берёт типовые размеры и свойства выбранного вида — их можно поправить
    set(item ? { base_kind: k } : { base_kind: k, width: p.w, depth: p.d, height: p.h, at_wall: p.wall, blocks_heating: p.blocksHeating, blocks_sockets: p.blocksSockets })
  }

  const save = async () => {
    if (!v.name.trim()) return setError("Укажите название")
    setSaving(true)
    setError("")
    try {
      await onSave({ ...v, name: v.name.trim() }, item?.id)
      onOpenChange(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить")
    } finally {
      setSaving(false)
    }
  }

  const mmInput = (field: "width" | "depth" | "height", label: string) => (
    <div>
      <label className={labelCls}>{label}, мм</label>
      <input className={inputCls} type="number" min="10" step="10" value={toMm(v[field])} onChange={(e) => set({ [field]: Math.max(fromMm(Number(e.target.value)), 0.01) })} />
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-white/10 bg-[#1a1a1a] text-white">
        <DialogHeader>
          <DialogTitle>{item ? "Предмет в библиотеке" : "Новый предмет в библиотеку"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Название</label>
            <input className={inputCls} placeholder="Например: Шкаф-купе IKEA PAX 2000" value={v.name} onChange={(e) => set({ name: e.target.value })} autoFocus />
          </div>
          <div>
            <label className={labelCls}>Как рисовать на плане и в 3D</label>
            <select className={inputCls} value={v.base_kind} onChange={(e) => pickKind(e.target.value as FurnitureKind)}>
              {(Object.keys(FURNITURE_PRESETS) as FurnitureKind[]).map((k) => (
                <option key={k} value={k}>
                  {FURNITURE_PRESETS[k].group} · {FURNITURE_PRESETS[k].label}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#161616] p-2.5">
            <div className="mb-1.5 text-xs text-white/50">Своя 3D-модель (GLB) — в 3D будет стоять именно она</div>
            <div className="flex items-center gap-2">
              <label className="flex min-h-[40px] flex-1 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/20 px-3 text-sm text-white/70 hover:border-[#D4AF37]/50">
                <input type="file" accept=".glb,model/gltf-binary" className="hidden" onChange={(e) => onModel(e.target.files?.[0])} />
                <Icon name={modelBusy ? "Loader2" : v.model_url ? "Box" : "Upload"} size={15} className={modelBusy ? "animate-spin" : v.model_url ? "text-[#D4AF37]" : ""} />
                {modelBusy ? "Загружаю модель…" : v.model_url ? "Заменить модель" : "Загрузить .glb"}
              </label>
              {v.model_url && (
                <button onClick={() => { set({ model_url: null }); setModelInfo("") }} title="Убрать модель" className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/50 hover:text-red-300">
                  <Icon name="X" size={15} />
                </button>
              )}
            </div>
            <div className="mt-1 text-[11px] text-white/35">
              {modelInfo || (v.model_url ? "Модель подключена" : "Модели берут на сайтах фабрик, Sketchfab, 3dsky (экспорт в GLB из Blender/3ds Max). До 20 МБ.")} Модель подгоняется под размеры ниже.
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {mmInput("width", "Ширина")}
            {mmInput("depth", "Глубина")}
            {mmInput("height", "Высота")}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-white/50">Цвет в 3D</label>
            <input
              type="color"
              className="h-8 w-11 cursor-pointer rounded border border-white/10 bg-[#161616]"
              value={v.color || "#c9a77c"}
              onChange={(e) => set({ color: e.target.value })}
            />
            {v.color && (
              <button onClick={() => set({ color: null })} className="text-xs text-white/40 hover:text-white">
                как у вида
              </button>
            )}
          </div>
          <div className="space-y-1.5 text-sm text-white/70">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={v.at_wall} onChange={(e) => set({ at_wall: e.target.checked })} />
              Ставится у стены (прилипает тыльной стороной)
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={v.blocks_heating} onChange={(e) => set({ blocks_heating: e.target.checked })} />
              Без ножек — тёплый пол под ним не кладём
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={v.blocks_sockets} onChange={(e) => set({ blocks_sockets: e.target.checked })} />
              Закрывает розетки на стене за собой
            </label>
          </div>
          {error && <div className="text-sm text-red-300">{error}</div>}
          <button
            onClick={save}
            disabled={saving}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#D4AF37] text-sm text-[#161616] hover:bg-[#B8860B] disabled:opacity-50"
          >
            <Icon name={saving ? "Loader2" : "Save"} size={16} className={saving ? "animate-spin" : ""} />
            Сохранить в библиотеку
          </button>
          <div className="text-[11px] text-white/35">Библиотека общая для всей компании — предмет появится в разделе «Мои» на любом объекте</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LibraryItemDialog
