import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import ObjectEdit from "@/pages/crm/ObjectEdit"

export const Route = createFileRoute("/cabinet/objects/$id/edit")({ ssr: false, pendingComponent: RoutePending, component: ObjectEditPage })

function ObjectEditPage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]}>
      <ObjectEdit />
    </ProtectedRoute>
  )
}
