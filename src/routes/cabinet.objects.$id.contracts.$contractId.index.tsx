import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import ContractView from "@/pages/crm/ContractView"

export const Route = createFileRoute("/cabinet/objects/$id/contracts/$contractId/")({ ssr: false, pendingComponent: RoutePending, component: ContractViewPage })

function ContractViewPage() {
  return (
    <ProtectedRoute>
      <ContractView />
    </ProtectedRoute>
  )
}
