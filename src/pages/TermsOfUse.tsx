import { LegalPage } from "@/components/LegalPage"
import { TERMS_INTRO_DEFAULT, TERMS_BODY_DEFAULT } from "@/lib/legalDefaults"

export default function TermsOfUse() {
  return (
    <LegalPage
      title="Условия использования"
      metaDescription="Условия использования сайта: правила работы с сайтом, статус размещённой информации, аналитика и файлы cookie, права на контент и ответственность сторон."
      introField="terms_intro"
      bodyField="terms_body"
      introDefault={TERMS_INTRO_DEFAULT}
      bodyDefault={TERMS_BODY_DEFAULT}
    />
  )
}
