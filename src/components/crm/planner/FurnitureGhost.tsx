import { FURNITURE_PRESETS, FurnitureKind, LibraryItem, PlanPoint, PlanScheme } from "@/lib/planner/types"
import { furnitureWallDims, snapFurnitureToWall } from "@/lib/planner/interior"
import { FurnitureDimsLayer } from "./FurnitureDimsLayer"
import { furnitureSvg } from "@/lib/planner/interiorSvg"
import { ToScreen } from "./usePlanView"

/** Призрак предмета под курсором — уже прижат к стене и развёрнут, как встанет */
export function FurnitureGhost({
  scheme,
  kind,
  at,
  toScreen,
  lib,
}: {
  scheme: PlanScheme
  kind: FurnitureKind
  at: PlanPoint
  toScreen: ToScreen
  lib?: LibraryItem | null
}) {
  const pr = FURNITURE_PRESETS[lib ? lib.base_kind : kind]
  const size = lib ? { w: lib.width, d: lib.depth, h: lib.height } : { w: pr.w, d: pr.d, h: pr.h }
  const base = { x: at.x, y: at.y, w: size.w, d: size.d, rot: 0 }
  const sn = (lib ? lib.at_wall : pr.wall) ? snapFurnitureToWall(scheme, base, 0.8) : null
  const f = { id: "ghost", kind: lib ? lib.base_kind : kind, h: size.h, label: "", roomId: null, ...base, ...(sn || {}) }
  return (
    <g pointerEvents="none">
      <g opacity={0.6} dangerouslySetInnerHTML={{ __html: furnitureSvg(f, toScreen, "#D4AF37", "rgba(212,175,55,0.12)", 1.2) }} />
      <FurnitureDimsLayer dims={furnitureWallDims(scheme, f)} toScreen={toScreen} />
    </g>
  )
}

export default FurnitureGhost
