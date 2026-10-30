import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

/**
 * Свои 3D-модели мебели (GLB). Файл скачивается один раз за сессию (кэш байтов),
 * для каждого экземпляра модель разбирается заново — сцены освобождают свою геометрию сами
 */
const bytes = new Map<string, Promise<ArrayBuffer>>()

function fetchBytes(url: string): Promise<ArrayBuffer> {
  let p = bytes.get(url)
  if (!p) {
    p = fetch(url).then((r) => {
      if (!r.ok) throw new Error("Модель не загрузилась")
      return r.arrayBuffer()
    })
    p.catch(() => bytes.delete(url))
    bytes.set(url, p)
  }
  return p
}

async function parse(buf: ArrayBuffer): Promise<THREE.Object3D> {
  const loader = new GLTFLoader()
  const gltf = await loader.parseAsync(buf.slice(0), "")
  return gltf.scene
}

/** Габариты модели в метрах (Ш × Г × В) — чтобы подставить размеры при загрузке */
export async function measureGlb(buf: ArrayBuffer): Promise<{ w: number; d: number; h: number } | null> {
  try {
    const obj = await parse(buf)
    const box = new THREE.Box3().setFromObject(obj)
    if (box.isEmpty()) return null
    const s = box.getSize(new THREE.Vector3())
    obj.traverse((o) => {
      const m = o as THREE.Mesh
      m.geometry?.dispose()
    })
    return { w: s.x, d: s.z, h: s.y }
  } catch {
    throw new Error("Файл не похож на 3D-модель GLB")
  }
}

/**
 * Модель, подогнанная под предмет: ширина по x, высота по y, глубина по z,
 * низ — на полу, центр — в центре предмета. Перед модели (+z) смотрит в комнату
 */
export async function loadFittedModel(url: string, w: number, d: number, h: number): Promise<THREE.Object3D> {
  const obj = await parse(await fetchBytes(url))
  const box = new THREE.Box3().setFromObject(obj)
  const s = box.getSize(new THREE.Vector3())
  const c = box.getCenter(new THREE.Vector3())
  const wrap = new THREE.Group()
  obj.position.set(-c.x, -box.min.y, -c.z)
  wrap.add(obj)
  wrap.scale.set(w / (s.x || 1), h / (s.y || 1), d / (s.z || 1))
  obj.traverse((o) => {
    const m = o as THREE.Mesh
    if (m.isMesh) {
      m.castShadow = true
      m.receiveShadow = true
    }
  })
  return wrap
}
