import { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import Icon from "@/components/ui/icon"

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#161616] flex items-center justify-center">
        <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
