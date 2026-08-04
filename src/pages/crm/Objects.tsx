import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { objectsApi, objectStatusesApi, ObjectItem, ObjectStatus, ObjectStatusTransition } from "@/lib/api"
import { EstimatesListModal } from "@/components/crm/EstimatesListModal"
import { getStatusBadgeClass } from "@/lib/objectStatusColors"
import { useAuth } from "@/contexts/AuthContext"

export default function Objects() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isClient = user?.role === "client"
  const [objects, setObjects] = useState<ObjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statuses, setStatuses] = useState<ObjectStatus[]>([])
  const [transitions, setTransitions] = useState<ObjectStatusTransition[]>([])

  const [estimatesListOpen, setEstimatesListOpen] = useState(false)
  const [selectedObject, setSelectedObject] = useState<ObjectItem | null>(null)

  const statusByName = useMemo(() => {
    const map = new Map<string, ObjectStatus>()
    statuses.forEach((s) => map.set(s.name, s))
    return map
  }, [statuses])

  const getAllowedNextStatuses = (currentName: string) => {
    const current = statusByName.get(currentName)
    if (!current) return statuses.filter((s) => !s.is_archived)
    const allowedIds = new Set(
      transitions.filter((t) => t.from_status_id === current.id).map((t) => t.to_status_id)
    )
    return statuses.filter((s) => !s.is_archived && (s.id === current.id || allowedIds.has(s.id)))
  }

  const load = () => {
    setLoading(true)
    Promise.all([objectsApi.list(), objectStatusesApi.list()])
      .then(([objData, statusData]) => {
        setObjects(objData.objects)
        setStatuses(statusData.statuses)
        setTransitions(statusData.transitions)
      })
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
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeClass(statusByName.get(obj.status)?.color)}`}>
                          {obj.status}
                        </span>
                      ) : (
                        <select
                          value={obj.status}
                          onChange={(e) => handleStatusChange(obj.id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs bg-[#1a1a1a] border border-white/10 outline-none ${getStatusBadgeClass(statusByName.get(obj.status)?.color)}`}
                        >
                          {getAllowedNextStatuses(obj.status).map((s) => (
                            <option key={s.id} value={s.name} className="bg-[#1a1a1a] text-white">
                              {s.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/cabinet/objects/${obj.id}`)}
                          className="text-white/40 hover:text-[#D4AF37] transition-colors"
                          title="Просмотр объекта"
                        >
                          <Icon name="Eye" size={15} />
                        </button>
                        {!isClient && (
                          <Link
                            to={`/cabinet/objects/${obj.id}/estimates/new`}
                            className="text-white/40 hover:text-white transition-colors"
                            title="Создать смету"
                          >
                            <Icon name="FilePlus2" size={15} />
                          </Link>
                        )}
                        <button
                          onClick={() => openEstimatesList(obj)}
                          className="text-white/40 hover:text-white transition-colors"
                          title="Сметы объекта"
                        >
                          <Icon name="FileText" size={15} />
                        </button>
                        {!isClient && (
                          <button
                            onClick={() => handleDelete(obj.id)}
                            className="text-white/40 hover:text-red-400 transition-colors"
                            title="Удалить объект"
                          >
                            <Icon name="Trash2" size={15} />
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