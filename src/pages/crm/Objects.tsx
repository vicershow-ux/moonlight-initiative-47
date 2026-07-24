import { useEffect, useState } from "react"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { objectsApi, ObjectItem } from "@/lib/api"
import { EstimateModal } from "@/components/crm/EstimateModal"
import { EstimatesListModal } from "@/components/crm/EstimatesListModal"
import { useAuth } from "@/contexts/AuthContext"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const statusColors: Record<string, string> = {
  "лид": "bg-purple-500/20 text-purple-300",
  "в работе": "bg-blue-500/20 text-blue-300",
  "завершён": "bg-green-500/20 text-green-300",
  "отменён": "bg-red-500/20 text-red-300",
}

const statusOptions = ["лид", "в работе", "завершён", "отменён"]

export default function Objects() {
  const { user } = useAuth()
  const isClient = user?.role === "client"
  const [objects, setObjects] = useState<ObjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [objectType, setObjectType] = useState("вторичка")
  const [area, setArea] = useState("")
  const [status, setStatus] = useState("лид")

  const [estimateModalOpen, setEstimateModalOpen] = useState(false)
  const [estimatesListOpen, setEstimatesListOpen] = useState(false)
  const [selectedObject, setSelectedObject] = useState<ObjectItem | null>(null)

  const load = () => {
    setLoading(true)
    objectsApi
      .list()
      .then((data) => setObjects(data.objects))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const resetForm = () => {
    setClientName("")
    setClientPhone("")
    setObjectType("вторичка")
    setArea("")
    setStatus("лид")
    setError("")
  }

  const handleCreate = async () => {
    setError("")
    if (clientName.trim().length < 2) {
      setError("Введите имя клиента")
      return
    }
    setSaving(true)
    try {
      await objectsApi.create({
        client_name: clientName,
        client_phone: clientPhone,
        object_type: objectType,
        area: Number(area) || 0,
        status,
      })
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
    await objectsApi.remove(id)
    load()
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    await objectsApi.update(id, { status: newStatus })
    load()
  }

  const openEstimateModal = (obj: ObjectItem) => {
    setSelectedObject(obj)
    setEstimateModalOpen(true)
  }

  const openEstimatesList = (obj: ObjectItem) => {
    setSelectedObject(obj)
    setEstimatesListOpen(true)
  }

  return (
    <CrmLayout title="Объекты" subtitle={isClient ? "Ваши объекты" : "Все объекты вашей компании"}>
      {!isClient && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 transition-colors text-white text-sm px-4 py-2.5 rounded-lg"
          >
            <Icon name="Plus" size={16} />
            Создать объект
          </button>
        </div>
      )}

      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
        {loading ? (
          <div className="flex justify-center py-16">
            <Icon name="Loader2" size={24} className="animate-spin text-white/40" />
          </div>
        ) : objects.length === 0 ? (
          <div className="text-center py-16 text-white/30 text-sm">
            Пока нет объектов — создайте первый
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-xs uppercase border-b border-white/10">
                  <th className="text-left font-medium py-2 pr-4">ID объекта</th>
                  <th className="text-left font-medium py-2 pr-4">Клиент</th>
                  <th className="text-left font-medium py-2 pr-4">Тип</th>
                  <th className="text-left font-medium py-2 pr-4">Площадь</th>
                  <th className="text-left font-medium py-2 pr-4">Статус</th>
                  <th className="text-left font-medium py-2 pr-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {objects.map((obj) => (
                  <tr key={obj.id} className="border-b border-white/5 last:border-0">
                    <td className="py-3 pr-4 text-red-400">{obj.object_code}</td>
                    <td className="py-3 pr-4">
                      <p>{obj.client_name}</p>
                      <p className="text-xs text-white/30">{obj.client_phone}</p>
                    </td>
                    <td className="py-3 pr-4 text-white/60">{obj.object_type}</td>
                    <td className="py-3 pr-4 text-white/60">{obj.area} м²</td>
                    <td className="py-3 pr-4">
                      {isClient ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[obj.status] || "bg-white/10 text-white/60"}`}>
                          {obj.status}
                        </span>
                      ) : (
                        <select
                          value={obj.status}
                          onChange={(e) => handleStatusChange(obj.id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs bg-[#1a1a1a] border border-white/10 outline-none ${statusColors[obj.status] || ""}`}
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s} className="bg-[#1a1a1a] text-white">
                              {s}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        {!isClient && (
                          <button
                            onClick={() => openEstimateModal(obj)}
                            className="flex items-center gap-1.5 text-white/60 hover:text-red-400 transition-colors"
                            title="Создать смету"
                          >
                            <Icon name="FilePlus2" size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => openEstimatesList(obj)}
                          className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors"
                          title="Сметы объекта"
                        >
                          <Icon name="FileText" size={16} />
                        </button>
                        {!isClient && (
                          <button
                            onClick={() => handleDelete(obj.id)}
                            className="text-white/40 hover:text-red-400 transition-colors"
                            title="Удалить объект"
                          >
                            <Icon name="Trash2" size={16} />
                          </button>
                        )}
                      </div>
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
            <DialogTitle>Новый объект</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Имя клиента</label>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Иванов Иван"
                className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-red-500/50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Телефон</label>
              <input
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+7 900 000 00 00"
                className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-red-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Тип</label>
                <select
                  value={objectType}
                  onChange={(e) => setObjectType(e.target.value)}
                  className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none"
                >
                  <option value="вторичка">вторичка</option>
                  <option value="новостройка">новостройка</option>
                  <option value="коммерция">коммерция</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Площадь, м²</label>
                <input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="30.5"
                  type="number"
                  className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-red-500/50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Статус</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
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
              className="mt-2 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 transition-colors text-white text-sm px-4 py-3 rounded-lg disabled:opacity-60"
            >
              {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : "Создать объект"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <EstimateModal
        open={estimateModalOpen}
        onOpenChange={setEstimateModalOpen}
        object={selectedObject}
        onCreated={load}
      />

      <EstimatesListModal
        open={estimatesListOpen}
        onOpenChange={setEstimatesListOpen}
        object={selectedObject}
      />
    </CrmLayout>
  )
}