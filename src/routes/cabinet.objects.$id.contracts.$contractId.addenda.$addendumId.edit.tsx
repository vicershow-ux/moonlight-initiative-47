import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import AddendumEdit from "@/pages/crm/AddendumEdit"

export const Route = createFileRoute("/cabinet/objects/$id/contracts/$contractId/addenda/$addendumId/edit")({ ssr: false, pendingComponent: RoutePending, component: AddendumEditPage })

function AddendumEditPage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]}>
      <AddendumEdit />
    </ProtectedRoute>
  )
}
