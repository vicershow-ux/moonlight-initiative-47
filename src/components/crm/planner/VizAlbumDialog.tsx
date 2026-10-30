import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/AuthContext"
import { DrawingStamp, PlanScheme } from "@/lib/planner/types"
import { shrinkImage } from "./MaterialPicker"

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"
const labelCls = "mb-1 block text-xs text-white/50"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  scheme: PlanScheme
  objectCode: string
  address?: string
  onStamp: (s: DrawingStamp) => void
  /** Загрузка картинки в хранилище — для логотипа и автоснимков */
  upload: (dataUrl: string) => Promise<string>
}

type Shot = { id: string; roomId: string; url: string; on: boolean; auto: boolean }

/** Альбом визуализаций: крупные кадры 3D по комнатам на листах A4 со штампом */
export function VizAlbumDialog({ open, onOpenChange, scheme, objectCode, address, onStamp, upload }: Props) {
  const { user } = useAuth()
  const [st, setSt] = useState<DrawingStamp>(() => ({
    project: scheme.stamp?.project || "Дизайн-проект квартиры",
    address: scheme.stamp?.address || address || "",
    author: scheme.stamp?.author || user?.full_name || "",
    contacts: scheme.stamp?.contacts || [user?.email].filter(Boolean).join("\n"),
    scale: scheme.stamp?.scale || "—",
    date: scheme.stamp?.date || "",
    logoUrl: scheme.stamp?.logoUrl || "",
  }))
  const [shots, setShots] = useState<Shot[]>([])
  const [pair, setPair] = useState(false)
  const [busy, setBusy] = useState("")
  const [err, setErr] = useState("")

  useEffect(() => {
    if (!open) return
    setShots(
      scheme.rooms.flatMap((r) => (scheme.renders?.[r.id] || []).map((x) => ({ id: x.id, roomId: r.id, url: x.url, on: true, auto: false }))),
    )
    setErr("")
  }, [open, scheme])

  const set = (p: Partial<DrawingStamp>) => setSt((s) => ({ ...s, ...p }))
  const roomsWithout = scheme.rooms.filter((r) => r.points.length > 2 && !shots.some((s) => s.roomId === r.id))

  const autoShots = async (roomIds: string[]) => {
    setBusy("Снимаю комнаты в 3D…")
    setErr("")
    try {
      const { renderRoomViews } = await import("@/lib/planner/room3d")
      for (const rid of roomIds) {
        const room = scheme.rooms.find((r) => r.id === rid)
        if (!room) continue
        setBusy(`Снимаю «${room.name}»…`)
        const views = await renderRoomViews(scheme, room, { count: 2 })
        if (!views.length) throw new Error("Браузер не поддерживает 3D (WebGL)")
        const urls = await Promise.all(views.map((v) => upload(v)))
        setShots((l) => [...l, ...urls.map((u, i) => ({ id: `a-${rid}-${i}-${l.length}`, roomId: rid, url: u, on: true, auto: true }))])
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Не удалось снять 3D")
    } finally {
      setBusy("")
    }
  }

  const onLogo = async (f: File | undefined) => {
    if (!f) return
    setBusy("Загружаю логотип…")
    try {
      const r = await shrinkImage(f)
      set({ logoUrl: await upload(r.data) })
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Не удалось загрузить логотип")
    } finally {
      setBusy("")
    }
  }

  const build = async () => {
    const chosen = shots.filter((s) => s.on)
    if (!chosen.length) return setErr("Выберите хотя бы один кадр или снимите комнаты")
    onStamp(st)
    setBusy("Собираю PDF…")
    setErr("")
    try {
      const { downloadVizAlbum } = await import("@/lib/planner/vizAlbum")
      const sheets = scheme.rooms.flatMap((r) => {
        const list = chosen.filter((s) => s.roomId === r.id)
        const title = (n?: number) => `Визуализация ${r.name}${n ? `, вид ${n}` : ""}`
        if (pair && list.length > 1) {
          const out = []
          for (let i = 0; i < list.length; i += 2) out.push({ room: r, images: list.slice(i, i + 2).map((x) => x.url), title: title(list.length > 2 ? i / 2 + 1 : undefined) })
          return out
        }
        return list.map((x, i) => ({ room: r, images: [x.url], title: title(list.length > 1 ? i + 1 : undefined) }))
      })
      await downloadVizAlbum(sheets, st, `Визуализации ${objectCode}.pdf`)
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Не удалось собрать PDF")
    } finally {
      setBusy("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto border-white/10 bg-[#1a1a1a] text-white">
        <DialogHeader>
          <DialogTitle>Альбом визуализаций — PDF со штампом</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <div className="text-xs uppercase text-white/40">Кадры по комнатам</div>
              {roomsWithout.length > 0 && (
                <button
                  onClick={() => autoShots(roomsWithout.map((r) => r.id))}
                  disabled={!!busy}
                  className="ml-auto flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs hover:bg-white/15 disabled:opacity-50"
                >
                  <Icon name="Camera" size={14} />
                  Снять комнаты без кадров ({roomsWithout.length})
                </button>
              )}
            </div>
            {scheme.rooms
              .filter((r) => r.points.length > 2)
              .map((r) => {
                const list = shots.filter((s) => s.roomId === r.id)
                return (
                  <div key={r.id} className="mb-3 rounded-lg border border-white/10 bg-[#161616] p-2.5">
                    <div className="mb-2 flex items-center gap-2 text-sm">
                      <b>{r.name}</b>
                      <span className="text-xs text-white/40">{list.filter((s) => s.on).length} в альбоме</span>
                      <button onClick={() => autoShots([r.id])} disabled={!!busy} className="ml-auto flex items-center gap-1 text-xs text-[#D4AF37] hover:underline disabled:opacity-50">
                        <Icon name="Camera" size={13} />
                        {list.length ? "Ещё 2 вида" : "Снять 2 вида"}
                      </button>
                    </div>
                    {list.length ? (
                      <div className="grid grid-cols-3 gap-1.5">
                        {list.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setShots((l) => l.map((x) => (x.id === s.id ? { ...x, on: !x.on } : x)))}
                            className={`relative overflow-hidden rounded-md border-2 ${s.on ? "border-[#D4AF37]" : "border-transparent opacity-40"}`}
                          >
                            <img src={s.url} alt="" className="aspect-[16/10] w-full object-cover" />
                            {s.on && (
                              <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#D4AF37] text-[#161616]">
                                <Icon name="Check" size={12} />
                              </span>
                            )}
                            {s.auto && <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[10px]">авто</span>}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-white/40">Нет снимков — снимите автоматически или сохраните вид в окне 3D</div>
                    )}
                  </div>
                )
              })}
            <label className="mt-1 flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" checked={pair} onChange={(e) => setPair(e.target.checked)} />
              Ставить по два кадра на лист рядом
            </label>
          </div>

          <div className="space-y-2.5">
            <div className="text-xs uppercase text-white/40">Штамп</div>
            <div>
              <label className={labelCls}>Наименование проекта</label>
              <input className={inputCls} value={st.project} onChange={(e) => set({ project: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Адрес объекта</label>
              <input className={inputCls} value={st.address} onChange={(e) => set({ address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>Масштаб</label>
                <input className={inputCls} value={st.scale} onChange={(e) => set({ scale: e.target.value })} placeholder="—" />
              </div>
              <div>
                <label className={labelCls}>Дата</label>
                <input className={inputCls} value={st.date} onChange={(e) => set({ date: e.target.value })} placeholder="сегодня" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Выполнил</label>
              <input className={inputCls} value={st.author} onChange={(e) => set({ author: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Контакты / эл. почта</label>
              <textarea className={`${inputCls} min-h-[64px]`} value={st.contacts} onChange={(e) => set({ contacts: e.target.value })} placeholder={"ул. Шеронова 103\n8-924-000-00-00\nmail@studio.ru"} />
            </div>
            <div>
              <label className={labelCls}>Логотип студии</label>
              <div className="flex items-center gap-2">
                <label className="flex h-14 flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-white/20 bg-white hover:border-[#D4AF37]/60">
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => onLogo(e.target.files?.[0])} />
                  {st.logoUrl ? <img src={st.logoUrl} alt="" className="max-h-12 max-w-full object-contain" /> : <span className="text-xs text-black/50">Загрузить PNG/JPG</span>}
                </label>
                {st.logoUrl && (
                  <button onClick={() => set({ logoUrl: "" })} className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/50 hover:text-red-300" title="Убрать">
                    <Icon name="X" size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {err && <div className="text-sm text-red-300">{err}</div>}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-white/45">A4 альбомный · {shots.filter((s) => s.on).length} кадров · штамп сохранится в плане</span>
          <button
            onClick={build}
            disabled={!!busy}
            className="ml-auto flex min-h-[44px] items-center gap-2 rounded-lg bg-[#D4AF37] px-5 text-sm text-[#161616] hover:bg-[#B8860B] disabled:opacity-50"
          >
            <Icon name={busy ? "Loader2" : "FileDown"} size={16} className={busy ? "animate-spin" : ""} />
            {busy || "Скачать альбом PDF"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default VizAlbumDialog
