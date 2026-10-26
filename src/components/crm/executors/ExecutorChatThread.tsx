import { useCallback, useEffect, useRef, useState } from "react"
import Icon from "@/components/ui/icon"
import { preparePhoto, PreparedPhoto } from "@/lib/photoPrep"
import { ExecutorMessage } from "@/lib/executorsApi"
import { PhotoLightbox } from "@/components/crm/object-detail/PhotoLightbox"

const timeLabel = (d: string) => {
  const dt = new Date(d)
  const today = new Date().toDateString() === dt.toDateString()
  return dt.toLocaleString("ru-RU", today ? { hour: "2-digit", minute: "2-digit" } : { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
}

interface Props {
  /** Чья это сторона: сообщения этого автора показываются как «мои» */
  me: "executor" | "company"
  load: (after: number) => Promise<{ messages: ExecutorMessage[] }>
  send: (body: string, photos: PreparedPhoto[]) => Promise<unknown>
  emptyText: string
  height?: string
  threadKey: string
}

/** Переписка исполнителя и компании по объекту: текст и фото, обновляется сама */
export function ExecutorChatThread({ me, load, send, emptyText, height = "h-[380px]", threadKey }: Props) {
  const [messages, setMessages] = useState<ExecutorMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState("")
  const [photos, setPhotos] = useState<PreparedPhoto[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [view, setView] = useState<{ list: string[]; index: number } | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const lastId = useRef(0)
  const loadRef = useRef(load)
  loadRef.current = load

  const scrollDown = () => requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }))

  const fetchNew = useCallback(async () => {
    const { messages: fresh } = await loadRef.current(lastId.current)
    if (fresh.length) {
      lastId.current = fresh[fresh.length - 1].id
      setMessages((prev) => {
        const ids = new Set(prev.map((m) => m.id))
        return [...prev, ...fresh.filter((m) => !ids.has(m.id))]
      })
      scrollDown()
    }
  }, [])

  useEffect(() => {
    lastId.current = 0
    setMessages([])
    setLoading(true)
    fetchNew()
      .catch(() => setError("Не удалось загрузить переписку"))
      .finally(() => setLoading(false))
    const t = setInterval(() => {
      if (document.visibilityState === "visible") fetchNew().catch(() => {})
    }, 12000)
    return () => clearInterval(t)
  }, [threadKey, fetchNew])

  const pick = async (files: FileList | null) => {
    if (!files) return
    setError("")
    const list = Array.from(files).filter((f) => f.type.startsWith("image/") || /\.heic$/i.test(f.name)).slice(0, 6 - photos.length)
    try {
      const prepared = await Promise.all(list.map((f) => preparePhoto(f)))
      setPhotos((p) => [...p, ...prepared])
    } catch {
      setError("Не удалось прочитать фото")
    }
    if (fileRef.current) fileRef.current.value = ""
  }

  const submit = async () => {
    if (!text.trim() && !photos.length) return
    setSending(true)
    setError("")
    try {
      await send(text.trim(), photos)
      setText("")
      setPhotos([])
      await fetchNew()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось отправить")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col">
      <div ref={listRef} className={`${height} overflow-y-auto px-3 sm:px-4 py-4 flex flex-col gap-3`}>
        {loading ? (
          <div className="m-auto">
            <Icon name="Loader2" size={20} className="animate-spin text-white/40" />
          </div>
        ) : messages.length === 0 ? (
          <p className="m-auto text-sm text-white/30 text-center max-w-xs">{emptyText}</p>
        ) : (
          messages.map((m) => {
            const mine = m.author === me
            return (
              <div key={m.id} className={`flex flex-col max-w-[85%] ${mine ? "self-end items-end" : "self-start items-start"}`}>
                {!mine && <p className="text-[11px] text-white/40 mb-1 px-1">{m.author_name}</p>}
                <div className={`rounded-2xl px-3.5 py-2.5 text-sm ${mine ? "bg-[#D4AF37] text-[#161616] rounded-br-md" : "bg-[#2a2a2a] text-white rounded-bl-md"}`}>
                  {m.photos?.length > 0 && (
                    <div className={`grid gap-1.5 ${m.body ? "mb-2" : ""} ${m.photos.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                      {m.photos.map((src, i) => (
                        <button key={src} onClick={() => setView({ list: m.photos, index: i })} className="block">
                          <img src={src} alt="" loading="lazy" className="w-full max-w-[240px] aspect-square object-cover rounded-lg" />
                        </button>
                      ))}
                    </div>
                  )}
                  {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                </div>
                <p className="text-[10px] text-white/30 mt-1 px-1">{timeLabel(m.created_at)}</p>
              </div>
            )
          })
        )}
      </div>

      <div className="border-t border-white/10 p-3">
        {photos.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {photos.map((p, i) => (
              <div key={i} className="relative">
                <img src={p.data} alt="" className="w-14 h-14 object-cover rounded-lg" />
                <button
                  onClick={() => setPhotos((list) => list.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black text-white flex items-center justify-center"
                  aria-label="Убрать"
                >
                  <Icon name="X" size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
        <div className="flex items-end gap-2">
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => pick(e.target.files)} />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-11 h-11 shrink-0 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center"
            title="Приложить фото"
            aria-label="Приложить фото"
          >
            <Icon name="Camera" size={18} />
          </button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && window.matchMedia("(min-width: 640px)").matches) {
                e.preventDefault()
                submit()
              }
            }}
            rows={1}
            placeholder="Написать сообщение…"
            className="flex-1 resize-none max-h-32 bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-base sm:text-sm outline-none focus:border-[#D4AF37]/50"
          />
          <button
            onClick={submit}
            disabled={sending || (!text.trim() && !photos.length)}
            className="w-11 h-11 shrink-0 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] text-[#161616] flex items-center justify-center disabled:opacity-50"
            aria-label="Отправить"
          >
            <Icon name={sending ? "Loader2" : "Send"} size={17} className={sending ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {view && <PhotoLightbox photos={view.list} index={view.index} onClose={() => setView(null)} />}
    </div>
  )
}

export default ExecutorChatThread
