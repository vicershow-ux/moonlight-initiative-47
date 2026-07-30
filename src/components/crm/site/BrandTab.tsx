import { ChangeEvent, useRef, useState } from "react"
import Icon from "@/components/ui/icon"
import { SiteSettings } from "@/lib/api"
import { resizeImageToDataUrl } from "@/lib/imageUpload"
import { useToast } from "@/hooks/use-toast"

interface BrandTabProps {
  form: SiteSettings
  update: (field: keyof SiteSettings, value: string) => void
  onFileSelected: (field: "logo_file" | "favicon_file", dataUrl: string) => void
}

export function BrandTab({ form, update, onFileSelected }: BrandTabProps) {
  const { toast } = useToast()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)

  const inputClass =
    "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
  const labelClass = "text-xs text-white/50 mb-1.5 block"

  const handleFile = async (field: "logo_file" | "favicon_file", e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const maxDim = field === "favicon_file" ? 256 : 512
      const resized = await resizeImageToDataUrl(file, maxDim)
      if (field === "logo_file") setLogoPreview(resized)
      else setFaviconPreview(resized)
      onFileSelected(field, resized)
    } catch {
      toast({ variant: "destructive", title: "Не удалось обработать изображение" })
    } finally {
      e.target.value = ""
    }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <label className={labelClass}>Название бренда</label>
        <input
          className={inputClass}
          value={form.brand_name}
          onChange={(e) => update("brand_name", e.target.value)}
          placeholder="FixKey"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Логотип</label>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg bg-[#161616] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              <img src={logoPreview || form.logo_url || "/fixkey-logo.svg"} alt="Логотип" className="w-full h-full object-contain" />
            </div>
            <button
              onClick={() => logoInputRef.current?.click()}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors text-sm px-3 py-2 rounded-lg"
            >
              <Icon name="Upload" size={14} />
              Загрузить
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile("logo_file", e)}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Favicon (иконка вкладки)</label>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg bg-[#161616] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              <img src={faviconPreview || form.favicon_url || "/favicon-32.png"} alt="Favicon" className="w-8 h-8 object-contain" />
            </div>
            <button
              onClick={() => faviconInputRef.current?.click()}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors text-sm px-3 py-2 rounded-lg"
            >
              <Icon name="Upload" size={14} />
              Загрузить
            </button>
            <input
              ref={faviconInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile("favicon_file", e)}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-5">
        <label className={labelClass}>SEO-заголовок страницы (title)</label>
        <input
          className={inputClass}
          value={form.meta_title}
          onChange={(e) => update("meta_title", e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>SEO-описание (description)</label>
        <textarea
          rows={3}
          className={`${inputClass} resize-none`}
          value={form.meta_description}
          onChange={(e) => update("meta_description", e.target.value)}
        />
      </div>
    </div>
  )
}