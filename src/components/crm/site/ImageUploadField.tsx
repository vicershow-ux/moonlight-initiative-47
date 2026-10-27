import { ChangeEvent, useRef, useState } from "react"
import Icon from "@/components/ui/icon"
import { resizeImageToDataUrl } from "@/lib/imageUpload"

interface Props {
  label: string
  hint: string
  current: string
  fallback?: string
  maxSide?: number
  aspect?: string
  onPick: (dataUrl: string) => void
  onClear?: () => void
}

/** Выбор картинки: превью, «Загрузить» и «Убрать»; сжимаем в браузере перед отправкой */
export function ImageUploadField({ label, hint, current, fallback, maxSide = 1600, aspect = "aspect-[1200/630]", onPick, onClear }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState("")
  const shown = preview || current || fallback || ""

  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setError("")
    try {
      const data = await resizeImageToDataUrl(file, maxSide, 0.85)
      setPreview(data)
      onPick(data)
    } catch {
      setError("Не удалось прочитать изображение")
    }
  }

  return (
    <div>
      <label className="text-xs text-white/50 mb-1.5 block">{label}</label>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-start">
        <div className={`relative w-full sm:w-56 ${aspect} shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#111]`}>
          {shown ? (
            <img src={shown} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/20">
              <Icon name="Image" size={28} />
            </div>
          )}
          {!preview && !current && fallback && (
            <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white/70">сейчас по умолчанию</span>
          )}
          {preview && (
            <span className="absolute bottom-1.5 left-1.5 rounded bg-amber-500/90 px-1.5 py-0.5 text-[10px] text-black">не сохранено</span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={pick} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => ref.current?.click()}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs text-white hover:bg-white/15"
            >
              <Icon name="Upload" size={13} />
              {shown && (current || preview) ? "Заменить" : "Загрузить"}
            </button>
            {onClear && (current || preview) && (
              <button
                type="button"
                onClick={() => {
                  setPreview(null)
                  onClear()
                }}
                className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/60 hover:bg-white/10"
              >
                <Icon name="RotateCcw" size={13} />
                Вернуть стандартное
              </button>
            )}
          </div>
          <p className="text-[11px] leading-relaxed text-white/35">{hint}</p>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  )
}

export default ImageUploadField
