import { squareUp } from "@/components/crm/planner/drawAssist"
import { useCallback, useEffect, useMemo, useState } from "react"
import { PlanTool } from "@/components/crm/planner/PlanCanvas"
import { objectsApi, objectPlansApi, ObjectItem } from "@/lib/api"
import { pointInPolygon, schemeMetrics } from "@/lib/planner/geometry"
import { downloadPlanPdf } from "@/lib/planner/planPdf"
import { cableSettings } from "@/lib/planner/cable"
import { panelSettings } from "@/lib/planner/panelInput"
import { FORCE_WALL, applyMounts, mountPosition, snapToWall } from "@/lib/planner/walls"
import { DrawingStamp,
  LINK_SPECS,
  NODE_PRESETS,
  NodeKind,
  OPENING_PRESETS,
  OpeningKind,
  CableSettings,
  PanelSettings,
  PlanGroup,
  PlanLayer,
  PlanLink,
  PlanNode,
  PlanOpening,
  PlanPoint,
  PlanRoom,
  PlanScheme,
  WallProps,
  DEFAULT_WALL,
  emptyScheme,
  isEngLayer,
  FixtureKind,
  PlanFixture,
  LightingSettings,
  lightingSettings,
  FURNITURE_PRESETS,
  FurnitureKind,
  HEATING_PRESETS,
  HeatingKind,
  PlanFurniture,
  PlanHeating,
  RoomFinish,
  RoomRender,
  roomFinish,
  LibraryItem,
  furnitureProps,
} from "@/lib/planner/types"
import { furnitureRoom, snapFurnitureToWall } from "@/lib/planner/interior"
import { furnitureLibraryApi } from "@/lib/api"
import { FLOATING_OFFSET, trackMid } from "@/lib/planner/fixtures"

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
  /** Мебель, которую ставим, и выбранный предмет */
  const [furnitureKind, setFurnitureKind] = useState<FurnitureKind>("bed_double")
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null)
  /** Библиотека своих предметов компании и выбранный для постановки */
  const [library, setLibrary] = useState<LibraryItem[]>([])
  const [libraryItemId, setLibraryItemId] = useState<number | null>(null)
  useEffect(() => {
    furnitureLibraryApi
      .list()
      .then((r) => setLibrary(r.items || []))
      .catch(() => setLibrary([]))
  }, [])
  /** Тип тёплого пола для новой зоны и выбранная зона */
  const [heatingKind, setHeatingKind] = useState<HeatingKind>("mat")
  const [selectedHeatingId, setSelectedHeatingId] = useState<string | null>(null)
  /** Выбранный трек или парящий потолок */
  const [selectedFixtureId, setSelectedFixtureId] = useState<string | null>(null)
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
              walls: raw.walls || {},
              fixtures: raw.fixtures || [],
              lighting: raw.lighting,
              furniture: raw.furniture || [],
              heating: raw.heating || [],
              finishes: raw.finishes || {},
              renders: raw.renders || {},
              stamp: raw.stamp,
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
        points: squareUp(points),
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
    setScheme((s) =>
      applyMounts({
        ...s,
        rooms: s.rooms.map((r) => (r.id === roomId ? { ...r, ...patch } : r)),
      }),
    )
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
        nodes: (s.nodes || []).map((n) =>
          n.mount?.wallId.startsWith(wallPrefix) ? { ...n, mount: null } : n,
        ),
      }
    })
    setSelectedRoomId(null)
    touch()
  }

  const updateOpening = (openingId: string, patch: Partial<PlanOpening>) => {
    setScheme((s) =>
      applyMounts({
        ...s,
        openings: s.openings.map((o) => (o.id === openingId ? { ...o, ...patch } : o)),
      }),
    )
    touch()
  }

  const deleteOpening = (openingId: string) => {
    setScheme((s) => applyMounts({ ...s, openings: s.openings.filter((o) => o.id !== openingId) }))
    setSelectedOpeningId(null)
    touch()
  }

  const moveVertex = (roomId: string, index: number, point: PlanPoint) => {
    setScheme((s) =>
      applyMounts({
        ...s,
        rooms: s.rooms.map((r) =>
          r.id === roomId
            ? { ...r, points: r.points.map((p, i) => (i === index ? point : p)) }
            : r,
        ),
      }),
    )
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
    if (!isEngLayer(layer)) return
    const preset = NODE_PRESETS[nodeKind]
    const room = [...scheme.rooms].reverse().find((r) => pointInPolygon(point, r.points))
    // Розетки, выключатели и щит садятся на ближайшую стену или в откос проёма
    const mount = FORCE_WALL.has(nodeKind) ? snapToWall(scheme, point) : null
    const pos = mount ? mountPosition(scheme, mount) : null
    const node: PlanNode = {
      id: uid(),
      layer,
      kind: nodeKind,
      x: pos ? pos.p.x : point.x,
      y: pos ? pos.p.y : point.y,
      height: preset.height,
      label: "",
      roomId: pos ? pos.wall.roomId : room ? room.id : null,
      mount: pos ? mount : null,
    }
    setScheme((s) => ({ ...s, nodes: [...(s.nodes || []), node] }))
    setSelectedNodeId(node.id)
    setSelectedLinkId(null)
    touch()
  }

  /**
   * Правка точки. Новая привязка — пересчитываем координаты по стене.
   * Ручные X/Y у настенной точки — снова сажаем её на ближайшую стену
   */
  const updateNode = (nodeId: string, patch: Partial<PlanNode>) => {
    setScheme((s) => ({
      ...s,
      nodes: (s.nodes || []).map((n) => {
        if (n.id !== nodeId) return n
        const next = { ...n, ...patch }
        if (patch.mount) {
          const pos = mountPosition(s, patch.mount)
          if (pos) return { ...next, x: pos.p.x, y: pos.p.y, roomId: pos.wall.roomId }
        } else if ((patch.x !== undefined || patch.y !== undefined) && FORCE_WALL.has(n.kind)) {
          const mount = snapToWall(s, { x: next.x, y: next.y })
          const pos = mount ? mountPosition(s, mount) : null
          if (pos) return { ...next, mount, x: pos.p.x, y: pos.p.y, roomId: pos.wall.roomId }
        }
        return next
      }),
    }))
    touch()
  }

  /** Трек — отрезок a–b; парящий потолок — контур от стен помещения с отступом */
  const addFixture = (kind: FixtureKind, a: PlanPoint, b: PlanPoint, points: PlanPoint[] = []) => {
    const mid = kind === "track" ? trackMid({ a, b, points } as PlanFixture) : { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
    const room = [...scheme.rooms].reverse().find((r) => pointInPolygon(mid, r.points))
    // Парящих потолков в комнате может быть несколько — каждый следующий контур глубже на 100 мм
    let offset = FLOATING_OFFSET
    if (kind === "floating") {
      if (!room) return
      const same = (scheme.fixtures || []).filter((f) => f.kind === "floating" && f.roomId === room.id)
      if (same.length) offset = Math.max(...same.map((f) => f.offset ?? FLOATING_OFFSET)) + FLOATING_OFFSET
    }
    const fx: PlanFixture = {
      id: uid(),
      kind,
      a,
      b,
      roomId: room ? room.id : null,
      label: "",
      height: room?.height ?? scheme.defaultHeight,
      offset: kind === "floating" ? Math.round(offset * 1000) / 1000 : undefined,
      points: kind === "track" && points.length ? points : undefined,
    }
    setScheme((s) => ({ ...s, fixtures: [...(s.fixtures || []), fx] }))
    setSelectedFixtureId(fx.id)
    setSelectedNodeId(null)
    setSelectedLinkId(null)
    touch()
  }

  const updateFixture = (fid: string, patch: Partial<PlanFixture>) => {
    setScheme((s) => ({
      ...s,
      fixtures: (s.fixtures || []).map((f) => {
        if (f.id !== fid) return f
        const next = { ...f, ...patch }
        if (patch.a || patch.b || patch.points) {
          const mid = next.kind === "track" ? trackMid(next) : { x: (next.a.x + next.b.x) / 2, y: (next.a.y + next.b.y) / 2 }
          next.roomId = [...s.rooms].reverse().find((r) => pointInPolygon(mid, r.points))?.id ?? next.roomId
        }
        return next
      }),
    }))
    touch()
  }

  const deleteFixture = (fid: string) => {
    setScheme((s) => ({ ...s, fixtures: (s.fixtures || []).filter((f) => f.id !== fid) }))
    setSelectedFixtureId(null)
    touch()
  }

  /** Предмет мебели: у стены — прижимается к ней тыльной стороной */
  const addFurniture = (point: PlanPoint) => {
    const lib = libraryItemId ? library.find((l) => l.id === libraryItemId) : null
    const pr = FURNITURE_PRESETS[lib ? lib.base_kind : furnitureKind]
    const size = lib ? { w: lib.width, d: lib.depth, h: lib.height } : { w: pr.w, d: pr.d, h: pr.h }
    const atWall = lib ? lib.at_wall : pr.wall
    const base = { x: point.x, y: point.y, w: size.w, d: size.d, rot: 0 }
    const snapped = atWall ? snapFurnitureToWall(scheme, base, 0.8) : null
    const at = snapped ? { ...base, ...snapped } : base
    const item: PlanFurniture = {
      id: uid(),
      kind: lib ? lib.base_kind : furnitureKind,
      x: at.x,
      y: at.y,
      ...size,
      rot: at.rot,
      label: lib ? lib.name : "",
      roomId: furnitureRoom(scheme, at)?.id ?? null,
      ...(lib
        ? {
            libraryId: lib.id,
            atWall: lib.at_wall,
            blocksHeating: lib.blocks_heating,
            blocksSockets: lib.blocks_sockets,
            color: lib.color || undefined,
            material: lib.material || undefined,
            modelUrl: lib.model_url || undefined,
          }
        : {}),
    }
    setScheme((s) => ({ ...s, furniture: [...(s.furniture || []), item] }))
    setSelectedFurnitureId(item.id)
    touch()
  }

  const updateFurniture = (fid: string, patch: Partial<PlanFurniture>) => {
    setScheme((s) => ({
      ...s,
      furniture: (s.furniture || []).map((f) => {
        if (f.id !== fid) return f
        const next = { ...f, ...patch }
        if (patch.x !== undefined || patch.y !== undefined) next.roomId = furnitureRoom(s, next)?.id ?? null
        return next
      }),
    }))
    touch()
  }

  /** Сохранить предмет в библиотеку компании — с его названием, размерами и свойствами */
  const saveToLibrary = async (f: PlanFurniture) => {
    const pr = furnitureProps(f)
    const res = await furnitureLibraryApi.create({
      name: f.label || FURNITURE_PRESETS[f.kind].label,
      base_kind: f.kind,
      width: f.w,
      depth: f.d,
      height: f.h,
      at_wall: pr.wall,
      blocks_heating: pr.blocksHeating,
      blocks_sockets: pr.blocksSockets,
      color: f.color || null,
      material: f.material || null,
      model_url: f.modelUrl || null,
    })
    setLibrary((l) => [...l, res.item].sort((a, b) => a.name.localeCompare(b.name, "ru")))
    updateFurniture(f.id, { libraryId: res.item.id, label: res.item.name })
    return res.item
  }

  const updateLibraryItem = async (item: LibraryItem) => {
    const res = await furnitureLibraryApi.update(item)
    setLibrary((l) => l.map((x) => (x.id === item.id ? res.item : x)))
    // Новая модель или материал — сразу на всех расставленных экземплярах этого предмета
    setScheme((s) => ({
      ...s,
      furniture: (s.furniture || []).map((f) =>
        f.libraryId === item.id ? { ...f, modelUrl: res.item.model_url || undefined, material: res.item.material || f.material } : f,
      ),
    }))
  }

  /** Новый предмет в библиотеку из формы; сразу выбираем его для расстановки */
  const createLibraryItem = async (data: Omit<LibraryItem, "id">) => {
    const res = await furnitureLibraryApi.create(data)
    setLibrary((l) => [...l, res.item].sort((a, b) => a.name.localeCompare(b.name, "ru")))
    setLibraryItemId(res.item.id)
    setTool("furniture")
  }

  const deleteLibraryItem = async (lid: number) => {
    await furnitureLibraryApi.remove(lid)
    setLibrary((l) => l.filter((x) => x.id !== lid))
    if (libraryItemId === lid) setLibraryItemId(null)
  }

  const deleteFurniture = (fid: string) => {
    setScheme((s) => ({ ...s, furniture: (s.furniture || []).filter((f) => f.id !== fid) }))
    setSelectedFurnitureId(null)
    touch()
  }

  /** Зона тёплого пола по нарисованному контуру */
  const addHeating = (points: PlanPoint[]) => {
    if (points.length < 3) return
    const pr = HEATING_PRESETS[heatingKind]
    const c = { x: points.reduce((a, p) => a + p.x, 0) / points.length, y: points.reduce((a, p) => a + p.y, 0) / points.length }
    const zone: PlanHeating = {
      id: uid(),
      kind: heatingKind,
      points: squareUp(points),
      roomId: furnitureRoom(scheme, c)?.id ?? null,
      power: pr.power,
      step: pr.step,
      cutFurniture: true,
      label: "",
    }
    setScheme((s) => ({ ...s, heating: [...(s.heating || []), zone] }))
    setSelectedHeatingId(zone.id)
    setDraft([])
    touch()
  }

  const updateHeating = (hid: string, patch: Partial<PlanHeating>) => {
    setScheme((s) => ({ ...s, heating: (s.heating || []).map((h) => (h.id === hid ? { ...h, ...patch } : h)) }))
    touch()
  }

  const deleteHeating = (hid: string) => {
    setScheme((s) => ({ ...s, heating: (s.heating || []).filter((h) => h.id !== hid) }))
    setSelectedHeatingId(null)
    touch()
  }

  /** Отделка помещения; applyToAll — на все помещения сразу */
  const updateFinish = (roomId: string, patch: Partial<RoomFinish>, applyToAll = false) => {
    setScheme((s) => {
      const finishes = { ...(s.finishes || {}) }
      const ids = applyToAll ? s.rooms.map((r) => r.id) : [roomId]
      for (const id of ids) finishes[id] = { ...roomFinish(s, id), ...patch }
      return { ...s, finishes }
    })
    touch()
  }

  /** Снимок 3D-вида: загружаем в хранилище и добавляем к комнате (до 3 ракурсов на комнату) */
  const addRender = async (roomId: string, dataUrl: string) => {
    const res = await objectPlansApi.uploadRender(Number(id), dataUrl)
    const item: RoomRender = { id: uid(), url: res.url, at: new Date().toISOString() }
    setScheme((s) => {
      const list = [...(s.renders?.[roomId] || []), item].slice(-3)
      return { ...s, renders: { ...(s.renders || {}), [roomId]: list } }
    })
    touch()
  }

  /** Картинка в хранилище объекта (автоснимок, логотип) — возвращает ссылку */
  const uploadImage = async (dataUrl: string) => (await objectPlansApi.uploadRender(Number(id), dataUrl)).url

  const setStamp = (stamp: DrawingStamp) => {
    setScheme((s) => ({ ...s, stamp }))
    touch()
  }

  const deleteRender = (roomId: string, renderId: string) => {
    setScheme((s) => ({
      ...s,
      renders: { ...(s.renders || {}), [roomId]: (s.renders?.[roomId] || []).filter((r) => r.id !== renderId) },
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
      nodes: (s.nodes || []).map((n) => {
        if (n.id !== nodeId) return n
        // Настенные точки скользят по стенам и откосам, со стены не уходят
        if (FORCE_WALL.has(n.kind)) {
          const mount = snapToWall(s, point)
          const pos = mount ? mountPosition(s, mount) : null
          if (pos) return { ...n, mount, x: pos.p.x, y: pos.p.y, roomId: pos.wall.roomId }
        }
        return n.id === nodeId
          ? {
              ...n,
              x: point.x,
              y: point.y,
              roomId:
                [...s.rooms].reverse().find((r) => pointInPolygon(point, r.points))?.id ?? null,
              mount: null,
            }
          : n
      }),
    }))
    setDirty(true)
  }

  /** Толщина и материал стены. applyToRoom — сразу на все стены помещения */
  const updateWall = (wallId: string, patch: Partial<WallProps>, applyToRoom = false) => {
    setScheme((s) => {
      const walls = { ...(s.walls || {}) }
      const roomId = wallId.split(":")[0]
      const room = s.rooms.find((r) => r.id === roomId)
      const ids = applyToRoom && room ? room.points.map((_, i) => `${roomId}:${i}`) : [wallId]
      for (const id of ids) walls[id] = { ...DEFAULT_WALL, ...(walls[id] || {}), ...patch }
      return applyMounts({ ...s, walls })
    })
    touch()
  }

  /**
   * Первый клик — откуда тянем, второй — куда. Между ними монтажник ставит
   * изломы трассы. Линия получает текущее сечение и идёт под прямыми углами
   */
  const handleLinkClick = (nodeId: string, bends: PlanPoint[] = []) => {
    if (!isEngLayer(layer)) return
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
    setSelectedFixtureId(null)
    setSelectedFurnitureId(null)
    setSelectedHeatingId(null)
    setDraft([])
    if (next === "interior") setTool("furniture")
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

  // panelSettings переводит старый формат ввода в список аппаратов — правим уже его
  const updateLighting = (patch: Partial<LightingSettings>) => {
    setScheme((s) => ({ ...s, lighting: { ...lightingSettings(s.lighting), ...patch } }))
    touch()
  }

  const updatePanel = (patch: Partial<PanelSettings>) => {
    setScheme((s) => {
      const { inputBreaker: _a, mainRcd: _b, ...rest } = { ...panelSettings(s.panel), ...patch }
      return { ...s, panel: rest }
    })
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
    selectedFixtureId,
    setSelectedFixtureId,
    addFixture,
    updateFixture,
    deleteFixture,
    furnitureKind,
    setFurnitureKind: (k: FurnitureKind) => {
      setFurnitureKind(k)
      setLibraryItemId(null)
    },
    library,
    libraryItemId,
    setLibraryItemId,
    saveToLibrary,
    createLibraryItem,
    updateLibraryItem,
    deleteLibraryItem,
    selectedFurnitureId,
    setSelectedFurnitureId,
    addFurniture,
    updateFurniture,
    deleteFurniture,
    heatingKind,
    setHeatingKind,
    selectedHeatingId,
    setSelectedHeatingId,
    addHeating,
    updateHeating,
    deleteHeating,
    updateFinish,
    addRender,
    uploadImage,
    setStamp,
    deleteRender,
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
    updateWall,
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
    updateLighting,
    save,
    exportPdf,
  }
}
