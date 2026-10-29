import type { CSSProperties, ReactNode } from "react"
import { FIXTURE_PRESETS, PlanFixture, PlanScheme } from "@/lib/planner/types"
import { fmtMm } from "@/lib/planner/geometry"
import { fixtureLength, floatingContour, trackOffsets } from "@/lib/planner/fixtures"
import { alongSegment } from "@/lib/planner/labelLayout"
import { textWidth } from "@/lib/planner/labelLayout"
import { ToScreen } from "./usePlanView"
import type { LabelJob } from "./labelJobs"
import { spotAttrs } from "@/lib/planner/labelLayout"

export const TRACK_COLOR = "#ECECEC"
export const FLOATING_COLOR = "#7dd3fc"
const SEL = "#D4AF37"
const DIM_C = "#D4AF37"

interface Args {
  scheme?: PlanScheme
  fixtures: PlanFixture[]
  selectedFixtureId: string | null
  scale: number
  toScreen: ToScreen
  jobs: LabelJob[]
  halo: CSSProperties
}

/** Размерная линия с засечками; подпись идёт в общий раскладчик */
export function dimLine(
  key: string,
  a: { x: number; y: number },
  b: { x: number; y: number },
  meters: number,
  toScreen: ToScreen,
  jobs: LabelJob[],
  halo: CSSProperties,
  color = DIM_C,
): ReactNode {
  const pa = toScreen(a)
  const pb = toScreen(b)
  const len = Math.hypot(pb.x - pa.x, pb.y - pa.y)
  if (len < 8) return null
  const ux = (pb.x - pa.x) / len
  const uy = (pb.y - pa.y) / len
  const tick = (p: { x: number; y: number }) => (
    <line x1={p.x - uy * 5} y1={p.y + ux * 5} x2={p.x + uy * 5} y2={p.y - ux * 5} stroke={color} strokeWidth={1.4} />
  )
  const text = fmtMm(meters)
  jobs.push({
    prio: 1,
    cands: alongSegment(pa, pb, textWidth(text, 10, true), 11, 4),
    render: (sp) => (
      <text key={`dl${key}`} {...spotAttrs(sp)} fontSize="10" fontWeight="700" fill={color} style={halo}>
        {text}
      </text>
    ),
  })
  return (
    <g key={key} pointerEvents="none">
      <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={color} strokeWidth={1} strokeDasharray="4 3" />
      {tick(pa)}
      {tick(pb)}
    </g>
  )
}

/** Треки — толстой линией с торцевыми засечками; парящий потолок — светящимся контуром */
export function renderFixtures({ scheme, fixtures, selectedFixtureId, scale, toScreen, jobs, halo }: Args): ReactNode[] {
  if (!scheme) return []
  const out: ReactNode[] = []
  for (const f of fixtures) {
    const selected = f.id === selectedFixtureId
    const code = FIXTURE_PRESETS[f.kind].code
    if (f.kind === "floating") {
      const c = floatingContour(scheme, f)
      if (!c) continue
      const pts = c.map((p) => {
        const s = toScreen(p)
        return `${s.x},${s.y}`
      })
      out.push(
        <g key={f.id}>
          <polygon points={pts.join(" ")} fill="none" stroke={FLOATING_COLOR} strokeWidth={7} opacity={0.14} />
          <polygon
            points={pts.join(" ")}
            fill="none"
            stroke={selected ? SEL : FLOATING_COLOR}
            strokeWidth={selected ? 2.4 : 1.6}
            strokeDasharray="10 4 2 4"
          />
        </g>,
      )
      // Подпись — на самой длинной стороне контура
      let bi = 0
      let bl = 0
      c.forEach((p, i) => {
        const q = c[(i + 1) % c.length]
        const l = Math.hypot(q.x - p.x, q.y - p.y)
        if (l > bl) {
          bl = l
          bi = i
        }
      })
      const text = `${code} · отступ ${fmtMm(f.offset ?? 0.1)}`
      jobs.push({
        prio: selected ? -1 : 2,
        cands: alongSegment(toScreen(c[bi]), toScreen(c[(bi + 1) % c.length]), textWidth(text, 10, true), 11, 5),
        render: (sp) => (
          <text key={`fl${f.id}`} {...spotAttrs(sp)} fontSize="10" fontWeight="700" fill={selected ? SEL : FLOATING_COLOR} style={halo}>
            {text}
          </text>
        ),
      })
      if (selected) {
        // Отступ от стены показываем у середины самой длинной стороны
        const room = scheme.rooms.find((r) => r.id === f.roomId)
        if (room) {
          const a = c[bi]
          const b = c[(bi + 1) % c.length]
          const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
          const ra = room.points[bi]
          const rb = room.points[(bi + 1) % room.points.length]
          if (ra && rb) {
            const dx = rb.x - ra.x
            const dy = rb.y - ra.y
            const l2 = dx * dx + dy * dy || 1
            const t = ((m.x - ra.x) * dx + (m.y - ra.y) * dy) / l2
            const w = { x: ra.x + dx * t, y: ra.y + dy * t }
            out.push(dimLine(`fo${f.id}`, w, m, f.offset ?? 0.1, toScreen, jobs, halo))
          }
        }
      }
      continue
    }

    const pa = toScreen(f.a)
    const pb = toScreen(f.b)
    const len = Math.hypot(pb.x - pa.x, pb.y - pa.y) || 1
    const nx = -(pb.y - pa.y) / len
    const ny = (pb.x - pa.x) / len
    const color = selected ? SEL : TRACK_COLOR
    out.push(
      <g key={f.id}>
        <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="#141414" strokeWidth={8} strokeLinecap="butt" />
        <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={color} strokeWidth={selected ? 5 : 4} strokeLinecap="butt" />
        <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="#141414" strokeWidth={1.2} />
        {[pa, pb].map((p, i) => (
          <line key={i} x1={p.x - nx * 7} y1={p.y - ny * 7} x2={p.x + nx * 7} y2={p.y + ny * 7} stroke={color} strokeWidth={2} />
        ))}
      </g>,
    )
    const text = `${code} ${fmtMm(fixtureLength(f))}`
    jobs.push({
      prio: selected ? -1 : 0,
      cands: alongSegment(pa, pb, textWidth(text, 10, true), 11, 7),
      render: (sp) => (
        <text key={`tl${f.id}`} {...spotAttrs(sp)} fontSize="10" fontWeight="700" fill={color} style={halo}>
          {text}
        </text>
      ),
    })
    // У выбранного трека — отступы от стен: сбоку и с обоих торцов
    if (selected && scale > 0) out.push(...trackDims(scheme, f, toScreen, jobs, halo))
  }
  return out
}

/** Размеры трека до стен: отступ сбоку и от торцов */
export function trackDims(scheme: PlanScheme, f: PlanFixture, toScreen: ToScreen, jobs: LabelJob[], halo: CSSProperties): ReactNode[] {
  const o = trackOffsets(scheme, f)
  if (!o.lo || !o.hi) return []
  const out: ReactNode[] = []
  const mid = { x: (f.a.x + f.b.x) / 2, y: (f.a.y + f.b.y) / 2 }
  if (o.side !== null) {
    const w = o.horiz ? { x: mid.x, y: mid.y + o.sideDir * o.side } : { x: mid.x + o.sideDir * o.side, y: mid.y }
    out.push(dimLine(`ts${f.id}`, mid, w, o.side, toScreen, jobs, halo))
  }
  if (o.startEnd !== null) {
    const w = o.horiz ? { x: o.lo.x - o.startEnd, y: o.lo.y } : { x: o.lo.x, y: o.lo.y - o.startEnd }
    out.push(dimLine(`t1${f.id}`, w, o.lo, o.startEnd, toScreen, jobs, halo))
  }
  if (o.endEnd !== null) {
    const w = o.horiz ? { x: o.hi.x + o.endEnd, y: o.hi.y } : { x: o.hi.x, y: o.hi.y + o.endEnd }
    out.push(dimLine(`t2${f.id}`, o.hi, w, o.endEnd, toScreen, jobs, halo))
  }
  return out
}
