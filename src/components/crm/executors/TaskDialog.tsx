import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Icon from "@/components/ui/icon"
import { objectsApi } from "@/lib/api"
import { Executor, ExecutorTask, executorsApi, tasksApi } from "@/lib/executorsApi"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  task?: ExecutorTask | null
  /** Зафиксированный объект (страница объекта) или исполнитель (карточка исполнителя) */
  objectId?: number
  executorId?: number
  onSaved: () => void
}

const input =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 min-h-[44px] text-base sm:text-sm outline-none focus:border-[#D4AF37]/50"

const plusDays = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function TaskDialog({ open, onOpenChange, task, objectId, executorId, onSaved }: Props) {
  const [executors, setExecutors] = useState<Executor[]>([])
  const [objects, setObjects] = useState<{ id: number; object_code: string; address?: string }[]>([])
  const [exId, setExId] = useState<number | "">("")
  const [objId, setObjId] = useState<number | "">("")
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [due, setDue] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    setError("")
    setTitle(task?.title || "")
    setDesc(task?.description || "")
    setDue(task?.due_date?.slice(0, 10) || plusDays(3))
    setExId(task?.executor_id ?? executorId ?? "")
    setObjId(task?.object_id ?? objectId ?? "")
    if (!task && !executorId) {
      executorsApi
        .list()
        .then((d) => {
          const active = (d.executors || []).filter((e) => !e.is_archived)
          setExecutors(active)
          if (active.length === 1) setExId(active[0].id)
        })
        .catch(() => setExecutors([]))
    }
    if (!task && !objectId) {
      objectsApi.list().then((d) => setObjects(d.objects || [])).catch(() => setObjects([]))
    }
  }, [open, task, objectId, executorId])

  const save = async () => {
    setError("")
    if (!task && !exId) return setError("Выберите исполнителя")
    if (!task && !objId) return setError("Выберите объект")
    if (title.trim().length < 3) return setError("Напишите, что нужно сделать")
    setBusy(true)
    try {
      if (task) await tasksApi.update(task.id, { title, description: desc, due_date: due })
      else await tasksApi.create({ executor_id: Number(exId), object_id: Number(objId), title, description: desc, due_date: due })
      onSaved()
      onOpenChange(false)
    } catch (e) {
      setError((e as Error)?.message || "Не удалось сохранить")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1f1f1f] border-white/10 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Задание" : "Новое задание исполнителю"}</DialogTitle>
        </DialogHeader>

        {!task && !executorId && (
          <label className="flex flex-col gap-1">
            <span className="text-xs text-white/50">Исполнитель</span>
            <select value={exId} onChange={(e) => setExId(Number(e.target.value) || "")} className={input}>
              <option value="">— выберите —</option>
              {executors.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.display_name}
                  {e.specialty ? ` · ${e.specialty}` : ""}
                </option>
              ))}
            </select>
            {executors.length === 0 && <span className="text-[11px] text-white/40">Сначала добавьте исполнителя в разделе «Исполнители»</span>}
          </label>
        )}
        {!task && !objectId && (
          <label className="flex flex-col gap-1">
            <span className="text-xs text-white/50">Объект</span>
            <select value={objId} onChange={(e) => setObjId(Number(e.target.value) || "")} className={input}>
              <option value="">— выберите —</option>
              {objects.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.object_code} {o.address ? `— ${o.address}` : ""}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="flex flex-col gap-1">
          <span className="text-xs text-white/50">Что сделать</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: развести электрику на кухне" className={input} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-white/50">Подробности (необязательно)</span>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
            placeholder="Объём, требования, где взять материал…"
            className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-base sm:text-sm outline-none focus:border-[#D4AF37]/50"
          />
        </label>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-white/50">Срок</span>
          <div className="flex flex-wrap gap-2">
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={`${input} w-auto flex-1 min-w-[150px]`} />
            {[
              ["Завтра", 1],
              ["3 дня", 3],
              ["Неделя", 7],
            ].map(([l, n]) => (
              <button
                key={l}
                type="button"
                onClick={() => setDue(plusDays(Number(n)))}
                className="min-h-[44px] px-3 rounded-lg bg-white/5 text-sm text-white/60 hover:text-white"
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 flex items-center gap-1.5">
            <Icon name="CircleAlert" size={15} />
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2 border-t border-white/10">
          <button onClick={() => onOpenChange(false)} className="min-h-[44px] px-4 text-sm text-white/50 hover:text-white">
            Отмена
          </button>
          <button
            onClick={save}
            disabled={busy}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] text-[#161616] text-sm font-medium disabled:opacity-60"
          >
            {busy && <Icon name="Loader2" size={15} className="animate-spin" />}
            {task ? "Сохранить" : "Поставить задание"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TaskDialog
