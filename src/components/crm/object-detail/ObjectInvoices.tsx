import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { Invoice, invoicesApi } from "@/lib/api"
import { buildInvoiceHtml } from "@/lib/buildInvoiceHtml"
import { downloadContractPdf } from "@/lib/downloadContractPdf"
import { formatMoney } from "./utils"

const STATUS: Record<Invoice["status"], { label: string; clientLabel: string; cls: string }> = {
  issued: { label: "Выставлен", clientLabel: "Ожидает оплаты", cls: "bg-white/10 text-white/50" },
  sent: { label: "Отправлен", clientLabel: "Ожидает оплаты", cls: "bg-blue-500/20 text-blue-300" },
  paid: { label: "Оплачен", clientLabel: "Оплачен", cls: "bg-green-500/20 text-green-300" },
}

const dateRu = (d: string) => new Date(String(d).slice(0, 10)).toLocaleDateString("ru-RU")
const isOverdue = (inv: Invoice) =>
  inv.status !== "paid" && !!inv.due_date && new Date(String(inv.due_date).slice(0, 10)) < new Date(new Date().toDateString())

/** Скачать PDF счёта */
export async function downloadInvoicePdf(id: number) {
  const full = await invoicesApi.get(id)
  await downloadContractPdf(buildInvoiceHtml(full), `Счёт ${full.invoice_number}`)
}

/** Счета на оплату по объекту. Для заказчика — только просмотр статуса и скачивание PDF */
export function ObjectInvoices({ objectId, isClient = false }: { objectId: number; isClient?: boolean }) {
  const [list, setList] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)

  useEffect(() => {
    invoicesApi
      .list({ object_id: objectId })
      .then((d) => setList(d.invoices))
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }, [objectId])

  const download = async (id: number) => {
    setBusyId(id)
    try {
      await downloadInvoicePdf(id)
    } finally {
      setBusyId(null)
    }
  }

  const paid = list.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.total_amount || 0), 0)
  const total = list.reduce((s, i) => s + Number(i.total_amount || 0), 0)

  if (isClient && !loading && list.length === 0) return null

  return (
    <>
      <div className="mb-2 mt-6 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-white/40">Счета на оплату</p>
        {!isClient && (
          <Link
            to={`/cabinet/objects/${objectId}/invoices/new`}
            className="flex items-center gap-1 text-xs text-[#D4AF37] transition-colors hover:text-[#B8860B]"
          >
            <Icon name="Plus" size={13} />
            Выставить счёт
          </Link>
        )}
      </div>
      {loading ? (
        <div className="flex justify-center py-6">
          <Icon name="Loader2" size={20} className="animate-spin text-white/40" />
        </div>
      ) : list.length === 0 ? (
        <div className="py-6 text-center text-sm text-white/30">Счетов пока нет</div>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((inv) => {
            const st = STATUS[inv.status] || STATUS.issued
            const basis =
              [inv.contract_number && `Договор № ${inv.contract_number}`, inv.act_number && `Акт № ${inv.act_number}`]
                .filter(Boolean)
                .join(" · ") || "Без основания"
            const body = (
              <>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">
                    Счёт № {inv.invoice_number} <span className="text-white/40">от {dateRu(inv.invoice_date)}</span>
                  </p>
                  <div className="flex flex-wrap items-center justify-end gap-1">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs", st.cls)}>{isClient ? st.clientLabel : st.label}</span>
                    {isOverdue(inv) && <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">просрочен</span>}
                  </div>
                </div>
                <p className="text-lg font-semibold">{formatMoney(Number(inv.total_amount))}</p>
                <p className="text-xs text-white/40">
                  {basis}
                  {inv.due_date && inv.status !== "paid" ? ` · оплатить до ${dateRu(inv.due_date)}` : ""}
                </p>
              </>
            )
            return isClient ? (
              <div key={inv.id} className="rounded-lg border border-white/10 bg-[#161616] p-4">
                {body}
                <button
                  onClick={() => download(inv.id)}
                  disabled={busyId === inv.id}
                  className="mt-3 flex items-center gap-1.5 rounded-lg bg-[#D4AF37] px-3 py-2 text-sm font-medium text-[#161616] transition-colors hover:bg-[#B8860B] disabled:opacity-60"
                >
                  <Icon name={busyId === inv.id ? "Loader2" : "Download"} size={14} className={busyId === inv.id ? "animate-spin" : ""} />
                  Скачать PDF
                </button>
              </div>
            ) : (
              <Link
                key={inv.id}
                to={`/cabinet/objects/${objectId}/invoices/${inv.id}`}
                className="block rounded-lg border border-white/10 bg-[#161616] p-4 transition-colors hover:border-[#D4AF37]/40"
              >
                {body}
              </Link>
            )
          })}
          <p className="pt-1 text-right text-xs text-white/40">
            Оплачено {formatMoney(paid)} из {formatMoney(total)}
          </p>
        </div>
      )}
    </>
  )
}

export default ObjectInvoices
