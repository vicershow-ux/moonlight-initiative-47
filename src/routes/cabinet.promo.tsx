import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import Promo from "@/pages/crm/Promo"

export const Route = createFileRoute("/cabinet/promo")({ ssr: false, pendingComponent: RoutePending, component: PromoPage })

function PromoPage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]} section="/cabinet/company">
      <Promo />
    </ProtectedRoute>
  )
}
