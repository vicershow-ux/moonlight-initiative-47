import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { PlanCanvas, PlanTool } from "@/components/crm/planner/PlanCanvas"
import { PlanSidebar } from "@/components/crm/planner/PlanSidebar"
import { objectsApi, objectPlansApi, ObjectItem } from "@/lib/api"
import { schemeMetrics } from "@/lib/planner/geometry"
import { downloadPlanPdf } from "@/lib/planner/planPdf"
import {
  OPENING_PRESETS,
  OpeningKind,
  PlanOpening,
  PlanPoint,
  PlanRoom,
  PlanScheme,
  emptyScheme,
} from "@/lib/planner/types"

const uid = () => Math.random().toString(36).slice(2, 10)

const goldBtn =
  "flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 min-h-[44px] rounded-lg disabled:opacity-40"

const ghostBtn =
  "flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 transition-colors text-sm px-4 min-h-[44px] rounded-lg disabled:opacity-40"

const TOOLS: { key: PlanTool; label: string; icon: string }[] = [
  { key: "select", label: "Выбор", icon: "MousePointer2" },
  { key: "draw", label: "Стены", icon: "PenLine" },
  { key: "window", label: "Окно", icon: "RectangleHorizontal" },
  { key: "door", label: "Дверь", icon: "DoorOpen" },
  { key: "arch", label: "Проём", icon: "Frame" },
]

export default function ObjectPlanner() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [object, setObject] = useState<ObjectItem | null>(null)
  const [scheme, setScheme] = useState<PlanScheme>(emptyScheme())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const [tool, setTool] = useState<PlanTool>("draw")
  const [draft, setDraft] = useState<PlanPoint[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [selectedOpeningId, setSelectedOpeningId] = useState<string | null>(null)
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

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {TOOLS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTool(t.key)
                if (t.key !== "draw") setDraft([])
              }}
              className={`flex min-h-[42px] items-center gap-2 rounded-lg px-3 text-sm transition-colors ${
                tool === t.key
                  ? "bg-[#D4AF37] text-[#161616]"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              <Icon name={t.icon} size={16} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {draft.length > 0 && (
            <>
              <button className={ghostBtn} onClick={() => setDraft(draft.slice(0, -1))}>
                <Icon name="Undo2" size={16} />
                Отменить точку
              </button>
              {draft.length >= 3 && (
                <button className={goldBtn} onClick={() => finishRoom(draft)}>
                  <Icon name="Check" size={16} />
                  Замкнуть
                </button>
              )}
            </>
          )}
          <button className={ghostBtn} onClick={exportPdf} disabled={exporting}>
            <Icon
              name={exporting ? "Loader2" : "Download"}
              size={16}
              className={exporting ? "animate-spin" : ""}
            />
            Скачать PDF
          </button>
          <button className={goldBtn} onClick={save} disabled={saving}>
            <Icon
              name={saving ? "Loader2" : "Save"}
              size={16}
              className={saving ? "animate-spin" : ""}
            />
            Сохранить
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-[#1f1f1f] p-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white/50">Высота стен, м</span>
          <input
            className="w-24 rounded-lg border border-white/10 bg-[#161616] px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"
            type="number"
            min="1"
            step="0.05"
            value={scheme.defaultHeight}
            onChange={(e) => setAllHeights(Number(e.target.value))}
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-white/60">
          <input
            type="checkbox"
            checked={syncRooms}
            onChange={(e) => setSyncRooms(e.target.checked)}
            className="h-4 w-4 accent-[#D4AF37]"
          />
          Переносить метраж в помещения объекта
        </label>
        {fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm text-[#D4AF37] hover:text-[#B8860B]"
          >
            <Icon name="FileText" size={15} />
            Открыть сохранённый PDF
          </a>
        )}
        {dirty && (
          <span className="flex items-center gap-1.5 text-xs text-amber-400">
            <Icon name="CircleAlert" size={13} />
            Есть несохранённые изменения
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#141414]">
          <PlanCanvas
            scheme={scheme}
            tool={tool}
            draft={draft}
            selectedRoomId={selectedRoomId}
            selectedOpeningId={selectedOpeningId}
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
            onAddOpening={addOpening}
            onMoveVertex={moveVertex}
          />
        </div>

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
      </div>
    </CrmLayout>
  )
}