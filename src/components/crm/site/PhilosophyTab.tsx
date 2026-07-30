import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { siteApi, SitePhilosophyItem } from "@/lib/api"

export function PhilosophyTab() {
  const [items, setItems] = useState<SitePhilosophyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)

  const load = () => {
    setLoading(true)
    siteApi.philosophy
      .list()
      .then((data) => setItems(data.items))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const updateField = (id: number, field: "title" | "description", value: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)))
  }

  const handleSave = async (item: SitePhilosophyItem) => {
    setSavingId(item.id)
    try {
      await siteApi.philosophy.update(item.id, { title: item.title, description: item.description })
    } finally {
      setSavingId(null)
    }
  }

  const handleAdd = async () => {
    setCreating(true)
    try {
      await siteApi.philosophy.create({ title: "Новое преимущество", description: "Описание преимущества" })
      load()
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("Удалить этот пункт?")) return
    await siteApi.philosophy.remove(id)
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
    await siteApi.philosophy.reorder(list.map((i) => i.id))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Icon name="Loader2" size={24} className="animate-spin text-white/40" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-white/40">Преимущества компании в блоке «О компании»</p>
        <button
          onClick={handleAdd}
          disabled={creating}
          className="flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-3 py-2 rounded-lg disabled:opacity-60"
        >
          <Icon name="Plus" size={14} />
          Добавить пункт
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
            <div className="flex-1 space-y-2">
              <input
                value={item.title}
                onChange={(e) => updateField(item.id, "title", e.target.value)}
                className="w-full bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50 font-medium"
              />
              <textarea
                value={item.description}
                onChange={(e) => updateField(item.id, "description", e.target.value)}
                rows={2}
                className="w-full bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50 resize-none"
              />
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
