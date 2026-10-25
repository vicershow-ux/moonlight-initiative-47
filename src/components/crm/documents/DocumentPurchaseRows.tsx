import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { DeleteButton } from "@/components/ui/delete-button"
import { getStatusBadgeClass } from "@/lib/objectStatusColors"
import { MaterialEstimate, ObjectItem, ObjectStatus } from "@/lib/api"
import { formatMoney, formatDate } from "./constants"

type PurchaseMode = "view" | "print" | "pdf"

interface PurchaseRowProps {
  m: MaterialEstimate
  obj: ObjectItem | undefined
  objectStatuses: ObjectStatus[]
  busyId: number | null
  onOpen: (m: MaterialEstimate, mode: PurchaseMode) => void
  onDelete: (id: number) => void
}

const kindClass = "text-[#7FC8A9]"

export function DocumentPurchaseRow({ m, obj, objectStatuses, busyId, onOpen, onDelete }: PurchaseRowProps) {
  return (
    <tr className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
      <td className="py-3 px-4">
        <span className={cn("font-medium text-xs", kindClass)}>Список на закупку</span>
      </td>
      <td className="py-3 px-4">
        <button onClick={() => onOpen(m, "view")} className="text-left font-medium hover:text-[#D4AF37] transition-colors">
          Список на закупку
        </button>
        <p className="text-xs text-white/30">№{m.id}</p>
      </td>
      <td className="py-3 px-4 text-white/60">{formatDate(m.created_at)}</td>
      <td className="py-3 px-4 text-white/60">{obj?.object_code || m.object_code || "—"}</td>
      <td className="py-3 px-4 text-white/60">{m.client_name || obj?.client_name || "—"}</td>
      <td className="py-3 px-4 font-medium">{formatMoney(Number(m.total_amount))}</td>
      <td className="py-3 px-4">
        {obj?.status ? (
          <span className={cn("px-2 py-0.5 rounded-full text-xs", getStatusBadgeClass(objectStatuses.find((s) => s.name === obj.status)?.color))}>
            {obj.status}
          </span>
        ) : "—"}
      </td>
      <td className="py-3 px-4">
        <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-300">сохранён</span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => onOpen(m, "view")} className="text-white/40 hover:text-[#D4AF37] transition-colors" title="Посмотреть">
            <Icon name="Eye" size={15} />
          </button>
          <button onClick={() => onOpen(m, "print")} className="text-white/40 hover:text-white transition-colors" title="Печать">
            {busyId === m.id ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Printer" size={15} />}
          </button>
          <button onClick={() => onOpen(m, "pdf")} className="text-white/40 hover:text-white transition-colors" title="Скачать PDF">
            {busyId === -m.id ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Download" size={15} />}
          </button>
          <DeleteButton onConfirm={() => onDelete(m.id)} />
        </div>
      </td>
    </tr>
  )
}

export function DocumentPurchaseCard({ m, obj, objectStatuses, busyId, onOpen, onDelete }: PurchaseRowProps) {
  const btn =
    "flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-lg bg-white/5 active:bg-white/10 text-xs text-white/70 transition-colors"
  const status = obj?.status
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-3 sm:p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className={cn("font-medium text-[11px]", kindClass)}>Список на закупку</span>
          <p className="font-medium text-[15px] mt-1 break-words">
            {obj?.object_code || m.object_code || "Без объекта"}
          </p>
          <p className="text-xs text-white/40 mt-0.5 break-words">
            №{m.id} · {formatDate(m.created_at)} · {m.client_name || obj?.client_name || "—"}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-medium">{formatMoney(Number(m.total_amount))}</p>
          {status && (
            <span className={cn("inline-block mt-1 px-2 py-0.5 rounded-full text-[11px]", getStatusBadgeClass(objectStatuses.find((s) => s.name === status)?.color))}>
              {status}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
        <button onClick={() => onOpen(m, "view")} className={cn(btn, "flex-1 min-w-[96px]")}>
          <Icon name="Eye" size={15} />
          Открыть
        </button>
        <button onClick={() => onOpen(m, "print")} className={cn(btn, "flex-1 min-w-[96px]")}>
          {busyId === m.id ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Printer" size={15} />}
          Печать
        </button>
        <button onClick={() => onOpen(m, "pdf")} className={cn(btn, "flex-1 min-w-[96px]")}>
          {busyId === -m.id ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Download" size={15} />}
          PDF
        </button>
        <DeleteButton onConfirm={() => onDelete(m.id)} />
      </div>
    </div>
  )
}

export default DocumentPurchaseRow
