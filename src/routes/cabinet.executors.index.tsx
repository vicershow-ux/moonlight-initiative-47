import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import Executors from "@/pages/crm/Executors"

export const Route = createFileRoute("/cabinet/executors/")({ ssr: false, pendingComponent: RoutePending, component: ExecutorsPage })

function ExecutorsPage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]}>
      <Executors />
    </ProtectedRoute>
  )
}
