import { useCallback, useEffect, useRef, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { PromoAsset, PromoAssetKind, siteApi } from "@/lib/api"
import { resizeImageToDataUrl } from "@/lib/imageUpload"
import type { Orientation, PromoDesign, PromoEl, PromoFormat, PromoSide } from "@/lib/promoTypes"
import { FONTS_HREF, FORMATS, pageSize, rescaleDesign, sheetLayout, uid } from "./formats"
import { Contacts } from "./templates"
import { EditorCanvas } from "./EditorCanvas"
import { LeftPanel, PanelTab } from "./LeftPanel"
import { PropsBar } from "./PropsBar"
import { PrintOptions } from "./printDesign"
import { EditorHeader } from "./EditorHeader"
import { EditorSidebar } from "./EditorSidebar"
import { EditorFooter } from "./EditorFooter"
import { PrintDialog } from "./PrintDialog"

interface Props {
  id?: number
  title: string
  design: PromoDesign
  contacts: Contacts
  onClose: () => void
  onSaved: (id: number, title: string, design: PromoDesign) => void
}

const clone = (d: PromoDesign): PromoDesign => JSON.parse(JSON.stringify(d))

export function PromoEditor({ id, title: initialTitle, design: initial, contacts, onClose, onSaved }: Props) {
  const { toast } = useToast()
  const [design, setDesign] = useState<PromoDesign>(() => clone(initial))
  const [title, setTitle] = useState(initialTitle)
  const [itemId, setItemId] = useState<number | undefined>(id)
  const [sideIdx, setSideIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [tab, setTab] = useState<PanelTab>(id ? "text" : "templates")
  const [panelOpen, setPanelOpen] = useState(true)
  const [zoom, setZoom] = useState(3)
  const [fitZoom, setFitZoom] = useState(3)
  const [dirty, setDirty] = useState(!id)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploads, setUploads] = useState<PromoAsset[]>([])
  const [printOpen, setPrintOpen] = useState(false)
  const [printOpts, setPrintOpts] = useState<PrintOptions>({ sides: "both", cutLines: true, fill: true })
  const past = useRef<PromoDesign[]>([])
  const future = useRef<PromoDesign[]>([])
  const snapshot = useRef<PromoDesign>(clone(initial))
  const areaRef = useRef<HTMLDivElement>(null)
  const [, force] = useState(0)

  const { w, h } = pageSize(design.format, design.orientation)
  const safe = FORMATS[design.format].safe
  const side = design.sides[sideIdx] || design.sides[0]
  const selEl = side.elements.find((e) => e.id === selected) || null

  useEffect(() => {
    if (document.querySelector(`link[data-promo-fonts]`)) return
    const l = document.createElement("link")
    l.rel = "stylesheet"
    l.href = FONTS_HREF
    l.dataset.promoFonts = "1"
    document.head.appendChild(l)
  }, [])

  const fit = useCallback(() => {
    const el = areaRef.current
    if (!el) return
    const z = Math.min((el.clientWidth - 64) / w, (el.clientHeight - 64) / h)
    const v = Math.max(0.5, Math.min(20, z))
    setFitZoom(v)
    setZoom(v)
  }, [w, h])

  useEffect(() => {
    fit()
    const el = areaRef.current
    if (!el) return
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [fit, panelOpen])

  const commit = useCallback((next: PromoDesign) => {
    past.current.push(snapshot.current)
    if (past.current.length > 80) past.current.shift()
    future.current = []
    snapshot.current = clone(next)
    setDirty(true)
    force((n) => n + 1)
  }, [])

  const designRef = useRef(design)
  designRef.current = design

  const apply = (fn: (d: PromoDesign) => PromoDesign, record = true) => {
    const next = fn(designRef.current)
    designRef.current = next
    setDesign(next)
    if (record) commit(next)
  }

  const updateSide = (fn: (s: PromoSide) => PromoSide, record = true) =>
    apply((d) => ({ ...d, sides: d.sides.map((s, i) => (i === sideIdx ? fn(s) : s)) }), record)

  const updateEl = (elId: string, patch: Partial<PromoEl>, record = true) =>
    updateSide((s) => ({ ...s, elements: s.elements.map((e) => (e.id === elId ? ({ ...e, ...patch } as PromoEl) : e)) }), record)

  const undo = () => {
    const prev = past.current.pop()
    if (!prev) return
    future.current.push(snapshot.current)
    snapshot.current = clone(prev)
    setDesign(clone(prev))
    setSelected(null)
    setDirty(true)
  }
  const redo = () => {
    const next = future.current.pop()
    if (!next) return
    past.current.push(snapshot.current)
    snapshot.current = clone(next)
    setDesign(clone(next))
    setSelected(null)
    setDirty(true)
  }

  const addEl = (el: PromoEl) => {
    updateSide((s) => ({ ...s, elements: [...s.elements, el] }))
    setSelected(el.id)
  }

  const action = (a: "delete" | "duplicate" | "front" | "back" | "lock" | "center-h" | "center-v" | "fit") => {
    if (!selEl) return
    updateSide((s) => {
      const els = [...s.elements]
      const i = els.findIndex((e) => e.id === selEl.id)
      const el = els[i]
      switch (a) {
        case "delete":
          els.splice(i, 1)
          break
        case "duplicate": {
          const copy = { ...el, id: uid(), x: el.x + 2, y: el.y + 2, locked: false }
          els.splice(i + 1, 0, copy)
          setTimeout(() => setSelected(copy.id))
          break
        }
        case "front":
          els.splice(i, 1)
          els.push(el)
          break
        case "back":
          els.splice(i, 1)
          els.unshift(el)
          break
        case "lock":
          els[i] = { ...el, locked: !el.locked }
          break
        case "center-h":
          els[i] = { ...el, x: Math.round(((w - el.w) / 2) * 10) / 10 }
          break
        case "center-v":
          els[i] = { ...el, y: Math.round(((h - el.h) / 2) * 10) / 10 }
          break
        case "fit":
          els.splice(i, 1)
          els.unshift({ ...el, x: 0, y: 0, w, h, rot: 0 })
          break
      }
      return { ...s, elements: els }
    })
    if (a === "delete") setSelected(null)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
        return
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault()
        redo()
        return
      }
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault()
        save()
        return
      }
      if (!selEl) return
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault()
        action("delete")
      } else if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault()
        action("duplicate")
      } else if (e.key.startsWith("Arrow") && !selEl.locked) {
        e.preventDefault()
        const step = e.shiftKey ? 5 : 0.5
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0
        updateEl(selEl.id, { x: selEl.x + dx, y: selEl.y + dy })
      } else if (e.key === "Escape") setSelected(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  useEffect(() => {
    if (!dirty) return
    const h = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", h)
    return () => window.removeEventListener("beforeunload", h)
  }, [dirty])

  useEffect(() => {
    siteApi.promo
      .assets()
      .then((r) => setUploads(r.items || []))
      .catch(() => undefined)
  }, [])

  const removeAsset = async (a: PromoAsset) => {
    if (!window.confirm("Удалить из библиотеки? В уже готовых макетах картинка останется.")) return
    try {
      await siteApi.promo.removeAsset(a.id)
      setUploads((u) => u.filter((x) => x.id !== a.id))
    } catch (e) {
      toast({ variant: "destructive", title: "Не удалось удалить", description: e instanceof Error ? e.message : "" })
    }
  }

  const toggleAssetKind = async (a: PromoAsset) => {
    const kind: PromoAssetKind = a.kind === "logo" ? "photo" : "logo"
    setUploads((u) => u.map((x) => (x.id === a.id ? { ...x, kind } : x)))
    siteApi.promo.setAssetKind(a.id, kind).catch(() => undefined)
  }

  const upload = async (file: File, kind: PromoAssetKind = "photo"): Promise<string | null> => {
    setUploading(true)
    try {
      const data = await resizeImageToDataUrl(file, kind === "logo" ? 1600 : 2400, 0.88)
      const asset = await siteApi.promo.upload(data, kind, file.name.replace(/\.[^.]+$/, ""))
      setUploads((u) => [asset, ...u])
      return asset.url
    } catch (e) {
      toast({ variant: "destructive", title: "Не удалось загрузить фото", description: e instanceof Error ? e.message : "" })
      return null
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      const kind = design.format === "card" ? "card" : "flyer"
      const saved = await siteApi.promo.save({ id: itemId, kind, title: title.trim() || "Без названия", data: design })
      setItemId(saved.id)
      setDirty(false)
      onSaved(saved.id, saved.title, design)
      toast({ title: "Макет сохранён" })
    } catch (e) {
      toast({ variant: "destructive", title: "Не удалось сохранить", description: e instanceof Error ? e.message : "" })
    } finally {
      setSaving(false)
    }
  }

  const close = () => {
    if (dirty && !window.confirm("Изменения не сохранены. Закрыть без сохранения?")) return
    onClose()
  }

  const setFormat = (format: PromoFormat, orientation: Orientation) => {
    if (format === design.format && orientation === design.orientation) return
    apply((d) => {
      const next = rescaleDesign(d, format, orientation)
      if (format === "card" && next.sides.length < 2) next.sides.push({ bg: "#ffffff", elements: [] })
      return next
    })
    setSelected(null)
  }

  const isCard = design.format === "card"
  const L = sheetLayout(design.format, design.orientation)
  const perSheet = L.cols * L.rows

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#121212] text-white">
      <EditorHeader
        title={title}
        design={design}
        isCard={isCard}
        canUndo={!!past.current.length}
        canRedo={!!future.current.length}
        saving={saving}
        dirty={dirty}
        onClose={close}
        onTitleChange={(v) => {
          setTitle(v)
          setDirty(true)
        }}
        onFormat={setFormat}
        onUndo={undo}
        onRedo={redo}
        onPrint={() => setPrintOpen(true)}
        onSave={save}
      />

      <div className="flex min-h-0 flex-1">
        <EditorSidebar tab={tab} panelOpen={panelOpen} setTab={setTab} setPanelOpen={setPanelOpen}>
          <LeftPanel
            tab={tab}
            design={design}
            side={side}
            pageW={w}
            pageH={h}
            contacts={contacts}
            uploads={uploads}
            uploading={uploading}
            onUpload={upload}
            onRemoveAsset={removeAsset}
            onToggleAssetKind={toggleAssetKind}
            onAdd={addEl}
            onSide={(patch) => updateSide((s) => ({ ...s, ...patch }))}
            onTemplate={(d) => {
              if (side.elements.length && !window.confirm("Заменить текущий макет шаблоном?")) return
              apply(() => clone(d))
              setSideIdx(0)
              setSelected(null)
              setTab("text")
            }}
          />
        </EditorSidebar>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-12 shrink-0 items-center gap-2 overflow-x-auto border-b border-white/10 bg-[#1a1a1a] px-3 py-2">
            {selEl ? (
              <PropsBar
                el={selEl}
                onChange={(patch) => updateEl(selEl.id, patch)}
                onAction={action}
                onReplaceImage={async (f) => {
                  const url = await upload(f)
                  if (url) updateEl(selEl.id, { src: url } as Partial<PromoEl>)
                }}
              />
            ) : (
              <span className="text-xs text-white/40">
                Кликните по элементу, чтобы изменить. Двойной клик по тексту — писать прямо на макете. Перетаскивайте мышкой, тяните за уголки.
              </span>
            )}
          </div>

          <div ref={areaRef} className="relative min-h-0 flex-1 overflow-auto bg-[#2b2b2b]" onPointerDown={(e) => e.target === e.currentTarget && setSelected(null)}>
            <div className="flex min-h-full min-w-full items-center justify-center p-8" style={{ width: "max-content", height: "max-content" }} onPointerDown={(e) => e.target === e.currentTarget && setSelected(null)}>
              <EditorCanvas
                side={side}
                w={w}
                h={h}
                safe={safe}
                zoom={zoom}
                selectedId={selected}
                onSelect={setSelected}
                onChange={(elId, patch, record) => updateEl(elId, patch, record)}
              />
            </div>
          </div>

          <EditorFooter
            design={design}
            sideIdx={sideIdx}
            isCard={isCard}
            w={w}
            h={h}
            zoom={zoom}
            fitZoom={fitZoom}
            setZoom={setZoom}
            onSelectSide={(i) => {
              setSideIdx(i)
              setSelected(null)
            }}
            onAddBack={() => apply((d) => ({ ...d, sides: [...d.sides, { bg: d.sides[0].bg, elements: [] }] }))}
            onCopySide={() => {
              if (!window.confirm("Скопировать эту сторону на другую? Содержимое другой стороны заменится.")) return
              apply((d) => ({ ...d, sides: d.sides.map((s, i) => (i === sideIdx ? s : { ...side, elements: side.elements.map((e) => ({ ...e, id: uid() })) })) }))
            }}
            onDeleteBack={() => {
              if (!window.confirm("Удалить оборотную сторону?")) return
              apply((d) => ({ ...d, sides: [d.sides[0]] }))
              setSideIdx(0)
            }}
            onClearSide={() => {
              if (!window.confirm("Удалить все элементы с этой стороны?")) return
              updateSide((s) => ({ ...s, elements: [], bgImage: "", bgDim: 0 }))
              setSelected(null)
            }}
          />
        </main>
      </div>

      <PrintDialog open={printOpen} setOpen={setPrintOpen} design={design} title={title} perSheet={perSheet} printOpts={printOpts} setPrintOpts={setPrintOpts} />
    </div>
  )
}

export default PromoEditor
