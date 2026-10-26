import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "@/lib/router-compat"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { objectsApi, objectStatusesApi, ObjectItem, ObjectStatus, ObjectStatusTransition, objectHubApi } from "@/lib/api"
import { getStatusBadgeClass } from "@/lib/objectStatusColors"
import { useAuth } from "@/contexts/AuthContext"
import { DeleteButton } from "@/components/ui/delete-button"
import { MobileCard } from "@/components/crm/MobileCard"

export default function Objects() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isClient = user?.role === "client"
  const [objects, setObjects] = useState<ObjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statuses, setStatuses] = useState<ObjectStatus[]>([])
  const [transitions, setTransitions] = useState<ObjectStatusTransition[]>([])


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

  const [unread, setUnread] = useState<Record<string, number>>({})

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
    objectHubApi.unread().then((d) => setUnread(d.unread || {})).catch(() => {})
  }, [])

  const [view, setView] = useState<"active" | "closed">("active")
  const [error, setError] = useState("")
  const closedCount = objects.filter((o) => o.is_closed).length
  const visible = objects.filter((o) => (view === "closed" ? o.is_closed : !o.is_closed))

  const handleDelete = async (id: number) => {
    setError("")
    try {
      await objectsApi.remove(id)
      load()
    } catch (e) {
      setError((e as Error)?.message || "Не удалось удалить объект")
    }
  }

  const toggleClosed = async (obj: ObjectItem) => {
    setError("")
    try {
      await objectsApi.update(obj.id, { is_closed: !obj.is_closed })
      load()
    } catch (e) {
      setError((e as Error)?.message || "Не удалось изменить объект")
    }
  }

  const closeBtn = (obj: ObjectItem, mobile = false) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        toggleClosed(obj)
      }}
      title={obj.is_closed ? "Вернуть в работу" : "Завершить объект — убрать в архив"}
      className={
        mobile
          ? "w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 active:bg-white/10 text-white/60 shrink-0"
          : "text-white/40 hover:text-emerald-400 transition-colors"
      }
    >
      <Icon name={obj.is_closed ? "ArchiveRestore" : "CircleCheckBig"} size={mobile ? 17 : 15} fallback="Archive" />
    </button>
  )

  const deleteText =
    "Объект будет удалён вместе со сметами, договорами, актами, счетами, фото и чатом. Доходы и расходы останутся в финансах, но без привязки к объекту. Это нельзя отменить."

  const handleStatusChange = async (id: number, newStatus: string) => {
    await objectsApi.update(id, { status: newStatus })
    load()
  }

  return (
    <CrmLayout title="Объекты" subtitle={isClient ? "Ваши объекты" : "Все объекты вашей компании"}>
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3 mb-6">
        <div className="flex sm:inline-flex rounded-lg border border-white/10 bg-[#1f1f1f] p-1 text-sm">
          {([
            ["active", `В работе (${objects.length - closedCount})`],
            ["closed", `Завершённые (${closedCount})`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              className={`flex-1 sm:flex-none min-h-[40px] sm:min-h-0 px-3 py-1.5 rounded-md transition-colors ${view === key ? "bg-[#D4AF37] text-[#161616]" : "text-white/60 hover:text-white"}`}
            >
              {label}
            </button>
          ))}
        </div>
      {!isClient && (
          <Link
            to="/cabinet/objects/new"
            className="flex items-center justify-center gap-2 min-h-[44px] sm:min-h-0 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg"
          >
            <Icon name="Plus" size={16} />
            Создать объект
          </Link>
      )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      )}

      <div className="md:bg-[#1f1f1f] md:border md:border-white/10 md:rounded-xl md:p-5">
        {loading ? (
          <div className="flex justify-center py-16">
            <Icon name="Loader2" size={24} className="animate-spin text-white/40" />
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16 text-white/30 text-sm">
            {view === "closed"
              ? "Завершённых объектов нет. Нажмите галочку у объекта, чтобы убрать его сюда после сдачи"
              : objects.length === 0 ? "Пока нет объектов — создайте первый" : "Все объекты завершены"}
          </div>
        ) : (
          <>
          <div className="md:hidden flex flex-col gap-3">
            {visible.map((obj) => (
              <MobileCard
                key={obj.id}
                title={obj.client_name}
                subtitle={obj.client_phone}
                onClick={() => navigate(`/cabinet/objects/${obj.id}`)}
                badge={
                  <span className={`px-2 py-1 rounded-full text-[11px] ${getStatusBadgeClass(statusByName.get(obj.status)?.color)}`}>
                    {obj.status}
                  </span>
                }
                rows={[
                  { label: "Объект", value: <span className="text-[#D4AF37]">{obj.object_code}{unread[obj.id] ? <UnreadBadge count={unread[obj.id]} /> : null}</span> },
                  { label: "Тип", value: obj.object_type },
                  { label: "Площадь", value: `${obj.area} м²` },
                ]}
                actions={
                  isClient ? undefined : (
                    <>
                      <select
                        value={obj.status}
                        onChange={(e) => handleStatusChange(obj.id, e.target.value)}
                        className="flex-1 min-h-[40px] px-3 rounded-lg text-xs bg-[#161616] border border-white/10 outline-none text-white"
                      >
                        {getAllowedNextStatuses(obj.status).map((s) => (
                          <option key={s.id} value={s.name} className="bg-[#1a1a1a] text-white">
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <Link
                        to={`/cabinet/objects/${obj.id}/edit`}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 active:bg-white/10 text-white/60 shrink-0"
                        title="Редактировать"
                      >
                        <Icon name="Pencil" size={17} />
                      </Link>
                      {closeBtn(obj, true)}
                      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 shrink-0">
                        <DeleteButton title="Удалить объект целиком?" description={deleteText} onConfirm={() => handleDelete(obj.id)} />
                      </div>
                    </>
                  )
                }
              />
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
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
                {visible.map((obj) => (
                  <tr key={obj.id} className="border-b border-white/5 last:border-0">
                    <td className="py-3 pr-4 text-[#D4AF37]">{obj.object_code}{unread[obj.id] ? <UnreadBadge count={unread[obj.id]} /> : null}</td>
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
                            to={`/cabinet/objects/${obj.id}/edit`}
                            className="text-white/40 hover:text-white transition-colors"
                            title="Редактировать объект"
                          >
                            <Icon name="Pencil" size={15} />
                          </Link>
                        )}
                        {!isClient && closeBtn(obj)}
                        {!isClient && (
                          <DeleteButton title="Удалить объект целиком?" description={deleteText} onConfirm={() => handleDelete(obj.id)} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>
    </CrmLayout>
  )
}

function UnreadBadge({ count }: { count: number }) {
  return (
    <span
      title="Новые сообщения в чате"
      className="ml-2 inline-flex items-center gap-1 rounded-full bg-[#D4AF37] px-1.5 py-0.5 text-[10px] font-semibold text-[#161616] align-middle"
    >
      <Icon name="MessageCircle" size={10} />
      {count}
    </span>
  )
}
