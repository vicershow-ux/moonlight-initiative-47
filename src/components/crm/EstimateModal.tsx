import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Icon from "@/components/ui/icon"
import { servicesApi, estimatesApi, ServiceItem, EstimateItem, ObjectItem } from "@/lib/api"
import { printEstimate } from "@/lib/printEstimate"
import { useAuth } from "@/contexts/AuthContext"

interface EstimateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  object: ObjectItem | null
  onCreated?: () => void
}

interface LineItem extends EstimateItem {
  key: string
}

const formatMoney = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " ₽"

export function EstimateModal({ open, onOpenChange, object, onCreated }: EstimateModalProps) {
  const { user } = useAuth()
  const [services, setServices] = useState<ServiceItem[]>([])
  const [items, setItems] = useState<LineItem[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      servicesApi.list().then((data) => setServices(data.services))
      setItems([])
      setError("")
    }
  }, [open])

  const round2 = (n: number) => Math.round(n * 100) / 100

  const addService = (serviceId: number) => {
    const service = services.find((s) => s.id === serviceId)
    if (!service) return
    setItems((prev) => [
      ...prev,
      {
        key: `${service.id}-${Date.now()}`,
        service_id: service.id,
        name: service.name,
        unit: service.unit,
        price: service.price,
        quantity: 1,
        amount: service.price,
      },
    ])
  }

  const addCustomItem = () => {
    setItems((prev) => [
      ...prev,
      {
        key: `custom-${Date.now()}`,
        service_id: null,
        name: "",
        unit: "м²",
        price: 0,
        quantity: 1,
        amount: 0,
      },
    ])
  }

  const updateItem = (key: string, patch: Partial<LineItem>) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.key !== key) return it
        const next = { ...it, ...patch }
        next.amount = round2(next.price * next.quantity)
        return next
      })
    )
  }

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((it) => it.key !== key))
  }

  const total = items.reduce((sum, it) => sum + it.amount, 0)

  const handleSave = async (shouldPrint = false) => {
    setError("")
    if (!object) return
    const validItems = items.filter((it) => it.name.trim() && it.quantity > 0)
    if (validItems.length === 0) {
      setError("Добавьте хотя бы одну позицию сметы")
      return
    }
    setSaving(true)
    try {
      const created = await estimatesApi.create({
        object_id: object.id,
        items: validItems.map(({ key, ...rest }) => rest),
      })
      onOpenChange(false)
      onCreated?.()
      if (shouldPrint) {
        printEstimate(created, object, user?.company_name || "")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения сметы")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1f1f1f] border-white/10 text-white sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Новая смета {object ? `— ${object.client_name}` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50">Добавить услугу из справочника</label>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) addService(Number(e.target.value))
              }}
              className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none"
            >
              <option value="">Выберите услугу...</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {formatMoney(s.price)} / {s.unit}
                </option>
              ))}
            </select>
          </div>

          {items.length > 0 && (
            <div className="border border-white/10 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/40 text-xs uppercase bg-white/5">
                    <th className="text-left font-medium py-2 px-3">Название</th>
                    <th className="text-left font-medium py-2 px-3 w-20">Ед.</th>
                    <th className="text-left font-medium py-2 px-3 w-24">Кол-во</th>
                    <th className="text-left font-medium py-2 px-3 w-28">Цена</th>
                    <th className="text-left font-medium py-2 px-3 w-28">Сумма</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.key} className="border-t border-white/5">
                      <td className="px-3 py-2">
                        <input
                          value={it.name}
                          onChange={(e) => updateItem(it.key, { name: e.target.value })}
                          placeholder="Название услуги"
                          className="bg-transparent outline-none w-full text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={it.unit}
                          onChange={(e) => updateItem(it.key, { unit: e.target.value })}
                          className="bg-transparent outline-none w-full text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={it.quantity}
                          onChange={(e) => updateItem(it.key, { quantity: Number(e.target.value) || 0 })}
                          className="bg-transparent outline-none w-full text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={it.price}
                          onChange={(e) => updateItem(it.key, { price: Number(e.target.value) || 0 })}
                          className="bg-transparent outline-none w-full text-sm"
                        />
                      </td>
                      <td className="px-3 py-2 text-white/70">{formatMoney(it.amount)}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => removeItem(it.key)}
                          className="text-white/30 hover:text-red-400 transition-colors"
                        >
                          <Icon name="X" size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button
            onClick={addCustomItem}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors self-start"
          >
            <Icon name="Plus" size={15} />
            Добавить произвольную позицию
          </button>

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-white/50 text-sm">Итого</span>
            <span className="text-xl font-semibold">{formatMoney(total)}</span>
          </div>

          {error && (
            <p className="text-sm text-red-400 flex items-center gap-1.5">
              <Icon name="CircleAlert" size={15} />
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 transition-colors text-white text-sm px-4 py-3 rounded-lg disabled:opacity-60"
            >
              {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : "Сохранить смету"}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 transition-colors text-white text-sm px-4 py-3 rounded-lg disabled:opacity-60"
              title="Сохранить и распечатать"
            >
              <Icon name="Printer" size={16} />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}