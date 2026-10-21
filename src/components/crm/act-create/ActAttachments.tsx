import { useRef, useState } from "react"
import Icon from "@/components/ui/icon"
import { ActAttachment, objectFilesApi } from "@/lib/api"

const ACCEPT = ".jpg,.jpeg,.png,.webp,.heic,.pdf,.xls,.xlsx,.csv"

const typeIcon: Record<ActAttachment["type"], string> = {
  photo: "Image",
  pdf: "FileText",
  excel: "Sheet",
  other: "File",
}

const detectType = (name: string): ActAttachment["type"] => {
  const ext = (name.split(".").pop() || "").toLowerCase()
  if (["jpg", "jpeg", "png", "webp", "heic"].includes(ext)) return "photo"
  if (ext === "pdf") return "pdf"
  if (["xls", "xlsx", "csv"].includes(ext)) return "excel"
  return "other"
}

const readFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

interface Props {
  objectId: number
  value: ActAttachment[]
  onChange: (v: ActAttachment[]) => void
}

export function ActAttachments({ objectId, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const handleFiles = async (list: FileList | null) => {
    if (!list || list.length === 0) return
    setError("")
    setUploading(true)
    const added: ActAttachment[] = []
    try {
      for (const file of Array.from(list)) {
        const data = await readFile(file)
        const res = await objectFilesApi.upload(objectId, file.name, data)
        added.push({ name: file.name, url: res.url, type: detectType(file.name) })
      }
    } catch (e) {
      setError((e as Error)?.message || "Не удалось загрузить файл")
    } finally {
      if (added.length) onChange([...value, ...added])
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx))

  return (
    <div className="flex flex-col gap-2 mt-1">
      {value.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {value.map((f, i) => (
            <div key={`${f.url}-${i}`} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
              {f.type === "photo" ? (
                <img src={f.url} alt="" className="w-9 h-9 rounded object-cover shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded bg-white/5 flex items-center justify-center shrink-0">
                  <Icon name={typeIcon[f.type]} size={16} className="text-white/60" />
                </div>
              )}
              <a href={f.url} target="_blank" rel="noreferrer" className="flex-1 min-w-0 truncate text-sm text-white/80 hover:text-white">
                {f.name}
              </a>
              <button
                type="button"
                onClick={() => remove(i)}
                title="Убрать из акта"
                className="w-10 h-10 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center rounded-md text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors"
              >
                <Icon name="X" size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <input ref={inputRef} type="file" multiple accept={ACCEPT} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:border-[#D4AF37]/60 transition-colors disabled:opacity-60"
      >
        <Icon name={uploading ? "Loader2" : "Paperclip"} size={15} className={uploading ? "animate-spin" : ""} />
        {uploading ? "Загружаю..." : "Прикрепить фото или документы"}
      </button>
      <p className="text-[11px] text-white/35">Фото, PDF или Excel до 15 МБ. Файлы попадут в акт и в файлы объекта.</p>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export default ActAttachments
