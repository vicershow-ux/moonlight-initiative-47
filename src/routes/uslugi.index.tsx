import { createFileRoute } from "@tanstack/react-router"
import ServicesIndex from "@/pages/ServicesIndex"

export const Route = createFileRoute("/uslugi/")({ component: ServicesIndex })
