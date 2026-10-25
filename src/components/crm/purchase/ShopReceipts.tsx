import { useRef, useState } from "react"
import Icon from "@/components/ui/icon"
import { objectFilesApi, ObjectFile } from "@/lib/api"
import { compressImage } from "@/lib/compressImage"
import { formatMoney } from "@/components/crm/documents/constants"
import { DeleteButton } from "@/components/ui/delete-button"

interface ShopReceiptsProps {
  objectId: number
  purchaseListId: number
  shopName: string
  receipts: ObjectFile[]
  onChanged: () => void
  onOpen: (r: ObjectFile) => void
}

export function ShopReceipts({ objectId, purchaseListId, shopName, receipts, onChanged, onOpen }: ShopReceiptsProps) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [amount, setAmount] = useState("")

  const upload = async (list: FileList | null) => {
    if (!list || list.length === 0) return
    setError("")
    setBusy(true)
    try {
      for (const file of Array.from(list)) {
        const { data, name } = await compressImage(file)
        await objectFilesApi.uploadReceipt({
          object_id: objectId,
          purchase_list_id: purchaseListId,
          shop_name: shopName,
          file_name: `Чек ${shopName} ${name}`.slice(0, 200),
          data,
          amount: Number(amount.replace(",", ".")) || 0,
        })
      }
      setAmount("")
      onChanged()
    } catch (e) {
      setError((e as Error)?.message || "Не удалось загрузить чек")
    } finally {
      setBusy(false)
      if (cameraRef.current) cameraRef.current.value = ""
      if (galleryRef.current) galleryRef.current.value = ""
    }
  }

  const remove = async (id: number) => {
    try {
      await objectFilesApi.remove(id)
      onChanged()
    } catch (e) {
      setError((e as Error)?.message || "Не удалось удалить чек")
    }
  }

  return (
    <div className="border-t border-white/10 bg-[#1a1a1a] p-3 sm:px-4">
      <div className="flex items-center gap-2">
        <Icon name="Receipt" size={15} className="text-white/40" />
        <span className="text-xs text-white/50">
          {receipts.length > 0 ? `Чеки: ${receipts.length}` : "Чека пока нет"}
        </span>
      </div>

      {receipts.length > 0 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {receipts.map((r) => (
            <div key={r.id} className="relative shrink-0">
              <button
                onClick={() => onOpen(r)}
                className="block w-20 h-24 rounded-lg overflow-hidden border border-white/10 bg-[#161616]"
              >
                {r.file_type === "photo" ? (
                  <img src={r.file_url} alt="Чек" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <span className="flex h-full items-center justify-center text-red-400">
                    <Icon name="FileText" size={22} />
                  </span>
                )}
              </button>
              {Number(r.amount) > 0 && (
                <span className="absolute left-1 bottom-1 rounded bg-black/70 px-1 text-[10px] text-white">
                  {formatMoney(Number(r.amount))}
                </span>
              )}
              <div className="absolute -right-1 -top-1 rounded-lg bg-[#1f1f1f]">
                <DeleteButton onConfirm={() => remove(r.id)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 grid grid-cols-[1fr_auto_auto] gap-2">
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
          inputMode="decimal"
          placeholder="Сумма по чеку"
          className="min-w-0 bg-[#161616] border border-white/10 rounded-lg px-3 min-h-[44px] text-sm outline-none focus:border-[#D4AF37]/50"
        />
        <button
          onClick={() => cameraRef.current?.click()}
          disabled={busy}
          className="flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-lg bg-[#D4AF37] text-[#161616] text-sm disabled:opacity-50"
        >
          <Icon name={busy ? "Loader2" : "Camera"} size={17} className={busy ? "animate-spin" : ""} />
          <span className="hidden min-[400px]:inline">Чек</span>
        </button>
        <button
          onClick={() => galleryRef.current?.click()}
          disabled={busy}
          className="flex items-center justify-center min-h-[44px] w-11 rounded-lg border border-white/10 text-white/70 disabled:opacity-50"
          aria-label="Выбрать из галереи"
          title="Выбрать из галереи"
        >
          <Icon name="ImagePlus" size={17} />
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => upload(e.target.files)}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*,.pdf"
        multiple
        className="hidden"
        onChange={(e) => upload(e.target.files)}
      />
    </div>
  )
}

export default ShopReceipts
