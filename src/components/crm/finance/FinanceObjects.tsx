import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { FinanceObject } from "@/lib/api"
import { card, dateRu, rub } from "./format"

export function FinanceObjects({ objects }: { objects: FinanceObject[] }) {
  return (
    <div className={`${card} flex flex-col gap-4`}>
      <p className="font-medium flex items-center gap-2">
        <Icon name="Building2" size={16} className="text-[#D4AF37]" />
        Расчёты по объектам
      </p>
      {objects.length === 0 ? (
        <p className="text-sm text-white/30 py-6 text-center">Договоров и счетов пока нет</p>
      ) : (
        <div className="flex flex-col divide-y divide-white/5 -my-2">
          {objects.map((o) => {
            const pct = o.contracted ? Math.min(100, Math.round((o.paid / o.contracted) * 100)) : 0
            return (
              <Link key={o.id} to={`/cabinet/objects/${o.id}`} className="py-3 flex flex-col gap-2 hover:bg-white/[0.02] -mx-2 px-2 rounded-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {o.object_code} · {o.client_name || "Без заказчика"}
                    </p>
                    <p className="text-xs text-white/40 truncate">{o.address || "Адрес не указан"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{rub(o.contracted)}</p>
                    <p className="text-xs text-white/40">по договорам</p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-[#D4AF37]" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  <span className="text-green-300">Оплачено {rub(o.paid)} ({pct}%)</span>
                  {o.outstanding > 0 && <span className="text-[#D4AF37]">Ждём {rub(o.outstanding)}</span>}
                  {o.overdue > 0 && <span className="text-red-300">Просрочено {rub(o.overdue)}</span>}
                  {o.to_invoice > 0 && <span className="text-white/50">Ещё не выставлено {rub(o.to_invoice)}</span>}
                  {o.materials > 0 && <span className="text-white/50">Материалы {rub(o.materials)}</span>}
                  {o.next_due && <span className="text-white/50">Следующий платёж {dateRu(o.next_due)}</span>}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
