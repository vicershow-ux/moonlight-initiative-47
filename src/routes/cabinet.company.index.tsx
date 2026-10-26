import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import Company from "@/pages/crm/Company"

export const Route = createFileRoute("/cabinet/company/")({ ssr: false, pendingComponent: RoutePending, component: CompanyPage })

function CompanyPage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]}>
      <Company />
    </ProtectedRoute>
  )
}
