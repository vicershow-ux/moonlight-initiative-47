import { LegalPage } from "@/components/LegalPage"
import { COOKIES_INTRO_DEFAULT, COOKIES_BODY_DEFAULT } from "@/lib/legalDefaults"

export default function CookiePolicy() {
  return (
    <LegalPage
      title="Использование файлов cookie"
      metaDescription="Какие файлы cookie использует сайт, какие данные собирает Яндекс.Метрика, сколько они хранятся и как отказаться от их использования в настройках браузера."
      introField="cookies_intro"
      bodyField="cookies_body"
      introDefault={COOKIES_INTRO_DEFAULT}
      bodyDefault={COOKIES_BODY_DEFAULT}
    />
  )
}
