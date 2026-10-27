import { PointerEvent as RPointerEvent, useEffect, useRef, useState } from "react"
import type { PromoEl, PromoSide, TextEl } from "@/lib/promoTypes"
import { MM_PX } from "./formats"
import { ElementContent, SideBackground, elementBox, textStyle } from "./SideView"

type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w"
const HANDLES: Handle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"]
const CURSOR: Record<Handle, string> = { nw: "nwse-resize", se: "nwse-resize", ne: "nesw-resize", sw: "nesw-resize", n: "ns-resize", s: "ns-resize", e: "ew-resize", w: "ew-resize" }

interface Props {
  side: PromoSide
  w: number
  h: number
  safe: number
  zoom: number
  selectedId: string | null
  onSelect: (id: string | null) => void
  onChange: (id: string, patch: Partial<PromoEl>, commit: boolean) => void
}

interface Drag {
  id: string
  mode: "move" | Handle
  sx: number
  sy: number
  el: PromoEl
  moved: boolean
}

const SNAP = 1.2

export function EditorCanvas({ side, w, h, safe, zoom, selectedId, onSelect, onChange }: Props) {
  const scale = zoom / MM_PX
  const drag = useRef<Drag | null>(null)
  const [guides, setGuides] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] })
  const [editing, setEditing] = useState<string | null>(null)
  const editRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editing && editing !== selectedId) setEditing(null)
  }, [selectedId, editing])

  useEffect(() => {
    if (!editing || !editRef.current) return
    const el = side.elements.find((e) => e.id === editing) as TextEl | undefined
    editRef.current.innerText = el?.text || ""
    editRef.current.focus()
    const range = document.createRange()
    range.selectNodeContents(editRef.current)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

  const snap = (el: PromoEl, x: number, y: number) => {
    const others = side.elements.filter((o) => o.id !== el.id)
    const xs = [0, w / 2, w, safe, w - safe, ...others.flatMap((o) => [o.x, o.x + o.w / 2, o.x + o.w])]
    const ys = [0, h / 2, h, safe, h - safe, ...others.flatMap((o) => [o.y, o.y + o.h / 2, o.y + o.h])]
    const gx: number[] = []
    const gy: number[] = []
    let nx = x
    let ny = y
    for (const [off, key] of [[0, "l"], [el.w / 2, "c"], [el.w, "r"]] as const) {
      void key
      const t = xs.find((v) => Math.abs(v - (x + off)) < SNAP)
      if (t !== undefined && !gx.length) {
        nx = t - off
        gx.push(t)
      }
    }
    for (const off of [0, el.h / 2, el.h]) {
      const t = ys.find((v) => Math.abs(v - (y + off)) < SNAP)
      if (t !== undefined && !gy.length) {
        ny = t - off
        gy.push(t)
      }
    }
    return { x: nx, y: ny, gx, gy }
  }

  const start = (e: RPointerEvent, el: PromoEl, mode: Drag["mode"]) => {
    if (e.button !== 0) return
    e.stopPropagation()
    onSelect(el.id)
    if (el.locked || editing === el.id) return
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    drag.current = { id: el.id, mode, sx: e.clientX, sy: e.clientY, el: { ...el }, moved: false }
  }

  const move = (e: RPointerEvent) => {
    const d = drag.current
    if (!d) return
    const dx = (e.clientX - d.sx) / zoom
    const dy = (e.clientY - d.sy) / zoom
    if (!d.moved && Math.abs(dx) + Math.abs(dy) < 0.3) return
    d.moved = true
    const o = d.el
    if (d.mode === "move") {
      const s = e.altKey ? { x: o.x + dx, y: o.y + dy, gx: [], gy: [] } : snap(o, o.x + dx, o.y + dy)
      setGuides({ x: s.gx, y: s.gy })
      onChange(d.id, { x: round(s.x), y: round(s.y) }, false)
      return
    }
    let { x, y, w: ew, h: eh } = o
    const m = d.mode
    if (m.includes("e")) ew = o.w + dx
    if (m.includes("s")) eh = o.h + dy
    if (m.includes("w")) {
      ew = o.w - dx
      x = o.x + dx
    }
    if (m.includes("n")) {
      eh = o.h - dy
      y = o.y + dy
    }
    const keepRatio = (o.type === "qr" || o.type === "icon" || e.shiftKey) && m.length === 2
    if (keepRatio) {
      const r = o.w / o.h
      if (Math.abs(ew - o.w) > Math.abs(eh - o.h) * r) eh = ew / r
      else ew = eh * r
      if (m.includes("w")) x = o.x + o.w - ew
      if (m.includes("n")) y = o.y + o.h - eh
    }
    ew = Math.max(2, ew)
    eh = Math.max(2, eh)
    const patch: Partial<PromoEl> = { x: round(x), y: round(y), w: round(ew), h: round(eh) }
    if (o.type === "qr" || o.type === "icon") patch.h = patch.w
    onChange(d.id, patch, false)
  }

  const end = () => {
    const d = drag.current
    drag.current = null
    setGuides({ x: [], y: [] })
    if (d?.moved) onChange(d.id, {}, true)
  }

  const finishEdit = () => {
    if (!editing || !editRef.current) return
    const text = editRef.current.innerText.replace(/\n$/, "")
    onChange(editing, { text } as Partial<PromoEl>, true)
    setEditing(null)
  }

  const handleSize = 9 / scale

  return (
    <div
      style={{ width: w * zoom, height: h * zoom, position: "relative", touchAction: "none" }}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div
        onPointerDown={() => {
          finishEdit()
          onSelect(null)
        }}
        style={{
          width: `${w}mm`,
          height: `${h}mm`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
          left: 0,
          top: 0,
          background: side.bg,
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(0,0,0,.45)",
        }}
      >
        <SideBackground side={side} />
        {side.elements.map((el) => {
          const isEditing = editing === el.id && el.type === "text"
          return (
            <div
              key={el.id}
              style={{ ...elementBox(el), cursor: el.locked ? "default" : isEditing ? "text" : "move" }}
              onPointerDown={(e) => start(e, el, "move")}
              onDoubleClick={(e) => {
                e.stopPropagation()
                if (el.type === "text" && !el.locked) setEditing(el.id)
              }}
            >
              {isEditing ? (
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: el.valign === "middle" ? "center" : el.valign === "bottom" ? "flex-end" : "flex-start" }}>
                  <div
                    ref={editRef}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={finishEdit}
                    onKeyDown={(e) => {
                      e.stopPropagation()
                      if (e.key === "Escape") finishEdit()
                    }}
                    onPaste={(e) => {
                      e.preventDefault()
                      document.execCommand("insertText", false, e.clipboardData.getData("text/plain"))
                    }}
                    style={{ ...textStyle(el), cursor: "text", minHeight: "1em" }}
                  />
                </div>
              ) : (
                <ElementContent el={el} />
              )}
            </div>
          )
        })}

        <div style={{ position: "absolute", left: `${safe}mm`, top: `${safe}mm`, right: `${safe}mm`, bottom: `${safe}mm`, border: `${1 / scale}px dashed rgba(120,120,120,.7)`, pointerEvents: "none" }} />

        {guides.x.map((g, i) => (
          <div key={`gx${i}`} style={{ position: "absolute", left: `${g}mm`, top: 0, bottom: 0, borderLeft: `${1 / scale}px solid #e91e63`, pointerEvents: "none" }} />
        ))}
        {guides.y.map((g, i) => (
          <div key={`gy${i}`} style={{ position: "absolute", top: `${g}mm`, left: 0, right: 0, borderTop: `${1 / scale}px solid #e91e63`, pointerEvents: "none" }} />
        ))}
      </div>

      {side.elements
        .filter((el) => el.id === selectedId)
        .map((el) => (
          <div
            key={`sel-${el.id}`}
            style={{
              position: "absolute",
              left: el.x * zoom,
              top: el.y * zoom,
              width: el.w * zoom,
              height: el.h * zoom,
              transform: el.rot ? `rotate(${el.rot}deg)` : undefined,
              outline: `1.5px solid ${el.locked ? "#888" : "#D4AF37"}`,
              pointerEvents: "none",
            }}
          >
            {!el.locked &&
              editing !== el.id &&
              HANDLES.map((hd) => {
                const left = hd.includes("w") ? 0 : hd.includes("e") ? "100%" : "50%"
                const top = hd.includes("n") ? 0 : hd.includes("s") ? "100%" : "50%"
                return (
                  <div
                    key={hd}
                    onPointerDown={(e) => start(e, el, hd)}
                    style={{
                      position: "absolute",
                      left,
                      top,
                      width: handleSize * scale,
                      height: handleSize * scale,
                      transform: "translate(-50%,-50%)",
                      background: "#fff",
                      border: "1.5px solid #D4AF37",
                      borderRadius: 2,
                      cursor: CURSOR[hd],
                      pointerEvents: "auto",
                      touchAction: "none",
                    }}
                  />
                )
              })}
          </div>
        ))}
    </div>
  )
}

const round = (v: number) => Math.round(v * 10) / 10

export default EditorCanvas
