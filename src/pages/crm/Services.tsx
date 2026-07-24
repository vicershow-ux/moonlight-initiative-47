import { useEffect, useState } from "react"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { servicesApi, ServiceItem } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function Services() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [unit, setUnit] = useState("м²")
  const [price, setPrice] = useState("")

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
      await servicesApi.create({ name, unit, price: Number(price) || 0 })
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

  return (
    <CrmLayout title="Услуги" subtitle="Справочник услуг вашей компании">
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 transition-colors text-white text-sm px-4 py-2.5 rounded-lg"
        >
          <Icon name="Plus" size={16} />
          Добавить услугу
        </button>
      </div>

      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
        {loading ? (
          <div className="flex justify-center py-16">
            <Icon name="Loader2" size={24} className="animate-spin text-white/40" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16 text-white/30 text-sm">
            Справочник услуг пуст — добавьте первую услугу
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-xs uppercase border-b border-white/10">
                  <th className="text-left font-medium py-2 pr-4">Название</th>
                  <th className="text-left font-medium py-2 pr-4">Ед. изм.</th>
                  <th className="text-left font-medium py-2 pr-4">Цена</th>
                  <th className="text-left font-medium py-2 pr-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 last:border-0">
                    <td className="py-3 pr-4">{s.name}</td>
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
                className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Ед. изм.</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none"
                >
                  <option value="м²">м²</option>
                  <option value="м.п.">м.п.</option>
                  <option value="шт">шт</option>
                  <option value="усл">усл</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Цена, ₽</label>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="500"
                  type="number"
                  className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500/50"
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
              className="mt-2 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 transition-colors text-white text-sm px-4 py-3 rounded-lg disabled:opacity-60"
            >
              {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : "Добавить услугу"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </CrmLayout>
  )
}