import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import Finance from "@/pages/crm/Finance"

export const Route = createFileRoute("/cabinet/finance")({ ssr: false, pendingComponent: RoutePending, component: FinancePage })

function FinancePage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin"]}>
      <Finance />
    </ProtectedRoute>
  )
}
