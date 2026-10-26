import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import Dashboard from "@/pages/crm/Dashboard"

export const Route = createFileRoute("/cabinet/")({ ssr: false, pendingComponent: RoutePending, component: DashboardPage })

function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]}>
      <Dashboard />
    </ProtectedRoute>
  )
}
