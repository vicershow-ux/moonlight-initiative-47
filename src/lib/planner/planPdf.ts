import { docBrandHeader, docBrandStyles } from "@/lib/docBrandHeader"
import {
  fmtNum,
  openingPosition,
  polygonCentroid,
  schemeBounds,
  schemeMetrics,
  wallSegments,
} from "@/lib/planner/geometry"
import { NODE_PRESETS, PlanLayer, PlanScheme } from "@/lib/planner/types"

export function schemeToSvg(
  scheme: PlanScheme,
  width = 700,
  height = 460,
  layer: PlanLayer = "plan",
): string {
  const b = schemeBounds(scheme)
  const pad = 56
  const scale = Math.min((width - pad * 2) / b.width, (height - pad * 2) / b.height)
  const tx = (width - b.width * scale) / 2 - b.minX * scale
  const ty = (height - b.height * scale) / 2 - b.minY * scale
  const sx = (x: number) => x * scale + tx
  const sy = (y: number) => y * scale + ty

  const parts: string[] = []

  parts.push(
    `<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" stroke="#d8d8d8"/>`,
  )

  for (let gx = Math.ceil(b.minX); gx <= b.maxX; gx++) {
    parts.push(
      `<line x1="${sx(gx)}" y1="${sy(b.minY)}" x2="${sx(gx)}" y2="${sy(b.maxY)}" stroke="#f0f0f0" stroke-width="1"/>`,
    )
  }
  for (let gy = Math.ceil(b.minY); gy <= b.maxY; gy++) {
    parts.push(
      `<line x1="${sx(b.minX)}" y1="${sy(gy)}" x2="${sx(b.maxX)}" y2="${sy(gy)}" stroke="#f0f0f0" stroke-width="1"/>`,
    )
  }

  // На схемах электрики и сантехники планировка служит бледной подложкой
  const isEng = layer !== "plan"
  const wallColor = isEng ? "#b0b0b0" : "#161616"
  const dimColor = isEng ? "#aaaaaa" : "#555555"
  const nameColor = isEng ? "#999999" : "#161616"

  scheme.rooms.forEach((room) => {
    if (room.points.length < 2) return
    const d =
      room.points.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x)},${sy(p.y)}`).join(" ") + " Z"
    parts.push(`<path d="${d}" fill="#fafafa" stroke="${wallColor}" stroke-width="2.5" stroke-linejoin="round"/>`)

    wallSegments(room).forEach((seg) => {
      if (seg.length * scale < 40) return
      const mx = (sx(seg.a.x) + sx(seg.b.x)) / 2
      const my = (sy(seg.a.y) + sy(seg.b.y)) / 2
      const angle = (Math.atan2(sy(seg.b.y) - sy(seg.a.y), sx(seg.b.x) - sx(seg.a.x)) * 180) / Math.PI
      const flip = angle > 90 || angle < -90
      parts.push(
        `<text x="${mx}" y="${my - 5}" text-anchor="middle" font-size="10" fill="${dimColor}" font-family="Arial" transform="rotate(${flip ? angle + 180 : angle}, ${mx}, ${my})">${fmtNum(seg.length, 2)} м</text>`,
      )
    })

    if (room.points.length > 2) {
      const c = polygonCentroid(room.points)
      const metrics = schemeMetrics({ ...scheme, rooms: [room] }).rooms[0]
      // На схемах инженерии подпись уводим под верхнюю стену,
      // чтобы она не накладывалась на оборудование в середине комнаты
      const ys = room.points.map((p) => p.y)
      const labelY = isEng ? sy(Math.min(...ys)) + 20 : sy(c.y) - 3
      parts.push(
        `<text x="${sx(c.x)}" y="${labelY}" text-anchor="middle" font-size="12" font-weight="bold" fill="${nameColor}" font-family="Arial">${escapeXml(room.name)}</text>`,
      )
      parts.push(
        `<text x="${sx(c.x)}" y="${labelY + 14}" text-anchor="middle" font-size="10" fill="${dimColor}" font-family="Arial">${fmtNum(metrics.area, 2)} м²</text>`,
      )
    }
  })

  scheme.openings.forEach((o) => {
    const pos = openingPosition(scheme, o)
    if (!pos) return
    const color = o.kind === "window" ? "#2f80c9" : o.kind === "door" ? "#2f9d55" : "#8b5cc9"
    parts.push(
      `<line x1="${sx(pos.a.x)}" y1="${sy(pos.a.y)}" x2="${sx(pos.b.x)}" y2="${sy(pos.b.y)}" stroke="#ffffff" stroke-width="7"/>`,
    )
    parts.push(
      `<line x1="${sx(pos.a.x)}" y1="${sy(pos.a.y)}" x2="${sx(pos.b.x)}" y2="${sy(pos.b.y)}" stroke="${color}" stroke-width="4"/>`,
    )
  })

  if (isEng) {
    const nodes = (scheme.nodes || []).filter((n) => n.layer === layer)
    const links = (scheme.links || []).filter((l) => l.layer === layer)
    const byId = new Map(nodes.map((n) => [n.id, n]))
    const lineColor = layer === "electric" ? "#B8860B" : "#2f80c9"

    links.forEach((l) => {
      const a = byId.get(l.fromId)
      const b = byId.get(l.toId)
      if (!a || !b) return
      const x1 = sx(a.x)
      const y1 = sy(a.y)
      const x2 = sx(b.x)
      const y2 = sy(b.y)
      parts.push(
        `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${lineColor}" stroke-width="2"${
          layer === "plumbing" ? ' stroke-dasharray="7 4"' : ""
        }/>`,
      )
      const mx = (x1 + x2) / 2
      const my = (y1 + y2) / 2
      const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
      const flip = angle > 90 || angle < -90
      parts.push(
        `<text x="${mx}" y="${my - 4}" text-anchor="middle" font-size="9" fill="${lineColor}" font-family="Arial" transform="rotate(${flip ? angle + 180 : angle}, ${mx}, ${my})">${escapeXml(l.spec)}</text>`,
      )
    })

    nodes.forEach((n) => {
      const px = sx(n.x)
      const py = sy(n.y)
      const preset = NODE_PRESETS[n.kind]
      parts.push(
        `<circle cx="${px}" cy="${py}" r="9" fill="#ffffff" stroke="${preset.color}" stroke-width="2"/>`,
      )
      parts.push(`<circle cx="${px}" cy="${py}" r="3.5" fill="${preset.color}"/>`)
      parts.push(
        `<text x="${px + 12}" y="${py + 3.5}" font-size="9" fill="#333" font-family="Arial">${escapeXml(n.label || preset.label)}</text>`,
      )
    })
  }

  parts.push(
    `<g font-family="Arial" font-size="10" fill="#555">
      <line x1="24" y1="${height - 20}" x2="${24 + scale}" y2="${height - 20}" stroke="#161616" stroke-width="2"/>
      <line x1="24" y1="${height - 25}" x2="24" y2="${height - 15}" stroke="#161616" stroke-width="2"/>
      <line x1="${24 + scale}" y1="${height - 25}" x2="${24 + scale}" y2="${height - 15}" stroke="#161616" stroke-width="2"/>
      <text x="${24 + scale / 2}" y="${height - 27}" text-anchor="middle">1 м</text>
    </g>`,
  )

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join("")}</svg>`
}

const escapeXml = (s: string) =>
  String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

export interface PlanPdfMeta {
  objectCode: string
  clientName?: string
  address?: string
}

export function buildPlanHtml(scheme: PlanScheme, meta: PlanPdfMeta): string {
  const { rooms, totals } = schemeMetrics(scheme)
  const svg = schemeToSvg(scheme)
  const today = new Date().toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const rows = rooms
    .map(
      (r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeXml(r.name)}${
          r.room_type && r.room_type.toLowerCase() !== r.name.toLowerCase()
            ? `<br><span class="muted">${escapeXml(r.room_type)}</span>`
            : ""
        }</td>
        <td class="num">${fmtNum(r.area, 2)}</td>
        <td class="num">${fmtNum(r.perimeter, 2)}</td>
        <td class="num">${fmtNum(r.height, 2)}</td>
        <td class="num">${fmtNum(r.wallAreaGross, 2)}</td>
        <td class="num">${fmtNum(r.openingsArea, 2)}</td>
        <td class="num strong">${fmtNum(r.wallAreaNet, 2)}</td>
        <td class="num">${r.windows} / ${r.doors}</td>
      </tr>`,
    )
    .join("")

  const openingRows = scheme.openings
    .map((o) => {
      const room = scheme.rooms.find((r) =>
        wallSegments(r).some((s) => s.id === o.wallId),
      )
      const kind = o.kind === "window" ? "Окно" : o.kind === "door" ? "Дверь" : "Проём"
      return `
        <tr>
          <td>${kind}</td>
          <td>${escapeXml(room?.name || "—")}</td>
          <td class="num">${fmtNum(o.width, 2)}</td>
          <td class="num">${fmtNum(o.height, 2)}</td>
          <td class="num">${fmtNum(o.sill, 2)}</td>
          <td class="num">${fmtNum(o.width * o.height, 2)}</td>
        </tr>`
    })
    .join("")

  return `
<div class="plan-doc">
  <style>
    .plan-doc { font-family: Arial, sans-serif; color: #161616; font-size: 12px; }
    .plan-doc h2 { font-size: 17px; margin: 0 0 4px; }
    .plan-doc h3 { font-size: 14px; margin: 20px 0 8px; }
    .plan-doc .meta { color: #666; font-size: 11px; margin-bottom: 14px; }
    .plan-doc table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    .plan-doc th { background: #f2f2f2; text-align: left; font-size: 10px;
      text-transform: uppercase; color: #555; padding: 6px 5px; border: 1px solid #ddd; }
    .plan-doc td { padding: 6px 5px; border: 1px solid #e2e2e2; font-size: 11px; }
    .plan-doc td.num { text-align: right; white-space: nowrap; }
    .plan-doc td.strong { font-weight: bold; }
    .plan-doc .muted { color: #888; font-size: 10px; }
    .plan-doc .totals { background: #fbf6e6; }
    .plan-doc .totals td { font-weight: bold; }
    .plan-doc .cards { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0 4px; }
    .plan-doc .card { border: 1px solid #e2e2e2; border-radius: 6px; padding: 8px 12px; min-width: 118px; }
    .plan-doc .card .label { color: #777; font-size: 10px; }
    .plan-doc .card .value { font-size: 15px; font-weight: bold; margin-top: 2px; }
    .plan-doc .plan-img { text-align: center; margin: 8px 0 4px; }
    .plan-doc .page-break { page-break-before: always; break-before: page; height: 0; }
    .plan-doc .legend { font-size: 10px; color: #666; text-align: center; margin-bottom: 6px; }
  </style>

  <h2>План помещений — объект ${escapeXml(meta.objectCode)}</h2>
  <div class="meta">
    ${meta.clientName ? `Заказчик: ${escapeXml(meta.clientName)}. ` : ""}
    ${meta.address ? `Адрес: ${escapeXml(meta.address)}. ` : ""}
    Дата формирования: ${today}
  </div>

  <div class="plan-img">${svg}</div>
  <div class="legend">
    Синим отмечены окна, зелёным — двери, фиолетовым — проёмы. Размеры стен указаны в метрах.
  </div>

  <h3>Сводка по объекту</h3>
  <div class="cards">
    <div class="card"><div class="label">Помещений</div><div class="value">${totals.rooms}</div></div>
    <div class="card"><div class="label">Пол / потолок, м²</div><div class="value">${fmtNum(totals.floor, 2)}</div></div>
    <div class="card"><div class="label">Периметр, м.п.</div><div class="value">${fmtNum(totals.perimeter, 2)}</div></div>
    <div class="card"><div class="label">Стены с проёмами, м²</div><div class="value">${fmtNum(totals.wall, 2)}</div></div>
    <div class="card"><div class="label">Стены чистые, м²</div><div class="value">${fmtNum(totals.wallNet, 2)}</div></div>
    <div class="card"><div class="label">Окна / двери</div><div class="value">${totals.windows} / ${totals.doors}</div></div>
  </div>

  <h3>Расчёт по помещениям</h3>
  <table>
    <thead>
      <tr>
        <th>№</th>
        <th>Помещение</th>
        <th>Пол, м²</th>
        <th>Периметр, м</th>
        <th>Высота, м</th>
        <th>Стены, м²</th>
        <th>Проёмы, м²</th>
        <th>Стены чисто, м²</th>
        <th>Окна/двери</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="totals">
        <td colspan="2">Итого</td>
        <td class="num">${fmtNum(totals.floor, 2)}</td>
        <td class="num">${fmtNum(totals.perimeter, 2)}</td>
        <td class="num">—</td>
        <td class="num">${fmtNum(totals.wall, 2)}</td>
        <td class="num">${fmtNum(totals.openingsArea, 2)}</td>
        <td class="num">${fmtNum(totals.wallNet, 2)}</td>
        <td class="num">${totals.windows} / ${totals.doors}</td>
      </tr>
    </tbody>
  </table>

  ${
    scheme.openings.length > 0
      ? `<h3>Окна, двери и проёмы</h3>
  <table>
    <thead>
      <tr>
        <th>Тип</th>
        <th>Помещение</th>
        <th>Ширина, м</th>
        <th>Высота, м</th>
        <th>От пола, м</th>
        <th>Площадь, м²</th>
      </tr>
    </thead>
    <tbody>${openingRows}</tbody>
  </table>`
      : ""
  }
  ${engineerSection(scheme, "electric", meta)}
  ${engineerSection(scheme, "plumbing", meta)}
</div>`.trim()
}

/** Отдельный лист со схемой электрики или сантехники и ведомостью по ней */
function engineerSection(
  scheme: PlanScheme,
  layer: Exclude<PlanLayer, "plan">,
  meta: PlanPdfMeta,
): string {
  const nodes = (scheme.nodes || []).filter((n) => n.layer === layer)
  const links = (scheme.links || []).filter((l) => l.layer === layer)
  if (nodes.length === 0 && links.length === 0) return ""

  const title = layer === "electric" ? "Схема электрики" : "Схема сантехники"
  const specTitle = layer === "electric" ? "Кабель по сечениям" : "Труба по диаметрам"
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const roomName = (roomId: string | null) =>
    scheme.rooms.find((r) => r.id === roomId)?.name || "—"

  const counts = nodes.reduce<Record<string, number>>((acc, n) => {
    acc[n.kind] = (acc[n.kind] || 0) + 1
    return acc
  }, {})

  const specs = links.reduce<Record<string, number>>((acc, l) => {
    const a = byId.get(l.fromId)
    const b = byId.get(l.toId)
    if (!a || !b) return acc
    acc[l.spec] = (acc[l.spec] || 0) + Math.hypot(b.x - a.x, b.y - a.y)
    return acc
  }, {})

  const nodeRows = Object.entries(counts)
    .map(
      ([kind, count]) => `
      <tr>
        <td>${escapeXml(NODE_PRESETS[kind as keyof typeof NODE_PRESETS].label)}</td>
        <td class="num">${count}</td>
        <td class="num">${fmtNum(NODE_PRESETS[kind as keyof typeof NODE_PRESETS].height, 2)}</td>
      </tr>`,
    )
    .join("")

  const specRows = Object.entries(specs)
    .map(
      ([spec, len]) => `
      <tr>
        <td>${escapeXml(spec)}</td>
        <td class="num">${fmtNum(len, 2)}</td>
      </tr>`,
    )
    .join("")

  const listRows = nodes
    .map(
      (n, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeXml(n.label || NODE_PRESETS[n.kind].label)}</td>
        <td>${escapeXml(NODE_PRESETS[n.kind].label)}</td>
        <td>${escapeXml(roomName(n.roomId))}</td>
        <td class="num">${fmtNum(n.height, 2)}</td>
      </tr>`,
    )
    .join("")

  return `
  <div class="page-break"></div>
  <h2>${title} — объект ${escapeXml(meta.objectCode)}</h2>
  <div class="plan-img">${schemeToSvg(scheme, 700, 460, layer)}</div>
  <div class="legend">
    Планировка показана серым как подложка. ${
      layer === "electric"
        ? "Линии — кабельные трассы, подпись у линии — сечение."
        : "Пунктир — трубы, подпись у линии — диаметр."
    }
  </div>

  <h3>Ведомость точек</h3>
  <table>
    <thead><tr><th>Элемент</th><th>Количество, шт</th><th>Высота от пола, м</th></tr></thead>
    <tbody>${nodeRows}</tbody>
  </table>

  ${
    specRows
      ? `<h3>${specTitle}</h3>
  <table>
    <thead><tr><th>${layer === "electric" ? "Сечение" : "Диаметр"}</th><th>Длина по прямой, м</th></tr></thead>
    <tbody>${specRows}</tbody>
  </table>
  <div class="legend" style="text-align:left">
    Длина указана по прямой между точками, без запаса на спуски и повороты.
  </div>`
      : ""
  }

  <h3>Список точек по помещениям</h3>
  <table>
    <thead><tr><th>№</th><th>Подпись</th><th>Тип</th><th>Помещение</th><th>Высота, м</th></tr></thead>
    <tbody>${listRows}</tbody>
  </table>`
}

export async function downloadPlanPdf(
  scheme: PlanScheme,
  meta: PlanPdfMeta,
  mode: "save" | "blob" = "save",
): Promise<Blob | void> {
  const container = document.createElement("div")
  container.style.position = "fixed"
  container.style.left = "-10000px"
  container.style.top = "0"
  container.style.width = "794px"

  const root = document.createElement("div")
  root.style.background = "#ffffff"
  root.style.color = "#161616"
  root.style.padding = "34px"
  root.style.fontFamily = "Arial, sans-serif"
  root.innerHTML = `<style>${docBrandStyles}</style>${docBrandHeader(
    `План помещений — ${meta.objectCode}`,
  )}${buildPlanHtml(scheme, meta)}`

  container.appendChild(root)
  document.body.appendChild(container)

  await new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = `${window.location.origin}/logo-print.png`
    setTimeout(resolve, 2500)
  })

  const html2pdf = (await import("html2pdf.js")).default
  const worker = html2pdf()
    .set({
      margin: [10, 10, 10, 10],
      filename: `План помещений ${meta.objectCode}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(root)

  try {
    if (mode === "blob") {
      const blob = (await worker.outputPdf("blob")) as Blob
      return blob
    }
    await worker.save()
  } finally {
    document.body.removeChild(container)
  }
}