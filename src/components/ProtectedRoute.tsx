import { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import Icon from "@/components/ui/icon"
import { hasHrefAccess } from "@/lib/positions"

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: string[]
  section?: string
}

export function ProtectedRoute({ children, allowedRoles, section }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

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

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/cabinet/objects" replace />
  }

  const sectionHref = section || location.pathname
  if (!hasHrefAccess(user.role, user.position, sectionHref)) {
    return <Navigate to="/cabinet/objects" replace />
  }

  return <>{children}</>
}