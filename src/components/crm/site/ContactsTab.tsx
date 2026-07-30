import { SiteSettings } from "@/lib/api"

interface ContactsTabProps {
  form: SiteSettings
  update: (field: keyof SiteSettings, value: string) => void
}

export function ContactsTab({ form, update }: ContactsTabProps) {
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
          onChange={(e) => update("phone", e.target.value)}
          placeholder="+7 (495) 123-45-67"
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
        <label className={labelClass}>Ссылка на ВКонтакте</label>
        <input
          className={inputClass}
          value={form.vk_url}
          onChange={(e) => update("vk_url", e.target.value)}
          placeholder="https://vk.com/..."
        />
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
