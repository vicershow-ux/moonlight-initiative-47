import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import ObjectPlanner from "@/pages/crm/ObjectPlanner"

export const Route = createFileRoute("/cabinet/objects/$id/planner")({ ssr: false, pendingComponent: RoutePending, component: ObjectPlannerPage })

function ObjectPlannerPage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]}>
      <ObjectPlanner />
    </ProtectedRoute>
  )
}
