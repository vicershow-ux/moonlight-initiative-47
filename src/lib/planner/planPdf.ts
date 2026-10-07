import { docBrandHeader, docBrandStyles } from "@/lib/docBrandHeader"
import {
  dimensionParts,
  fmtMm,
  fmtNum,
  linkGeometry,
  longestSegment,
  toMm,
  openingPosition,
  polygonCentroid,
  outerDimensions,
  schemeBounds,
  schemeMetrics,
  wallSegments,
} from "@/lib/planner/geometry"
import {
  NODE_PRESETS,
  NodeKind,
  PROTECTION_LABELS,
  PlanLayer,
  PlanScheme,
  groupColor,
} from "@/lib/planner/types"
import { describeNodes, groupSummaries } from "@/lib/planner/groups"
import { panelDiagramSvg, panelSettings, panelWarnings } from "@/lib/planner/panelDiagram"
import { PanelSize, SPARE_SHARE, panelSize, panelSpecification } from "@/lib/planner/panelSize"
import {
  CableTotals,
  addCable,
  cableLength,
  cableSettings,
  emptyTotals,
} from "@/lib/planner/cable"
import {
  WALL_MOUNTED,
  gostSymbol,
  placeSymbol,
  symbolIconSvg,
  symbolToSvg,
  wallDirection,
} from "@/lib/planner/symbols"

export function schemeToSvg(
  scheme: PlanScheme,
  width = 700,
  height = 460,
  layer: PlanLayer = "plan",
): string {
  const b = schemeBounds(scheme)
  // Запас по краям: размерные линии выносятся наружу контура и не должны
  // упираться в рамку чертежа
  const pad = layer === "plan" ? 86 : 56
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

    // На инженерных схемах длины подписываем прямо на стенах, а на планировке
    // их показывают размерные линии по внешнему контуру — ниже
    if (isEng) {
      wallSegments(room).forEach((seg) => {
        if (seg.length * scale < 40) return
        const mx = (sx(seg.a.x) + sx(seg.b.x)) / 2
        const my = (sy(seg.a.y) + sy(seg.b.y)) / 2
        const angle = (Math.atan2(sy(seg.b.y) - sy(seg.a.y), sx(seg.b.x) - sx(seg.a.x)) * 180) / Math.PI
        const flip = angle > 90 || angle < -90
        parts.push(
          `<text x="${mx}" y="${my - 5}" text-anchor="middle" font-size="10" fill="${dimColor}" font-family="Arial" transform="rotate(${flip ? angle + 180 : angle}, ${mx}, ${my})">${fmtMm(seg.length)}</text>`,
        )
      })
    }

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

  // Размерные линии по внешнему контуру — только на планировке, где они читаются
  if (!isEng) {
    const dimLine = "#555555"
    const dimText = "#161616"
    const toScreen = (p: { x: number; y: number }) => ({ x: sx(p.x), y: sy(p.y) })

    outerDimensions(scheme.rooms).forEach(({ dims }) => {
      dims.forEach((dim) => {
        if (dim.length * scale < 42) return
        const dp = dimensionParts(dim, toScreen, { offset: 22, arrow: 7, overshoot: 5 })

        parts.push(
          `<line x1="${dp.ext1.x1}" y1="${dp.ext1.y1}" x2="${dp.ext1.x2}" y2="${dp.ext1.y2}" stroke="${dimLine}" stroke-width="0.7"/>`,
          `<line x1="${dp.ext2.x1}" y1="${dp.ext2.y1}" x2="${dp.ext2.x2}" y2="${dp.ext2.y2}" stroke="${dimLine}" stroke-width="0.7"/>`,
          `<line x1="${dp.line.x1}" y1="${dp.line.y1}" x2="${dp.line.x2}" y2="${dp.line.y2}" stroke="${dimLine}" stroke-width="0.7"/>`,
          `<polygon points="${dp.arrows[0]}" fill="${dimLine}"/>`,
          `<polygon points="${dp.arrows[1]}" fill="${dimLine}"/>`,
          `<text x="${dp.label.x}" y="${dp.label.y}" text-anchor="middle" font-size="10" font-weight="bold" fill="${dimText}" font-family="Arial" transform="rotate(${dp.label.angle}, ${dp.label.cx}, ${dp.label.cy})">${fmtMm(dp.length)}</text>`,
        )
      })
    })
  }

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
    const defaultColor = layer === "electric" ? "#B8860B" : "#2f80c9"
    const groupById = new Map((scheme.groups || []).map((g) => [g.id, g]))

    links.forEach((l) => {
      const g = linkGeometry(l, byId)
      if (!g) return
      const grp = layer === "electric" && l.groupId ? groupById.get(l.groupId) : null
      const lineColor = grp ? groupColor(grp.num) : defaultColor
      const pts = g.route.map((p) => `${sx(p.x)},${sy(p.y)}`).join(" ")
      parts.push(
        `<polyline points="${pts}" fill="none" stroke="${lineColor}" stroke-width="2" stroke-linejoin="miter"${
          layer === "plumbing" ? ' stroke-dasharray="7 4"' : ""
        }/>`,
      )
      const seg = longestSegment(g.route)
      if (!seg) return
      const x1 = sx(seg.a.x)
      const y1 = sy(seg.a.y)
      const x2 = sx(seg.b.x)
      const y2 = sy(seg.b.y)
      const mx = (x1 + x2) / 2
      const my = (y1 + y2) / 2
      const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
      const flip = angle > 90 || angle < -90
      parts.push(
        `<text x="${mx}" y="${my - 4}" text-anchor="middle" font-size="9" fill="${lineColor}" font-family="Arial" transform="rotate(${flip ? angle + 180 : angle}, ${mx}, ${my})">${grp ? `Гр.${grp.num} · ` : ""}${escapeXml(l.spec)} · L=${toMm(g.length)}</text>`,
      )
    })

    nodes.forEach((n) => {
      const px = sx(n.x)
      const py = sy(n.y)
      const preset = NODE_PRESETS[n.kind]
      const prims = gostSymbol(n.kind)
      if (prims) {
        // Условные обозначения печатаем чёрным — как в проектной документации
        const dir = WALL_MOUNTED.has(n.kind) ? wallDirection(n, scheme.rooms) : null
        parts.push(symbolToSvg(placeSymbol(prims, { x: px, y: py }, 7, dir), "#161616", "#ffffff", 1.2))
      } else {
        parts.push(
          `<circle cx="${px}" cy="${py}" r="9" fill="#ffffff" stroke="${preset.color}" stroke-width="2"/>`,
        )
        parts.push(`<circle cx="${px}" cy="${py}" r="3.5" fill="${preset.color}"/>`)
      }
      // У правого края листа подпись ставим слева от значка, иначе она обрежется
      const text = escapeXml(n.label || preset.label)
      const nearRight = px + 12 + text.length * 5 > width - 8
      parts.push(
        `<text x="${nearRight ? px - 12 : px + 12}" y="${py + 3.5}" text-anchor="${nearRight ? "end" : "start"}" font-size="9" fill="#333" font-family="Arial">${text}</text>`,
      )
    })
  }

  parts.push(
    `<g font-family="Arial" font-size="10" fill="#555">
      <line x1="24" y1="${height - 20}" x2="${24 + scale}" y2="${height - 20}" stroke="#161616" stroke-width="2"/>
      <line x1="24" y1="${height - 25}" x2="24" y2="${height - 15}" stroke="#161616" stroke-width="2"/>
      <line x1="${24 + scale}" y1="${height - 25}" x2="${24 + scale}" y2="${height - 15}" stroke="#161616" stroke-width="2"/>
      <text x="${24 + scale / 2}" y="${height - 27}" text-anchor="middle">1000 мм</text>
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
        <td class="num">${toMm(r.height)}</td>
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
          <td class="num">${toMm(o.width)}</td>
          <td class="num">${toMm(o.height)}</td>
          <td class="num">${toMm(o.sill)}</td>
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
    .plan-doc td.sym { width: 46px; text-align: center; padding: 2px 4px; }
    .plan-doc .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 5px; vertical-align: middle; }
    .plan-doc .warn { color: #b45309; font-size: 10px; margin-top: 3px; }
    .plan-doc tr.muted-row td { color: #888; }
    .plan-doc .panel-verdict { margin: 8px 0 10px; padding: 9px 12px; border-left: 3px solid #D4AF37; background: #fbf7ea; font-size: 12px; }
    .plan-doc .warn-box { margin-top: 10px; padding: 8px 10px; border: 1px solid #f0c78a; background: #fff8ec; color: #92400e; font-size: 11px; line-height: 1.5; }
    .plan-doc td.sym svg { display: block; margin: 0 auto; }
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
    Синим отмечены окна, зелёным — двери, фиолетовым — проёмы. Размеры на чертеже указаны в миллиметрах.
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
        <th>Высота, мм</th>
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
        <th>Ширина, мм</th>
        <th>Высота, мм</th>
        <th>От пола, мм</th>
        <th>Площадь, м²</th>
      </tr>
    </thead>
    <tbody>${openingRows}</tbody>
  </table>`
      : ""
  }
  ${engineerSection(scheme, "electric", meta)}
  ${panelSection(scheme, meta)}
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

  // Электрика: по плану + спуски + запас. Трубы сантехники — только по плану
  const isElectric = layer === "electric"
  const specs = links.reduce<Record<string, CableTotals>>((acc, l) => {
    let c: CableTotals | null
    if (isElectric) {
      c = cableLength(l, byId, scheme.rooms, scheme.defaultHeight, scheme.cable)
    } else {
      const g = linkGeometry(l, byId)
      c = g ? { plan: g.length, drops: 0, reserve: 0, total: g.length } : null
    }
    if (!c) return acc
    acc[l.spec] = addCable(acc[l.spec] || emptyTotals(), c)
    return acc
  }, {})
  const specTotal = Object.values(specs).reduce((acc, c) => addCable(acc, c), emptyTotals())
  const cfg = cableSettings(scheme.cable)

  const nodeRows = Object.entries(counts)
    .map(
      ([kind, count]) => `
      <tr>
        <td class="sym">${symbolIconSvg(kind as NodeKind, 36, 22, 7, "#161616", "#ffffff") ?? ""}</td>
        <td>${escapeXml(NODE_PRESETS[kind as keyof typeof NODE_PRESETS].label)}</td>
        <td class="num">${count}</td>
        <td class="num">${toMm(NODE_PRESETS[kind as keyof typeof NODE_PRESETS].height)}</td>
      </tr>`,
    )
    .join("")

  const specRows = Object.entries(specs)
    .map(
      ([spec, c]) => `
      <tr>
        <td>${escapeXml(spec)}</td>
        <td class="num">${fmtNum(c.plan, 2)}</td>${
          isElectric
            ? `
        <td class="num">${fmtNum(c.drops, 2)}</td>
        <td class="num">${fmtNum(c.reserve, 2)}</td>
        <td class="num strong">${fmtNum(c.total, 2)}</td>`
            : ""
        }
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
        <td class="num">${toMm(n.height)}</td>
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
        ? "Линии — кабельные трассы с поворотами под 90°, подпись — сечение и длина L в мм. Настенные элементы развёрнуты от стены в помещение."
        : "Пунктир — трубы, подпись у линии — диаметр."
    }
  </div>

  <h3>Условные обозначения и ведомость точек</h3>
  <table>
    <thead><tr><th>Обозначение</th><th>Элемент</th><th>Количество, шт</th><th>Высота от пола, мм</th></tr></thead>
    <tbody>${nodeRows}</tbody>
  </table>

  ${
    specRows
      ? `<h3>${specTitle}</h3>
  <table>
    <thead><tr>${
      isElectric
        ? "<th>Сечение</th><th>По плану, м</th><th>Спуски, м</th><th>Запас на концы, м</th><th>Итого с запасом, м</th>"
        : "<th>Диаметр</th><th>Длина по трассе, м</th>"
    }</tr></thead>
    <tbody>${specRows}${
      isElectric
        ? `
      <tr class="totals">
        <td>Всего</td>
        <td class="num">${fmtNum(specTotal.plan, 2)}</td>
        <td class="num">${fmtNum(specTotal.drops, 2)}</td>
        <td class="num">${fmtNum(specTotal.reserve, 2)}</td>
        <td class="num">${fmtNum(specTotal.total, 2)}</td>
      </tr>`
        : ""
    }</tbody>
  </table>
  <div class="legend" style="text-align:left">${
    isElectric
      ? `По плану — длина трассы с поворотами. Спуски — от трассы, проложенной на ${toMm(cfg.traceFromCeiling)} мм ниже потолка, до высоты каждой точки. Запас — ${toMm(cfg.endReserve)} мм на разделку каждого конца кабеля.`
      : "Длина посчитана по трассе с поворотами."
  }</div>`
      : ""
  }

  ${layer === "electric" ? groupsTable(scheme) : ""}

  <h3>Список точек по помещениям</h3>
  <table>
    <thead><tr><th>№</th><th>Подпись</th><th>Тип</th><th>Помещение</th><th>Высота, мм</th></tr></thead>
    <tbody>${listRows}</tbody>
  </table>`
}

/** Таблица групп щита: автомат, защита, сечение, длина кабеля и состав */
function groupsTable(scheme: PlanScheme): string {
  const sums = groupSummaries(scheme)
  if (sums.length === 0) return ""

  const grand = emptyTotals()
  const rows = sums
    .map((sum) => {
      const g = sum.group
      const specs = Object.entries(sum.bySpec)
      addCable(grand, sum.cable)
      const protection = g
        ? `${PROTECTION_LABELS[g.protection]}${g.protection !== "mcb" ? `, ${g.leakage} мА` : ""}`
        : "—"
      const specCell = specs.length
        ? specs.map(([spec]) => escapeXml(spec)).join("<br>")
        : "—"
      const planCell = specs.length
        ? specs.map(([, c]) => fmtNum(c.plan, 2)).join("<br>")
        : "0"
      const totalCell = specs.length
        ? specs.map(([, c]) => fmtNum(c.total, 2)).join("<br>")
        : "0"
      return `
      <tr${g ? "" : ' class="muted-row"'}>
        <td class="num">${
          g
            ? `<span class="dot" style="background:${groupColor(g.num)}"></span>${g.num}`
            : "—"
        }</td>
        <td>${g ? escapeXml(g.name || "—") : "Без группы"}</td>
        <td class="num strong">${g ? escapeXml(g.breaker) : "—"}</td>
        <td>${protection}</td>
        <td class="num">${specCell}</td>
        <td class="num">${planCell}</td>
        <td class="num">${totalCell}</td>
        <td class="num strong">${fmtNum(sum.total, 2)}</td>
        <td>${escapeXml(describeNodes(sum.nodeCounts)) || "—"}${
          sum.warning ? `<div class="warn">${escapeXml(sum.warning)}</div>` : ""
        }</td>
      </tr>`
    })
    .join("")

  return `
  <h3>Группы электрощита</h3>
  <table>
    <thead>
      <tr>
        <th>№</th>
        <th>Назначение</th>
        <th>Автомат</th>
        <th>Защита</th>
        <th>Сечение</th>
        <th>По плану, м</th>
        <th>С запасом, м</th>
        <th>Итого группы, м</th>
        <th>Потребители</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="totals">
        <td colspan="5">Итого кабеля</td>
        <td class="num">${fmtNum(grand.plan, 2)}</td>
        <td class="num">${fmtNum(grand.total, 2)}</td>
        <td class="num">${fmtNum(grand.total, 2)}</td>
        <td></td>
      </tr>
    </tbody>
  </table>
  <div class="legend" style="text-align:left">
    «С запасом» — по плану плюс спуски от потолка к каждой точке и запас на разделку концов.
    Подбор автомата под сечение проверен по типовым значениям для медного кабеля; итоговое решение — за электриком.
  </div>`
}

/** Отдельный лист: однолинейная схема электрощита */
function panelSection(scheme: PlanScheme, meta: PlanPdfMeta): string {
  const svg = panelDiagramSvg(scheme, 700)
  if (!svg) return ""
  const panel = panelSettings(scheme.panel)
  const warnings = panelWarnings(scheme)
  return `
  <div class="page-break"></div>
  <h2>Однолинейная схема щита ${escapeXml(panel.name)} — объект ${escapeXml(meta.objectCode)}</h2>
  <div class="plan-img">${svg}</div>
  <div class="legend" style="text-align:left">
    QF — автоматический выключатель, QS — выключатель нагрузки, QD — УЗО, QFD — дифавтомат,
    PI — электросчётчик, KV — реле напряжения, FV — УЗИП. На линиях: KM — контактор, KT — реле времени,
    KI — импульсное реле, SA — выключатель, UD — диммер, SK — терморегулятор, XS — розетка, HL — индикатор.
    Ввод и аппараты линий показаны сверху вниз в порядке установки. Цвет и толщина отходящей линии — сечение кабеля
    (расшифровка внизу схемы); под линией номер группы и назначение. Группы с одинаковым УЗО объединены под общим аппаратом.
  </div>
  ${
    warnings.length
      ? `<div class="warn-box">${warnings.map((w) => `<div>⚠ ${escapeXml(w)}</div>`).join("")}</div>`
      : ""
  }
  ${panelSizeBlock(scheme)}`
}

const plural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}

/** Раскладка аппаратов по DIN-рейкам корпуса — чтобы было видно заполнение */
function railsSvg(size: PanelSize, width = 700): string {
  const enc = size.enclosure
  if (!enc) return ""
  const perRow = Math.ceil(enc.modules / enc.rows)
  const mod = Math.min(26, (width - 40) / perRow)
  const railW = perRow * mod
  const x0 = (width - railW) / 2
  const rowH = 46
  const height = enc.rows * rowH + 16
  const parts: string[] = [
    `<rect x="${x0 - 10}" y="2" width="${railW + 20}" height="${height - 4}" rx="4" fill="#fafafa" stroke="#bbbbbb"/>`,
  ]

  // Аппараты ставим по рейкам слева направо, не разрывая аппарат между рейками
  let row = 0
  let col = 0
  const placed: { row: number; col: number; w: number; pos: string; kind: string }[] = []
  for (const it of size.items) {
    if (it.modulesEach === 0) continue
    if (col + it.modulesEach > perRow) {
      row++
      col = 0
    }
    placed.push({ row, col, w: it.modulesEach, pos: it.pos, kind: it.name })
    col += it.modulesEach
  }

  for (let r = 0; r < enc.rows; r++) {
    const y = 10 + r * rowH
    parts.push(`<rect x="${x0}" y="${y + 15}" width="${railW}" height="6" fill="#d9d9d9"/>`)
    for (let c = 0; c < perRow; c++) {
      parts.push(
        `<rect x="${x0 + c * mod + 1}" y="${y + 1}" width="${mod - 2}" height="34" rx="2" fill="none" stroke="#e2e2e2" stroke-dasharray="2 2"/>`,
      )
    }
  }
  for (const p of placed) {
    const y = 10 + p.row * rowH
    const isInput = /^[A-Z]+0/.test(p.pos)
    const isLine = /^(KM|KT|KI|SA|UD|SK|XS|HL)\d/.test(p.pos)
    const fill = isLine
      ? "#eef0f3"
      : p.kind === "Электросчётчик"
      ? "#f1ecfb"
      : p.kind === "Реле напряжения"
        ? "#fdecea"
        : isInput
          ? "#fdf1d8"
          : p.kind.startsWith("УЗО")
            ? "#e8f1fb"
            : p.kind === "Дифавтомат"
              ? "#eef7ea"
              : "#ffffff"
    const x = x0 + p.col * mod + 1
    const w = p.w * mod - 2
    parts.push(
      `<rect x="${x}" y="${y + 1}" width="${w}" height="34" rx="2" fill="${fill}" stroke="#161616" stroke-width="1"/>`,
      `<text x="${x + w / 2}" y="${y + 21}" text-anchor="middle" font-size="${mod < 20 ? 6.5 : 8}" font-weight="bold" fill="#161616" font-family="Arial">${escapeXml(p.pos)}</text>`,
    )
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join("")}</svg>`
}

/** Спецификация аппаратов, подсчёт модулей и подобранный корпус щита */
function panelSizeBlock(scheme: PlanScheme): string {
  const size = panelSize(scheme)
  if (!size) return ""
  const panel = panelSettings(scheme.panel)
  const rows = panelSpecification(size)
    .map(
      (r) => `
      <tr>
        <td>${escapeXml(r.pos.join(", "))}</td>
        <td>${escapeXml(r.name)}</td>
        <td>${escapeXml(r.spec)}</td>
        <td class="num">${r.qty}</td>
        <td class="num">${r.modules / r.qty}</td>
        <td class="num strong">${r.modules}</td>
      </tr>`,
    )
    .join("")

  const enc = size.enclosure
  const verdict = enc
    ? `Щит на <b>${enc.modules} ${plural(enc.modules, "модуль", "модуля", "модулей")}</b> (${enc.rows} ${plural(enc.rows, "ряд", "ряда", "рядов")}): занято ${size.used}, свободно ${size.free} — заполнение ${size.fillPercent}%.`
    : `Аппараты занимают ${size.used} ${plural(size.used, "модуль", "модуля", "модулей")} — это больше типовых корпусов до 72 модулей. Нужен разнесённый щит или два корпуса.`

  return `
  <h3>Состав щита ${escapeXml(panel.name)} и размер корпуса</h3>
  <table>
    <thead>
      <tr><th>Поз.</th><th>Аппарат</th><th>Характеристика</th><th>Кол-во</th><th>Модулей на шт</th><th>Модулей всего</th></tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="totals">
        <td colspan="5">Занято модулей</td>
        <td class="num">${size.used}</td>
      </tr>
      <tr>
        <td colspan="5">С запасом ${Math.round(SPARE_SHARE * 100)}% под новые группы</td>
        <td class="num strong">${size.needed}</td>
      </tr>
    </tbody>
  </table>
  <div class="panel-verdict">${verdict}</div>
  ${enc ? `<div class="plan-img">${railsSvg(size)}</div>` : ""}
  <div class="legend" style="text-align:left">
    1 модуль = 17,5 мм по DIN-рейке. Ширина аппаратов — типовая: автомат 1P — 1 модуль, 2P — 2, 3P — 3;
    УЗО однофазное — 2, трёхфазное — 4; дифавтомат 1P+N — 2; реле напряжения 1ф — 2, 3ф — 4;
    счётчик на DIN-рейку 1ф — 6, 3ф — 8 (навесной счётчик места на рейке не занимает). Если у выбранной модели
    другая ширина — она задаётся в настройках ввода щита. У конкретного производителя ширина может отличаться —
    сверьте по каталогу. Клеммники N и PE в расчёт не входят: в большинстве корпусов они идут в комплекте отдельно от рейки.
  </div>`
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