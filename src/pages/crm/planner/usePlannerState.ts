import { useCallback, useEffect, useMemo, useState } from "react"
import { PlanTool } from "@/components/crm/planner/PlanCanvas"
import { objectsApi, objectPlansApi, ObjectItem } from "@/lib/api"
import { pointInPolygon, schemeMetrics } from "@/lib/planner/geometry"
import { downloadPlanPdf } from "@/lib/planner/planPdf"
import { cableSettings } from "@/lib/planner/cable"
import {
  LINK_SPECS,
  NODE_PRESETS,
  NodeKind,
  OPENING_PRESETS,
  OpeningKind,
  CableSettings,
  DEFAULT_PANEL,
  PanelSettings,
  PlanGroup,
  PlanLayer,
  PlanLink,
  PlanNode,
  PlanOpening,
  PlanPoint,
  PlanRoom,
  PlanScheme,
  emptyScheme,
} from "@/lib/planner/types"

const uid = () => Math.random().toString(36).slice(2, 10)

/**
 * Всё состояние планировщика: загрузка плана, правка помещений и проёмов,
 * точки и линии инженерных слоёв, сохранение и выгрузка PDF.
 */
export function usePlannerState(id: string | undefined) {
  const [object, setObject] = useState<ObjectItem | null>(null)
  const [scheme, setScheme] = useState<PlanScheme>(emptyScheme())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const [tool, setTool] = useState<PlanTool>("draw")
  const [layer, setLayer] = useState<PlanLayer>("plan")
  const [nodeKind, setNodeKind] = useState<NodeKind>("socket")
  const [linkSpec, setLinkSpec] = useState("2.5 мм²")
  const [linkFromId, setLinkFromId] = useState<string | null>(null)
  /** Группа, в которую попадают новые трассы электрики */
  const [linkGroupId, setLinkGroupId] = useState<string | null>(null)
  const [draft, setDraft] = useState<PlanPoint[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [selectedOpeningId, setSelectedOpeningId] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [syncRooms, setSyncRooms] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([objectsApi.get(Number(id)), objectPlansApi.get(Number(id))])
      .then(([objData, planData]) => {
        setObject(objData)
        if (planData.plan?.scheme) {
          const raw = planData.plan.scheme as unknown as PlanScheme
          if (raw && Array.isArray(raw.rooms)) {
            setScheme({
              version: 1,
              rooms: raw.rooms || [],
              openings: raw.openings || [],
              defaultHeight: Number(planData.plan.default_height) || 2.7,
              nodes: raw.nodes || [],
              links: raw.links || [],
              groups: raw.groups || [],
              cable: raw.cable,
              panel: raw.panel,
            })
          }
          setFileUrl(planData.plan.file_url || null)
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Не удалось загрузить"))
      .finally(() => setLoading(false))
  }, [id])

  const { totals } = useMemo(() => schemeMetrics(scheme), [scheme])

  const selectedRoom = useMemo(
    () => scheme.rooms.find((r) => r.id === selectedRoomId) || null,
    [scheme.rooms, selectedRoomId],
  )
  const selectedOpening = useMemo(
    () => scheme.openings.find((o) => o.id === selectedOpeningId) || null,
    [scheme.openings, selectedOpeningId],
  )

  const touch = () => {
    setDirty(true)
    setMessage("")
  }

  const finishRoom = useCallback(
    (points: PlanPoint[]) => {
      if (points.length < 3) return
      const room: PlanRoom = {
        id: uid(),
        name: `Помещение ${scheme.rooms.length + 1}`,
        room_type: "",
        points,
        height: scheme.defaultHeight,
        notes: "",
      }
      setScheme((s) => ({ ...s, rooms: [...s.rooms, room] }))
      setDraft([])
      setSelectedRoomId(room.id)
      setSelectedOpeningId(null)
      setTool("select")
      touch()
    },
    [scheme.rooms.length, scheme.defaultHeight],
  )

  const addOpening = (wallId: string, offset: number) => {
    if (tool === "select" || tool === "draw") return
    const preset = OPENING_PRESETS[tool as OpeningKind]
    const opening: PlanOpening = {
      id: uid(),
      kind: tool as OpeningKind,
      wallId,
      offset: Math.max(offset - preset.width / 2, 0),
      width: preset.width,
      height: preset.height,
      sill: preset.sill,
    }
    setScheme((s) => ({ ...s, openings: [...s.openings, opening] }))
    setSelectedOpeningId(opening.id)
    setSelectedRoomId(null)
    touch()
  }

  const updateRoom = (roomId: string, patch: Partial<PlanRoom>) => {
    setScheme((s) => ({
      ...s,
      rooms: s.rooms.map((r) => (r.id === roomId ? { ...r, ...patch } : r)),
    }))
    touch()
  }

  const deleteRoom = (roomId: string) => {
    setScheme((s) => {
      const room = s.rooms.find((r) => r.id === roomId)
      const wallPrefix = room ? `${room.id}:` : ""
      return {
        ...s,
        rooms: s.rooms.filter((r) => r.id !== roomId),
        openings: s.openings.filter((o) => !o.wallId.startsWith(wallPrefix)),
      }
    })
    setSelectedRoomId(null)
    touch()
  }

  const updateOpening = (openingId: string, patch: Partial<PlanOpening>) => {
    setScheme((s) => ({
      ...s,
      openings: s.openings.map((o) => (o.id === openingId ? { ...o, ...patch } : o)),
    }))
    touch()
  }

  const deleteOpening = (openingId: string) => {
    setScheme((s) => ({ ...s, openings: s.openings.filter((o) => o.id !== openingId) }))
    setSelectedOpeningId(null)
    touch()
  }

  const moveVertex = (roomId: string, index: number, point: PlanPoint) => {
    setScheme((s) => ({
      ...s,
      rooms: s.rooms.map((r) =>
        r.id === roomId
          ? { ...r, points: r.points.map((p, i) => (i === index ? point : p)) }
          : r,
      ),
    }))
    setDirty(true)
  }

  const selectedNode = useMemo(
    () => (scheme.nodes || []).find((n) => n.id === selectedNodeId) || null,
    [scheme.nodes, selectedNodeId],
  )
  const selectedLink = useMemo(
    () => (scheme.links || []).find((l) => l.id === selectedLinkId) || null,
    [scheme.links, selectedLinkId],
  )

  /** Ставим точку (розетку, щит, вывод воды) в том помещении, куда кликнули */
  const addNode = (point: PlanPoint) => {
    if (layer === "plan") return
    const preset = NODE_PRESETS[nodeKind]
    const room = [...scheme.rooms].reverse().find((r) => pointInPolygon(point, r.points))
    const node: PlanNode = {
      id: uid(),
      layer,
      kind: nodeKind,
      x: point.x,
      y: point.y,
      height: preset.height,
      label: "",
      roomId: room ? room.id : null,
    }
    setScheme((s) => ({ ...s, nodes: [...(s.nodes || []), node] }))
    setSelectedNodeId(node.id)
    setSelectedLinkId(null)
    touch()
  }

  const updateNode = (nodeId: string, patch: Partial<PlanNode>) => {
    setScheme((s) => ({
      ...s,
      nodes: (s.nodes || []).map((n) => (n.id === nodeId ? { ...n, ...patch } : n)),
    }))
    touch()
  }

  const deleteNode = (nodeId: string) => {
    setScheme((s) => ({
      ...s,
      nodes: (s.nodes || []).filter((n) => n.id !== nodeId),
      links: (s.links || []).filter((l) => l.fromId !== nodeId && l.toId !== nodeId),
    }))
    setSelectedNodeId(null)
    touch()
  }

  const moveNode = (nodeId: string, point: PlanPoint) => {
    setScheme((s) => ({
      ...s,
      nodes: (s.nodes || []).map((n) =>
        n.id === nodeId
          ? {
              ...n,
              x: point.x,
              y: point.y,
              roomId:
                [...s.rooms].reverse().find((r) => pointInPolygon(point, r.points))?.id ?? null,
            }
          : n,
      ),
    }))
    setDirty(true)
  }

  /**
   * Первый клик — откуда тянем, второй — куда. Между ними монтажник ставит
   * изломы трассы. Линия получает текущее сечение и идёт под прямыми углами
   */
  const handleLinkClick = (nodeId: string, bends: PlanPoint[] = []) => {
    if (layer === "plan") return
    if (!linkFromId) {
      setLinkFromId(nodeId)
      setSelectedNodeId(nodeId)
      return
    }
    if (linkFromId === nodeId) {
      setLinkFromId(null)
      return
    }

    const exists = (scheme.links || []).some(
      (l) =>
        (l.fromId === linkFromId && l.toId === nodeId) ||
        (l.fromId === nodeId && l.toId === linkFromId),
    )
    if (!exists) {
      const link: PlanLink = {
        id: uid(),
        layer,
        fromId: linkFromId,
        toId: nodeId,
        spec: linkSpec,
        points: bends,
        ortho: true,
        groupId: layer === "electric" ? linkGroupId : null,
      }
      setScheme((s) => ({ ...s, links: [...(s.links || []), link] }))
      setSelectedLinkId(link.id)
      touch()
    }
    setLinkFromId(nodeId)
  }

  const cancelLink = useCallback(() => setLinkFromId(null), [])

  /** Новая группа получает следующий свободный номер и автомат C16 */
  const addGroup = () => {
    const groups = scheme.groups || []
    const num = groups.reduce((m, g) => Math.max(m, g.num), 0) + 1
    const group: PlanGroup = {
      id: uid(),
      num,
      name: "",
      breaker: "C16",
      protection: "mcb",
      leakage: 30,
    }
    setScheme((s) => ({ ...s, groups: [...(s.groups || []), group] }))
    setLinkGroupId(group.id)
    touch()
    return group.id
  }

  const updateGroup = (groupId: string, patch: Partial<PlanGroup>) => {
    setScheme((s) => ({
      ...s,
      groups: (s.groups || []).map((g) => (g.id === groupId ? { ...g, ...patch } : g)),
    }))
    touch()
  }

  /** Трассы удалённой группы остаются на плане, просто без группы */
  const deleteGroup = (groupId: string) => {
    setScheme((s) => ({
      ...s,
      groups: (s.groups || []).filter((g) => g.id !== groupId),
      links: (s.links || []).map((l) => (l.groupId === groupId ? { ...l, groupId: null } : l)),
    }))
    if (linkGroupId === groupId) setLinkGroupId(null)
    touch()
  }

  const updateLink = (linkId: string, patch: Partial<PlanLink>) => {
    setScheme((s) => ({
      ...s,
      links: (s.links || []).map((l) => (l.id === linkId ? { ...l, ...patch } : l)),
    }))
    touch()
  }

  const deleteLink = (linkId: string) => {
    setScheme((s) => ({ ...s, links: (s.links || []).filter((l) => l.id !== linkId) }))
    setSelectedLinkId(null)
    touch()
  }

  /** Смена слоя сбрасывает инструмент и выделение — чтобы не рисовать стены поверх электрики */
  const changeLayer = (next: PlanLayer) => {
    setLayer(next)
    setTool("select")
    setLinkFromId(null)
    setSelectedNodeId(null)
    setSelectedLinkId(null)
    setDraft([])
    if (next === "electric") {
      setNodeKind("socket")
      setLinkSpec(LINK_SPECS.electric[1])
    } else if (next === "plumbing") {
      setNodeKind("water_cold")
      setLinkSpec(LINK_SPECS.plumbing[1])
    }
  }

  const updateCable = (patch: Partial<CableSettings>) => {
    setScheme((s) => ({ ...s, cable: { ...cableSettings(s.cable), ...patch } }))
    touch()
  }

  const updatePanel = (patch: Partial<PanelSettings>) => {
    setScheme((s) => ({ ...s, panel: { ...DEFAULT_PANEL, ...(s.panel || {}), ...patch } }))
    touch()
  }

  const setAllHeights = (height: number) => {
    setScheme((s) => ({
      ...s,
      defaultHeight: height,
      rooms: s.rooms.map((r) => ({ ...r, height })),
    }))
    touch()
  }

  const meta = {
    objectCode: object?.object_code || "",
    clientName: object?.client_name,
    address: object?.address,
  }

  const save = async () => {
    if (!id || !object) return
    if (scheme.rooms.length === 0) {
      setError("Нарисуйте хотя бы одно помещение")
      return
    }

    setSaving(true)
    setError("")
    try {
      const blob = (await downloadPlanPdf(scheme, meta, "blob")) as Blob
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result).split(",")[1] || "")
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

      const res = await objectPlansApi.save({
        object_id: Number(id),
        scheme: {
          ...scheme,
          rooms: scheme.rooms.map((r) => {
            const m = schemeMetrics({ ...scheme, rooms: [r] }).rooms[0]
            return {
              ...r,
              area: m.area,
              perimeter: m.perimeter,
              wall_area: m.wallAreaGross,
              wall_area_net: m.wallAreaNet,
            }
          }),
        },
        default_height: scheme.defaultHeight,
        totals: { floor: totals.floor, wall: totals.wallNet, perimeter: totals.perimeter },
        pdf_data: base64,
        file_name: `План помещений ${object.object_code}.pdf`,
        sync_rooms: syncRooms,
      })

      setFileUrl(res.file_url || fileUrl)
      setDirty(false)
      setMessage(
        res.synced_rooms > 0
          ? `План сохранён, PDF в файлах объекта. Помещений обновлено: ${res.synced_rooms}`
          : "План сохранён, PDF обновлён в файлах объекта",
      )
      setTimeout(() => setMessage(""), 4000)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить")
    } finally {
      setSaving(false)
    }
  }

  const exportPdf = async () => {
    if (scheme.rooms.length === 0) {
      setError("Нарисуйте хотя бы одно помещение")
      return
    }
    setExporting(true)
    try {
      await downloadPlanPdf(scheme, meta, "save")
    } finally {
      setExporting(false)
    }
  }

  return {
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
    linkGroupId,
    setLinkGroupId,
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
    fileUrl,
    dirty,
    syncRooms,
    setSyncRooms,
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
    addGroup,
    updateGroup,
    deleteGroup,
    updateLink,
    deleteLink,
    changeLayer,
    setAllHeights,
    updateCable,
    updatePanel,
    save,
    exportPdf,
  }
}
