import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { FinanceData } from "@/lib/api"
import { card, dateRu, rub } from "./format"

export function FinanceUpcoming({ items }: { items: FinanceData["upcoming"] }) {
  const today = new Date().toISOString().slice(0, 10)
  return (
    <div className={`${card} flex flex-col gap-4`}>
      <p className="font-medium flex items-center gap-2">
        <Icon name="CalendarClock" size={16} className="text-[#D4AF37]" />
        Платежи по графику на 30 дней
      </p>
      {items.length === 0 ? (
        <p className="text-sm text-white/30">Ближайших платежей по графику нет</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((u) => {
            const late = u.due_date < today
            return (
              <Link key={u.id} to={`/cabinet/objects/${u.object_id}`} className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm truncate">{u.title}</p>
                  <p className="text-xs text-white/40 truncate">
                    {u.object_code} · {u.client_name}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium">{rub(u.amount)}</p>
                  <p className={`text-xs ${late ? "text-red-300" : "text-white/40"}`}>
                    {late ? "просрочен с " : ""}
                    {dateRu(u.due_date)}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
