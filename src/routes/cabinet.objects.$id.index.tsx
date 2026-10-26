import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import ObjectDetail from "@/pages/crm/ObjectDetail"

export const Route = createFileRoute("/cabinet/objects/$id/")({ ssr: false, pendingComponent: RoutePending, component: ObjectDetailPage })

function ObjectDetailPage() {
  return (
    <ProtectedRoute>
      <ObjectDetail />
    </ProtectedRoute>
  )
}
