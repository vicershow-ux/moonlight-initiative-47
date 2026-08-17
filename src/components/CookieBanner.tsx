import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import Icon from "@/components/ui/icon"

const STORAGE_KEY = "cookie_consent_v1"

export function CookieBanner() {
  const location = useLocation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let accepted: string | null = null
    try {
      accepted = localStorage.getItem(STORAGE_KEY)
    } catch {
      return
    }
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString())
    } catch {
      /* приватный режим — просто скрываем */
    }
    setVisible(false)
  }

  if (!visible || location.pathname.startsWith("/cabinet")) return null

  return (
    <div
      role="dialog"
      aria-label="Уведомление об использовании файлов cookie"
      className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6 animate-in slide-in-from-bottom duration-500"
    >
      <div className="container mx-auto max-w-4xl">
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/15 flex items-center justify-center shrink-0">
              <Icon name="Cookie" size={18} className="text-[#D4AF37]" />
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Мы используем файлы cookie, чтобы сайт работал корректно и удобно. Продолжая
              пользоваться сайтом, вы соглашаетесь с{" "}
              <a href="/cookies" className="text-[#D4AF37] hover:underline">
                условиями их использования
              </a>{" "}
              и{" "}
              <a href="/privacy" className="text-[#D4AF37] hover:underline">
                политикой конфиденциальности
              </a>
              .
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/cookies"
              className="text-sm text-white/50 hover:text-white transition-colors px-3 py-2.5"
            >
              Подробнее
            </a>
            <button
              onClick={accept}
              className="bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm font-medium px-6 py-2.5 rounded-lg whitespace-nowrap"
            >
              Принимаю
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}