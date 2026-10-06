import { PlanCanvas } from "@/components/crm/planner/PlanCanvas"
import { PlanSidebar } from "@/components/crm/planner/PlanSidebar"
import { EngineerSidebar } from "@/components/crm/planner/EngineerSidebar"
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
  } = state

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#141414]">
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
            if (rid) setSelectedOpeningId(null)
          }}
          onSelectOpening={(oid) => {
            setSelectedOpeningId(oid)
            if (oid) setSelectedRoomId(null)
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
            setTool("select")
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
        />
      )}
    </div>
  )
}

export default PlannerWorkspace
