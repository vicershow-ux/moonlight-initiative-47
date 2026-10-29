import { useState } from "react"
import Icon from "@/components/ui/icon"
import { PlanCanvas } from "@/components/crm/planner/PlanCanvas"
import { PlanSidebar } from "@/components/crm/planner/PlanSidebar"
import { EngineerSidebar } from "@/components/crm/planner/EngineerSidebar"
import { InteriorSidebar } from "@/components/crm/planner/InteriorSidebar"
import { usePlannerState } from "./usePlannerState"

interface Props {
  state: ReturnType<typeof usePlannerState>
}

/** Холст плана и боковая панель — своя для планировки и для инженерных слоёв */
export function PlannerWorkspace({ state }: Props) {
  const {
    scheme,
    tool,
    setTool,
    layer,
    nodeKind,
    linkFromId,
    draft,
    setDraft,
    selectedRoomId,
    setSelectedRoomId,
    selectedOpeningId,
    setSelectedOpeningId,
    selectedNodeId,
    setSelectedNodeId,
    selectedLinkId,
    setSelectedLinkId,
    totals,
    selectedRoom,
    selectedOpening,
    selectedNode,
    selectedLink,
    finishRoom,
    addOpening,
    updateRoom,
    deleteRoom,
    updateOpening,
    deleteOpening,
    moveVertex,
    addNode,
    updateNode,
    deleteNode,
    moveNode,
    handleLinkClick,
    cancelLink,
    linkGroupId,
    addGroup,
    updateGroup,
    deleteGroup,
    updateCable,
    updatePanel,
    updateLink,
    deleteLink,
    updateWall,
    selectedFixtureId,
    setSelectedFixtureId,
    addFixture,
    updateFixture,
    deleteFixture,
  } = state
  const selectedFixture = (scheme.fixtures || []).find((f) => f.id === selectedFixtureId) || null
  const selectedFurniture = (scheme.furniture || []).find((f) => f.id === state.selectedFurnitureId) || null
  const selectedHeating = (scheme.heating || []).find((h) => h.id === state.selectedHeatingId) || null
  const [hoverWallId, setHoverWallId] = useState<string | null>(null)
  /** Группа щита, которую подсвечиваем на схеме электрики */
  const [highlightGroupId, setHighlightGroupId] = useState<string | null>(null)
  const activeHighlight =
    layer === "electric" && highlightGroupId && (scheme.groups || []).some((g) => g.id === highlightGroupId) ? highlightGroupId : null
  // Стена, выбранная щелчком на плане; карточка помещения и проёма при этом скрывается
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null)
  const selectWall = (wid: string | null) => {
    setSelectedWallId(wid)
    if (wid) {
      setSelectedRoomId(null)
      setSelectedOpeningId(null)
    }
  }
  const wallExists = selectedWallId && scheme.rooms.some((r) => r.id === selectedWallId.split(":")[0])
  const activeWallId = wallExists ? selectedWallId : null

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="relative self-start overflow-hidden rounded-xl border border-white/10 bg-[#141414] lg:sticky lg:top-4">
        {activeHighlight && (() => {
          const g = (scheme.groups || []).find((x) => x.id === activeHighlight)
          if (!g) return null
          return (
            <div className="absolute right-3 top-3 z-20 flex items-center gap-2 rounded-lg border border-[#D4AF37]/50 bg-[#1f1f1f]/95 py-1 pl-3 pr-1 text-xs shadow-lg">
              <span className="text-white/50">Группа</span>
              <span className="font-semibold text-[#D4AF37]">
                {g.num}
                {g.name ? ` · ${g.name}` : ""} · {g.breaker}
              </span>
              <button
                onClick={() => setHighlightGroupId(null)}
                className="rounded-md p-1 text-white/50 hover:bg-white/10 hover:text-white"
                title="Снять подсветку"
              >
                <Icon name="X" size={14} />
              </button>
            </div>
          )
        })()}
        <PlanCanvas
          scheme={scheme}
          tool={tool}
          layer={layer}
          nodeKind={nodeKind}
          linkFromId={linkFromId}
          draft={draft}
          selectedRoomId={selectedRoomId}
          selectedOpeningId={selectedOpeningId}
          selectedNodeId={selectedNodeId}
          selectedLinkId={selectedLinkId}
          onDraftChange={setDraft}
          onFinishRoom={finishRoom}
          onSelectRoom={(rid) => {
            setSelectedRoomId(rid)
            if (rid) {
              setSelectedOpeningId(null)
              setSelectedWallId(null)
            }
          }}
          onSelectOpening={(oid) => {
            setSelectedOpeningId(oid)
            if (oid) {
              setSelectedRoomId(null)
              setSelectedWallId(null)
            }
          }}
          onSelectNode={(nid) => {
            setSelectedNodeId(nid)
            if (nid) setSelectedLinkId(null)
          }}
          onSelectLink={(lid) => {
            setSelectedLinkId(lid)
            if (lid) setSelectedNodeId(null)
          }}
          onAddOpening={addOpening}
          onMoveVertex={moveVertex}
          onAddNode={addNode}
          onMoveNode={moveNode}
          onLinkClick={handleLinkClick}
          onCancelLink={cancelLink}
          onUpdateLink={updateLink}
          linkGroupId={linkGroupId}
          linkSpec={state.linkSpec}
          highlightGroupId={activeHighlight}
          selectedFixtureId={selectedFixtureId}
          onSelectFixture={setSelectedFixtureId}
          onAddFixture={addFixture}
          onUpdateFixture={updateFixture}
          selectedFurnitureId={state.selectedFurnitureId}
          onSelectFurniture={state.setSelectedFurnitureId}
          onAddFurniture={state.addFurniture}
          onUpdateFurniture={state.updateFurniture}
          furnitureKind={state.furnitureKind}
          selectedHeatingId={state.selectedHeatingId}
          onSelectHeating={state.setSelectedHeatingId}
          onAddHeating={state.addHeating}
          selectedWallId={hoverWallId ?? (layer === "plan" ? activeWallId : null)}
          onSelectWall={selectWall}
        />
      </div>

      {layer === "plan" ? (
        <PlanSidebar
          scheme={scheme}
          totals={totals}
          selectedRoom={selectedRoom}
          selectedOpening={selectedOpening}
          onUpdateRoom={updateRoom}
          onDeleteRoom={deleteRoom}
          onUpdateOpening={updateOpening}
          onDeleteOpening={deleteOpening}
          onSelectRoom={(rid) => {
            setSelectedRoomId(rid)
            setSelectedOpeningId(null)
            setSelectedWallId(null)
            setTool("select")
          }}
          onUpdateWall={updateWall}
          onHoverWall={setHoverWallId}
          selectedWallId={activeWallId}
          onSelectWall={selectWall}
        />
      ) : layer === "interior" ? (
        <InteriorSidebar
          scheme={scheme}
          selectedRoom={selectedRoom}
          selectedFurniture={selectedFurniture}
          selectedHeating={selectedHeating}
          onUpdateFurniture={state.updateFurniture}
          onDeleteFurniture={state.deleteFurniture}
          onUpdateHeating={state.updateHeating}
          onDeleteHeating={state.deleteHeating}
          onUpdateFinish={state.updateFinish}
          onSelectRoom={(rid) => {
            setSelectedRoomId(rid)
            state.setSelectedFurnitureId(null)
            state.setSelectedHeatingId(null)
          }}
        />
      ) : (
        <EngineerSidebar
          scheme={scheme}
          layer={layer}
          selectedNode={selectedNode}
          selectedLink={selectedLink}
          onUpdateNode={updateNode}
          onDeleteNode={deleteNode}
          onUpdateLink={updateLink}
          onDeleteLink={deleteLink}
          onAddGroup={addGroup}
          onUpdateGroup={updateGroup}
          onDeleteGroup={deleteGroup}
          onUpdateCable={updateCable}
          onUpdatePanel={updatePanel}
          onSelectNode={(nid) => {
            setSelectedNodeId(nid)
            setSelectedLinkId(null)
            setTool("select")
          }}
          onHoverWall={setHoverWallId}
          highlightGroupId={activeHighlight}
          onHighlightGroup={setHighlightGroupId}
          selectedFixture={selectedFixture}
          onUpdateFixture={updateFixture}
          onDeleteFixture={deleteFixture}
          onUpdateLighting={state.updateLighting}
          onUpdateHeating={state.updateHeating}
        />
      )}
    </div>
  )
}

export default PlannerWorkspace
