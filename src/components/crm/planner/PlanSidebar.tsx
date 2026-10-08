import Icon from "@/components/ui/icon"
import { DeleteButton } from "@/components/ui/delete-button"
import { fmtNum, fromMm, roomMetrics, toMm } from "@/lib/planner/geometry"
import { RoomWallsEditor } from "./RoomWallsEditor"
import { SelectedWallCard } from "./SelectedWallCard"
import { WallElevationsDialog } from "./WallElevationsDialog"
import { useState } from "react"
import {
  OPENING_PRESETS,
  PlanOpening,
  PlanRoom,
  PlanScheme,
  PlanTotals,
  ROOM_TYPES,
  WallProps,
} from "@/lib/planner/types"

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"

interface Props {
  scheme: PlanScheme
  totals: PlanTotals
  selectedRoom: PlanRoom | null
  selectedOpening: PlanOpening | null
  onUpdateRoom: (id: string, patch: Partial<PlanRoom>) => void
  onDeleteRoom: (id: string) => void
  onUpdateOpening: (id: string, patch: Partial<PlanOpening>) => void
  onDeleteOpening: (id: string) => void
  onSelectRoom: (id: string) => void
  onUpdateWall: (wallId: string, patch: Partial<WallProps>, applyToRoom?: boolean) => void
  onHoverWall?: (wallId: string | null) => void
  selectedWallId?: string | null
  onSelectWall?: (wallId: string | null) => void
}

export function PlanSidebar({
  scheme,
  totals,
  selectedRoom,
  selectedOpening,
  onUpdateRoom,
  onDeleteRoom,
  onUpdateOpening,
  onDeleteOpening,
  onSelectRoom,
  onUpdateWall,
  onHoverWall,
  selectedWallId = null,
  onSelectWall,
}: Props) {
  const metrics = selectedRoom ? roomMetrics(selectedRoom, scheme.openings) : null
  const [elev, setElev] = useState<{ roomId: string; wallId: string | null } | null>(null)

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-[#1f1f1f] p-4">
        <div className="mb-3 text-xs uppercase text-white/40">Итого по объекту</div>
        <div className="space-y-2 text-sm">
          {[
            ["Помещений", String(totals.rooms)],
            ["Пол / потолок", `${fmtNum(totals.floor, 2)} м²`],
            ["Периметр стен", `${fmtNum(totals.perimeter, 2)} м.п.`],
            ["Стены с проёмами", `${fmtNum(totals.wall, 2)} м²`],
            ["Проёмы", `${fmtNum(totals.openingsArea, 2)} м²`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3">
              <span className="text-white/40">{label}</span>
              <span>{value}</span>
            </div>
          ))}
          <div className="flex justify-between gap-3 border-t border-white/10 pt-2">
            <span className="text-white/40">Стены чисто</span>
            <span className="text-[#D4AF37]">{fmtNum(totals.wallNet, 2)} м²</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-white/40">Окна / двери</span>
            <span>
              {totals.windows} / {totals.doors}
            </span>
          </div>
        </div>
      </div>

      {elev && (
        <WallElevationsDialog
          open
          onOpenChange={(v) => !v && setElev(null)}
          scheme={scheme}
          roomId={elev.roomId}
          wallId={elev.wallId}
        />
      )}

      {selectedWallId && (
        <SelectedWallCard
          wallId={selectedWallId}
          scheme={scheme}
          onUpdateWall={onUpdateWall}
          onUpdateRoom={onUpdateRoom}
          onSelectRoom={onSelectRoom}
          onClose={() => onSelectWall?.(null)}
          onShowElevation={() => setElev({ roomId: selectedWallId.split(":")[0], wallId: selectedWallId })}
        />
      )}

      {selectedOpening && (
        <div className="rounded-xl border border-[#D4AF37]/30 bg-[#1f1f1f] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs uppercase text-white/40">
              {OPENING_PRESETS[selectedOpening.kind].label}
            </div>
            <DeleteButton onConfirm={() => onDeleteOpening(selectedOpening.id)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-white/50">Ширина, мм</label>
              <input
                className={inputCls}
                type="number"
                min="100"
                step="10"
                value={toMm(selectedOpening.width)}
                onChange={(e) =>
                  onUpdateOpening(selectedOpening.id, { width: fromMm(Number(e.target.value)) })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Высота, мм</label>
              <input
                className={inputCls}
                type="number"
                min="100"
                step="10"
                value={toMm(selectedOpening.height)}
                onChange={(e) =>
                  onUpdateOpening(selectedOpening.id, { height: fromMm(Number(e.target.value)) })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">От пола, мм</label>
              <input
                className={inputCls}
                type="number"
                min="0"
                step="10"
                value={toMm(selectedOpening.sill)}
                onChange={(e) =>
                  onUpdateOpening(selectedOpening.id, { sill: fromMm(Number(e.target.value)) })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">От угла, мм</label>
              <input
                className={inputCls}
                type="number"
                min="0"
                step="10"
                value={toMm(selectedOpening.offset)}
                onChange={(e) =>
                  onUpdateOpening(selectedOpening.id, { offset: fromMm(Number(e.target.value)) })
                }
              />
            </div>
          </div>
          <div className="mt-3 border-t border-white/10 pt-2 text-sm">
            <span className="text-white/40">Площадь: </span>
            {fmtNum(selectedOpening.width * selectedOpening.height, 2)} м²
          </div>
        </div>
      )}

      {selectedRoom && metrics && (
        <div className="rounded-xl border border-[#D4AF37]/30 bg-[#1f1f1f] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs uppercase text-white/40">Помещение</div>
            <DeleteButton onConfirm={() => onDeleteRoom(selectedRoom.id)} />
          </div>
          <div className="mb-3">
            <button
              onClick={() => setElev({ roomId: selectedRoom.id, wallId: null })}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#D4AF37]/15 px-3 py-2 text-sm text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/25"
            >
              <Icon name="Ruler" size={14} />
              Развёртки стен — где сверлить
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-white/50">Название</label>
              <input
                className={inputCls}
                value={selectedRoom.name}
                onChange={(e) => onUpdateRoom(selectedRoom.id, { name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-white/50">Тип</label>
                <select
                  className={inputCls}
                  value={selectedRoom.room_type}
                  onChange={(e) => onUpdateRoom(selectedRoom.id, { room_type: e.target.value })}
                >
                  <option value="">Не указан</option>
                  {ROOM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">Высота, мм</label>
                <input
                  className={inputCls}
                  type="number"
                  min="1000"
                  step="10"
                  value={toMm(selectedRoom.height)}
                  onChange={(e) =>
                    onUpdateRoom(selectedRoom.id, { height: fromMm(Number(e.target.value)) })
                  }
                />
              </div>
            </div>

            {/* Длина, толщина и материал каждой стены. Соседняя стена под прямым углом
                сдвигается вместе с концом, поэтому углы комнаты не ломаются */}
            <RoomWallsEditor
              room={selectedRoom}
              scheme={scheme}
              onUpdateRoom={onUpdateRoom}
              onUpdateWall={onUpdateWall}
              onHoverWall={onHoverWall}
            />
          </div>

          <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3 text-sm">
            {[
              ["Пол / потолок", `${fmtNum(metrics.area, 2)} м²`],
              ["Периметр", `${fmtNum(metrics.perimeter, 2)} м.п.`],
              ["Стены с проёмами", `${fmtNum(metrics.wallAreaGross, 2)} м²`],
              ["Вычет проёмов", `${fmtNum(metrics.openingsArea, 2)} м²`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3">
                <span className="text-white/40">{label}</span>
                <span>{value}</span>
              </div>
            ))}
            <div className="flex justify-between gap-3 border-t border-white/10 pt-1.5">
              <span className="text-white/40">Стены чисто</span>
              <span className="text-[#D4AF37]">{fmtNum(metrics.wallAreaNet, 2)} м²</span>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-[#1f1f1f] p-4">
        <div className="mb-3 text-xs uppercase text-white/40">
          Помещения ({scheme.rooms.length})
        </div>
        {scheme.rooms.length === 0 ? (
          <div className="text-sm text-white/30">
            Пока пусто — нарисуйте первое помещение
          </div>
        ) : (
          <div className="space-y-1.5">
            {scheme.rooms.map((room) => {
              const m = roomMetrics(room, scheme.openings)
              const active = selectedRoom?.id === room.id
              return (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    active ? "bg-[#D4AF37]/15 text-white" : "text-white/60 hover:bg-white/5"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {room.name}
                    {room.room_type && (
                      <span className="ml-1.5 text-xs text-white/30">{room.room_type}</span>
                    )}
                  </span>
                  <span className="shrink-0 text-xs text-white/40">
                    {fmtNum(m.area, 1)} м²
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-[#1f1f1f] p-4 text-xs text-white/40">
        <div className="mb-2 flex items-center gap-1.5 text-white/50">
          <Icon name="Info" size={13} />
          Как рисовать
        </div>
        <ul className="space-y-1">
          <li>Инструмент «Стены»: щёлкайте по углам комнаты</li>
          <li>Чтобы замкнуть — щёлкните по первой точке</li>
          <li>«Окно» и «Дверь»: щёлкните по нужной стене</li>
          <li>«Выбор»: тащите углы или введите длину стены в мм</li>
          <li>Колесо мыши — масштаб, правая кнопка — сдвиг</li>
        </ul>
      </div>
    </div>
  )
}

export default PlanSidebar