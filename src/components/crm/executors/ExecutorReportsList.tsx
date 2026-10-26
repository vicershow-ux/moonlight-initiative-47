import { useState } from "react"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { ExecutorReport, executorsApi } from "@/lib/executorsApi"
import { formatDate } from "@/components/crm/documents/constants"

export const reportStatus: Record<ExecutorReport["status"], { label: string; cls: string }> = {
  new: { label: "на проверке", cls: "bg-amber-500/20 text-amber-300" },
  accepted: { label: "принят", cls: "bg-green-500/20 text-green-300" },
  rework: { label: "на доработку", cls: "bg-red-500/20 text-red-300" },
}

interface Props {
  reports: ExecutorReport[]
  onChanged?: () => void
  /** Показывать имя исполнителя (на странице объекта) или объект (на странице исполнителя) */
  show: "executor" | "object"
  canReview?: boolean
}

function ReportItem({ r, show, canReview, onChanged }: { r: ExecutorReport } & Omit<Props, "reports">) {
  const [reply, setReply] = useState(r.reply || "")
  const [busy, setBusy] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const st = reportStatus[r.status] || reportStatus.new

  const review = async (status: "accepted" | "rework") => {
    setBusy(true)
    try {
      await executorsApi.reviewReport(r.id, status, reply)
      onChanged?.()
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="rounded-lg border border-white/10 bg-[#161616] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <p className="text-sm font-medium">
          {show === "executor" ? r.executor_name : `${r.object_code}${r.address ? ` · ${r.address}` : ""}`}
        </p>
        <span className={cn("px-2 py-0.5 rounded-full text-[11px]", st.cls)}>{st.label}</span>
      </div>
      <p className="text-xs text-white/40 mb-2">
        {formatDate(r.report_date)} · готовность {r.progress_pct}%
      </p>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-2">
        <div className="h-full bg-[#D4AF37]" style={{ width: `${r.progress_pct}%` }} />
      </div>
      <p className="text-sm text-white/80 whitespace-pre-wrap break-words">{r.work_text}</p>
      {r.photos?.length > 0 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {r.photos.map((u) => (
            <button key={u} onClick={() => setPhoto(u)} className="shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-white/10">
              <img src={u} alt="Фото работ" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      {r.reply && r.status !== "new" && !canReview && (
        <p className="mt-2 text-xs text-white/60 border-l-2 border-[#D4AF37]/50 pl-2">Ответ: {r.reply}</p>
      )}
      {canReview && (
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Комментарий исполнителю"
            className="flex-1 bg-[#1f1f1f] border border-white/10 rounded-lg px-3 min-h-[40px] text-base sm:text-sm outline-none focus:border-[#D4AF37]/50"
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => review("accepted")}
              disabled={busy}
              className="flex items-center justify-center gap-1.5 min-h-[40px] px-3 rounded-lg bg-green-500/20 text-green-300 text-sm hover:bg-green-500/30 disabled:opacity-60"
            >
              <Icon name="Check" size={14} />
              Принять
            </button>
            <button
              onClick={() => review("rework")}
              disabled={busy}
              className="flex items-center justify-center gap-1.5 min-h-[40px] px-3 rounded-lg bg-red-500/15 text-red-300 text-sm hover:bg-red-500/25 disabled:opacity-60"
            >
              <Icon name="RotateCcw" size={14} />
              Доработать
            </button>
          </div>
        </div>
      )}
      {photo && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-3" onClick={() => setPhoto(null)}>
          <img src={photo} alt="Фото работ" className="max-w-full max-h-full object-contain" />
          <button className="absolute top-3 right-3 w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center" aria-label="Закрыть">
            <Icon name="X" size={20} />
          </button>
        </div>
      )}
    </li>
  )
}

export function ExecutorReportsList({ reports, onChanged, show, canReview }: Props) {
  if (reports.length === 0) {
    return <p className="text-xs text-white/40">Отчётов пока нет</p>
  }
  return (
    <ul className="flex flex-col gap-2">
      {reports.map((r) => (
        <ReportItem key={r.id} r={r} show={show} canReview={canReview} onChanged={onChanged} />
      ))}
    </ul>
  )
}

export default ExecutorReportsList
