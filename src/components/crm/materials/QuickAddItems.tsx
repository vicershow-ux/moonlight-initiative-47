import { useState } from "react"
import Icon from "@/components/ui/icon"
import { MaterialItem, MaterialRoom } from "@/lib/api"
import { money, num, inputCls, goldBtn, UNITS } from "./constants"
import { collectShops } from "./ShopFields"

export interface QuickAddPayload {
  material_id: number | null
  name: string
  unit: string
  qty: number
  price: number
  shop_name: string
  room_id: number | null
  room_name: string
  note: string
}

interface Row {
  key: number
  material_id: string
  name: string
  unit: string
  qty: string
  price: string
  shop_name: string
}

let seq = 1
const emptyRow = (): Row => ({ key: seq++, material_id: "", name: "", unit: "шт", qty: "1", price: "", shop_name: "" })

interface Props {
  materials: MaterialItem[]
  rooms: MaterialRoom[]
  objectId: number
  onAdd: (items: QuickAddPayload[]) => Promise<void>
  onCancel: () => void
}

/** Добавление штучных позиций (розетки, выключатели и т.п.) без расчёта по площади */
export function QuickAddItems({ materials, rooms, objectId, onAdd, onCancel }: Props) {
  const [rows, setRows] = useState<Row[]>([emptyRow()])
  const [roomId, setRoomId] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const objectRooms = rooms.filter((r) => r.object_id === objectId)
  const shopNames = Array.from(new Set(collectShops(materials).map((s) => s.name).filter(Boolean))).sort()

  const update = (key: number, patch: Partial<Row>) =>
    setRows((list) => list.map((r) => (r.key === key ? { ...r, ...patch } : r)))

  const pickName = (key: number, value: string) => {
    const ref = materials.find((m) => m.name.toLowerCase() === value.trim().toLowerCase())
    if (ref) {
      update(key, {
        name: ref.name,
        material_id: String(ref.id),
        unit: ref.unit || "шт",
        price: num(ref.price) ? String(num(ref.price)) : "",
        shop_name: ref.shop_name || "",
      })
    } else {
      update(key, { name: value, material_id: "" })
    }
  }

  const valid = rows.filter((r) => r.name.trim().length >= 2 && Number(r.qty) > 0)
  const total = valid.reduce((s, r) => s + Number(r.qty) * Number(r.price || 0), 0)

  const submit = async () => {
    if (!valid.length) return
    setSaving(true)
    setError("")
    const room = objectRooms.find((r) => String(r.id) === roomId)
    try {
      await onAdd(
        valid.map((r) => ({
          material_id: r.material_id ? Number(r.material_id) : null,
          name: r.name.trim(),
          unit: r.unit,
          qty: Number(r.qty),
          price: Number(r.price || 0),
          shop_name: r.shop_name.trim(),
          room_id: room ? room.id : null,
          room_name: room ? room.name : "",
          note: "",
        })),
      )
      setRows([emptyRow()])
    } catch (e) {
      setError((e as Error)?.message || "Не удалось добавить")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-1 flex items-center gap-2 text-sm font-medium">
        <Icon name="ListPlus" size={16} className="text-[#D4AF37]" />
        Добавить позиции без расчёта
      </div>
      <p className="mb-4 text-xs text-white/40">
        Розетки, выключатели, светильники, фурнитура — выберите из справочника или впишите название, укажите количество
      </p>

      {error && (
        <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>
      )}

      <datalist id="qa-materials">
        {materials.map((m) => (
          <option key={m.id} value={m.name}>
            {money(num(m.price))}/{m.unit}
          </option>
        ))}
      </datalist>
      <datalist id="qa-shops">
        {shopNames.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      <div className="space-y-2">
        <div className="hidden grid-cols-[1fr_90px_80px_110px_160px_32px] gap-2 px-1 text-[11px] uppercase text-white/35 md:grid">
          <span>Наименование</span>
          <span>Кол-во</span>
          <span>Ед.</span>
          <span>Цена, ₽</span>
          <span>Магазин</span>
          <span />
        </div>
        {rows.map((r) => (
          <div key={r.key} className="grid grid-cols-2 gap-2 md:grid-cols-[1fr_90px_80px_110px_160px_32px]">
            <input
              className={`${inputCls} col-span-2 md:col-span-1`}
              list="qa-materials"
              placeholder="Например: Розетка двойная с заземлением"
              value={r.name}
              onChange={(e) => pickName(r.key, e.target.value)}
            />
            <input
              className={inputCls}
              type="number"
              min="0"
              step="1"
              placeholder="Кол-во"
              value={r.qty}
              onChange={(e) => update(r.key, { qty: e.target.value })}
            />
            <select className={inputCls} value={r.unit} onChange={(e) => update(r.key, { unit: e.target.value })}>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <input
              className={inputCls}
              type="number"
              min="0"
              step="0.01"
              placeholder="Цена"
              value={r.price}
              onChange={(e) => update(r.key, { price: e.target.value })}
            />
            <input
              className={inputCls}
              list="qa-shops"
              placeholder="Магазин"
              value={r.shop_name}
              onChange={(e) => update(r.key, { shop_name: e.target.value })}
            />
            <button
              type="button"
              title="Убрать строку"
              disabled={rows.length === 1}
              onClick={() => setRows((list) => list.filter((x) => x.key !== r.key))}
              className="flex items-center justify-center rounded-lg text-white/40 hover:text-red-400 disabled:opacity-20"
            >
              <Icon name="X" size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setRows((list) => [...list, emptyRow()])}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/60 hover:text-white"
        >
          <Icon name="Plus" size={14} />
          Ещё строка
        </button>
        {objectRooms.length > 0 && (
          <select className={`${inputCls} max-w-[220px]`} value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            <option value="">Без помещения</option>
            {objectRooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        )}
        <div className="ml-auto text-sm text-white/60">
          Итого: <span className="text-[#D4AF37]">{money(total)}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button className={goldBtn} disabled={!valid.length || saving} onClick={submit}>
          <Icon name={saving ? "Loader2" : "Check"} size={16} className={saving ? "animate-spin" : ""} />
          Добавить в объект ({valid.length})
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white/60 hover:text-white"
        >
          Закрыть
        </button>
      </div>
    </div>
  )
}

export default QuickAddItems
