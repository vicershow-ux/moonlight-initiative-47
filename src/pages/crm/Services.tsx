import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import { EditServiceModal } from "@/components/crm/EditServiceModal"
import Icon from "@/components/ui/icon"
import { servicesApi, ServiceItem } from "@/lib/api"

const PAGE_SIZE = 20

export default function Services() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterSubcategory, setFilterSubcategory] = useState("")

  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<ServiceItem | null>(null)
  const [editOpen, setEditOpen] = useState(false)

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

  const handleDelete = async (id: number) => {
    await servicesApi.remove(id)
    load()
  }

  const formatMoney = (n: number) =>
    new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " ₽"

  const categories = useMemo(
    () => Array.from(new Set(services.map((s) => s.category).filter(Boolean))),
    [services]
  )
  const subcategories = useMemo(
    () =>
      Array.from(
        new Set(
          services
            .filter((s) => !filterCategory || s.category === filterCategory)
            .map((s) => s.subcategory)
            .filter(Boolean)
        )
      ),
    [services, filterCategory]
  )

  const filtered = useMemo(() => {
    return services.filter((s) => {
      if (search.trim() && !s.name.toLowerCase().includes(search.trim().toLowerCase())) return false
      if (filterCategory && s.category !== filterCategory) return false
      if (filterSubcategory && s.subcategory !== filterSubcategory) return false
      return true
    })
  }, [services, search, filterCategory, filterSubcategory])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  )

  useEffect(() => {
    setPage(1)
  }, [search, filterCategory, filterSubcategory])

  const openEdit = (s: ServiceItem) => {
    setEditing(s)
    setEditOpen(true)
  }

  const pageNumbers = useMemo(() => {
    const nums: (number | "…")[] = []
    const push = (n: number) => nums.push(n)
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) push(i)
    } else {
      push(1)
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      if (start > 2) nums.push("…")
      for (let i = start; i <= end; i++) push(i)
      if (end < totalPages - 1) nums.push("…")
      push(totalPages)
    }
    return nums
  }, [totalPages, currentPage])

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
        <Link
          to="/cabinet/services/new"
          className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg"
        >
          <Icon name="Plus" size={16} />
          Добавить услугу
        </Link>
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
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filterSubcategory}
            onChange={(e) => setFilterSubcategory(e.target.value)}
            disabled={subcategories.length === 0}
            className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none disabled:opacity-40"
          >
            <option value="">Все подкатегории</option>
            {subcategories.map((sc) => (
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
                {paged.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 last:border-0">
                    <td className="py-3 pr-4 font-medium">{s.name}</td>
                    <td className="py-3 pr-4 text-white/60">{s.category || "—"}</td>
                    <td className="py-3 pr-4 text-white/60">{s.subcategory || "—"}</td>
                    <td className="py-3 pr-4 text-white/60">{s.unit}</td>
                    <td className="py-3 pr-4 text-white/60">{formatMoney(s.price)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEdit(s)}
                          title="Редактировать"
                          className="text-white/40 hover:text-[#D4AF37] transition-colors"
                        >
                          <Icon name="Pencil" size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          title="Удалить"
                          className="text-white/40 hover:text-red-400 transition-colors"
                        >
                          <Icon name="Trash2" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 pt-4 border-t border-white/10">
              <p className="text-xs text-white/40">
                Показано {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filtered.length)} из {filtered.length} услуг
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-white/5"
                >
                  <Icon name="ChevronLeft" size={16} />
                </button>
                {pageNumbers.map((n, i) =>
                  n === "…" ? (
                    <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-white/30 text-sm">
                      …
                    </span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`min-w-8 h-8 px-2 flex items-center justify-center rounded-md text-sm transition-colors ${
                        n === currentPage
                          ? "bg-[#D4AF37] text-[#161616] font-medium"
                          : "bg-white/5 hover:bg-white/10 text-white/70"
                      }`}
                    >
                      {n}
                    </button>
                  )
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-white/5"
                >
                  <Icon name="ChevronRight" size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <EditServiceModal
        service={editing}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={load}
      />
    </CrmLayout>
  )
}