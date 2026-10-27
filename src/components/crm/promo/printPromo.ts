import { PromoData, PromoKind } from "@/lib/api"
import { sheetSize } from "./promoConfig"

/** Печать макета в новом окне: лист А4 без полей, ориентация как в макете */
export function printPromo(kind: PromoKind, data: PromoData, node: HTMLElement, title: string) {
  const win = window.open("", "_blank")
  if (!win) return
  const { w, h } = sheetSize(kind, data)
  const landscape = w > h
  win.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>${title.replace(/</g, "&lt;")}</title>
    <base href="${window.location.origin}/"/>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap"/>
    <style>
      @page { size: A4 ${landscape ? "landscape" : "portrait"}; margin: 0; }
      html, body { margin: 0; padding: 0; background: #fff; }
      * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .sheet { width: ${w}mm; height: ${h}mm; overflow: hidden; page-break-after: avoid; }
      @media screen { body { background: #777; padding: 10mm; } .sheet { margin: 0 auto; box-shadow: 0 2mm 8mm rgba(0,0,0,.4); } }
    </style>
  </head>
  <body><div class="sheet">${node.outerHTML}</div></body>
</html>`)
  win.document.close()

  let printed = false
  const go = () => {
    if (printed) return
    printed = true
    win.focus()
    win.print()
  }
  const ready = () => {
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
  if (fonts?.ready) fonts.ready.then(ready)
  else ready()
  setTimeout(go, 5000)
}
