import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { actsApi, Act } from "@/lib/api"
import { printAct, darkenActHtml } from "@/lib/printAct"
import { downloadContractPdf } from "@/lib/downloadContractPdf"
import { formatMoney } from "./utils"

const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString("ru-RU") : "")

export function ObjectActs({ objectId }: { objectId: number }) {
  const [acts, setActs] = useState<Act[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    actsApi
      .listByObject(objectId)
      .then((d) => setActs(d.acts || []))
      .catch(() => setActs([]))
      .finally(() => setLoading(false))
  }, [objectId])

  const download = async (a: Act) => {
    setBusyId(a.id)
    try {
      await downloadContractPdf(darkenActHtml(a.content_html), `Акт ${a.act_number}`)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Icon name="Loader2" size={20} className="animate-spin text-white/40" />
      </div>
    )
  }

  if (acts.length === 0) {
    return <div className="text-center py-8 text-white/30 text-sm">По этому объекту ещё нет актов</div>
  }

  return (
    <div className="flex flex-col gap-2">
      {acts.map((a) => (
        <div key={a.id} className="bg-[#161616] border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-1 gap-2">
            <p className="text-sm font-medium">
              Акт № {a.act_number}
              {a.act_date ? <span className="text-white/40 font-normal"> от {formatDate(a.act_date)}</span> : null}
            </p>
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                a.status === "signed" ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/50"
              }`}
            >
              {a.status === "signed" ? "Подписан" : "Черновик"}
            </span>
          </div>
          <p className="text-lg font-semibold mb-2">{formatMoney(a.total_amount)}</p>
          <div className="flex items-center gap-3">
            <Link
              to={`/cabinet/objects/${objectId}/acts/${a.id}`}
              className="text-white/40 hover:text-[#D4AF37] transition-colors"
              title="Просмотр"
            >
              <Icon name="Eye" size={15} />
            </Link>
            <button onClick={() => printAct(a)} className="text-white/40 hover:text-white transition-colors" title="Печать">
              <Icon name="Printer" size={15} />
            </button>
            <button
              onClick={() => download(a)}
              disabled={busyId === a.id}
              className="text-white/40 hover:text-white transition-colors"
              title="Скачать PDF"
            >
              <Icon name={busyId === a.id ? "Loader2" : "Download"} size={15} className={busyId === a.id ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ObjectActs
