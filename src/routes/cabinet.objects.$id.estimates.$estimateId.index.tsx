import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import EstimateView from "@/pages/crm/EstimateView"

export const Route = createFileRoute("/cabinet/objects/$id/estimates/$estimateId/")({ ssr: false, pendingComponent: RoutePending, component: EstimateViewPage })

function EstimateViewPage() {
  return (
    <ProtectedRoute>
      <EstimateView />
    </ProtectedRoute>
  )
}
