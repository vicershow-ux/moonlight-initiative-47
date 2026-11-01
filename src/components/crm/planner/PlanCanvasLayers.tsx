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

      {layer === "plan" && scheme.underlay && !scheme.underlay.hidden && (() => {
        const u = scheme.underlay
        const a = toScreen({ x: u.x, y: u.y })
        return (
          <image
            href={u.url}
            x={a.x}
            y={a.y}
            width={u.w * scale}
            height={u.h * scale}
            opacity={u.opacity}
            preserveAspectRatio="none"
            style={{ pointerEvents: "none" }}
          />
        )
      })()}

      {layer === "plan" && (props.detected || []).map((d, i) => {
        const sp = d.points.map(toScreen)
        const on = props.activeDetected === i
        return (
          <g key={`det-${i}`} style={{ cursor: "pointer" }}>
            <polygon
              points={sp.map((s) => `${s.x},${s.y}`).join(" ")}
              fill={on ? "rgba(212,175,55,0.28)" : "rgba(212,175,55,0.08)"}
              stroke="#D4AF37"
              strokeWidth={on ? 3 : 1.5}
              strokeDasharray={on ? undefined : "7 5"}
            />
            {(d.openings || []).map((o, k) => {
              const a = d.points[o.edge]
              const b = d.points[(o.edge + 1) % d.points.length]
              const L = Math.hypot(b.x - a.x, b.y - a.y) || 1
              const p0 = toScreen({ x: a.x + ((b.x - a.x) / L) * o.offset, y: a.y + ((b.y - a.y) / L) * o.offset })
              const p1 = toScreen({ x: a.x + ((b.x - a.x) / L) * (o.offset + o.width), y: a.y + ((b.y - a.y) / L) * (o.offset + o.width) })
              return (
                <line
                  key={k}
                  x1={p0.x}
                  y1={p0.y}
                  x2={p1.x}
                  y2={p1.y}
                  stroke={o.kind === "window" ? "#38bdf8" : "#f97316"}
                  strokeWidth={6}
                  strokeLinecap="round"
                  opacity={on ? 0.95 : 0.5}
                  pointerEvents="none"
                />
              )
            })}
          </g>
        )
      })}

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
        <FurnitureGhost scheme={scheme} kind={props.furnitureKind} at={cursor} toScreen={toScreen} lib={props.furnitureLib} />
      )}

      {place && isEngLayer(layer) && <PlaceAssistLayer assist={place} toScreen={toScreen} />}

      {tool === "calibrate" && (() => {
        const pts = props.calibPts || []
        const all = pts.length === 1 && cursor ? [pts[0], cursor] : pts
        const s = all.map(toScreen)
        return (
          <g style={{ pointerEvents: "none" }}>
            {s.length === 2 && <line x1={s[0].x} y1={s[0].y} x2={s[1].x} y2={s[1].y} stroke="#f43f5e" strokeWidth={2} strokeDasharray={pts.length === 2 ? undefined : "6 4"} />}
            {s.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={6} fill="none" stroke="#f43f5e" strokeWidth={2} />
                <line x1={p.x - 10} y1={p.y} x2={p.x + 10} y2={p.y} stroke="#f43f5e" strokeWidth={1} />
                <line x1={p.x} y1={p.y - 10} x2={p.x} y2={p.y + 10} stroke="#f43f5e" strokeWidth={1} />
              </g>
            ))}
          </g>
        )
      })()}

      <PlanDraftLayer draft={draft} tool={tool} cursor={typedPoint() || cursor} assist={assist} scale={scale} toScreen={toScreen} />
    </>
  )
}

export default PlanCanvasLayers
