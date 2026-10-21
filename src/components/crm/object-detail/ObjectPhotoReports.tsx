import { useEffect, useMemo, useRef, useState } from "react"
import Icon from "@/components/ui/icon"
import { objectHubApi, PhotoReport } from "@/lib/api"
import { preparePhoto, PreparedPhoto } from "@/lib/photoPrep"
import { DeleteButton } from "@/components/ui/delete-button"
import { PhotoLightbox } from "./PhotoLightbox"

const STAGES = [
  "Демонтаж",
  "Электрика",
  "Сантехника",
  "Стяжка и штукатурка",
  "Плитка",
  "Малярные работы",
  "Полы",
  "Потолки",
  "Чистовая отделка",
  "Сдача объекта",
]

const dateLabel = (d: string) =>
  new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })

export function ObjectPhotoReports({ objectId, isClient }: { objectId: number; isClient: boolean }) {
  const [reports, setReports] = useState<PhotoReport[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [stage, setStage] = useState("")
  const [caption, setCaption] = useState("")
  const [photos, setPhotos] = useState<PreparedPhoto[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("")
  const [view, setView] = useState<{ list: string[]; index: number; caption?: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = () => {
    objectHubApi
      .reports(objectId)
      .then((d) => setReports(d.reports || []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false))
  }

  useEffect(load, [objectId])

  const stagesUsed = useMemo(() => Array.from(new Set(reports.map((r) => r.stage))), [reports])
  const shown = filter ? reports.filter((r) => r.stage === filter) : reports

  const pick = async (files: FileList | null) => {
    if (!files) return
    const list = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, 10 - photos.length)
    try {
      const prepared = await Promise.all(list.map((f) => preparePhoto(f)))
      setPhotos((p) => [...p, ...prepared])
    } catch {
      setError("Не удалось прочитать фото")
    }
    if (fileRef.current) fileRef.current.value = ""
  }

  const reset = () => {
    setAdding(false)
    setStage("")
    setCaption("")
    setPhotos([])
    setError("")
  }

  const save = async () => {
    setError("")
    if (!stage.trim()) return setError("Укажите этап")
    if (!photos.length) return setError("Приложите фото")
    setSaving(true)
    try {
      await objectHubApi.addReport(objectId, { stage: stage.trim(), caption: caption.trim(), photos })
      reset()
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: number) => {
    await objectHubApi.removeReport(id)
    setReports((r) => r.filter((x) => x.id !== id))
  }

  return (
    <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="font-medium flex items-center gap-2">
          <Icon name="Camera" size={17} className="text-[#D4AF37]" />
          Фотоотчёты по этапам
        </p>
        {!isClient && !adding && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] px-3.5 py-2 text-sm font-medium text-[#161616]"
          >
            <Icon name="Plus" size={16} />
            Добавить отчёт
          </button>
        )}
      </div>

      {adding && (
        <div className="rounded-lg border border-white/10 bg-[#161616] p-4 mb-4 flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {STAGES.map((s) => (
              <button
                key={s}
                onClick={() => setStage(s)}
                className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                  stage === s ? "bg-[#D4AF37] text-[#161616] border-[#D4AF37]" : "border-white/15 text-white/70 hover:border-white/40"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <input
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            placeholder="Этап (выберите выше или впишите свой)"
            className="bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
          />
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={2}
            placeholder="Подпись: что сделано, что дальше"
            className="bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 resize-none"
          />
          <div className="flex flex-wrap gap-2">
            {photos.map((p, i) => (
              <div key={i} className="relative">
                <img src={p.data} alt="" className="w-20 h-20 object-cover rounded-lg" />
                <button
                  onClick={() => setPhotos((list) => list.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black text-white flex items-center justify-center"
                  aria-label="Убрать"
                >
                  <Icon name="X" size={12} />
                </button>
              </div>
            ))}
            {photos.length < 10 && (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-20 h-20 rounded-lg border border-dashed border-white/20 hover:border-[#D4AF37] flex flex-col items-center justify-center text-white/50 text-[11px] gap-1"
              >
                <Icon name="ImagePlus" size={20} />
                Фото
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => pick(e.target.files)} />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] px-4 py-2 text-sm font-medium text-[#161616] disabled:opacity-60"
            >
              {saving && <Icon name="Loader2" size={15} className="animate-spin" />}
              Опубликовать
            </button>
            <button onClick={reset} className="rounded-lg bg-white/5 hover:bg-white/10 px-4 py-2 text-sm">
              Отмена
            </button>
          </div>
        </div>
      )}

      {stagesUsed.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            onClick={() => setFilter("")}
            className={`px-2.5 py-1 rounded-full text-xs ${!filter ? "bg-white/15 text-white" : "text-white/50 hover:text-white"}`}
          >
            Все этапы
          </button>
          {stagesUsed.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-2.5 py-1 rounded-full text-xs ${filter === s ? "bg-white/15 text-white" : "text-white/50 hover:text-white"}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Icon name="Loader2" size={20} className="animate-spin text-white/40" />
        </div>
      ) : shown.length === 0 ? (
        <p className="text-center py-8 text-white/30 text-sm">
          {isClient ? "Фотоотчёты появятся здесь по ходу ремонта" : "Отчётов пока нет — добавьте первый"}
        </p>
      ) : (
        <div className="relative pl-5 flex flex-col gap-6 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
          {shown.map((r) => (
            <div key={r.id} className="relative">
              <span className="absolute -left-[18px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full text-xs bg-[#D4AF37]/15 text-[#D4AF37]">{r.stage}</span>
                <span className="text-xs text-white/40">
                  {dateLabel(r.created_at)} · {r.author_name}
                </span>
                {!isClient && (
                  <span className="ml-auto">
                    <DeleteButton onConfirm={() => remove(r.id)} />
                  </span>
                )}
              </div>
              {r.caption && <p className="text-sm text-white/80 mb-2 whitespace-pre-wrap">{r.caption}</p>}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {r.photos.map((src, i) => (
                  <button key={src} onClick={() => setView({ list: r.photos, index: i, caption: r.caption })}>
                    <img src={src} alt={r.stage} loading="lazy" className="w-full aspect-square object-cover rounded-lg hover:opacity-90" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view && <PhotoLightbox photos={view.list} index={view.index} caption={view.caption} onClose={() => setView(null)} />}
    </div>
  )
}

export default ObjectPhotoReports
