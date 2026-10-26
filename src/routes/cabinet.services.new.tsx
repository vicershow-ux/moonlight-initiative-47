import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import ServiceCreate from "@/pages/crm/ServiceCreate"

export const Route = createFileRoute("/cabinet/services/new")({ ssr: false, pendingComponent: RoutePending, component: ServiceCreatePage })

function ServiceCreatePage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]}>
      <ServiceCreate />
    </ProtectedRoute>
  )
}
