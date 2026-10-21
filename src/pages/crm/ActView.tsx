import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { actsApi, Act } from "@/lib/api"
import { downloadContractPdf, contractPdfBase64 } from "@/lib/downloadContractPdf"
import { SendDocEmailDialog } from "@/components/crm/SendDocEmailDialog"
import { printAct, darkenActHtml } from "@/lib/printAct"
import { useAuth } from "@/contexts/AuthContext"
import { DocSignBar } from "@/components/crm/DocSignBar"

export default function ActView() {
  const { actId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isClient = user?.role === "client"

  const [act, setAct] = useState<Act | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)

  const reload = () => {
    if (actId) actsApi.get(Number(actId)).then(setAct)
  }

  useEffect(() => {
    if (!actId) return
    setLoading(true)
    actsApi
      .get(Number(actId))
      .then(setAct)
      .catch(() => navigate(isClient ? "/cabinet/objects" : "/cabinet/documents"))
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
          to={isClient ? `/cabinet/objects/${act.object_id}` : "/cabinet/documents"}
          className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
        >
          <Icon name="ChevronLeft" size={16} />
          {isClient ? "К объекту" : "К документам"}
        </Link>

        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:items-center sm:w-auto">
          <span className={cn(
            "col-span-2 justify-self-start px-2.5 py-1 rounded-full text-xs font-medium",
            act.status === "signed" ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/50"
          )}>
            {act.status === "signed" ? "подписан" : "черновик"}
          </span>
          {!isClient && (<>
          {!act.signed_at && (
          <Link
            to={`/cabinet/objects/${act.object_id}/acts/${act.id}/edit`}
            className="flex items-center justify-center min-h-[44px] sm:min-h-0 gap-1.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm px-3 py-2 rounded-lg"
          >
            <Icon name="Pencil" size={14} />
            Редактировать
          </Link>
          )}
          <Link
            to={`/cabinet/objects/${act.object_id}/invoices/new?act_id=${act.id}`}
            className="flex items-center justify-center min-h-[44px] sm:min-h-0 gap-1.5 bg-white/10 hover:bg-white/15 transition-colors text-white text-sm px-3 py-2 rounded-lg"
          >
            <Icon name="Receipt" size={14} />
            Выставить счёт
          </Link>
          <button
            onClick={() => setSendOpen(true)}
            className="flex items-center justify-center min-h-[44px] sm:min-h-0 gap-1.5 bg-white/10 hover:bg-white/15 transition-colors text-white text-sm px-3 py-2 rounded-lg"
          >
            <Icon name="Mail" size={14} />
            Отправить на почту
          </button>
          </>)}
          <button
            onClick={handlePrint}
            title="Печать"
            className="flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg"
          >
            <Icon name="Printer" size={15} />
            <span className="sm:hidden">Печать</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            title="Скачать PDF"
            className="flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg disabled:opacity-60"
          >
            {downloading ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Download" size={15} />}
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </div>

      {isClient ? (
        <DocSignBar
          signedAt={act.signed_at}
          isSigned={act.status === "signed"}
          docLabel="Акт"
          docTitle={`акт № ${act.act_number}`}
          amountLabel="Сумма по акту"
          amount={Number(act.total_amount)}
          onSign={() => actsApi.sign(act.id)}
          onDone={reload}
        />
      ) : (
        act.signed_at && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 p-3 sm:p-4 flex items-center gap-3 max-w-4xl mx-auto text-sm">
            <Icon name="BadgeCheck" size={20} className="text-emerald-400" />
            Заказчик подписал акт онлайн{" "}
            {new Date(act.signed_at).toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
          </div>
        )
      )}

      <div className="overflow-x-auto md:overflow-visible max-w-4xl mx-auto">
      <div className="bg-white text-[#161616] rounded-xl p-4 sm:p-12 max-w-4xl mx-auto shadow-lg break-words">
        <div dangerouslySetInnerHTML={{ __html: darkenActHtml(act.content_html) }} />
      </div>
      </div>
      <SendDocEmailDialog
        open={sendOpen}
        onOpenChange={setSendOpen}
        docName="акт"
        objectId={act.object_id}
        fileName={`Акт_${act.act_number}.pdf`}
        makePdf={() => contractPdfBase64(darkenActHtml(act.content_html), `Акт ${act.act_number}`)}
        send={(p) => actsApi.sendEmail(act.id, p)}
        extraFiles={(act.options?.attachments || []).map((f) => f.name)}
      />
    </CrmLayout>
  )
}