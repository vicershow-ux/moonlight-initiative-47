import { useEffect, useRef, useState } from "react"
import Icon from "@/components/ui/icon"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PlanScheme } from "@/lib/planner/types"
import { finishSummary } from "@/lib/planner/finishes"
import { roomFinish } from "@/lib/planner/types"
import type { Room3D } from "@/lib/planner/room3d"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  scheme: PlanScheme
  roomId: string
  onAddRender?: (roomId: string, dataUrl: string) => Promise<void>
  onDeleteRender?: (roomId: string, renderId: string) => void
}

/** Объёмный вид комнаты для заказчика: отделка, мебель, свет. Можно сохранить картинку */
export function Room3DDialog({ open, onOpenChange, scheme, roomId, onAddRender, onDeleteRender }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const view = useRef<Room3D | null>(null)
  const [error, setError] = useState("")
  const [adding, setAdding] = useState(false)
  const [mode, setMode] = useState<"orbit" | "inside">("orbit")
  const [note, setNote] = useState("")
  const room = scheme.rooms.find((r) => r.id === roomId)

  // Сцену строим по схеме на момент открытия: сохранение снимка меняет схему, но комнату не пересобираем
  const sceneScheme = useRef(scheme)
  if (!view.current) sceneScheme.current = scheme
  useEffect(() => {
    if (!open || !room) return
    let alive = true
    // Ждём, пока диалог получит размеры, и грузим 3D-движок только по требованию
    const t = setTimeout(async () => {
      const el = ref.current
      if (!el) return
      try {
        const { mountRoom3D } = await import("@/lib/planner/room3d")
        if (!alive) return
        view.current = mountRoom3D(el, sceneScheme.current, room)
        setMode("orbit")
      } catch (e) {
        setError(e instanceof Error ? e.message : "Не удалось открыть 3D — браузер не поддерживает WebGL")
      }
    }, 60)
    return () => {
      alive = false
      clearTimeout(t)
      view.current?.dispose()
      view.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, roomId])

  const save = () => {
    const url = view.current?.snapshot()
    if (!url || !room) return
    const a = document.createElement("a")
    a.href = url
    a.download = `${room.name} — 3D.png`
    a.click()
  }

  const addToPdf = async () => {
    const url = view.current?.snapshot("jpeg")
    if (!url || !onAddRender) return
    setAdding(true)
    setNote("")
    try {
      await onAddRender(roomId, url)
      setNote("Вид добавлен в PDF — не забудьте сохранить план")
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Не удалось сохранить картинку")
    } finally {
      setAdding(false)
    }
  }

  if (!room) return null
  const sum = finishSummary(roomFinish(scheme, room.id))
  const renders = scheme.renders?.[room.id] || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl border-white/10 bg-[#1a1a1a] text-white">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-3 pr-6">
            <span>{room.name} — 3D</span>
            {sum && <span className="text-xs font-normal text-white/45">{sum}</span>}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ["orbit", "Сверху / облёт", "Rotate3d"],
              ["inside", "Изнутри комнаты", "Eye"],
            ] as const
          ).map(([m, label, icon]) => (
            <button
              key={m}
              onClick={() => {
                setMode(m)
                view.current?.setMode(m)
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                mode === m ? "bg-white text-[#161616]" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              <Icon name={icon} size={14} />
              {label}
            </button>
          ))}
        </div>
        <div ref={ref} className="relative h-[62vh] min-h-[360px] w-full overflow-hidden rounded-lg bg-[#1b1b1b]">
          {error && <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-red-300">{error}</div>}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/45">
          <span>
            {mode === "inside"
              ? "Мышь — осмотреться, W/A/S/D или стрелки — шаг по комнате, колесо — шире обзор, правая кнопка — перейти"
              : "Мышь — облёт комнаты, колесо — приближение, правая кнопка или Shift — сдвиг. Ближние стены скрываются"}
          </span>
          <div className="flex flex-wrap gap-2">
            <button onClick={save} className="flex min-h-[38px] items-center gap-2 rounded-lg bg-white/5 px-4 text-sm text-white/70 hover:bg-white/10">
              <Icon name="ImageDown" size={15} />
              Скачать PNG
            </button>
            {onAddRender && (
              <button
                onClick={addToPdf}
                disabled={adding || !!error}
                className="flex min-h-[38px] items-center gap-2 rounded-lg bg-[#D4AF37] px-4 text-sm text-[#161616] hover:bg-[#B8860B] disabled:opacity-50"
              >
                <Icon name={adding ? "Loader2" : "FilePlus2"} size={15} className={adding ? "animate-spin" : ""} />
                Добавить этот вид в PDF
              </button>
            )}
          </div>
        </div>
        {(renders.length > 0 || note) && (
          <div className="space-y-2">
            {note && <div className="text-xs text-[#D4AF37]">{note}</div>}
            {renders.length > 0 && (
              <>
                <div className="text-xs text-white/45">В PDF на листе «Мебель и отделка» — {renders.length} из 3 видов:</div>
                <div className="flex flex-wrap gap-2">
                  {renders.map((r) => (
                    <div key={r.id} className="group relative h-20 w-32 overflow-hidden rounded-md border border-white/10">
                      <img src={r.url} alt="" className="h-full w-full object-cover" />
                      {onDeleteRender && (
                        <button
                          onClick={() => onDeleteRender(room.id, r.id)}
                          title="Убрать из PDF"
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded bg-black/70 text-white/80 opacity-0 transition-opacity hover:text-red-300 group-hover:opacity-100"
                        >
                          <Icon name="X" size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default Room3DDialog
