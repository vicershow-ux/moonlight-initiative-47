import type { PlanPoint } from "./types"

export interface OcrWord {
  text: string
  confidence: number
  bbox: { x0: number; y0: number; x1: number; y1: number }
}

export interface RoomLabel {
  planNo?: string
  planArea?: number
}

/**
 * Номер и площадь помещения из слов, прочитанных внутри контура.
 * Площадь — число с одним знаком после запятой, ближайшее к нарисованной площади
 * (точку распознавание часто теряет: «124» читаем как 12,4). Номер — целое над площадью
 */
export function pickLabel(words: OcrWord[], drawnArea: number): RoomLabel {
  const cands: { v: number; w: OcrWord; score: number }[] = []
  for (const w of words) {
    const t = w.text.replace(/[^\d.,/]/g, "").replace(",", ".")
    if (!t) continue
    // «11/9.0» одной строкой
    const slash = t.split("/")
    const body = slash[slash.length - 1]
    const vars: { v: number; exact: boolean }[] = []
    if (/^\d{1,3}\.\d$/.test(body)) vars.push({ v: Number(body), exact: true })
    else if (/^\d{2,4}$/.test(body)) vars.push({ v: Number(body) / 10, exact: false })
    else if (/^\.?\d{1,3}\.?\d?$/.test(body)) vars.push({ v: Number(body.replace(/^\./, "")), exact: false })
    for (const x of vars) {
      if (!(x.v > 0.3 && x.v < 300)) continue
      const rel = Math.abs(x.v - drawnArea) / Math.max(drawnArea, 0.5)
      if (rel > 0.4) continue
      cands.push({ v: x.v, w, score: rel - (x.exact ? 0.05 : 0) - w.confidence / 2000 })
    }
  }
  if (!cands.length) return {}
  cands.sort((a, b) => a.score - b.score)
  const best = cands[0]
  const res: RoomLabel = { planArea: Math.round(best.v * 10) / 10 }
  const inline = best.w.text.split("/")
  if (inline.length === 2 && /^\d{1,2}$/.test(inline[0])) {
    res.planNo = inline[0]
    return res
  }
  // Номер — целое из 1–2 цифр над площадью
  const bw = best.w.bbox
  const h = bw.y1 - bw.y0
  const cx = (bw.x0 + bw.x1) / 2
  let bestNo: { t: string; d: number } | null = null
  for (const w of words) {
    if (w === best.w) continue
    const t = w.text.replace(/[^\d]/g, "")
    if (!/^\d{1,2}$/.test(t) || t === "0") continue
    const dy = bw.y0 - w.bbox.y1
    const dx = Math.abs((w.bbox.x0 + w.bbox.x1) / 2 - cx)
    if (dy < -h * 0.3 || dy > h * 3 || dx > h * 3) continue
    const d = dy + dx
    if (!bestNo || d < bestNo.d) bestNo = { t, d }
  }
  if (bestNo) res.planNo = bestNo.t
  return res
}

const areaOf = (pts: PlanPoint[]) =>
  Math.abs(pts.reduce((s, p, k) => s + p.x * pts[(k + 1) % pts.length].y - pts[(k + 1) % pts.length].x * p.y, 0)) / 2

/** Вырезка помещения из фото для чтения: увеличена в 3 раза и контрастнее */
export function cropRoom(gray: Float32Array, W: number, H: number, toPx: (p: PlanPoint) => PlanPoint, pts: PlanPoint[]) {
  const ps = pts.map(toPx)
  const pad = 4
  const x0 = Math.max(0, Math.round(Math.min(...ps.map((p) => p.x)) + pad))
  const y0 = Math.max(0, Math.round(Math.min(...ps.map((p) => p.y)) + pad))
  const x1 = Math.min(W, Math.round(Math.max(...ps.map((p) => p.x)) - pad))
  const y1 = Math.min(H, Math.round(Math.max(...ps.map((p) => p.y)) - pad))
  const cw = x1 - x0
  const ch = y1 - y0
  if (cw < 8 || ch < 8) return null
  let lo = 255
  let hi = 0
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      const v = gray[y * W + x]
      if (v < lo) lo = v
      if (v > hi) hi = v
    }
  const span = Math.max(hi - lo, 1)
  const S = 3
  const out = new Uint8ClampedArray(cw * S * ch * S * 4)
  for (let y = 0; y < ch * S; y++)
    for (let x = 0; x < cw * S; x++) {
      // Билинейная интерполяция — цифры не рассыпаются на квадраты
      const fx = x / S + x0
      const fy = y / S + y0
      const ix = Math.min(Math.floor(fx), W - 2)
      const iy = Math.min(Math.floor(fy), H - 2)
      const tx = fx - ix
      const ty = fy - iy
      const v =
        gray[iy * W + ix] * (1 - tx) * (1 - ty) +
        gray[iy * W + ix + 1] * tx * (1 - ty) +
        gray[(iy + 1) * W + ix] * (1 - tx) * ty +
        gray[(iy + 1) * W + ix + 1] * tx * ty
      const n = Math.max(0, Math.min(255, ((v - lo) / span) * 255))
      const k = (y * cw * S + x) * 4
      out[k] = out[k + 1] = out[k + 2] = n
      out[k + 3] = 255
    }
  return { data: out, w: cw * S, h: ch * S }
}

/** Прочитать номера и площади всех найденных помещений (в браузере) */
export async function readRoomLabels(
  gray: Float32Array,
  W: number,
  H: number,
  toPx: (p: PlanPoint) => PlanPoint,
  rooms: PlanPoint[][],
): Promise<RoomLabel[]> {
  const { createWorker, PSM } = await import("tesseract.js")
  const worker = await createWorker("eng")
  await worker.setParameters({ tessedit_char_whitelist: "0123456789.,/", tessedit_pageseg_mode: PSM.SPARSE_TEXT })
  const res: RoomLabel[] = []
  try {
    for (const pts of rooms) {
      const crop = cropRoom(gray, W, H, toPx, pts)
      if (!crop) {
        res.push({})
        continue
      }
      const c = document.createElement("canvas")
      c.width = crop.w
      c.height = crop.h
      c.getContext("2d")!.putImageData(new ImageData(crop.data, crop.w, crop.h), 0, 0)
      const r = await worker.recognize(c)
      res.push(pickLabel(r.data.words as OcrWord[], areaOf(pts)))
    }
  } finally {
    await worker.terminate()
  }
  return res
}
