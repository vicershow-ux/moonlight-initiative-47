import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import ObjectPipeline from "@/pages/crm/ObjectPipeline"

export const Route = createFileRoute("/cabinet/company/pipeline")({ ssr: false, pendingComponent: RoutePending, component: ObjectPipelinePage })

function ObjectPipelinePage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]} section="/cabinet/company">
      <ObjectPipeline />
    </ProtectedRoute>
  )
}
