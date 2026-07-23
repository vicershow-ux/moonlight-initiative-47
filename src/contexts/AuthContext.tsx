import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { authApi, getToken, setToken, clearToken, UserData } from "@/lib/api"

interface AuthContextValue {
  user: UserData | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (fullName: string, email: string, password: string, companyName?: string) => Promise<void>
  logout: () => void
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

  const register = async (fullName: string, email: string, password: string, companyName?: string) => {
    const data = await authApi.register({ full_name: fullName, email, password, company_name: companyName })
    setToken(data.token)
    setUser(data.user)
  }

  const logout = () => {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
