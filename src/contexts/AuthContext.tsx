import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { authApi, getToken, setToken, clearToken, UserData } from "@/lib/api"

interface LoginOutcome {
  requires2fa: boolean
  challengeToken?: string
}

interface AuthContextValue {
  user: UserData | null
  loading: boolean
  login: (email: string, password: string, remember?: boolean) => Promise<LoginOutcome>
  verify2fa: (challengeToken: string, code: string, remember?: boolean) => Promise<void>
  logout: () => void
  updateCompanyName: (name: string) => void
  updateProfile: (data: { full_name?: string; email?: string }) => void
  setTotpEnabled: (enabled: boolean) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then((data) => setUser(data.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string, remember = true): Promise<LoginOutcome> => {
    const data = await authApi.login({ email, password })
    if (data.requires_2fa) {
      return { requires2fa: true, challengeToken: data.challenge_token }
    }
    if (data.token && data.user) {
      setToken(data.token, remember)
      setUser(data.user)
    }
    return { requires2fa: false }
  }

  const verify2fa = async (challengeToken: string, code: string, remember = true) => {
    const data = await authApi.verify2fa({ challenge_token: challengeToken, code })
    setToken(data.token, remember)
    setUser(data.user)
  }

  const logout = () => {
    clearToken()
    setUser(null)
  }

  const updateCompanyName = (name: string) => {
    setUser((prev) => (prev ? { ...prev, company_name: name } : prev))
  }

  const updateProfile = (data: { full_name?: string; email?: string }) => {
    setUser((prev) => (prev ? { ...prev, ...data } : prev))
  }

  const setTotpEnabled = (enabled: boolean) => {
    setUser((prev) => (prev ? { ...prev, totp_enabled: enabled } : prev))
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, verify2fa, logout, updateCompanyName, updateProfile, setTotpEnabled }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}