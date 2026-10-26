import { useState } from "react"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { PortalAct, PortalContract } from "@/lib/executorsApi"
import { formatMoney, formatDate } from "@/components/crm/documents/constants"
import { PortalDocumentViewer } from "./PortalDocumentViewer"

interface Props {
  contracts: PortalContract[]
  acts: PortalAct[]
  onChanged: () => void
}

function SignBadge({ signed }: { signed: string | null }) {
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] shrink-0", signed ? "bg-green-500/20 text-green-300" : "bg-amber-500/20 text-amber-300")}>
      {signed ? "подписан" : "ждёт подписи"}
    </span>
  )
}

/** Договоры и акты исполнителя: просмотр и онлайн-подпись */
export function PortalDocuments({ contracts, acts, onChanged }: Props) {
  const [open, setOpen] = useState<{ kind: "contract" | "act"; id: number } | null>(null)
  const toSign = contracts.filter((c) => !c.executor_signed_at).length + acts.filter((a) => !a.executor_signed_at).length

  if (!contracts.length && !acts.length) return null

  return (
    <section className="bg-[#1f1f1f] border border-white/10 rounded-xl p-4">
      <p className="font-medium mb-3 flex items-center gap-2">
        <Icon name="FileSignature" size={17} className="text-[#D4AF37]" />
        Мои документы
        {toSign > 0 && <span className="px-2 py-0.5 rounded-full text-[11px] bg-amber-500 text-[#161616] font-medium">подписать: {toSign}</span>}
      </p>

      <ul className="flex flex-col gap-2">
        {contracts.map((c) => {
          const cActs = acts.filter((a) => a.contract_id === c.id)
          return (
            <li key={c.id} className="rounded-lg bg-[#161616] border border-white/10">
              <button onClick={() => setOpen({ kind: "contract", id: c.id })} className="w-full text-left p-3 min-h-[44px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium flex items-center gap-1.5 min-w-0">
                    <Icon name="FileText" size={15} className="text-blue-300 shrink-0" />
                    <span className="truncate">Договор № {c.contract_number} · {c.object_code}</span>
                  </span>
                  <SignBadge signed={c.executor_signed_at} />
                </div>
                <div className="flex justify-between gap-2 text-xs text-white/40 mt-1">
                  <span className="truncate">
                    {formatDate(c.contract_date)}
                    {c.work_subject ? ` · ${c.work_subject}` : ""}
                  </span>
                  <span className="shrink-0">
                    {formatMoney(c.total_amount)} · <span className="text-emerald-400">получено {formatMoney(c.paid)}</span>
                  </span>
                </div>
              </button>
              {cActs.length > 0 && (
                <ul className="border-t border-white/5">
                  {cActs.map((a) => (
                    <li key={a.id}>
                      <button
                        onClick={() => setOpen({ kind: "act", id: a.id })}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-white/[0.02] min-h-[44px]"
                      >
                        <Icon name="FileCheck" size={14} className="text-emerald-300 shrink-0 ml-4" />
                        <span className="text-xs flex-1 min-w-0 truncate">
                          Акт № {a.act_number} от {formatDate(a.act_date)} · {formatMoney(a.total_amount)}
                        </span>
                        <SignBadge signed={a.executor_signed_at} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>

      {open && <PortalDocumentViewer kind={open.kind} id={open.id} onClose={() => setOpen(null)} onSigned={onChanged} />}
    </section>
  )
}

export default PortalDocuments
