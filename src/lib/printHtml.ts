/**
 * Печать документа в новом окне.
 * - @page с нулевыми полями убирает служебные надписи браузера (дата, заголовок, about:blank, номера страниц),
 *   поля листа задаём отступами страницы
 * - печать запускается только после загрузки картинок: логотипа, подписи, печати
 */
import { paginateForPrint } from "@/lib/pdfRender"

const MM = 96 / 25.4
/** Область печати A4 при полях 15/15/16/20 мм */
const PRINT_W = 175 * MM
const PRINT_H = Math.floor(266 * MM) - 12

export function printHtml(title: string, body: string, styles = "", opts: { paginate?: boolean } = {}): void {
  const win = window.open("", "_blank")
  if (!win) return
  win.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>${title}</title>
    <base href="${window.location.origin}/"/>
    <style>
      @page {
        size: A4;
        margin: 15mm 15mm 16mm 20mm;
        @top-left { content: ""; }
        @top-center { content: ""; }
        @top-right { content: ""; }
        @bottom-left { content: ""; }
        @bottom-center { content: ""; }
        @bottom-right { content: counter(page) " / " counter(pages); font-family: Arial, sans-serif; font-size: 9pt; color: #777; }
      }
      html, body { margin: 0; }
      body { font-family: Arial, sans-serif; padding: 0; line-height: 1.5; color: #161616; orphans: 3; widows: 3; }
      p, li, tr, img { page-break-inside: avoid; break-inside: avoid; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      h2, h3 { color: #161616; }
      h2 { margin: 28px 0 12px; }
      h2, h3 { page-break-after: avoid; break-after: avoid; }
      h3 { margin: 24px 0 10px; }
      p { margin: 0 0 14px; }
      table { border-collapse: collapse; }
      ${styles}
    </style>
  </head>
  <body>${opts.paginate ? `<div id="print-root" style="width:${PRINT_W}px">${body}</div>` : body}</body>
</html>`)
  win.document.close()

  const go = () => {
    const root = win.document.getElementById("print-root")
    if (root && !root.dataset.paged) {
      root.dataset.paged = "1"
      paginateForPrint(root, PRINT_H)
    }
    win.focus()
    win.print()
  }
  const images = Array.from(win.document.images)
  const pending = images.filter((img) => !img.complete)
  if (!pending.length) {
    setTimeout(go, 150)
    return
  }
  let left = pending.length
  let done = false
  const finish = () => {
    if (done) return
    done = true
    setTimeout(go, 150)
  }
  pending.forEach((img) => {
    const one = () => {
      left -= 1
      if (left <= 0) finish()
    }
    img.addEventListener("load", one, { once: true })
    img.addEventListener("error", one, { once: true })
  })
  setTimeout(finish, 4000)
}
