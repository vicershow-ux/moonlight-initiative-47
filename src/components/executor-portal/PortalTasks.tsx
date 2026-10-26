import { useRef, useState } from "react"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { compressImage } from "@/lib/compressImage"
import { ExecutorTask, dueInfo, portalApi } from "@/lib/executorsApi"

const statusView = {
  open: { label: "к выполнению", cls: "bg-blue-500/20 text-blue-300" },
  done: { label: "на проверке", cls: "bg-amber-500/20 text-amber-300" },
  accepted: { label: "принято", cls: "bg-green-500/20 text-green-300" },
}

function TaskItem({ t, onChanged }: { t: ExecutorTask; onChanged: () => void }) {
  const [open, setOpen] = useState(false)
  const [comment, setComment] = useState("")
  const [photos, setPhotos] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const camRef = useRef<HTMLInputElement>(null)
  const due = dueInfo(t.due_date, t.status)
  const st = statusView[t.status]

  const addPhotos = async (list: FileList | null) => {
    if (!list?.length) return
    setBusy(true)
    try {
      for (const f of Array.from(list).slice(0, 10 - photos.length)) {
        const { data, name } = await compressImage(f)
        const { url } = await portalApi.upload(name, data)
        setPhotos((p) => [...p, url])
      }
    } catch (e) {
      setError((e as Error)?.message || "Не удалось загрузить фото")
    } finally {
      setBusy(false)
      if (camRef.current) camRef.current.value = ""
    }
  }

  const complete = async (done: boolean) => {
    setBusy(true)
    setError("")
    try {
      await portalApi.completeTask(t.id, { done, comment, photos })
      setOpen(false)
      setComment("")
      setPhotos([])
      onChanged()
    } catch (e) {
      setError((e as Error)?.message || "Не удалось сохранить")
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className={cn("rounded-lg border bg-[#161616] p-3", t.status === "open" && due.cls === "text-red-400" ? "border-red-500/40" : "border-white/10")}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => t.status === "open" && setOpen((v) => !v)}
          disabled={t.status !== "open"}
          className={cn(
            "w-7 h-7 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
            t.status === "open" ? "border-white/30 hover:border-[#D4AF37]" : "border-emerald-500 bg-emerald-500/20 text-emerald-300"
          )}
          aria-label="Отметить выполнение"
        >
          {t.status !== "open" && <Icon name="Check" size={16} />}
        </button>
        <div className="min-w-0 flex-1">
          <p className={cn("text-sm font-medium break-words", t.status === "accepted" && "line-through text-white/50")}>{t.title}</p>
          <p className="text-xs mt-0.5 flex flex-wrap gap-x-2">
            <span className={due.cls}>{due.text}</span>
            <span className="text-white/40">{t.object_code}{t.address ? ` · ${t.address}` : ""}</span>
          </p>
          {t.description && <p className="text-xs text-white/60 mt-1.5 whitespace-pre-wrap break-words">{t.description}</p>}
          {t.status !== "open" && t.executor_comment && <p className="text-xs text-white/50 mt-1.5">Ваш комментарий: {t.executor_comment}</p>}
        </div>
        <span className={cn("px-2 py-0.5 rounded-full text-[10px] shrink-0", st.cls)}>{st.label}</span>
      </div>

      {t.status === "open" && !open && (
        <button
          onClick={() => setOpen(true)}
          className="mt-3 w-full flex items-center justify-center gap-2 min-h-[44px] rounded-lg bg-emerald-500/15 text-emerald-300 text-sm hover:bg-emerald-500/25"
        >
          <Icon name="CheckCircle2" size={16} />
          Отметить выполненным
        </button>
      )}

      {t.status === "open" && open && (
        <div className="mt-3 flex flex-col gap-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Комментарий (необязательно): что сделано, нюансы"
            className="w-full bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2.5 text-base outline-none focus:border-[#D4AF37]/50"
          />
          <div className="flex gap-2 flex-wrap">
            {photos.map((u) => (
              <img key={u} src={u} alt="Фото" className="w-16 h-16 rounded-lg object-cover border border-white/10" />
            ))}
            <button
              onClick={() => camRef.current?.click()}
              disabled={busy}
              className="w-16 h-16 rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center text-[11px] text-white/50"
            >
              <Icon name={busy ? "Loader2" : "Camera"} size={18} className={busy ? "animate-spin" : ""} />
              Фото
            </button>
          </div>
          <input ref={camRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addPhotos(e.target.files)} />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="grid grid-cols-[auto_1fr] gap-2">
            <button onClick={() => setOpen(false)} className="min-h-[44px] px-4 rounded-lg bg-white/5 text-sm text-white/60">
              Отмена
            </button>
            <button
              onClick={() => complete(true)}
              disabled={busy}
              className="flex items-center justify-center gap-2 min-h-[44px] rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium disabled:opacity-60"
            >
              <Icon name="Check" size={16} />
              Готово
            </button>
          </div>
        </div>
      )}

      {t.status === "done" && (
        <button onClick={() => complete(false)} disabled={busy} className="mt-2 text-xs text-white/40 hover:text-white">
          Снять отметку
        </button>
      )}
    </li>
  )
}

export function PortalTasks({ tasks, onChanged }: { tasks: ExecutorTask[]; onChanged: () => void }) {
  const [showAccepted, setShowAccepted] = useState(false)
  const active = tasks.filter((t) => t.status !== "accepted")
  const accepted = tasks.filter((t) => t.status === "accepted")
  const openCount = tasks.filter((t) => t.status === "open").length

  if (tasks.length === 0) return null

  return (
    <section className="bg-[#1f1f1f] border border-white/10 rounded-xl p-4">
      <p className="font-medium mb-3 flex items-center gap-2">
        <Icon name="ListTodo" size={17} className="text-[#D4AF37]" />
        Мои задания
        {openCount > 0 && <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#D4AF37] text-[#161616] font-medium">{openCount}</span>}
      </p>
      {active.length === 0 ? (
        <p className="text-xs text-white/40">Все задания выполнены и приняты</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {active.map((t) => (
            <TaskItem key={t.id} t={t} onChanged={onChanged} />
          ))}
        </ul>
      )}
      {accepted.length > 0 && (
        <>
          <button onClick={() => setShowAccepted((v) => !v)} className="mt-3 text-xs text-white/50 hover:text-white">
            {showAccepted ? "Скрыть принятые" : `Принятые (${accepted.length})`}
          </button>
          {showAccepted && (
            <ul className="flex flex-col gap-2 mt-2">
              {accepted.map((t) => (
                <TaskItem key={t.id} t={t} onChanged={onChanged} />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}

export default PortalTasks
