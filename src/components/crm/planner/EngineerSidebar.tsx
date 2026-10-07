import { linkGeometry } from "@/lib/planner/geometry"
import {
  PlanGroup,
  PlanLayer,
  PlanLink,
  PlanNode,
  CableSettings,
  PanelSettings,
  PlanScheme,
} from "@/lib/planner/types"
import { groupSummaries } from "@/lib/planner/groups"
import { phaseBalance } from "@/lib/planner/phases"
import { panelSettings, panelWarnings } from "@/lib/planner/panelDiagram"
import {
  CableTotals,
  addCable,
  cableLength,
  cableSettings,
  emptyTotals,
} from "@/lib/planner/cable"
import { SelectedNodeCard } from "./SelectedNodeCard"
import { SelectedLinkCard } from "./SelectedLinkCard"
import { PanelGroupsCard } from "./PanelGroupsCard"
import { LayerSummaryCard } from "./LayerSummaryCard"

interface Props {
  scheme: PlanScheme
  layer: Exclude<PlanLayer, "plan">
  selectedNode: PlanNode | null
  selectedLink: PlanLink | null
  onUpdateNode: (id: string, patch: Partial<PlanNode>) => void
  onDeleteNode: (id: string) => void
  onUpdateLink: (id: string, patch: Partial<PlanLink>) => void
  onDeleteLink: (id: string) => void
  onSelectNode: (id: string) => void
  onAddGroup: () => string
  onUpdateGroup: (id: string, patch: Partial<PlanGroup>) => void
  onDeleteGroup: (id: string) => void
  onUpdateCable: (patch: Partial<CableSettings>) => void
  onUpdatePanel: (patch: Partial<PanelSettings>) => void
  onHoverWall?: (wallId: string | null) => void
}

export function EngineerSidebar({
  scheme,
  layer,
  selectedNode,
  selectedLink,
  onUpdateNode,
  onDeleteNode,
  onUpdateLink,
  onDeleteLink,
  onSelectNode,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
  onUpdateCable,
  onUpdatePanel,
  onHoverWall,
}: Props) {
  const panel = panelSettings(scheme.panel)
  const panelIssues = layer === "electric" ? panelWarnings(scheme) : []
  const groups = [...(scheme.groups || [])].sort((a, b) => a.num - b.num)
  const summaries = layer === "electric" ? groupSummaries(scheme) : []
  const nodes = (scheme.nodes || []).filter((n) => n.layer === layer)
  const links = (scheme.links || []).filter((l) => l.layer === layer)
  const nodeById = new Map(nodes.map((n) => [n.id, n]))

  const isElectric = layer === "electric"
  const cfg = cableSettings(scheme.cable)

  // Кабель: по плану + спуски от потолка к точкам + запас на концы.
  // Трубы сантехники идут по полу, у них считаем только длину по плану
  const linkCable = (l: PlanLink): CableTotals => {
    if (isElectric) {
      return cableLength(l, nodeById, scheme.rooms, scheme.defaultHeight, scheme.cable) ?? emptyTotals()
    }
    const plan = linkGeometry(l, nodeById)?.length ?? 0
    return { plan, drops: 0, reserve: 0, total: plan }
  }

  // Итог по сечениям — сразу видно, сколько кабеля или трубы каждого типа
  const totalsBySpec = links.reduce<Record<string, CableTotals>>((acc, l) => {
    acc[l.spec] = addCable(acc[l.spec] || emptyTotals(), linkCable(l))
    return acc
  }, {})
  const layerTotal = Object.values(totalsBySpec).reduce((acc, c) => addCable(acc, c), emptyTotals())

  const countsByKind = nodes.reduce<Record<string, number>>((acc, n) => {
    acc[n.kind] = (acc[n.kind] || 0) + 1
    return acc
  }, {})

  const roomName = (roomId: string | null) =>
    scheme.rooms.find((r) => r.id === roomId)?.name || "вне помещений"

  return (
    <div className="flex flex-col gap-4">
      {selectedNode && (
        <SelectedNodeCard
          selectedNode={selectedNode}
          roomName={roomName}
          onUpdateNode={onUpdateNode}
          onDeleteNode={onDeleteNode}
          scheme={scheme}
          onHoverWall={onHoverWall}
        />
      )}

      {selectedLink && (
        <SelectedLinkCard
          selectedLink={selectedLink}
          layer={layer}
          isElectric={isElectric}
          groups={groups}
          linkCable={linkCable}
          onUpdateLink={onUpdateLink}
          onDeleteLink={onDeleteLink}
          onAddGroup={onAddGroup}
        />
      )}

      {layer === "electric" && (
        <PanelGroupsCard
          panel={panel}
          panelIssues={panelIssues}
          groups={groups}
          summaries={summaries}
          onAddGroup={onAddGroup}
          onUpdateGroup={onUpdateGroup}
          onDeleteGroup={onDeleteGroup}
          onUpdatePanel={onUpdatePanel}
          balance={phaseBalance(scheme)}
        />
      )}

      <LayerSummaryCard
        layer={layer}
        isElectric={isElectric}
        nodes={nodes}
        links={links}
        countsByKind={countsByKind}
        totalsBySpec={totalsBySpec}
        layerTotal={layerTotal}
        cfg={cfg}
        selectedNode={selectedNode}
        roomName={roomName}
        onUpdateCable={onUpdateCable}
        onSelectNode={onSelectNode}
      />
    </div>
  )
}

export default EngineerSidebar
