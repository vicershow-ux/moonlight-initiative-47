import { useEffect, useState } from "react"
import { Link } from "@/lib/router-compat"
import Icon from "@/components/ui/icon"
import { ExecutorReport, executorsApi } from "@/lib/executorsApi"
import { ExecutorReportsList } from "./ExecutorReportsList"

/** Отчёты нанятых исполнителей по объекту */
export function ObjectExecutorsCard({ objectId }: { objectId: number }) {
  const [reports, setReports] = useState<ExecutorReport[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  const load = () =>
    executorsApi
      .reports({ object_id: objectId })
      .then((d) => setReports(d.reports || []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectId])

  if (loading || reports.length === 0) return null
  const fresh = reports.filter((r) => r.status === "new").length
  const visible = showAll ? reports : reports.slice(0, 3)

  return (
    <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="font-medium flex items-center gap-2">
          <Icon name="ClipboardCheck" size={16} className="text-orange-300" />
          Отчёты исполнителей
          {fresh > 0 && <span className="px-2 py-0.5 rounded-full text-[11px] bg-amber-500/20 text-amber-300">{fresh} новых</span>}
        </p>
        <Link to="/cabinet/executors" className="text-xs text-white/40 hover:text-[#D4AF37]">
          Все исполнители
        </Link>
      </div>
      <ExecutorReportsList reports={visible} show="executor" canReview onChanged={load} />
      {reports.length > 3 && (
        <button onClick={() => setShowAll((v) => !v)} className="mt-2 text-xs text-white/50 hover:text-white">
          {showAll ? "Свернуть" : `Показать все (${reports.length})`}
        </button>
      )}
    </div>
  )
}

export default ObjectExecutorsCard
