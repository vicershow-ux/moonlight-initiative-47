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

/**
 * Убирает серую/светлую обводку ("гало"), которую графические редакторы часто
 * запекают вдоль контура рисунка на прозрачном PNG — это остаточный цвет
 * шахматного фона предпросмотра, смешанный в пиксели рядом с настоящей
 * прозрачностью. Работает как разрастание (BFS) от уже прозрачных пикселей:
 * соседние малонасыщенные (серые) пиксели тоже стираются, на ограниченную
 * глубину — так мы задеваем только тонкую кайму у края, а не весь рисунок.
 */
function removeGreyHalo(canvas: HTMLCanvasElement, maxDepth = 12): boolean {
  const ctx = canvas.getContext("2d")
  if (!ctx) return false

  const { width, height } = canvas
  if (width * height > 4_000_000) return false

  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  const total = width * height

  const isTransparent = (idx: number) => data[idx * 4 + 3] <= 5
  const isGreyish = (idx: number) => {
    const p = idx * 4
    const r = data[p]
    const g = data[p + 1]
    const b = data[p + 2]
    const maxc = Math.max(r, g, b)
    const minc = Math.min(r, g, b)
    return maxc - minc <= 20 && maxc >= 80
  }

  const visited = new Uint8Array(total)
  const queue: number[] = []
  let head = 0
  const depthOf = new Int16Array(total).fill(-1)

  for (let idx = 0; idx < total; idx++) {
    if (isTransparent(idx)) {
      visited[idx] = 1
      depthOf[idx] = 0
      queue.push(idx)
    }
  }

  const toClear: number[] = []

  while (head < queue.length) {
    const idx = queue[head++]
    const d = depthOf[idx]
    if (d >= maxDepth) continue

    const x = idx % width
    const y = Math.floor(idx / width)
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
      if (isTransparent(nIdx)) {
        visited[nIdx] = 1
        depthOf[nIdx] = 0
        queue.push(nIdx)
      } else if (isGreyish(nIdx)) {
        visited[nIdx] = 1
        depthOf[nIdx] = d + 1
        toClear.push(nIdx)
        queue.push(nIdx)
      }
    }
  }

  if (toClear.length === 0) return false

  for (const idx of toClear) {
    data[idx * 4 + 3] = 0
  }

  ctx.putImageData(imageData, 0, 0)
  return true
}

/**
 * Уменьшает изображение до maxDimension по большей стороне и сжимает его,
 * чтобы уменьшить размер base64-пейлоада перед отправкой на backend.
 * Для PNG/WebP также убирает серую обводку вдоль контура (см. removeGreyHalo).
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
    removeGreyHalo(sourceCanvas)
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
