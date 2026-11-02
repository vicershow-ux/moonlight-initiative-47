import type { NamedContour } from "@/lib/planner/roomNames"
import {
  NodeKind,
  PlanLayer,
  PlanLink,
  PlanPoint,
  PlanScheme,
  FixtureKind,
  PlanFixture,
  PlanFurniture,
  PlanHeating,
  FurnitureKind,
  LibraryItem,
} from "@/lib/planner/types"

export type PlanTool = "select" | "draw" | "window" | "door" | "arch" | "node" | "link" | "track" | "floating" | "furniture" | "heating" | "calibrate" | "split"

export interface PlanCanvasProps {
  scheme: PlanScheme
  tool: PlanTool
  layer: PlanLayer
  nodeKind: NodeKind
  linkFromId: string | null
  draft: PlanPoint[]
  selectedRoomId: string | null
  selectedOpeningId: string | null
  selectedNodeId: string | null
  selectedLinkId: string | null
  onDraftChange: (points: PlanPoint[]) => void
  onFinishRoom: (points: PlanPoint[]) => void
  onSelectRoom: (id: string | null) => void
  onSelectOpening: (id: string | null) => void
  onSelectNode: (id: string | null) => void
  onSelectLink: (id: string | null) => void
  onAddOpening: (wallId: string, offset: number) => void
  selectedWallId?: string | null
  /** Щелчок по стене на слое планировки */
  onSelectWall?: (wallId: string | null) => void
  onMoveVertex: (roomId: string, index: number, point: PlanPoint) => void
  onAddNode: (point: PlanPoint) => void
  onMoveNode: (id: string, point: PlanPoint) => void
  onLinkClick: (nodeId: string, bends: PlanPoint[]) => void
  onCancelLink: () => void
  onUpdateLink: (id: string, patch: Partial<PlanLink>) => void
  linkGroupId?: string | null
  linkSpec?: string | null
  /** Подсвеченная группа щита: её кабели и точки ярко, остальное бледно */
  highlightGroupId?: string | null
  selectedFixtureId?: string | null
  onSelectFixture?: (id: string | null) => void
  onAddFixture?: (kind: FixtureKind, a: PlanPoint, b: PlanPoint, points?: PlanPoint[]) => void
  onUpdateFixture?: (id: string, patch: Partial<PlanFixture>) => void
  selectedFurnitureId?: string | null
  onSelectFurniture?: (id: string | null) => void
  onAddFurniture?: (p: PlanPoint) => void
  onUpdateFurniture?: (id: string, patch: Partial<PlanFurniture>) => void
  furnitureKind?: FurnitureKind
  /** Свой предмет из библиотеки, который ставим */
  furnitureLib?: LibraryItem | null
  selectedHeatingId?: string | null
  onSelectHeating?: (id: string | null) => void
  onAddHeating?: (points: PlanPoint[]) => void
  onUpdateHeating?: (id: string, patch: Partial<PlanHeating>) => void
  /** Масштаб подложки: две точки известного размера */
  calibPts?: PlanPoint[]
  onCalibrateClick?: (p: PlanPoint) => void
  /** Найденные по подложке контуры — щелчок добавляет помещение */
  /** Помощник черчения выключен кнопкой на панели — Alt включает его на время */
  assistOff?: boolean
  detected?: NamedContour[]
  onAcceptDetected?: (index: number) => void
  activeDetected?: number | null
  onActiveDetected?: (index: number | null) => void
  onDiscardDetected?: (index: number) => void
  onDetectedType?: (index: number, type: string) => void
  onDropDetectedOpening?: (index: number, k: number) => void
  /** Перегородка нарисована: разрезать помещение по линии */
  onSplit?: (cut: PlanPoint[]) => boolean
  selectedFreeWallId?: string | null
  onSelectFreeWall?: (id: string | null) => void
  onMoveFreeWall?: (id: string, patch: { a?: PlanPoint; b?: PlanPoint }) => void
}

/** Что сейчас тащат мышью на холсте */
export type PlanDrag =
  | { type: "pan"; startX: number; startY: number; tx: number; ty: number }
  | { type: "vertex"; roomId: string; index: number }
  | { type: "node"; nodeId: string }
  | { type: "bend"; linkId: string; index: number }
  | { type: "fixture"; id: string; grab: PlanPoint; a: PlanPoint; b: PlanPoint; points: PlanPoint[] }
  | { type: "furniture"; id: string; grab: PlanPoint; x: number; y: number }
  | { type: "heating"; id: string; grab: PlanPoint; points: PlanPoint[] }
  | { type: "heatingVertex"; id: string; index: number }
  | { type: "freeEnd"; id: string; end: "a" | "b" }
  | null
