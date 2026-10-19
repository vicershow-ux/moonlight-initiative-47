import Icon from "@/components/ui/icon"
import { FinanceData } from "@/lib/api"
import { card, rub } from "./format"

interface Kpi {
  label: string
  value: number
  hint: string
  icon: string
  tone: string
}

export function FinanceKpis({ s }: { s: FinanceData["summary"] }) {
  const items: Kpi[] = [
    { label: "Поступило", value: s.received, hint: `${s.received_count} оплаченных счетов`, icon: "ArrowDownToLine", tone: "text-green-300 bg-green-500/15" },
    { label: "Ожидаем оплату", value: s.outstanding, hint: `${s.outstanding_count} неоплаченных счетов`, icon: "Hourglass", tone: "text-[#D4AF37] bg-[#D4AF37]/15" },
    {
      label: "Просрочено",
      value: s.overdue,
      hint: s.overdue_count ? `${s.overdue_count} счетов прошли срок оплаты` : "Просроченных счетов нет",
      icon: "AlarmClock",
      tone: s.overdue ? "text-red-300 bg-red-500/15" : "text-white/50 bg-white/10",
    },
    {
      label: "Прибыль",
      value: s.margin,
      hint: `Расходы ${rub(s.expenses)} · договоров на ${rub(s.contracted)}`,
      icon: "TrendingUp",
      tone: s.margin >= 0 ? "text-sky-300 bg-sky-500/15" : "text-red-300 bg-red-500/15",
    },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map((k) => (
        <div key={k.label} className={`${card} flex flex-col gap-3`}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">{k.label}</span>
            <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.tone}`}>
              <Icon name={k.icon} size={18} />
            </span>
          </div>
          <p className="text-2xl font-semibold tracking-tight">{rub(k.value)}</p>
          <p className="text-xs text-white/40">{k.hint}</p>
        </div>
      ))}
    </div>
  )
}

export function FinanceBalance({ s, categories }: { s: FinanceData["summary"]; categories: FinanceData["categories"] }) {
  const rows = [
    { l: "Оплаты по счетам", v: s.received, sign: 1 },
    { l: "Доход от аренды", v: s.rent_income, sign: 1 },
    { l: "Материалы на объекты", v: s.materials, sign: -1 },
    { l: "Аренда у поставщиков", v: s.rent_expense, sign: -1 },
    ...Object.entries(s.expenses_by_category || {})
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => ({ l: categories[k] || k, v, sign: -1 })),
  ].filter((r) => r.v)
  const marginPct = s.income > 0 ? Math.round((s.margin / s.income) * 100) : null
  const autoShare = s.received ? Math.round((s.auto_paid / s.received) * 100) : 0
  return (
    <div className={`${card} flex flex-col gap-4`}>
      <p className="font-medium flex items-center gap-2">
        <Icon name="Scale" size={16} className="text-[#D4AF37]" />
        Прибыль за период
      </p>
      {rows.length === 0 ? (
        <p className="text-sm text-white/30">За период движений нет</p>
      ) : (
        <div className="flex flex-col gap-2 text-sm">
          {rows.map((r) => (
            <div key={r.l} className="flex justify-between gap-3">
              <span className="text-white/60">{r.l}</span>
              <span className={r.sign > 0 ? "text-green-300" : "text-red-300"}>
                {r.sign > 0 ? "+" : "−"}
                {rub(r.v)}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-between border-t border-white/10 pt-3">
        <span className="font-medium">
          Прибыль
          {marginPct !== null && <span className="ml-1.5 text-xs font-normal text-white/40">рентабельность {marginPct}%</span>}
        </span>
        <span className={`font-semibold ${s.margin >= 0 ? "text-green-300" : "text-red-300"}`}>{rub(s.margin)}</span>
      </div>
      <p className="text-xs text-white/40">
        Считается по поступившим деньгам: оплаты минус материалы объектов, аренда и все внесённые расходы.
        {s.received > 0 && ` Через ЮKassa и выписку банка пришло ${autoShare}% оплат.`}
      </p>
    </div>
  )
}
