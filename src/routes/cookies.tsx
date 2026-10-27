import { createFileRoute } from "@tanstack/react-router"
import CookiePolicy from "@/pages/CookiePolicy"
import { buildHead } from "@/lib/pageHead"

export const Route = createFileRoute("/cookies")({
  head: () =>
    buildHead({
      path: "/cookies",
      title: "Использование файлов cookie — FixKey",
      description: "Какие файлы cookie использует сайт, какие данные собирает Яндекс.Метрика, сколько они хранятся и как отказаться от их использования в настройках браузера.",
      noindex: true,
    }),
  component: CookiePolicy,
})
