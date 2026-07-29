import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { objectsApi, ObjectItem } from "@/lib/api"
import { EstimatesListModal } from "@/components/crm/EstimatesListModal"
import { useAuth } from "@/contexts/AuthContext"

const statusColors: Record<string, string> = {
  "лид": "bg-purple-500/20 text-purple-300",
  "в работе": "bg-blue-500/20 text-blue-300",
  "завершён": "bg-green-500/20 text-green-300",
  "отменён": "bg-red-500/20 text-red-300",
}

const statusOptions = ["лид", "в работе", "завершён", "отменён"]

export default function Objects() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isClient = user?.role === "client"
  const [objects, setObjects] = useState<ObjectItem[]>([])
  const [loading, setLoading] = useState(true)

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

  const handleDelete = async (id: number) => {
    await objectsApi.remove(id)
    load()
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    await objectsApi.update(id, { status: newStatus })
    load()
  }

  const openEstimatesList = (obj: ObjectItem) => {
    setSelectedObject(obj)
    setEstimatesListOpen(true)
  }

  return (
    <CrmLayout title="Объекты" subtitle={isClient ? "Ваши объекты" : "Все объекты вашей компании"}>
      {!isClient && (
        <div className="flex justify-end mb-6">
          <Link
            to="/cabinet/objects/new"
            className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg"
          >
            <Icon name="Plus" size={16} />
            Создать объект
          </Link>
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
                    <td className="py-3 pr-4 text-[#D4AF37]">{obj.object_code}</td>
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
                        <button
                          onClick={() => navigate(`/cabinet/objects/${obj.id}`)}
                          className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors"
                          title="Просмотр объекта"
                        >
                          <Icon name="Eye" size={16} />
                        </button>
                        {!isClient && (
                          <Link
                            to={`/cabinet/objects/${obj.id}/estimates/new`}
                            className="flex items-center gap-1.5 text-white/60 hover:text-[#D4AF37] transition-colors"
                            title="Создать смету"
                          >
                            <Icon name="FilePlus2" size={16} />
                          </Link>
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

      <EstimatesListModal
        open={estimatesListOpen}
        onOpenChange={setEstimatesListOpen}
        object={selectedObject}
      />
    </CrmLayout>
  )
}