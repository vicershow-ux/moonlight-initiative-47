import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { DeleteButton } from "@/components/ui/delete-button"
import { ExecutorTask, TaskStatus, dueInfo, tasksApi } from "@/lib/executorsApi"
import { TaskDialog } from "./TaskDialog"

export const taskStatus: Record<TaskStatus, { label: string; cls: string }> = {
  open: { label: "в работе", cls: "bg-blue-500/20 text-blue-300" },
  done: { label: "выполнено — проверьте", cls: "bg-amber-500/20 text-amber-300" },
  accepted: { label: "принято", cls: "bg-green-500/20 text-green-300" },
}

interface Props {
  objectId?: number
  executorId?: number
}

/** Задания исполнителям — на странице объекта или в карточке исполнителя */
export function ExecutorTasksCard({ objectId, executorId }: Props) {
  const [tasks, setTasks] = useState<ExecutorTask[]>([])
  const [loading, setLoading] = useState(true)
  const [dialog, setDialog] = useState<{ open: boolean; task: ExecutorTask | null }>({ open: false, task: null })
  const [showAccepted, setShowAccepted] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)

  const load = () =>
    tasksApi
      .list({ object_id: objectId, executor_id: executorId })
      .then((d) => setTasks(d.tasks || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectId, executorId])

  const setStatus = async (id: number, status: "accepted" | "open") => {
    await tasksApi.setStatus(id, status).catch(() => null)
    load()
  }

  const active = tasks.filter((t) => t.status !== "accepted")
  const accepted = tasks.filter((t) => t.status === "accepted")
  const visible = showAccepted ? tasks : active
  const overdue = active.filter((t) => t.status === "open" && dueInfo(t.due_date, t.status).cls === "text-red-400").length

  return (
    <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="font-medium flex items-center gap-2 flex-wrap">
          <Icon name="ListTodo" size={16} className="text-orange-300" />
          Задания исполнителям
          {overdue > 0 && <span className="px-2 py-0.5 rounded-full text-[11px] bg-red-500/20 text-red-300">просрочено: {overdue}</span>}
        </p>
        <button
          onClick={() => setDialog({ open: true, task: null })}
          className="flex items-center gap-1.5 min-h-[36px] px-3 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] text-[#161616] text-xs font-medium shrink-0"
        >
          <Icon name="Plus" size={14} />
          Задание
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <Icon name="Loader2" size={18} className="animate-spin text-white/40" />
        </div>
      ) : visible.length === 0 ? (
        <p className="text-xs text-white/40">
          {tasks.length ? "Все задания приняты" : "Заданий пока нет. Поставьте задачу со сроком — исполнитель увидит её в своём кабинете."}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((t) => {
            const st = taskStatus[t.status]
            const due = dueInfo(t.due_date, t.status)
            return (
              <li key={t.id} className="rounded-lg border border-white/10 bg-[#161616] p-3">
                <div className="flex items-start gap-2">
                  <span
                    className={cn(
                      "mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0",
                      t.status === "open" ? "border-white/20" : "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                    )}
                  >
                    {t.status !== "open" && <Icon name="Check" size={13} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <button onClick={() => setDialog({ open: true, task: t })} className="text-left text-sm font-medium break-words hover:text-[#D4AF37]">
                      {t.title}
                    </button>
                    <p className="text-[11px] mt-0.5 flex flex-wrap gap-x-2">
                      <span className={due.cls}>{due.text}</span>
                      <span className="text-white/40">{objectId ? t.executor_name : `${t.object_code}${t.address ? ` · ${t.address}` : ""}`}</span>
                    </p>
                    {t.description && <p className="text-xs text-white/50 mt-1 whitespace-pre-wrap break-words">{t.description}</p>}
                    {t.status !== "open" && (t.executor_comment || t.photos?.length > 0) && (
                      <div className="mt-2 rounded-md bg-white/[0.03] p-2">
                        {t.executor_comment && <p className="text-xs text-white/70">Исполнитель: {t.executor_comment}</p>}
                        {t.photos?.length > 0 && (
                          <div className="mt-1.5 flex gap-1.5 overflow-x-auto">
                            {t.photos.map((u) => (
                              <button key={u} onClick={() => setPhoto(u)} className="w-14 h-14 shrink-0 rounded overflow-hidden border border-white/10">
                                <img src={u} alt="Фото" className="w-full h-full object-cover" loading="lazy" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] shrink-0", st.cls)}>{st.label}</span>
                </div>
                <div className="flex items-center justify-end gap-2 mt-2">
                  {t.status === "done" && (
                    <>
                      <button
                        onClick={() => setStatus(t.id, "open")}
                        className="flex items-center gap-1 min-h-[36px] px-3 rounded-lg bg-red-500/15 text-red-300 text-xs hover:bg-red-500/25"
                      >
                        <Icon name="RotateCcw" size={13} />
                        На доработку
                      </button>
                      <button
                        onClick={() => setStatus(t.id, "accepted")}
                        className="flex items-center gap-1 min-h-[36px] px-3 rounded-lg bg-green-500/20 text-green-300 text-xs hover:bg-green-500/30"
                      >
                        <Icon name="Check" size={13} />
                        Принять
                      </button>
                    </>
                  )}
                  <DeleteButton onConfirm={async () => { await tasksApi.remove(t.id).catch(() => null); load() }} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {accepted.length > 0 && (
        <button onClick={() => setShowAccepted((v) => !v)} className="mt-2 text-xs text-white/50 hover:text-white">
          {showAccepted ? "Скрыть принятые" : `Показать принятые (${accepted.length})`}
        </button>
      )}

      <TaskDialog
        open={dialog.open}
        onOpenChange={(v) => setDialog((d) => ({ ...d, open: v }))}
        task={dialog.task}
        objectId={objectId}
        executorId={executorId}
        onSaved={load}
      />
      {photo && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-3" onClick={() => setPhoto(null)}>
          <img src={photo} alt="Фото" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  )
}

export default ExecutorTasksCard
