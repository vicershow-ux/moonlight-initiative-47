import { useEffect, useMemo, useRef, useState } from "react"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { servicesApi, ServiceItem } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const CATEGORIES: Record<string, string[]> = {
  "Бетонные работы": ["Бетон и монолит", "Опалубка", "Армирование"],
  "Отделочные работы": ["Штукатурка", "Покраска", "Обои", "Плитка", "Полы"],
  "Кровельные работы": ["Монтаж кровли", "Утепление кровли"],
  "Электромонтаж": ["Проводка", "Розетки и выключатели", "Освещение"],
  "Сантехника": ["Водоснабжение", "Канализация", "Отопление"],
  "Демонтаж": ["Демонтаж стен", "Демонтаж полов", "Вывоз мусора"],
}

const ALL_UNITS = ["м²", "м.п.", "м³", "шт", "усл", "куб.м"]

export default function Services() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [unit, setUnit] = useState("м²")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [subcategory, setSubcategory] = useState("")

  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterSubcategory, setFilterSubcategory] = useState("")

  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = () => {
    setLoading(true)
    servicesApi
      .list()
      .then((data) => setServices(data.services))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const resetForm = () => {
    setName("")
    setUnit("м²")
    setPrice("")
    setCategory("")
    setSubcategory("")
    setError("")
  }

  const handleCreate = async () => {
    setError("")
    if (name.trim().length < 2) {
      setError("Введите название услуги")
      return
    }
    setSaving(true)
    try {
      await servicesApi.create({ name, unit, price: Number(price) || 0, category, subcategory })
      setOpen(false)
      resetForm()
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    await servicesApi.remove(id)
    load()
  }

  const formatMoney = (n: number) =>
    new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " ₽"

  const filtered = useMemo(() => {
    return services.filter((s) => {
      if (search.trim() && !s.name.toLowerCase().includes(search.trim().toLowerCase())) return false
      if (filterCategory && s.category !== filterCategory) return false
      if (filterSubcategory && s.subcategory !== filterSubcategory) return false
      return true
    })
  }, [services, search, filterCategory, filterSubcategory])

  const availableSubcategories = filterCategory ? CATEGORIES[filterCategory] || [] : []
  const formSubcategories = category ? CATEGORIES[category] || [] : []

  const handleImportClick = () => {
    setImportMsg("")
    fileInputRef.current?.click()
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    setImporting(true)
    setImportMsg("")
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          resolve(result.split(",")[1] || "")
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const res = await servicesApi.importExcel(base64)
      setImportMsg(`Импортировано: ${res.imported}${res.skipped ? `, пропущено: ${res.skipped}` : ""}`)
      load()
    } catch (err) {
      setImportMsg(err instanceof Error ? err.message : "Ошибка импорта файла")
    } finally {
      setImporting(false)
    }
  }

  return (
    <CrmLayout title="Справочник услуг" subtitle="Общая база работ и ваши собственные услуги">
      <div className="flex justify-end gap-2 mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={handleFileSelected}
        />
        <button
          onClick={handleImportClick}
          disabled={importing}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors text-white text-sm px-4 py-2.5 rounded-lg disabled:opacity-60"
        >
          {importing ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="FileUp" size={16} />}
          Импорт из Excel
        </button>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg"
        >
          <Icon name="Plus" size={16} />
          Добавить услугу
        </button>
      </div>

      {importMsg && (
        <div className="mb-4 text-sm text-white/70 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5">
          {importMsg}
        </div>
      )}

      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Название услуги..."
              className="w-full bg-[#161616] border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setFilterSubcategory("") }}
            className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none"
          >
            <option value="">Все категории</option>
            {Object.keys(CATEGORIES).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filterSubcategory}
            onChange={(e) => setFilterSubcategory(e.target.value)}
            disabled={!filterCategory}
            className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none disabled:opacity-40"
          >
            <option value="">Все подкатегории</option>
            {availableSubcategories.map((sc) => (
              <option key={sc} value={sc}>{sc}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
        {loading ? (
          <div className="flex justify-center py-16">
            <Icon name="Loader2" size={24} className="animate-spin text-white/40" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/30 text-sm">
            {services.length === 0 ? "Справочник услуг пуст — добавьте первую услугу" : "Ничего не найдено по заданным фильтрам"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-xs uppercase border-b border-white/10">
                  <th className="text-left font-medium py-2 pr-4">Название работы</th>
                  <th className="text-left font-medium py-2 pr-4">Категория</th>
                  <th className="text-left font-medium py-2 pr-4">Подкатегория</th>
                  <th className="text-left font-medium py-2 pr-4">Ед. изм.</th>
                  <th className="text-left font-medium py-2 pr-4">Цена</th>
                  <th className="text-left font-medium py-2 pr-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 last:border-0">
                    <td className="py-3 pr-4 font-medium">{s.name}</td>
                    <td className="py-3 pr-4 text-white/60">{s.category || "—"}</td>
                    <td className="py-3 pr-4 text-white/60">{s.subcategory || "—"}</td>
                    <td className="py-3 pr-4 text-white/60">{s.unit}</td>
                    <td className="py-3 pr-4 text-white/60">{formatMoney(s.price)}</td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-white/40 hover:text-red-400 transition-colors"
                      >
                        <Icon name="Trash2" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
        <DialogContent className="bg-[#1f1f1f] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Новая услуга</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Название</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Демонтаж стен"
                className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Категория</label>
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setSubcategory("") }}
                  className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none"
                >
                  <option value="">Не выбрана</option>
                  {Object.keys(CATEGORIES).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Подкатегория</label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  disabled={!category}
                  className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none disabled:opacity-40"
                >
                  <option value="">Не выбрана</option>
                  {formSubcategories.map((sc) => (
                    <option key={sc} value={sc}>{sc}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Ед. изм.</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none"
                >
                  {ALL_UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Цена, ₽</label>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="500"
                  type="number"
                  className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 flex items-center gap-1.5">
                <Icon name="CircleAlert" size={15} />
                {error}
              </p>
            )}

            <button
              onClick={handleCreate}
              disabled={saving}
              className="mt-2 flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-3 rounded-lg disabled:opacity-60"
            >
              {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : "Добавить услугу"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </CrmLayout>
  )
}
