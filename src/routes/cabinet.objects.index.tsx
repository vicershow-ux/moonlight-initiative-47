import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import Objects from "@/pages/crm/Objects"

export const Route = createFileRoute("/cabinet/objects/")({ ssr: false, pendingComponent: RoutePending, component: ObjectsPage })

function ObjectsPage() {
  return (
    <ProtectedRoute>
      <Objects />
    </ProtectedRoute>
  )
}
