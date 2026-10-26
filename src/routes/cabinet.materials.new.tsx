import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import MaterialCreate from "@/pages/crm/MaterialCreate"

export const Route = createFileRoute("/cabinet/materials/new")({ ssr: false, pendingComponent: RoutePending, component: MaterialCreatePage })

function MaterialCreatePage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]}>
      <MaterialCreate />
    </ProtectedRoute>
  )
}
