import type { DrawingStamp, PlanRoom, PlanScheme } from "./types"

/**
 * Альбом визуализаций как в дизайн-проекте: A4 альбомный, крупный кадр 3D,
 * внизу штамп — проект, адрес, чертёж, масштаб, дата, исполнитель, контакты, логотип.
 * Один лист — один кадр; два вертикальных кадра можно поставить рядом
 */

export interface VizSheet {
  room: PlanRoom
  /** Ссылки или data URL кадров на листе: 1 — крупно, 2 — рядом */
  images: string[]
  title: string
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

// Лист 297×210 мм в px при 4 px/мм — html2canvas снимает с запасом по чёткости
const PX = 4
const PW = 297 * PX
const PH = 210 * PX

export function stampHtml(st: DrawingStamp, title: string, sheetNo: number, total: number, k = 1): string {
  const date = st.date || new Date().toLocaleDateString("ru-RU")
  const cell = (label: string, value: string, w: string, small = false) =>
    `<td style="width:${w};border:1px solid #111;padding:4px 6px;text-align:center;vertical-align:middle">
      <div style="font-size:${Math.round((small ? 11 : 12) * k)}px;color:#111;margin-bottom:4px">${esc(label)}</div>
      <div style="font-size:${Math.round((small ? 11 : 13) * k)}px;color:#111;line-height:1.25">${value}</div>
    </td>`
  return `
  <table style="width:100%;border-collapse:collapse;table-layout:fixed;font-family:'Arial Narrow',Arial,sans-serif;height:${19 * PX}px">
    <tr>
      ${cell("Наименование проекта:", esc(st.project || "—"), "16%")}
      ${cell("Адрес объекта:", esc(st.address || "—"), "15%")}
      ${cell("Наименование чертежа:", esc(title), "17%", true)}
      ${cell("Масштаб", esc(st.scale || "—"), "6%")}
      ${cell("Дата", esc(date), "7%")}
      ${cell("Выполнил", esc(st.author || "—"), "11%")}
      ${cell("Контакты / эл. почта", esc(st.contacts || "—").replace(/\n/g, "<br>"), "13%", true)}
      ${cell("Лист", `${sheetNo} / ${total}`, "4%", true)}
      <td style="width:11%;border:1px solid #111;padding:4px;text-align:center;vertical-align:middle">
        ${st.logoUrl ? `<img src="${esc(st.logoUrl)}" crossorigin="anonymous" style="max-width:100%;max-height:${15 * PX}px;object-fit:contain"/>` : ""}
      </td>
    </tr>
  </table>`
}

export function sheetHtml(sh: VizSheet, st: DrawingStamp, no: number, total: number): string {
  const imgArea = PH - 2 * 10 * PX - 19 * PX - 4 * PX
  const imgs =
    sh.images.length > 1
      ? `<div style="display:flex;gap:${6 * PX}px;height:100%;justify-content:center">${sh.images
          .slice(0, 2)
          .map((u) => `<img src="${esc(u)}" crossorigin="anonymous" style="flex:1;min-width:0;height:100%;object-fit:cover"/>`)
          .join("")}</div>`
      : `<img src="${esc(sh.images[0])}" crossorigin="anonymous" style="display:block;width:100%;height:100%;object-fit:cover"/>`
  return `
  <div class="viz-sheet" style="width:${PW}px;height:${PH}px;background:#fff;box-sizing:border-box;padding:${10 * PX}px ${10 * PX}px ${10 * PX}px ${20 * PX}px">
    <div style="border:1.5px solid #111;height:100%;box-sizing:border-box;display:flex;flex-direction:column">
      <div style="height:${imgArea}px;padding:${4 * PX}px ${8 * PX}px 0;box-sizing:border-box">${imgs}</div>
      <div style="margin-top:auto">${stampHtml(st, sh.title, no, total)}</div>
    </div>
  </div>`
}

async function waitImages(root: HTMLElement) {
  const imgs = Array.from(root.querySelectorAll("img"))
  await Promise.all(
    imgs.map(
      (im) =>
        new Promise<void>((resolve) => {
          if (im.complete && im.naturalWidth) return resolve()
          im.onload = () => resolve()
          im.onerror = () => {
            im.style.visibility = "hidden"
            resolve()
          }
          setTimeout(resolve, 10000)
        }),
    ),
  )
}

type Pdf = import("jspdf").jsPDF

/**
 * Дорисовывает листы визуализаций (A4 альбомный) в конец готового PDF.
 * numberOf(i) — номер листа на штампе, total — всего листов в комплекте
 */
export async function appendVizSheets(pdf: Pdf, sheets: VizSheet[], stamp: DrawingStamp, numberOf: (i: number) => number, total: number, fresh = false) {
  const holder = document.createElement("div")
  holder.style.position = "fixed"
  holder.style.left = "-20000px"
  holder.style.top = "0"
  holder.innerHTML = sheets.map((s, i) => sheetHtml(s, stamp, numberOf(i), total)).join("")
  document.body.appendChild(holder)
  try {
    await waitImages(holder)
    const html2canvas = (await import("html2canvas")).default
    const nodes = Array.from(holder.querySelectorAll<HTMLElement>(".viz-sheet"))
    for (let i = 0; i < nodes.length; i++) {
      const canvas = await html2canvas(nodes[i], { scale: 1.5, useCORS: true, backgroundColor: "#ffffff", logging: false })
      if (!(fresh && i === 0)) pdf.addPage("a4", "landscape")
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.9), "JPEG", 0, 0, 297, 210)
    }
  } finally {
    document.body.removeChild(holder)
  }
}

/** Штамп для книжного листа чертежа: рисуется картинкой поверх нижнего поля страницы */
export async function stampImage(stamp: DrawingStamp, title: string, no: number, total: number): Promise<{ data: string; ratio: number }> {
  const el = document.createElement("div")
  el.style.position = "fixed"
  el.style.left = "-20000px"
  el.style.top = "0"
  el.style.width = `${190 * PX}px`
  el.style.background = "#fff"
  el.innerHTML = stampHtml(stamp, title, no, total, 0.85)
  document.body.appendChild(el)
  try {
    await waitImages(el)
    const html2canvas = (await import("html2canvas")).default
    const c = await html2canvas(el, { scale: 1.5, useCORS: true, backgroundColor: "#ffffff", logging: false })
    return { data: c.toDataURL("image/png"), ratio: c.height / c.width }
  } finally {
    document.body.removeChild(el)
  }
}

/** Собирает PDF альбома визуализаций; возвращает Blob или сохраняет файл */
export async function downloadVizAlbum(sheets: VizSheet[], stamp: DrawingStamp, fileName: string, mode: "save" | "blob" = "save"): Promise<Blob | void> {
  if (!sheets.length) throw new Error("Нет снимков 3D для альбома")
  const { jsPDF } = await import("jspdf")
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" })
  await appendVizSheets(pdf, sheets, stamp, (i) => i + 1, sheets.length, true)
  if (mode === "blob") return pdf.output("blob")
  pdf.save(fileName)
}

/** Листы по умолчанию: на каждую комнату — сохранённые снимки (крупно), иначе — автоснимки */
export function defaultSheets(scheme: PlanScheme, auto: Record<string, string[]>): VizSheet[] {
  const out: VizSheet[] = []
  for (const r of scheme.rooms) {
    const saved = (scheme.renders?.[r.id] || []).map((x) => x.url)
    const imgs = saved.length ? saved : auto[r.id] || []
    imgs.forEach((u, i) => out.push({ room: r, images: [u], title: `Визуализация ${r.name}${imgs.length > 1 ? `, вид ${i + 1}` : ""}` }))
  }
  return out
}
