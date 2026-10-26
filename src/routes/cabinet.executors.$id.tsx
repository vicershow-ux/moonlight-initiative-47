import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import ExecutorDetail from "@/pages/crm/ExecutorDetail"

export const Route = createFileRoute("/cabinet/executors/$id")({ ssr: false, pendingComponent: RoutePending, component: ExecutorDetailPage })

function ExecutorDetailPage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]}>
      <ExecutorDetail />
    </ProtectedRoute>
  )
}
