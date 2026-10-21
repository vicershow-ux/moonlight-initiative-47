import { useState } from "react"
import Icon from "@/components/ui/icon"
import { estimatesApi, Estimate } from "@/lib/api"
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

const money = (n: unknown) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Number(n) || 0) + " ₽"

export function ClientApproveBar({ estimate, onDone }: { estimate: Estimate; onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  if (estimate.status === "inactive") return null

  if (estimate.status === "approved") {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 p-3 sm:p-4 flex items-center gap-3">
        <Icon name="BadgeCheck" size={22} className="text-emerald-400 shrink-0" />
        <div className="text-sm">
          <p className="font-medium">Смета согласована</p>
          {estimate.client_approved_at && (
            <p className="text-white/50 text-xs">
              {new Date(estimate.client_approved_at).toLocaleString("ru-RU", {
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>
    )
  }

  const pending = (estimate.items || []).some((it) => it.status === "pending")

  const approve = async () => {
    setSaving(true)
    setError("")
    try {
      await estimatesApi.clientApprove(estimate.id)
      setOpen(false)
      onDone()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось согласовать")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl mb-4 p-3 sm:p-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3">
      <div className="text-sm">
        <p className="font-medium">Проверьте смету и согласуйте её онлайн</p>
        <p className="text-white/50 text-xs">
          {pending ? "Сначала дождитесь решения по доп. работам на согласовании" : `Итог: ${money(estimate.total_amount)}`}
        </p>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
      <button
        onClick={() => setOpen(true)}
        disabled={pending}
        className="inline-flex w-full sm:w-auto justify-center min-h-[44px] sm:min-h-0 items-center gap-2 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] px-4 py-2.5 text-sm font-medium text-[#161616] disabled:opacity-50"
      >
        <Icon name="CheckCheck" size={16} />
        Согласовать смету
      </button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="w-[calc(100%-1.5rem)] sm:w-full max-h-[88vh] overflow-y-auto p-4 sm:p-6 rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Согласовать смету?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы подтверждаете состав работ и сумму {money(estimate.total_amount)}. Подрядчик получит уведомление.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving} className="min-h-[44px] sm:min-h-0">Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                approve()
              }}
              disabled={saving}
              className="min-h-[44px] sm:min-h-0"
            >
              {saving ? "Согласуем…" : "Согласовать"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ClientApproveBar
