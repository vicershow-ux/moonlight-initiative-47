import { useRef, useState } from "react"
import Icon from "@/components/ui/icon"
import { ExpenseFile, financeApi } from "@/lib/api"
import { preparePhoto } from "@/lib/photoPrep"

const readFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const isPdf = (f: File) => f.type === "application/pdf" || /\.pdf$/i.test(f.name)

/** Загрузка фото чеков и накладных; фото сжимаются перед отправкой */
export function useExpenseUpload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const upload = async (list: FileList | File[] | null): Promise<ExpenseFile[]> => {
    const arr = Array.from(list || [])
    if (!arr.length) return []
    setError("")
    setUploading(true)
    const out: ExpenseFile[] = []
    try {
      for (const file of arr) {
        let name = file.name
        let data: string
        if (isPdf(file)) {
          data = await readFile(file)
        } else {
          try {
            const p = await preparePhoto(file, 2000, 0.85)
            name = p.name
            data = p.data
          } catch {
            data = await readFile(file)
          }
        }
        out.push(await financeApi.uploadExpenseFile(name, data))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось загрузить файл")
    } finally {
      setUploading(false)
    }
    return out
  }

  return { upload, uploading, error, setError }
}

export function ExpenseFileThumb({ f, onRemove, size = "md" }: { f: ExpenseFile; onRemove?: () => void; size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-9 w-9" : "h-16 w-16"
  return (
    <div className={`group relative ${box} shrink-0`}>
      <a href={f.url} target="_blank" rel="noreferrer" title={f.name} className={`block ${box} overflow-hidden rounded-lg border border-white/10 bg-white/5`}>
        {f.type === "photo" ? (
          <img src={f.url} alt={f.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center text-red-300">
            <Icon name="FileText" size={size === "sm" ? 14 : 20} />
            {size === "md" && <span className="mt-0.5 text-[9px] font-semibold">PDF</span>}
          </span>
        )}
      </a>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#161616] border border-white/20 text-white/70 hover:bg-red-500 hover:text-white"
          aria-label="Убрать файл"
        >
          <Icon name="X" size={11} />
        </button>
      )}
    </div>
  )
}

export function ExpenseFilesField({ value, onChange }: { value: ExpenseFile[]; onChange: (v: ExpenseFile[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const camRef = useRef<HTMLInputElement>(null)
  const { upload, uploading, error } = useExpenseUpload()

  const add = async (list: FileList | null) => {
    const added = await upload(list)
    if (added.length) onChange([...value, ...added].slice(0, 10))
    if (fileRef.current) fileRef.current.value = ""
    if (camRef.current) camRef.current.value = ""
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-white/50">Чек, накладная или акт</span>
      <div
        className="flex flex-wrap items-center gap-2.5"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          add(e.dataTransfer.files)
        }}
      >
        {value.map((f, i) => (
          <ExpenseFileThumb key={f.url} f={f} onRemove={() => onChange(value.filter((_, j) => j !== i))} />
        ))}
        {value.length < 10 && (
          <>
            <button
              type="button"
              onClick={() => camRef.current?.click()}
              disabled={uploading}
              className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-white/20 text-white/50 hover:border-[#D4AF37]/60 hover:text-[#D4AF37] disabled:opacity-50 sm:hidden"
            >
              <Icon name="Camera" size={18} />
              <span className="text-[10px]">Снять</span>
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex h-16 min-w-16 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-white/20 px-3 text-white/50 hover:border-[#D4AF37]/60 hover:text-[#D4AF37] disabled:opacity-50"
            >
              <Icon name={uploading ? "Loader2" : "Paperclip"} size={18} className={uploading ? "animate-spin" : ""} />
              <span className="text-[10px]">{uploading ? "Загрузка…" : "Файл"}</span>
            </button>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*,.heic,.pdf" multiple hidden onChange={(e) => add(e.target.files)} />
      <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => add(e.target.files)} />
      {error ? (
        <span className="text-xs text-red-400">{error}</span>
      ) : (
        <span className="text-xs text-white/40">Фото с телефона или PDF, до 10 файлов. Можно перетащить сюда.</span>
      )}
    </div>
  )
}

export default ExpenseFilesField
