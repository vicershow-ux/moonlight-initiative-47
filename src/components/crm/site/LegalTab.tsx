import { useState } from "react"
import { SiteSettings } from "@/lib/api"
import Icon from "@/components/ui/icon"
import {
  PRIVACY_INTRO_DEFAULT,
  PRIVACY_BODY_DEFAULT,
  TERMS_INTRO_DEFAULT,
  TERMS_BODY_DEFAULT,
  COOKIES_INTRO_DEFAULT,
  COOKIES_BODY_DEFAULT,
} from "@/lib/legalDefaults"

interface LegalTabProps {
  form: SiteSettings
  update: (field: keyof SiteSettings, value: string) => void
}

const DOCS = [
  {
    key: "privacy",
    label: "Политика конфиденциальности",
    path: "/privacy",
    introField: "privacy_intro" as const,
    bodyField: "privacy_body" as const,
    introDefault: PRIVACY_INTRO_DEFAULT,
    bodyDefault: PRIVACY_BODY_DEFAULT,
  },
  {
    key: "terms",
    label: "Условия использования",
    path: "/terms",
    introField: "terms_intro" as const,
    bodyField: "terms_body" as const,
    introDefault: TERMS_INTRO_DEFAULT,
    bodyDefault: TERMS_BODY_DEFAULT,
  },
  {
    key: "cookies",
    label: "Файлы cookie",
    path: "/cookies",
    introField: "cookies_intro" as const,
    bodyField: "cookies_body" as const,
    introDefault: COOKIES_INTRO_DEFAULT,
    bodyDefault: COOKIES_BODY_DEFAULT,
  },
]

export function LegalTab({ form, update }: LegalTabProps) {
  const [active, setActive] = useState("privacy")
  const doc = DOCS.find((d) => d.key === active)!

  const inputClass =
    "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
  const labelClass = "text-xs text-white/50 mb-1.5 block"

  const introValue = form[doc.introField] || ""
  const bodyValue = form[doc.bodyField] || ""
  const isDefault = !introValue.trim() && !bodyValue.trim()

  const loadDefault = () => {
    update(doc.introField, doc.introDefault)
    update(doc.bodyField, doc.bodyDefault)
  }

  const resetDoc = () => {
    update(doc.introField, "")
    update(doc.bodyField, "")
  }

  return (
    <div className="space-y-5">
      <div className="bg-[#1f1f1f] border border-white/10 rounded-lg p-4">
        <div className="flex items-start gap-2.5 text-sm text-white/60">
          <Icon name="Info" size={16} className="text-[#D4AF37] mt-0.5 shrink-0" />
          <div className="space-y-1.5">
            <p>
              Если поля пустые, на сайте показывается готовый текст с учётом Яндекс.Метрики. Нажмите
              «Загрузить готовый текст», чтобы отредактировать его под себя.
            </p>
            <p className="text-white/40 text-xs">
              Разметка: строка с «## » — заголовок раздела, строка с «- » — пункт списка, текст в
              «**звёздочках**» — выделение. Подстановки: {"{company}"} — название компании,{" "}
              {"{email}"} — почта, {"{site}"} — адрес сайта.
            </p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
        <div>
          <label className={labelClass}>Юридическое название для документов</label>
          <input
            className={inputClass}
            value={form.legal_company_name || ""}
            onChange={(e) => update("legal_company_name", e.target.value)}
            placeholder="ИП Иванов И.И. / ООО «ФиксКей»"
          />
        </div>
        <div>
          <label className={labelClass}>Дата редакции документов</label>
          <input
            className={inputClass}
            value={form.legal_updated_at || ""}
            onChange={(e) => update("legal_updated_at", e.target.value)}
            placeholder="17 августа 2026 года"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-white/10 pt-5">
        {DOCS.map((d) => (
          <button
            key={d.key}
            onClick={() => setActive(d.key)}
            className={`text-sm px-4 py-2 rounded-lg transition-colors ${
              active === d.key
                ? "bg-[#D4AF37] text-[#161616] font-medium"
                : "bg-[#1f1f1f] border border-white/10 text-white/60 hover:text-white"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs">
          {isDefault ? (
            <span className="text-white/40 flex items-center gap-1.5">
              <Icon name="FileText" size={13} />
              Показывается стандартный текст
            </span>
          ) : (
            <span className="text-green-400 flex items-center gap-1.5">
              <Icon name="PencilLine" size={13} />
              Свой текст
            </span>
          )}
          <a
            href={doc.path}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#D4AF37] hover:underline flex items-center gap-1 ml-2"
          >
            Открыть страницу
            <Icon name="ExternalLink" size={12} />
          </a>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadDefault}
            className="text-xs px-3 py-2 rounded-lg bg-[#1f1f1f] border border-white/10 text-white/60 hover:text-white transition-colors"
          >
            Загрузить готовый текст
          </button>
          {!isDefault && (
            <button
              onClick={resetDoc}
              className="text-xs px-3 py-2 rounded-lg bg-[#1f1f1f] border border-white/10 text-white/40 hover:text-red-400 transition-colors"
            >
              Вернуть стандартный
            </button>
          )}
        </div>
      </div>

      <div>
        <label className={labelClass}>Вступительный абзац</label>
        <textarea
          rows={3}
          className={`${inputClass} resize-y`}
          value={introValue}
          onChange={(e) => update(doc.introField, e.target.value)}
          placeholder={doc.introDefault}
        />
      </div>

      <div>
        <label className={labelClass}>
          Основной текст документа
          <span className="text-white/30 ml-2">{bodyValue.length} символов</span>
        </label>
        <textarea
          rows={26}
          className={`${inputClass} resize-y font-mono text-xs leading-relaxed`}
          value={bodyValue}
          onChange={(e) => update(doc.bodyField, e.target.value)}
          placeholder="Нажмите «Загрузить готовый текст», чтобы начать редактирование"
        />
      </div>

      <p className="text-xs text-white/30">
        Не забудьте нажать «Сохранить» вверху страницы — изменения применятся на сайте сразу.
      </p>
    </div>
  )
}
