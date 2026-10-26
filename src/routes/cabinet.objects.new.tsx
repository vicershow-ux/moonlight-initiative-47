import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import ObjectCreate from "@/pages/crm/ObjectCreate"

export const Route = createFileRoute("/cabinet/objects/new")({ ssr: false, pendingComponent: RoutePending, component: ObjectCreatePage })

function ObjectCreatePage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]}>
      <ObjectCreate />
    </ProtectedRoute>
  )
}
