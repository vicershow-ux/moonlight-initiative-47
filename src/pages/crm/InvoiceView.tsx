import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "@/lib/router-compat"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { Invoice, invoicesApi } from "@/lib/api"
import { buildInvoiceHtml } from "@/lib/buildInvoiceHtml"
import { docBrandHeader, docBrandStyles } from "@/lib/docBrandHeader"
import { printHtml } from "@/lib/printHtml"
import { notifyThanks } from "@/lib/invoiceThanks"
import { contractPdfBase64, downloadContractPdf } from "@/lib/downloadContractPdf"
import { SendDocEmailDialog } from "@/components/crm/SendDocEmailDialog"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"

export const INVOICE_STATUS: Record<Invoice["status"], { label: string; cls: string }> = {
  issued: { label: "выставлен", cls: "bg-white/10 text-white/60" },
  sent: { label: "отправлен", cls: "bg-blue-500/20 text-blue-300" },
  paid: { label: "оплачен", cls: "bg-green-500/20 text-green-300" },
}

export default function InvoiceView() {
  const { id, invoiceId } = useParams()
  const objectId = Number(id)
  const navigate = useNavigate()
  const [inv, setInv] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const load = () =>
    invoicesApi
      .get(Number(invoiceId))
      .then(setInv)
      .catch(() => navigate(`/cabinet/objects/${objectId}`))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId])

  if (loading || !inv) {
    return (
      <CrmLayout title="Счёт на оплату">
        <div className="flex items-center justify-center py-24">
          <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
        </div>
      </CrmLayout>
    )
  }

  const html = buildInvoiceHtml(inv)
  const pdfTitle = `Счёт ${inv.invoice_number}`

  const setStatus = async (status: Invoice["status"]) => {
    const res = await invoicesApi.update(inv.id, { status })
    setInv({ ...inv, status })
    notifyThanks(res.thanks)
  }

  const download = async () => {
    setDownloading(true)
    try {
      await downloadContractPdf(html, pdfTitle)
    } finally {
      setDownloading(false)
    }
  }

  const st = INVOICE_STATUS[inv.status] || INVOICE_STATUS.issued
  const iconBtn = "flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg disabled:opacity-60"

  return (
    <CrmLayout title={`Счёт на оплату № ${inv.invoice_number}`} subtitle={inv.client_name || ""}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link to={`/cabinet/objects/${objectId}`} className="inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white">
          <Icon name="ChevronLeft" size={16} />
          К объекту
        </Link>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
          <span className={cn("col-span-2 justify-self-start rounded-full px-2.5 py-1 text-xs font-medium", st.cls)}>{st.label}</span>
          {inv.status !== "paid" ? (
            <button
              onClick={() => setStatus("paid")}
              title="Заказчику автоматически уйдёт письмо с благодарностью"
              className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-green-600 sm:min-h-0 px-3 py-2 text-sm text-white transition-colors hover:bg-green-700"
            >
              <Icon name="BadgeCheck" size={14} />
              Отметить оплату
            </button>
          ) : (
            <button onClick={() => setStatus("sent")} className="min-h-[44px] rounded-lg bg-white/5 px-3 py-2 text-sm text-white/60 hover:bg-white/10 sm:min-h-0">
              Снять отметку оплаты
            </button>
          )}
          <Link
            to={`/cabinet/objects/${objectId}/invoices/${inv.id}/edit`}
            className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-blue-500 sm:min-h-0 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-600"
          >
            <Icon name="Pencil" size={14} />
            Редактировать
          </Link>
          <button
            onClick={() => setSendOpen(true)}
            className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-white/10 sm:min-h-0 px-3 py-2 text-sm text-white transition-colors hover:bg-white/15"
          >
            <Icon name="Mail" size={14} />
            Отправить на почту
          </button>
          <button onClick={() => printHtml(`Счёт № ${inv.invoice_number}`, `${docBrandHeader("")}${html}`, docBrandStyles)} title="Печать" className={iconBtn}>
            <Icon name="Printer" size={15} />
            <span className="sm:hidden">Печать</span>
          </button>
          <button onClick={download} disabled={downloading} title="Скачать PDF" className={iconBtn}>
            <Icon name={downloading ? "Loader2" : "Download"} size={15} className={downloading ? "animate-spin" : ""} />
            <span className="sm:hidden">PDF</span>
          </button>
          <button onClick={() => setDeleteOpen(true)} title="Удалить" className={cn(iconBtn, "hover:bg-red-500/20 hover:text-red-300")}>
            <Icon name="Trash2" size={15} />
            <span className="sm:hidden">Удалить</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl overflow-x-auto md:overflow-visible">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-4 text-[#161616] shadow-lg sm:p-12">
        <div dangerouslySetInnerHTML={{ __html: `<style>${docBrandStyles}</style>${docBrandHeader("")}${html}` }} />
      </div>
      </div>

      <SendDocEmailDialog
        open={sendOpen}
        onOpenChange={(v) => {
          setSendOpen(v)
          if (!v) load()
        }}
        docName="счёт"
        objectId={inv.object_id}
        fileName={`Счёт_${inv.invoice_number}.pdf`}
        makePdf={() => contractPdfBase64(html, pdfTitle)}
        send={(p) => invoicesApi.sendEmail(inv.id, p)}
      />
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Удалить счёт?"
        description={`Счёт № ${inv.invoice_number} будет удалён без возможности восстановления.`}
        onConfirm={async () => {
          await invoicesApi.remove(inv.id)
          navigate(`/cabinet/objects/${objectId}`)
        }}
      />
    </CrmLayout>
  )
}
