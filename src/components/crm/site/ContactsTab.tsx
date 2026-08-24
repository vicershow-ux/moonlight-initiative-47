import { useState } from "react"
import { SiteSettings, leadsApi } from "@/lib/api"
import Icon from "@/components/ui/icon"
import { formatPhone } from "@/lib/phone"

interface ContactsTabProps {
  form: SiteSettings
  update: (field: keyof SiteSettings, value: string) => void
}

export function ContactsTab({ form, update }: ContactsTabProps) {
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; text: string } | null>(null)

  const runTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await leadsApi.testEmail()
      setTestResult(
        res.success
          ? { ok: true, text: `Письмо отправлено на ${res.email}. Проверьте почту, в том числе папку «Спам».` }
          : { ok: false, text: res.detail || "Не удалось отправить письмо" }
      )
    } catch (err) {
      setTestResult({ ok: false, text: err instanceof Error ? err.message : "Ошибка проверки" })
    } finally {
      setTesting(false)
    }
  }

  const inputClass =
    "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
  const labelClass = "text-xs text-white/50 mb-1.5 block"

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <label className={labelClass}>Телефон</label>
        <input
          className={inputClass}
          value={form.phone}
          onChange={(e) => update("phone", formatPhone(e.target.value))}
          onFocus={() => {
            if (!form.phone) update("phone", "+7 (")
          }}
          onBlur={() => {
            if (form.phone === "+7 (" || form.phone === "+7") update("phone", "")
          }}
          inputMode="tel"
          placeholder="+7 (___) ___-__-__"
        />
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input
          className={inputClass}
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="hello@fixkey.ru"
        />
      </div>
      <div>
        <label className={labelClass}>Ссылка на Телеграм</label>
        <input
          className={inputClass}
          value={form.telegram_url}
          onChange={(e) => update("telegram_url", e.target.value)}
          placeholder="https://t.me/..."
        />
      </div>
      <div>
        <label className={labelClass}>Ссылка на MAX</label>
        <input
          className={inputClass}
          value={form.max_url || ""}
          onChange={(e) => update("max_url", e.target.value)}
          placeholder="https://max.ru/..."
        />
        <p className="text-xs text-white/30 mt-1.5">
          Оставьте пустым — ссылка не появится в разделе «Связь» на сайте
        </p>
      </div>
      <div className="border-t border-white/10 pt-5">
        <label className={labelClass}>Почта для новых заявок</label>
        <input
          className={inputClass}
          value={form.lead_notify_email || ""}
          onChange={(e) => update("lead_notify_email", e.target.value)}
          placeholder="Совпадает с Email выше, если не заполнено"
        />
        <p className="text-xs text-white/30 mt-1.5">
          На этот адрес приходит письмо после каждой заявки с сайта
        </p>

        <div className="mt-3.5 flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={runTest}
            disabled={testing}
            className="flex items-center gap-2 text-xs px-3.5 py-2 rounded-lg bg-[#1f1f1f] border border-white/10 text-white/70 hover:text-white hover:border-white/25 transition-colors disabled:opacity-60"
          >
            {testing ? (
              <Icon name="Loader2" size={13} className="animate-spin" />
            ) : (
              <Icon name="Send" size={13} />
            )}
            Отправить пробное письмо
          </button>
          <span className="text-[11px] text-white/25">
            Сначала сохраните изменения
          </span>
        </div>

        {testResult && (
          <div
            className={`mt-3 flex items-start gap-2 text-xs leading-relaxed rounded-lg p-3 ${
              testResult.ok
                ? "bg-green-500/10 border border-green-500/20 text-green-300"
                : "bg-red-500/10 border border-red-500/20 text-red-300"
            }`}
          >
            <Icon
              name={testResult.ok ? "CheckCircle2" : "CircleAlert"}
              size={14}
              className="mt-0.5 shrink-0"
            />
            <span className="break-words">{testResult.text}</span>
          </div>
        )}
      </div>
      <div className="border-t border-white/10 pt-5">
        <label className={labelClass}>Описание в футере</label>
        <textarea
          rows={3}
          className={`${inputClass} resize-none`}
          value={form.footer_description}
          onChange={(e) => update("footer_description", e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Текст копирайта</label>
        <input
          className={inputClass}
          value={form.copyright_text}
          onChange={(e) => update("copyright_text", e.target.value)}
        />
      </div>
    </div>
  )
}