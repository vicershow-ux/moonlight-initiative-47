import Icon from "@/components/ui/icon"
import { SiteSettings } from "@/lib/api"
import { PageSeoManager } from "@/components/crm/site/PageSeoManager"
import { ImageUploadField } from "@/components/crm/site/ImageUploadField"
import { DEFAULT_OG_IMAGE } from "@/lib/pageHead"

interface SeoTabProps {
  form: SiteSettings
  update: (field: keyof SiteSettings, value: string) => void
  onFileSelected: (field: "og_image_file", dataUrl: string) => void
}

export function SeoTab({ form, update, onFileSelected }: SeoTabProps) {
  const inputClass =
    "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
  const labelClass = "text-xs text-white/50 mb-1.5 block"

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-[#161616] border border-white/10 rounded-lg p-4 flex gap-3">
        <Icon name="Info" size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
        <p className="text-xs text-white/50 leading-relaxed">
          Здесь настраивается, как сайт выглядит в Яндексе, Google и при отправке ссылки в мессенджер.
          Заголовок, описание и ключевые слова для каждой страницы, включая главную, — в списке ниже.
        </p>
      </div>

      <div>
        <label className={labelClass}>Город или регион работы</label>
        <input
          className={inputClass}
          value={form.seo_region}
          onChange={(e) => update("seo_region", e.target.value)}
          placeholder="Хабаровск, Хабаровский край"
        />
        <p className="text-[11px] text-white/30 mt-1.5">
          Помогает показывать сайт людям, которые ищут ремонт именно в вашем городе.
        </p>
      </div>

      <ImageUploadField
        label="Картинка для соцсетей — общая для сайта"
        hint="Показывается, когда ссылку на сайт отправляют в Telegram, WhatsApp, ВКонтакте. Лучший размер — 1200×630. У каждой страницы ниже можно поставить свою. Сохраняется кнопкой «Сохранить» вверху."
        current={form.og_image}
        fallback={DEFAULT_OG_IMAGE}
        onPick={(data) => onFileSelected("og_image_file", data)}
        onClear={() => update("og_image", "")}
      />

      <div className="border-t border-white/10 pt-6">
        <PageSeoManager />
      </div>
    </div>
  )
}

export default SeoTab
