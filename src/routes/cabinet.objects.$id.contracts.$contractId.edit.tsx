import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import ContractEdit from "@/pages/crm/ContractEdit"

export const Route = createFileRoute("/cabinet/objects/$id/contracts/$contractId/edit")({ ssr: false, pendingComponent: RoutePending, component: ContractEditPage })

function ContractEditPage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]}>
      <ContractEdit />
    </ProtectedRoute>
  )
}
