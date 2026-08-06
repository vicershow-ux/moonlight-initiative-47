import { useState } from "react"
import Icon from "@/components/ui/icon"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface DeleteButtonProps {
  onConfirm: () => void | Promise<void>
  title?: string
  description?: string
  className?: string
  size?: number
  label?: string
  disabled?: boolean
  iconName?: string
}

export function DeleteButton({
  onConfirm,
  title = "Удалить безвозвратно?",
  description = "Это действие нельзя отменить. Запись будет удалена навсегда.",
  className,
  size = 15,
  label,
  disabled,
  iconName = "Trash2",
}: DeleteButtonProps) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const handle = async () => {
    setBusy(true)
    try {
      await onConfirm()
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        title={label || "Удалить"}
        className={cn(
          "text-white/40 hover:text-red-400 transition-colors disabled:opacity-40",
          label && "flex items-center gap-2",
          className
        )}
      >
        <Icon name={iconName} size={size} fallback="Trash2" />
        {label}
      </button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="bg-[#1f1f1f] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Icon name="TriangleAlert" size={18} className="text-red-400" />
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={busy}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
            >
              Нет, отменить
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(e) => {
                e.preventDefault()
                handle()
              }}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {busy ? (
                <Icon name="Loader2" size={16} className="animate-spin" />
              ) : (
                "Да, удалить"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default DeleteButton
