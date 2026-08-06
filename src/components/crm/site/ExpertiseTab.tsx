import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { siteApi, SiteExpertiseItem, SiteSettings } from "@/lib/api"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"

const iconOptions = ["Home", "Building", "Armchair", "Trees"]

interface ExpertiseTabProps {
  form: SiteSettings
  update: (field: keyof SiteSettings, value: string) => void
}

export function ExpertiseTab({ form, update }: ExpertiseTabProps) {
  const [items, setItems] = useState<SiteExpertiseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)

  const load = () => {
    setLoading(true)
    siteApi.expertise
      .list()
      .then((data) => setItems(data.items))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const updateField = (id: number, field: keyof SiteExpertiseItem, value: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)))
  }

  const handleSave = async (item: SiteExpertiseItem) => {
    setSavingId(item.id)
    try {
      await siteApi.expertise.update(item.id, { title: item.title, description: item.description, icon: item.icon })
    } finally {
      setSavingId(null)
    }
  }

  const handleAdd = async () => {
    setCreating(true)
    try {
      await siteApi.expertise.create({ title: "Новая услуга", description: "Описание услуги", icon: "Home" })
      load()
    } finally {
      setCreating(false)
    }
  }

  const [confirmId, setConfirmId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    await siteApi.expertise.remove(id)
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
    await siteApi.expertise.reorder(list.map((i) => i.id))
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
      <div className="space-y-4 mb-6">
        <div>
          <label className={labelClass}>Надпись над заголовком</label>
          <input className={inputClass} value={form.services_eyebrow} onChange={(e) => update("services_eyebrow", e.target.value)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Заголовок, выделенное слово</label>
            <input className={inputClass} value={form.services_title_highlight} onChange={(e) => update("services_title_highlight", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Заголовок, остальной текст</label>
            <input className={inputClass} value={form.services_title_rest} onChange={(e) => update("services_title_rest", e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Описание раздела</label>
          <textarea
            rows={2}
            className={`${inputClass} resize-none`}
            value={form.services_description}
            onChange={(e) => update("services_description", e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-white/40">Услуги в разделе «Наши услуги»</p>
        <button
          onClick={handleAdd}
          disabled={creating}
          className="flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-3 py-2 rounded-lg disabled:opacity-60"
        >
          <Icon name="Plus" size={14} />
          Добавить услугу
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
              <div className="flex gap-2">
                <input
                  value={item.title}
                  onChange={(e) => updateField(item.id, "title", e.target.value)}
                  className="flex-1 bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50 font-medium"
                />
                <Select value={item.icon} onValueChange={(v) => updateField(item.id, "icon", v)}>
                  <SelectTrigger className="w-32 bg-[#1f1f1f] border-white/10 text-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((ic) => (
                      <SelectItem key={ic} value={ic}>
                        <span className="flex items-center gap-2">
                          <Icon name={ic} size={14} />
                          {ic}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                <button onClick={() => setConfirmId(item.id)} className="text-red-400 hover:underline text-xs">
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <ConfirmDeleteDialog
        open={confirmId !== null}
        onOpenChange={(v) => { if (!v) setConfirmId(null) }}
        onConfirm={async () => { if (confirmId !== null) await handleDelete(confirmId) }}
        title="Удалить услугу?"
        description="Услуга будет удалена с сайта безвозвратно."
      />
    </div>
  )
}
