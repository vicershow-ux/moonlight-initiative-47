import { docBrandHeader, docBrandStyles } from "@/lib/docBrandHeader"
import { printHtml } from "@/lib/printHtml"
import { ROUNDED_TABLE_CSS } from "@/lib/pdfRender"

/** Старые акты сохранены со светло-жёлтыми плашками — затемняем их до читаемого тона */
export function darkenActHtml(html: string): string {
  return roundActTables((html || "")
    .replace(/<div class="pg-break"[^>]*><\/div>/g, "")
    .replace(/(<p style="font-weight:700;font-size:15px;margin:)0 0 12px(;color:#4A2E06)(">Приложение к Акту)/g, (_m, a: string, b: string, c: string) => `${a}18px 0 12px${b};page-break-after:avoid;break-after:avoid${c}`)
    .replace(/#F5EBD9/gi, "#D3C2A2")
    .replace(/background:#EADCC0/gi, "background:#B9A27A")
    .replace(/color:#3A2404/gi, "color:#1F1405"))
}

/** Таблица работ акта — в скруглённой рамке */
function roundActTables(html: string): string {
  if (typeof DOMParser === "undefined" || !html.includes("works-table")) return html
  const doc = new DOMParser().parseFromString(`<div id="r">${html}</div>`, "text/html")
  const r = doc.getElementById("r")
  if (!r) return html
  r.querySelectorAll("table.works-table").forEach((t) => {
    if (t.parentElement?.classList.contains("pdf-rt")) return
    const w = doc.createElement("div")
    w.className = "pdf-rt"
    t.before(w)
    w.appendChild(t)
  })
  return `<style>${ROUNDED_TABLE_CSS}</style>${r.innerHTML}`
}

export const actPrintStyles = `
  body { font-size: 13px; }
  table { width: 100%; }
  td, th { overflow-wrap: break-word; }
  table:not(.works-table) td, table:not(.works-table) th { border: none !important; }
  .works-table thead { display: table-header-group; }
  .works-table thead th { background: #5C3A11 !important; color: #ffffff !important; font-weight: 700 !important; border: 1.2px solid #6B4508 !important; }
  .works-table tbody td { border: 1.2px solid #6B4508 !important; color: #1a1a1a !important; }
  .works-table { page-break-inside: auto; break-inside: auto; }
  .act-doc > div:not(.pdf-rt) { page-break-inside: avoid; break-inside: avoid; }
  .pdf-rt { page-break-inside: auto; break-inside: auto; }
  .works-table tr { page-break-inside: avoid; break-inside: avoid; }
  ${ROUNDED_TABLE_CSS}
  ${docBrandStyles}
`

export function printAct(act: { act_number: string; content_html: string }): void {
  printHtml(`Акт № ${act.act_number}`, `${docBrandHeader("")}${darkenActHtml(act.content_html)}`, actPrintStyles, { paginate: true })
}
