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
    { label: "Подписано договоров", value: s.contracted, hint: `${s.contracts_count} договоров за период`, icon: "FileSignature", tone: "text-sky-300 bg-sky-500/15" },
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

export function FinanceBalance({ s }: { s: FinanceData["summary"] }) {
  const rows = [
    { l: "Оплаты по счетам", v: s.received, sign: 1 },
    { l: "Доход от аренды", v: s.rent_income, sign: 1 },
    { l: "Материалы на объекты", v: s.materials, sign: -1 },
    { l: "Аренда у поставщиков", v: s.rent_expense, sign: -1 },
  ].filter((r) => r.v)
  const autoShare = s.received ? Math.round((s.auto_paid / s.received) * 100) : 0
  return (
    <div className={`${card} flex flex-col gap-4`}>
      <p className="font-medium flex items-center gap-2">
        <Icon name="Scale" size={16} className="text-[#D4AF37]" />
        Доходы и расходы
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
        <span className="font-medium">Итого</span>
        <span className={`font-semibold ${s.margin >= 0 ? "text-green-300" : "text-red-300"}`}>{rub(s.margin)}</span>
      </div>
      <p className="text-xs text-white/40">
        Учитываются материалы, внесённые в объекты, и аренда. Зарплаты и прочие расходы пока не ведутся в кабинете.
        {s.received > 0 && ` Через ЮKassa и выписку банка пришло ${autoShare}% оплат.`}
      </p>
    </div>
  )
}
