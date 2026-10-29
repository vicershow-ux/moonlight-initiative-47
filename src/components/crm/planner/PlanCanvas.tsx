import { useMemo, useState } from "react"
import { PlanNode, PlanPoint } from "@/lib/planner/types"
import { usePlanView } from "./usePlanView"
import { PlanControls } from "./PlanOverlays"
import { useTypedLength } from "./useTypedLength"
import { useLinkRoute } from "./useLinkRoute"
import { useWheelZoom } from "./useWheelZoom"
import { TypedLengthHint } from "./TypedLengthHint"
import { WallLegend } from "./WallLegend"
import { NodeLegend } from "./NodeLegend"
import { PlanCanvasProps } from "./planCanvasTypes"
import { usePlanCanvasAssist } from "./usePlanCanvasAssist"
import { usePlanCanvasPointer } from "./usePlanCanvasPointer"
import { PlanCanvasLayers } from "./PlanCanvasLayers"

export type { PlanTool } from "./planCanvasTypes"

export function PlanCanvas(props: PlanCanvasProps) {
  const { scheme, tool, layer, linkFromId, draft, onDraftChange, onFinishRoom, onCancelLink } = props
  const { wrapRef, size, view, setView, toScreen, toWorld, gridLines, gridStep, zoomBy, fitView } =
    usePlanView(scheme.rooms)

  const [cursor, setCursor] = useState<PlanPoint | null>(null)

  const nodes = useMemo(
    () => (scheme.nodes || []).filter((n) => n.layer === layer),
    [scheme.nodes, layer],
  )
  const links = useMemo(
    () => (scheme.links || []).filter((l) => l.layer === layer),
    [scheme.links, layer],
  )
  const fixtures = useMemo(() => (layer === "electric" ? scheme.fixtures || [] : []), [scheme.fixtures, layer])

  const assistApi = usePlanCanvasAssist({ scheme, tool, layer, draft, nodes, fixtures, scale: view.scale })

  const nodeById = useMemo(() => {
    const map = new Map<string, PlanNode>()
    for (const n of scheme.nodes || []) map.set(n.id, n)
    return map
  }, [scheme.nodes])

  const { typed, setTyped, typedPoint, placePoint } = useTypedLength({ tool, draft, cursor, onDraftChange, onFinishRoom })

  const { bends, setBends, nextBend } = useLinkRoute({
    tool,
    layer,
    linkFromId,
    nodeById,
    onCancelLink,
    snapPoint: assistApi.snapPoint,
  })

  const { assist, place, drag, handleDown, handleMove, handleUp, handleLeave } = usePlanCanvasPointer({
    props,
    view,
    setView,
    toWorld,
    nodes,
    links,
    fixtures,
    nodeById,
    assistApi,
    bends,
    setBends,
    nextBend,
    typedPoint,
    placePoint,
    setTyped,
    cursorState: [cursor, setCursor],
  })

  const svgRef = useWheelZoom(view, setView, toWorld)

  return (
    <div ref={wrapRef} className="relative h-[440px] w-full overscroll-contain md:h-[620px]">
      <svg
        ref={svgRef}
        width={size.w}
        height={size.h}
        className="touch-none rounded-xl bg-[#141414]"
        style={{
          cursor:
            tool === "draw" || tool === "node" || tool === "link" || tool === "track" || tool === "floating"
              ? "crosshair"
              : drag
                ? "grabbing"
                : "default",
        }}
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onMouseLeave={handleLeave}
        onContextMenu={(e) => e.preventDefault()}
      >
        <PlanCanvasLayers
          props={props}
          scale={view.scale}
          toScreen={toScreen}
          gridLines={gridLines}
          nodes={nodes}
          links={links}
          fixtures={fixtures}
          nodeById={nodeById}
          cursor={cursor}
          bends={bends}
          nextBend={nextBend}
          trackStart={assistApi.trackStart}
          place={place}
          assist={assist}
          typedPoint={typedPoint}
        />
      </svg>

      {tool === "draw" && draft.length > 0 && cursor && <TypedLengthHint cursor={cursor} typed={typed} toScreen={toScreen} />}

      {layer === "plan" ? <WallLegend scheme={scheme} /> : <NodeLegend scheme={scheme} layer={layer} />}

      <PlanControls cursor={cursor} gridStep={gridStep} zoomBy={zoomBy} fitView={fitView} />
    </div>
  )
}

export default PlanCanvas
