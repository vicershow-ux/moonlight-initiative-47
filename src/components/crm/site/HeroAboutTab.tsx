import { ChangeEvent, useRef, useState } from "react"
import Icon from "@/components/ui/icon"
import { SiteSettings } from "@/lib/api"
import { resizeImageToDataUrl } from "@/lib/imageUpload"
import { useToast } from "@/hooks/use-toast"

interface HeroAboutTabProps {
  form: SiteSettings
  update: (field: keyof SiteSettings, value: string) => void
  onFileSelected: (field: "hero_bg_image_file" | "hero_fg_image_file" | "about_image_file", dataUrl: string) => void
}

export function HeroAboutTab({ form, update, onFileSelected }: HeroAboutTabProps) {
  const { toast } = useToast()
  const inputClass =
    "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
  const labelClass = "text-xs text-white/50 mb-1.5 block"

  const heroBgRef = useRef<HTMLInputElement>(null)
  const heroFgRef = useRef<HTMLInputElement>(null)
  const aboutImgRef = useRef<HTMLInputElement>(null)

  const [heroBgPreview, setHeroBgPreview] = useState<string | null>(null)
  const [heroFgPreview, setHeroFgPreview] = useState<string | null>(null)
  const [aboutPreview, setAboutPreview] = useState<string | null>(null)

  const handleFile = async (
    field: "hero_bg_image_file" | "hero_fg_image_file" | "about_image_file",
    setPreview: (v: string) => void,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const resized = await resizeImageToDataUrl(file, 1600)
      setPreview(resized)
      onFileSelected(field, resized)
    } catch {
      toast({ variant: "destructive", title: "Не удалось обработать изображение" })
    } finally {
      e.target.value = ""
    }
  }

  const ImagePicker = ({
    label,
    preview,
    url,
    inputRef,
    onChange,
  }: {
    label: string
    preview: string | null
    url: string
    inputRef: React.RefObject<HTMLInputElement>
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
  }) => (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex items-center gap-3">
        <div className="w-20 h-14 rounded-lg bg-[#161616] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
          <img src={preview || url} alt={label} className="w-full h-full object-cover" />
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors text-sm px-3 py-2 rounded-lg"
        >
          <Icon name="Upload" size={14} />
          Загрузить фото
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
      </div>
    </div>
  )

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <p className="text-sm font-medium text-white/80 mb-3">Блок Hero (первый экран)</p>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Надпись над заголовком</label>
            <input className={inputClass} value={form.hero_eyebrow} onChange={(e) => update("hero_eyebrow", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Заголовок, строка 1</label>
            <input className={inputClass} value={form.hero_title_line1} onChange={(e) => update("hero_title_line1", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Заголовок, строка 2 (выделена золотым)</label>
            <input className={inputClass} value={form.hero_title_line2} onChange={(e) => update("hero_title_line2", e.target.value)} />
          </div>
          <ImagePicker
            label="Фоновое фото"
            preview={heroBgPreview}
            url={form.hero_bg_image}
            inputRef={heroBgRef}
            onChange={(e) => handleFile("hero_bg_image_file", setHeroBgPreview, e)}
          />
          <ImagePicker
            label="Фото переднего плана"
            preview={heroFgPreview}
            url={form.hero_fg_image}
            inputRef={heroFgRef}
            onChange={(e) => handleFile("hero_fg_image_file", setHeroFgPreview, e)}
          />
        </div>
      </div>

      <div className="border-t border-white/10 pt-6">
        <p className="text-sm font-medium text-white/80 mb-3">Блок «О компании»</p>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Надпись над заголовком</label>
            <input className={inputClass} value={form.about_eyebrow} onChange={(e) => update("about_eyebrow", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Заголовок, строка 1</label>
            <input className={inputClass} value={form.about_title_line1} onChange={(e) => update("about_title_line1", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Заголовок, выделенное слово</label>
            <input className={inputClass} value={form.about_title_highlight} onChange={(e) => update("about_title_highlight", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Описание компании</label>
            <textarea
              rows={3}
              className={`${inputClass} resize-none`}
              value={form.about_description}
              onChange={(e) => update("about_description", e.target.value)}
            />
          </div>
          <ImagePicker
            label="Фото"
            preview={aboutPreview}
            url={form.about_image}
            inputRef={aboutImgRef}
            onChange={(e) => handleFile("about_image_file", setAboutPreview, e)}
          />
        </div>
      </div>

      <div className="border-t border-white/10 pt-6">
        <p className="text-sm font-medium text-white/80 mb-3">Блок «Готовы сделать ремонт» (CTA)</p>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Надпись над заголовком</label>
            <input className={inputClass} value={form.cta_eyebrow} onChange={(e) => update("cta_eyebrow", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Заголовок, строка 1</label>
            <input className={inputClass} value={form.cta_title_line1} onChange={(e) => update("cta_title_line1", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Заголовок, выделенное слово</label>
            <input className={inputClass} value={form.cta_title_highlight} onChange={(e) => update("cta_title_highlight", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Описание</label>
            <textarea
              rows={2}
              className={`${inputClass} resize-none`}
              value={form.cta_description}
              onChange={(e) => update("cta_description", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}