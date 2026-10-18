import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"

interface Props {
  photos: string[]
  index: number
  caption?: string
  onClose: () => void
}

export function PhotoLightbox({ photos, index, caption, onClose }: Props) {
  const [i, setI] = useState(index)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") setI((v) => (v + 1) % photos.length)
      if (e.key === "ArrowLeft") setI((v) => (v - 1 + photos.length) % photos.length)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [photos.length, onClose])

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white/70 hover:text-white" onClick={onClose} aria-label="Закрыть">
        <Icon name="X" size={28} />
      </button>
      <img
        src={photos[i]}
        alt=""
        className="max-w-full max-h-[80vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="mt-3 flex items-center gap-4 text-white/80 text-sm" onClick={(e) => e.stopPropagation()}>
        {photos.length > 1 && (
          <button onClick={() => setI((v) => (v - 1 + photos.length) % photos.length)} aria-label="Назад">
            <Icon name="ChevronLeft" size={24} />
          </button>
        )}
        <span>
          {i + 1} / {photos.length}
        </span>
        {photos.length > 1 && (
          <button onClick={() => setI((v) => (v + 1) % photos.length)} aria-label="Вперёд">
            <Icon name="ChevronRight" size={24} />
          </button>
        )}
        <a href={photos[i]} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center gap-1 hover:text-white">
          <Icon name="Download" size={16} />
          Открыть оригинал
        </a>
      </div>
      {caption && <p className="mt-2 text-white/60 text-sm max-w-xl text-center">{caption}</p>}
    </div>
  )
}

export default PhotoLightbox
