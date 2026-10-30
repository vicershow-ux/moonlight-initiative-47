import { docBrandHeader, docBrandStyles } from "@/lib/docBrandHeader"
import {
  dimensionParts,
  dist,
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
  groupColor, EngLayer
} from "@/lib/planner/types"
import { describeNodes, groupSummaries, groupTag, nodeGroupNums } from "@/lib/planner/groups"
import { panelDiagramSvg, panelSettings, panelWarnings } from "@/lib/planner/panelDiagram"
import { PanelSize, SPARE_SHARE, panelSize, panelSpecification } from "@/lib/planner/panelSize"
import { groupPower, kwToAmps, phaseBalance } from "@/lib/planner/phases"
import { chaseTotals, elevationRows, elevationSvg, roomElevations } from "@/lib/planner/elevation"
import { CABLE_BUY_SHARE, electricMaterials } from "@/lib/planner/materials"
import { CeilingPlan, ceilingPlan, ceilingRows, ceilingSvg, ceilingTrackRows } from "@/lib/planner/ceiling"
import { CEILING_FINISHES, FLOOR_FINISHES, FURNITURE_PRESETS, HEATING_PRESETS, TILE_LAYOUTS, WALL_FINISHES, isEngLayer, roomFinish, wallFinishOf, floorTileOf } from "@/lib/planner/types"
import { PHASE_COLORS, SECTION_COLORS, WALL_MATERIALS, WallMaterial, sectionColor, sectionOf } from "@/lib/planner/types"
import type { DrawingStamp } from "@/lib/planner/types"
import { hatchPattern, materialSwatchImg, usedMaterials } from "@/lib/planner/wallHatch"
import { floorPattern, furnitureName, furnitureSvg, heatingLayoutSvg } from "@/lib/planner/interiorSvg"
import { heatingCalc, heatingSupply, interiorWarnings, thermostatOf, thermostatZones, zoneLayout } from "@/lib/planner/interior"
import { finishCalc, finishSummary } from "@/lib/planner/finishes"
import { finishLegend } from "@/lib/planner/elevation"
import { finishMaterials } from "@/lib/planner/finishMaterials"
import { NODE_CODES, fixtureLegendItems, nodeLegendImg, nodeLegendItems } from "@/lib/planner/nodeLegend"
import { FLOATING_OFFSET, fixtureLength, floatingContour, floatingPerimeter, trackPath, trackSegments } from "@/lib/planner/fixtures"
import { Box, LabelCandidate, LabelSpot, alongSegment, aroundPoint, createLabelPlacer, iconBox, textWidth } from "@/lib/planner/labelLayout"
import { OPENING_HINTS, PDF_OPENING_PALETTE, openingLegendItems, openingSwatchImg } from "@/lib/planner/openingLegend"
import {
  doorSwing,
  findWall,
  openingSpan,
  mountLabel,
  nodeDirection,
  openingBand,
  schemeWalls,
  wallPieces,
  roomWalls,
} from "@/lib/planner/walls"
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
  const b0 = schemeBounds(scheme)
  // Стены растут наружу контура — расширяем рамку на их толщину
  const wallsAll = schemeWalls(scheme)
  const grow = Math.max(0, ...wallsAll.all.map((w) => w.thickness - w.inner))
  const b = {
    minX: b0.minX - grow,
    minY: b0.minY - grow,
    maxX: b0.maxX + grow,
    maxY: b0.maxY + grow,
    width: b0.width + grow * 2,
    height: b0.height + grow * 2,
  }
  // Запас по краям: размерные линии выносятся наружу контура и не должны
  // упираться в рамку чертежа
  const pad = isEngLayer(layer) ? 46 : 70
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
  const isEng = isEngLayer(layer)
  const wallColor = isEng ? "#b0b0b0" : "#161616"
  const dimColor = isEng ? "#aaaaaa" : "#555555"
  const nameColor = isEng ? "#999999" : "#161616"

  const roomLabelBoxes: Box[] = []
  scheme.rooms.forEach((room) => {
    if (room.points.length < 2) return
    const d =
      room.points.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x)},${sy(p.y)}`).join(" ") + " Z"
    parts.push(`<path d="${d}" fill="#fafafa" stroke="${wallColor}" stroke-width="0.6" stroke-linejoin="round"/>`)

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

    if (room.points.length > 2 && layer !== "interior") {
      const c = polygonCentroid(room.points)
      const metrics = schemeMetrics({ ...scheme, rooms: [room] }).rooms[0]
      // На схемах инженерии подпись уводим под верхнюю стену,
      // чтобы она не накладывалась на оборудование в середине комнаты
      const ys = room.points.map((p) => p.y)
      const labelY = isEng ? sy(Math.min(...ys)) + 20 : sy(c.y) - 3
      roomLabelBoxes.push({ x: sx(c.x) - room.name.length * 4, y: labelY - 12, w: room.name.length * 8, h: 28 })
      parts.push(
        `<text x="${sx(c.x)}" y="${labelY}" text-anchor="middle" font-size="12" font-weight="bold" fill="${nameColor}" font-family="Arial">${escapeXml(room.name)}</text>`,
      )
      parts.push(
        `<text x="${sx(c.x)}" y="${labelY + 14}" text-anchor="middle" font-size="10" fill="${dimColor}" font-family="Arial">${fmtNum(metrics.area, 2)} м²</text>`,
      )
    }
  })

  // Интерьер: покрытие пола узором, зоны тёплого пола и мебель; на электрике мебель — бледной подложкой
  const toScr = (p: { x: number; y: number }) => ({ x: sx(p.x), y: sy(p.y) })
  const interiorDefs: string[] = []
  if (layer === "interior") {
    for (const room of scheme.rooms) {
      if (room.points.length < 3) continue
      const f = roomFinish(scheme, room.id)
      if (f.floor === "none") continue
      const id = `pf-${room.id}`
      const isTile = f.floor === "tile" || f.floor === "porcelain"
      interiorDefs.push(floorPattern(id, f.floor, scale, isTile ? floorTileOf(f).color : f.floorColor, undefined, isTile ? floorTileOf(f) : undefined, { x: sx(0), y: sy(0) }, f.floorMaterial))
      parts.push(`<polygon points="${room.points.map((p) => `${sx(p.x)},${sy(p.y)}`).join(" ")}" fill="url(#${id})" fill-opacity="0.9"/>`)
    }
    // Отделка стен полосой по внутренней грани, акцентные — толще и с номером стены
    for (const room of scheme.rooms) {
      if (room.points.length < 3) continue
      const f = roomFinish(scheme, room.id)
      for (const w of roomWalls(room, scheme)) {
        const wf = wallFinishOf(f, w.id)
        if (wf.wall === "none") continue
        const col = wf.wallColor || WALL_FINISHES[wf.wall].color
        const k = w.inner + (wf.own ? 0.05 : 0.03)
        parts.push(
          `<line x1="${sx(w.a.x - w.nx * k)}" y1="${sy(w.a.y - w.ny * k)}" x2="${sx(w.b.x - w.nx * k)}" y2="${sy(w.b.y - w.ny * k)}" stroke="${col}" stroke-width="${wf.own ? 4.5 : 2.5}"/>`,
        )
        if (wf.own) {
          const mx = (sx(w.a.x) + sx(w.b.x)) / 2 - w.nx * 16
          const my = (sy(w.a.y) + sy(w.b.y)) / 2 - w.ny * 16
          parts.push(
            `<text x="${mx}" y="${my + 3}" text-anchor="middle" font-size="8" font-weight="bold" fill="#161616" font-family="Arial" stroke="#fff" stroke-width="2.5" paint-order="stroke">ст.${w.index + 1}</text>`,
          )
        }
      }
    }
  }
  if (layer === "interior" || layer === "electric") {
    // Мебель — под раскладкой, чтобы обход был виден
    for (const f of scheme.furniture || []) {
      parts.push(
        `<g opacity="${layer === "interior" ? 1 : 0.35}">${furnitureSvg(f, toScr, "#161616", "#ffffff", layer === "interior" ? 0.9 : 0.7)}</g>`,
      )
    }
    // Тёплый пол: на электрике — полная раскладка, на интерьере — контур
    for (const h of layer === "electric" ? scheme.heating || [] : []) {
      const tid = thermostatOf(scheme, h)
      const th = tid ? (scheme.nodes || []).find((n) => n.id === tid) : null
      parts.push(
        `<polygon points="${h.points.map((p) => `${sx(p.x)},${sy(p.y)}`).join(" ")}" fill="none" stroke="#e8590c" stroke-width="0.8" stroke-dasharray="5 3"/>`,
        heatingLayoutSvg(zoneLayout(scheme, h), toScr, { color: h.kind === "water" ? "#0369a1" : "#e8590c", thermostat: th ? { x: th.x, y: th.y } : null, print: true }),
      )
    }
  }

  // На листе интерьера названия помещений — поверх покрытия пола и мебели
  if (layer === "interior") {
    for (const room of scheme.rooms) {
      if (room.points.length < 3) continue
      const c = polygonCentroid(room.points)
      const ys = room.points.map((p) => p.y)
      const y = sy(Math.min(...ys)) + 18
      parts.push(
        `<text x="${sx(c.x)}" y="${y}" text-anchor="middle" font-size="11" font-weight="bold" fill="#161616" font-family="Arial" stroke="#fff" stroke-width="3" paint-order="stroke">${escapeXml(room.name)}</text>`,
      )
    }
  }

  // Стены в толщину: штриховка по материалу (ГОСТ 2.306), на инженерных схемах — бледно
  const hatchIds = new Set<WallMaterial>()
  const pts = (arr: { x: number; y: number }[]) => arr.map((p) => `${sx(p.x)},${sy(p.y)}`).join(" ")
  for (const w of wallsAll.draw) {
    hatchIds.add(w.material)
    for (const pc of wallPieces(w, scheme.openings)) {
      parts.push(
        `<polygon points="${pts(pc)}" fill="${isEng ? "#ececec" : `url(#hatch-${w.material})`}" stroke="${wallColor}" stroke-width="${isEng ? 0.8 : 1.3}" stroke-linejoin="miter"/>`,
      )
    }
  }
  const hatchDefs = [...hatchIds].map((m) => hatchPattern(m, `hatch-${m}`, PDF_HATCH_OPACITY, PDF_HATCH_INK)).join("")
  parts.unshift(`<defs>${hatchDefs}${interiorDefs.join("")}</defs>`)

  // Размерные линии по внешнему контуру — только на планировке, где они читаются
  if (!isEng) {
    const dimLine = "#555555"
    const dimText = "#161616"
    const toScreen = (p: { x: number; y: number }) => ({ x: sx(p.x), y: sy(p.y) })

    outerDimensions(scheme.rooms).forEach(({ dims }) => {
      dims.forEach((dim) => {
        if (dim.length * scale < 42) return
        const wi = findWall(scheme, dim.id)
        const out = wi ? (wi.thickness - wi.inner) * scale : 0
        const dp = dimensionParts(dim, toScreen, { offset: 18 + out, gap: 4 + out, arrow: 7, overshoot: 5 })

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
    const w = findWall(scheme, o.wallId)
    if (w) {
      // Проём в толще стены: откосы по краям, у окна — переплёт посередине
      const band = openingBand(w, o)
      const [a, bb, c, d] = band.map((p) => ({ x: sx(p.x), y: sy(p.y) }))
      const col = isEng ? "#9a9a9a" : color
      parts.push(
        `<polygon points="${pts(band)}" fill="#ffffff" stroke="none"/>`,
        `<line x1="${a.x}" y1="${a.y}" x2="${d.x}" y2="${d.y}" stroke="${wallColor}" stroke-width="1.3"/>`,
        `<line x1="${bb.x}" y1="${bb.y}" x2="${c.x}" y2="${c.y}" stroke="${wallColor}" stroke-width="1.3"/>`,
      )
      if (o.kind === "window") {
        parts.push(
          `<line x1="${(a.x + d.x) / 2}" y1="${(a.y + d.y) / 2}" x2="${(bb.x + c.x) / 2}" y2="${(bb.y + c.y) / 2}" stroke="${col}" stroke-width="2"/>`,
          `<line x1="${a.x}" y1="${a.y}" x2="${bb.x}" y2="${bb.y}" stroke="${col}" stroke-width="0.7"/>`,
          `<line x1="${d.x}" y1="${d.y}" x2="${c.x}" y2="${c.y}" stroke="${col}" stroke-width="0.7"/>`,
        )
      } else if (o.kind === "door") {
        // Полотно и дуга открывания — по выбранным петлям и стороне
        const d = doorSwing(w, o)
        const h = { x: sx(d.hinge.x), y: sy(d.hinge.y) }
        const le = { x: sx(d.leafEnd.x), y: sy(d.leafEnd.y) }
        const c = { x: sx(d.closed.x), y: sy(d.closed.y) }
        const r = d.radius * scale
        const cross = (le.x - h.x) * (c.y - h.y) - (le.y - h.y) * (c.x - h.x)
        parts.push(
          `<line x1="${h.x}" y1="${h.y}" x2="${le.x}" y2="${le.y}" stroke="${col}" stroke-width="1.4"/>`,
          `<path d="M ${le.x} ${le.y} A ${r} ${r} 0 0 ${cross > 0 ? 1 : 0} ${c.x} ${c.y}" fill="none" stroke="${col}" stroke-width="0.7" stroke-dasharray="3 2"/>`,
        )
      }
      return
    }
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

    // Подписи раскладываются в конце: сначала точки, потом треки и трассы — без наложений
    const jobs: { prio: number; cands: LabelCandidate[]; fallback?: LabelCandidate[]; svg: (sp: LabelSpot, fb: boolean) => string }[] = []
    const haloAttr = 'stroke="#ffffff" stroke-width="2.5" paint-order="stroke" stroke-linejoin="round"'
    const tAttr = (sp: LabelSpot) =>
      `x="${sp.x.toFixed(1)}" y="${sp.y.toFixed(1)}" text-anchor="${sp.anchor}"${sp.rotate ? ` transform="rotate(${sp.rotate.toFixed(1)}, ${sp.x.toFixed(1)}, ${sp.y.toFixed(1)})"` : ""}`

    // Парящий потолок — штрихпунктирный контур; треки — толстой линией с засечками на торцах
    if (layer === "electric") {
      for (const f of scheme.fixtures || []) {
        if (f.kind === "floating") {
          const cn = floatingContour(scheme, f)
          if (!cn) continue
          parts.push(
            `<polygon points="${cn.map((p) => `${sx(p.x)},${sy(p.y)}`).join(" ")}" fill="none" stroke="#2f80c9" stroke-width="1.3" stroke-dasharray="9 3 2 3"/>`,
          )
          let bi = 0
          let bl = 0
          cn.forEach((p, i) => {
            const l = dist(p, cn[(i + 1) % cn.length])
            if (l > bl) {
              bl = l
              bi = i
            }
          })
          const text = `ПП · отступ ${fmtMm(f.offset ?? FLOATING_OFFSET)}`
          const q1 = cn[bi]
          const q2 = cn[(bi + 1) % cn.length]
          jobs.push({
            prio: 2,
            cands: alongSegment({ x: sx(q1.x), y: sy(q1.y) }, { x: sx(q2.x), y: sy(q2.y) }, textWidth(text, 8.5, true), 10, 4),
            svg: (sp) => `<text ${tAttr(sp)} font-size="8.5" font-weight="bold" fill="#2f80c9" font-family="Arial" ${haloAttr}>${text}</text>`,
          })
          continue
        }
        const path = trackPath(f).map((p) => ({ x: sx(p.x), y: sy(p.y) }))
        const poly = path.map((p) => `${p.x},${p.y}`).join(" ")
        const tick = (p: { x: number; y: number }, q: { x: number; y: number }) => {
          const len = Math.hypot(q.x - p.x, q.y - p.y) || 1
          const nx = -(q.y - p.y) / len
          const ny = (q.x - p.x) / len
          return `<line x1="${p.x - nx * 5}" y1="${p.y - ny * 5}" x2="${p.x + nx * 5}" y2="${p.y + ny * 5}" stroke="#161616" stroke-width="1.4"/>`
        }
        parts.push(
          `<polyline points="${poly}" fill="none" stroke="#161616" stroke-width="3.5" stroke-linejoin="miter"/>`,
          `<polyline points="${poly}" fill="none" stroke="#ffffff" stroke-width="0.8" stroke-linejoin="miter"/>`,
          tick(path[0], path[1]),
          tick(path[path.length - 1], path[path.length - 2]),
          ...path.slice(1, -1).map((p) => `<rect x="${p.x - 3}" y="${p.y - 3}" width="6" height="6" fill="#161616"/>`),
        )
        const segs = trackSegments(f)
        const lg = segs.reduce((m, x) => (x.length > m.length ? x : m), segs[0])
        const [x1, y1, x2, y2] = [sx(lg.a.x), sy(lg.a.y), sx(lg.b.x), sy(lg.b.y)]
        const text = `Тр ${fmtMm(fixtureLength(f))}`
        jobs.push({
          prio: 0,
          cands: alongSegment({ x: x1, y: y1 }, { x: x2, y: y2 }, textWidth(text, 8.5, true), 10, 5),
          svg: (sp) => `<text ${tAttr(sp)} font-size="8.5" font-weight="bold" fill="#161616" font-family="Arial" ${haloAttr}>${text}</text>`,
        })
      }
    }

    links.forEach((l) => {
      const g = linkGeometry(l, byId)
      if (!g) return
      const grp = layer === "electric" && l.groupId ? groupById.get(l.groupId) : null
      // Цвет — по сечению, как на холсте планировщика
      const lineColor = layer === "electric" ? sectionColor(l.spec, true) : defaultColor
      const pts = g.route.map((p) => `${sx(p.x)},${sy(p.y)}`).join(" ")
      parts.push(
        `<polyline points="${pts}" fill="none" stroke="${lineColor}" stroke-width="2" stroke-linejoin="miter"${
          layer === "plumbing" ? ' stroke-dasharray="7 4"' : ""
        }/>`,
      )
      const seg = longestSegment(g.route)
      if (!seg) return
      const text = `${grp ? `Гр.${grp.num} · ` : ""}${escapeXml(l.spec)}`
      jobs.push({
        prio: 3,
        cands: alongSegment({ x: sx(seg.a.x), y: sy(seg.a.y) }, { x: sx(seg.b.x), y: sy(seg.b.y) }, textWidth(text, 8.5), 10, 3),
        svg: (sp) => `<text ${tAttr(sp)} font-size="8.5" fill="${lineColor}" font-family="Arial" ${haloAttr}>${text}</text>`,
      })
    })

    const nodeGroups = layer === "electric" ? nodeGroupNums(scheme) : new Map<string, number[]>()
    nodes.forEach((n) => {
      const px = sx(n.x)
      const py = sy(n.y)
      const preset = NODE_PRESETS[n.kind]
      const prims = gostSymbol(n.kind)
      if (prims) {
        // Условные обозначения печатаем чёрным — как в проектной документации
        const dir =
          nodeDirection(scheme, n) ?? (WALL_MOUNTED.has(n.kind) ? wallDirection(n, scheme.rooms) : null)
        parts.push(symbolToSvg(placeSymbol(prims, { x: px, y: py }, 7, dir), "#161616", "#ffffff", 1.2))
      } else {
        parts.push(
          `<circle cx="${px}" cy="${py}" r="9" fill="#ffffff" stroke="${preset.color}" stroke-width="2"/>`,
        )
        parts.push(`<circle cx="${px}" cy="${py}" r="3.5" fill="${preset.color}"/>`)
      }
      // Место подписи подбирается так, чтобы она не налезала на другие
      const code = [NODE_CODES[n.kind], groupTag(nodeGroups.get(n.id))].filter(Boolean).join(" · ")
      const text = escapeXml(n.label || preset.label)
      const full = code ? `${code} ${text}` : text
      const codeSpan = code ? `<tspan font-weight="bold" fill="#161616">${escapeXml(code)}</tspan> ` : ""
      jobs.push({
        prio: 0,
        cands: aroundPoint({ x: px, y: py }, 9, textWidth(full, 8.5), 10),
        fallback: code ? aroundPoint({ x: px, y: py }, 9, textWidth(code, 8.5, true), 10) : undefined,
        svg: (sp, fb) =>
          `<text ${tAttr(sp)} font-size="8.5" fill="#333" font-family="Arial" ${haloAttr}>${fb ? `<tspan font-weight="bold" fill="#161616">${escapeXml(code)}</tspan>` : `${codeSpan}${text}`}</text>`,
      })
    })

    const placer = createLabelPlacer(
      [...nodes.map((n) => iconBox(sx(n.x), sy(n.y), 9)), ...roomLabelBoxes],
      { x: 2, y: 2, w: width - 4, h: height - 30 },
    )
    jobs
      .map((j, i) => ({ j, i }))
      .sort((a, b) => a.j.prio - b.j.prio || a.i - b.i)
      .forEach(({ j }) => {
        const sp = placer.place(j.cands)
        if (sp) {
          parts.push(j.svg(sp, false))
          return
        }
        if (j.fallback) {
          const fb = placer.place(j.fallback)
          if (fb) parts.push(j.svg(fb, true))
        }
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

/** Лист «Мебель и отделка»: план с покрытиями пола, мебелью и тёплым полом, ведомости */
function interiorSection(scheme: PlanScheme, meta: PlanPdfMeta): string {
  const furniture = scheme.furniture || []
  const heating = scheme.heating || []
  const finished = scheme.rooms.filter((r) => finishSummary(roomFinish(scheme, r.id)))
  const rendered = scheme.rooms.filter((r) => (scheme.renders?.[r.id] || []).length > 0)
  if (!furniture.length && !heating.length && !finished.length) return ""
  void rendered

  // Виды комнат в 3D: по комнате — подпись с отделкой и до трёх ракурсов. Каждая комната не рвётся между страницами
  const views = rendered
    .map((r) => {
      const list = scheme.renders?.[r.id] || []
      const sum = finishSummary(roomFinish(scheme, r.id))
      const cols = list.length === 1 ? 1 : 2
      const imgs = list
        .map(
          (x, i) =>
            `<img src="${escapeXml(x.url)}" crossorigin="anonymous" style="width:100%;${cols === 1 ? "height:auto;max-height:330px;object-fit:cover" : "height:205px;object-fit:cover"};border-radius:4px;border:1px solid #ddd;display:block;${list.length === 3 && i === 0 ? "grid-column:span 2;height:260px" : ""}"/>`,
        )
        .join("")
      return `
    <div class="render-room" style="page-break-inside:avoid;break-inside:avoid;margin:0 0 14px">
      <div style="font-size:13px;font-weight:bold;margin:0 0 2px">${escapeXml(r.name)}</div>
      ${sum ? `<div class="muted" style="margin:0 0 6px">${escapeXml(sum.charAt(0).toUpperCase() + sum.slice(1))}</div>` : ""}
      <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px">${imgs}</div>
    </div>`
    })
    .join("")

  const finishRows = scheme.rooms
    .filter((r) => r.points.length > 2)
    .map((r) => {
      const c = finishCalc(scheme, r)
      const f = c.finish
      const sw = (col: string) => `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${col};border:1px solid #bbb;vertical-align:middle;margin-right:4px"></span>`
      return `
      <tr>
        <td><b>${escapeXml(r.name)}</b></td>
        <td>${f.floor !== "none" ? `${sw(f.floorColor || FLOOR_FINISHES[f.floor].color)}${FLOOR_FINISHES[f.floor].label}` : "—"}<div class="muted">${fmtNum(c.floorArea, 2)} м²</div></td>
        <td>${f.wall !== "none" ? `${sw(f.wallColor || WALL_FINISHES[f.wall].color)}${WALL_FINISHES[f.wall].label}` : "—"}${c.wallTile > 0 && f.wall !== "tile" ? `<div class="muted">+ плитка до ${toMm(f.tileHeight || 0)} мм, ${fmtNum(c.wallTile, 2)} м²</div>` : ""}<div class="muted">${fmtNum(c.wallNet, 2)} м² без проёмов</div>${c.walls
          .filter((w) => w.finish.own)
          .map((w) => `<div style="margin-top:3px">${sw(w.finish.wallColor || WALL_FINISHES[w.finish.wall].color)}<b>стена ${w.index + 1}</b> — ${WALL_FINISHES[w.finish.wall].label.toLowerCase()}${w.finish.note ? `, ${escapeXml(w.finish.note)}` : ""}<span class="muted"> · ${fmtNum(w.main, 2)} м²</span></div>`)
          .join("")}</td>
        <td>${f.ceiling !== "none" ? CEILING_FINISHES[f.ceiling].label : "—"}<div class="muted">${fmtNum(c.ceilingArea, 2)} м²</div></td>
        <td class="num">${c.skirting > 0 ? fmtNum(c.skirting, 2) : "—"}</td>
      </tr>`
    })
    .join("")

  const furnRows = Object.values(
    furniture.reduce<Record<string, { name: string; room: string; size: string; qty: number }>>((acc, f) => {
      const room = scheme.rooms.find((r) => r.id === f.roomId)?.name || "—"
      const size = `${toMm(f.w)}×${toMm(f.d)}×${toMm(f.h)}`
      const key = `${room}|${furnitureName(f)}|${size}`
      acc[key] = acc[key] || { name: furnitureName(f), room, size, qty: 0 }
      acc[key].qty++
      return acc
    }, {}),
  )
    .sort((a, b) => a.room.localeCompare(b.room, "ru"))
    .map((r) => `<tr><td>${escapeXml(r.room)}</td><td>${escapeXml(r.name)}</td><td class="num">${r.size}</td><td class="num strong">${r.qty}</td></tr>`)
    .join("")

  const heatRows = heating
    .map((h) => {
      const c = heatingCalc(scheme, h)
      const room = scheme.rooms.find((r) => r.id === h.roomId)?.name || "—"
      return `<tr><td>${escapeXml(room)}</td><td>${HEATING_PRESETS[h.kind].label}</td><td class="num">${fmtNum(c.gross, 2)}</td><td class="num">${fmtNum(c.blocked, 2)}</td><td class="num strong">${fmtNum(c.net, 2)}</td><td class="num">${h.power}</td><td class="num strong">${c.watts}</td><td class="num">${c.length ? fmtNum(c.length, 1) : "—"}</td></tr>`
    })
    .join("")

  const warns = interiorWarnings(scheme)

  return `
  <div class="page-break"></div>
  <h2>Мебель и отделка — объект ${escapeXml(meta.objectCode)}</h2>
  <div class="plan-img">${schemeToSvg(scheme, 700, 460, "interior")}</div>
  <div class="legend">Покрытие пола показано узором и цветом выбранного материала. Мебель — в масштабе, тыльной стороной к стене. Оранжевым пунктиром — зоны тёплого пола без мест под мебелью.</div>
  ${
    finishRows
      ? `<h3>Ведомость отделки помещений</h3>
  <table>
    <thead><tr><th>Помещение</th><th>Пол</th><th>Стены</th><th>Потолок</th><th>Плинтус, м</th></tr></thead>
    <tbody>${finishRows}</tbody>
  </table>`
      : ""
  }
  ${
    heatRows
      ? `<h3>Тёплый пол</h3>
  <table>
    <thead><tr><th>Помещение</th><th>Тип</th><th>Контур, м²</th><th>Под мебелью, м²</th><th>Обогрев, м²</th><th>Вт/м²</th><th>Мощность, Вт</th><th>Кабель / труба, м</th></tr></thead>
    <tbody>${heatRows}</tbody>
  </table>`
      : ""
  }
  ${
    furnRows
      ? `<h3>Мебель и сантехника</h3>
  <table>
    <thead><tr><th>Помещение</th><th>Предмет</th><th>Ш×Г×В, мм</th><th>Кол-во</th></tr></thead>
    <tbody>${furnRows}</tbody>
  </table>`
      : ""
  }
  ${warns.length ? `<div class="warn">Проверить: ${warns.map((w) => escapeXml(w.text)).join("; ")}.</div>` : ""}
`
}

/**
 * Лист раскладки тёплого пола: по каждой зоне — помещение крупно, мебель, змейка или полосы,
 * датчик и подводка к терморегулятору, рядом — ведомость для монтажника
 */
function heatingLayoutSection(scheme: PlanScheme, meta: PlanPdfMeta): string {
  const zones = scheme.heating || []
  if (!zones.length) return ""
  const blocks = zones
    .map((h, i) => {
      const room = scheme.rooms.find((r) => r.id === h.roomId)
      const pts = room ? room.points : h.points
      const lay = zoneLayout(scheme, h)
      const c = heatingCalc(scheme, h)
      const tid = thermostatOf(scheme, h)
      const th = tid ? (scheme.nodes || []).find((n) => n.id === tid) || null : null
      const ths = (scheme.nodes || []).filter((n) => n.kind === "thermostat")
      // Масштаб под помещение: лист шириной 420 px, высота — до 300 px
      const xs = pts.map((p) => p.x)
      const ys = pts.map((p) => p.y)
      const pad = 0.35
      const minX = Math.min(...xs) - pad
      const minY = Math.min(...ys) - pad
      const W = Math.max(...xs) - minX + pad
      const H = Math.max(...ys) - minY + pad
      const k = Math.min(420 / W, 300 / H)
      const T = (p: { x: number; y: number }) => ({ x: (p.x - minX) * k, y: (p.y - minY) * k })
      const P = (arr: { x: number; y: number }[]) => arr.map((p) => `${T(p).x.toFixed(1)},${T(p).y.toFixed(1)}`).join(" ")
      const svg: string[] = []
      if (room) svg.push(`<polygon points="${P(room.points)}" fill="#fafafa" stroke="#161616" stroke-width="2"/>`)
      for (const f of scheme.furniture || []) {
        if (room && f.roomId !== room.id) continue
        svg.push(furnitureSvg(f, T, "#9ca3af", "#f3f4f6", 0.8))
      }
      svg.push(`<polygon points="${P(h.points)}" fill="none" stroke="#e8590c" stroke-width="0.9" stroke-dasharray="5 3"/>`)
      const color = h.kind === "water" ? "#0369a1" : "#e8590c"
      svg.push(heatingLayoutSvg(lay, T, { color, thermostat: th ? { x: th.x, y: th.y } : null, print: true }))
      if (th) {
        const p = T(th)
        svg.push(`<rect x="${p.x - 6}" y="${p.y - 6}" width="12" height="12" fill="#fff" stroke="#16a34a" stroke-width="1.6"/><text x="${p.x}" y="${p.y + 3}" text-anchor="middle" font-size="7" font-weight="bold" fill="#16a34a" font-family="Arial">ТР</text>`)
      }
      const svgW = W * k
      const svgH = H * k
      const rows: [string, string][] = [
        ["Тип", HEATING_PRESETS[h.kind].label],
        ["Площадь контура", `${fmtNum(c.gross, 2)} м²`],
        ["Под мебелью", `${fmtNum(c.blocked, 2)} м²`],
        [h.kind === "mat" || h.kind === "film" ? "Уложено полосами" : "Обогрев", `${fmtNum(c.net, 2)} м²`],
        [h.kind === "water" ? "Теплоотдача" : "Мощность", `${h.power} Вт/м² · ${c.watts} Вт${c.amps ? ` · ${fmtNum(c.amps, 1)} А` : ""}`],
        ...(h.kind === "cable" || h.kind === "water" ? ([[h.kind === "water" ? "Труба по раскладке" : "Кабель по раскладке", `${fmtNum(c.length, 1)} м, шаг ${toMm(lay.step)} мм`]] as [string, string][]) : []),
        ...(h.kind === "mat" || h.kind === "film" ? ([["Полос", `${lay.lanes} × ${toMm(lay.band)} мм`]] as [string, string][]) : []),
        ["Укладка", `${lay.axis === "x" ? "по горизонтали" : "по вертикали"} плана, отступ ${toMm(h.margin ?? 0.05)} мм`],
        ...(h.kind !== "water" ? ([["Терморегулятор", th ? `ТР${ths.findIndex((t) => t.id === th.id) + 1}` : "не назначен"]] as [string, string][]) : []),
      ]
      return `
    <div style="page-break-inside:avoid;break-inside:avoid;margin:0 0 16px;display:flex;gap:14px;align-items:flex-start">
      <svg xmlns="http://www.w3.org/2000/svg" width="${svgW.toFixed(0)}" height="${svgH.toFixed(0)}" viewBox="0 0 ${svgW.toFixed(0)} ${svgH.toFixed(0)}" style="flex-shrink:0;border:1px solid #e5e5e5;border-radius:4px">${svg.join("")}</svg>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:bold;margin-bottom:4px">${i + 1}. ${escapeXml(room?.name || "Зона")}</div>
        <table style="margin:0">${rows.map(([a, b]) => `<tr><td class="muted" style="padding:2px 6px 2px 0">${a}</td><td class="strong" style="padding:2px 0">${escapeXml(b)}</td></tr>`).join("")}</table>
      </div>
    </div>`
    })
    .join("")
  return `
  <div class="page-break"></div>
  <h2>Раскладка тёплого пола — объект ${escapeXml(meta.objectCode)}</h2>
  <div class="meta">Укладка в обход мебели без ножек и сантехники. Синий — датчик пола в гофре между витками, зелёный — начало укладки, холодный конец и подводка к терморегулятору. Пунктир — переход между участками.</div>
  ${blocks}`
}

/** Тёплый пол на листе электрики: зоны, мощность, терморегулятор, автомат и кабель питания */
function heatingElectricTable(scheme: PlanScheme): string {
  const zones = (scheme.heating || []).filter((h) => h.kind !== "water")
  if (!zones.length) return ""
  const byTh = thermostatZones(scheme)
  const thOf = new Map<string, string>()
  for (const [tid, list] of byTh) for (const h of list) thOf.set(h.id, tid)
  const ths = (scheme.nodes || []).filter((n) => n.kind === "thermostat")
  const groupOf = (tid: string) => {
    const l = (scheme.links || []).find((x) => x.layer === "electric" && (x.fromId === tid || x.toId === tid) && x.groupId)
    return l ? (scheme.groups || []).find((g) => g.id === l.groupId) || null : null
  }
  const rows = zones
    .map((h) => {
      const c = heatingCalc(scheme, h)
      const tid = thOf.get(h.id)
      const thW = tid ? (byTh.get(tid) || []).reduce((s, z) => s + heatingCalc(scheme, z).watts, 0) : c.watts
      const sup = heatingSupply(thW)
      const g = tid ? groupOf(tid) : null
      const thNo = tid ? ths.findIndex((t) => t.id === tid) + 1 : 0
      return `<tr>
        <td>${escapeXml(scheme.rooms.find((r) => r.id === h.roomId)?.name || "—")}</td>
        <td>${HEATING_PRESETS[h.kind].label}</td>
        <td class="num">${fmtNum(c.net, 2)}</td>
        <td class="num">${h.power}</td>
        <td class="num strong">${c.watts}</td>
        <td class="num">${fmtNum(c.amps, 1)}</td>
        <td>${thNo ? `ТР${thNo}` : '<span class="warn">нет</span>'}</td>
        <td>${g ? `гр.${g.num} · ${g.breaker}` : '<span class="warn">не подключён</span>'}</td>
        <td>${sup.breaker}, ВВГнг-LS 3×${sup.section.replace(" мм²", "").replace(".", ",")}${sup.contactor ? ", контактор" : ""}</td>
      </tr>`
    })
    .join("")
  return `<h3>Тёплый пол</h3>
  <table>
    <thead><tr><th>Помещение</th><th>Тип</th><th>Обогрев, м²</th><th>Вт/м²</th><th>Мощность, Вт</th><th>Ток, А</th><th>Терморег.</th><th>Группа щита</th><th>Рекомендуемое питание</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="legend" style="text-align:left">Площадь — без мест под мебелью без ножек и сантехникой. Мощность тёплого пола учтена в нагрузке группы и в распределении по фазам.</div>`
}

/** Развёртки стен для отделочника: материал и цвет каждой стены, плитка до высоты, мебель у стены с размерами */
function finishElevationsSection(scheme: PlanScheme, meta: PlanPdfMeta): string {
  const blocks: string[] = []
  for (const room of scheme.rooms) {
    if (room.points.length < 3) continue
    const calc = finishCalc(scheme, room)
    for (const e of roomElevations(scheme, room)) {
      if (e.finish.wall === "none" && e.tileH <= 0 && e.furniture.length === 0) continue
      const wc = calc.walls.find((w) => w.id === e.wall.id)
      const lg = wc ? finishLegend(e, wc.net, wc.main) : null
      const sw = lg?.color ? `<span style="display:inline-block;width:11px;height:11px;border-radius:2px;background:${lg.color};border:1px solid #999;vertical-align:middle;margin-right:5px"></span>` : ""
      const furn = e.furniture
        .map(
          (it) => `<tr>
          <td>${escapeXml(it.f.label || FURNITURE_PRESETS[it.f.kind].label)}</td>
          <td class="num strong">${toMm(it.x0)}</td>
          <td class="num">${toMm(it.x1 - it.x0)}</td>
          <td class="num">${toMm(e.length - it.x1)}</td>
          <td class="num">${toMm(it.z0)} / ${toMm(it.z1)}</td>
          <td class="num">${it.gap > 0.005 ? toMm(it.gap) : "вплотную"}</td>
        </tr>`,
        )
        .join("")
      blocks.push(`
  <div class="elev">
    <h3>${escapeXml(room.name)} — стена ${e.wall.index + 1}, ${toMm(e.length)} мм${e.finish.own ? " · акцентная" : ""}</h3>
    <div class="plan-img">${elevationSvg(e, 700, "finish")}</div>
    ${lg ? `<div class="meta" style="margin:4px 0 6px">${sw}<b>${escapeXml(lg.material)}</b>${lg.color ? ` · цвет ${lg.color.toUpperCase()}` : ""}${lg.note ? ` · ${escapeXml(lg.note)}` : ""}${wc ? ` · стена без проёмов ${fmtNum(wc.net, 2)} м²` : ""}</div>` : ""}
    ${
      furn
        ? `<table>
      <thead><tr><th>Предмет у стены</th><th>От левого угла, мм</th><th>Ширина, мм</th><th>До правого угла, мм</th><th>Низ / верх, мм</th><th>От стены, мм</th></tr></thead>
      <tbody>${furn}</tbody>
    </table>`
        : ""
    }
  </div>`)
    }
  }
  if (!blocks.length) return ""
  return `
  <div class="page-break"></div>
  <h2>Развёртки стен — отделка и мебель — объект ${escapeXml(meta.objectCode)}</h2>
  <div class="meta">Вид на стену из комнаты. Цвет и узор показывают материал отделки, бирюзовый пунктир — верх плитки. Мебель у стены — контуром с размерами от левого угла.</div>
  ${blocks.join("")}`
}

/**
 * Развёртка полов: каждое помещение крупно сверху с покрытием в реальном масштабе —
 * фото материала или рисунок доски/плитки, пороги в дверях, размеры и ведомость
 */
export function floorPlanSection(scheme: PlanScheme, meta: PlanPdfMeta): string {
  const rooms = scheme.rooms.filter((r) => r.points.length > 2 && roomFinish(scheme, r.id).floor !== "none")
  if (!rooms.length) return ""
  const STD = [10, 20, 25, 40, 50, 75, 100, 150, 200]
  const blocks = rooms
    .map((room, i) => {
      const f = roomFinish(scheme, room.id)
      const info = FLOOR_FINISHES[f.floor]
      const c = finishCalc(scheme, room)
      const xs = room.points.map((p) => p.x)
      const ys = room.points.map((p) => p.y)
      const pad = 0.45
      const minX = Math.min(...xs) - pad
      const minY = Math.min(...ys) - pad
      const W = Math.max(...xs) - minX + pad
      const H = Math.max(...ys) - minY + pad
      const k = Math.min(700 / W, 420 / H)
      const T = (p: { x: number; y: number }) => ({ x: (p.x - minX) * k, y: (p.y - minY) * k })
      const P = (arr: { x: number; y: number }[]) => arr.map((p) => `${T(p).x.toFixed(1)},${T(p).y.toFixed(1)}`).join(" ")
      const isTile = f.floor === "tile" || f.floor === "porcelain"
      const tile = isTile ? floorTileOf(f) : undefined
      const pid = `fl-${room.id}`
      const o = T({ x: 0, y: 0 })
      const defs = floorPattern(pid, f.floor, k, tile ? tile.color : f.floorColor, undefined, tile, o, f.floorMaterial)
      const svg: string[] = []
      svg.push(`<polygon points="${P(room.points)}" fill="url(#${pid})" stroke="#161616" stroke-width="2.2"/>`)
      // Швы своего материала: элементы реального размера, ряды со смещением на 1/3 — видно, как ляжет
      let jointDefs = ""
      const fm = f.floorMaterial
      if (fm && fm.mode !== "panel" && fm.w * k > 3 && fm.h * k > 3) {
        const ew = fm.w * k
        const eh = fm.h * k
        const jid = `fj-${room.id}`
        const rows = [0, 1, 2]
          .map((r) => {
            const off = ((r / 3) * ew) % ew
            const y = r * eh
            return `<line x1="0" y1="${y.toFixed(2)}" x2="${ew.toFixed(2)}" y2="${y.toFixed(2)}"/><line x1="${off.toFixed(2)}" y1="${y.toFixed(2)}" x2="${off.toFixed(2)}" y2="${(y + eh).toFixed(2)}"/>`
          })
          .join("")
        jointDefs = `<pattern id="${jid}" patternUnits="userSpaceOnUse" width="${ew.toFixed(2)}" height="${(eh * 3).toFixed(2)}" patternTransform="translate(${o.x.toFixed(1)} ${o.y.toFixed(1)})"><g stroke="#000" stroke-opacity="0.45" stroke-width="0.6">${rows}</g></pattern>`
        svg.push(`<polygon points="${P(room.points)}" fill="url(#${jid})"/>`)
      }
      // Мебель — тонким контуром поверх покрытия: видно, что под ней тоже уложено
      for (const it of scheme.furniture || []) {
        if (it.roomId !== room.id || it.kind === "rug" || it.kind === "rug_round" || it.kind === "curtain" || it.kind === "tulle") continue
        svg.push(`<g opacity="0.55">${furnitureSvg(it, T, "#161616", "none", 0.7)}</g>`)
      }
      // Пороги в дверных проёмах
      let doors = 0
      for (const seg of wallSegments(room)) {
        for (const op of scheme.openings.filter((x) => x.wallId === seg.id && x.kind !== "window")) {
          const sp = openingSpan(op, seg)
          const ux = (seg.b.x - seg.a.x) / (seg.length || 1)
          const uy = (seg.b.y - seg.a.y) / (seg.length || 1)
          const a = T({ x: seg.a.x + ux * sp.start, y: seg.a.y + uy * sp.start })
          const b = T({ x: seg.a.x + ux * sp.end, y: seg.a.y + uy * sp.end })
          doors++
          svg.push(`<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="#b45309" stroke-width="6" stroke-linecap="butt"/>`)
          svg.push(`<text x="${((a.x + b.x) / 2).toFixed(1)}" y="${((a.y + b.y) / 2 - 7).toFixed(1)}" text-anchor="middle" font-size="9" fill="#b45309" font-family="Arial" stroke="#fff" stroke-width="2.5" paint-order="stroke">порог ${toMm(sp.end - sp.start)}</text>`)
        }
      }
      // Габаритные размеры
      const x0 = T({ x: Math.min(...xs), y: 0 }).x
      const x1 = T({ x: Math.max(...xs), y: 0 }).x
      const y0 = T({ x: 0, y: Math.min(...ys) }).y
      const y1 = T({ x: 0, y: Math.max(...ys) }).y
      const dim = "#555"
      svg.push(`<line x1="${x0}" y1="${y0 - 16}" x2="${x1}" y2="${y0 - 16}" stroke="${dim}" stroke-width="0.8"/><line x1="${x0}" y1="${y0 - 21}" x2="${x0}" y2="${y0 - 11}" stroke="${dim}"/><line x1="${x1}" y1="${y0 - 21}" x2="${x1}" y2="${y0 - 11}" stroke="${dim}"/>`)
      svg.push(`<text x="${(x0 + x1) / 2}" y="${y0 - 20}" text-anchor="middle" font-size="10" fill="#161616" font-family="Arial">${toMm(Math.max(...xs) - Math.min(...xs))}</text>`)
      svg.push(`<line x1="${x0 - 16}" y1="${y0}" x2="${x0 - 16}" y2="${y1}" stroke="${dim}" stroke-width="0.8"/><line x1="${x0 - 21}" y1="${y0}" x2="${x0 - 11}" y2="${y0}" stroke="${dim}"/><line x1="${x0 - 21}" y1="${y1}" x2="${x0 - 11}" y2="${y1}" stroke="${dim}"/>`)
      svg.push(`<text x="${x0 - 20}" y="${(y0 + y1) / 2}" text-anchor="middle" font-size="10" fill="#161616" font-family="Arial" transform="rotate(-90 ${x0 - 20} ${(y0 + y1) / 2})">${toMm(Math.max(...ys) - Math.min(...ys))}</text>`)
      const svgW = W * k
      const svgH = H * k
      // Масштаб листа: 794 px ≈ 210 мм
      const real = 1000 / (k * (210 / 794))
      const scaleN = STD.reduce((a, b) => (Math.abs(b - real) < Math.abs(a - real) ? b : a), STD[0])
      const material = f.floorMaterial ? f.floorMaterial.name : info.label
      const size = f.floorMaterial
        ? `${toMm(f.floorMaterial.w)}×${toMm(f.floorMaterial.h)} мм`
        : tile
          ? `${toMm(tile.w)}×${toMm(tile.h)} мм, шов ${toMm(tile.joint)} мм`
          : ""
      const rows: [string, string][] = [
        ["Покрытие", info.label],
        ...(f.floorMaterial || tile?.note ? ([["Материал", f.floorMaterial ? f.floorMaterial.name : tile?.note || ""]] as [string, string][]) : []),
        ...(size ? ([["Размер элемента", size]] as [string, string][]) : []),
        ...(tile ? ([["Раскладка", TILE_LAYOUTS[tile.layout].label], ["Цвет / затирка", `${tile.color.toUpperCase()} / ${tile.grout.toUpperCase()}`]] as [string, string][]) : []),
        ...(!tile && !f.floorMaterial && f.floorColor ? ([["Цвет", f.floorColor.toUpperCase()]] as [string, string][]) : []),
        ["Площадь пола", `${fmtNum(c.floorArea, 2)} м²`],
        ["С запасом на подрезку", `${fmtNum(c.floorArea * (1 + info.waste), 2)} м² (+${Math.round(info.waste * 100)}%)`],
        ["Периметр / плинтус", `${fmtNum(c.perimeter, 2)} м${f.skirting ? ` / ${fmtNum(c.skirting, 2)} м` : ""}`],
        ...(doors ? ([["Пороги", `${doors} шт`]] as [string, string][]) : []),
        ["Масштаб", `≈ 1:${scaleN}`],
      ]
      return `
    <div style="page-break-inside:avoid;break-inside:avoid;margin:0 0 18px">
      <h3 style="margin:6px 0 6px">${i + 1}. ${escapeXml(room.name)} — ${escapeXml(material)}</h3>
      <div class="plan-img"><svg xmlns="http://www.w3.org/2000/svg" width="${svgW.toFixed(0)}" height="${svgH.toFixed(0)}" viewBox="0 0 ${svgW.toFixed(0)} ${svgH.toFixed(0)}"><defs>${defs}${jointDefs}</defs>${svg.join("")}</svg></div>
      <table style="margin:4px 0 0">${rows.map(([a, b]) => `<tr><td class="muted" style="width:34%">${a}</td><td class="strong">${escapeXml(b)}</td></tr>`).join("")}</table>
    </div>`
    })
    .join("")
  return `
  <div class="page-break"></div>
  <h2>Развёртка полов — объект ${escapeXml(meta.objectCode)}</h2>
  <div class="meta">Вид сверху: покрытие в реальном масштабе рисунка — доска, плитка или фото выбранного материала. Коричневым — пороги в дверных проёмах, тонким контуром — мебель (покрытие под ней тоже укладывается).</div>
  ${blocks}`
}

/** Смета отделки и черновых материалов */
function finishMaterialsSection(scheme: PlanScheme, meta: PlanPdfMeta): string {
  const sections = finishMaterials(scheme)
  if (!sections.length) return ""
  let n = 0
  const body = sections
    .map(
      (sec) => `
      <tr class="sec-row"><td colspan="5">${escapeXml(sec.title)}</td></tr>${sec.rows
        .map(
          (r) => `
      <tr>
        <td class="num">${++n}</td>
        <td>${escapeXml(r.name)}${r.note ? `<div class="muted">${escapeXml(r.note)}</div>` : ""}</td>
        <td>${escapeXml(r.spec)}</td>
        <td>${r.unit}</td>
        <td class="num strong">${r.qty > 0 ? fmtNum(r.qty, Number.isInteger(r.qty) ? 0 : 1) : "—"}</td>
      </tr>`,
        )
        .join("")}`,
    )
    .join("")
  return `
  <div class="page-break"></div>
  <h2>Смета отделочных материалов — объект ${escapeXml(meta.objectCode)}</h2>
  <div class="meta">Количество посчитано по площадям помещений за вычетом окон и дверей, с запасом на подрезку.</div>
  <table>
    <thead><tr><th>№</th><th>Наименование</th><th>Характеристика</th><th>Ед.</th><th>Кол-во</th></tr></thead>
    <tbody>${body}</tbody>
  </table>
  <div class="legend" style="text-align:left">
    Обои — полосами на высоту стены с раппортом и 5 см на подрезку. Краска — 0,12 л/м² за слой. Клей плиточный — 5 кг/м²,
    затирка — 0,5 кг/м². Шпаклёвка — 1,2 кг/м² на 1 мм, штукатурка — 9 кг/м² на 10 мм, стяжка ЦПС — 18 кг/м² на 10 мм.
    Нормы уточняются по выбранным материалам. Цены не указаны — их добавляют в смете.
  </div>`
}

/** Смета материалов электрики — список для закупки */
function materialsSection(scheme: PlanScheme, meta: PlanPdfMeta): string {
  const sections = electricMaterials(scheme)
  if (sections.length === 0) return ""
  let n = 0
  const body = sections
    .map(
      (sec) => `
      <tr class="sec-row"><td colspan="5">${escapeXml(sec.title)}</td></tr>${sec.rows
        .map(
          (r) => `
      <tr>
        <td class="num">${++n}</td>
        <td>${escapeXml(r.name)}${r.note ? `<div class="muted">${escapeXml(r.note)}</div>` : ""}</td>
        <td>${escapeXml(r.spec)}</td>
        <td>${r.unit}</td>
        <td class="num strong">${r.qty > 0 ? fmtNum(r.qty, Number.isInteger(r.qty) ? 0 : 1) : "—"}</td>
      </tr>`,
        )
        .join("")}`,
    )
    .join("")
  return `
  <div class="page-break"></div>
  <h2>Смета материалов электрики — объект ${escapeXml(meta.objectCode)}</h2>
  <div class="meta">Список для закупки по проекту. Количество посчитано по плану, схемам и составу щита.</div>
  <table>
    <thead><tr><th>№</th><th>Наименование</th><th>Характеристика</th><th>Ед.</th><th>Кол-во</th></tr></thead>
    <tbody>${body}</tbody>
  </table>
  <div class="legend" style="text-align:left">
    Кабель — длина по трассам со спусками, заходом в откосы и запасом на разделку, плюс ${Math.round(CABLE_BUY_SHARE * 100)}%
    на обрезки, округлено вверх до 5 м. Подрозетник — по одному на каждую розетку и выключатель; для стен из
    гипсокартона — с лапками. Аппараты щита — по однолинейной схеме. Расходные материалы посчитаны по типовым
    нормам и уточняются на объекте. Цены не указаны — их добавляют в смете.
  </div>`
}

/**
 * Развёртки стен для монтажника: только стены, на которых есть розетки,
 * выключатели, щит или коробки. Каждая развёртка — с ведомостью размеров
 */
function elevationsSection(scheme: PlanScheme, meta: PlanPdfMeta): string {
  const blocks: string[] = []
  for (const room of scheme.rooms) {
    // Потолок помещения — светильники, споты и распаячные коробки
    const c = ceilingPlan(scheme, room)
    if (c && (c.points.length || c.tracks.length || c.floating.length)) {
      const crow = ceilingRows(c)
        .map(
          (r) => `
        <tr>
          <td class="num strong">${r.no}</td>
          <td class="sym">${symbolImg(r.kind, 40, 24)}</td>
          <td>${escapeXml(r.name)}</td>
          <td class="num strong">${r.fromLeft}</td>
          <td class="num strong">${r.fromTop}</td>
          <td class="num">${r.fromRight}</td>
          <td class="num">${r.fromBottom}</td>
          <td class="num">${r.height}</td>
        </tr>`,
        )
        .join("")
      blocks.push(`
  <div class="elev">
    <h3>${escapeXml(room.name)} — потолок</h3>
    <div class="plan-img">${ceilingSvg(scheme, c, 700)}</div>
    ${
      crow
        ? `<table>
      <thead><tr><th>№</th><th>Обозн.</th><th>Точка</th><th>От левой стены, мм</th><th>От верхней стены, мм</th><th>До правой, мм</th><th>До нижней, мм</th><th>Высота, мм</th></tr></thead>
      <tbody>${crow}</tbody>
    </table>`
        : ""
    }
    ${trackTable(c)}
    ${floatingNote(scheme, c)}
  </div>`)
    }
    for (const e of roomElevations(scheme, room)) {
      if (e.points.length === 0) continue
      const rows = elevationRows(e)
        .map(
          (r) => `
        <tr>
          <td class="num strong">${r.no}</td>
          <td>${escapeXml(r.name)}${r.note ? `<div class="warn">${escapeXml(r.note)}</div>` : ""}</td>
          <td class="num">${r.fromLeft}</td>
          <td class="num">${r.fromRight}</td>
          <td class="num strong">${r.fromFloor}</td>
          <td class="num">${r.toCeiling}</td>
        </tr>`,
        )
        .join("")
      const ch = chaseTotals(e)
      blocks.push(`
  <div class="elev">
    <h3>${escapeXml(room.name)} — стена ${e.wall.index + 1}, ${toMm(e.length)} мм</h3>
    <div class="plan-img">${elevationSvg(e, 700)}</div>
    <table>
      <thead><tr><th>№</th><th>Точка</th><th>От левого угла, мм</th><th>От правого угла, мм</th><th>От пола, мм</th><th>До потолка, мм</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${ch.total > 0 ? `<div class="muted">Штробы: вертикальные ${toMm(ch.vertical)} мм, горизонтальные ${toMm(ch.horizontal)} мм, всего ${fmtNum(ch.total, 2)} м.</div>` : ""}
  </div>`)
    }
  }
  if (blocks.length === 0) return ""
  return `
  <div class="page-break"></div>
  <h2>Развёртки потолков и стен — объект ${escapeXml(meta.objectCode)}</h2>
  <div class="meta">
    Потолок — вид снизу, ориентация как на плане: светильники, споты и распаячные коробки с размерами от левой и
    верхней стены. Стены — вид на каждую стену изнутри помещения: где сверлить под розетки, выключатели, коробки и щит. Размеры в мм —
    до центра коробки, от чистого пола и от углов по внутренней стороне стены. Коричневые полосы — штробы:
    вертикально от верхней коробки к трассе под потолком и горизонтально между коробками на одной высоте, с длиной
    в мм. Справа вверху — мини-план: золотом отмечена развёрнутая стена, стрелка — откуда смотрим.
  </div>
  ${blocks.join("")}`
}

const PDF_HATCH_OPACITY = 0.45
const PDF_HATCH_INK = "#161616"
const pdfSwatch = (m: WallMaterial, w = 34, h = 16) => materialSwatchImg(m, w, h, PDF_HATCH_OPACITY, PDF_HATCH_INK)

/** Условные обозначения материалов стен под планом: образец штриховки и толщины */
function wallLegend(scheme: PlanScheme): string {
  const all = schemeWalls(scheme).all
  const used = usedMaterials(all.map((w) => w.material))
  if (!used.length) return ""
  const items = used
    .map((m) => {
      const th = [...new Set(all.filter((w) => w.material === m).map((w) => toMm(w.thickness)))].sort((a, b) => a - b)
      return `<div class="wl-item">${pdfSwatch(m)}<div><div class="wl-name">${escapeXml(WALL_MATERIALS[m].label)}</div><div class="wl-th">${th.join(", ")} мм</div></div></div>`
    })
    .join("")
  return `<div class="wall-legend"><div class="wl-title">Материалы стен</div><div class="wl-grid">${items}</div></div>`
}

/** Ведомость треков на листе потолка — по ней трек размечают рулеткой */
function trackTable(c: CeilingPlan): string {
  const rows = ceilingTrackRows(c)
  if (!rows.length) return ""
  return `
    <table>
      <thead><tr><th>№</th><th>Трек</th><th>Длина, мм</th><th>Направление / точки поворотов (X×Y от левой и верхней стены), мм</th><th>Начало от левой стены, мм</th><th>Начало от верхней стены, мм</th><th>Конец до правой, мм</th><th>Конец до нижней, мм</th><th>Высота, мм</th></tr></thead>
      <tbody>${rows
        .map(
          (r) => `
        <tr>
          <td class="num strong">Т${r.no}</td>
          <td>${escapeXml(r.name)}</td>
          <td class="num strong">${r.length}</td>
          <td>${r.dir}</td>
          <td class="num strong">${r.fromLeft}</td>
          <td class="num strong">${r.fromTop}</td>
          <td class="num">${r.toRight}</td>
          <td class="num">${r.toBottom}</td>
          <td class="num">${r.height}</td>
        </tr>`,
        )
        .join("")}</tbody>
    </table>`
}

/** Парящие потолки помещения — отступы и длина подсветки */
function floatingNote(scheme: PlanScheme, c: CeilingPlan): string {
  if (!c.floating.length) return ""
  const items = c.floating.map((f, i) => {
    const cn = floatingContour(scheme, f)
    const per = cn ? floatingPerimeter(cn) : 0
    return `ПП${c.floating.length > 1 ? i + 1 : ""} — отступ от стен ${toMm(f.offset ?? FLOATING_OFFSET)} мм, периметр подсветки ${fmtNum(per, 2)} м`
  })
  return `<div class="muted">Парящий потолок: ${items.map(escapeXml).join("; ")}.</div>`
}

/** Условные обозначения точек под схемой электрики или сантехники: значок, буква, количество, высота */
function nodeLegend(scheme: PlanScheme, layer: EngLayer): string {
  const items = nodeLegendItems(scheme.nodes || [], layer)
  const fx = layer === "electric" ? fixtureLegendItems(scheme.fixtures || []) : []
  if (!items.length && !fx.length) return ""
  const fxImg = (kind: string) =>
    `<img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      kind === "track"
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="24"><line x1="5" y1="12" x2="35" y2="12" stroke="#161616" stroke-width="3.5"/><line x1="5" y1="12" x2="35" y2="12" stroke="#fff" stroke-width="0.8"/><line x1="5" y1="7" x2="5" y2="17" stroke="#161616" stroke-width="1.4"/><line x1="35" y1="7" x2="35" y2="17" stroke="#161616" stroke-width="1.4"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="24"><rect x="5" y="5" width="30" height="14" fill="none" stroke="#2f80c9" stroke-width="1.3" stroke-dasharray="9 3 2 3"/></svg>',
    )}" width="40" height="24" style="vertical-align:middle;display:inline-block"/>`
  const fxHtml = fx
    .map(
      (i) =>
        `<div class="wl-item">${fxImg(i.kind)}<div><div class="wl-name"><b>${i.code}</b> — ${escapeXml(i.label)} — ${escapeXml(i.total)}</div><div class="wl-th">${i.kind === "track" ? "длина у линии, мм" : "светящийся контур с отступом от стен"}</div></div></div>`,
    )
    .join("")
  const html = fxHtml + items
    .map(
      (i) =>
        `<div class="wl-item">${nodeLegendImg(i.kind)}<div><div class="wl-name">${i.code ? `<b>${escapeXml(i.code)}</b> — ` : ""}${escapeXml(i.label)} — ${i.count} шт.</div><div class="wl-th">высота ${i.heights.join(", ")} мм от пола</div></div></div>`,
    )
    .join("")
  return `<div class="wall-legend"><div class="wl-title">Условные обозначения</div><div class="wl-grid">${html}</div></div>`
}

/** Условные обозначения окон, дверей и проёмов под планом */
function openingLegend(scheme: PlanScheme): string {
  const items = openingLegendItems(scheme.openings)
  if (!items.length) return ""
  const html = items
    .map(
      (i) =>
        `<div class="wl-item">${openingSwatchImg(i.kind, PDF_OPENING_PALETTE)}<div><div class="wl-name">${i.label} — ${i.count} шт.</div><div class="wl-th">${OPENING_HINTS[i.kind]}${i.sizes.length ? ` · ${i.sizes.join(", ")} мм` : ""}</div></div></div>`,
    )
    .join("")
  return `<div class="wall-legend"><div class="wl-title">Окна, двери и проёмы</div><div class="wl-grid">${html}</div></div>`
}

/** Стены по помещениям: длина, толщина и материал */
function wallsTable(scheme: PlanScheme): string {
  const all = schemeWalls(scheme).all
  if (all.length === 0) return ""
  const rows = scheme.rooms
    .map((r) => {
      const ws = all.filter((w) => w.roomId === r.id)
      if (!ws.length) return ""
      return ws
        .map(
          (w, i) => `
      <tr>
        ${i === 0 ? `<td rowspan="${ws.length}">${escapeXml(r.name)}</td>` : ""}
        <td class="num">${w.index + 1}${w.shared ? "*" : ""}</td>
        <td class="num">${toMm(w.length)}</td>
        <td class="num">${toMm(w.thickness)}</td>
        <td>${pdfSwatch(w.material, 26, 12)} ${escapeXml(WALL_MATERIALS[w.material].label)}</td>
      </tr>`,
        )
        .join("")
    })
    .join("")
  return `
  <h3>Стены</h3>
  <table>
    <thead><tr><th>Помещение</th><th>№</th><th>Длина, мм</th><th>Толщина, мм</th><th>Материал</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="legend" style="text-align:left">
    Длина — по внутренней стороне помещения. «*» — общая стена с соседним помещением, на плане её толщина делится
    пополам. Штриховка на плане — по материалу стены.
  </div>`
}

/**
 * Значок для таблиц PDF картинкой: встроенный SVG в ячейке html2canvas обрезает,
 * а data-URI рисует целиком. Кодируем через encodeURIComponent — без проблем с кириллицей
 */
/** Расшифровка цветов сечений, которые есть в проекте */
function sectionLegend(scheme: PlanScheme): string {
  const used = [...new Set((scheme.links || []).filter((l) => l.layer === "electric").map((l) => String(sectionOf(l.spec))))]
    .sort((a, b) => Number(a) - Number(b))
  return used
    .map((s) => {
      const c = SECTION_COLORS[s]
      const col = c ? c.print : "#555555"
      return `<span style="display:inline-block;width:18px;height:3px;background:${col};vertical-align:middle;margin:0 3px 0 6px"></span>${s.replace(".", ",")} мм²`
    })
    .join("")
}

function symbolImg(kind: NodeKind, w = 48, h = 30): string {
  const svg = symbolIconSvg(kind, w, h, 9, "#161616", "#ffffff")
  if (!svg) return ""
  return `<img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}" width="${w}" height="${h}" style="display:block;margin:0 auto"/>`
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

/** Штамп листов: из плана, иначе — данные объекта и логотип компании */
export function planStamp(scheme: PlanScheme, meta: PlanPdfMeta): DrawingStamp {
  const st = scheme.stamp
  return {
    project: st?.project || `Дизайн-проект, объект ${meta.objectCode}`,
    address: st?.address || meta.address || "",
    author: st?.author || "",
    contacts: st?.contacts || "",
    scale: st?.scale || "—",
    date: st?.date || "",
    logoUrl: st?.logoUrl || `${window.location.origin}/logo-print.png`,
  }
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
      const ow = findWall(scheme, o.wallId)
      return `
        <tr>
          <td>${openingSwatchImg(o.kind, PDF_OPENING_PALETTE, 34, 17)} ${kind}</td>
          <td>${escapeXml(room?.name || "—")}</td>
          <td class="num">${ow ? toMm(ow.thickness) : "—"}</td>
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
    .plan-doc td.sym { width: 58px; text-align: center; padding: 3px 4px; vertical-align: middle; }
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
    .plan-doc tr.sec-row td { background: #f7f2e2; font-weight: bold; font-size: 11px; }
    .plan-doc .elev { page-break-inside: avoid; break-inside: avoid; margin-bottom: 14px; }
    .plan-doc .legend { font-size: 10px; color: #666; text-align: center; margin-bottom: 6px; }
    .plan-doc .wall-legend { border: 1px solid #ddd; border-radius: 4px; padding: 6px 10px; margin: 4px 0 8px; page-break-inside: avoid; break-inside: avoid; }
    .plan-doc .wl-title { font-size: 10px; font-weight: bold; color: #161616; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.04em; }
    .plan-doc .wl-grid { display: flex; flex-wrap: wrap; gap: 6px 18px; }
    .plan-doc .wl-item { display: flex; align-items: center; gap: 6px; font-size: 10px; color: #161616; }
    .plan-doc .wl-name { font-weight: 600; }
    .plan-doc .wl-th { color: #777; font-size: 9px; }
  </style>

  <h2>План помещений — объект ${escapeXml(meta.objectCode)}</h2>
  <div class="meta">
    ${meta.clientName ? `Заказчик: ${escapeXml(meta.clientName)}. ` : ""}
    ${meta.address ? `Адрес: ${escapeXml(meta.address)}. ` : ""}
    Дата формирования: ${today}
  </div>

  <div class="plan-img">${svg}</div>
  ${wallLegend(scheme)}
  ${openingLegend(scheme)}
  <div class="legend">Размеры на чертеже указаны в миллиметрах.</div>

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
        <th>Глубина откоса, мм</th>
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

  ${wallsTable(scheme)}
  ${interiorSection(scheme, meta)}
  ${floorPlanSection(scheme, meta)}
  ${finishElevationsSection(scheme, meta)}
  ${finishMaterialsSection(scheme, meta)}
  ${engineerSection(scheme, "electric", meta)}
  ${heatingLayoutSection(scheme, meta)}
  ${panelSection(scheme, meta)}
  ${materialsSection(scheme, meta)}
  ${elevationsSection(scheme, meta)}
  ${engineerSection(scheme, "plumbing", meta)}
</div>`.trim()
}

/** Отдельный лист со схемой электрики или сантехники и ведомостью по ней */
function engineerSection(
  scheme: PlanScheme,
  layer: EngLayer,
  meta: PlanPdfMeta,
): string {
  const nodes = (scheme.nodes || []).filter((n) => n.layer === layer)
  const links = (scheme.links || []).filter((l) => l.layer === layer)
  const hasFixtures = layer === "electric" && (scheme.fixtures || []).length > 0
  if (nodes.length === 0 && links.length === 0 && !hasFixtures) return ""

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
      c = cableLength(l, byId, scheme.rooms, scheme.defaultHeight, scheme.cable, scheme)
    } else {
      const g = linkGeometry(l, byId)
      c = g ? { plan: g.length, drops: 0, reserve: 0, wall: 0, total: g.length } : null
    }
    if (!c) return acc
    acc[l.spec] = addCable(acc[l.spec] || emptyTotals(), c)
    return acc
  }, {})
  const specTotal = Object.values(specs).reduce((acc, c) => addCable(acc, c), emptyTotals())
  const hasWall = specTotal.wall > 1e-6
  const cfg = cableSettings(scheme.cable)

  const nodeRows = Object.entries(counts)
    .map(
      ([kind, count]) => `
      <tr>
        <td class="sym">${symbolImg(kind as NodeKind)}</td>
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
        <td>${isElectric ? `<span style="display:inline-block;width:16px;height:4px;background:${sectionColor(spec, true)};vertical-align:middle;margin-right:5px"></span>` : ""}${escapeXml(spec)}</td>
        <td class="num">${fmtNum(c.plan, 2)}</td>${
          isElectric
            ? `
        <td class="num">${fmtNum(c.drops, 2)}</td>${hasWall ? `
        <td class="num">${fmtNum(c.wall, 2)}</td>` : ""}
        <td class="num">${fmtNum(c.reserve, 2)}</td>
        <td class="num strong">${fmtNum(c.total, 2)}</td>`
            : ""
        }
      </tr>`,
    )
    .join("")

  // Одинаковые точки в одном помещении (тип, подпись, высота) — одной строкой с количеством
  const grouped = new Map<string, { room: string; name: string; kind: NodeKind; height: number; qty: number; places: string[]; grp: string }>()
  const listGroups0 = isElectric ? nodeGroupNums(scheme) : new Map<string, number[]>()
  for (const n of nodes) {
    const room = roomName(n.roomId)
    const name = n.label || NODE_PRESETS[n.kind].label
    const grp = groupTag(listGroups0.get(n.id))
    const key = `${room}|${n.kind}|${name}|${toMm(n.height)}|${grp}`
    const place = mountLabel(scheme, n)
    const row = grouped.get(key)
    if (row) {
      row.qty += 1
      if (place !== "—" && !row.places.includes(place)) row.places.push(place)
    } else {
      grouped.set(key, { room, name, kind: n.kind, height: n.height, qty: 1, places: place !== "—" ? [place] : [], grp })
    }
  }
  const listGroups = [...grouped.values()].sort((a, b) => a.room.localeCompare(b.room, "ru") || a.kind.localeCompare(b.kind))
  let lastRoom = ""
  const listRows = listGroups
    .map((r) => {
      const head = r.room !== lastRoom ? `<tr class="sec-row"><td colspan="5">${escapeXml(r.room)}</td></tr>` : ""
      lastRoom = r.room
      return `${head}
      <tr>
        <td class="sym">${symbolImg(r.kind, 40, 24)}</td>
        <td>${NODE_CODES[r.kind] || r.grp ? `<b>${escapeXml([NODE_CODES[r.kind], r.grp].filter(Boolean).join(" · "))}</b> ` : ""}${escapeXml(r.name)}${r.name !== NODE_PRESETS[r.kind].label ? `<div class="muted">${escapeXml(NODE_PRESETS[r.kind].label)}</div>` : ""}</td>
        <td>${escapeXml(r.places.join("; ") || "—")}</td>
        <td class="num">${toMm(r.height)}</td>
        <td class="num strong">${r.qty}</td>
      </tr>`
    })
    .join("")

  return `
  <div class="page-break"></div>
  <h2>${title} — объект ${escapeXml(meta.objectCode)}</h2>
  <div class="plan-img">${schemeToSvg(scheme, 700, 460, layer)}</div>
  <div class="legend">
    Планировка показана серым как подложка. ${
      layer === "electric"
        ? `Линии — кабельные трассы с поворотами под 90°, цвет — сечение кабеля: ${sectionLegend(scheme)}. Длина трасс — в таблице ниже. Настенные элементы развёрнуты от стены в помещение.`
        : "Пунктир — трубы, подпись у линии — диаметр."
    }
  </div>

  ${nodeLegend(scheme, layer)}

  ${layer === "electric" ? heatingElectricTable(scheme) : ""}

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
        ? `<th>Сечение</th><th>По плану, м</th><th>Спуски, м</th>${hasWall ? "<th>В откосы, м</th>" : ""}<th>Запас на концы, м</th><th>Итого с запасом, м</th>`
        : "<th>Диаметр</th><th>Длина по трассе, м</th>"
    }</tr></thead>
    <tbody>${specRows}${
      isElectric
        ? `
      <tr class="totals">
        <td>Всего</td>
        <td class="num">${fmtNum(specTotal.plan, 2)}</td>
        <td class="num">${fmtNum(specTotal.drops, 2)}</td>${hasWall ? `
        <td class="num">${fmtNum(specTotal.wall, 2)}</td>` : ""}
        <td class="num">${fmtNum(specTotal.reserve, 2)}</td>
        <td class="num">${fmtNum(specTotal.total, 2)}</td>
      </tr>`
        : ""
    }</tbody>
  </table>
  <div class="legend" style="text-align:left">${
    isElectric
      ? `По плану — длина трассы с поворотами. Спуски — от трассы, проложенной на ${toMm(cfg.traceFromCeiling)} мм ниже потолка, до высоты каждой точки.${hasWall ? " В откосы — у точек в откосах окон и дверей трасса идёт по стене до угла проёма и заходит в откос на глубину установки." : ""} Запас — ${toMm(cfg.endReserve)} мм на разделку каждого конца кабеля.`
      : "Длина посчитана по трассе с поворотами."
  }</div>`
      : ""
  }

  ${layer === "electric" ? groupsTable(scheme) : ""}

  <h3>Список точек по помещениям</h3>
  <table>
    <thead><tr><th>Обозн.</th><th>Точка</th><th>Место</th><th>Высота, мм</th><th>Кол-во, шт</th></tr></thead>
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
  ${phaseBlock(scheme)}
  ${panelSizeBlock(scheme)}`
}

/** Таблица распределения групп по фазам — только для трёхфазного ввода */
function phaseBlock(scheme: PlanScheme): string {
  const bal = phaseBalance(scheme)
  if (!bal) return ""
  const sums = groupSummaries(scheme).filter((x) => x.group)
  const groupRows = sums
    .map((sum) => {
      const g = sum.group!
      const ph = bal.byGroup.get(g.id)!
      const p = groupPower(sum)
      return `
      <tr>
        <td class="num"><span class="dot" style="background:${groupColor(g.num)}"></span>${g.num}</td>
        <td>${escapeXml(g.name || describeNodes(sum.nodeCounts) || "—")}</td>
        <td class="num strong" style="color:${PHASE_COLORS[ph]}">${ph}${bal.manual.has(g.id) ? "" : " *"}</td>
        <td class="num">${fmtNum(p.kw, 2)}${p.estimated ? " ≈" : ""}</td>
        <td class="num">${fmtNum(kwToAmps(p.kw), 1)}</td>
      </tr>`
    })
    .join("")
  const loadRows = bal.loads
    .map(
      (l) => `
      <tr>
        <td class="strong" style="color:${PHASE_COLORS[l.phase]}">${l.phase}</td>
        <td>${l.groups.length ? l.groups.join(", ") : "—"}</td>
        <td class="num strong">${fmtNum(l.kw, 2)}</td>
        <td class="num strong">${fmtNum(l.amps, 1)}</td>
      </tr>`,
    )
    .join("")
  return `
  <h3>Распределение групп по фазам</h3>
  <table>
    <thead><tr><th>Фаза</th><th>Группы</th><th>Нагрузка, кВт</th><th>Ток, А</th></tr></thead>
    <tbody>
      ${loadRows}
      <tr class="totals">
        <td colspan="2">Всего, перекос фаз ${bal.imbalance}%</td>
        <td class="num">${fmtNum(bal.totalKw, 2)}</td>
        <td></td>
      </tr>
    </tbody>
  </table>
  <table style="margin-top:8px">
    <thead><tr><th>№</th><th>Группа</th><th>Фаза</th><th>Мощность, кВт</th><th>Ток, А</th></tr></thead>
    <tbody>${groupRows}</tbody>
  </table>
  <div class="legend" style="text-align:left">
    Ток посчитан при 230 В на фазу. «≈» — мощность оценена по точкам группы с учётом одновременности
    (розетка 0,3 кВт, силовая розетка 2,5 кВт, светильник 0,1 кВт), не больше номинала автомата; точную мощность
    лучше задать в группе. «*» — фаза выбрана автоматически для наименьшего перекоса. Перекос — разница
    между самой нагруженной и самой свободной фазой; желательно не больше 30%.
  </div>`
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

type H2PWorker = { toContainer: () => H2PWorker; toPdf: () => H2PWorker; get: (k: string) => Promise<unknown> }

async function withStamps(worker: H2PWorker, scheme: PlanScheme, meta: PlanPdfMeta) {
  // Раскладка с разрывами страниц — по ней узнаём, какой чертёж на каком листе
  const holder = (await worker.toContainer().get("container")) as HTMLElement
  const inner = (await worker.get("pageSize")) as { inner: { ratio: number } }
  const pagePx = holder.getBoundingClientRect().width * inner.inner.ratio
  const top0 = holder.getBoundingClientRect().top
  const heads = Array.from(holder.querySelectorAll("h2")).map((h) => ({
    page: Math.floor((h.getBoundingClientRect().top - top0) / pagePx),
    title: (h.textContent || "").replace(/\s+—\s+объект.*$/, "").trim(),
  }))
  const pdf = (await worker.toPdf().get("pdf")) as import("jspdf").jsPDF

  const { appendVizSheets, defaultSheets, stampImage } = await import("./vizAlbum")
  const stamp = planStamp(scheme, meta)
  const viz = defaultSheets(scheme, {})
  const n = pdf.getNumberOfPages()
  const total = n + viz.length
  const no = (p: number) => (p === 1 ? 1 : p + viz.length)

  // Штамп на каждом листе чертежей: название листа — по последнему заголовку на нём или до него
  for (let p = 1; p <= n; p++) {
    const h = [...heads].reverse().find((x) => x.page <= p - 1)
    const st = await stampImage(stamp, h?.title || "План помещений", no(p), total)
    pdf.setPage(p)
    const w = 190
    const hh = w * st.ratio
    pdf.addImage(st.data, "PNG", 10, 297 - 7 - hh, w, hh)
  }

  // Визуализации — крупными листами сразу за обложкой
  if (viz.length) {
    await appendVizSheets(pdf, viz, stamp, (i) => 2 + i, total)
    for (let j = 0; j < viz.length; j++) pdf.movePage(n + 1 + j, 2 + j)
  }
  return pdf
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
  // Снимки 3D-видов грузятся из хранилища — ждём их, иначе в PDF будут пустые рамки
  const pics = Array.from(root.querySelectorAll<HTMLImageElement>("img.render-img, .render-room img"))
  await Promise.all(
    pics.map(
      (im) =>
        new Promise<void>((resolve) => {
          if (im.complete && im.naturalWidth) return resolve()
          im.onload = () => resolve()
          im.onerror = () => {
            im.style.display = "none"
            resolve()
          }
          setTimeout(resolve, 8000)
        }),
    ),
  )

  const html2pdf = (await import("html2pdf.js")).default
  const MB = 31
  const worker = html2pdf()
    .set({
      margin: [10, 10, MB, 10],
      filename: `План помещений ${meta.objectCode}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"], before: ".page-break", avoid: [".render-room"] },
    } as Record<string, unknown>)
    .from(root) as unknown as H2PWorker

  try {
    let pdf: import("jspdf").jsPDF
    try {
      pdf = await withStamps(worker, scheme, meta)
    } catch (e) {
      // Штамп и листы визуализаций не собрались (например, картинка не загрузилась) — отдаём PDF без них
      console.error("plan pdf stamps", e)
      const plain = html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"], before: ".page-break", avoid: [".render-room"] },
        } as Record<string, unknown>)
        .from(root)
      pdf = (await plain.toPdf().get("pdf")) as import("jspdf").jsPDF
    }
    if (mode === "blob") return pdf.output("blob")
    pdf.save(`План помещений ${meta.objectCode}.pdf`)
  } finally {
    document.body.removeChild(container)
  }
}