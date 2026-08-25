import { useState, FormEvent } from "react"
import { ArrowRight } from "lucide-react"
import { leadsApi } from "@/lib/api"
import Icon from "@/components/ui/icon"
import { formatPhone, isPhoneComplete } from "@/lib/phone"

interface LeadFormProps {
  presetComment?: string
  commentPlaceholder?: string
  submitLabel?: string
  successText?: string
}

export function LeadForm({
  presetComment,
  commentPlaceholder = "Площадь, район, пожелания (необязательно)",
  submitLabel = "Оставить заявку",
  successText = "Свяжемся с вами в течение 24 часов",
}: LeadFormProps = {}) {
  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [comment, setComment] = useState("")
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")

    if (clientName.trim().length < 2) {
      setError("Введите имя")
      return
    }
    if (!isPhoneComplete(clientPhone)) {
      setError("Введите номер телефона полностью")
      return
    }
    if (clientEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clientEmail.trim())) {
      setError("Проверьте адрес электронной почты")
      return
    }
    if (!consent) {
      setError("Необходимо согласие на обработку персональных данных")
      return
    }

    setLoading(true)
    try {
      const fullComment = [presetComment, comment.trim()].filter(Boolean).join(". ")
      await leadsApi.create({
        client_name: clientName,
        client_phone: clientPhone,
        email: clientEmail.trim(),
        comment: fullComment,
      })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось отправить заявку")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
          <Icon name="Check" size={22} className="text-[#D4AF37]" />
        </div>
        <p className="text-lg font-medium">Заявка принята!</p>
        <p className="text-primary-foreground/60 text-sm">{successText}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto text-left">
      <div className="flex flex-col gap-1.5">
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Ваше имя"
          className="bg-transparent border border-primary-foreground/20 px-5 py-3 rounded-full text-sm outline-none focus:border-primary-foreground/60 transition-colors placeholder:text-primary-foreground/40"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <input
          type="tel"
          inputMode="tel"
          value={clientPhone}
          onChange={(e) => setClientPhone(formatPhone(e.target.value))}
          onFocus={() => {
            if (!clientPhone) setClientPhone("+7 (")
          }}
          onBlur={() => {
            if (clientPhone === "+7 (" || clientPhone === "+7") setClientPhone("")
          }}
          placeholder="+7 (___) ___-__-__"
          className="bg-transparent border border-primary-foreground/20 px-5 py-3 rounded-full text-sm outline-none focus:border-primary-foreground/60 transition-colors placeholder:text-primary-foreground/40"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <input
          type="email"
          inputMode="email"
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          placeholder="Email (необязательно)"
          className="bg-transparent border border-primary-foreground/20 px-5 py-3 rounded-full text-sm outline-none focus:border-primary-foreground/60 transition-colors placeholder:text-primary-foreground/40"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={commentPlaceholder}
          className="bg-transparent border border-primary-foreground/20 px-5 py-3 rounded-full text-sm outline-none focus:border-primary-foreground/60 transition-colors placeholder:text-primary-foreground/40"
        />
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer select-none group">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked)
            if (e.target.checked) setError("")
          }}
          className="peer sr-only"
        />
        <span className="w-4 h-4 mt-0.5 shrink-0 border border-primary-foreground/30 flex items-center justify-center transition-colors peer-checked:bg-[#D4AF37] peer-checked:border-[#D4AF37]">
          {consent && <Icon name="Check" size={12} className="text-[#161616]" />}
        </span>
        <span className="text-xs text-primary-foreground/60 leading-relaxed group-hover:text-primary-foreground/80 transition-colors">
          Я согласен на обработку персональных данных в соответствии с{" "}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[#D4AF37] hover:underline"
          >
            политикой конфиденциальности
          </a>{" "}
          и принимаю{" "}
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[#D4AF37] hover:underline"
          >
            условия использования
          </a>
          .
        </span>
      </label>

      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1.5">
          <Icon name="CircleAlert" size={15} />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !consent}
        className="inline-flex items-center justify-center gap-3 bg-[#D4AF37] text-foreground px-8 py-4 rounded-full text-sm tracking-wide hover:bg-[#B8860B] transition-colors duration-300 group disabled:opacity-60"
      >
        {loading ? (
          <Icon name="Loader2" size={16} className="animate-spin" />
        ) : (
          <>
            {submitLabel}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  )
}