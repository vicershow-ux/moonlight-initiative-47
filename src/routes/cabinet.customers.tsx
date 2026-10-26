import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import Customers from "@/pages/crm/Customers"

export const Route = createFileRoute("/cabinet/customers")({ ssr: false, pendingComponent: RoutePending, component: CustomersPage })

function CustomersPage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]}>
      <Customers />
    </ProtectedRoute>
  )
}
