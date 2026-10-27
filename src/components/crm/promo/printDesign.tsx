import { renderToStaticMarkup } from "react-dom/server"
import type { PromoDesign, PromoSide } from "@/lib/promoTypes"
import { FONTS_HREF, sheetLayout } from "./formats"
import { SideView } from "./SideView"

export interface PrintOptions {
  sides: "front" | "back" | "both"
  cutLines: boolean
  fill: boolean
}

const mm = (v: number) => `${v}mm`
const CUT = "0.25mm dashed #777"

export function Sheet({ design, side, mirror, opts }: { design: PromoDesign; side: PromoSide; mirror: boolean; opts: PrintOptions }) {
  const L = sheetLayout(design.format, design.orientation)
  const count = opts.fill ? L.cols * L.rows : 1
  const single = L.cols * L.rows === 1
  const cells = Array.from({ length: count }, (_, i) => {
    const r = Math.floor(i / L.cols)
    let c = i % L.cols
    if (mirror) c = L.cols - 1 - c
    return { x: L.x0 + c * L.w, y: L.y0 + r * L.h }
  })
  const cols = opts.fill ? L.cols : 1
  const rows = opts.fill ? L.rows : 1
  const xs = Array.from({ length: cols + 1 }, (_, i) => L.x0 + (mirror && !opts.fill ? (L.cols - 1) * L.w : 0) + i * L.w)
  const ys = Array.from({ length: rows + 1 }, (_, i) => L.y0 + i * L.h)

  return (
    <div className="sheet" style={{ width: mm(L.sheetW), height: mm(L.sheetH), position: "relative", overflow: "hidden", background: "#fff" }}>
      {cells.map((p, i) => (
        <div key={i} style={{ position: "absolute", left: mm(p.x), top: mm(p.y) }}>
          <SideView side={side} w={L.w} h={L.h} />
        </div>
      ))}
      {opts.cutLines && !single && (
        <>
          {xs.map((x, i) => (
            <div key={`x${i}`} style={{ position: "absolute", left: mm(x), top: 0, bottom: 0, borderLeft: CUT, marginLeft: "-0.125mm" }} />
          ))}
          {ys.map((y, i) => (
            <div key={`y${i}`} style={{ position: "absolute", top: mm(y), left: 0, right: 0, borderTop: CUT, marginTop: "-0.125mm" }} />
          ))}
          <div style={{ position: "absolute", right: mm(3), bottom: mm(1.2), fontFamily: "Arial", fontSize: "6pt", color: "#999" }}>
            ✂ режьте по пунктиру · {L.w}×{L.h} мм
          </div>
        </>
      )}
    </div>
  )
}

/** Печать макета: раскладка на А4, пунктир отреза, лицо и оборот отдельными листами */
export function printDesign(design: PromoDesign, title: string, opts: PrintOptions) {
  const win = window.open("", "_blank")
  if (!win) return
  const L = sheetLayout(design.format, design.orientation)
  const landscape = L.sheetW > L.sheetH
  const list: { side: PromoSide; mirror: boolean }[] = []
  const front = design.sides[0]
  const back = design.sides[1]
  if (opts.sides !== "back") list.push({ side: front, mirror: false })
  if (back && opts.sides !== "front") list.push({ side: back, mirror: opts.sides === "both" })

  const html = renderToStaticMarkup(
    <>
      {list.map((s, i) => (
        <Sheet key={i} design={design} side={s.side} mirror={s.mirror} opts={opts} />
      ))}
    </>
  )

  win.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>${title.replace(/</g, "&lt;")}</title>
    <base href="${window.location.origin}/"/>
    <link rel="stylesheet" href="${FONTS_HREF}"/>
    <style>
      @page { size: A4 ${landscape ? "landscape" : "portrait"}; margin: 0; }
      html, body { margin: 0; padding: 0; }
      * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .sheet { break-after: page; page-break-after: always; }
      .sheet:last-child { break-after: auto; page-break-after: auto; }
      @media screen { body { background: #666; padding: 10mm 0; } .sheet { margin: 0 auto 10mm; box-shadow: 0 2mm 8mm rgba(0,0,0,.4); } }
    </style>
  </head>
  <body>${html}</body>
</html>`)
  win.document.close()

  let printed = false
  const go = () => {
    if (printed) return
    printed = true
    win.focus()
    win.print()
  }
  const waitImages = () => {
    const imgs = Array.from(win.document.images).filter((i) => !i.complete)
    let left = imgs.length
    if (!left) return setTimeout(go, 300)
    imgs.forEach((img) => {
      const done = () => {
        left -= 1
        if (left <= 0) setTimeout(go, 300)
      }
      img.addEventListener("load", done, { once: true })
      img.addEventListener("error", done, { once: true })
    })
  }
  const fonts = (win.document as Document & { fonts?: FontFaceSet }).fonts
  setTimeout(() => (fonts?.ready ? fonts.ready.then(waitImages) : waitImages()), 200)
  setTimeout(go, 8000)
}
