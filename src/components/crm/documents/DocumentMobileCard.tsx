import { ReactNode } from "react"
import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { getStatusBadgeClass } from "@/lib/objectStatusColors"
import { ObjectItem, ObjectStatus } from "@/lib/api"
import { formatMoney, formatDate } from "./constants"

interface DocumentMobileCardProps {
  kind: string
  kindClass: string
  title: string
  subtitle: string
  createdAt: string
  amount: number
  obj: ObjectItem | undefined
  objectCode?: string | null
  clientName?: string | null
  objectStatuses: ObjectStatus[]
  statusBadge: ReactNode
  viewTo?: string
  editTo?: string
  onPrint?: () => void
  onDownload?: () => void
  printing?: boolean
  downloading?: boolean
  deleteButton: ReactNode
}

export function DocumentMobileCard({
  kind,
  kindClass,
  title,
  subtitle,
  createdAt,
  amount,
  obj,
  objectCode,
  clientName,
  objectStatuses,
  statusBadge,
  viewTo,
  editTo,
  onPrint,
  onDownload,
  printing,
  downloading,
  deleteButton,
}: DocumentMobileCardProps) {
  const btn =
    "flex items-center justify-center gap-1.5 min-h-[40px] px-3 rounded-lg bg-white/5 active:bg-white/10 text-xs text-white/70 transition-colors"

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className={cn("font-medium text-[11px]", kindClass)}>{kind}</span>
          <p className="font-medium text-[15px] mt-1 break-words">{title}</p>
          <p className="text-xs text-white/30 mt-0.5">{subtitle}</p>
        </div>
        <div className="shrink-0">{statusBadge}</div>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-white/40">Сумма</span>
          <span className="font-medium">{formatMoney(amount)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-white/40">Объект</span>
          <span className="text-white/80 text-right truncate">
            {obj?.object_code || objectCode || "—"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-white/40">Заказчик</span>
          <span className="text-white/80 text-right truncate">
            {clientName || obj?.client_name || "—"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-white/40">Дата</span>
          <span className="text-white/80">{formatDate(createdAt)}</span>
        </div>
        {obj?.status && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-white/40">Статус объекта</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs",
                getStatusBadgeClass(objectStatuses.find((s) => s.name === obj.status)?.color),
              )}
            >
              {obj.status}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
        {viewTo && (
          <Link to={viewTo} className={cn(btn, "flex-1")}>
            <Icon name="Eye" size={15} />
            Открыть
          </Link>
        )}
        {editTo && (
          <Link to={editTo} className={cn(btn, "w-10 shrink-0 px-0")} title="Редактировать">
            <Icon name="Pencil" size={15} />
          </Link>
        )}
        {onPrint && (
          <button onClick={onPrint} className={cn(btn, "w-10 shrink-0 px-0")} title="Печать">
            <Icon name={printing ? "Loader2" : "Printer"} size={15} className={printing ? "animate-spin" : ""} />
          </button>
        )}
        {onDownload && (
          <button onClick={onDownload} className={cn(btn, "w-10 shrink-0 px-0")} title="Скачать PDF">
            <Icon name={downloading ? "Loader2" : "Download"} size={15} className={downloading ? "animate-spin" : ""} />
          </button>
        )}
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 shrink-0">
          {deleteButton}
        </div>
      </div>
    </div>
  )
}
