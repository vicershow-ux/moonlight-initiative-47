import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { materialLibraryApi } from "@/lib/api"
import { fromMm, toMm } from "@/lib/planner/geometry"
import { FinishMaterial, MATERIAL_CATEGORIES, MaterialCategory } from "@/lib/planner/types"
import { shrinkImage } from "@/components/crm/planner/MaterialPicker"
import { inputCls } from "./constants"

const labelCls = "mb-1 block text-xs text-white/50"

/** Угадываем раздел по названию и категории материала из магазина */
function guessCategory(name: string, cat: string): MaterialCategory {
  const t = `${name} ${cat}`.toLowerCase()
  if (/фреск|панно/.test(t)) return "fresco"
  if (/обо[иея]/.test(t)) return "wallpaper"
  if (/плитк|керамогранит|мозаик/.test(t)) return "tile"
  if (/ламинат|паркет|доск|кварцвинил|spc|линолеум|ковролин/.test(t)) return "floor"
  if (/ткан|велюр|бархат|обивк/.test(t)) return "fabric"
  if (/мрамор|камен|гранит|оникс/.test(t)) return "stone"
  if (/краск|штукатур|декоратив/.test(t)) return "paint"
  if (/шпон|дерев|мдф|лдсп|фасад/.test(t)) return "wood"
  return "other"
}

/** Размер из названия: «Плитка 600×1200», «30x60 см» → метры */
function guessSize(name: string): [number, number] | null {
  const m = name.match(/(\d{2,4}(?:[.,]\d)?)\s*[x×х*]\s*(\d{2,4}(?:[.,]\d)?)\s*(мм|см)?/i)
  if (!m) return null
  const a = parseFloat(m[1].replace(",", "."))
  const b = parseFloat(m[2].replace(",", "."))
  const k = m[3]?.toLowerCase() === "см" || (a < 200 && b < 200 && !m[3]) ? 0.01 : 0.001
  return [a * k, b * k]
}

interface Props {
  materialId: number
  name: string
  category: string
  note: string
}

/**
 * Фото материала для визуализации: тот же материал, что в магазине,
 * появляется в выборе отделки — на стенах, полу и потолке в 3D и на развёртках
 */
export function MaterialVisualBlock({ materialId, name, category, note }: Props) {
  const [item, setItem] = useState<FinishMaterial | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [cat, setCat] = useState<MaterialCategory>(() => guessCategory(name, category))
  const size0 = guessSize(name)
  const [w, setW] = useState(size0?.[0] ?? MATERIAL_CATEGORIES[guessCategory(name, category)].w)
  const [h, setH] = useState(size0?.[1] ?? MATERIAL_CATEGORIES[guessCategory(name, category)].h)
  const [gloss, setGloss] = useState(false)
  const [img, setImg] = useState<{ data: string; type: string; ratio: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    materialLibraryApi
      .list()
      .then((r) => {
        const it = (r.items || []).find((x) => x.shop_material_id === materialId) || null
        setItem(it)
        if (it) {
          setCat(it.category)
          setW(it.width)
          setH(it.height)
          setGloss(it.gloss)
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [materialId])

  const mode = MATERIAL_CATEGORIES[cat].mode

  const onFile = async (f: File | undefined) => {
    if (!f) return
    try {
      const r = await shrinkImage(f)
      setImg(r)
      if (!size0 && !item) setH(Math.round(w * r.ratio * 1000) / 1000)
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Не удалось открыть картинку")
    }
  }

  const save = async () => {
    if (!item && !img) return setMsg("Загрузите фото материала")
    setBusy(true)
    setMsg("")
    try {
      const base = { name: name || "Материал", category: cat, width: w, height: h, mode, gloss, unit: "m2" as const, note: note || null, shop_material_id: materialId }
      if (item) {
        const r = await materialLibraryApi.update({ ...item, ...base, ...(img ? { image: img.data, content_type: img.type } : {}) })
        setItem(r.item)
      } else if (img) {
        const r = await materialLibraryApi.create({ ...base, image: img.data, content_type: img.type })
        setItem(r.item)
      }
      setImg(null)
      setMsg("Сохранено — материал доступен в отделке планировщика")
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Не удалось сохранить")
    } finally {
      setBusy(false)
    }
  }

  if (!loaded) return null
  const preview = img?.data || item?.image_url

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-[#181818] p-4">
      <div className="mb-1 flex items-center gap-2 text-xs uppercase text-white/40">
        <Icon name="Box" size={14} />
        Фото для 3D и развёрток
      </div>
      <div className="mb-3 text-xs text-white/45">
        Фото с сайта магазина или из каталога. Материал появится в выборе отделки: им можно покрыть стены, пол или сделать панно — в 3D и на
        развёртках в реальном размере.
      </div>
      <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
        <label className="flex h-[150px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-white/20 bg-[#161616] hover:border-[#D4AF37]/50">
          <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="p-3 text-center text-xs text-white/45">
              <Icon name="ImagePlus" size={22} className="mx-auto mb-1 text-white/40" />
              Загрузить фото
            </div>
          )}
        </label>
        <div className="space-y-2">
          <select className={inputCls} value={cat} onChange={(e) => setCat(e.target.value as MaterialCategory)}>
            {(Object.keys(MATERIAL_CATEGORIES) as MaterialCategory[]).map((c) => (
              <option key={c} value={c}>
                {MATERIAL_CATEGORIES[c].label}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>{mode === "panel" ? "Ширина панно, мм" : "Ширина рисунка, мм"}</label>
              <input className={inputCls} type="number" min="10" step="10" value={toMm(w)} onChange={(e) => setW(Math.max(fromMm(Number(e.target.value)), 0.01))} />
            </div>
            <div>
              <label className={labelCls}>{mode === "panel" ? "Высота панно, мм" : "Высота рисунка, мм"}</label>
              <input className={inputCls} type="number" min="10" step="10" value={toMm(h)} onChange={(e) => setH(Math.max(fromMm(Number(e.target.value)), 0.01))} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" checked={gloss} onChange={(e) => setGloss(e.target.checked)} />
              Глянец
            </label>
            <button
              onClick={save}
              disabled={busy}
              className="ml-auto flex min-h-[40px] items-center gap-2 rounded-lg bg-white/10 px-4 text-sm text-white hover:bg-white/15 disabled:opacity-50"
            >
              <Icon name={busy ? "Loader2" : "Save"} size={15} className={busy ? "animate-spin" : ""} />
              {item ? "Обновить фото и размер" : "Добавить в визуализацию"}
            </button>
          </div>
          {msg && <div className="text-xs text-[#D4AF37]">{msg}</div>}
        </div>
      </div>
    </div>
  )
}

export default MaterialVisualBlock
