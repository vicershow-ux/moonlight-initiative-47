import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { MaterialItem, MaterialRoom, ObjectMaterial } from "@/lib/api"

const money = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(n || 0) + " ₽"

const num = (n: unknown) => Number(n || 0)

const inputCls =
  "w-full bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"

const goldBtn =
  "flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg disabled:opacity-40"

const SURFACES = [
  { value: "area", label: "Пол / потолок (площадь)" },
  { value: "wall_area", label: "Стены (площадь)" },
  { value: "perimeter", label: "Периметр" },
]

interface Props {
  objectId: number
  materials: MaterialItem[]
  rooms: MaterialRoom[]
  existing: ObjectMaterial[]
  onAdd: (payload: {
    material_id: number
    qty: number
    note: string
    room_id: number | null
    room_name: string
    merge: boolean
  }) => Promise<void>
  onCancel: () => void
}

export function RoomCalculator({
  objectId,
  materials,
  rooms,
  existing,
  onAdd,
  onCancel,
}: Props) {
  const objectRooms = useMemo(
    () => rooms.filter((r) => r.object_id === objectId),
    [rooms, objectId]
  )

  const [materialId, setMaterialId] = useState("")
  const [roomId, setRoomId] = useState("")
  const [surface, setSurface] = useState("area")
  const [manualArea, setManualArea] = useState("")
  const [layers, setLayers] = useState("1")
  const [reserve, setReserve] = useState("10")
  const [saving, setSaving] = useState(false)
  const [mode, setMode] = useState<"merge" | "new">("merge")

  const material = materials.find((m) => String(m.id) === materialId)
  const room = objectRooms.find((r) => String(r.id) === roomId)

  const baseArea = useMemo(() => {
    if (roomId === "manual" || !room) return num(manualArea)
    return num(room[surface as keyof MaterialRoom])
  }, [room, roomId, surface, manualArea])

  const totalArea = baseArea * Math.max(num(layers) || 1, 1)

  const consumption = num(material?.consumption)

  const needExact = consumption > 0 ? totalArea / consumption : 0
  const withReserve = needExact * (1 + num(reserve) / 100)
  const buyQty = Math.ceil(withReserve * 100) / 100
  const packs = Math.ceil(withReserve)
  const cost = packs * num(material?.price)

  const ready = !!material && consumption > 0 && totalArea > 0

  const prev = useMemo(() => {
    if (!material || !room) return null
    return existing.find((e) => e.material_id === material.id && e.room_id === room.id) || null
  }, [existing, material, room])

  const roomRecords = useMemo(
    () => (room ? existing.filter((e) => e.room_id === room.id) : []),
    [existing, room]
  )

  const noteText = room
    ? `${room.name}: ${totalArea.toFixed(2)} ${material?.consumption_unit || ""}, запас ${num(reserve)}%`
    : `Расчёт: ${totalArea.toFixed(2)} ${material?.consumption_unit || ""}, запас ${num(reserve)}%`

  const submit = async () => {
    if (!material) return
    setSaving(true)
    try {
      await onAdd({
        material_id: material.id,
        qty: packs,
        note: noteText,
        room_id: room ? room.id : null,
        room_name: room ? room.name : "",
        merge: mode === "merge",
      })
      setMaterialId("")
    } finally {
      setSaving(false)
    }
  }

  if (materials.length === 0) {
    return (
      <div className="text-sm text-white/40">
        Справочник пуст —{" "}
        <Link to="/cabinet/materials/new" className="text-[#D4AF37] hover:underline">
          добавьте материал
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs text-white/50">Материал</label>
          <select
            className={inputCls}
            value={materialId}
            onChange={(e) => setMaterialId(e.target.value)}
          >
            <option value="">Выберите материал из справочника</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {money(num(m.price))}/{m.unit}
                {num(m.consumption) > 0 ? ` · 1 ${m.unit} = ${num(m.consumption)} ${m.consumption_unit}` : ""}
              </option>
            ))}
          </select>
          {material && consumption <= 0 && (
            <div className="mt-1.5 text-xs text-amber-400">
              У этого материала не указан расход — расчёт невозможен
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-white/50">Помещение</label>
          <select className={inputCls} value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            <option value="">Выберите помещение</option>
            {objectRooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} — пол {num(r.area)} м², стены {num(r.wall_area)} м²
              </option>
            ))}
            <option value="manual">Ввести площадь вручную</option>
          </select>
          {objectRooms.length === 0 && (
            <div className="mt-1.5 text-xs text-white/40">
              У объекта нет помещений — введите площадь вручную
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {roomId === "manual" || !room ? (
          <div>
            <label className="mb-1.5 block text-xs text-white/50">
              Площадь / длина, {material?.consumption_unit || "м²"}
            </label>
            <input
              className={inputCls}
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={manualArea}
              onChange={(e) => setManualArea(e.target.value)}
            />
          </div>
        ) : (
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Что обрабатываем</label>
            <select
              className={inputCls}
              value={surface}
              onChange={(e) => setSurface(e.target.value)}
            >
              {SURFACES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs text-white/50">Слоёв</label>
          <input
            className={inputCls}
            type="number"
            min="1"
            step="1"
            value={layers}
            onChange={(e) => setLayers(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-white/50">Запас, %</label>
          <input
            className={inputCls}
            type="number"
            min="0"
            step="1"
            value={reserve}
            onChange={(e) => setReserve(e.target.value)}
          />
        </div>

        <div className="flex items-end">
          <button className={goldBtn} onClick={submit} disabled={!ready || saving}>
            <Icon
              name={saving ? "Loader2" : "Plus"}
              size={16}
              className={saving ? "animate-spin" : ""}
            />
            {prev && mode === "merge" ? "Добавить к расчёту" : "Сохранить в объект"}
          </button>
        </div>
      </div>

      {roomRecords.length > 0 && room && (
        <div className="rounded-lg border border-white/10 bg-[#1f1f1f] p-4">
          <div className="mb-2 text-xs uppercase text-white/40">
            Уже рассчитано по помещению «{room.name}»
          </div>
          <div className="space-y-1.5 text-sm text-white/60">
            {roomRecords.map((r) => (
              <div key={r.id} className="flex flex-wrap justify-between gap-2">
                <span>{r.name}</span>
                <span>
                  {num(r.qty)} {r.unit} · {money(num(r.qty) * num(r.price))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {prev && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="mb-3 flex items-start gap-2 text-sm text-amber-200">
            <Icon name="TriangleAlert" size={15} className="mt-0.5 shrink-0" />
            <span>
              По этому помещению уже есть расчёт «{prev.name}» — {num(prev.qty)} {prev.unit}. Что
              сделать с новым расчётом?
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                className="accent-[#D4AF37]"
                checked={mode === "merge"}
                onChange={() => setMode("merge")}
              />
              Добавить к существующему ({num(prev.qty)} + {packs} = {num(prev.qty) + packs}{" "}
              {prev.unit})
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                className="accent-[#D4AF37]"
                checked={mode === "new"}
                onChange={() => setMode("new")}
              />
              Добавить отдельной строкой
            </label>
          </div>
        </div>
      )}

      {ready && (
        <div className="rounded-lg border border-[#D4AF37]/30 bg-[#1f1f1f] p-4">
          <div className="mb-3 flex items-center gap-2 text-xs uppercase text-white/40">
            <Icon name="Calculator" size={14} className="text-[#D4AF37]" />
            Результат расчёта
          </div>
          <div className="grid gap-4 text-sm sm:grid-cols-4">
            <div>
              <div className="text-xs text-white/40">Площадь с учётом слоёв</div>
              <div>
                {totalArea.toFixed(2)} {material?.consumption_unit}
              </div>
            </div>
            <div>
              <div className="text-xs text-white/40">Чистый расход</div>
              <div>
                {needExact.toFixed(2)} {material?.unit}
              </div>
            </div>
            <div>
              <div className="text-xs text-white/40">С запасом {num(reserve)}%</div>
              <div>
                {buyQty.toFixed(2)} {material?.unit}
              </div>
            </div>
            <div>
              <div className="text-xs text-white/40">К покупке</div>
              <div className="text-[#D4AF37]">
                {packs} {material?.unit} · {money(cost)}
              </div>
            </div>
          </div>
          <div className="mt-3 border-t border-white/10 pt-3 text-xs text-white/40">
            1 {material?.unit} покрывает {consumption} {material?.consumption_unit}
            {material?.shop_name ? ` · магазин: ${material.shop_name}` : ""}
          </div>
        </div>
      )}

      <button
        className="text-sm text-white/40 transition-colors hover:text-white"
        onClick={onCancel}
      >
        Свернуть калькулятор
      </button>
    </div>
  )
}

export default RoomCalculator
