import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { materialsApi, MaterialItem } from "@/lib/api"
import { inputCls } from "./constants"
import { MaterialOffers } from "./MaterialOffers"

const UNITS = ["шт", "м²", "м", "м.п.", "м³", "кг", "т", "л", "уп", "рул", "меш", "компл"]

const CONSUMPTION_UNITS = [
  { value: "м²", label: "м² (квадратный метр)" },
  { value: "м³", label: "м³ (кубический метр)" },
  { value: "м.п.", label: "м/п (метр погонный)" },
  { value: "м", label: "м (метр)" },
  { value: "шт", label: "шт (штука)" },
  { value: "точка", label: "точка" },
  { value: "компл", label: "комплект" },
]

const labelCls = "mb-1.5 block text-xs text-white/50"

interface CatalogEditModalProps {
  material: MaterialItem
  onClose: () => void
  onSaved: () => void
}

export function CatalogEditModal({ material, onClose, onSaved }: CatalogEditModalProps) {
  const [form, setForm] = useState({
    name: material.name || "",
    category: material.category || "",
    unit: material.unit || "шт",
    price: material.price ? String(material.price) : "",
    note: material.note || "",
    consumption: material.consumption ? String(material.consumption) : "",
    consumption_unit: material.consumption_unit || "м²",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const save = async () => {
    setError("")
    setSaving(true)
    try {
      await materialsApi.update(material.id, {
        ...form,
        price: Number(form.price || 0),
        consumption: Number(form.consumption || 0),
      })
      onSaved()
      onClose()
    } catch (e) {
      setError((e as Error)?.message || "Не удалось сохранить материал")
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="my-8 w-full max-w-3xl rounded-xl border border-white/10 bg-[#1f1f1f] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-medium">Редактирование материала</div>
            <div className="mt-0.5 text-xs text-white/40">
              Изменения попадут в справочник для всех новых расчётов
            </div>
          </div>
          <button
            className="rounded-lg p-1.5 text-white/40 transition-colors hover:text-white"
            onClick={onClose}
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mb-4 text-xs uppercase text-white/40">Материал</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>Название материала</label>
            <input
              className={inputCls}
              placeholder="Например: Гипсокартон Knauf 12.5 мм"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Категория</label>
            <input
              className={inputCls}
              placeholder="Например: Черновые материалы"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Единица измерения</label>
            <select
              className={inputCls}
              value={form.unit}
              onChange={(e) => set("unit", e.target.value)}
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Цена за единицу, ₽</label>
            <input
              className={inputCls}
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
            />
            <div className="mt-1 text-xs text-white/30">
              Подставится лучшая цена из магазинов ниже
            </div>
          </div>
        </div>

        <div className="mb-4 mt-6 text-xs uppercase text-white/40">Расход материала</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Расход: сколько покрывает 1 {form.unit}</label>
            <input
              className={inputCls}
              type="number"
              min="0"
              step="0.001"
              placeholder="Например: 4"
              value={form.consumption}
              onChange={(e) => set("consumption", e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Единица расхода</label>
            <select
              className={inputCls}
              value={form.consumption_unit}
              onChange={(e) => set("consumption_unit", e.target.value)}
            >
              {CONSUMPTION_UNITS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
          {Number(form.consumption) > 0 && (
            <div className="rounded-lg border border-[#D4AF37]/30 bg-[#161616] px-4 py-3 text-sm text-white/70 sm:col-span-2">
              <Icon name="Info" size={14} className="mr-2 inline text-[#D4AF37]" />1 {form.unit}{" "}
              покрывает {Number(form.consumption)} {form.consumption_unit}
              {Number(form.price) > 0 && (
                <span className="text-white/40">
                  {" "}
                  · стоимость {(Number(form.price) / Number(form.consumption)).toFixed(2)} ₽ за 1{" "}
                  {form.consumption_unit}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="mt-6">
          <MaterialOffers
            materialId={material.id}
            unit={form.unit}
            offers={material.offers || []}
            onChanged={onSaved}
          />
        </div>

        <div className="mb-4 mt-6 text-xs uppercase text-white/40">Примечание к материалу</div>
        <input
          className={inputCls}
          placeholder="Необязательно"
          value={form.note}
          onChange={(e) => set("note", e.target.value)}
        />

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            className="flex items-center gap-2 rounded-lg bg-[#D4AF37] px-5 py-2.5 text-sm text-[#161616] transition-colors hover:bg-[#B8860B] disabled:opacity-40"
            onClick={save}
            disabled={form.name.trim().length < 2 || saving}
          >
            <Icon
              name={saving ? "Loader2" : "Check"}
              size={16}
              className={saving ? "animate-spin" : ""}
            />
            Сохранить изменения
          </button>
          <button
            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/60 transition-colors hover:text-white"
            onClick={onClose}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  )
}

export default CatalogEditModal