import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import Integrations from "@/pages/crm/Integrations"

export const Route = createFileRoute("/cabinet/integrations/$slug")({ ssr: false, pendingComponent: RoutePending, component: IntegrationsPage })

function IntegrationsPage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin"]}>
      <Integrations />
    </ProtectedRoute>
  )
}
