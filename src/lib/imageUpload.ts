export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = dataUrl
  })
}

const isGrayish = (r: number, g: number, b: number, maxDiff = 12) =>
  Math.max(r, g, b) - Math.min(r, g, b) <= maxDiff

const quantize = (v: number) => Math.round(v / 4) * 4

/**
 * Ищет в изображении пару светлых серых/белых цветов, из которых обычно
 * состоит "шахматный" паттерн прозрачности, запечённый графическими
 * редакторами прямо в пиксели (вместо настоящего альфа-канала).
 */
function detectCheckerColors(
  data: Uint8ClampedArray,
  width: number,
  height: number
): [number, number, number][] | null {
  const freq = new Map<string, { count: number; r: number; g: number; b: number }>()
  const step = width * height > 300 * 300 ? 2 : 1
  let sampled = 0

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4
      const a = data[idx + 3]
      if (a < 250) continue
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]
      if (!isGrayish(r, g, b)) continue
      if (Math.max(r, g, b) < 140) continue
      sampled++
      const key = `${quantize(r)},${quantize(g)},${quantize(b)}`
      const entry = freq.get(key)
      if (entry) entry.count++
      else freq.set(key, { count: 1, r, g, b })
    }
  }

  if (sampled === 0) return null

  const sorted = [...freq.values()].sort((a, b) => b.count - a.count)
  if (sorted.length < 2) return null

  const top2Share = (sorted[0].count + sorted[1].count) / sampled
  if (top2Share < 0.25) return null

  const [c1, c2] = sorted
  const diff = Math.abs(c1.r - c2.r) + Math.abs(c1.g - c2.g) + Math.abs(c1.b - c2.b)
  if (diff < 20) return null

  return [
    [c1.r, c1.g, c1.b],
    [c2.r, c2.g, c2.b],
  ]
}

/**
 * Если изображение содержит запечённый в пиксели "шахматный" фон (типичный
 * индикатор прозрачности в графредакторах), заливает эти области настоящей
 * прозрачностью. Сначала стирает области, связанные с краями канваса (внешний
 * фон), затем отдельно ищет замкнутые "дырки" с тем же паттерном внутри самого
 * рисунка (например, внутри букв "О", "А", "Р") — они не связаны с краями и
 * иначе остаются нетронутыми.
 */
function removeCheckerboardBackground(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext("2d")
  if (!ctx) return false

  const { width, height } = canvas
  if (width * height > 4_000_000) return false

  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  const colors = detectCheckerColors(data, width, height)
  if (!colors) return false

  const matches = (r: number, g: number, b: number) =>
    colors.some(([cr, cg, cb]) => Math.abs(r - cr) <= 18 && Math.abs(g - cg) <= 18 && Math.abs(b - cb) <= 18)

  const total = width * height
  const visited = new Uint8Array(total)
  const stack: number[] = []
  let removedAny = false

  const floodFillFrom = (startIdx: number) => {
    if (visited[startIdx]) return
    const sp = startIdx * 4
    if (!matches(data[sp], data[sp + 1], data[sp + 2])) return
    visited[startIdx] = 1
    stack.push(startIdx)

    while (stack.length) {
      const idx = stack.pop() as number
      const x = idx % width
      const y = Math.floor(idx / width)
      const p = idx * 4
      data[p + 3] = 0
      removedAny = true

      const neighbors: [number, number][] = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ]
      for (const [nx, ny] of neighbors) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
        const nIdx = ny * width + nx
        if (visited[nIdx]) continue
        const np = nIdx * 4
        if (matches(data[np], data[np + 1], data[np + 2])) {
          visited[nIdx] = 1
          stack.push(nIdx)
        }
      }
    }
  }

  // Проход 1: внешний фон, связанный с краями изображения.
  for (let x = 0; x < width; x++) {
    floodFillFrom(x)
    floodFillFrom((height - 1) * width + x)
  }
  for (let y = 0; y < height; y++) {
    floodFillFrom(y * width)
    floodFillFrom(y * width + (width - 1))
  }

  // Проход 2: замкнутые "дырки" внутри рисунка (не связаны с краями канваса).
  for (let idx = 0; idx < total; idx++) {
    if (!visited[idx]) floodFillFrom(idx)
  }

  if (removedAny) {
    ctx.putImageData(imageData, 0, 0)
  }
  return removedAny
}

/**
 * Уменьшает изображение до maxDimension по большей стороне и сжимает его,
 * чтобы уменьшить размер base64-пейлоада перед отправкой на backend.
 * Для PNG/WebP также пытается автоматически распознать запечённый в пиксели
 * "шахматный" фон и превратить его в настоящую прозрачность.
 * SVG не трогаем — это векторный формат.
 */
export async function resizeImageToDataUrl(file: File, maxDimension: number, quality = 0.85): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file)

  if (file.type === "image/svg+xml") {
    return dataUrl
  }

  const img = await loadImageFromDataUrl(dataUrl)
  const canSupportAlpha = file.type === "image/png" || file.type === "image/webp"

  const sourceCanvas = document.createElement("canvas")
  sourceCanvas.width = img.width
  sourceCanvas.height = img.height
  const sourceCtx = sourceCanvas.getContext("2d")
  if (!sourceCtx) return dataUrl
  sourceCtx.drawImage(img, 0, 0)

  if (canSupportAlpha) {
    removeCheckerboardBackground(sourceCanvas)
  }

  let { width, height } = img
  const needsResize = width > maxDimension || height > maxDimension
  if (needsResize) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width)
      width = maxDimension
    } else {
      width = Math.round((width * maxDimension) / height)
      height = maxDimension
    }
  }

  const outputType = canSupportAlpha ? "image/png" : "image/jpeg"

  if (!needsResize) {
    return sourceCanvas.toDataURL(outputType, quality)
  }

  const targetCanvas = document.createElement("canvas")
  targetCanvas.width = width
  targetCanvas.height = height
  const targetCtx = targetCanvas.getContext("2d")
  if (!targetCtx) return sourceCanvas.toDataURL(outputType, quality)

  targetCtx.drawImage(sourceCanvas, 0, 0, width, height)
  return targetCanvas.toDataURL(outputType, quality)
}