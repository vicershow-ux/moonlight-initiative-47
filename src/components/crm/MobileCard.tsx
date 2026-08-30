import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MobileCardProps {
  title: ReactNode
  subtitle?: ReactNode
  badge?: ReactNode
  rows?: { label: string; value: ReactNode }[]
  actions?: ReactNode
  onClick?: () => void
  className?: string
}

export function MobileCard({
  title,
  subtitle,
  badge,
  rows,
  actions,
  onClick,
  className,
}: MobileCardProps) {
  const clickable = Boolean(onClick)

  return (
    <div
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      className={cn(
        "bg-[#1a1a1a] border border-white/10 rounded-xl p-4 flex flex-col gap-3",
        clickable && "active:bg-white/5 transition-colors cursor-pointer",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-medium text-[15px] truncate">{title}</div>
          {subtitle && (
            <div className="text-xs text-white/40 mt-0.5 truncate">{subtitle}</div>
          )}
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {rows && rows.length > 0 && (
        <div className="flex flex-col gap-2 pt-1">
          {rows.map((row, i) => (
            <div key={i} className="flex items-start justify-between gap-3 text-sm">
              <span className="text-white/40 shrink-0">{row.label}</span>
              <span className="text-right text-white/80 min-w-0 break-words">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {actions && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 pt-2 border-t border-white/10"
        >
          {actions}
        </div>
      )}
    </div>
  )
}

interface CardActionProps {
  icon: ReactNode
  label: string
  onClick?: () => void
  className?: string
}

export function CardAction({ icon, label, onClick, className }: CardActionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-1.5 min-h-[40px] rounded-lg bg-white/5 active:bg-white/10 text-xs text-white/70 transition-colors",
        className,
      )}
    >
      {icon}
      {label}
    </button>
  )
}
