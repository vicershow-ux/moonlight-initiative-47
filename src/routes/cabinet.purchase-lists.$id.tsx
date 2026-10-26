import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import PurchaseListView from "@/pages/crm/PurchaseListView"

export const Route = createFileRoute("/cabinet/purchase-lists/$id")({ ssr: false, pendingComponent: RoutePending, component: PurchaseListViewPage })

function PurchaseListViewPage() {
  return (
    <ProtectedRoute>
      <PurchaseListView />
    </ProtectedRoute>
  )
}
