import { useState } from "react"
import Icon from "@/components/ui/icon"
import { Room3DDialog } from "./Room3DDialog"
import { fmtNum } from "@/lib/planner/geometry"
import { FURNITURE_PRESETS, PlanFurniture, PlanHeating, PlanRoom, PlanScheme, RoomFinish } from "@/lib/planner/types"
import { heatingCalc, interiorWarnings } from "@/lib/planner/interior"
import { finishSummary } from "@/lib/planner/finishes"
import { roomFinish } from "@/lib/planner/types"
import { RoomFinishCard } from "./RoomFinishCard"
import { SelectedFurnitureCard } from "./SelectedFurnitureCard"
import { SelectedHeatingCard } from "./SelectedHeatingCard"

interface Props {
  scheme: PlanScheme
  selectedRoom: PlanRoom | null
  selectedFurniture: PlanFurniture | null
  selectedHeating: PlanHeating | null
  onUpdateFurniture: (id: string, patch: Partial<PlanFurniture>) => void
  onDeleteFurniture: (id: string) => void
  onUpdateHeating: (id: string, patch: Partial<PlanHeating>) => void
  onDeleteHeating: (id: string) => void
  onUpdateFinish: (roomId: string, patch: Partial<RoomFinish>, applyToAll?: boolean) => void
  onSelectRoom: (id: string) => void
  onAddRender?: (roomId: string, dataUrl: string) => Promise<void>
  onDeleteRender?: (roomId: string, renderId: string) => void
}

/** Боковая панель слоя «Мебель и отделка»: выбранный предмет, зона тёплого пола, отделка, итоги */
export function InteriorSidebar({
  scheme,
  selectedRoom,
  selectedFurniture,
  selectedHeating,
  onUpdateFurniture,
  onDeleteFurniture,
  onUpdateHeating,
  onDeleteHeating,
  onUpdateFinish,
  onSelectRoom,
  onAddRender,
  onDeleteRender,
}: Props) {
  const warnings = interiorWarnings(scheme)
  const [view3d, setView3d] = useState<string | null>(null)
  const heat = (scheme.heating || []).map((h) => ({ h, c: heatingCalc(scheme, h) }))
  return (
    <div className="space-y-4">
      {view3d && <Room3DDialog open onOpenChange={(v) => !v && setView3d(null)} scheme={scheme} roomId={view3d} onAddRender={onAddRender} onDeleteRender={onDeleteRender} />}
      {selectedRoom && (
        <button
          onClick={() => setView3d(selectedRoom.id)}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] text-sm font-medium text-[#161616] hover:bg-[#B8860B]"
        >
          <Icon name="Box" size={16} />
          3D-вид: {selectedRoom.name}
        </button>
      )}
      {selectedFurniture && (
        <SelectedFurnitureCard item={selectedFurniture} scheme={scheme} onUpdate={onUpdateFurniture} onDelete={onDeleteFurniture} />
      )}
      {selectedHeating && (
        <SelectedHeatingCard zone={selectedHeating} scheme={scheme} onUpdate={onUpdateHeating} onDelete={onDeleteHeating} />
      )}
      {selectedRoom && !selectedFurniture && !selectedHeating && (
        <RoomFinishCard room={selectedRoom} scheme={scheme} onUpdate={onUpdateFinish} />
      )}

      {warnings.length > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase text-red-300">
            <Icon name="TriangleAlert" size={13} />
            Проверьте расстановку
          </div>
          <ul className="space-y-1 text-sm text-red-200/90">
            {warnings.map((w, i) => (
              <li key={i}>• {w.text}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-[#1f1f1f] p-4">
        <div className="mb-3 text-xs uppercase text-white/40">Помещения и отделка</div>
        <div className="space-y-1.5">
          {scheme.rooms.map((r) => {
            const sum = finishSummary(roomFinish(scheme, r.id))
            return (
              <div
                key={r.id}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${selectedRoom?.id === r.id ? "bg-[#D4AF37]/15 text-white" : "bg-[#161616] text-white/70 hover:bg-white/5"}`}
              >
                <button onClick={() => onSelectRoom(r.id)} className="min-w-0 flex-1 text-left">
                  <div className="font-medium">{r.name}</div>
                  <div className="truncate text-xs text-white/40">{sum || "отделка не задана"}</div>
                </button>
                {(scheme.renders?.[r.id] || []).length > 0 && (
                  <span className="flex shrink-0 items-center gap-0.5 text-[11px] text-white/40" title="Видов в PDF">
                    <Icon name="Image" size={12} />
                    {(scheme.renders?.[r.id] || []).length}
                  </span>
                )}
                <button
                  onClick={() => setView3d(r.id)}
                  title="Открыть в 3D"
                  className="flex h-8 shrink-0 items-center gap-1 rounded-md bg-white/5 px-2 text-xs text-[#D4AF37] hover:bg-white/10"
                >
                  <Icon name="Box" size={13} />
                  3D
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {(scheme.furniture || []).length > 0 && (
        <div className="rounded-xl border border-white/10 bg-[#1f1f1f] p-4">
          <div className="mb-2 text-xs uppercase text-white/40">Мебель — {(scheme.furniture || []).length} шт.</div>
          <div className="space-y-0.5 text-sm text-white/70">
            {Object.entries(
              (scheme.furniture || []).reduce<Record<string, number>>((a, f) => {
                a[f.kind] = (a[f.kind] || 0) + 1
                return a
              }, {}),
            ).map(([k, n]) => (
              <div key={k} className="flex justify-between">
                <span>{FURNITURE_PRESETS[k as keyof typeof FURNITURE_PRESETS].label}</span>
                <span className="text-white/40">{n}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {heat.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-[#1f1f1f] p-4">
          <div className="mb-2 text-xs uppercase text-white/40">Тёплый пол</div>
          <div className="space-y-0.5 text-sm text-white/70">
            {heat.map(({ h, c }) => (
              <div key={h.id} className="flex justify-between">
                <span>{scheme.rooms.find((r) => r.id === h.roomId)?.name || "Зона"}</span>
                <span className="text-[#fdba74]">
                  {fmtNum(c.net, 2)} м² · {c.watts} Вт
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default InteriorSidebar
