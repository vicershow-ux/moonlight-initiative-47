import { useState } from "react"
import Icon from "@/components/ui/icon"
import { fmtNum, fromMm, toMm } from "@/lib/planner/geometry"
import {
  CEILING_FINISHES,
  CeilingFinish,
  FLOOR_FINISHES,
  FloorFinish,
  PlanRoom,
  PlanScheme,
  RoomFinish,
  WALL_FINISHES,
  WallFinish,
} from "@/lib/planner/types"
import { finishCalc } from "@/lib/planner/finishes"

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"
const labelCls = "mb-1.5 block text-xs text-white/50"

interface Props {
  room: PlanRoom
  scheme: PlanScheme
  onUpdate: (roomId: string, patch: Partial<RoomFinish>, applyToAll?: boolean) => void
}

/** Отделка помещения: пол, стены, потолок, плинтусы, черновые работы и расчёт объёмов */
export function RoomFinishCard({ room, scheme, onUpdate }: Props) {
  const c = finishCalc(scheme, room)
  const f = c.finish
  const [all, setAll] = useState(false)
  const set = (patch: Partial<RoomFinish>) => onUpdate(room.id, patch, all)
  const mm = (v: number | undefined) => toMm(v || 0)

  return (
    <div className="rounded-xl border border-[#D4AF37]/30 bg-[#1f1f1f] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon name="Paintbrush" size={15} />
          Отделка · {room.name}
        </div>
        <label className="flex items-center gap-1.5 text-xs text-white/50">
          <input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} />
          на все помещения
        </label>
      </div>

      <div className="mb-3">
        <label className={labelCls}>Пол</label>
        <div className="flex gap-2">
          <select className={inputCls} value={f.floor} onChange={(e) => set({ floor: e.target.value as FloorFinish })}>
            {(Object.keys(FLOOR_FINISHES) as FloorFinish[]).map((k) => (
              <option key={k} value={k}>
                {FLOOR_FINISHES[k].label}
              </option>
            ))}
          </select>
          {f.floor !== "none" && (
            <input
              type="color"
              className="h-[38px] w-11 shrink-0 cursor-pointer rounded-lg border border-white/10 bg-[#161616]"
              value={f.floorColor || FLOOR_FINISHES[f.floor].color}
              onChange={(e) => set({ floorColor: e.target.value })}
              title="Цвет покрытия на плане"
            />
          )}
        </div>
      </div>

      <div className="mb-3">
        <label className={labelCls}>Стены</label>
        <div className="flex gap-2">
          <select className={inputCls} value={f.wall} onChange={(e) => set({ wall: e.target.value as WallFinish })}>
            {(Object.keys(WALL_FINISHES) as WallFinish[]).map((k) => (
              <option key={k} value={k}>
                {WALL_FINISHES[k].label}
              </option>
            ))}
          </select>
          {f.wall !== "none" && (
            <input
              type="color"
              className="h-[38px] w-11 shrink-0 cursor-pointer rounded-lg border border-white/10 bg-[#161616]"
              value={f.wallColor || WALL_FINISHES[f.wall].color}
              onChange={(e) => set({ wallColor: e.target.value })}
              title="Цвет стен на плане"
            />
          )}
        </div>
      </div>

      {f.wall === "wallpaper" && (
        <div className="mb-3 grid grid-cols-3 gap-2">
          <div>
            <label className={labelCls}>Ширина рулона</label>
            <input className={inputCls} type="number" step="10" value={mm(f.rollWidth)} onChange={(e) => set({ rollWidth: Math.max(fromMm(Number(e.target.value)), 0.3) })} />
          </div>
          <div>
            <label className={labelCls}>Длина рулона</label>
            <input className={inputCls} type="number" step="10" value={mm(f.rollLength)} onChange={(e) => set({ rollLength: Math.max(fromMm(Number(e.target.value)), 1) })} />
          </div>
          <div>
            <label className={labelCls}>Раппорт</label>
            <input className={inputCls} type="number" step="10" min="0" value={mm(f.rapport)} onChange={(e) => set({ rapport: Math.max(fromMm(Number(e.target.value)), 0) })} />
          </div>
        </div>
      )}
      {(f.wall === "paint" || f.ceiling === "paint" || f.ceiling === "gkl") && (
        <div className="mb-3">
          <label className={labelCls}>Слоёв краски</label>
          <input className={inputCls} type="number" min="1" max="4" value={f.paintCoats || 2} onChange={(e) => set({ paintCoats: Math.min(Math.max(Number(e.target.value) || 1, 1), 4) })} />
        </div>
      )}
      {f.wall !== "tile" && (
        <div className="mb-3">
          <label className={labelCls}>Плитка на стенах до высоты, мм (фартук, панель; 0 — нет)</label>
          <input className={inputCls} type="number" min="0" step="50" value={mm(f.tileHeight)} onChange={(e) => set({ tileHeight: Math.max(fromMm(Number(e.target.value)), 0) })} />
        </div>
      )}

      <div className="mb-3">
        <label className={labelCls}>Потолок</label>
        <select className={inputCls} value={f.ceiling} onChange={(e) => set({ ceiling: e.target.value as CeilingFinish })}>
          {(Object.keys(CEILING_FINISHES) as CeilingFinish[]).map((k) => (
            <option key={k} value={k}>
              {CEILING_FINISHES[k].label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-white/70">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={f.skirting} onChange={(e) => set({ skirting: e.target.checked })} />
          Плинтус напольный
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={f.cornice} onChange={(e) => set({ cornice: e.target.checked })} />
          Потолочный плинтус
        </label>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Стяжка пола, мм (0 — нет)</label>
          <input className={inputCls} type="number" min="0" step="5" value={mm(f.screed)} onChange={(e) => set({ screed: Math.max(fromMm(Number(e.target.value)), 0) })} />
        </div>
        <div>
          <label className={labelCls}>Штукатурка стен, мм (0 — нет)</label>
          <input className={inputCls} type="number" min="0" step="5" value={mm(f.wallPlaster)} onChange={(e) => set({ wallPlaster: Math.max(fromMm(Number(e.target.value)), 0) })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          ["Пол", `${fmtNum(c.floorArea, 2)} м²`],
          ["Стены без проёмов", `${fmtNum(c.wallNet, 2)} м²`],
          ...(c.wallTile > 0 ? [["Плитка на стенах", `${fmtNum(c.wallTile, 2)} м²`]] : []),
          ...(f.wall === "wallpaper" ? [["Обои", `${c.rolls} рул. (${c.stripsPerRoll} полос/рул.)`]] : []),
          ...(c.paintWall > 0 ? [["Краска стен", `${fmtNum(c.paintWall, 1)} л`]] : []),
          ...(c.paintCeiling > 0 ? [["Краска потолка", `${fmtNum(c.paintCeiling, 1)} л`]] : []),
          ...(c.skirting > 0 ? [["Плинтус", `${fmtNum(c.skirting, 2)} м (без дверей)`]] : []),
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-[#161616] p-2">
            <div className="text-white/40">{k}</div>
            <div className="font-semibold">{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RoomFinishCard
