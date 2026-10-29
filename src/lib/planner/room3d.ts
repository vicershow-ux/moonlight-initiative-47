import * as THREE from "three"
import {
  CEILING_FINISHES,
  FLOOR_FINISHES,
  FloorFinish,
  PlanFurniture,
  PlanRoom,
  PlanScheme,
  WALL_FINISHES,
  roomFinish,
} from "./types"
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

/** Текстура покрытия пола: доска, ёлочка или плитка рисуются на канвасе и повторяются */
function floorTexture(finish: FloorFinish, color: string): THREE.Texture {
  const c = document.createElement("canvas")
  c.width = 512
  c.height = 512
  const g = c.getContext("2d")!
  g.fillStyle = color
  g.fillRect(0, 0, 512, 512)
  const info = FLOOR_FINISHES[finish]
  // Лёгкий разброс оттенка — покрытие не выглядит пластиковым
  const shade = (k: number) => {
    const n = parseInt(color.slice(1), 16)
    const r = Math.min(255, Math.max(0, ((n >> 16) & 255) + k))
    const gg = Math.min(255, Math.max(0, ((n >> 8) & 255) + k))
    const b = Math.min(255, Math.max(0, (n & 255) + k))
    return `rgb(${r},${gg},${b})`
  }
  g.strokeStyle = "rgba(0,0,0,0.25)"
  g.lineWidth = 2
  if (info.pattern === "planks") {
    // 512 px = 1,2 м: доски 190 мм, стыки вразбежку
    const h = 512 / 6
    for (let i = 0; i < 6; i++) {
      const off = (i % 3) * 170
      for (let x = -off; x < 512; x += 512) {
        g.fillStyle = shade(((i * 37) % 20) - 10)
        g.fillRect(x, i * h, 512, h)
        g.strokeRect(x, i * h, 512, h)
      }
      g.beginPath()
      g.moveTo((off + 300) % 512, i * h)
      g.lineTo((off + 300) % 512, (i + 1) * h)
      g.stroke()
    }
  } else if (info.pattern === "herring") {
    const s = 64
    for (let y = -s * 2; y < 512 + s * 2; y += s) {
      for (let x = -s * 2; x < 512 + s * 2; x += s * 2) {
        g.save()
        g.translate(x + ((y / s) % 2) * s, y)
        g.rotate(Math.PI / 4)
        g.fillStyle = shade(((x + y) % 30) - 15)
        g.fillRect(0, 0, s * 1.4, s * 0.35)
        g.strokeRect(0, 0, s * 1.4, s * 0.35)
        g.rotate(-Math.PI / 2)
        g.fillStyle = shade(((x - y) % 30) - 10)
        g.fillRect(0, 0, s * 1.4, s * 0.35)
        g.strokeRect(0, 0, s * 1.4, s * 0.35)
        g.restore()
      }
    }
  } else if (info.pattern === "tiles") {
    const n = finish === "porcelain" ? 2 : 4
    const s = 512 / n
    g.strokeStyle = "rgba(255,255,255,0.7)"
    g.lineWidth = 4
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        g.fillStyle = shade(((i + j) % 2) * 6 - 3)
        g.fillRect(i * s, j * s, s, s)
        g.strokeRect(i * s, j * s, s, s)
      }
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = THREE.RepeatWrapping
  t.wrapT = THREE.RepeatWrapping
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
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
 * Модель предмета: группа в локальных координатах (тыльная сторона — к −y).
 * Простые формы, но узнаваемые: кровать с изголовьем и подушками, диван со спинкой, ванна с чашей
 */
function furnitureModel(f: PlanFurniture): THREE.Group {
  const g = new THREE.Group()
  const { w, d, h } = f
  const col = FURN_COLOR[f.kind] || MAT.woodLight
  const m = std(col)
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
  /** Снимок текущего вида — для отправки заказчику */
  snapshot: () => string
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
  const tex = f.floor !== "none" ? track(floorTexture(f.floor, floorColor)) : null
  if (tex) {
    // UV формы — в метрах; текстура 1,2 м
    const uv = floorGeo.attributes.uv
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 1.2, uv.getY(i) / 1.2)
  }
  const floorMat = track(new THREE.MeshStandardMaterial({ color: tex ? "#ffffff" : floorColor, map: tex, roughness: f.floor === "tile" || f.floor === "porcelain" ? 0.25 : 0.6, side: THREE.DoubleSide }))
  const floor = new THREE.Mesh(floorGeo, floorMat)
  floor.receiveShadow = true
  scene.add(floor)

  // Потолок
  const ceilGeo = track(new THREE.ShapeGeometry(shape))
  ceilGeo.rotateX(Math.PI / 2)
  const ceilColor = f.ceiling !== "none" ? CEILING_FINISHES[f.ceiling].color : "#f3f3f3"
  const ceil = new THREE.Mesh(ceilGeo, track(std(ceilColor, { side: THREE.DoubleSide, roughness: f.ceiling === "stretch" ? 0.2 : 0.9 })))
  ceil.position.y = height
  ceil.name = "ceiling"
  scene.add(ceil)

  // Стены: внутренняя грань, с вырезами окон и дверей; плитка до высоты — отдельной полосой
  const wallColor = f.wall !== "none" ? f.wallColor || WALL_FINISHES[f.wall].color : "#e9e6df"
  const wallMat = track(std(wallColor, { roughness: f.wall === "tile" ? 0.25 : 0.9 }))
  const tileMat = track(std(WALL_FINISHES.tile.color === wallColor ? "#e8eef0" : "#e4ecee", { roughness: 0.2 }))
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
    const geo = track(new THREE.ExtrudeGeometry(wallShape, { depth: T, bevelEnabled: false }))
    const mesh = new THREE.Mesh(geo, wallMat)
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

  scene.add(new THREE.HemisphereLight("#ffffff", "#8a7a6a", lamps.length ? 0.55 : 0.9))
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
  const place = () => {
    camera.position.set(target.x + radius * Math.sin(phi) * Math.sin(theta), target.y + radius * Math.cos(phi), target.z + radius * Math.sin(phi) * Math.cos(theta))
    camera.lookAt(target)
    // Стены и потолок между камерой и центром прячем — иначе комнату не видно снаружи
    const v = new THREE.Vector3()
    camera.getWorldDirection(v)
    for (const m of walls) m.visible = (m.userData.normal as THREE.Vector3).dot(v) < 0.15 || radius < span * 0.45
    ceil.visible = phi > Math.PI * 0.47 || radius < span * 0.45
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
    if (drag.pan) {
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
    radius = Math.min(Math.max(radius * (e.deltaY > 0 ? 1.1 : 0.9), 0.4), span * 4)
    place()
  }
  const ctx = (e: Event) => e.preventDefault()
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
    snapshot: () => {
      renderer.render(scene, camera)
      return renderer.domElement.toDataURL("image/png")
    },
    dispose: () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.domElement.removeEventListener("pointerdown", down)
      renderer.domElement.removeEventListener("pointermove", move)
      renderer.domElement.removeEventListener("pointerup", up)
      renderer.domElement.removeEventListener("wheel", wheel)
      renderer.domElement.removeEventListener("contextmenu", ctx)
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

