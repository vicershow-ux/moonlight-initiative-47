import { useCallback, useEffect, useRef, useState } from "react"
import Icon from "@/components/ui/icon"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { siteApi } from "@/lib/api"
import { resizeImageToDataUrl } from "@/lib/imageUpload"
import type { Orientation, PromoDesign, PromoEl, PromoFormat, PromoSide } from "@/lib/promoTypes"
import { FONTS_HREF, FORMATS, pageSize, rescaleDesign, sheetLayout, uid } from "./formats"
import { Contacts } from "./templates"
import { EditorCanvas } from "./EditorCanvas"
import { LeftPanel, PanelTab, TABS } from "./LeftPanel"
import { PropsBar } from "./PropsBar"
import { PrintOptions, printDesign } from "./printDesign"
import { ToolBtn } from "./ui"

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
  const [uploads, setUploads] = useState<string[]>([])
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

  const upload = async (file: File): Promise<string | null> => {
    setUploading(true)
    try {
      const data = await resizeImageToDataUrl(file, 2400, 0.88)
      const { url } = await siteApi.promo.upload(data)
      setUploads((u) => [url, ...u])
      return url
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
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 bg-[#1a1a1a] px-3">
        <button onClick={close} className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-white/70 hover:bg-white/10">
          <Icon name="ArrowLeft" size={16} />
          <span className="hidden sm:inline">Макеты</span>
        </button>
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            setDirty(true)
          }}
          className="h-9 w-44 min-w-0 rounded-md border border-transparent bg-transparent px-2 text-sm font-medium outline-none hover:border-white/10 focus:border-[#D4AF37]/50 md:w-64"
        />
        <div className="hidden items-center gap-1 rounded-lg bg-[#161616] p-1 lg:flex">
          {(Object.keys(FORMATS) as PromoFormat[])
            .filter((f) => (isCard ? f === "card" : f !== "card"))
            .map((f) => (
              <button key={f} onClick={() => setFormat(f, design.orientation)} className={`rounded-md px-2.5 py-1.5 text-xs ${design.format === f ? "bg-white/15 text-white" : "text-white/50 hover:text-white"}`}>
                {FORMATS[f].label}
              </button>
            ))}
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-[#161616] p-1">
          <ToolBtn icon="RectangleVertical" title="Вертикально" active={design.orientation === "portrait"} onClick={() => setFormat(design.format, "portrait")} />
          <ToolBtn icon="RectangleHorizontal" title="Горизонтально" active={design.orientation === "landscape"} onClick={() => setFormat(design.format, "landscape")} />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <ToolBtn icon="Undo2" title="Отменить (Ctrl+Z)" disabled={!past.current.length} onClick={undo} />
          <ToolBtn icon="Redo2" title="Повторить (Ctrl+Y)" disabled={!future.current.length} onClick={redo} />
          <button onClick={() => setPrintOpen(true)} className="ml-1 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/15">
            <Icon name="Printer" size={15} />
            <span className="hidden sm:inline">Печать</span>
          </button>
          <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-medium text-[#161616] hover:bg-[#B8860B] disabled:opacity-50">
            <Icon name={saving ? "Loader2" : "Save"} size={15} className={saving ? "animate-spin" : ""} />
            <span className="hidden sm:inline">{dirty ? "Сохранить" : "Сохранено"}</span>
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <nav className="flex w-[68px] shrink-0 flex-col border-r border-white/10 bg-[#1a1a1a] py-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                if (tab === t.id) setPanelOpen((o) => !o)
                else {
                  setTab(t.id)
                  setPanelOpen(true)
                }
              }}
              className={`flex flex-col items-center gap-1 py-3 text-[10px] ${tab === t.id && panelOpen ? "bg-[#D4AF37]/15 text-[#D4AF37]" : "text-white/55 hover:text-white"}`}
            >
              <Icon name={t.icon} size={20} />
              {t.label}
            </button>
          ))}
        </nav>

        {panelOpen && (
          <aside className="absolute bottom-0 left-[68px] top-14 z-10 w-72 overflow-y-auto border-r border-white/10 bg-[#1f1f1f] p-4 shadow-2xl md:static md:shadow-none">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">{TABS.find((t) => t.id === tab)?.label}</span>
              <button onClick={() => setPanelOpen(false)} className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-white" aria-label="Скрыть">
                <Icon name="ChevronsLeft" size={16} />
              </button>
            </div>
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
          </aside>
        )}

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

          <footer className="flex h-14 shrink-0 items-center gap-3 border-t border-white/10 bg-[#1a1a1a] px-3">
            {design.sides.length > 1 ? (
              <div className="flex rounded-lg bg-[#161616] p-1">
                {design.sides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSideIdx(i)
                      setSelected(null)
                    }}
                    className={`rounded-md px-3 py-1.5 text-xs ${sideIdx === i ? "bg-[#D4AF37] font-medium text-[#161616]" : "text-white/60 hover:text-white"}`}
                  >
                    {i === 0 ? "Лицевая сторона" : "Оборотная сторона"}
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => apply((d) => ({ ...d, sides: [...d.sides, { bg: d.sides[0].bg, elements: [] }] }))}
                className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10"
              >
                <Icon name="Plus" size={13} /> Добавить оборот
              </button>
            )}
            {design.sides.length > 1 && (
              <>
                <ToolBtn
                  icon="Copy"
                  title="Скопировать эту сторону на другую"
                  onClick={() => {
                    if (!window.confirm("Скопировать эту сторону на другую? Содержимое другой стороны заменится.")) return
                    apply((d) => ({ ...d, sides: d.sides.map((s, i) => (i === sideIdx ? s : { ...side, elements: side.elements.map((e) => ({ ...e, id: uid() })) })) }))
                  }}
                />
                {!isCard && (
                  <ToolBtn
                    icon="Trash2"
                    title="Удалить оборот"
                    onClick={() => {
                      if (!window.confirm("Удалить оборотную сторону?")) return
                      apply((d) => ({ ...d, sides: [d.sides[0]] }))
                      setSideIdx(0)
                    }}
                  />
                )}
              </>
            )}
            <ToolBtn
              icon="Eraser"
              title="Очистить сторону"
              onClick={() => {
                if (!window.confirm("Удалить все элементы с этой стороны?")) return
                updateSide((s) => ({ ...s, elements: [], bgImage: "", bgDim: 0 }))
                setSelected(null)
              }}
            />
            <span className="hidden text-xs text-white/35 md:inline">
              {w}×{h} мм · пунктир — безопасная зона
            </span>
            <div className="ml-auto flex items-center gap-1">
              <ToolBtn icon="Minus" title="Уменьшить" onClick={() => setZoom((z) => Math.max(0.5, z / 1.2))} />
              <button onClick={() => setZoom(fitZoom)} className="w-14 rounded-md py-1.5 text-center text-xs text-white/70 hover:bg-white/10" title="Вписать в экран">
                {Math.round((zoom / fitZoom) * 100)}%
              </button>
              <ToolBtn icon="Plus" title="Увеличить" onClick={() => setZoom((z) => Math.min(40, z * 1.2))} />
            </div>
          </footer>
        </main>
      </div>

      <Dialog open={printOpen} onOpenChange={setPrintOpen}>
        <DialogContent className="border-white/10 bg-[#1f1f1f] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Печать на листе А4</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {design.sides.length > 1 && (
              <div className="space-y-1.5">
                <div className="text-xs text-white/50">Что печатать</div>
                <div className="grid grid-cols-3 gap-1 rounded-lg bg-[#161616] p-1">
                  {(
                    [
                      ["both", "Обе стороны"],
                      ["front", "Лицевую"],
                      ["back", "Оборот"],
                    ] as const
                  ).map(([v, l]) => (
                    <button key={v} onClick={() => setPrintOpts((o) => ({ ...o, sides: v }))} className={`rounded-md py-2 text-xs ${printOpts.sides === v ? "bg-[#D4AF37] font-medium text-[#161616]" : "text-white/60"}`}>
                      {l}
                    </button>
                  ))}
                </div>
                {printOpts.sides === "both" && <p className="text-[11px] text-white/40">Оборот печатается вторым листом. Вставьте первый лист обратной стороной и напечатайте оборот — визитки совпадут.</p>}
              </div>
            )}
            {perSheet > 1 && (
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>Заполнить лист ({perSheet} шт. на А4)</span>
                <input type="checkbox" checked={printOpts.fill} onChange={(e) => setPrintOpts((o) => ({ ...o, fill: e.target.checked }))} className="h-4 w-4 accent-[#D4AF37]" />
              </label>
            )}
            {perSheet > 1 && (
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>Пунктир для отреза</span>
                <input type="checkbox" checked={printOpts.cutLines} onChange={(e) => setPrintOpts((o) => ({ ...o, cutLines: e.target.checked }))} className="h-4 w-4 accent-[#D4AF37]" />
              </label>
            )}
            <p className="rounded-lg bg-white/5 p-3 text-xs text-white/60">В окне печати выберите масштаб «100%» (или «Фактический размер»), поля «Нет» и включите «Фон и цвета».</p>
            <button
              onClick={() => {
                setPrintOpen(false)
                printDesign(design, title, printOpts)
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#D4AF37] py-3 text-sm font-medium text-[#161616] hover:bg-[#B8860B]"
            >
              <Icon name="Printer" size={16} /> Печатать
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PromoEditor
