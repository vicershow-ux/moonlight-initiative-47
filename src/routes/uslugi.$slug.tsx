import { createFileRoute } from "@tanstack/react-router"
import ServiceLanding from "@/pages/ServiceLanding"

export const Route = createFileRoute("/uslugi/$slug")({ component: ServiceLanding })
