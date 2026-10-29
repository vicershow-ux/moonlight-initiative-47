import { PlanFixture, PlanLink, PlanNode, PlanPoint, isEngLayer } from "@/lib/planner/types"
import { PlanInteriorLayer } from "./PlanInteriorLayer"
import { schemeWalls } from "@/lib/planner/walls"
import { PlaceAssist } from "@/lib/planner/placeAssist"
import { FloatingDraft, TrackDraft } from "./FixtureDrafts"
import { FurnitureGhost } from "./FurnitureGhost"
import { FurnitureDimsLayer } from "./FurnitureDimsLayer"
import { furnitureWallDims } from "@/lib/planner/interior"
import { ToScreen } from "./usePlanView"
import { PlanRoomsLayer } from "./PlanRoomsLayer"
import { PlaceAssistLayer } from "./PlaceAssistLayer"
import { PlanDimensionsLayer } from "./PlanDimensionsLayer"
import { PlanEngineerLayer } from "./PlanEngineerLayer"
import { PlanDraftLayer } from "./PlanOverlays"
import { DrawAssist } from "./drawAssist"
import type { PlanCanvasProps } from "./planCanvasTypes"

interface Props {
  props: PlanCanvasProps
  scale: number
  toScreen: ToScreen
  gridLines: { x1: number; y1: number; x2: number; y2: number; major: boolean }[]
  nodes: PlanNode[]
  links: PlanLink[]
  fixtures: PlanFixture[]
  nodeById: Map<string, PlanNode>
  cursor: PlanPoint | null
  bends: PlanPoint[]
  nextBend: (world: PlanPoint, free: boolean) => PlanPoint
  trackPts: PlanPoint[]
  place: PlaceAssist | null
  assist: DrawAssist | null
  typedPoint: () => PlanPoint | null
}

/** Содержимое SVG холста: сетка, помещения, размеры, инженерия, черновики и подсказки */
export function PlanCanvasLayers({
  props,
  scale,
  toScreen,
  gridLines,
  nodes,
  links,
  fixtures,
  nodeById,
  cursor,
  bends,
  nextBend,
  trackPts,
  place,
  assist,
  typedPoint,
}: Props) {
  const {
    scheme,
    tool,
    layer,
    nodeKind,
    linkFromId,
    draft,
    selectedRoomId,
    selectedOpeningId,
    selectedNodeId,
    selectedLinkId,
    selectedWallId = null,
    linkGroupId = null,
    linkSpec = null,
    highlightGroupId = null,
    selectedFixtureId = null,
  } = props

  const wallById = new Map(schemeWalls(scheme).all.map((w) => [w.id, w]))

  return (
    <>
      {gridLines.map((l, i) => (
        <line
          key={i}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke={l.major ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.04)"}
          strokeWidth={1}
        />
      ))}

      <PlanRoomsLayer
        scheme={scheme}
        layer={layer}
        scale={scale}
        selectedRoomId={selectedRoomId}
        selectedOpeningId={selectedOpeningId}
        toScreen={toScreen}
        selectedWallId={selectedWallId}
      />

      {layer === "plan" && (
        <PlanDimensionsLayer
          rooms={scheme.rooms}
          scale={scale}
          toScreen={toScreen}
          wallOut={(id) => {
            const w = wallById.get(id)
            return w ? w.thickness - w.inner : 0
          }}
        />
      )}

      <PlanInteriorLayer
        scheme={scheme}
        layer={layer}
        scale={scale}
        toScreen={toScreen}
        selectedFurnitureId={props.selectedFurnitureId ?? null}
        selectedHeatingId={props.selectedHeatingId ?? null}
      />

      {isEngLayer(layer) && (
        <PlanEngineerLayer
          layer={layer}
          tool={tool}
          nodeKind={nodeKind}
          scale={scale}
          nodes={nodes}
          links={links}
          rooms={scheme.rooms}
          groups={scheme.groups || []}
          linkGroupId={linkGroupId}
          highlightGroupId={highlightGroupId}
          fixtures={fixtures}
          selectedFixtureId={selectedFixtureId}
          linkSpec={linkSpec}
          nodeById={nodeById}
          linkFromId={linkFromId}
          selectedNodeId={selectedNodeId}
          selectedLinkId={selectedLinkId}
          cursor={cursor}
          bends={bends}
          previewBend={tool === "link" && linkFromId && cursor ? nextBend(cursor, false) : null}
          toScreen={toScreen}
          scheme={scheme}
        />
      )}

      {tool === "track" && trackPts.length > 0 && cursor && <TrackDraft pts={trackPts} b={cursor} toScreen={toScreen} />}
      {tool === "floating" && cursor && <FloatingDraft scheme={scheme} at={cursor} toScreen={toScreen} />}
      {/* Выбранный или перетаскиваемый предмет — с отступами от стен */}
      {layer === "interior" && props.selectedFurnitureId && (() => {
        const it = (scheme.furniture || []).find((f) => f.id === props.selectedFurnitureId)
        return it ? <FurnitureDimsLayer dims={furnitureWallDims(scheme, it)} toScreen={toScreen} /> : null
      })()}
      {tool === "furniture" && cursor && props.furnitureKind && (
        <FurnitureGhost scheme={scheme} kind={props.furnitureKind} at={cursor} toScreen={toScreen} />
      )}

      {place && isEngLayer(layer) && <PlaceAssistLayer assist={place} toScreen={toScreen} />}

      <PlanDraftLayer draft={draft} tool={tool} cursor={typedPoint() || cursor} assist={assist} scale={scale} toScreen={toScreen} />
    </>
  )
}

export default PlanCanvasLayers
