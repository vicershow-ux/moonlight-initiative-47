import { LegalPage } from "@/components/LegalPage"
import { PRIVACY_INTRO_DEFAULT, PRIVACY_BODY_DEFAULT } from "@/lib/legalDefaults"

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Политика конфиденциальности"
      metaDescription="Политика обработки персональных данных: какие данные мы собираем, как используем Яндекс.Метрику, сколько храним и какие права есть у пользователя по 152-ФЗ."
      introField="privacy_intro"
      bodyField="privacy_body"
      introDefault={PRIVACY_INTRO_DEFAULT}
      bodyDefault={PRIVACY_BODY_DEFAULT}
    />
  )
}
