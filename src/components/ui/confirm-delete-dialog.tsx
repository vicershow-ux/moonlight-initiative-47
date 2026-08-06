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

interface ConfirmDeleteDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  onConfirm: () => void | Promise<void>
  title?: string
  description?: string
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Удалить безвозвратно?",
  description = "Это действие нельзя отменить. Запись будет удалена навсегда.",
}: ConfirmDeleteDialogProps) {
  const [busy, setBusy] = useState(false)

  const handle = async () => {
    setBusy(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
            {busy ? <Icon name="Loader2" size={16} className="animate-spin" /> : "Да, удалить"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmDeleteDialog
