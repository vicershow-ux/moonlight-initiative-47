import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import Services from "@/pages/crm/Services"

export const Route = createFileRoute("/cabinet/services/")({ ssr: false, pendingComponent: RoutePending, component: ServicesPage })

function ServicesPage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]}>
      <Services />
    </ProtectedRoute>
  )
}
