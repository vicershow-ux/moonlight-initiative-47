import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { CategoryCombobox } from "@/components/crm/CategoryCombobox"
import { objectsApi, objectRoomsApi, ObjectItem, ObjectRoom } from "@/lib/api"

const ROOM_TYPE_SUGGESTIONS = [
  "Ванная",
  "Санузел",
  "Кухня",
  "Спальня",
  "Гостиная",
  "Прихожая",
  "Коридор",
  "Балкон/лоджия",
  "Кладовая",
]

interface RoomFormState {
  id?: number
  name: string
  room_type: string
  area: string
  perimeter: string
  ceiling_height: string
  wall_area: string
  notes: string
}

const emptyForm = (): RoomFormState => ({
  name: "",
  room_type: "",
  area: "",
  perimeter: "",
  ceiling_height: "",
  wall_area: "",
  notes: "",
})

const numToStr = (n: number) => (n && Number(n) !== 0 ? String(n) : "")

const toForm = (room: ObjectRoom): RoomFormState => ({
  id: room.id,
  name: room.name,
  room_type: room.room_type,
  area: numToStr(room.area),
  perimeter: numToStr(room.perimeter),
  ceiling_height: numToStr(room.ceiling_height),
  wall_area: numToStr(room.wall_area),
  notes: room.notes,
})

export default function ObjectRooms() {
  const { id } = useParams()
  const navigate = useNavigate()
  const objectId = Number(id)

  const [object, setObject] = useState<ObjectItem | null>(null)
  const [rooms, setRooms] = useState<ObjectRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [forms, setForms] = useState<RoomFormState[]>([])
  const [savingIdx, setSavingIdx] = useState<number | null>(null)
  const [errors, setErrors] = useState<Record<number, string>>({})

  const load = () => {
    if (!id) return
    setLoading(true)
    Promise.all([
      objectsApi.get(objectId).catch(() => null),
      objectRoomsApi.listByObject(objectId).then((data) => data.rooms).catch(() => []),
    ])
      .then(([obj, roomsList]) => {
        if (!obj) {
          navigate("/cabinet/objects")
          return
        }
        setObject(obj)
        setRooms(roomsList)
        setForms(roomsList.map(toForm))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const updateForm = (idx: number, patch: Partial<RoomFormState>) => {
    setForms((prev) => prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)))
  }

  const handleAddRoom = () => {
    setForms((prev) => [...prev, emptyForm()])
  }

  const handleCancelRoom = (idx: number) => {
    const form = forms[idx]
    if (form.id) {
      setForms((prev) => prev.map((f, i) => (i === idx ? toForm(rooms.find((r) => r.id === form.id)!) : f)))
    } else {
      setForms((prev) => prev.filter((_, i) => i !== idx))
    }
    setErrors((prev) => {
      const next = { ...prev }
      delete next[idx]
      return next
    })
  }

  const handleDeleteRoom = async (idx: number) => {
    const form = forms[idx]
    if (form.id) {
      await objectRoomsApi.remove(form.id)
    }
    setForms((prev) => prev.filter((_, i) => i !== idx))
    setRooms((prev) => prev.filter((r) => r.id !== form.id))
  }

  const handleSaveRoom = async (idx: number) => {
    const form = forms[idx]
    setErrors((prev) => {
      const next = { ...prev }
      delete next[idx]
      return next
    })

    if (form.name.trim().length < 1) {
      setErrors((prev) => ({ ...prev, [idx]: "Введите название помещения" }))
      return
    }

    setSavingIdx(idx)
    try {
      const payload = {
        object_id: objectId,
        name: form.name.trim(),
        room_type: form.room_type.trim(),
        area: Number(form.area) || 0,
        perimeter: Number(form.perimeter) || 0,
        ceiling_height: Number(form.ceiling_height) || 0,
        wall_area: Number(form.wall_area) || 0,
        notes: form.notes.trim(),
      }
      if (form.id) {
        await objectRoomsApi.update(form.id, payload)
      } else {
        await objectRoomsApi.create(payload)
      }
      navigate(`/cabinet/objects/${objectId}`)
    } catch (err) {
      setErrors((prev) => ({ ...prev, [idx]: err instanceof Error ? err.message : "Ошибка сохранения" }))
    } finally {
      setSavingIdx(null)
    }
  }

  if (loading || !object) {
    return (
      <CrmLayout title="Помещения объекта">
        <div className="flex items-center justify-center py-24">
          <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
        </div>
      </CrmLayout>
    )
  }

  return (
    <CrmLayout title="Эталонные помещения" subtitle="Помещения объекта используются как источник для новых версий смет">
      <Link
        to={`/cabinet/objects/${objectId}`}
        className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors mb-4"
      >
        <Icon name="ChevronLeft" size={16} />
        Назад к объекту
      </Link>

      <div className="flex items-center justify-end mb-4">
        <button
          onClick={handleAddRoom}
          className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg"
        >
          <Icon name="Plus" size={16} />
          Добавить помещение
        </button>
      </div>

      {forms.length === 0 ? (
        <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-10 text-center text-white/30 text-sm">
          Пока нет помещений — добавьте первое
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {forms.map((form, idx) => (
            <div key={form.id ?? `new-${idx}`} className="bg-[#1f1f1f] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="font-medium">{form.name || "Новое помещение"}</p>
                {form.id && (
                  <button
                    onClick={() => handleDeleteRoom(idx)}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Удалить
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/50">Название</label>
                  <input
                    value={form.name}
                    onChange={(e) => updateForm(idx, { name: e.target.value })}
                    placeholder="Введите название"
                    className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/50">Тип помещения</label>
                  <CategoryCombobox
                    value={form.room_type}
                    onChange={(v) => updateForm(idx, { room_type: v })}
                    suggestions={ROOM_TYPE_SUGGESTIONS}
                    placeholder="Выберите или введите тип"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/50">Площадь</label>
                  <input
                    value={form.area}
                    onChange={(e) => updateForm(idx, { area: e.target.value })}
                    placeholder="м²"
                    type="number"
                    className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/50">Периметр</label>
                  <input
                    value={form.perimeter}
                    onChange={(e) => updateForm(idx, { perimeter: e.target.value })}
                    placeholder="м"
                    type="number"
                    className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/50">Высота потолков</label>
                  <input
                    value={form.ceiling_height}
                    onChange={(e) => updateForm(idx, { ceiling_height: e.target.value })}
                    placeholder="м"
                    type="number"
                    className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/50">Площадь стен</label>
                  <input
                    value={form.wall_area}
                    onChange={(e) => updateForm(idx, { wall_area: e.target.value })}
                    placeholder="м²"
                    type="number"
                    className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs text-white/50">Заметки</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => updateForm(idx, { notes: e.target.value })}
                    placeholder="Дополнительная информация о помещении..."
                    rows={4}
                    className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none resize-none focus:border-[#D4AF37]/50"
                  />
                </div>
              </div>

              {errors[idx] && (
                <p className="text-sm text-red-400 flex items-center gap-1.5 mt-4">
                  <Icon name="CircleAlert" size={15} />
                  {errors[idx]}
                </p>
              )}

              <div className="flex items-center gap-3 mt-5 pt-5 border-t border-white/10">
                <button
                  onClick={() => handleSaveRoom(idx)}
                  disabled={savingIdx === idx}
                  className="flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg disabled:opacity-60"
                >
                  {savingIdx === idx ? <Icon name="Loader2" size={16} className="animate-spin" /> : null}
                  Сохранить помещения
                </button>
                <button
                  onClick={() => handleCancelRoom(idx)}
                  className="px-4 py-2.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </CrmLayout>
  )
}