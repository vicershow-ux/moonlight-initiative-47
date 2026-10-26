import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { objectSummaryApi, ObjectSummary } from "@/lib/executorsApi"
import { downloadObjectSummaryPdf } from "@/lib/objectSummaryPdf"
import { formatMoney } from "@/components/crm/documents/constants"

function Row({ icon, color, label, value, sub, open, onToggle, children }: {
  icon: string
  color: string
  label: string
  value: number
  sub?: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-white/5 last:border-0">
      <button onClick={onToggle} className="w-full flex items-center gap-3 py-2.5 text-left min-h-[44px]">
        <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}22`, color }}>
          <Icon name={icon} size={15} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm">{label}</span>
          {sub && <span className="block text-[11px] text-white/40">{sub}</span>}
        </span>
        <span className="text-sm font-medium">{formatMoney(value)}</span>
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={15} className="text-white/30" />
      </button>
      {open && <div className="pb-3 pl-11 text-xs">{children}</div>}
    </div>
  )
}

const Empty = () => <p className="text-white/30">Пока нет</p>

/** Сводка расходов и прибыли по объекту с выгрузкой в PDF */
export function ObjectCostSummary({ objectId }: { objectId: number }) {
  const [data, setData] = useState<ObjectSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState<string | null>(null)
  const [pdfBusy, setPdfBusy] = useState(false)

  useEffect(() => {
    setLoading(true)
    objectSummaryApi
      .get(objectId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [objectId])

  if (loading) {
    return (
      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5 flex justify-center">
        <Icon name="Loader2" size={18} className="animate-spin text-white/40" />
      </div>
    )
  }
  if (!data) return null

  const t = data.totals
  const toggle = (k: string) => setOpen((v) => (v === k ? null : k))
  const parts = [
    { k: "executors", v: t.executors_paid, c: "#f59e0b" },
    { k: "receipts", v: t.receipts, c: "#22c55e" },
    { k: "materials", v: t.materials, c: "#ef4444" },
    { k: "other", v: t.other, c: "#6b7280" },
  ].filter((p) => p.v > 0)

  const pdf = async () => {
    setPdfBusy(true)
    try {
      await downloadObjectSummaryPdf(data)
    } finally {
      setPdfBusy(false)
    }
  }

  return (
    <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="font-medium flex items-center gap-2">
          <Icon name="PieChart" size={16} className="text-[#D4AF37]" />
          Расходы и прибыль
        </p>
        <button
          onClick={pdf}
          disabled={pdfBusy}
          className="flex items-center gap-1.5 min-h-[36px] px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/70 disabled:opacity-60"
        >
          <Icon name={pdfBusy ? "Loader2" : "Download"} size={14} className={pdfBusy ? "animate-spin" : ""} />
          PDF
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-lg bg-[#161616] p-2.5">
          <p className="text-[11px] text-white/40">Получено от заказчика</p>
          <p className="text-sm font-semibold text-emerald-400">{formatMoney(data.income.received)}</p>
          {data.income.contracted > 0 && <p className="text-[10px] text-white/30">из {formatMoney(data.income.contracted)} по договорам</p>}
        </div>
        <div className="rounded-lg bg-[#161616] p-2.5">
          <p className="text-[11px] text-white/40">Расходы</p>
          <p className="text-sm font-semibold text-red-400">{formatMoney(t.costs)}</p>
        </div>
      </div>

      {parts.length > 0 && (
        <div className="flex h-2 rounded-full overflow-hidden mb-2 bg-white/5">
          {parts.map((p) => (
            <div key={p.k} style={{ width: `${(p.v / t.costs) * 100}%`, background: p.c }} />
          ))}
        </div>
      )}

      <Row icon="HardHat" color="#f59e0b" label="Оплаты исполнителям" value={t.executors_paid}
        sub={t.executors_debt > 0 ? `ещё должны ${formatMoney(t.executors_debt)}` : undefined}
        open={open === "executors"} onToggle={() => toggle("executors")}>
        {data.executors.length === 0 ? <Empty /> : (
          <ul className="flex flex-col gap-1.5">
            {data.executors.map((e) => (
              <li key={e.contract_id} className="flex justify-between gap-2">
                <Link to={`/cabinet/objects/${objectId}/contracts/${e.contract_id}`} className="min-w-0 truncate text-white/70 hover:text-[#D4AF37]">
                  {e.name} · № {e.contract_number}
                </Link>
                <span className="shrink-0 text-white/60">{formatMoney(e.paid)} / {formatMoney(e.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </Row>
      <Row icon="Receipt" color="#22c55e" label="Закупки по чекам" value={t.receipts}
        open={open === "receipts"} onToggle={() => toggle("receipts")}>
        {data.receipts.length === 0 ? <Empty /> : (
          <ul className="flex flex-col gap-1.5">
            {data.receipts.map((r) => (
              <li key={r.shop} className="flex justify-between gap-2 text-white/60">
                <span className="truncate">{r.shop} · {r.count} чек.</span>
                <span className="shrink-0">{formatMoney(r.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </Row>
      <Row icon="Package" color="#ef4444" label="Материалы" value={t.materials}
        open={open === "materials"} onToggle={() => toggle("materials")}>
        {data.materials.length === 0 ? <Empty /> : (
          <ul className="flex flex-col gap-1.5">
            {data.materials.slice(0, 15).map((m, i) => (
              <li key={i} className="flex justify-between gap-2 text-white/60">
                <span className="truncate">{m.name}</span>
                <span className="shrink-0">{formatMoney(m.sum)}</span>
              </li>
            ))}
            {data.materials.length > 15 && <li className="text-white/30">и ещё {data.materials.length - 15} — полный список в PDF</li>}
          </ul>
        )}
      </Row>
      {t.other > 0 && (
        <Row icon="Ellipsis" color="#6b7280" label="Прочие расходы" value={t.other}
          open={open === "other"} onToggle={() => toggle("other")}>
          <ul className="flex flex-col gap-1.5">
            {data.other.map((o) => (
              <li key={o.category} className="flex justify-between gap-2 text-white/60">
                <span>{o.label}</span>
                <span>{formatMoney(o.amount)}</span>
              </li>
            ))}
          </ul>
        </Row>
      )}

      <div className="mt-3 pt-3 border-t border-white/10 flex items-end justify-between gap-2">
        <div>
          <p className="text-xs text-white/50">Прибыль по факту</p>
          <p className="text-[10px] text-white/30">получено минус расходы</p>
        </div>
        <p className={cn("text-xl font-semibold", t.profit >= 0 ? "text-[#D4AF37]" : "text-red-400")}>{formatMoney(t.profit)}</p>
      </div>
      {(t.executors_debt > 0 || data.income.contracted > 0) && (
        <p className="mt-1 text-[11px] text-white/40 text-right">
          План с учётом долгов: <span className={t.planned_profit >= 0 ? "text-white/70" : "text-red-400"}>{formatMoney(t.planned_profit)}</span>
        </p>
      )}
    </div>
  )
}

export default ObjectCostSummary
