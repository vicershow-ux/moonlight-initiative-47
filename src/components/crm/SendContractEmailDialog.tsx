import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Icon from "@/components/ui/icon"
import { Contract, contractsApi, objectsApi } from "@/lib/api"
import { contractPdfBase64 } from "@/lib/downloadContractPdf"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  contract: Contract
  title: string
}

/** Отправка готового договора заказчику на почту — PDF во вложении */
export function SendContractEmailDialog({ open, onOpenChange, contract, title }: Props) {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (!open) return
    setError("")
    setSent(false)
    objectsApi
      .get(contract.object_id)
      .then((o) => setEmail((prev) => prev || o?.email || ""))
      .catch(() => null)
  }, [open, contract.object_id])

  const send = async () => {
    setError("")
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError("Укажите корректный email заказчика")
      return
    }
    setSending(true)
    try {
      const pdf = await contractPdfBase64(contract.content_html, contract.contract_number)
      if (!pdf) throw new Error("Не удалось сформировать PDF")
      await contractsApi.sendEmail(contract.id, { email: email.trim(), pdf_base64: pdf, title, message: message.trim() })
      setSent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось отправить письмо")
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#1f1f1f] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Отправить договор заказчику</DialogTitle>
        </DialogHeader>
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/15 text-green-400">
              <Icon name="Check" size={24} />
            </div>
            <p className="font-medium">Договор отправлен</p>
            <p className="text-sm text-white/50">PDF ушёл на {email}</p>
            <button
              onClick={() => onOpenChange(false)}
              className="mt-2 rounded-lg bg-white/10 px-4 py-2 text-sm transition-colors hover:bg-white/15"
            >
              Закрыть
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Email заказчика</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@mail.ru"
                className="rounded-lg border border-white/15 bg-[#161616] px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Сообщение (необязательно)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Например: подпишите, пожалуйста, и пришлите скан в ответ"
                className="resize-none rounded-lg border border-white/15 bg-[#161616] px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
              />
            </div>
            <p className="flex items-center gap-1.5 text-xs text-white/40">
              <Icon name="Paperclip" size={13} />
              Вложение: Договор_{contract.contract_number}.pdf
            </p>
            {error && (
              <p className="flex items-center gap-1.5 text-sm text-red-400">
                <Icon name="CircleAlert" size={15} />
                {error}
              </p>
            )}
            <button
              onClick={send}
              disabled={sending}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2.5 text-sm font-medium text-[#161616] transition-colors hover:bg-[#B8860B] disabled:opacity-60"
            >
              {sending ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Send" size={15} />}
              {sending ? "Отправляю…" : "Отправить"}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default SendContractEmailDialog
