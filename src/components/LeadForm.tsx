import { useState, FormEvent } from "react"
import { ArrowRight } from "lucide-react"
import { leadsApi } from "@/lib/api"
import Icon from "@/components/ui/icon"

export function LeadForm() {
  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [comment, setComment] = useState("")
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
    if (clientPhone.trim().length < 5) {
      setError("Введите номер телефона")
      return
    }

    setLoading(true)
    try {
      await leadsApi.create({ client_name: clientName, client_phone: clientPhone, comment })
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
        <div className="w-12 h-12 rounded-full bg-[rgb(34,197,94)]/20 flex items-center justify-center">
          <Icon name="Check" size={22} className="text-[rgb(74,222,128)]" />
        </div>
        <p className="text-lg font-medium">Заявка принята!</p>
        <p className="text-primary-foreground/60 text-sm">Свяжемся с вами в течение 24 часов</p>
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
          className="bg-transparent border border-primary-foreground/20 px-4 py-3 text-sm outline-none focus:border-primary-foreground/60 transition-colors placeholder:text-primary-foreground/40"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <input
          type="tel"
          value={clientPhone}
          onChange={(e) => setClientPhone(e.target.value)}
          placeholder="Телефон"
          className="bg-transparent border border-primary-foreground/20 px-4 py-3 text-sm outline-none focus:border-primary-foreground/60 transition-colors placeholder:text-primary-foreground/40"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Площадь, район, пожелания (необязательно)"
          className="bg-transparent border border-primary-foreground/20 px-4 py-3 text-sm outline-none focus:border-primary-foreground/60 transition-colors placeholder:text-primary-foreground/40"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1.5">
          <Icon name="CircleAlert" size={15} />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-3 bg-[rgb(34,197,94)] text-white px-8 py-4 text-sm tracking-wide hover:bg-[rgb(22,163,74)] transition-colors duration-300 group disabled:opacity-60"
      >
        {loading ? (
          <Icon name="Loader2" size={16} className="animate-spin" />
        ) : (
          <>
            Оставить заявку
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  )
}
