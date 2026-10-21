import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { addendaApi, ContractAddendum } from "@/lib/api"
import { downloadContractPdf } from "@/lib/downloadContractPdf"
import { printAddendum, darkenActHtml } from "@/lib/printAct"
import { DocSignBar } from "@/components/crm/DocSignBar"
import { useAuth } from "@/contexts/AuthContext"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"

export default function AddendumView() {
  const { id, contractId, addendumId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isClient = user?.role === "client"
  const objectId = Number(id)
  const [doc, setDoc] = useState<ContractAddendum | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const load = () =>
    addendaApi
      .get(Number(addendumId))
      .then(setDoc)
      .catch(() => navigate(`/cabinet/objects/${objectId}`))

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addendumId])

  if (!doc) {
    return (
      <CrmLayout title="Дополнительное соглашение">
        <div className="flex items-center justify-center py-24">
          <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
        </div>
      </CrmLayout>
    )
  }

  const title = `Доп. соглашение № ${doc.addendum_number}`
  const html = darkenActHtml(doc.content_html || "")

  const download = async () => {
    setDownloading(true)
    try {
      await downloadContractPdf(html, `ДС ${doc.addendum_number} к договору ${doc.contract_number || ""}`.trim())
    } finally {
      setDownloading(false)
    }
  }

  return (
    <CrmLayout title={title} subtitle={`к договору № ${doc.contract_number || ""}`}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <Link
          to={isClient ? `/cabinet/objects/${objectId}` : `/cabinet/objects/${objectId}/contracts/${contractId}`}
          className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
        >
          <Icon name="ChevronLeft" size={16} />
          {isClient ? "К объекту" : "К договору"}
        </Link>
        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:items-center sm:w-auto">
          <span
            className={`col-span-2 justify-self-start px-2.5 py-1 rounded-full text-xs font-medium ${
              doc.status === "signed" ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/50"
            }`}
          >
            {doc.status === "signed" ? "подписано" : "черновик"}
          </span>
          {!isClient && !doc.signed_at && (
            <>
              <Link
                to={`/cabinet/objects/${objectId}/contracts/${contractId}/addenda/${doc.id}/edit`}
                className="flex items-center justify-center min-h-[44px] sm:min-h-0 gap-1.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm px-3 py-2 rounded-lg"
              >
                <Icon name="Pencil" size={14} />
                Редактировать
              </Link>
              <button
                onClick={() => setConfirmDelete(true)}
                title="Удалить"
                className="flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-red-500/20 hover:text-red-300 transition-colors rounded-lg"
              >
                <Icon name="Trash2" size={15} />
                <span className="sm:hidden">Удалить</span>
              </button>
            </>
          )}
          <button
            onClick={() => printAddendum({ addendum_number: doc.addendum_number, content_html: doc.content_html || "" })}
            title="Печать"
            className="flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg"
          >
            <Icon name="Printer" size={15} />
            <span className="sm:hidden">Печать</span>
          </button>
          <button
            onClick={download}
            disabled={downloading}
            title="Скачать PDF"
            className="flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg disabled:opacity-60"
          >
            <Icon name={downloading ? "Loader2" : "Download"} size={15} className={downloading ? "animate-spin" : ""} />
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </div>

      {isClient ? (
        <DocSignBar
          signedAt={doc.signed_at}
          isSigned={doc.status === "signed"}
          docLabel="Соглашение"
          docTitle={`допсоглашение № ${doc.addendum_number}`}
          amountLabel="Новая цена договора"
          amount={Number(doc.total_amount)}
          onSign={() => addendaApi.sign(doc.id)}
          onDone={load}
        />
      ) : (
        doc.signed_at && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 p-3 sm:p-4 flex items-center gap-3 max-w-4xl mx-auto text-sm">
            <Icon name="BadgeCheck" size={20} className="text-emerald-400" />
            Заказчик подписал онлайн {new Date(doc.signed_at).toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
          </div>
        )
      )}

      <div className="bg-white rounded-xl p-3 sm:p-6 md:p-10 max-w-4xl mx-auto shadow-xl overflow-x-auto">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      <ConfirmDeleteDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        onConfirm={async () => {
          await addendaApi.remove(doc.id)
          navigate(`/cabinet/objects/${objectId}/contracts/${contractId}`)
        }}
        title="Удалить соглашение?"
        description="Дополнительное соглашение будет удалено безвозвратно."
      />
    </CrmLayout>
  )
}
