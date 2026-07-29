import { useEffect, useRef, useState } from "react"
import Icon from "@/components/ui/icon"
import { ServiceItem, ObjectRoom } from "@/lib/api"

export interface RoomWorkItem {
  key: string
  service_id?: number | null
  name: string
  unit: string
  price: number
  quantity: number
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
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " ₽"

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
  const serviceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (templateRef.current && !templateRef.current.contains(e.target as Node)) setTemplateOpen(false)
      if (serviceRef.current && !serviceRef.current.contains(e.target as Node)) setServicePickerOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const round2 = (n: number) => Math.round(n * 100) / 100

  const applyTemplate = (tpl: ObjectRoom) => {
    onChange({
      room_id: tpl.id,
      name: tpl.name,
      area: String(tpl.area),
      perimeter: String(tpl.perimeter),
    })
    setTemplateOpen(false)
  }

  const addService = (service: ServiceItem) => {
    const work: RoomWorkItem = {
      key: `${service.id}-${Date.now()}`,
      service_id: service.id,
      name: service.name,
      unit: service.unit,
      price: service.price,
      quantity: 1,
      amount: service.price,
    }
    onChange({ works: [...room.works, work] })
    setServicePickerOpen(false)
  }

  const addCustomWork = () => {
    const work: RoomWorkItem = {
      key: `custom-${Date.now()}`,
      service_id: null,
      name: "",
      unit: "м²",
      price: 0,
      quantity: 1,
      amount: 0,
    }
    onChange({ works: [...room.works, work] })
  }

  const updateWork = (key: string, patch: Partial<RoomWorkItem>) => {
    onChange({
      works: room.works.map((w) => {
        if (w.key !== key) return w
        const next = { ...w, ...patch }
        next.amount = round2(next.price * next.quantity)
        return next
      }),
    })
  }

  const removeWork = (key: string) => {
    onChange({ works: room.works.filter((w) => w.key !== key) })
  }

  return (
    <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <input
          value={room.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Название помещения"
          className="bg-transparent text-base font-medium outline-none border-b border-transparent focus:border-white/20 pb-0.5"
        />
        <div className="flex items-center gap-2">
          <div className="relative" ref={templateRef}>
            <button
              onClick={() => setTemplateOpen((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors px-3 py-1.5 rounded-lg"
            >
              <Icon name="LayoutTemplate" size={14} />
              Эталон из объекта
            </button>
            {templateOpen && (
              <div className="absolute right-0 z-20 mt-1 w-64 bg-[#1f1f1f] border border-white/10 rounded-lg max-h-64 overflow-y-auto shadow-lg">
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

          <div className="relative" ref={serviceRef}>
            <button
              onClick={() => setServicePickerOpen((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-white bg-blue-500 hover:bg-blue-600 transition-colors px-3 py-1.5 rounded-lg"
            >
              <Icon name="Plus" size={14} />
              Добавить из справочника
            </button>
            {servicePickerOpen && (
              <div className="absolute right-0 z-20 mt-1 w-72 bg-[#1f1f1f] border border-white/10 rounded-lg max-h-64 overflow-y-auto shadow-lg">
                {services.length === 0 ? (
                  <p className="text-xs text-white/30 px-3 py-2">Справочник услуг пуст</p>
                ) : (
                  services.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => addService(s)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors"
                    >
                      <span className="text-sm truncate">{s.name}</span>
                      <span className="text-xs text-white/40 whitespace-nowrap">{formatMoney(s.price)}/{s.unit}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/50">Площадь (м²)</label>
          <input
            value={room.area}
            onChange={(e) => onChange({ area: e.target.value })}
            type="number"
            placeholder="0.00"
            className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/50">Периметр (м/п)</label>
          <input
            value={room.perimeter}
            onChange={(e) => onChange({ perimeter: e.target.value })}
            type="number"
            placeholder="0.00"
            className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"
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
              {room.works.map((w) => (
                <tr key={w.key} className="border-t border-white/5">
                  <td className="px-3 py-2">
                    <input
                      value={w.name}
                      onChange={(e) => updateWork(w.key, { name: e.target.value })}
                      placeholder="Название работы"
                      className="bg-transparent outline-none w-full text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={w.unit}
                      onChange={(e) => updateWork(w.key, { unit: e.target.value })}
                      className="bg-transparent outline-none w-full text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={w.quantity}
                      onChange={(e) => updateWork(w.key, { quantity: Number(e.target.value) || 0 })}
                      className="bg-transparent outline-none w-full text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={w.price}
                      onChange={(e) => updateWork(w.key, { price: Number(e.target.value) || 0 })}
                      className="bg-transparent outline-none w-full text-sm"
                    />
                  </td>
                  <td className="px-3 py-2 text-white/70">{formatMoney(w.amount)}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => removeWork(w.key)}
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
    </div>
  )
}
