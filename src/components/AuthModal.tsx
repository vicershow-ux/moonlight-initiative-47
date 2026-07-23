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

type AuthMode = "login" | "register"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialMode?: AuthMode
}

export function AuthModal({ open, onOpenChange, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const isLogin = mode === "login"

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")

    if (!isLogin && name.trim().length < 2) {
      setError("Введите имя")
      return
    }
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
      if (isLogin) {
        await login(email, password)
      } else {
        await register(name, email, password)
      }
      onOpenChange(false)
      navigate("/cabinet")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Что-то пошло не так")
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (next: AuthMode) => {
    setMode(next)
    setError("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-none border-foreground/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light tracking-tight">
            {isLogin ? "Вход в аккаунт" : "Создать аккаунт"}
          </DialogTitle>
          <DialogDescription className="text-foreground/60">
            {isLogin
              ? "Рады видеть вас снова"
              : "Присоединяйтесь к FixKey"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs tracking-wide text-foreground/60 uppercase">Имя</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                className="border border-foreground/20 px-4 py-3 text-sm outline-none focus:border-foreground transition-colors"
              />
            </div>
          )}

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
            {loading ? (
              <Icon name="Loader2" size={16} className="animate-spin" />
            ) : isLogin ? (
              "Войти"
            ) : (
              "Зарегистрироваться"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-foreground/60 mt-2">
          {isLogin ? "Ещё нет аккаунта? " : "Уже есть аккаунт? "}
          <button
            type="button"
            onClick={() => switchMode(isLogin ? "register" : "login")}
            className="text-foreground underline underline-offset-4 hover:text-[rgb(251,146,60)] transition-colors"
          >
            {isLogin ? "Регистрация" : "Войти"}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  )
}
