import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CategoryCombobox } from "@/components/crm/CategoryCombobox"
import Icon from "@/components/ui/icon"
import { servicesApi, ServiceItem } from "@/lib/api"

const CATEGORY_SUGGESTIONS = [
  "Демонтажные работы",
  "Подготовительные работы",
  "Черновые отделочные работы",
  "Чистовые отделочные работы",
  "Плиточные работы",
  "Устройство полов",
  "Потолочные работы",
  "Гипсокартонные работы",
  "Кладочные работы",
  "Бетонные работы",
  "Столярные работы",
  "Электромонтажные работы",
  "Сантехнические работы",
]

const UNIT_OPTIONS = [
  { value: "м.п.", label: "м/п (метр погонный)" },
  { value: "м²", label: "кв.м (квадратный метр)" },
  { value: "м³", label: "куб.м (кубический метр)" },
  { value: "шт", label: "шт. (штука)" },
  { value: "компл", label: "компл. (комплект)" },
  { value: "точка", label: "точка" },
]

interface EditServiceModalProps {
  service: ServiceItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function EditServiceModal({ service, open, onOpenChange, onSaved }: EditServiceModalProps) {
  const [category, setCategory] = useState("")
  const [subcategory, setSubcategory] = useState("")
  const [name, setName] = useState("")
  const [unit, setUnit] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (service) {
      setCategory(service.category || "")
      setSubcategory(service.subcategory || "")
      setName(service.name || "")
      setUnit(service.unit || "")
      setPrice(service.price != null ? String(service.price) : "")
      setDescription(service.description || "")
      setError("")
    }
  }, [service])

  const handleSubmit = async () => {
    if (!service) return
    setError("")
    if (name.trim().length < 2) {
      setError("Введите название работы")
      return
    }
    if (!category.trim()) {
      setError("Укажите категорию работ")
      return
    }
    if (!unit) {
      setError("Выберите единицу измерения")
      return
    }

    setSaving(true)
    try {
      await servicesApi.update(service.id, {
        name: name.trim(),
        category: category.trim(),
        subcategory: subcategory.trim(),
        unit,
        price: Number(price) || 0,
        description: description.trim(),
      })
      onSaved()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-[#1f1f1f] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">Редактирование услуги</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50">
              Категория работ <span className="text-red-400">*</span>
            </label>
            <CategoryCombobox
              value={category}
              onChange={setCategory}
              suggestions={CATEGORY_SUGGESTIONS}
              placeholder="Выберите или введите новую"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50">Подкатегория</label>
            <input
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder="Например: Полы, Стены, Потолки"
              className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs text-white/50">
              Название работы <span className="text-red-400">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Демонтаж плинтуса"
              className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50">
              Единица измерения <span className="text-red-400">*</span>
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none"
            >
              <option value="">Выберите единицу</option>
              {UNIT_OPTIONS.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50">Цена за единицу (₽)</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              type="number"
              className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs text-white/50">Описание (необязательно)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Дополнительная информация об услуге..."
              rows={3}
              className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none resize-none focus:border-[#D4AF37]/50"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 flex items-center gap-1.5 mt-3">
            <Icon name="CircleAlert" size={15} />
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-white/10">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-5 py-2.5 rounded-lg disabled:opacity-60"
          >
            {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : null}
            Сохранить изменения
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
