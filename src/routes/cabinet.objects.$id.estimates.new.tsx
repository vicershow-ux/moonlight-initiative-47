import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import EstimateCreate from "@/pages/crm/EstimateCreate"

export const Route = createFileRoute("/cabinet/objects/$id/estimates/new")({ ssr: false, pendingComponent: RoutePending, component: EstimateCreatePage })

function EstimateCreatePage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]}>
      <EstimateCreate />
    </ProtectedRoute>
  )
}
