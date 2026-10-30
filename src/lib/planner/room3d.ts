import * as THREE from "three"
import {
  CEILING_FINISHES,
  FLOOR_FINISHES,
  PlanFurniture,
  PlanRoom,
  PlanScheme,
  WALL_FINISHES,
  roomFinish,
  wallFinishOf,
  floorTileOf,
  wallTileOf,
  MaterialRef,
} from "./types"
import { rightAligned } from "./elevation"
import { FinishPattern, floorFinishPattern, paintPattern, shade, tilePattern, wallpaperPattern } from "./finishTextures"
import { roomWalls, openingSpan } from "./walls"

/** Палитра мебели: дерево, ткань, белая техника и сантехника */
const MAT = {
  wood: "#a0784f",
  woodLight: "#c9a77c",
  fabric: "#7a8794",
  fabricLight: "#d9d4cc",
  white: "#f2f2f0",
  steel: "#b8bcc0",
  dark: "#3a3a3a",
  ceramic: "#fbfbfb",
}

const FURN_COLOR: Partial<Record<PlanFurniture["kind"], string>> = {
  bed_double: MAT.fabricLight,
  bed_single: MAT.fabricLight,
  sofa: MAT.fabric,
  armchair: MAT.fabric,
  wardrobe: MAT.woodLight,
  dresser: MAT.wood,
  nightstand: MAT.wood,
  table: MAT.wood,
  desk: MAT.wood,
  chair: MAT.dark,
  tv_stand: MAT.dark,
  shelf: MAT.woodLight,
  kitchen_base: MAT.white,
  kitchen_wall: MAT.white,
  fridge: MAT.steel,
  stove: MAT.dark,
  sink_kitchen: MAT.steel,
  dishwasher: MAT.steel,
  bath: MAT.ceramic,
  shower: MAT.ceramic,
  toilet_f: MAT.ceramic,
  washbasin: MAT.ceramic,
  washer: MAT.white,
  boiler_f: MAT.white,
  towel_rail: MAT.steel,
  custom: MAT.woodLight,
}

/**
 * Текстура из рисунка отделки в реальном масштабе. UV геометрии — в метрах,
 * поэтому repeat = 1 / размер фрагмента: плитка 600×600 на полу ровно 600×600
 */
function patternTexture(p: FinishPattern, pxPerM = 512): THREE.CanvasTexture {
  // Канвас не больше 1024 px: для крупного фрагмента уменьшаем плотность
  const k = Math.min(pxPerM, 1024 / Math.max(p.repeatW, p.repeatH))
  const c = document.createElement("canvas")
  c.width = Math.max(Math.round(p.repeatW * k), 8)
  c.height = Math.max(Math.round(p.repeatH * k), 8)
  const g = c.getContext("2d")!
  p.draw(g, k)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = THREE.RepeatWrapping
  t.wrapT = THREE.RepeatWrapping
  t.repeat.set(1 / p.repeatW, 1 / p.repeatH)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

/**
 * Фото-материал из библиотеки: картинка грузится с CDN, пока грузится — виден базовый цвет.
 * repeat — плитка рисунка размером w × h м; panel — растягивается на одно панно
 */
/** Загрузки фото-текстур текущей сцены — автоснимок ждёт их, чтобы в PDF не было пустых стен */
let pendingLoads: Promise<void>[] | null = null
function photoTexture(ref: MaterialRef, repeatW?: number, repeatH?: number): THREE.Texture {
  const loader = new THREE.TextureLoader()
  loader.setCrossOrigin("anonymous")
  let done: () => void = () => {}
  const wait = new Promise<void>((r) => (done = r))
  pendingLoads?.push(wait)
  const t = loader.load(ref.url, () => done(), undefined, () => done())
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  if (ref.mode === "repeat") {
    t.wrapS = THREE.RepeatWrapping
    t.wrapT = THREE.RepeatWrapping
    t.repeat.set(repeatW ?? 1 / ref.w, repeatH ?? 1 / ref.h)
  }
  return t
}

/** Стеновые панели — вертикальные ламели */
function plankPattern3d(color: string): FinishPattern {
  return tilePattern({ w: 0.2, h: 2.8, joint: 0.004, layout: "grid", color, grout: shade(color, -35) })
}

const std = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0, ...extra })

/** Коробка в координатах плана: x, y — центр на плане, z0 — низ от пола */
function box(w: number, d: number, h: number, mat: THREE.Material, x = 0, y = 0, z0 = 0): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
  m.position.set(x, z0 + h / 2, y)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

/**
 * Автоснимки комнаты для листа визуализаций: виды изнутри с высоты глаз из углов комнаты,
 * как в дизайн-проекте. Рендер без окна, после загрузки всех фото-материалов
 */
export async function renderRoomViews(scheme: PlanScheme, room: PlanRoom, opts: { width?: number; height?: number; count?: number } = {}): Promise<string[]> {
  const W = opts.width || 1600
  const H = opts.height || 1000
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
  } catch {
    return []
  }
  renderer.setPixelRatio(1)
  renderer.setSize(W, H)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1

  pendingLoads = []
  const built = buildRoomScene(scheme, room)
  const loads = pendingLoads
  pendingLoads = null
  await Promise.race([Promise.all(loads), new Promise((r) => setTimeout(r, 12000))])

  const { scene, height, disposables } = built
  scene.background = new THREE.Color("#f4f1ec")
  const pts = room.points
  const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length
  const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length
  const camera = new THREE.PerspectiveCamera(68, W / H, 0.05, 100)
  const eyeY = Math.min(1.45, height - 0.35)

  // Ракурсы: из угла комнаты (отступ 0,35 м к центру) — на противоположный угол, плюс вид на стену с панно
  const shots: { from: THREE.Vector3; to: THREE.Vector3 }[] = []
  const inset = (p: { x: number; y: number }, d: number) => {
    const vx = cx - p.x
    const vy = cy - p.y
    const l = Math.hypot(vx, vy) || 1
    return { x: p.x + (vx / l) * d, y: p.y + (vy / l) * d }
  }
  const f = roomFinish(scheme, room.id)
  const panelWall = Object.keys(f.walls || {}).find((id) => f.walls?.[id]?.material || f.walls?.[id]?.wall !== f.wall)
  if (panelWall) {
    const w = roomWalls(room, scheme).find((x) => x.id === panelWall)
    if (w) {
      const mx = (w.a.x + w.b.x) / 2 - w.nx * w.inner
      const my = (w.a.y + w.b.y) / 2 - w.ny * w.inner
      // Отходим от акцентной стены к противоположной, насколько позволяет комната
      let back = 0.4
      for (let d = 0.4; d < 8; d += 0.1) {
        const px = mx - w.nx * d
        const py = my - w.ny * d
        if (!pointInPoly(px, py, pts)) break
        back = d
      }
      const dist = Math.max(back - 0.3, 0.8)
      shots.push({ from: new THREE.Vector3(mx - w.nx * dist, eyeY, my - w.ny * dist), to: new THREE.Vector3(mx, eyeY * 0.85, my) })
    }
  }
  const corners = pts.length <= 8 ? pts : pts.filter((_, i) => i % Math.ceil(pts.length / 4) === 0)
  const order = [...corners].sort((a, b) => Math.hypot(b.x - cx, b.y - cy) - Math.hypot(a.x - cx, a.y - cy))
  for (const c of order) {
    if (shots.length >= (opts.count || 2)) break
    const from = inset(c, 0.35)
    const opp = { x: 2 * cx - from.x, y: 2 * cy - from.y }
    shots.push({ from: new THREE.Vector3(from.x, eyeY, from.y), to: new THREE.Vector3(opp.x * 0.6 + cx * 0.4, eyeY * 0.75, opp.y * 0.6 + cy * 0.4) })
  }

  const out: string[] = []
  for (const s of shots.slice(0, opts.count || 2)) {
    camera.position.copy(s.from)
    camera.lookAt(s.to)
    renderer.render(scene, camera)
    out.push(renderer.domElement.toDataURL("image/jpeg", 0.9))
  }
  scene.traverse((o) => {
    const m = o as THREE.Mesh
    if (m.geometry) m.geometry.dispose()
    const mat = m.material as THREE.Material | THREE.Material[] | undefined
    if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
    else mat?.dispose()
  })
  disposables.forEach((d) => d.dispose())
  renderer.dispose()
  renderer.forceContextLoss()
  return out
}

function pointInPoly(x: number, z: number, pts: { x: number; y: number }[]) {
  let ins = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i]
    const b = pts[j]
    if (a.y > z !== b.y > z && x < ((b.x - a.x) * (z - a.y)) / (b.y - a.y) + a.x) ins = !ins
  }
  return ins
}

/**
 * Модель предмета: группа в локальных координатах (тыльная сторона — к −y).
 * Простые формы, но узнаваемые: кровать с изголовьем и подушками, диван со спинкой, ванна с чашей
 */
function furnitureModel(f: PlanFurniture): THREE.Group {
  const g = new THREE.Group()
  const { w, d, h } = f
  const col = f.color || FURN_COLOR[f.kind] || MAT.woodLight
  // Свой материал (ткань, дерево фасадов) — фото повтором по размеру предмета
  const m = f.material
    ? std("#ffffff", { map: photoTexture(f.material, Math.max(w / f.material.w, 0.2), Math.max(h / f.material.h, 0.2)), roughness: f.material.gloss ? 0.25 : 0.85 })
    : std(col)
  const wood = std(MAT.wood)
  const white = std(MAT.white, { roughness: 0.4 })
  const ceramic = std(MAT.ceramic, { roughness: 0.15 })
  switch (f.kind) {
    case "bed_double":
    case "bed_single": {
      g.add(box(w, d, 0.3, wood, 0, 0, 0))
      g.add(box(w - 0.04, d - 0.08, 0.22, std("#f4f1ea"), 0, 0.02, 0.3))
      g.add(box(w, 0.08, 1.0, wood, 0, -d / 2 + 0.04, 0))
      const pillows = f.kind === "bed_double" ? [-w / 4, w / 4] : [0]
      for (const px of pillows) g.add(box(w / (pillows.length + 0.3), 0.35, 0.12, std("#ffffff"), px, -d / 2 + 0.3, 0.52))
      g.add(box(w - 0.02, d * 0.55, 0.05, std(MAT.fabric), 0, d * 0.2, 0.52))
      break
    }
    case "sofa":
    case "armchair": {
      g.add(box(w, d, 0.42, m, 0, 0, 0.0))
      g.add(box(w, 0.2, h, m, 0, -d / 2 + 0.1, 0))
      g.add(box(0.18, d, 0.62, m, -w / 2 + 0.09, 0, 0))
      g.add(box(0.18, d, 0.62, m, w / 2 - 0.09, 0, 0))
      break
    }
    case "table":
    case "desk": {
      g.add(box(w, d, 0.04, wood, 0, 0, h - 0.04))
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(box(0.05, 0.05, h - 0.04, wood, sx * (w / 2 - 0.06), sy * (d / 2 - 0.06), 0))
      break
    }
    case "chair": {
      g.add(box(w, d, 0.04, m, 0, 0, 0.44))
      g.add(box(w, 0.04, 0.45, m, 0, -d / 2 + 0.02, 0.45))
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(box(0.035, 0.035, 0.44, m, sx * (w / 2 - 0.03), sy * (d / 2 - 0.03), 0))
      break
    }
    case "bath": {
      g.add(box(w, d, h, ceramic))
      g.add(box(w - 0.14, d - 0.14, 0.02, std("#bfe3f2", { roughness: 0.05 }), 0, 0, h - 0.06))
      break
    }
    case "shower": {
      g.add(box(w, d, h, ceramic))
      const glass = new THREE.MeshStandardMaterial({ color: "#cfe8f0", transparent: true, opacity: 0.25, roughness: 0.05 })
      g.add(box(w, 0.01, 2.0, glass, 0, d / 2, h))
      g.add(box(0.01, d, 2.0, glass, w / 2, 0, h))
      break
    }
    case "toilet_f": {
      g.add(box(w, 0.18, 0.75, ceramic, 0, -d / 2 + 0.09, 0))
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(w / 2, w / 2.4, 0.4, 24), ceramic)
      bowl.position.set(0, 0.2, 0.08)
      bowl.scale.set(1, 1, 1.3)
      bowl.castShadow = true
      g.add(bowl)
      break
    }
    case "washbasin": {
      g.add(box(w, d, h - 0.15, wood))
      g.add(box(w, d, 0.15, ceramic, 0, 0, h - 0.15))
      break
    }
    case "washer":
    case "dishwasher": {
      g.add(box(w, d, h, white))
      const door = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 32), std("#9fb3bd", { roughness: 0.1 }))
      door.rotation.x = Math.PI / 2
      door.position.set(0, h * 0.5, d / 2 + 0.01)
      if (f.kind === "washer") g.add(door)
      break
    }
    case "fridge": {
      g.add(box(w, d, h, std(MAT.steel, { metalness: 0.5, roughness: 0.3 })))
      g.add(box(w - 0.02, 0.01, 0.01, std(MAT.dark), 0, d / 2 + 0.005, h * 0.62))
      break
    }
    case "kitchen_base":
    case "stove":
    case "sink_kitchen": {
      g.add(box(w, d, h - 0.04, white))
      g.add(box(w, d + 0.02, 0.04, std("#d8d2c6", { roughness: 0.3 }), 0, 0.01, h - 0.04))
      if (f.kind === "stove") g.add(box(w - 0.06, d - 0.08, 0.01, std("#111111", { roughness: 0.1 }), 0, 0, h))
      if (f.kind === "sink_kitchen") g.add(box(w * 0.5, d * 0.6, 0.01, std(MAT.steel, { metalness: 0.7, roughness: 0.2 }), 0, 0.02, h))
      break
    }
    case "kitchen_wall": {
      g.add(box(w, d, h, white, 0, 0, 1.45))
      break
    }
    case "towel_rail": {
      for (let i = 0; i < 5; i++) g.add(box(w, 0.03, 0.025, std(MAT.steel, { metalness: 0.8, roughness: 0.2 }), 0, 0, 0.7 + i * 0.16))
      break
    }
    case "boiler_f": {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(w / 2, w / 2, h, 32), white)
      c.position.set(0, 1.2 + h / 2, 0)
      c.castShadow = true
      g.add(c)
      break
    }
    default:
      g.add(box(w, d, h, m))
  }
  return g
}

export interface Room3D {
  dispose: () => void
  /** Облёт снаружи или вид изнутри с высоты глаз */
  setMode: (m: "orbit" | "inside") => void
  /** Снимок текущего вида — для отправки заказчику; jpeg — легче для PDF */
  snapshot: (format?: "png" | "jpeg") => string
}

export interface RoomScene {
  scene: THREE.Scene
  walls: THREE.Mesh[]
  ceil: THREE.Mesh
  height: number
  span: number
  cx: number
  cy: number
  disposables: { dispose: () => void }[]
  furnitureCount: number
  lampCount: number
}

/** Сцена без отрисовки — геометрия комнаты, отделка, мебель и свет */
export function buildRoomScene(scheme: PlanScheme, room: PlanRoom): RoomScene {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color("#1b1b1b")
  const f = roomFinish(scheme, room.id)
  const height = room.height || scheme.defaultHeight
  const xs = room.points.map((p) => p.x)
  const ys = room.points.map((p) => p.y)
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 2)

  const disposables: { dispose: () => void }[] = []
  const track = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x)

  // Пол: форма комнаты; на плане y — это z в сцене
  const shape = new THREE.Shape(room.points.map((p) => new THREE.Vector2(p.x, p.y)))
  const floorGeo = track(new THREE.ShapeGeometry(shape))
  floorGeo.rotateX(Math.PI / 2)
  const floorColor = f.floor !== "none" ? f.floorColor || FLOOR_FINISHES[f.floor].color : "#8d8d8d"
  const isTileFloor = f.floor === "tile" || f.floor === "porcelain"
  const fTile = isTileFloor ? floorTileOf(f) : null
  const fPat = floorFinishPattern(f.floor, fTile ? fTile.color : floorColor, fTile || undefined)
  const tex = f.floorMaterial && f.floor !== "none" ? track(photoTexture(f.floorMaterial)) : fPat ? track(patternTexture(fPat)) : null
  const floorMat = track(
    new THREE.MeshStandardMaterial({
      color: tex ? "#ffffff" : floorColor,
      map: tex,
      roughness: isTileFloor ? (fTile?.gloss ? 0.12 : 0.35) : f.floor === "carpet" ? 0.95 : 0.55,
      metalness: 0,
      side: THREE.DoubleSide,
    }),
  )
  const floor = new THREE.Mesh(floorGeo, floorMat)
  floor.receiveShadow = true
  scene.add(floor)

  // Потолок
  const ceilGeo = track(new THREE.ShapeGeometry(shape))
  ceilGeo.rotateX(Math.PI / 2)
  const ceilColor = f.ceiling !== "none" ? CEILING_FINISHES[f.ceiling].color : "#f3f3f3"
  const cm = f.ceilingMaterial
  if (cm && cm.mode === "panel") {
    // Панно на потолке — на весь контур комнаты: UV формы в долях её размера
    const uv = ceilGeo.attributes.uv
    const x0 = Math.min(...xs)
    const y0 = Math.min(...ys)
    const sw = Math.max(...xs) - x0 || 1
    const sh = Math.max(...ys) - y0 || 1
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) - x0) / sw, (uv.getY(i) - y0) / sh)
  }
  const ceil = new THREE.Mesh(
    ceilGeo,
    track(
      cm
        ? std("#ffffff", { map: track(photoTexture(cm)), side: THREE.DoubleSide, roughness: cm.gloss ? 0.2 : 0.85 })
        : std(ceilColor, { side: THREE.DoubleSide, roughness: f.ceiling === "stretch" ? 0.2 : 0.9 }),
    ),
  )
  ceil.position.y = height
  ceil.name = "ceiling"
  scene.add(ceil)

  // Стены: внутренняя грань, с вырезами окон и дверей; плитка до высоты — отдельной полосой
  // Материал стены — общий для комнаты или свой у акцентной стены
  const wallMats = new Map<string, THREE.Material>()
  const matFromPattern = (key: string, p: FinishPattern, rough: number) => {
    if (!wallMats.has(key)) wallMats.set(key, track(std("#ffffff", { map: track(patternTexture(p)), roughness: rough })))
    return wallMats.get(key) as THREE.Material
  }
  const wallMatFor = (wallId: string) => {
    const wf = wallFinishOf(f, wallId)
    const color = wf.wall !== "none" ? wf.wallColor || WALL_FINISHES[wf.wall].color : "#e9e6df"
    // Свой материал повтором (обои, мрамор) покрывает всю стену; панно рисуется отдельно поверх
    if (wf.material && wf.material.mode === "repeat") {
      const key = `photo|${wf.material.url}|${wf.material.w}|${wf.material.h}`
      if (!wallMats.has(key)) wallMats.set(key, track(std("#ffffff", { map: track(photoTexture(wf.material)), roughness: wf.material.gloss ? 0.2 : 0.85 })))
      return wallMats.get(key) as THREE.Material
    }
    if (wf.wall === "tile") {
      const t = wallTileOf(f, wf.own ? wf : undefined)
      return matFromPattern(`tile|${JSON.stringify(t)}`, tilePattern(t), t.gloss ? 0.12 : 0.35)
    }
    if (wf.wall === "wallpaper") return matFromPattern(`wp|${color}|${wf.rapport || 0}`, wallpaperPattern(color, wf.rapport || 0.64, 0.53), 0.85)
    if (wf.wall === "plaster") return matFromPattern(`pl|${color}`, paintPattern(color, true), 1)
    if (wf.wall === "panels") return matFromPattern(`pn|${color}`, plankPattern3d(color), 0.7)
    const key = `${wf.wall}|${color}`
    if (!wallMats.has(key)) wallMats.set(key, track(std(color, { roughness: 0.9 })))
    return wallMats.get(key) as THREE.Material
  }
  // Плитка до высоты (фартук, панель в санузле) — своим рисунком
  const wt = wallTileOf(f)
  const tileMat = matFromPattern(`tileH|${JSON.stringify(wt)}`, tilePattern(wt), wt.gloss ? 0.12 : 0.35)
  const tileH = f.wall === "tile" ? 0 : Math.min(f.tileHeight || 0, height)
  const glass = track(new THREE.MeshStandardMaterial({ color: "#bfe0f0", transparent: true, opacity: 0.35, roughness: 0.05 }))
  const frame = track(std("#f5f5f5"))
  const door = track(std("#8b6a4a"))
  const walls: THREE.Mesh[] = []
  for (const w of roomWalls(room, scheme)) {
    const len = w.length
    const T = 0.06
    const wallShape = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(len, 0), new THREE.Vector2(len, height), new THREE.Vector2(0, height)])
    const ops = scheme.openings.filter((o) => o.wallId === w.id)
    for (const o of ops) {
      const sp = openingSpan(o, w)
      const bottom = o.kind === "window" ? o.sill || 0 : 0
      const top = Math.min(bottom + o.height, height - 0.02)
      const hole = new THREE.Path([new THREE.Vector2(sp.start, bottom), new THREE.Vector2(sp.end, bottom), new THREE.Vector2(sp.end, top), new THREE.Vector2(sp.start, top)])
      wallShape.holes.push(hole)
    }
    // UV ExtrudeGeometry — в метрах: рисунок ложится в реальном масштабе от левого угла и от пола
    const geo = track(new THREE.ExtrudeGeometry(wallShape, { depth: T, bevelEnabled: false }))
    const mesh = new THREE.Mesh(geo, wallMatFor(w.id))
    // Локальная X — вдоль стены, Y — вверх, Z — толщина наружу
    const ox = w.a.x - w.nx * w.inner
    const oy = w.a.y - w.ny * w.inner
    const basis = new THREE.Matrix4().makeBasis(new THREE.Vector3(w.ux, 0, w.uy), new THREE.Vector3(0, 1, 0), new THREE.Vector3(w.nx, 0, w.ny))
    mesh.applyMatrix4(basis)
    mesh.position.set(ox, 0, oy)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.userData.normal = new THREE.Vector3(w.nx, 0, w.ny)
    scene.add(mesh)
    walls.push(mesh)

    // Фреска / панно: картинка своего размера, по умолчанию — по центру стены от пола
    const wfp = wallFinishOf(f, w.id)
    if (wfp.material && wfp.material.mode === "panel") {
      const pw = Math.min(wfp.material.w, len)
      const ph = Math.min(wfp.material.h, height)
      const px = wfp.panelX ?? (len - pw) / 2
      const pz = wfp.panelZ ?? 0
      const pm = new THREE.Mesh(
        track(new THREE.PlaneGeometry(pw, ph)),
        track(std("#ffffff", { map: track(photoTexture(wfp.material)), roughness: wfp.material.gloss ? 0.2 : 0.8, side: THREE.DoubleSide })),
      )
      // Положение — в координатах развёртки (от левого угла при взгляде из комнаты), ставим в мировых
      const ec = px + pw / 2
      const sAlong = rightAligned(w) ? ec : len - ec
      const k = w.inner + 0.006
      const cxw = w.a.x + w.ux * sAlong - w.nx * k
      const czw = w.a.y + w.uy * sAlong - w.ny * k
      pm.position.set(cxw, pz + ph / 2, czw)
      // Лицом в комнату: +Z плоскости — к центру комнаты, верх — вверх, картинка не зеркалится
      pm.lookAt(cxw - w.nx, pz + ph / 2, czw - w.ny)
      pm.userData.normal = mesh.userData.normal
      scene.add(pm)
      walls.push(pm)
    }

    if (tileH > 0) {
      const ts = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(len, 0), new THREE.Vector2(len, tileH), new THREE.Vector2(0, tileH)])
      for (const o of ops) {
        const sp = openingSpan(o, w)
        const bottom = o.kind === "window" ? o.sill || 0 : 0
        if (bottom >= tileH) continue
        ts.holes.push(new THREE.Path([new THREE.Vector2(sp.start, bottom), new THREE.Vector2(sp.end, bottom), new THREE.Vector2(sp.end, Math.min(bottom + o.height, tileH)), new THREE.Vector2(sp.start, Math.min(bottom + o.height, tileH))]))
      }
      const tg = track(new THREE.ShapeGeometry(ts))
      const tm = new THREE.Mesh(tg, tileMat)
      tm.applyMatrix4(basis)
      tm.position.set(ox - w.nx * 0.004, 0, oy - w.ny * 0.004)
      tm.userData.normal = mesh.userData.normal
      scene.add(tm)
      walls.push(tm)
    }

    // Окна — стекло и рама, двери — полотно
    for (const o of ops) {
      const sp = openingSpan(o, w)
      const ow = sp.end - sp.start
      const mid = (sp.start + sp.end) / 2
      const bottom = o.kind === "window" ? o.sill || 0 : 0
      const oh = Math.min(o.height, height - bottom - 0.02)
      const px = w.a.x + w.ux * mid - w.nx * (w.inner - T / 2)
      const py = w.a.y + w.uy * mid - w.ny * (w.inner - T / 2)
      const ang = Math.atan2(w.uy, w.ux)
      if (o.kind === "window") {
        const pane = new THREE.Mesh(track(new THREE.BoxGeometry(ow, oh, 0.02)), glass)
        pane.position.set(px, bottom + oh / 2, py)
        pane.rotation.y = -ang
        scene.add(pane)
        const sill = new THREE.Mesh(track(new THREE.BoxGeometry(ow + 0.1, 0.03, 0.25)), frame)
        sill.position.set(px - w.nx * 0.1, bottom, py - w.ny * 0.1)
        sill.rotation.y = -ang
        scene.add(sill)
      } else if (o.kind === "door") {
        const leaf = new THREE.Mesh(track(new THREE.BoxGeometry(ow - 0.04, oh - 0.02, 0.04)), door)
        leaf.position.set(px, (oh - 0.02) / 2, py)
        leaf.rotation.y = -ang
        leaf.castShadow = true
        scene.add(leaf)
      }
    }
  }

  // Плинтус по периметру
  if (f.skirting && f.floor !== "none") {
    const sk = track(std("#f4f4f2"))
    for (const w of roomWalls(room, scheme)) {
      const m = new THREE.Mesh(track(new THREE.BoxGeometry(w.length, 0.07, 0.015)), sk)
      const mx = (w.a.x + w.b.x) / 2 - w.nx * (w.inner + 0.008)
      const my = (w.a.y + w.b.y) / 2 - w.ny * (w.inner + 0.008)
      m.position.set(mx, 0.035, my)
      m.rotation.y = -Math.atan2(w.uy, w.ux)
      scene.add(m)
    }
  }

  // Мебель — только предметы этой комнаты
  let furnitureCount = 0
  for (const it of scheme.furniture || []) {
    const inRoom = it.roomId === room.id
    if (!inRoom) continue
    furnitureCount++
    const g = furnitureModel(it)
    g.position.set(it.x, 0, it.y)
    g.rotation.y = -(it.rot * Math.PI) / 180
    scene.add(g)
  }

  // Светильники с плана — точками света и плафонами
  const lamps = (scheme.nodes || []).filter((n) => n.layer === "electric" && (n.kind === "light" || n.kind === "spot") && (n.roomId === room.id))
  for (const n of lamps) {
    const big = n.kind === "light"
    const shade = new THREE.Mesh(track(new THREE.CylinderGeometry(big ? 0.25 : 0.045, big ? 0.25 : 0.045, big ? 0.08 : 0.01, 24)), track(new THREE.MeshStandardMaterial({ color: "#fffdf5", emissive: "#fff3d6", emissiveIntensity: 0.9 })))
    shade.position.set(n.x, height - (big ? 0.1 : 0.006), n.y)
    scene.add(shade)
    const pl = new THREE.PointLight("#fff1dc", big ? 6 : 1.4, span * 2.2, 1.6)
    pl.position.set(n.x, height - 0.2, n.y)
    if (big) pl.castShadow = true
    scene.add(pl)
  }

  scene.add(new THREE.HemisphereLight("#ffffff", "#8a7a6a", lamps.length ? 0.7 : 1.05))
  // Заполняющий свет от окон — отделка видна без провалов в тень
  scene.add(new THREE.AmbientLight("#fff8ee", 0.35))
  const sun = new THREE.DirectionalLight("#fff6e8", lamps.length ? 0.8 : 1.4)
  sun.position.set(cx + span, height * 2.2, cy + span * 0.6)
  sun.target.position.set(cx, 0, cy)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  const sc = sun.shadow.camera as THREE.OrthographicCamera
  sc.left = -span
  sc.right = span
  sc.top = span
  sc.bottom = -span
  scene.add(sun, sun.target)

  return { scene, walls, ceil, height, span, cx, cy, disposables, furnitureCount, lampCount: lamps.length }
}

/**
 * Сцена комнаты: пол с покрытием, стены с проёмами окон и дверей цветом отделки,
 * потолок, мебель и мягкий свет. Камера облетает комнату мышью, колесо — приближение
 */
export function mountRoom3D(el: HTMLElement, scheme: PlanScheme, room: PlanRoom): Room3D {
  const W = el.clientWidth || 800
  const H = el.clientHeight || 500
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
  } catch {
    throw new Error("Браузер не поддерживает 3D (WebGL). Откройте в Chrome, Яндекс Браузере или Safari и включите аппаратное ускорение")
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(W, H)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  el.appendChild(renderer.domElement)

  const { scene, walls, ceil, height, span, cx, cy, disposables } = buildRoomScene(scheme, room)

  // Камера на сфере вокруг центра комнаты; мышь — вращение, колесо — приближение
  const camera = new THREE.PerspectiveCamera(55, W / H, 0.05, 100)
  const target = new THREE.Vector3(cx, height * 0.4, cy)
  let theta = Math.PI * 0.25
  let phi = Math.PI * 0.32
  let radius = span * 1.25
  // Вид изнутри: камера стоит в комнате на высоте 1,6 м, смотрит по yaw/pitch
  let mode: "orbit" | "inside" = "orbit"
  const eye = new THREE.Vector3(cx, Math.min(1.6, height - 0.3), cy)
  let yaw = Math.PI * 0.75
  let pitch = -0.08
  const roomPts = room.points
  const inRoom = (x: number, z: number) => {
    let ins = false
    for (let i = 0, j = roomPts.length - 1; i < roomPts.length; j = i++) {
      const a = roomPts[i]
      const b = roomPts[j]
      if (a.y > z !== b.y > z && x < ((b.x - a.x) * (z - a.y)) / (b.y - a.y) + a.x) ins = !ins
    }
    return ins
  }
  const place = () => {
    if (mode === "inside") {
      camera.position.copy(eye)
      camera.lookAt(eye.x + Math.sin(yaw) * Math.cos(pitch), eye.y + Math.sin(pitch), eye.z + Math.cos(yaw) * Math.cos(pitch))
      for (const m of walls) m.visible = true
      ceil.visible = true
      return
    }
    camera.position.set(target.x + radius * Math.sin(phi) * Math.sin(theta), target.y + radius * Math.cos(phi), target.z + radius * Math.sin(phi) * Math.cos(theta))
    camera.lookAt(target)
    // Стены и потолок между камерой и центром прячем — иначе комнату не видно снаружи
    const v = new THREE.Vector3()
    camera.getWorldDirection(v)
    for (const m of walls) m.visible = (m.userData.normal as THREE.Vector3).dot(v) < 0.15 || radius < span * 0.45
    ceil.visible = phi > Math.PI * 0.47 || radius < span * 0.45
  }
  // Шаг по комнате: не выходим за стены (отступ 0,25 м проверяем по точке впереди)
  const walk = (dist: number, side = 0) => {
    const fx = Math.sin(yaw)
    const fz = Math.cos(yaw)
    const nx = eye.x + fx * dist + fz * side
    const nz = eye.z + fz * dist - fx * side
    const probe = Math.sign(dist || side) * 0.25
    if (inRoom(nx + fx * probe, nz + fz * probe) && inRoom(nx, nz)) {
      eye.x = nx
      eye.z = nz
    }
  }
  place()

  let drag: { x: number; y: number; pan: boolean } | null = null
  const down = (e: PointerEvent) => {
    drag = { x: e.clientX, y: e.clientY, pan: e.button === 2 || e.shiftKey }
    renderer.domElement.setPointerCapture(e.pointerId)
  }
  const move = (e: PointerEvent) => {
    if (!drag) return
    const dx = e.clientX - drag.x
    const dy = e.clientY - drag.y
    drag.x = e.clientX
    drag.y = e.clientY
    if (mode === "inside") {
      if (drag.pan) walk(dy * 0.01, -dx * 0.01)
      else {
        yaw += dx * 0.005
        pitch = Math.min(Math.max(pitch + dy * 0.004, -1.1), 1.1)
      }
    } else if (drag.pan) {
      const right = new THREE.Vector3().subVectors(camera.position, target).cross(new THREE.Vector3(0, 1, 0)).normalize()
      target.addScaledVector(right, dx * 0.004 * radius)
      target.y = Math.min(Math.max(target.y + dy * 0.004 * radius, 0.2), height)
    } else {
      theta -= dx * 0.008
      phi = Math.min(Math.max(phi - dy * 0.006, 0.12), Math.PI * 0.62)
    }
    place()
  }
  const up = () => (drag = null)
  const wheel = (e: WheelEvent) => {
    e.preventDefault()
    if (mode === "inside") {
      // Колесо — шире/уже обзор, с Ctrl — шаг вперёд/назад
      if (e.ctrlKey || e.metaKey) walk(e.deltaY > 0 ? -0.25 : 0.25)
      else {
        camera.fov = Math.min(Math.max(camera.fov + (e.deltaY > 0 ? 4 : -4), 35), 95)
        camera.updateProjectionMatrix()
      }
    } else radius = Math.min(Math.max(radius * (e.deltaY > 0 ? 1.1 : 0.9), 0.4), span * 4)
    place()
  }
  const ctx = (e: Event) => e.preventDefault()
  const key = (e: KeyboardEvent) => {
    if (mode !== "inside") return
    const k = e.key.toLowerCase()
    if (k === "w" || k === "ц" || k === "arrowup") walk(0.2)
    else if (k === "s" || k === "ы" || k === "arrowdown") walk(-0.2)
    else if (k === "a" || k === "ф") walk(0, 0.2)
    else if (k === "d" || k === "в") walk(0, -0.2)
    else if (k === "arrowleft") yaw += 0.1
    else if (k === "arrowright") yaw -= 0.1
    else return
    e.preventDefault()
    place()
  }
  window.addEventListener("keydown", key)
  renderer.domElement.addEventListener("pointerdown", down)
  renderer.domElement.addEventListener("pointermove", move)
  renderer.domElement.addEventListener("pointerup", up)
  renderer.domElement.addEventListener("wheel", wheel, { passive: false })
  renderer.domElement.addEventListener("contextmenu", ctx)

  const ro = new ResizeObserver(() => {
    const w = el.clientWidth
    const h = el.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  })
  ro.observe(el)

  let raf = 0
  const loop = () => {
    renderer.render(scene, camera)
    raf = requestAnimationFrame(loop)
  }
  loop()

  return {
    setMode: (m) => {
      mode = m
      camera.fov = m === "inside" ? 70 : 55
      camera.updateProjectionMatrix()
      place()
    },
    snapshot: (format = "png") => {
      renderer.render(scene, camera)
      return format === "jpeg" ? renderer.domElement.toDataURL("image/jpeg", 0.88) : renderer.domElement.toDataURL("image/png")
    },
    dispose: () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.domElement.removeEventListener("pointerdown", down)
      renderer.domElement.removeEventListener("pointermove", move)
      renderer.domElement.removeEventListener("pointerup", up)
      renderer.domElement.removeEventListener("wheel", wheel)
      renderer.domElement.removeEventListener("contextmenu", ctx)
      window.removeEventListener("keydown", key)
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        if (m.geometry) m.geometry.dispose()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
        else mat?.dispose()
      })
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}

