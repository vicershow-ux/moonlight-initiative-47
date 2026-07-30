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
 * Уменьшает изображение до maxDimension по большей стороне и сжимает его,
 * чтобы уменьшить размер base64-пейлоада перед отправкой на backend.
 * SVG не трогаем — это векторный формат.
 */
export async function resizeImageToDataUrl(file: File, maxDimension: number, quality = 0.85): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file)

  if (file.type === "image/svg+xml") {
    return dataUrl
  }

  const img = await loadImageFromDataUrl(dataUrl)
  let { width, height } = img

  if (width <= maxDimension && height <= maxDimension) {
    return dataUrl
  }

  if (width > height) {
    height = Math.round((height * maxDimension) / width)
    width = maxDimension
  } else {
    width = Math.round((width * maxDimension) / height)
    height = maxDimension
  }

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return dataUrl

  ctx.drawImage(img, 0, 0, width, height)

  const outputType = file.type === "image/png" ? "image/png" : "image/jpeg"
  return canvas.toDataURL(outputType, quality)
}
