import { useEffect, useRef, useState } from "react"
import Icon from "@/components/ui/icon"
import { ServiceItem, ObjectRoom } from "@/lib/api"
import { ServicePickerModal } from "@/components/crm/estimate-create/ServicePickerModal"

export interface RoomWorkItem {
  key: string
  service_id?: number | null
  name: string
  category?: string
  subcategory?: string
  unit: string
  price: number
  quantity: number
  times: number
  discountPercent: number
  amount: number
}

export interface RoomBlockState {
  key: string
  room_id?: number | null
  name: string
  area: string
  perimeter: string
  works: RoomWorkItem[]
}

const formatMoney = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(n) + " ₽"

interface EstimateRoomBlockProps {
  room: RoomBlockState
  objectRooms: ObjectRoom[]
  services: ServiceItem[]
  onChange: (patch: Partial<RoomBlockState>) => void
  onRemove: () => void
}

export function EstimateRoomBlock({ room, objectRooms, services, onChange, onRemove }: EstimateRoomBlockProps) {
  const [templateOpen, setTemplateOpen] = useState(false)
  const [servicePickerOpen, setServicePickerOpen] = useState(false)
  const templateRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (templateRef.current && !templateRef.current.contains(e.target as Node)) setTemplateOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const round2 = (n: number) => Math.round(n * 100) / 100

  const calcAmount = (w: Pick<RoomWorkItem, "price" | "quantity" | "times" | "discountPercent">) => {
    const raw = w.price * w.quantity * (w.times || 1)
    const discounted = raw * (1 - (w.discountPercent || 0) / 100)
    return round2(discounted)
  }

  const applyTemplate = (tpl: ObjectRoom) => {
    onChange({
      room_id: tpl.id,
      name: tpl.name,
      area: String(tpl.area),
      perimeter: String(tpl.perimeter),
    })
    setTemplateOpen(false)
  }

  const addServices = (selected: ServiceItem[]) => {
    const newWorks: RoomWorkItem[] = selected.map((service) => {
      const base = { price: service.price, quantity: 1, times: 1, discountPercent: 0 }
      return {
        key: `${service.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        service_id: service.id,
        name: service.name,
        category: service.category,
        subcategory: service.subcategory,
        unit: service.unit,
        ...base,
        amount: calcAmount(base),
      }
    })
    onChange({ works: [...room.works, ...newWorks] })
  }

  const addCustomWork = () => {
    const base = { price: 0, quantity: 1, times: 1, discountPercent: 0 }
    const work: RoomWorkItem = {
      key: `custom-${Date.now()}`,
      service_id: null,
      name: "",
      unit: "м²",
      ...base,
      amount: 0,
    }
    onChange({ works: [...room.works, work] })
  }

  const updateWork = (key: string, patch: Partial<RoomWorkItem>) => {
    onChange({
      works: room.works.map((w) => {
        if (w.key !== key) return w
        const next = { ...w, ...patch }
        next.amount = calcAmount(next)
        return next
      }),
    })
  }

  const removeWork = (key: string) => {
    onChange({ works: room.works.filter((w) => w.key !== key) })
  }

  return (
    <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-base font-medium">{room.name || "Помещение"}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative" ref={templateRef}>
            <button
              onClick={() => setTemplateOpen((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors px-3 py-1.5 rounded-lg"
            >
              <Icon name="LayoutTemplate" size={14} />
              Эталон из объекта
            </button>
            {templateOpen && (
              <div className="absolute left-0 z-30 mt-1 w-64 max-w-[80vw] bg-[#1f1f1f] border border-white/10 rounded-lg max-h-64 overflow-y-auto shadow-lg">
                {objectRooms.length === 0 ? (
                  <p className="text-xs text-white/30 px-3 py-2">Нет эталонных помещений</p>
                ) : (
                  objectRooms.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => applyTemplate(tpl)}
                      className="w-full flex flex-col items-start px-3 py-2 text-left hover:bg-white/5 transition-colors"
                    >
                      <span className="text-sm">{tpl.name}</span>
                      <span className="text-xs text-white/30">{tpl.area} м² · {tpl.perimeter} м/п</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setServicePickerOpen(true)}
            className="flex items-center gap-1.5 text-sm text-white bg-blue-500 hover:bg-blue-600 transition-colors px-3 py-1.5 rounded-lg"
          >
            <Icon name="Plus" size={14} />
            Добавить из справочника
          </button>

          <button
            onClick={addCustomWork}
            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors px-3 py-1.5 rounded-lg"
          >
            <Icon name="PenLine" size={14} />
            Своя работа
          </button>

          <button
            onClick={onRemove}
            className="text-white/30 hover:text-red-400 transition-colors ml-1"
            title="Удалить помещение"
          >
            <Icon name="Trash2" size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/50">Название</label>
          <input
            value={room.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Санузел"
            className="bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/50">Площадь (м²)</label>
          <input
            value={room.area}
            onChange={(e) => onChange({ area: e.target.value })}
            type="number"
            placeholder="0.00"
            className="bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/50">Периметр (м/п)</label>
          <input
            value={room.perimeter}
            onChange={(e) => onChange({ perimeter: e.target.value })}
            type="number"
            placeholder="0.00"
            className="bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"
          />
        </div>
      </div>

      {room.works.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 border border-dashed border-white/10 rounded-lg text-center">
          <Icon name="ClipboardList" size={22} className="text-white/20 mb-2" />
          <p className="text-sm text-white/40">Работы не добавлены</p>
          <p className="text-xs text-white/25 mt-1">Нажмите «Добавить из справочника» вверху</p>
        </div>
      ) : (
        <>
          <div className="border border-white/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-auto" />
                <col className="w-[8%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
                <col className="w-[6%]" />
              </colgroup>
              <thead>
                <tr className="text-white/40 text-xs uppercase bg-white/5">
                  <th className="text-left font-medium py-2 px-3">Работа</th>
                  <th className="text-left font-medium py-2 px-2">Ед.</th>
                  <th className="text-left font-medium py-2 px-2">Кол-во</th>
                  <th className="text-left font-medium py-2 px-2">Раз</th>
                  <th className="text-left font-medium py-2 px-2">Цена</th>
                  <th className="text-left font-medium py-2 px-2">Скидка%</th>
                  <th className="text-left font-medium py-2 px-2">Сумма</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {room.works.map((w) => {
                  const isFromCatalog = !!w.service_id
                  return (
                  <tr key={w.key} className="border-t border-white/5 align-top">
                    <td className="px-3 py-2">
                      {isFromCatalog ? (
                        <p className="px-2.5 py-1.5 text-sm font-medium leading-snug break-words">{w.name}</p>
                      ) : (
                        <textarea
                          value={w.name}
                          onChange={(e) => updateWork(w.key, { name: e.target.value })}
                          placeholder="Название работы"
                          rows={2}
                          className="bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-2.5 py-1.5 outline-none w-full text-sm font-medium resize-none leading-snug focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"
                        />
                      )}
                      {(w.category || w.subcategory) && (
                        <p className="text-xs text-white/35 mt-1 px-0.5 break-words">
                          {[w.category, w.subcategory].filter(Boolean).join(" → ")}
                        </p>
                      )}
                    </td>
                    <td className="px-2 py-2">
                      {isFromCatalog ? (
                        <p className="px-2 py-1.5 text-sm">{w.unit}</p>
                      ) : (
                        <input
                          value={w.unit}
                          onChange={(e) => updateWork(w.key, { unit: e.target.value })}
                          className="bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-2 py-1.5 outline-none w-full text-sm focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"
                        />
                      )}
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={w.quantity}
                        onChange={(e) => updateWork(w.key, { quantity: Number(e.target.value) || 0 })}
                        className="bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-2 py-1.5 outline-none w-full text-sm focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={w.times}
                        onChange={(e) => updateWork(w.key, { times: Number(e.target.value) || 0 })}
                        className="bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-2 py-1.5 outline-none w-full text-sm focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"
                      />
                    </td>
                    <td className="px-2 py-2">
                      {isFromCatalog ? (
                        <p className="px-2 py-1.5 text-sm whitespace-nowrap">{formatMoney(w.price)}</p>
                      ) : (
                        <input
                          type="number"
                          value={w.price}
                          onChange={(e) => updateWork(w.key, { price: Number(e.target.value) || 0 })}
                          className="bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-2 py-1.5 outline-none w-full text-sm focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"
                        />
                      )}
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={w.discountPercent}
                        onChange={(e) => updateWork(w.key, { discountPercent: Number(e.target.value) || 0 })}
                        className="bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-2 py-1.5 outline-none w-full text-sm focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"
                      />
                    </td>
                    <td className="px-2 py-2 text-white/70 pt-3.5 break-words">
                      {w.quantity > 0 && w.times > 0 && w.price > 0 ? formatMoney(w.amount) : "—"}
                    </td>
                    <td className="px-2 py-2 pt-3.5">
                      <button
                        onClick={() => removeWork(w.key)}
                        className="text-white/30 hover:text-red-400 transition-colors"
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {room.works.some((w) => w.quantity > 0 && w.times > 0 && w.price > 0) && (
            <div className="flex items-center justify-end gap-2 mt-2 text-sm">
              <span className="text-white/40">Итого по помещению:</span>
              <span className="font-semibold">
                {formatMoney(
                  room.works
                    .filter((w) => w.quantity > 0 && w.times > 0 && w.price > 0)
                    .reduce((s, w) => s + w.amount, 0)
                )}
              </span>
            </div>
          )}
        </>
      )}

      <ServicePickerModal
        open={servicePickerOpen}
        onOpenChange={setServicePickerOpen}
        services={services}
        onAdd={addServices}
      />
    </div>
  )
}