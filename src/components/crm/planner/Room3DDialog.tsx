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
}

/** Объёмный вид комнаты для заказчика: отделка, мебель, свет. Можно сохранить картинку */
export function Room3DDialog({ open, onOpenChange, scheme, roomId }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const view = useRef<Room3D | null>(null)
  const [error, setError] = useState("")
  const room = scheme.rooms.find((r) => r.id === roomId)

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
        view.current = mountRoom3D(el, scheme, room)
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
  }, [open, room, scheme])

  const save = () => {
    const url = view.current?.snapshot()
    if (!url || !room) return
    const a = document.createElement("a")
    a.href = url
    a.download = `${room.name} — 3D.png`
    a.click()
  }

  if (!room) return null
  const sum = finishSummary(roomFinish(scheme, room.id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl border-white/10 bg-[#1a1a1a] text-white">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-3 pr-6">
            <span>{room.name} — 3D</span>
            {sum && <span className="text-xs font-normal text-white/45">{sum}</span>}
          </DialogTitle>
        </DialogHeader>
        <div ref={ref} className="relative h-[62vh] min-h-[360px] w-full overflow-hidden rounded-lg bg-[#1b1b1b]">
          {error && <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-red-300">{error}</div>}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/45">
          <span>Мышь — облёт комнаты, колесо — приближение, правая кнопка или Shift — сдвиг. Ближние стены скрываются, чтобы было видно комнату</span>
          <button onClick={save} className="flex min-h-[38px] items-center gap-2 rounded-lg bg-[#D4AF37] px-4 text-sm text-[#161616] hover:bg-[#B8860B]">
            <Icon name="ImageDown" size={15} />
            Сохранить картинку
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Room3DDialog
