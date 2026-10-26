import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import Site from "@/pages/crm/Site"

export const Route = createFileRoute("/cabinet/site")({ ssr: false, pendingComponent: RoutePending, component: SitePage })

function SitePage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]} section="/cabinet/company">
      <Site />
    </ProtectedRoute>
  )
}
