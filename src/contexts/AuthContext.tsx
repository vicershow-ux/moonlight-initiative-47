import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { authApi, getToken, setToken, clearToken, UserData } from "@/lib/api"

interface AuthContextValue {
  user: UserData | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateCompanyName: (name: string) => void
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

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password })
    setToken(data.token)
    setUser(data.user)
  }

  const logout = () => {
    clearToken()
    setUser(null)
  }

  const updateCompanyName = (name: string) => {
    setUser((prev) => (prev ? { ...prev, company_name: name } : prev))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateCompanyName }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}