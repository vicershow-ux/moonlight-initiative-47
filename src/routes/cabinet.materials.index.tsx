import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import Materials from "@/pages/crm/Materials"

export const Route = createFileRoute("/cabinet/materials/")({ ssr: false, pendingComponent: RoutePending, component: MaterialsPage })

function MaterialsPage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]}>
      <Materials />
    </ProtectedRoute>
  )
}
