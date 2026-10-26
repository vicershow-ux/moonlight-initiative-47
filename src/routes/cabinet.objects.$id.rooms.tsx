import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import ObjectRooms from "@/pages/crm/ObjectRooms"

export const Route = createFileRoute("/cabinet/objects/$id/rooms")({ ssr: false, pendingComponent: RoutePending, component: ObjectRoomsPage })

function ObjectRoomsPage() {
  return (
    <ProtectedRoute>
      <ObjectRooms />
    </ProtectedRoute>
  )
}
