import { useMemo, useState } from "react"
import { Link, useNavigate } from "@/lib/router-compat"
import Icon from "@/components/ui/icon"
import { MobileCard, CardAction } from "@/components/crm/MobileCard"
import { FinanceInvoice } from "@/lib/api"
import { card, dateRu, rub } from "./format"

type Filter = "all" | "unpaid" | "overdue" | "paid"

const FILTERS: { k: Filter; l: string }[] = [
  { k: "all", l: "Все" },
  { k: "unpaid", l: "Ожидают" },
  { k: "overdue", l: "Просрочены" },
  { k: "paid", l: "Оплачены" },
]

function badge(inv: FinanceInvoice) {
  if (inv.status === "paid") {
    const how = inv.paid_online ? " · онлайн" : inv.paid_source === "bank" ? " · по выписке" : ""
    return { l: `Оплачен${how}`, c: "bg-green-500/15 text-green-300" }
  }
  if (inv.overdue) return { l: "Просрочен", c: "bg-red-500/15 text-red-300" }
  return { l: "Ожидает оплаты", c: "bg-[#D4AF37]/15 text-[#D4AF37]" }
}

export function FinanceInvoices({ invoices }: { invoices: FinanceInvoice[] }) {
  const [filter, setFilter] = useState<Filter>("all")
  const [q, setQ] = useState("")
  const navigate = useNavigate()

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return invoices.filter((i) => {
      if (filter === "paid" && i.status !== "paid") return false
      if (filter === "unpaid" && i.status === "paid") return false
      if (filter === "overdue" && !i.overdue) return false
      if (!s) return true
      return [i.invoice_number, i.client_name, i.object_code].some((v) => (v || "").toLowerCase().includes(s))
    })
  }, [invoices, filter, q])

  const total = list.reduce((a, i) => a + i.amount, 0)

  return (
    <div className={`${card} flex flex-col gap-4`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="font-medium flex items-center gap-2">
          <Icon name="ReceiptText" size={16} className="text-[#D4AF37]" />
          Счета
        </p>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
          <div className="relative">
            <Icon name="Search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Номер, заказчик, объект"
              className="rounded-lg border border-white/10 bg-[#161616] pl-8 pr-3 py-1.5 text-sm outline-none focus:border-[#D4AF37]/50 w-full sm:w-52 min-h-[40px] sm:min-h-0"
            />
          </div>
          <div className="flex overflow-x-auto whitespace-nowrap rounded-lg bg-white/5 p-0.5 text-xs">
            {FILTERS.map((f) => (
              <button
                key={f.k}
                onClick={() => setFilter(f.k)}
                className={`flex-1 sm:flex-none shrink-0 min-h-[36px] sm:min-h-0 rounded-md px-2.5 py-1 ${filter === f.k ? "bg-[#D4AF37] text-[#161616]" : "text-white/60 hover:text-white"}`}
              >
                {f.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-white/30 py-6 text-center">Счетов не найдено</p>
      ) : (
        <>
        <div className="md:hidden flex flex-col gap-3">
          {list.map((i) => {
            const b = badge(i)
            const open = () => navigate(`/cabinet/objects/${i.object_id}/invoices/${i.id}`)
            return (
              <MobileCard
                key={i.id}
                title={<span className="text-[#D4AF37]">№ {i.invoice_number}</span>}
                subtitle={dateRu(i.invoice_date)}
                badge={<span className={`rounded-full px-2 py-0.5 text-xs whitespace-nowrap ${b.c}`}>{b.l}</span>}
                onClick={open}
                rows={[
                  { label: "Заказчик", value: i.client_name || "—" },
                  { label: "Объект", value: i.object_code },
                  { label: "Основание", value: i.contract_number ? `Договор № ${i.contract_number}` : i.act_number ? `Акт № ${i.act_number}` : "—" },
                  { label: "Срок", value: <span className={i.overdue ? "text-red-300" : ""}>{i.status === "paid" ? dateRu(i.paid_at) : dateRu(i.due_date)}</span> },
                  { label: "Сумма", value: <span className="font-medium text-white">{rub(i.amount)}</span> },
                ]}
                actions={<CardAction icon={<Icon name="Eye" size={16} />} label="Открыть счёт" onClick={open} />}
              />
            )
          })}
          <div className="flex items-center justify-between text-sm px-1">
            <span className="text-white/50">Итого · {list.length} шт.</span>
            <span className="font-semibold">{rub(total)}</span>
          </div>
        </div>
        <div className="hidden md:block overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs text-white/40 border-b border-white/5">
                <th className="font-normal px-5 py-2">Счёт</th>
                <th className="font-normal px-3 py-2">Заказчик и объект</th>
                <th className="font-normal px-3 py-2">Основание</th>
                <th className="font-normal px-3 py-2">Срок</th>
                <th className="font-normal px-3 py-2">Статус</th>
                <th className="font-normal px-5 py-2 text-right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {list.map((i) => {
                const b = badge(i)
                return (
                  <tr key={i.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-5 py-2.5">
                      <Link to={`/cabinet/objects/${i.object_id}/invoices/${i.id}`} className="text-[#D4AF37] hover:underline">
                        № {i.invoice_number}
                      </Link>
                      <p className="text-xs text-white/40">{dateRu(i.invoice_date)}</p>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="truncate max-w-[220px]">{i.client_name || "—"}</p>
                      <p className="text-xs text-white/40">{i.object_code}</p>
                    </td>
                    <td className="px-3 py-2.5 text-white/60">
                      {i.contract_number ? `Договор № ${i.contract_number}` : i.act_number ? `Акт № ${i.act_number}` : "—"}
                    </td>
                    <td className={`px-3 py-2.5 ${i.overdue ? "text-red-300" : "text-white/60"}`}>
                      {i.status === "paid" ? dateRu(i.paid_at) : dateRu(i.due_date)}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs whitespace-nowrap ${b.c}`}>{b.l}</span>
                    </td>
                    <td className="px-5 py-2.5 text-right font-medium whitespace-nowrap">{rub(i.amount)}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="text-sm">
                <td colSpan={5} className="px-5 pt-3 text-white/50">
                  Итого по списку · {list.length} шт.
                </td>
                <td className="px-5 pt-3 text-right font-semibold">{rub(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        </>
      )}
    </div>
  )
}
