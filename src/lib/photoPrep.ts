export interface PreparedPhoto {
  name: string
  data: string
}

const load = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

export async function preparePhoto(file: File, max = 1600, quality = 0.82): Promise<PreparedPhoto> {
  const url = URL.createObjectURL(file)
  try {
    const img = await load(url)
    const scale = Math.min(1, max / Math.max(img.width, img.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("canvas")
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const base = file.name.replace(/\.[^.]+$/, "") || "photo"
    return { name: `${base}.jpg`, data: canvas.toDataURL("image/jpeg", quality) }
  } finally {
    URL.revokeObjectURL(url)
  }
}

export default preparePhoto
