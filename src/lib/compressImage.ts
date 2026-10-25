const readAsDataUrl = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

export async function compressImage(file: File, maxSide = 1800, quality = 0.82) {
  const isImage = file.type.startsWith("image/") || /\.(jpe?g|png|webp|heic)$/i.test(file.name)
  if (!isImage || file.type === "application/pdf") {
    return { data: await readAsDataUrl(file), name: file.name }
  }
  try {
    const src = await readAsDataUrl(file)
    const img = await loadImage(src)
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    const ctx = canvas.getContext("2d")
    if (!ctx) return { data: src, name: file.name }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const data = canvas.toDataURL("image/jpeg", quality)
    const base = file.name.replace(/\.[^.]+$/, "") || "check"
    return { data, name: `${base}.jpg` }
  } catch {
    return { data: await readAsDataUrl(file), name: file.name }
  }
}

export default compressImage
