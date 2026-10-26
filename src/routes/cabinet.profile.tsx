import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import Profile from "@/pages/crm/Profile"

export const Route = createFileRoute("/cabinet/profile")({ ssr: false, pendingComponent: RoutePending, component: ProfilePage })

function ProfilePage() {
  return (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  )
}
