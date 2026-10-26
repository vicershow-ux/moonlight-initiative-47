import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import ActCreate from "@/pages/crm/ActCreate"

export const Route = createFileRoute("/cabinet/objects/$id/acts/$actId/edit")({ ssr: false, pendingComponent: RoutePending, component: ActCreatePage })

function ActCreatePage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]}>
      <ActCreate />
    </ProtectedRoute>
  )
}
