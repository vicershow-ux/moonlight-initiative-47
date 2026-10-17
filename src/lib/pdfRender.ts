/** Скруглённая рамка таблицы: внешняя граница у обёртки, у крайних ячеек убираем свои края */
export const ROUNDED_TABLE_CSS = `
  .pdf-rt { border: 1.2px solid #6B4508; border-radius: 10px; overflow: hidden; box-sizing: border-box; }
  .pdf-rt > table { border-collapse: collapse; width: 100%; margin: 0; }
  .pdf-rt > table tr > *:first-child { border-left: none !important; }
  .pdf-rt > table tr > *:last-child { border-right: none !important; }
  .pdf-rt > table > thead > tr:first-child > *,
  .pdf-rt > table > tbody:first-child > tr:first-child > * { border-top: none !important; }
  .pdf-rt > table > *:last-child > tr:last-child > * { border-bottom: none !important; }
`

/** Оборачивает таблицы с позициями в скруглённую рамку (если ещё не обёрнуты) */
export function wrapRoundedTables(root: ParentNode) {
  root.querySelectorAll<HTMLTableElement>("table.works-table, table.items, table.pdf-round").forEach((t) => {
    const p = t.parentElement
    if (p && (p.classList.contains("pdf-rt") || p.classList.contains("cat-block"))) return
    const w = document.createElement("div")
    w.className = "pdf-rt"
    const mt = t.style.marginTop
    if (mt) {
      w.style.marginTop = mt
      t.style.marginTop = "0"
    }
    t.before(w)
    w.appendChild(t)
  })
}

const CONTENT_W = 760
const MARGIN = { top: 12, right: 12, bottom: 14, left: 12 }
const A4 = { w: 210, h: 297 }
const PX_PER_MM = CONTENT_W / (A4.w - MARGIN.left - MARGIN.right)
export const PAGE_H = Math.floor((A4.h - MARGIN.top - MARGIN.bottom) * PX_PER_MM)

const ATOMIC_CLASSES = ["sign-row", "room-total", "summary", "info-grid", "parties", "doc-brand-header", "header", "notes"]

const cssOf = (el: Element) => (el.ownerDocument.defaultView || window).getComputedStyle(el)

interface Unit {
  el: HTMLElement
  row: boolean
}

function isHeading(el: Element | null): el is HTMLElement {
  if (!el || el.nodeType !== 1 || !("style" in el)) return false
  if (/^H[1-6]$/.test(el.tagName)) return true
  if (el.classList.contains("room-title")) return true
  if (!/^(P|DIV)$/.test(el.tagName)) return false
  const text = (el.textContent || "").trim()
  if (!text || text.length > 90 || el.querySelector("table, img, div")) return false
  return Number(cssOf(el).fontWeight) >= 600
}

function isContainer(el: HTMLElement): boolean {
  if (ATOMIC_CLASSES.some((c) => el.classList.contains(c))) return false
  const cs = cssOf(el)
  if (cs.display !== "block") return false
  if (!el.children.length) return false
  const hasText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && (n.textContent || "").trim())
  if (hasText) return false
  return Array.from(el.children).some((c) => {
    const d = cssOf(c).display
    return d === "block" || d === "table" || d === "flex" || d === "grid"
  })
}

function collect(el: HTMLElement, out: Unit[]) {
  for (const child of Array.from(el.children) as HTMLElement[]) {
    if (child.tagName === "STYLE" || child.tagName === "SCRIPT") continue
    if (cssOf(child).display === "none") continue
    if (child.tagName === "TABLE") {
      const t = child as HTMLTableElement
      const layoutRows = !t.tHead && bodyRows(t).length > 1 && Boolean(t.querySelector(":scope > tbody > tr > td table, :scope > tbody > tr > td div"))
      if (t.tHead || layoutRows) {
        Array.from(t.tBodies).forEach((b) => Array.from(b.rows).forEach((r) => out.push({ el: r, row: true })))
        if (t.tFoot) Array.from(t.tFoot.rows).forEach((r) => out.push({ el: r, row: true }))
      } else out.push({ el: t, row: false })
    } else if (isContainer(child)) collect(child, out)
    else out.push({ el: child, row: false })
  }
}

function bodyRows(t: HTMLTableElement): HTMLTableRowElement[] {
  const rows: HTMLTableRowElement[] = []
  Array.from(t.tBodies).forEach((b) => rows.push(...Array.from(b.rows)))
  if (t.tFoot) rows.push(...Array.from(t.tFoot.rows))
  return rows
}

const isCatRow = (r: HTMLTableRowElement) => r.classList.contains("cat-row") || (r.cells.length === 1 && r.cells[0].colSpan > 1)

function wrapperOf(t: HTMLTableElement, root: HTMLElement): HTMLElement {
  const p = t.parentElement
  if (p && p !== root && p.children.length === 1) return p
  return t
}

/** Копия заголовка группы с пометкой «(продолжение)» */
function continuationOf<T extends HTMLElement>(el: T): T {
  const c = el.cloneNode(true) as T
  const cell = (c.querySelector("td, th") as HTMLElement | null) || c
  const walker = el.ownerDocument.createTreeWalker(cell, 4)
  let last: Text | null = null
  while (walker.nextNode()) {
    const n = walker.currentNode as Text
    if ((n.textContent || "").trim()) last = n
  }
  if (last) last.textContent = `${(last.textContent || "").trimEnd()} (продолжение)`
  return c
}

/**
 * Для печати через браузер: раскладывает документ по страницам так же, как PDF
 * (таблица делится на отдельные скруглённые блоки), затем распорки заменяются принудительными разрывами
 */
export function paginateForPrint(root: HTMLElement, pageH: number) {
  paginate(root, pageH)
  root.querySelectorAll<HTMLElement>(".pg-spacer").forEach((sp) => {
    sp.style.height = "0"
    sp.style.breakBefore = "page"
    sp.style.pageBreakBefore = "always"
  })
}

/** Расставляет переносы: блоки не режутся, таблицы делятся между строками с повтором шапки */
export function paginate(root: HTMLElement, pageH: number = PAGE_H) {
  const PAGE_H = pageH
  const document = root.ownerDocument
  const rootTop = () => root.getBoundingClientRect().top
  const rel = (el: Element) => {
    const r = el.getBoundingClientRect()
    const t = rootTop()
    return { top: r.top - t, bottom: r.bottom - t }
  }
  const spacerBefore = (anchor: HTMLElement, target: number) => {
    const sp = document.createElement("div")
    sp.className = "pg-spacer"
    sp.style.cssText = "display:block;height:0;margin:0;padding:0;border:0"
    anchor.before(sp)
    sp.style.height = `${Math.max(0, target - rel(sp).top)}px`
    anchor.style.marginTop = "0"
  }
  const withHeading = (el: HTMLElement, pageTop: number): HTMLElement => {
    const prev = el.previousElementSibling
    if (isHeading(prev) && rel(prev).top > pageTop + 20) return prev
    return el
  }
  const splitAt = (tr: HTMLTableRowElement, target: number) => {
    const table = tr.closest("table") as HTMLTableElement
    const wrapper = wrapperOf(table, root)
    const newTable = table.cloneNode(false) as HTMLTableElement
    if (table.tHead) newTable.appendChild(table.tHead.cloneNode(true))
    const section = tr.parentElement as HTMLElement
    // Заголовок группы (вид работ), к которому относится продолжение
    let groupRow: HTMLTableRowElement | null = null
    if (!isCatRow(tr)) {
      for (const r of bodyRows(table)) {
        if (r === tr) break
        if (isCatRow(r)) groupRow = r
      }
    }
    if (section.tagName === "TFOOT") {
      if (groupRow) {
        const b = document.createElement("tbody")
        b.appendChild(continuationOf(groupRow))
        newTable.appendChild(b)
      }
      newTable.appendChild(section)
    } else {
      const newBody = section.cloneNode(false) as HTMLElement
      if (groupRow) newBody.appendChild(continuationOf(groupRow))
      let cur: Element | null = tr
      while (cur) {
        const next: Element | null = cur.nextElementSibling
        newBody.appendChild(cur)
        cur = next
      }
      newTable.appendChild(newBody)
      let sib = section.nextElementSibling
      while (sib) {
        const next = sib.nextElementSibling
        newTable.appendChild(sib)
        sib = next
      }
    }
    let piece: HTMLElement = newTable
    if (wrapper !== table) {
      piece = wrapper.cloneNode(false) as HTMLElement
      piece.appendChild(newTable)
    }
    wrapper.after(piece)
    // Заголовок раздела (помещение) тоже повторяем над продолжением
    const block = wrapper.closest(".room-block")
    const title = block?.querySelector<HTMLElement>(":scope > .room-title")
    let anchor: HTMLElement = piece
    if (title) {
      const t = continuationOf(title)
      piece.before(t)
      anchor = t
    }
    spacerBefore(anchor, target)
  }

  const units: Unit[] = []
  collect(root, units)
  let pageTop = 0

  for (const u of units) {
    if (u.el.classList.contains("pg-break")) {
      const top = rel(u.el).top
      u.el.style.breakBefore = "auto"
      u.el.style.pageBreakBefore = "auto"
      if (top > pageTop + 2) {
        u.el.classList.add("pg-spacer")
        u.el.style.height = `${Math.max(0, pageTop + PAGE_H - top)}px`
        pageTop += PAGE_H
      }
      continue
    }
    for (let guard = 0; guard < 60; guard++) {
      const r = rel(u.el)
      const limit = pageTop + PAGE_H
      if (r.bottom <= limit + 0.5) break
      if (r.top >= limit) {
        pageTop = limit
        continue
      }
      if (r.top <= pageTop + 2 || r.bottom - r.top > PAGE_H) {
        pageTop = limit
        continue
      }
      if (u.row) {
        const tr = u.el as HTMLTableRowElement
        const table = tr.closest("table") as HTMLTableElement
        const rows = bodyRows(table)
        let idx = rows.indexOf(tr)
        if (idx === rows.length - 1 && idx >= 2) idx -= 1
        if (idx > 0 && isCatRow(rows[idx - 1])) idx -= 1
        if (rows.slice(0, idx).every(isCatRow)) {
          spacerBefore(withHeading(wrapperOf(table, root), pageTop), limit)
        } else {
          splitAt(rows[idx], limit)
        }
      } else {
        spacerBefore(withHeading(u.el, pageTop), limit)
      }
      pageTop = limit
    }
  }
}

async function waitImages(root: HTMLElement) {
  await Promise.all(
    Array.from(root.querySelectorAll("img")).map(
      (im) =>
        new Promise<void>((resolve) => {
          if (im.complete) return resolve()
          im.addEventListener("load", () => resolve(), { once: true })
          im.addEventListener("error", () => resolve(), { once: true })
          setTimeout(resolve, 4000)
        }),
    ),
  )
}

export interface PagedPdfOptions {
  filename: string
  mode: "save" | "base64"
}

/**
 * Собирает многостраничный PDF A4 из HTML-документа.
 * build — наполняет корневой элемент (ширина 760px), затем расставляются переносы и номера страниц.
 */
export async function renderPagedPdf(build: (root: HTMLElement) => void, opts: PagedPdfOptions): Promise<string | void> {
  const container = document.createElement("div")
  container.style.cssText = "position:fixed;left:-100000px;top:0;width:" + CONTENT_W + "px;background:#fff;z-index:-1"
  const root = document.createElement("div")
  root.style.cssText = `width:${CONTENT_W}px;max-width:${CONTENT_W}px;margin:0;padding:0 0 32px;background:#fff;box-sizing:border-box;overflow:visible`
  container.appendChild(root)
  document.body.appendChild(container)

  try {
    build(root)
    wrapRoundedTables(root)
    const style = document.createElement("style")
    style.textContent = ROUNDED_TABLE_CSS
    root.prepend(style)
    await waitImages(root)
    if (document.fonts?.ready) await document.fonts.ready
    paginate(root)

    const scale = opts.mode === "save" ? 2 : 1.5
    const html2canvas = (await import("html2canvas")).default
    const canvas = await html2canvas(root, {
      scale,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: CONTENT_W,
      windowWidth: CONTENT_W,
      scrollX: 0,
      scrollY: 0,
      logging: false,
    })

    const { jsPDF } = await import("jspdf")
    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true })
    const contentH = canvas.height / scale
    const pages = Math.max(1, Math.ceil((contentH - 32 - 2) / PAGE_H))
    const footerPx = Math.round(9 * PX_PER_MM)
    const quality = opts.mode === "save" ? 0.95 : 0.8

    for (let p = 0; p < pages; p++) {
      const sliceH = Math.min(PAGE_H, contentH - p * PAGE_H)
      const pc = document.createElement("canvas")
      pc.width = CONTENT_W * scale
      pc.height = (PAGE_H + footerPx) * scale
      const ctx = pc.getContext("2d")!
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, pc.width, pc.height)
      ctx.drawImage(canvas, 0, p * PAGE_H * scale, pc.width, sliceH * scale, 0, 0, pc.width, sliceH * scale)
      if (pages > 1) {
        ctx.fillStyle = "#666666"
        ctx.font = `${11 * scale}px Arial, sans-serif`
        ctx.textAlign = "right"
        ctx.fillText(`Стр. ${p + 1} из ${pages}`, pc.width, (PAGE_H + footerPx * 0.75) * scale)
      }
      if (p > 0) pdf.addPage()
      const wMm = A4.w - MARGIN.left - MARGIN.right
      pdf.addImage(pc.toDataURL("image/jpeg", quality), "JPEG", MARGIN.left, MARGIN.top, wMm, (PAGE_H + footerPx) / PX_PER_MM)
    }

    if (opts.mode === "save") {
      pdf.save(opts.filename)
      return
    }
    return pdf.output("datauristring")
  } finally {
    if (container.parentNode) document.body.removeChild(container)
  }
}
