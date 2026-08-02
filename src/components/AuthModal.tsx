import { useState, FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog"
import Icon from "@/components/ui/icon"
import { useAuth } from "@/contexts/AuthContext"
import { useSiteContent } from "@/hooks/useSiteContent"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [challengeToken, setChallengeToken] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login, verify2fa } = useAuth()
  const navigate = useNavigate()
  const { content } = useSiteContent()
  const logoUrl = content?.settings.logo_url

  const reset = () => {
    setEmail("")
    setPassword("")
    setCode("")
    setChallengeToken("")
    setError("")
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Введите корректный email")
      return
    }
    if (password.length < 6) {
      setError("Пароль должен быть не короче 6 символов")
      return
    }

    setLoading(true)
    try {
      const result = await login(email, password)
      if (result.requires2fa && result.challengeToken) {
        setChallengeToken(result.challengeToken)
      } else {
        reset()
        onOpenChange(false)
        navigate("/cabinet")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Что-то пошло не так")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    setError("")

    if (code.trim().length !== 6) {
      setError("Введите 6-значный код")
      return
    }

    setLoading(true)
    try {
      await verify2fa(challengeToken, code.trim())
      reset()
      onOpenChange(false)
      navigate("/cabinet")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Что-то пошло не так")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-md rounded-none border-foreground/10">
        {logoUrl && (
          <div className="flex justify-center -mt-2 mb-1">
            <img src={logoUrl} alt="Логотип" className="h-14 w-auto object-contain" />
          </div>
        )}
        {!challengeToken ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-light tracking-tight">
                Вход в аккаунт
              </DialogTitle>
              <DialogDescription className="text-foreground/60">
                Рады видеть вас снова
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs tracking-wide text-foreground/60 uppercase">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="border border-foreground/20 px-4 py-3 text-sm outline-none focus:border-foreground transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs tracking-wide text-foreground/60 uppercase">Пароль</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border border-foreground/20 px-4 py-3 text-sm outline-none focus:border-foreground transition-colors"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 flex items-center gap-1.5">
                  <Icon name="CircleAlert" size={15} />
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex items-center justify-center gap-2 text-sm px-5 py-3 bg-foreground text-white hover:bg-foreground/90 transition-all duration-300 disabled:opacity-60"
              >
                {loading ? <Icon name="Loader2" size={16} className="animate-spin" /> : "Войти"}
              </button>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-light tracking-tight">
                Код подтверждения
              </DialogTitle>
              <DialogDescription className="text-foreground/60">
                Введите 6-значный код из приложения-аутентификатора
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleVerify} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs tracking-wide text-foreground/60 uppercase">Код</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  autoFocus
                  className="border border-foreground/20 px-4 py-3 text-sm outline-none focus:border-foreground transition-colors tracking-[0.5em] text-center"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 flex items-center gap-1.5">
                  <Icon name="CircleAlert" size={15} />
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex items-center justify-center gap-2 text-sm px-5 py-3 bg-foreground text-white hover:bg-foreground/90 transition-all duration-300 disabled:opacity-60"
              >
                {loading ? <Icon name="Loader2" size={16} className="animate-spin" /> : "Подтвердить"}
              </button>

              <button
                type="button"
                onClick={() => { setChallengeToken(""); setCode(""); setError("") }}
                className="text-xs text-foreground/50 hover:text-foreground transition-colors"
              >
                Назад
              </button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}