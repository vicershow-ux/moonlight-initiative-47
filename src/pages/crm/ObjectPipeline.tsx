import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { objectStatusesApi, ObjectStatus, ObjectStatusTransition } from "@/lib/api"
import { statusColorOptions, getStatusBadgeClass } from "@/lib/objectStatusColors"
import { useAuth } from "@/contexts/AuthContext"

interface StatusForm {
  name: string
  color: string
  is_active_stage: boolean
  is_final: boolean
}

const emptyForm: StatusForm = { name: "", color: "gray", is_active_stage: false, is_final: false }

export default function ObjectPipeline() {
  const { user } = useAuth()
  const canManage = user?.role === "owner" || user?.position === "super_admin" || user?.position === "director"

  const [statuses, setStatuses] = useState<ObjectStatus[]>([])
  const [transitions, setTransitions] = useState<ObjectStatusTransition[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedFromId, setSelectedFromId] = useState<number | null>(null)
  const [pendingToIds, setPendingToIds] = useState<Set<number>>(new Set())
  const [savingTransitions, setSavingTransitions] = useState(false)

  const [draggedId, setDraggedId] = useState<number | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<StatusForm>(emptyForm)
  const [createSaving, setCreateSaving] = useState(false)
  const [createError, setCreateError] = useState("")

  const [editing, setEditing] = useState<ObjectStatus | null>(null)
  const [editForm, setEditForm] = useState<StatusForm>(emptyForm)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState("")

  const load = () => {
    setLoading(true)
    objectStatusesApi
      .list()
      .then((data) => {
        setStatuses(data.statuses)
        setTransitions(data.transitions)
        if (data.statuses.length > 0) {
          setSelectedFromId((prev) => prev ?? data.statuses.find((s) => !s.is_archived)?.id ?? data.statuses[0].id)
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (selectedFromId == null) return
    const ids = transitions.filter((t) => t.from_status_id === selectedFromId).map((t) => t.to_status_id)
    setPendingToIds(new Set(ids))
  }, [selectedFromId, transitions])

  const activeStatuses = useMemo(() => statuses.filter((s) => !s.is_archived), [statuses])
  const nonFinalStatuses = useMemo(() => activeStatuses.filter((s) => !s.is_final), [activeStatuses])
  const finalStatuses = useMemo(() => activeStatuses.filter((s) => s.is_final), [activeStatuses])

  const selectedStatus = useMemo(() => statuses.find((s) => s.id === selectedFromId) || null, [statuses, selectedFromId])
  const otherStatuses = useMemo(
    () => activeStatuses.filter((s) => s.id !== selectedFromId),
    [activeStatuses, selectedFromId]
  )

  const countTransitionsFrom = (id: number) => transitions.filter((t) => t.from_status_id === id).length

  const handleCreate = async () => {
    setCreateError("")
    if (createForm.name.trim().length < 1) {
      setCreateError("Введите название статуса")
      return
    }
    setCreateSaving(true)
    try {
      await objectStatusesApi.create(createForm)
      setCreateOpen(false)
      setCreateForm(emptyForm)
      load()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Ошибка сохранения")
    } finally {
      setCreateSaving(false)
    }
  }

  const openEdit = (s: ObjectStatus) => {
    setEditing(s)
    setEditForm({ name: s.name, color: s.color, is_active_stage: s.is_active_stage, is_final: s.is_final })
    setEditError("")
  }

  const handleEditSave = async () => {
    if (!editing) return
    setEditError("")
    if (editForm.name.trim().length < 1) {
      setEditError("Введите название статуса")
      return
    }
    setEditSaving(true)
    try {
      await objectStatusesApi.update(editing.id, editForm)
      setEditing(null)
      load()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Ошибка сохранения")
    } finally {
      setEditSaving(false)
    }
  }

  const handleToggleArchive = async (s: ObjectStatus) => {
    await objectStatusesApi.update(s.id, { is_archived: !s.is_archived })
    load()
  }

  const handleDelete = async (s: ObjectStatus) => {
    if (!window.confirm(`Удалить статус «${s.name}»?`)) return
    try {
      await objectStatusesApi.remove(s.id)
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Не удалось удалить статус")
    }
  }

  const handleDragStart = (id: number) => setDraggedId(id)

  const handleDrop = async (targetId: number) => {
    if (draggedId == null || draggedId === targetId) {
      setDraggedId(null)
      return
    }
    const list = [...statuses]
    const fromIdx = list.findIndex((s) => s.id === draggedId)
    const toIdx = list.findIndex((s) => s.id === targetId)
    if (fromIdx === -1 || toIdx === -1) return
    const [moved] = list.splice(fromIdx, 1)
    list.splice(toIdx, 0, moved)
    setStatuses(list)
    setDraggedId(null)
    await objectStatusesApi.reorder(list.map((s) => s.id))
    load()
  }

  const toggleTo = (id: number, checked: boolean) => {
    setPendingToIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleSaveTransitions = async () => {
    if (!selectedFromId) return
    setSavingTransitions(true)
    try {
      await objectStatusesApi.setTransitions(selectedFromId, Array.from(pendingToIds))
      load()
    } finally {
      setSavingTransitions(false)
    }
  }

  return (
    <CrmLayout
      title="Воронка объектов"
      subtitle="Управление статусами доступно только директору и супер-администратору."
    >
      <div className="flex justify-end mb-4">
        <Link to="/cabinet/company" className="text-sm text-blue-400 hover:underline flex items-center gap-1">
          Назад к настройкам компании
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Icon name="Loader2" size={24} className="animate-spin text-white/40" />
        </div>
      ) : (
        <>
          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium">Список статусов</p>
                <p className="text-xs text-white/40 mt-0.5">
                  Статусы сортируются перетаскиванием мышью. Используемые статусы удаляются через архив.
                </p>
              </div>
              {canManage && (
                <button
                  onClick={() => setCreateOpen(true)}
                  className="w-9 h-9 flex items-center justify-center bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] rounded-lg shrink-0"
                  title="Добавить статус"
                >
                  <Icon name="Plus" size={16} />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {statuses.map((s) => (
                <div
                  key={s.id}
                  draggable={canManage}
                  onDragStart={() => handleDragStart(s.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(s.id)}
                  className={`flex items-center justify-between bg-[#161616] border border-white/10 rounded-lg px-4 py-3 ${s.is_archived ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    {canManage && <Icon name="GripVertical" size={16} className="text-white/25 cursor-grab shrink-0" />}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(s.color)}`}>
                          {s.name}
                        </span>
                        {s.is_default && <span className="text-[10px] text-white/40">По умолчанию</span>}
                        {s.is_active_stage && <span className="text-[10px] text-green-400">Считается активным</span>}
                        {s.is_final && <span className="text-[10px] text-white/40">Финальный</span>}
                        {s.is_archived && <span className="text-[10px] text-white/30">В архиве</span>}
                      </div>
                      <p className="text-xs text-white/30 mt-1">
                        Порядок: {s.sort_order} · Объектов: {s.object_count}
                      </p>
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-4 text-sm shrink-0">
                      <button onClick={() => openEdit(s)} className="text-blue-400 hover:underline">
                        Изменить
                      </button>
                      <button onClick={() => handleToggleArchive(s)} className="text-blue-400 hover:underline">
                        {s.is_archived ? "Вернуть" : "В архив"}
                      </button>
                      {!s.is_default && (
                        <button onClick={() => handleDelete(s)} className="text-red-400 hover:underline">
                          Удалить
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
            <p className="font-medium">Переходы между статусами</p>
            <p className="text-xs text-white/40 mt-0.5 mb-4">
              Выберите исходный статус в воронке и настройте, в какие активные статусы из него можно переводить объект.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium">Воронка переходов</p>
                    <p className="text-xs text-white/30 mt-0.5">
                      Порядок берётся из списка статусов. Финальные статусы вынесены отдельно.
                    </p>
                  </div>
                  <p className="text-xs text-[#D4AF37] shrink-0">Активные статусы: {activeStatuses.length}</p>
                </div>

                <div className="flex flex-wrap gap-3 mb-5">
                  {nonFinalStatuses.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedFromId(s.id)}
                      className={`text-left bg-[#161616] border rounded-lg px-3 py-2.5 w-[190px] transition-colors ${
                        selectedFromId === s.id ? "border-[#D4AF37]" : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeClass(s.color)}`}>{s.name}</span>
                        {selectedFromId === s.id && <span className="text-[10px] text-[#D4AF37] font-medium">Выбран</span>}
                      </div>
                      <p className="text-xs text-white/30 mt-1.5">Переходов: {countTransitionsFrom(s.id)}</p>
                    </button>
                  ))}
                </div>

                {finalStatuses.length > 0 && (
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-sm font-medium">
                      Финальные статусы <span className="text-xs text-white/30 font-normal ml-1">Ветка завершения или отмены</span>
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2.5">
                      {finalStatuses.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedFromId(s.id)}
                          className={`text-left bg-[#161616] border rounded-lg px-3 py-2.5 w-[190px] transition-colors ${
                            selectedFromId === s.id ? "border-[#D4AF37]" : "border-white/10 hover:border-white/20"
                          }`}
                        >
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeClass(s.color)}`}>{s.name}</span>
                          <p className="text-xs text-white/30 mt-1.5">Переходов: {countTransitionsFrom(s.id)}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-[#161616] border border-white/10 rounded-lg p-4 h-fit">
                <p className="text-[11px] text-white/40 uppercase tracking-wide mb-3">Редактирование переходов</p>

                {selectedStatus ? (
                  <>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedStatus.color)}`}>
                      {selectedStatus.name}
                    </span>
                    <p className="text-xs text-white/30 mt-2">
                      Можно настроить {otherStatuses.length} потенциальных переходов
                    </p>
                    <p className="text-xs text-white/30">Активные исходящие: {pendingToIds.size}</p>

                    <div className="mt-4">
                      <p className="text-xs text-white/40 mb-2">Текущие связи</p>
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeClass(selectedStatus.color)}`}>
                          {selectedStatus.name}
                        </span>
                        {Array.from(pendingToIds).map((id) => {
                          const st = statuses.find((x) => x.id === id)
                          if (!st) return null
                          return (
                            <span key={id} className="flex items-center gap-1.5">
                              <Icon name="ArrowRight" size={12} className="text-white/20" />
                              <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeClass(st.color)}`}>
                                {st.name}
                              </span>
                            </span>
                          )
                        })}
                        {pendingToIds.size === 0 && <span className="text-xs text-white/20">Нет разрешённых переходов</span>}
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs text-white/40 mb-2">Можно перейти в</p>
                      <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
                        {otherStatuses.map((s) => (
                          <label
                            key={s.id}
                            className="flex items-start gap-2.5 bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2.5 cursor-pointer"
                          >
                            <Checkbox
                              checked={pendingToIds.has(s.id)}
                              onCheckedChange={(v) => toggleTo(s.id, !!v)}
                              disabled={!canManage}
                              className="mt-0.5"
                            />
                            <div>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeClass(s.color)}`}>{s.name}</span>
                              <p className="text-[11px] text-white/30 mt-1">
                                Разрешить прямой переход из статуса «{selectedStatus.name}».
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {canManage && (
                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
                        <p className="text-[11px] text-white/30 max-w-[220px]">
                          Изменения применятся после сохранения и сразу повлияют на доступные переходы объектов.
                        </p>
                        <button
                          onClick={handleSaveTransitions}
                          disabled={savingTransitions}
                          className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm px-3 py-2 rounded-lg disabled:opacity-60 shrink-0"
                        >
                          {savingTransitions && <Icon name="Loader2" size={14} className="animate-spin" />}
                          Сохранить переходы
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-white/30">Выберите статус слева</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <Dialog open={createOpen} onOpenChange={(v) => { setCreateOpen(v); if (!v) { setCreateForm(emptyForm); setCreateError("") } }}>
        <DialogContent className="bg-[#1f1f1f] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Новый статус</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Название</label>
              <input
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="например, ждёт согласования"
                className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Цвет</label>
              <Select value={createForm.color} onValueChange={(v) => setCreateForm((f) => ({ ...f, color: v }))}>
                <SelectTrigger className="bg-[#161616] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusColorOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <span className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                        {c.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={createForm.is_active_stage}
                onCheckedChange={(v) => setCreateForm((f) => ({ ...f, is_active_stage: !!v }))}
              />
              Считается активным (объект в работе)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={createForm.is_final}
                onCheckedChange={(v) => setCreateForm((f) => ({ ...f, is_final: !!v }))}
              />
              Финальный статус (завершение или отмена)
            </label>

            {createError && (
              <p className="text-sm text-red-400 flex items-center gap-1.5">
                <Icon name="CircleAlert" size={15} />
                {createError}
              </p>
            )}

            <button
              onClick={handleCreate}
              disabled={createSaving}
              className="mt-2 flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-3 rounded-lg disabled:opacity-60"
            >
              {createSaving ? <Icon name="Loader2" size={16} className="animate-spin" /> : "Добавить статус"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(v) => { if (!v) setEditing(null) }}>
        <DialogContent className="bg-[#1f1f1f] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Изменить статус</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Название</label>
              <input
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Цвет</label>
              <Select value={editForm.color} onValueChange={(v) => setEditForm((f) => ({ ...f, color: v }))}>
                <SelectTrigger className="bg-[#161616] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusColorOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <span className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                        {c.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={editForm.is_active_stage}
                onCheckedChange={(v) => setEditForm((f) => ({ ...f, is_active_stage: !!v }))}
              />
              Считается активным (объект в работе)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={editForm.is_final}
                onCheckedChange={(v) => setEditForm((f) => ({ ...f, is_final: !!v }))}
              />
              Финальный статус (завершение или отмена)
            </label>

            {editError && (
              <p className="text-sm text-red-400 flex items-center gap-1.5">
                <Icon name="CircleAlert" size={15} />
                {editError}
              </p>
            )}

            <button
              onClick={handleEditSave}
              disabled={editSaving}
              className="mt-2 flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-3 rounded-lg disabled:opacity-60"
            >
              {editSaving ? <Icon name="Loader2" size={16} className="animate-spin" /> : "Сохранить"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </CrmLayout>
  )
}
