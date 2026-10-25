import { useEffect } from "react"
import Icon from "@/components/ui/icon"
import { ObjectFile } from "@/lib/api"
import { formatMoney, formatDate } from "@/components/crm/documents/constants"

interface ReceiptViewerProps {
  receipt: ObjectFile
  onClose: () => void
}

export function ReceiptViewer({ receipt, onClose }: ReceiptViewerProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/95" onClick={onClose}>
      <div
        className="flex items-center gap-3 px-3 py-2 pt-[calc(env(safe-area-inset-top)+8px)] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{receipt.shop_name || "Чек"}</p>
          <p className="text-xs text-white/50 truncate">
            {formatDate(receipt.created_at)}
            {Number(receipt.amount) > 0 ? ` · ${formatMoney(Number(receipt.amount))}` : ""}
            {receipt.uploader_name ? ` · ${receipt.uploader_name}` : ""}
          </p>
        </div>
        <a
          href={receipt.file_url}
          target="_blank"
          rel="noreferrer"
          className="w-11 h-11 flex items-center justify-center rounded-lg bg-white/10"
          aria-label="Открыть оригинал"
        >
          <Icon name="Download" size={18} />
        </a>
        <button onClick={onClose} className="w-11 h-11 flex items-center justify-center rounded-lg bg-white/10" aria-label="Закрыть">
          <Icon name="X" size={20} />
        </button>
      </div>
      <div className="flex-1 min-h-0 flex items-center justify-center p-2 overflow-auto">
        {receipt.file_type === "photo" ? (
          <img
            src={receipt.file_url}
            alt="Чек"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <a
            href={receipt.file_url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-3 text-white"
          >
            <Icon name="FileText" size={18} />
            Открыть файл чека
          </a>
        )}
      </div>
    </div>
  )
}

export default ReceiptViewer
