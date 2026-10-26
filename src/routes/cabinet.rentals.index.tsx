import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import Rentals from "@/pages/crm/Rentals"

export const Route = createFileRoute("/cabinet/rentals/")({ ssr: false, pendingComponent: RoutePending, component: RentalsPage })

function RentalsPage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]}>
      <Rentals />
    </ProtectedRoute>
  )
}
