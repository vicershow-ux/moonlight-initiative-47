/**
 * Печать документа в новом окне.
 * - @page с нулевыми полями убирает служебные надписи браузера (дата, заголовок, about:blank, номера страниц),
 *   поля листа задаём отступами страницы
 * - печать запускается только после загрузки картинок: логотипа, подписи, печати
 */
export function printHtml(title: string, body: string, styles = ""): void {
  const win = window.open("", "_blank")
  if (!win) return
  win.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>${title}</title>
    <base href="${window.location.origin}/"/>
    <style>
      @page { size: A4; margin: 0; }
      html, body { margin: 0; }
      body { font-family: Arial, sans-serif; padding: 15mm 15mm 15mm 20mm; line-height: 1.5; color: #161616; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      h2, h3 { color: #161616; }
      h2 { margin: 28px 0 12px; }
      h3 { margin: 24px 0 10px; page-break-after: avoid; }
      p { margin: 0 0 14px; }
      table { border-collapse: collapse; }
      ${styles}
    </style>
  </head>
  <body>${body}</body>
</html>`)
  win.document.close()

  const go = () => {
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
