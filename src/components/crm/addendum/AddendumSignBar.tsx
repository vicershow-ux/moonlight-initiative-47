import { useState } from "react"
import Icon from "@/components/ui/icon"
import { addendaApi, ContractAddendum } from "@/lib/api"
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

export function AddendumSignBar({ doc, onDone }: { doc: ContractAddendum; onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [agree, setAgree] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  if (doc.signed_at || doc.status === "signed") {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 p-4 flex items-center gap-3 max-w-4xl mx-auto">
        <Icon name="BadgeCheck" size={22} className="text-emerald-400 shrink-0" />
        <div className="text-sm">
          <p className="font-medium">Соглашение подписано</p>
          {doc.signed_at && (
            <p className="text-white/50 text-xs">
              {new Date(doc.signed_at).toLocaleString("ru-RU", {
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
      await addendaApi.sign(doc.id)
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
        <p className="font-medium">Ознакомьтесь с соглашением и подпишите его онлайн</p>
        <p className="text-white/50 text-xs">Новая цена договора: {money(doc.total_amount)}</p>
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
            <AlertDialogTitle>Подписать допсоглашение № {doc.addendum_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              Подписывая, вы соглашаетесь с изменениями договора. После подписания соглашение нельзя изменить, подрядчик
              получит уведомление.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
            Я ознакомился с текстом соглашения и согласен с его условиями
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

export default AddendumSignBar
