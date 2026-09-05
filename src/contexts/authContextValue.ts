import { createContext } from "react"
import { UserData } from "@/lib/api"

export interface LoginOutcome {
  requires2fa: boolean
  challengeToken?: string
}

export interface AuthContextValue {
  user: UserData | null
  loading: boolean
  login: (email: string, password: string, remember?: boolean) => Promise<LoginOutcome>
  verify2fa: (challengeToken: string, code: string, remember?: boolean) => Promise<void>
  logout: () => void
  updateCompanyName: (name: string) => void
  updateProfile: (data: { full_name?: string; email?: string }) => void
  setTotpEnabled: (enabled: boolean) => void
}

const globalScope = globalThis as unknown as {
  __fixkeyAuthContext?: React.Context<AuthContextValue | null>
}

export const AuthContext =
  globalScope.__fixkeyAuthContext ||
  (globalScope.__fixkeyAuthContext = createContext<AuthContextValue | null>(null))
