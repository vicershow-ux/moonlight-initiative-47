import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import Icon from "@/components/ui/icon"
import { ServiceItem } from "@/lib/api"

const formatMoney = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(n) + " ₽"

interface ServicePickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  services: ServiceItem[]
  onAdd: (services: ServiceItem[]) => void
}

export function ServicePickerModal({ open, onOpenChange, services, onAdd }: ServicePickerModalProps) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [subcategory, setSubcategory] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (open) {
      setSearch("")
      setCategory("")
      setSubcategory("")
      setSelectedIds(new Set())
    }
  }, [open])

  const categories = useMemo(
    () => Array.from(new Set(services.map((s) => s.category).filter(Boolean))).sort(),
    [services]
  )

  const subcategories = useMemo(
    () =>
      Array.from(
        new Set(
          services
            .filter((s) => !category || s.category === category)
            .map((s) => s.subcategory)
            .filter(Boolean)
        )
      ).sort(),
    [services, category]
  )

  const searchActive = search.trim().length > 0
  const listVisible = searchActive || category !== ""

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return services.filter((s) => {
      if (category && s.category !== category) return false
      if (subcategory && s.subcategory !== subcategory) return false
      if (q) {
        const haystack = `${s.name} ${s.category} ${s.subcategory}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [services, search, category, subcategory])

  const grouped = useMemo(() => {
    const map = new Map<string, ServiceItem[]>()
    filtered.forEach((s) => {
      const key = s.subcategory || "Без подкатегории"
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(s)
    })
    return Array.from(map.entries())
  }, [filtered])

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAdd = () => {
    const chosen = services.filter((s) => selectedIds.has(s.id))
    if (chosen.length === 0) return
    onAdd(chosen)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1f1f1f] border-white/10 text-white sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Добавить из справочника</DialogTitle>
          <DialogDescription className="text-white/40">
            Выберите категорию и отметьте нужные работы
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 overflow-hidden flex-1">
          <div className="relative">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию, категории, подкатегории..."
              className="w-full bg-[#161616] border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
            />
          </div>

          <div className={`grid ${category ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Категория</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setSubcategory("") }}
                className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
              >
                <option value="">Все категории</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {category && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Подкатегория</label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
                >
                  <option value="">Все подкатегории</option>
                  {subcategories.map((sc) => (
                    <option key={sc} value={sc}>{sc}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto border border-white/10 rounded-lg min-h-[220px]">
            {!listVisible ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <Icon name="Search" size={28} className="text-white/15 mb-3" />
                <p className="text-sm text-white/40">Введите запрос или выберите категорию</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <Icon name="SearchX" size={28} className="text-white/15 mb-3" />
                <p className="text-sm text-white/40">Ничего не найдено</p>
              </div>
            ) : (
              <div className="p-2">
                <p className="text-xs text-white/30 px-2 py-1.5">
                  Все работы из категории ({filtered.length})
                </p>
                {grouped.map(([groupName, groupServices]) => (
                  <div key={groupName} className="mb-1">
                    <p className="text-xs font-medium text-[#D4AF37] px-2 py-1.5">{groupName}</p>
                    {groupServices.map((s) => (
                      <label
                        key={s.id}
                        className="flex items-start gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(s.id)}
                          onChange={() => toggleSelect(s.id)}
                          className="mt-0.5 w-4 h-4 accent-[#D4AF37]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{s.name}</p>
                          <p className="text-xs text-white/40">{formatMoney(s.price)} / {s.unit}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-white/40">
            Выбрано: {selectedIds.size} из {filtered.length}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleAdd}
            disabled={selectedIds.size === 0}
            className="px-4 py-2.5 rounded-lg text-sm bg-red-600 hover:bg-red-700 transition-colors text-white disabled:opacity-50"
          >
            Добавить
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
