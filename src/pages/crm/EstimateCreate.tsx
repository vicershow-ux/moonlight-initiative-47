import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import {
  objectsApi,
  objectRoomsApi,
  servicesApi,
  estimatesApi,
  ObjectItem,
  ObjectRoom,
  ServiceItem,
} from "@/lib/api"
import { EstimateRoomBlock, RoomBlockState } from "@/components/crm/estimate-create/EstimateRoomBlock"

const formatMoney = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " ₽"

const emptyRoom = (): RoomBlockState => ({
  key: `room-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  room_id: null,
  name: "",
  area: "",
  perimeter: "",
  works: [],
})

export default function EstimateCreate() {
  const { id } = useParams()
  const navigate = useNavigate()
  const objectId = Number(id)

  const [object, setObject] = useState<ObjectItem | null>(null)
  const [objectRooms, setObjectRooms] = useState<ObjectRoom[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [contractNumber, setContractNumber] = useState("")
  const [contractDate, setContractDate] = useState("")
  const [rooms, setRooms] = useState<RoomBlockState[]>([emptyRoom()])
  const [discountPercent, setDiscountPercent] = useState("")
  const [discountAmount, setDiscountAmount] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      objectsApi.get(objectId).catch(() => null),
      objectRoomsApi.listByObject(objectId).then((d) => d.rooms).catch(() => []),
      servicesApi.list().then((d) => d.services).catch(() => []),
    ])
      .then(([obj, roomsList, servicesList]) => {
        if (!obj) {
          navigate("/cabinet/objects")
          return
        }
        setObject(obj)
        setObjectRooms(roomsList)
        setServices(servicesList)
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const updateRoom = (key: string, patch: Partial<RoomBlockState>) => {
    setRooms((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  }

  const addRoom = () => {
    setRooms((prev) => [...prev, emptyRoom()])
  }

  const removeRoom = (key: string) => {
    setRooms((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev))
  }

  const subtotal = rooms.reduce(
    (sum, r) => sum + r.works.reduce((s, w) => s + w.amount, 0),
    0
  )
  const discountPercentNum = Number(discountPercent) || 0
  const discountAmountNum = discountPercentNum > 0
    ? Math.round(subtotal * discountPercentNum / 100 * 100) / 100
    : Number(discountAmount) || 0
  const total = Math.max(0, Math.round((subtotal - discountAmountNum) * 100) / 100)

  const handleSave = async () => {
    setError("")
    if (!object) return

    const items = rooms.flatMap((r) =>
      r.works
        .filter((w) => w.name.trim() && w.quantity > 0)
        .map((w) => ({
          service_id: w.service_id,
          name: w.name,
          unit: w.unit,
          price: w.price,
          quantity: w.quantity,
          times: w.times,
          discount_percent: w.discountPercent,
          amount: w.amount,
          room_id: r.room_id,
          room_name: r.name,
        }))
    )

    if (items.length === 0) {
      setError("Добавьте хотя бы одну позицию сметы")
      return
    }

    setSaving(true)
    try {
      await estimatesApi.create({
        object_id: object.id,
        items,
        contract_number: contractNumber,
        contract_date: contractDate || undefined,
        discount_percent: discountPercentNum,
        discount_amount: discountAmountNum,
        notes,
      })
      navigate(`/cabinet/objects/${objectId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения сметы")
    } finally {
      setSaving(false)
    }
  }

  if (loading || !object) {
    return (
      <CrmLayout title="Создание сметы">
        <div className="flex items-center justify-center py-24">
          <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
        </div>
      </CrmLayout>
    )
  }

  return (
    <CrmLayout title="Создание сметы" subtitle={`Объект: ${object.object_code} · ${object.client_name}`}>
      <Link
        to={`/cabinet/objects/${objectId}`}
        className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors mb-4"
      >
        <Icon name="ChevronLeft" size={16} />
        Назад к объекту
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="xl:col-span-3 flex flex-col gap-4">
          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
            <p className="font-medium mb-4">Информация о договоре</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Номер договора</label>
                <input
                  value={contractNumber}
                  onChange={(e) => setContractNumber(e.target.value)}
                  placeholder="Будет сгенерирован автоматически"
                  className="bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Дата договора</label>
                <input
                  value={contractDate}
                  onChange={(e) => setContractDate(e.target.value)}
                  type="date"
                  className="bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"
                />
              </div>
            </div>
          </div>

          {rooms.map((room) => (
            <EstimateRoomBlock
              key={room.key}
              room={room}
              objectRooms={objectRooms}
              services={services}
              onChange={(patch) => updateRoom(room.key, patch)}
              onRemove={() => removeRoom(room.key)}
            />
          ))}

          <button
            onClick={addRoom}
            className="flex items-center justify-center gap-2 border border-dashed border-white/15 hover:border-white/30 text-white/60 hover:text-white transition-colors text-sm px-4 py-3 rounded-xl"
          >
            <Icon name="Plus" size={16} />
            Добавить помещение
          </button>

          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
            <p className="font-medium mb-4">Скидка на смету</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Скидка (%)</label>
                <input
                  value={discountPercent}
                  onChange={(e) => { setDiscountPercent(e.target.value); setDiscountAmount("") }}
                  type="number"
                  placeholder="0"
                  className="bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Скидка (₽)</label>
                <input
                  value={discountPercentNum > 0 ? discountAmountNum : discountAmount}
                  onChange={(e) => { setDiscountAmount(e.target.value); setDiscountPercent("") }}
                  type="number"
                  placeholder="0"
                  disabled={discountPercentNum > 0}
                  className="bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
            <p className="font-medium mb-3">Примечания к смете</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Особые условия, комментарии..."
              rows={4}
              className="bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2.5 text-sm outline-none resize-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 w-full"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 flex items-center gap-1.5">
              <Icon name="CircleAlert" size={15} />
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pb-4">
            <Link
              to={`/cabinet/objects/${objectId}`}
              className="px-4 py-2.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 transition-colors"
            >
              Отмена
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-5 py-2.5 rounded-lg disabled:opacity-60"
            >
              {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : null}
              Сохранить черновик
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5 sticky top-4">
            <p className="font-medium mb-4">Итого</p>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/50">Сумма:</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              {discountAmountNum > 0 && (
                <div className="flex items-center justify-between text-red-400">
                  <span>Скидка:</span>
                  <span>-{formatMoney(discountAmountNum)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-white/10 pt-2 mt-1">
                <span className="font-medium">Итого:</span>
                <span className="text-lg font-semibold">{formatMoney(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CrmLayout>
  )
}