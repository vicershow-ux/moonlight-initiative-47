import { useEffect, useState } from "react"
import { Link } from "@/lib/router-compat"
import Icon from "@/components/ui/icon"
import { addendaApi, ContractAddendum } from "@/lib/api"
import { addendumDelta } from "@/components/crm/documents/DocumentContractRows"

const money = (v: unknown) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Number(v) || 0) + " ₽"
const dateLabel = (d: string) => new Date(d).toLocaleDateString("ru-RU")

interface Props {
  objectId: number
  contractId?: number
  isClient: boolean
  compact?: boolean
}

export function ContractAddendaList({ objectId, contractId, isClient, compact }: Props) {
  const [list, setList] = useState<ContractAddendum[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    addendaApi
      .list(contractId ? { contract_id: contractId } : { object_id: objectId })
      .then((d) => setList(d.addenda || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }, [objectId, contractId])

  if (loading) return null
  if (compact && list.length === 0) return null

  return (
    <div className={compact ? "mt-2" : "bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5 max-w-4xl mx-auto mb-4"}>
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-3">
          <p className="font-medium flex items-center gap-2">
            <Icon name="FilePlus2" size={16} className="text-[#D4AF37]" />
            Дополнительные соглашения
          </p>
          {!isClient && contractId && (
            <Link
              to={`/cabinet/objects/${objectId}/contracts/${contractId}/addenda/new`}
              className="inline-flex w-full sm:w-auto min-h-[44px] sm:min-h-0 justify-center items-center gap-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] px-3 py-2 text-sm font-medium text-[#161616]"
            >
              <Icon name="Plus" size={14} />
              Составить допсоглашение
            </Link>
          )}
        </div>
      )}
      {compact && (
        <p className="mb-1.5 mt-3 text-[11px] uppercase tracking-wide text-white/35">
          Доп. соглашения · {list.length}
        </p>
      )}
      {list.length === 0 ? (
        <p className="text-sm text-white/30">Допсоглашений пока нет</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {list.map((a) => (
            <Link
              key={a.id}
              to={`/cabinet/objects/${objectId}/contracts/${a.contract_id}/addenda/${a.id}`}
              className="flex flex-col items-stretch sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 rounded-lg bg-[#161616] border border-white/10 px-3 py-2.5 sm:py-2 text-sm hover:border-[#D4AF37]/40"
            >
              <span className="flex items-center gap-2 min-w-0">
                <Icon name="FileText" size={14} className="text-white/40 shrink-0" />
                <span className="truncate">
                  ДС № {a.addendum_number} от {dateLabel(a.addendum_date)}
                  {a.options?.change_deadline && <span className="text-white/35"> · новый срок</span>}
                </span>
              </span>
              <span className="flex flex-wrap items-center gap-2 shrink-0">
                {(() => {
                  const delta = addendumDelta(a)
                  if (delta === null) return null
                  return (
                    <span className={`text-xs ${delta > 0 ? "text-green-300/80" : "text-red-300/80"}`}>
                      {delta > 0 ? "+" : "−"}
                      {money(Math.abs(delta))}
                    </span>
                  )
                })()}
                <span className="text-white/60">{money(a.total_amount)}</span>
                {isClient && a.status !== "signed" ? (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-[#D4AF37] px-2.5 py-1 text-[11px] font-medium text-[#161616]">
                    <Icon name="PenLine" size={12} />
                    Подписать
                  </span>
                ) : (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] ${
                      a.status === "signed" ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/50"
                    }`}
                  >
                    {a.status === "signed" ? "Подписано" : "Черновик"}
                  </span>
                )}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default ContractAddendaList
