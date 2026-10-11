import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { actsApi, Act } from "@/lib/api"
import { downloadContractPdf, contractPdfBase64 } from "@/lib/downloadContractPdf"
import { SendDocEmailDialog } from "@/components/crm/SendDocEmailDialog"
import { printAct, darkenActHtml } from "@/lib/printAct"

export default function ActView() {
  const { actId } = useParams()
  const navigate = useNavigate()

  const [act, setAct] = useState<Act | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)

  useEffect(() => {
    if (!actId) return
    setLoading(true)
    actsApi
      .get(Number(actId))
      .then(setAct)
      .catch(() => navigate("/cabinet/documents"))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actId])

  const handlePrint = () => {
    if (!act) return
    printAct(act)
  }

  const handleDownload = async () => {
    if (!act) return
    setDownloading(true)
    try {
      await downloadContractPdf(darkenActHtml(act.content_html), `Акт ${act.act_number}`)
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <CrmLayout title="Акт">
        <div className="flex items-center justify-center py-24">
          <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
        </div>
      </CrmLayout>
    )
  }

  if (!act) return null

  return (
    <CrmLayout title={`Акт выполненных работ № ${act.act_number}`}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <Link
          to="/cabinet/documents"
          className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
        >
          <Icon name="ChevronLeft" size={16} />
          К документам
        </Link>

        <div className="flex items-center gap-2">
          <span className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium",
            act.status === "signed" ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/50"
          )}>
            {act.status === "signed" ? "подписан" : "черновик"}
          </span>
          <Link
            to={`/cabinet/objects/${act.object_id}/acts/${act.id}/edit`}
            className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm px-3 py-2 rounded-lg"
          >
            <Icon name="Pencil" size={14} />
            Редактировать
          </Link>
          <button
            onClick={() => setSendOpen(true)}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 transition-colors text-white text-sm px-3 py-2 rounded-lg"
          >
            <Icon name="Mail" size={14} />
            Отправить на почту
          </button>
          <button
            onClick={handlePrint}
            title="Печать"
            className="flex items-center justify-center w-9 h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg"
          >
            <Icon name="Printer" size={15} />
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            title="Скачать PDF"
            className="flex items-center justify-center w-9 h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg disabled:opacity-60"
          >
            {downloading ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Download" size={15} />}
          </button>
        </div>
      </div>

      <div className="bg-white text-[#161616] rounded-xl p-8 sm:p-12 max-w-4xl mx-auto shadow-lg">
        <div dangerouslySetInnerHTML={{ __html: darkenActHtml(act.content_html) }} />
      </div>
      <SendDocEmailDialog
        open={sendOpen}
        onOpenChange={setSendOpen}
        docName="акт"
        objectId={act.object_id}
        fileName={`Акт_${act.act_number}.pdf`}
        makePdf={() => contractPdfBase64(darkenActHtml(act.content_html), `Акт ${act.act_number}`)}
        send={(p) => actsApi.sendEmail(act.id, p)}
      />
    </CrmLayout>
  )
}