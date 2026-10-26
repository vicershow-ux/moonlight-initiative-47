import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import Team from "@/pages/crm/Team"

export const Route = createFileRoute("/cabinet/team")({ ssr: false, pendingComponent: RoutePending, component: TeamPage })

function TeamPage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]}>
      <Team />
    </ProtectedRoute>
  )
}
