import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import AddendumView from "@/pages/crm/AddendumView"

export const Route = createFileRoute("/cabinet/objects/$id/contracts/$contractId/addenda/$addendumId/")({ ssr: false, pendingComponent: RoutePending, component: AddendumViewPage })

function AddendumViewPage() {
  return (
    <ProtectedRoute>
      <AddendumView />
    </ProtectedRoute>
  )
}
