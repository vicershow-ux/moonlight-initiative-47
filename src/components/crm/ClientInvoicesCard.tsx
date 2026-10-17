import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { Invoice, invoicesApi } from "@/lib/api"
import { downloadInvoicePdf } from "@/components/crm/object-detail/ObjectInvoices"

const money = (n: number) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n || 0) + " ₽"
const dateRu = (d: string) => new Date(String(d).slice(0, 10)).toLocaleDateString("ru-RU")
const isOverdue = (inv: Invoice) =>
  inv.status !== "paid" && !!inv.due_date && new Date(String(inv.due_date).slice(0, 10)) < new Date(new Date().toDateString())

/** Счета заказчика на главной его личного кабинета */
export function ClientInvoicesCard() {
  const [list, setList] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)

  useEffect(() => {
    invoicesApi
      .list()
      .then((d) => setList(d.invoices))
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }, [])

  const download = async (id: number) => {
    setBusyId(id)
    try {
      await downloadInvoicePdf(id)
    } finally {
      setBusyId(null)
    }
  }

  if (loading || list.length === 0) return null

  const unpaid = list.filter((i) => i.status !== "paid").reduce((s, i) => s + Number(i.total_amount || 0), 0)
  const paid = list.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.total_amount || 0), 0)

  return (
    <div className="mb-6 rounded-xl border border-white/10 bg-[#1f1f1f] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-medium">
          <Icon name="Receipt" size={18} className="text-[#D4AF37]" />
          Мои счета на оплату
        </p>
        <div className="flex gap-4 text-sm">
          <span className="text-white/50">
            К оплате: <b className="text-[#D4AF37]">{money(unpaid)}</b>
          </span>
          <span className="text-white/50">
            Оплачено: <b className="text-green-400">{money(paid)}</b>
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {list.map((inv) => {
          const isPaid = inv.status === "paid"
          return (
            <div
              key={inv.id}
              className="flex flex-col gap-3 rounded-lg border border-white/10 bg-[#161616] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="mb-0.5 flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">
                    Счёт № {inv.invoice_number} <span className="text-white/40">от {dateRu(inv.invoice_date)}</span>
                  </p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs",
                      isPaid ? "bg-green-500/20 text-green-300" : "bg-[#D4AF37]/15 text-[#D4AF37]",
                    )}
                  >
                    {isPaid ? "Оплачен" : "Ожидает оплаты"}
                  </span>
                  {isOverdue(inv) && <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">просрочен</span>}
                </div>
                <p className="truncate text-xs text-white/40">
                  {[inv.address, inv.contract_number && `Договор № ${inv.contract_number}`, inv.act_number && `Акт № ${inv.act_number}`]
                    .filter(Boolean)
                    .join(" · ")}
                  {inv.due_date && !isPaid ? ` · оплатить до ${dateRu(inv.due_date)}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <p className="text-lg font-semibold">{money(Number(inv.total_amount))}</p>
                <button
                  onClick={() => download(inv.id)}
                  disabled={busyId === inv.id}
                  className="flex items-center gap-1.5 rounded-lg bg-[#D4AF37] px-3 py-2 text-sm font-medium text-[#161616] transition-colors hover:bg-[#B8860B] disabled:opacity-60"
                >
                  <Icon name={busyId === inv.id ? "Loader2" : "Download"} size={14} className={busyId === inv.id ? "animate-spin" : ""} />
                  PDF
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ClientInvoicesCard
