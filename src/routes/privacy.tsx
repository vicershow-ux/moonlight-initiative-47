import { createFileRoute } from "@tanstack/react-router"
import PrivacyPolicy from "@/pages/PrivacyPolicy"
import { buildHead } from "@/lib/pageHead"

export const Route = createFileRoute("/privacy")({
  head: () =>
    buildHead({
      path: "/privacy",
      title: "Политика конфиденциальности — FixKey",
      description: "Политика обработки персональных данных: какие данные мы собираем, как используем Яндекс.Метрику, сколько храним и какие права есть у пользователя по 152-ФЗ.",
      noindex: true,
    }),
  component: PrivacyPolicy,
})
