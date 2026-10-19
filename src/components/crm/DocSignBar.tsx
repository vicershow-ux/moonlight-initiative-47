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

const money = (n: unknown) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Number(n) || 0) + " ₽"

interface Props {
  signedAt?: string | null
  isSigned: boolean
  docLabel: string
  docTitle: string
  amountLabel: string
  amount: number
  onSign: () => Promise<unknown>
  onDone: () => void
}

export function DocSignBar({ signedAt, isSigned, docLabel, docTitle, amountLabel, amount, onSign, onDone }: Props) {
  const [open, setOpen] = useState(false)
  const [agree, setAgree] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  if (signedAt || isSigned) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 p-4 flex items-center gap-3 max-w-4xl mx-auto">
        <Icon name="BadgeCheck" size={22} className="text-emerald-400 shrink-0" />
        <div className="text-sm">
          <p className="font-medium">{docLabel} подписан{docLabel === "Договор" ? "" : "о"}</p>
          {signedAt && (
            <p className="text-white/50 text-xs">
              {new Date(signedAt).toLocaleString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>
    )
  }

  const sign = async () => {
    setSaving(true)
    setError("")
    try {
      await onSign()
      setOpen(false)
      onDone()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось подписать")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl mb-4 p-4 flex flex-wrap items-center justify-between gap-3 max-w-4xl mx-auto">
      <div className="text-sm">
        <p className="font-medium">Ознакомьтесь с документом и подпишите его онлайн</p>
        <p className="text-white/50 text-xs">{amountLabel}: {money(amount)}</p>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
      <button
        onClick={() => {
          setAgree(false)
          setOpen(true)
        }}
        className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] px-4 py-2.5 text-sm font-medium text-[#161616]"
      >
        <Icon name="PenLine" size={16} />
        Подписать
      </button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подписать {docTitle}?</AlertDialogTitle>
            <AlertDialogDescription>
              Подписывая, вы соглашаетесь с условиями документа. После подписания его нельзя изменить, подрядчик получит
              уведомление.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
            Я ознакомился с текстом документа и согласен с его условиями
          </label>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                sign()
              }}
              disabled={saving || !agree}
            >
              {saving ? "Подписываем…" : "Подписать"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default DocSignBar
