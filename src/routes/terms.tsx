import { createFileRoute } from "@tanstack/react-router"
import TermsOfUse from "@/pages/TermsOfUse"
import { buildHead } from "@/lib/pageHead"

export const Route = createFileRoute("/terms")({
  head: () =>
    buildHead({
      path: "/terms",
      title: "Условия использования — FixKey",
      description: "Условия использования сайта: правила работы с сайтом, статус размещённой информации, аналитика и файлы cookie, права на контент и ответственность сторон.",
      noindex: true,
    }),
  component: TermsOfUse,
})
