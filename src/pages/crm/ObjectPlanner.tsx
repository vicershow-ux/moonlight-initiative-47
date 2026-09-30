import { useNavigate, useParams } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { usePlannerState } from "./planner/usePlannerState"
import { PlannerLayerBar, PlannerToolbar } from "./planner/PlannerToolbar"
import { PlannerEngineerPicker, PlannerSettingsBar } from "./planner/PlannerPanels"
import { PlannerWorkspace } from "./planner/PlannerWorkspace"

export default function ObjectPlanner() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const state = usePlannerState(id)
  const {
    object,
    scheme,
    loading,
    saving,
    exporting,
    message,
    error,
    tool,
    setTool,
    layer,
    nodeKind,
    setNodeKind,
    linkSpec,
    setLinkSpec,
    linkFromId,
    setLinkFromId,
    draft,
    setDraft,
    fileUrl,
    dirty,
    syncRooms,
    setSyncRooms,
    finishRoom,
    changeLayer,
    setAllHeights,
    save,
    exportPdf,
  } = state

  if (loading) {
    return (
      <CrmLayout title="Планировщик">
        <div className="flex items-center justify-center py-24">
          <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
        </div>
      </CrmLayout>
    )
  }

  return (
    <CrmLayout
      title="Планировщик"
      subtitle={object ? `Объект ${object.object_code} · ${object.client_name}` : ""}
    >
      <button
        onClick={() => navigate(`/cabinet/objects/${id}`)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white"
      >
        <Icon name="ChevronLeft" size={16} />
        Назад к объекту
      </button>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          <Icon name="CircleAlert" size={16} />
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">
          <Icon name="Check" size={16} />
          {message}
        </div>
      )}

      <PlannerLayerBar layer={layer} changeLayer={changeLayer} />

      <PlannerToolbar
        layer={layer}
        tool={tool}
        setTool={setTool}
        draft={draft}
        setDraft={setDraft}
        setLinkFromId={setLinkFromId}
        finishRoom={finishRoom}
        exportPdf={exportPdf}
        save={save}
        exporting={exporting}
        saving={saving}
      />

      {layer !== "plan" && (
        <PlannerEngineerPicker
          layer={layer}
          tool={tool}
          setTool={setTool}
          nodeKind={nodeKind}
          setNodeKind={setNodeKind}
          linkSpec={linkSpec}
          setLinkSpec={setLinkSpec}
          linkFromId={linkFromId}
        />
      )}

      <PlannerSettingsBar
        scheme={scheme}
        setAllHeights={setAllHeights}
        syncRooms={syncRooms}
        setSyncRooms={setSyncRooms}
        fileUrl={fileUrl}
        dirty={dirty}
      />

      <PlannerWorkspace state={state} />
    </CrmLayout>
  )
}
