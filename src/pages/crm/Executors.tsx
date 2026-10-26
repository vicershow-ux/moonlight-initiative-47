import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { Executor, executorKindLabels, executorsApi } from "@/lib/executorsApi"
import { ExecutorDialog } from "@/components/crm/executors/ExecutorDialog"
import { formatMoney } from "@/components/crm/documents/constants"

export default function Executors() {
  const [items, setItems] = useState<Executor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showArchived, setShowArchived] = useState(false)
  const [dialog, setDialog] = useState<{ open: boolean; executor: Executor | null }>({ open: false, executor: null })

  const load = () => {
    setLoading(true)
    executorsApi
      .list()
      .then((d) => setItems(d.executors || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const list = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter(
      (e) =>
        e.is_archived === showArchived &&
        (!q || [e.display_name, e.specialty, e.phone, e.inn].some((v) => (v || "").toLowerCase().includes(q)))
    )
  }, [items, search, showArchived])

  const totals = useMemo(() => {
    const active = items.filter((e) => !e.is_archived)
    return {
      count: active.length,
      contracts: active.reduce((s, e) => s + (e.contracts_total || 0), 0),
      paid: active.reduce((s, e) => s + (e.paid_total || 0), 0),
      reports: active.reduce((s, e) => s + (e.reports_new || 0), 0),
    }
  }, [items])

  return (
    <CrmLayout title="Исполнители" subtitle="Субподрядчики и мастера, которых вы нанимаете на отдельные виды работ">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Исполнителей", value: String(totals.count), icon: "HardHat" },
          { label: "По договорам", value: formatMoney(totals.contracts), icon: "FileSignature" },
          { label: "Оплачено", value: formatMoney(totals.paid), icon: "Banknote" },
          { label: "Отчётов на проверке", value: String(totals.reports), icon: "ClipboardCheck" },
        ].map((c) => (
          <div key={c.label} className="bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
              <Icon name={c.icon} size={14} />
              {c.label}
            </div>
            <p className="text-lg font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 sm:p-4 border-b border-white/10">
          <div className="relative flex-1">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по имени, виду работ, телефону, ИНН"
              className="w-full bg-[#161616] border border-white/10 rounded-lg pl-9 pr-3 min-h-[44px] sm:min-h-[38px] text-base sm:text-sm outline-none focus:border-[#D4AF37]/50"
            />
          </div>
          <div className="grid grid-cols-2 sm:flex gap-2">
            <button
              onClick={() => setShowArchived((v) => !v)}
              className={cn(
                "min-h-[44px] sm:min-h-[38px] px-3 rounded-lg text-sm border transition-colors",
                showArchived ? "border-[#D4AF37]/50 text-[#D4AF37]" : "border-white/10 text-white/60 hover:text-white"
              )}
            >
              {showArchived ? "Активные" : "Архив"}
            </button>
            <button
              onClick={() => setDialog({ open: true, executor: null })}
              className="flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[38px] px-4 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] text-[#161616] text-sm font-medium"
            >
              <Icon name="Plus" size={15} />
              Добавить
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Icon name="Loader2" size={24} className="animate-spin text-white/40" />
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center text-center py-14 px-4">
            <Icon name="HardHat" size={36} className="text-white/20 mb-3" />
            <p className="text-white/50 text-sm">{showArchived ? "Архив пуст" : "Исполнителей пока нет"}</p>
            {!showArchived && (
              <p className="text-white/30 text-xs mt-1 max-w-sm">
                Добавьте мастера или бригаду с реквизитами — потом выбирайте их при составлении договора, где вы Заказчик
              </p>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {list.map((e) => {
              const left = Math.max(0, (e.contracts_total || 0) - (e.paid_total || 0))
              return (
                <li key={e.id} className="p-3 sm:p-4 hover:bg-white/[0.02]">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <Link to={`/cabinet/executors/${e.id}`} className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="w-11 h-11 shrink-0 rounded-full bg-orange-500/15 text-orange-300 flex items-center justify-center">
                        <Icon name={e.kind === "legal" ? "Building2" : "HardHat"} size={18} />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium break-words">{e.display_name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[11px] bg-white/10 text-white/60">{executorKindLabels[e.kind]}</span>
                          {e.access_enabled && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] bg-blue-500/20 text-blue-300">кабинет открыт</span>
                          )}
                          {!!e.tasks_open && (
                            <span className={cn("px-2 py-0.5 rounded-full text-[11px]", e.tasks_overdue ? "bg-red-500/20 text-red-300" : "bg-white/10 text-white/60")}>
                              заданий: {e.tasks_open}{e.tasks_overdue ? `, просрочено ${e.tasks_overdue}` : ""}
                            </span>
                          )}
                          {!!e.tasks_done && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] bg-amber-500/20 text-amber-300">выполнено, проверьте: {e.tasks_done}</span>
                          )}
                          {!!e.reports_new && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] bg-amber-500/20 text-amber-300">
                              отчётов: {e.reports_new}
                            </span>
                          )}
                        </span>
                        <span className="block text-xs text-white/40 mt-0.5 break-words">
                          {[e.specialty, e.phone, e.inn && `ИНН ${e.inn}`].filter(Boolean).join(" · ") || "Реквизиты не заполнены"}
                        </span>
                        {(e.objects?.length || 0) > 0 && (
                          <span className="block text-xs text-white/30 mt-0.5">
                            Объекты: {e.objects!.map((o) => o.object_code).join(", ")}
                          </span>
                        )}
                      </span>
                    </Link>
                    <div className="flex items-center gap-4 sm:gap-6 text-sm">
                      <div className="text-left sm:text-right">
                        <p className="text-[11px] text-white/40">Договоров</p>
                        <p className="font-medium">{e.contracts_count || 0}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-[11px] text-white/40">Оплачено</p>
                        <p className="font-medium text-emerald-400">{formatMoney(e.paid_total || 0)}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-[11px] text-white/40">Долг</p>
                        <p className="font-medium text-[#D4AF37]">{formatMoney(left)}</p>
                      </div>
                      <button
                        onClick={() => setDialog({ open: true, executor: e })}
                        className="ml-auto sm:ml-0 w-11 h-11 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-white/5 text-white/50 hover:text-white"
                        title="Редактировать"
                      >
                        <Icon name="Pencil" size={15} />
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <ExecutorDialog
        open={dialog.open}
        onOpenChange={(v) => setDialog((d) => ({ ...d, open: v }))}
        executor={dialog.executor}
        onSaved={load}
      />
    </CrmLayout>
  )
}
