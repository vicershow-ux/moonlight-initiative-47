import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import ActView from "@/pages/crm/ActView"

export const Route = createFileRoute("/cabinet/objects/$id/acts/$actId/")({ ssr: false, pendingComponent: RoutePending, component: ActViewPage })

function ActViewPage() {
  return (
    <ProtectedRoute>
      <ActView />
    </ProtectedRoute>
  )
}
