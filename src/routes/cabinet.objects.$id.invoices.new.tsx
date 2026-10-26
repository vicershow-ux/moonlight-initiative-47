import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import InvoiceEdit from "@/pages/crm/InvoiceEdit"

export const Route = createFileRoute("/cabinet/objects/$id/invoices/new")({ ssr: false, pendingComponent: RoutePending, component: InvoiceEditPage })

function InvoiceEditPage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]}>
      <InvoiceEdit />
    </ProtectedRoute>
  )
}
