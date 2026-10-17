import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { Invoice, invoicesApi } from "@/lib/api"
import { formatMoney } from "./utils"

const STATUS: Record<Invoice["status"], { label: string; cls: string }> = {
  issued: { label: "Выставлен", cls: "bg-white/10 text-white/50" },
  sent: { label: "Отправлен", cls: "bg-blue-500/20 text-blue-300" },
  paid: { label: "Оплачен", cls: "bg-green-500/20 text-green-300" },
}

const dateRu = (d: string) => new Date(d).toLocaleDateString("ru-RU")

/** Счета на оплату по объекту */
export function ObjectInvoices({ objectId }: { objectId: number }) {
  const [list, setList] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    invoicesApi
      .list({ object_id: objectId })
      .then((d) => setList(d.invoices))
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }, [objectId])

  const paid = list.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.total_amount || 0), 0)
  const total = list.reduce((s, i) => s + Number(i.total_amount || 0), 0)

  return (
    <>
      <div className="mb-2 mt-6 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-white/40">Счета на оплату</p>
        <Link
          to={`/cabinet/objects/${objectId}/invoices/new`}
          className="flex items-center gap-1 text-xs text-[#D4AF37] transition-colors hover:text-[#B8860B]"
        >
          <Icon name="Plus" size={13} />
          Выставить счёт
        </Link>
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
            return (
              <Link
                key={inv.id}
                to={`/cabinet/objects/${objectId}/invoices/${inv.id}`}
                className="block rounded-lg border border-white/10 bg-[#161616] p-4 transition-colors hover:border-[#D4AF37]/40"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">
                    Счёт № {inv.invoice_number} <span className="text-white/40">от {dateRu(inv.invoice_date)}</span>
                  </p>
                  <span className={cn("rounded-full px-2 py-0.5 text-xs", st.cls)}>{st.label}</span>
                </div>
                <p className="text-lg font-semibold">{formatMoney(Number(inv.total_amount))}</p>
                <p className="text-xs text-white/40">
                  {[inv.contract_number && `Договор № ${inv.contract_number}`, inv.act_number && `Акт № ${inv.act_number}`]
                    .filter(Boolean)
                    .join(" · ") || "Без основания"}
                </p>
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
