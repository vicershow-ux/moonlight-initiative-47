import { createFileRoute } from "@tanstack/react-router"
import { RoutePending } from "@/components/RoutePending"
import ExecutorPortal from "@/pages/ExecutorPortal"

export const Route = createFileRoute("/executor")({ ssr: false, pendingComponent: RoutePending, component: ExecutorPortal })