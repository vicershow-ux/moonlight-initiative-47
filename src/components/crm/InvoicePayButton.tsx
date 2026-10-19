import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { invoicesApi } from "@/lib/api"

const PENDING_KEY = "fixkey_pending_invoice_pay"

let configPromise: Promise<boolean> | null = null
const onlineEnabled = () => {
  if (!configPromise) configPromise = invoicesApi.payConfig().then((d) => d.online).catch(() => false)
  return configPromise
}

/** После возврата со страницы ЮKassa проверяет оплату и сообщает результат */
export function useInvoicePaymentReturn(onPaid: () => void) {
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const fromUrl = Number(params.get("paid_invoice") || 0)
    const fromStore = Number(sessionStorage.getItem(PENDING_KEY) || 0)
    const id = fromUrl || fromStore
    if (!id) return
    sessionStorage.removeItem(PENDING_KEY)
    if (fromUrl) {
      params.delete("paid_invoice")
      const q = params.toString()
      window.history.replaceState(null, "", window.location.pathname + (q ? `?${q}` : ""))
    }
    let tries = 0
    const check = async () => {
      tries += 1
      try {
        const r = await invoicesApi.payCheck(id)
        if (r.invoice_status === "paid") {
          setMessage({ ok: true, text: "Оплата получена — спасибо! Счёт отмечен оплаченным." })
          onPaid()
          window.dispatchEvent(new Event("invoice-paid"))
          return
        }
        if (r.payment === "canceled") {
          setMessage({ ok: false, text: "Платёж отменён. Можно попробовать оплатить ещё раз." })
          return
        }
      } catch {
        /* повторим */
      }
      if (tries < 6) setTimeout(check, 3000)
      else setMessage({ ok: false, text: "Платёж ещё обрабатывается. Статус счёта обновится автоматически." })
    }
    check()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { message, clear: () => setMessage(null) }
}

export function PaymentReturnBanner({ message, onClose }: { message: { ok: boolean; text: string } | null; onClose: () => void }) {
  if (!message) return null
  return (
    <div
      className={`mb-4 flex items-start gap-3 rounded-xl border p-4 text-sm ${
        message.ok ? "border-emerald-500/30 bg-emerald-500/10" : "border-[#D4AF37]/30 bg-[#D4AF37]/10"
      }`}
    >
      <Icon name={message.ok ? "BadgeCheck" : "Clock"} size={20} className={message.ok ? "text-emerald-400" : "text-[#D4AF37]"} />
      <p className="flex-1">{message.text}</p>
      <button onClick={onClose} className="text-white/40 hover:text-white" aria-label="Закрыть">
        <Icon name="X" size={16} />
      </button>
    </div>
  )
}

export function InvoicePayButton({ invoiceId, amountLabel, className = "" }: { invoiceId: number; amountLabel?: string; className?: string }) {
  const [enabled, setEnabled] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    onlineEnabled().then(setEnabled)
  }, [])

  if (!enabled) return null

  const pay = async () => {
    setBusy(true)
    setError("")
    try {
      const url = new URL(window.location.href)
      url.searchParams.set("paid_invoice", String(invoiceId))
      const { confirmation_url } = await invoicesApi.pay(invoiceId, url.toString())
      sessionStorage.setItem(PENDING_KEY, String(invoiceId))
      window.location.href = confirmation_url
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось перейти к оплате")
      setBusy(false)
    }
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <button
        onClick={pay}
        disabled={busy}
        className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-60"
      >
        <Icon name={busy ? "Loader2" : "CreditCard"} size={14} className={busy ? "animate-spin" : ""} />
        Оплатить онлайн{amountLabel ? ` ${amountLabel}` : ""}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export default InvoicePayButton
