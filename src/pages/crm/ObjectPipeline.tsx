import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { objectStatusesApi, ObjectStatus, ObjectStatusTransition } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { StatusListPanel } from "@/components/crm/pipeline/StatusListPanel"
import { TransitionsFunnel } from "@/components/crm/pipeline/TransitionsFunnel"
import { TransitionsEditor } from "@/components/crm/pipeline/TransitionsEditor"
import { StatusFormDialog, StatusForm } from "@/components/crm/pipeline/StatusFormDialog"

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
          <StatusListPanel
            statuses={statuses}
            canManage={canManage}
            onCreateClick={() => setCreateOpen(true)}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onEdit={openEdit}
            onToggleArchive={handleToggleArchive}
            onDelete={handleDelete}
          />

          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
            <p className="font-medium">Переходы между статусами</p>
            <p className="text-xs text-white/40 mt-0.5 mb-4">
              Выберите исходный статус в воронке и настройте, в какие активные статусы из него можно переводить объект.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
              <TransitionsFunnel
                activeStatuses={activeStatuses}
                nonFinalStatuses={nonFinalStatuses}
                finalStatuses={finalStatuses}
                selectedFromId={selectedFromId}
                setSelectedFromId={setSelectedFromId}
                countTransitionsFrom={countTransitionsFrom}
              />

              <TransitionsEditor
                selectedStatus={selectedStatus}
                otherStatuses={otherStatuses}
                statuses={statuses}
                pendingToIds={pendingToIds}
                toggleTo={toggleTo}
                canManage={canManage}
                savingTransitions={savingTransitions}
                onSaveTransitions={handleSaveTransitions}
              />
            </div>
          </div>
        </>
      )}

      <StatusFormDialog
        open={createOpen}
        onOpenChange={(v) => { setCreateOpen(v); if (!v) { setCreateForm(emptyForm); setCreateError("") } }}
        title="Новый статус"
        form={createForm}
        setForm={setCreateForm}
        error={createError}
        saving={createSaving}
        onSubmit={handleCreate}
        submitLabel="Добавить статус"
        namePlaceholder="например, ждёт согласования"
      />

      <StatusFormDialog
        open={!!editing}
        onOpenChange={(v) => { if (!v) setEditing(null) }}
        title="Изменить статус"
        form={editForm}
        setForm={setEditForm}
        error={editError}
        saving={editSaving}
        onSubmit={handleEditSave}
        submitLabel="Сохранить"
      />
    </CrmLayout>
  )
}
