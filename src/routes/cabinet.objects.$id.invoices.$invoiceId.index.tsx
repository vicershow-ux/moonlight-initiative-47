import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import InvoiceView from "@/pages/crm/InvoiceView"

export const Route = createFileRoute("/cabinet/objects/$id/invoices/$invoiceId/")({ ssr: false, pendingComponent: RoutePending, component: InvoiceViewPage })

function InvoiceViewPage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]}>
      <InvoiceView />
    </ProtectedRoute>
  )
}
