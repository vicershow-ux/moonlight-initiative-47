import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import RentalContract from "@/pages/crm/RentalContract"

export const Route = createFileRoute("/cabinet/rentals/$rentalId/contract")({ ssr: false, pendingComponent: RoutePending, component: RentalContractPage })

function RentalContractPage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]}>
      <RentalContract />
    </ProtectedRoute>
  )
}
