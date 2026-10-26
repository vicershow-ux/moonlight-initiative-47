import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import Warehouse from "@/pages/crm/Warehouse"

export const Route = createFileRoute("/cabinet/warehouse")({ ssr: false, pendingComponent: RoutePending, component: WarehousePage })

function WarehousePage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]}>
      <Warehouse />
    </ProtectedRoute>
  )
}
