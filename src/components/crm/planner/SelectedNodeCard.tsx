import Icon from "@/components/ui/icon"
import { DeleteButton } from "@/components/ui/delete-button"
import { fromMm, toMm } from "@/lib/planner/geometry"
import { gostSymbol } from "@/lib/planner/symbols"
import { NodeSymbolIcon } from "./NodeSymbol"
import { NODE_PRESETS, PlanNode, PlanScheme } from "@/lib/planner/types"
import { NodeMountEditor } from "./NodeMountEditor"
import { WallElevationsDialog } from "./WallElevationsDialog"
import { useState } from "react"

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"

const labelCls = "mb-1.5 block text-xs text-white/50"

interface Props {
  selectedNode: PlanNode
  roomName: (roomId: string | null) => string
  onUpdateNode: (id: string, patch: Partial<PlanNode>) => void
  onDeleteNode: (id: string) => void
  scheme?: PlanScheme
  onHoverWall?: (wallId: string | null) => void
}

export function SelectedNodeCard({
  selectedNode,
  roomName,
  onUpdateNode,
  onDeleteNode,
  scheme,
  onHoverWall,
}: Props) {
  const [elevOpen, setElevOpen] = useState(false)
  const elevRoomId = selectedNode.mount?.wallId.split(":")[0] ?? selectedNode.roomId
  return (
    <div className="rounded-xl border border-[#D4AF37]/30 bg-[#1f1f1f] p-4">
      {scheme && elevOpen && elevRoomId && (
        <WallElevationsDialog
          open
          onOpenChange={setElevOpen}
          scheme={scheme}
          roomId={elevRoomId}
          wallId={selectedNode.mount?.wallId ?? null}
        />
      )}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          {gostSymbol(selectedNode.kind) ? (
            <NodeSymbolIcon kind={selectedNode.kind} />
          ) : (
            <Icon name={NODE_PRESETS[selectedNode.kind].icon} size={15} />
          )}
          {NODE_PRESETS[selectedNode.kind].label}
        </div>
        <DeleteButton onConfirm={() => onDeleteNode(selectedNode.id)} title="Удалить точку?" />
      </div>

      <div className="mb-3">
        <label className={labelCls}>Подпись на плане</label>
        <input
          className={inputCls}
          placeholder={NODE_PRESETS[selectedNode.kind].label}
          value={selectedNode.label}
          onChange={(e) => onUpdateNode(selectedNode.id, { label: e.target.value })}
        />
      </div>

      {scheme && (
        <NodeMountEditor node={selectedNode} scheme={scheme} onUpdateNode={onUpdateNode} onHoverWall={onHoverWall} />
      )}

      <div className="mb-3">
        <label className={labelCls}>Высота от пола, мм</label>
        <input
          className={inputCls}
          type="number"
          min="0"
          step="10"
          value={toMm(selectedNode.height)}
          onChange={(e) =>
            onUpdateNode(selectedNode.id, { height: fromMm(Number(e.target.value)) })
          }
        />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>X, мм</label>
          <input
            className={inputCls}
            type="number"
            step="10"
            value={toMm(selectedNode.x)}
            onChange={(e) => onUpdateNode(selectedNode.id, { x: fromMm(Number(e.target.value)) })}
          />
        </div>
        <div>
          <label className={labelCls}>Y, мм</label>
          <input
            className={inputCls}
            type="number"
            step="10"
            value={toMm(selectedNode.y)}
            onChange={(e) => onUpdateNode(selectedNode.id, { y: fromMm(Number(e.target.value)) })}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-xs text-white/40">
        <span>Помещение: {roomName(selectedNode.roomId)}</span>
        {scheme && elevRoomId && selectedNode.layer === "electric" && (
          <button onClick={() => setElevOpen(true)} className="flex items-center gap-1 text-[#D4AF37] hover:text-[#B8860B]">
            <Icon name="Ruler" size={12} />
            Развёртка стены
          </button>
        )}
      </div>
    </div>
  )
}

export default SelectedNodeCard
