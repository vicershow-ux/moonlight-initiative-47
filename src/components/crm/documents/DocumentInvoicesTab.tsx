import { useEffect, useMemo, useState } from "react"
import { Link } from "@/lib/router-compat"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { Invoice, invoicesApi } from "@/lib/api"
import { buildInvoiceHtml } from "@/lib/buildInvoiceHtml"
import { docBrandHeader, docBrandStyles } from "@/lib/docBrandHeader"
import { printHtml } from "@/lib/printHtml"
import { notifyThanks } from "@/lib/invoiceThanks"
import { exportInvoicesXlsx } from "@/lib/exportInvoicesXlsx"
import { contractPdfBase64 } from "@/lib/downloadContractPdf"
import { SendDocEmailDialog } from "@/components/crm/SendDocEmailDialog"
import { MobileCard, CardAction } from "@/components/crm/MobileCard"
import { formatDate, formatMoney } from "./constants"

const STATUS: Record<Invoice["status"], { label: string; cls: string }> = {
  issued: { label: "выставлен", cls: "bg-white/10 text-white/60" },
  sent: { label: "отправлен", cls: "bg-blue-500/20 text-blue-300" },
  paid: { label: "оплачен", cls: "bg-green-500/20 text-green-300" },
}

type StatusFilter = "all" | "unpaid" | "paid"

const isOverdue = (inv: Invoice) =>
  inv.status !== "paid" && !!inv.due_date && new Date(String(inv.due_date).slice(0, 10)) < new Date(new Date().toDateString())

/** Вкладка «Счета» в реестре документов: суммы, статусы оплаты, печать и отправка */
export function DocumentInvoicesTab({ search }: { search: string }) {
  const [list, setList] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [busyId, setBusyId] = useState<number | null>(null)
  const [sendFor, setSendFor] = useState<Invoice | null>(null)
  const [exporting, setExporting] = useState(false)

  const load = () =>
    invoicesApi
      .list()
      .then((d) => setList(d.invoices))
      .catch(() => setList([]))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return list.filter((inv) => {
      if (filter === "paid" && inv.status !== "paid") return false
      if (filter === "unpaid" && inv.status === "paid") return false
      if (!q) return true
      return [inv.invoice_number, inv.object_code, inv.client_name, inv.contract_number, inv.act_number, inv.address]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [list, search, filter])

  const totals = useMemo(() => {
    const sum = (arr: Invoice[]) => arr.reduce((s, i) => s + Number(i.total_amount || 0), 0)
    return {
      all: sum(list),
      paid: sum(list.filter((i) => i.status === "paid")),
      unpaid: sum(list.filter((i) => i.status !== "paid")),
      overdue: list.filter(isOverdue).length,
    }
  }, [list])

  const print = async (inv: Invoice) => {
    setBusyId(inv.id)
    try {
      const full = await invoicesApi.get(inv.id)
      printHtml(`Счёт № ${full.invoice_number}`, `${docBrandHeader("")}${buildInvoiceHtml(full)}`, docBrandStyles)
    } finally {
      setBusyId(null)
    }
  }

  const exportXlsx = async () => {
    setExporting(true)
    try {
      const suffix = filter === "paid" ? "_оплаченные" : filter === "unpaid" ? "_неоплаченные" : ""
      await exportInvoicesXlsx(filtered, `Счета${suffix}`)
    } finally {
      setExporting(false)
    }
  }

  const togglePaid = async (inv: Invoice) => {
    const status: Invoice["status"] = inv.status === "paid" ? "sent" : "paid"
    setList((prev) => prev.map((x) => (x.id === inv.id ? { ...x, status } : x)))
    const res = await invoicesApi.update(inv.id, { status }).catch(() => {
      load()
      return null
    })
    notifyThanks(res?.thanks)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Icon name="Loader2" size={24} className="animate-spin text-white/40" />
      </div>
    )
  }

  const filterBtn = (key: StatusFilter, label: string) => (
    <button
      key={key}
      onClick={() => setFilter(key)}
      className={cn(
        "flex-1 sm:flex-none min-h-[40px] sm:min-h-0 rounded-lg px-3 py-1.5 text-xs whitespace-nowrap transition-colors",
        filter === key ? "bg-[#D4AF37] text-[#161616]" : "bg-white/5 text-white/60 hover:text-white",
      )}
    >
      {label}
    </button>
  )

  const actions = (inv: Invoice, size = 15) => (
    <>
      <Link
        to={`/cabinet/objects/${inv.object_id}/invoices/${inv.id}`}
        className="text-white/40 transition-colors hover:text-[#D4AF37]"
        title="Просмотр"
      >
        <Icon name="Eye" size={size} />
      </Link>
      <button onClick={() => print(inv)} className="text-white/40 transition-colors hover:text-white" title="Печать">
        <Icon name={busyId === inv.id ? "Loader2" : "Printer"} size={size} className={busyId === inv.id ? "animate-spin" : ""} />
      </button>
      <button onClick={() => setSendFor(inv)} className="text-white/40 transition-colors hover:text-white" title="Отправить заказчику на почту">
        <Icon name="Mail" size={size} />
      </button>
      <button
        onClick={() => togglePaid(inv)}
        className={cn("transition-colors", inv.status === "paid" ? "text-green-400 hover:text-white/60" : "text-white/40 hover:text-green-400")}
        title={inv.status === "paid" ? "Снять отметку оплаты" : "Отметить оплату"}
      >
        <Icon name="BadgeCheck" size={size} />
      </button>
    </>
  )

  const statusBadge = (inv: Invoice) => {
    const st = STATUS[inv.status] || STATUS.issued
    return (
      <div className="flex flex-wrap items-center gap-1">
        <span className={cn("rounded-full px-2 py-0.5 text-xs", st.cls)}>{st.label}</span>
        {isOverdue(inv) && <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">просрочен</span>}
      </div>
    )
  }

  const basis = (inv: Invoice) =>
    [inv.contract_number && `Договор № ${inv.contract_number}`, inv.act_number && `Акт № ${inv.act_number}`].filter(Boolean).join(" · ") ||
    "Без основания"

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 border-b border-white/10 p-3 sm:gap-3 sm:p-4 md:grid-cols-4">
        <div className="rounded-lg bg-[#161616] p-3">
          <p className="text-xs text-white/40">Выставлено</p>
          <p className="text-base sm:text-lg font-semibold break-words">{formatMoney(totals.all)}</p>
        </div>
        <div className="rounded-lg bg-[#161616] p-3">
          <p className="text-xs text-white/40">Оплачено</p>
          <p className="text-base sm:text-lg font-semibold break-words text-green-400">{formatMoney(totals.paid)}</p>
        </div>
        <div className="rounded-lg bg-[#161616] p-3">
          <p className="text-xs text-white/40">Ожидает оплаты</p>
          <p className="text-base sm:text-lg font-semibold break-words text-[#D4AF37]">{formatMoney(totals.unpaid)}</p>
        </div>
        <div className="rounded-lg bg-[#161616] p-3">
          <p className="text-xs text-white/40">Просрочено счетов</p>
          <p className={cn("text-lg font-semibold", totals.overdue ? "text-red-400" : "")}>{totals.overdue}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-3 pt-3 sm:px-4 sm:pt-4">
        {filterBtn("all", "Все")}
        {filterBtn("unpaid", "Не оплачены")}
        {filterBtn("paid", "Оплачены")}
        <button
          onClick={exportXlsx}
          disabled={exporting || filtered.length === 0}
          title="Выгрузить показанные счета в Excel"
          className="flex w-full min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-green-700 px-3 py-1.5 sm:ml-auto sm:w-auto sm:min-h-0 text-xs font-medium text-white transition-colors hover:bg-green-800 disabled:opacity-50"
        >
          <Icon name={exporting ? "Loader2" : "FileSpreadsheet"} size={14} className={exporting ? "animate-spin" : ""} />
          Выгрузить в Excel
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Icon name="Receipt" size={36} className="mb-3 text-white/20" />
          <p className="text-sm text-white/50">Счетов не найдено</p>
          <p className="mt-1 text-xs text-white/30">Выставьте счёт со страницы договора, акта или объекта — он появится здесь</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 p-3 md:hidden">
            {filtered.map((inv) => (
              <MobileCard
                key={inv.id}
                className="bg-[#161616]"
                title={
                  <>
                    № {inv.invoice_number} <span className="text-white/40">от {formatDate(inv.invoice_date)}</span>
                  </>
                }
                subtitle={<span className="text-[#7FC8A9]">Счёт на оплату</span>}
                badge={statusBadge(inv)}
                rows={[
                  { label: "Сумма", value: <span className="font-semibold text-white">{formatMoney(Number(inv.total_amount))}</span> },
                  { label: "Оплатить до", value: <span className={isOverdue(inv) ? "text-red-300" : ""}>{inv.due_date ? formatDate(inv.due_date) : "—"}</span> },
                  { label: "Объект", value: inv.object_code || "—" },
                  { label: "Заказчик", value: inv.client_name || "—" },
                  { label: "Основание", value: basis(inv) },
                ]}
                actions={
                  <div className="grid w-full grid-cols-2 gap-2">
                    <Link
                      to={`/cabinet/objects/${inv.object_id}/invoices/${inv.id}`}
                      className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-white/5 text-xs text-white/70 active:bg-white/10"
                    >
                      <Icon name="Eye" size={16} />
                      Открыть
                    </Link>
                    <CardAction
                      className="min-h-[44px]"
                      icon={<Icon name={busyId === inv.id ? "Loader2" : "Printer"} size={16} className={busyId === inv.id ? "animate-spin" : ""} />}
                      label="Печать"
                      onClick={() => print(inv)}
                    />
                    <CardAction className="min-h-[44px]" icon={<Icon name="Mail" size={16} />} label="На почту" onClick={() => setSendFor(inv)} />
                    <CardAction
                      className={cn("min-h-[44px]", inv.status === "paid" && "text-green-400")}
                      icon={<Icon name="BadgeCheck" size={16} />}
                      label={inv.status === "paid" ? "Снять оплату" : "Оплачен"}
                      onClick={() => togglePaid(inv)}
                    />
                  </div>
                }
              />
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-white/40">
                  <th className="px-4 py-3 font-medium">Счёт</th>
                  <th className="px-4 py-3 font-medium">Дата</th>
                  <th className="px-4 py-3 font-medium">Оплатить до</th>
                  <th className="px-4 py-3 font-medium">Объект</th>
                  <th className="px-4 py-3 font-medium">Заказчик</th>
                  <th className="px-4 py-3 font-medium">Сумма</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                  <th className="px-4 py-3 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <p className="font-medium">№ {inv.invoice_number}</p>
                      <p className="text-xs text-white/30">{basis(inv)}</p>
                    </td>
                    <td className="px-4 py-3 text-white/60">{formatDate(inv.invoice_date)}</td>
                    <td className={cn("px-4 py-3", isOverdue(inv) ? "text-red-300" : "text-white/60")}>
                      {inv.due_date ? formatDate(inv.due_date) : "—"}
                    </td>
                    <td className="px-4 py-3 text-white/60">{inv.object_code || "—"}</td>
                    <td className="px-4 py-3 text-white/60">{inv.client_name || "—"}</td>
                    <td className="px-4 py-3 font-medium">{formatMoney(Number(inv.total_amount))}</td>
                    <td className="px-4 py-3">{statusBadge(inv)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">{actions(inv)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {sendFor && (
        <SendDocEmailDialog
          open={!!sendFor}
          onOpenChange={(v) => {
            if (!v) {
              setSendFor(null)
              load()
            }
          }}
          docName="счёт"
          objectId={sendFor.object_id}
          fileName={`Счёт_${sendFor.invoice_number}.pdf`}
          makePdf={async () => {
            const full = await invoicesApi.get(sendFor.id)
            return contractPdfBase64(buildInvoiceHtml(full), `Счёт ${full.invoice_number}`)
          }}
          send={(p) => invoicesApi.sendEmail(sendFor.id, p)}
        />
      )}
    </div>
  )
}

export default DocumentInvoicesTab
