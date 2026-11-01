import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { fmtNum } from "@/lib/planner/geometry"
import { scaleRoomToArea, stickiestCorner } from "@/lib/planner/editRooms"
import type { PlanRoom, PlanScheme } from "@/lib/planner/types"

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"

interface Props {
  room: PlanRoom
  scheme: PlanScheme
  area: number
  onUpdateRoom: (id: string, patch: Partial<PlanRoom>) => void
}

/** Площадь по плану БТИ: сверка и подгонка контура пропорционально */
export function PlanAreaField({ room, scheme, area, onUpdateRoom }: Props) {
  const [text, setText] = useState(room.planArea ? String(room.planArea).replace(".", ",") : "")
  useEffect(() => {
    setText(room.planArea ? String(room.planArea).replace(".", ",") : "")
  }, [room.id, room.planArea])

  const apply = (raw: string) => {
    const v = Number(raw.replace(",", ".").trim())
    if (!raw.trim()) {
      onUpdateRoom(room.id, { planArea: undefined })
      return
    }
    if (!(v > 0.3 && v < 500)) return
    const pts = scaleRoomToArea(room, v, stickiestCorner(scheme, room))
    onUpdateRoom(room.id, pts ? { planArea: v, points: pts, fixedWalls: [] } : { planArea: v })
  }

  const diff = room.planArea ? area - room.planArea : 0
  const off = room.planArea ? Math.abs(diff) > Math.max(0.1, room.planArea * 0.02) : false

  return (
    <div>
      <label className="mb-1 block text-xs text-white/50">
        Площадь по плану, м²{room.planNo ? ` · № ${room.planNo} на плане` : ""}
      </label>
      <div className="flex gap-2">
        <input
          className={inputCls}
          inputMode="decimal"
          placeholder={fmtNum(area, 1)}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => apply(text)}
          onKeyDown={(e) => e.key === "Enter" && apply(text)}
        />
        {room.planArea && off && (
          <button
            onClick={() => apply(String(room.planArea))}
            className="flex shrink-0 items-center gap-1 rounded-lg bg-[#D4AF37]/15 px-3 text-xs text-[#D4AF37] hover:bg-[#D4AF37]/25"
            title="Подогнать контур под площадь по плану"
          >
            <Icon name="Scaling" size={13} />
            Подогнать
          </button>
        )}
      </div>
      <div className={`mt-1 text-[11px] ${off ? "text-amber-300" : "text-white/40"}`}>
        {room.planArea
          ? off
            ? `Нарисовано ${fmtNum(area, 2)} м² — расхождение ${diff > 0 ? "+" : ""}${fmtNum(diff, 2)} м²`
            : "Совпадает с планом"
          : "Введите площадь из БТИ — контур пропорционально подстроится под неё"}
      </div>
    </div>
  )
}
