import { ChangeEvent, useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { siteApi, SiteProject, SiteSettings } from "@/lib/api"

interface ProjectsTabProps {
  form: SiteSettings
  update: (field: keyof SiteSettings, value: string) => void
}

export function ProjectsTab({ form, update }: ProjectsTabProps) {
  const [items, setItems] = useState<SiteProject[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [previews, setPreviews] = useState<Record<number, string>>({})
  const [pendingFiles, setPendingFiles] = useState<Record<number, string>>({})

  const load = () => {
    setLoading(true)
    siteApi.projects
      .list()
      .then((data) => setItems(data.items))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const updateField = (id: number, field: keyof SiteProject, value: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)))
  }

  const handleFile = (id: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setPreviews((prev) => ({ ...prev, [id]: reader.result as string }))
      setPendingFiles((prev) => ({ ...prev, [id]: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async (item: SiteProject) => {
    setSavingId(item.id)
    try {
      const payload: Partial<SiteProject> & { image_file?: string } = {
        title: item.title,
        category: item.category,
        location: item.location,
        year: item.year,
      }
      if (pendingFiles[item.id]) {
        payload.image_file = pendingFiles[item.id]
      }
      await siteApi.projects.update(item.id, payload)
      setPendingFiles((prev) => {
        const next = { ...prev }
        delete next[item.id]
        return next
      })
      load()
    } finally {
      setSavingId(null)
    }
  }

  const handleAdd = async () => {
    setCreating(true)
    try {
      await siteApi.projects.create({ title: "Новый объект", category: "Ремонт под ключ", location: "Город, площадь", year: String(new Date().getFullYear()) })
      load()
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("Удалить этот объект из портфолио?")) return
    await siteApi.projects.remove(id)
    load()
  }

  const handleDrop = async (targetId: number) => {
    if (draggedId == null || draggedId === targetId) {
      setDraggedId(null)
      return
    }
    const list = [...items]
    const fromIdx = list.findIndex((i) => i.id === draggedId)
    const toIdx = list.findIndex((i) => i.id === targetId)
    if (fromIdx === -1 || toIdx === -1) return
    const [moved] = list.splice(fromIdx, 1)
    list.splice(toIdx, 0, moved)
    setItems(list)
    setDraggedId(null)
    await siteApi.projects.reorder(list.map((i) => i.id))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Icon name="Loader2" size={24} className="animate-spin text-white/40" />
      </div>
    )
  }

  const inputClass =
    "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
  const labelClass = "text-xs text-white/50 mb-1.5 block"

  return (
    <div className="max-w-2xl space-y-3">
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelClass}>Надпись над заголовком</label>
          <input className={inputClass} value={form.projects_eyebrow} onChange={(e) => update("projects_eyebrow", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Заголовок раздела</label>
          <input className={inputClass} value={form.projects_title} onChange={(e) => update("projects_title", e.target.value)} />
        </div>
      </div>

      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-white/40">Объекты в разделе «Портфолио»</p>
        <button
          onClick={handleAdd}
          disabled={creating}
          className="flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-3 py-2 rounded-lg disabled:opacity-60"
        >
          <Icon name="Plus" size={14} />
          Добавить объект
        </button>
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => setDraggedId(item.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(item.id)}
          className="bg-[#161616] border border-white/10 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <Icon name="GripVertical" size={16} className="text-white/25 cursor-grab shrink-0 mt-2" />

            <div className="w-24 h-20 rounded-lg bg-[#1f1f1f] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative group">
              <img src={previews[item.id] || item.image_url || "/placeholder.svg"} alt={item.title} className="w-full h-full object-cover" />
              <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Icon name="Upload" size={16} className="text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(item.id, e)} />
              </label>
            </div>

            <div className="flex-1 space-y-2">
              <input
                value={item.title}
                onChange={(e) => updateField(item.id, "title", e.target.value)}
                placeholder="Название объекта"
                className="w-full bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50 font-medium"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  value={item.category}
                  onChange={(e) => updateField(item.id, "category", e.target.value)}
                  placeholder="Категория"
                  className="bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#D4AF37]/50"
                />
                <input
                  value={item.location}
                  onChange={(e) => updateField(item.id, "location", e.target.value)}
                  placeholder="Город, площадь"
                  className="bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#D4AF37]/50"
                />
                <input
                  value={item.year}
                  onChange={(e) => updateField(item.id, "year", e.target.value)}
                  placeholder="Год"
                  className="bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#D4AF37]/50"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSave(item)}
                  disabled={savingId === item.id}
                  className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-60"
                >
                  {savingId === item.id && <Icon name="Loader2" size={12} className="animate-spin" />}
                  Сохранить
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:underline text-xs">
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}