import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import Documents from "@/pages/crm/Documents"

export const Route = createFileRoute("/cabinet/documents")({ ssr: false, pendingComponent: RoutePending, component: DocumentsPage })

function DocumentsPage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]}>
      <Documents />
    </ProtectedRoute>
  )
}
