import { useEffect, useRef, useState } from "react"
import Icon from "@/components/ui/icon"
import { objectFilesApi, ObjectFile } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

const ACCEPT = ".jpg,.jpeg,.png,.webp,.heic,.pdf,.xls,.xlsx,.csv"

const typeIcon: Record<string, string> = {
  photo: "Image",
  pdf: "FileText",
  excel: "Sheet",
  other: "File",
}

const typeColor: Record<string, string> = {
  photo: "text-emerald-400",
  pdf: "text-red-400",
  excel: "text-green-400",
  other: "text-white/40",
}

const formatSize = (b: number) =>
  b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} МБ` : `${Math.max(1, Math.round(b / 1024))} КБ`

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })

const readFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

interface Props {
  objectId: number
}

export function ObjectFilesCard({ objectId }: Props) {
  const { user } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<ObjectFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const canUpload = user?.role !== "client"

  const load = () => {
    setLoading(true)
    objectFilesApi
      .list(objectId)
      .then((d) => setFiles(d.files || []))
      .catch(() => setFiles([]))
      .finally(() => setLoading(false))
  }

  useEffect(load, [objectId])

  const handleFiles = async (list: FileList | null) => {
    if (!list || list.length === 0) return
    setError("")
    setUploading(true)
    try {
      for (const file of Array.from(list)) {
        const data = await readFile(file)
        await objectFilesApi.upload(objectId, file.name, data)
      }
      load()
    } catch (e) {
      setError((e as Error)?.message || "Не удалось загрузить файл")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const remove = async (id: number) => {
    setError("")
    try {
      await objectFilesApi.remove(id)
      load()
    } catch (e) {
      setError((e as Error)?.message || "Не удалось удалить файл")
    }
  }

  return (
    <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="font-medium">Файлы</p>
        {canUpload && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-sm text-[#D4AF37] hover:text-[#B8860B] transition-colors disabled:opacity-40"
          >
            {uploading ? "Загрузка..." : "+ Загрузить"}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Icon name="Loader2" size={20} className="animate-spin text-white/40" />
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-white/30 text-sm gap-2">
          <Icon name="FileX" size={24} className="text-white/20" />
          Файлов пока нет
          {canUpload && (
            <span className="text-xs text-white/20">Фото, PDF и Excel — до 15 МБ</span>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 bg-[#161616] border border-white/10 rounded-lg p-3"
            >
              <Icon
                name={typeIcon[f.file_type] || "File"}
                size={18}
                className={typeColor[f.file_type] || "text-white/40"}
                fallback="File"
              />
              <div className="min-w-0 flex-1">
                <a
                  href={f.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate text-sm hover:text-[#D4AF37] transition-colors"
                  title={f.file_name}
                >
                  {f.file_name}
                </a>
                <p className="text-xs text-white/30">
                  {formatSize(f.file_size)} · {formatDate(f.created_at)} · {f.uploader_name}
                </p>
              </div>
              <a
                href={f.file_url}
                download
                target="_blank"
                rel="noreferrer"
                className="text-white/40 hover:text-white transition-colors"
                title="Скачать"
              >
                <Icon name="Download" size={15} />
              </a>
              {canUpload && (
                <button
                  onClick={() => remove(f.id)}
                  className="text-white/40 hover:text-red-400 transition-colors"
                  title="Удалить"
                >
                  <Icon name="Trash2" size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ObjectFilesCard
