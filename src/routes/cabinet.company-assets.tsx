import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import CompanyAssets from "@/pages/crm/CompanyAssets"

export const Route = createFileRoute("/cabinet/company-assets")({ ssr: false, pendingComponent: RoutePending, component: CompanyAssetsPage })

function CompanyAssetsPage() {
  return (
    <ProtectedRoute allowedRoles={["owner", "admin", "employee"]}>
      <CompanyAssets />
    </ProtectedRoute>
  )
}
