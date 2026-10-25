import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { objectFilesApi, ObjectFile } from "@/lib/api"
import { formatMoney, formatDate } from "@/components/crm/documents/constants"
import { ReceiptViewer } from "./ReceiptViewer"

interface ObjectReceiptsCardProps {
  objectId: number
}

export function ObjectReceiptsCard({ objectId }: ObjectReceiptsCardProps) {
  const [receipts, setReceipts] = useState<ObjectFile[]>([])
  const [loading, setLoading] = useState(true)
  const [viewing, setViewing] = useState<ObjectFile | null>(null)

  useEffect(() => {
    setLoading(true)
    objectFilesApi
      .list(objectId, "receipt")
      .then((d) => setReceipts(d.files || []))
      .catch(() => setReceipts([]))
      .finally(() => setLoading(false))
  }, [objectId])

  const groups = useMemo(() => {
    const map = new Map<string, ObjectFile[]>()
    receipts.forEach((r) => {
      const key = r.shop_name || "Без магазина"
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(r)
    })
    return Array.from(map.entries())
  }, [receipts])

  const total = receipts.reduce((s, r) => s + Number(r.amount || 0), 0)

  return (
    <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="font-medium flex items-center gap-2">
          <Icon name="Receipt" size={16} className="text-[#D4AF37]" />
          Чеки
          {receipts.length > 0 && <span className="text-xs text-white/40">{receipts.length}</span>}
        </p>
        {total > 0 && <span className="text-sm font-medium text-[#D4AF37]">{formatMoney(total)}</span>}
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <Icon name="Loader2" size={18} className="animate-spin text-white/40" />
        </div>
      ) : receipts.length === 0 ? (
        <p className="text-xs text-white/40 leading-relaxed">
          Чеков пока нет. Откройте список на закупку в «Документах» и сфотографируйте чек у нужного магазина.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map(([shop, list]) => {
            const sum = list.reduce((s, r) => s + Number(r.amount || 0), 0)
            return (
              <div key={shop}>
                <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                  <span className="text-white/70 truncate">{shop}</span>
                  {sum > 0 && <span className="text-white/50 shrink-0">{formatMoney(sum)}</span>}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {list.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setViewing(r)}
                      className="relative aspect-[3/4] rounded-lg overflow-hidden border border-white/10 bg-[#161616] text-left"
                    >
                      {r.file_type === "photo" ? (
                        <img src={r.file_url} alt="Чек" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-red-400">
                          <Icon name="FileText" size={22} />
                        </span>
                      )}
                      <span className="absolute inset-x-0 bottom-0 bg-black/70 px-1.5 py-1 text-[10px] text-white leading-tight">
                        {formatDate(r.created_at)}
                        {Number(r.amount) > 0 && <span className="block font-medium">{formatMoney(Number(r.amount))}</span>}
                      </span>
                    </button>
                  ))}
                </div>
                {list[0]?.purchase_list_id && (
                  <Link
                    to={`/cabinet/purchase-lists/${list[0].purchase_list_id}`}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-white/40 hover:text-[#D4AF37]"
                  >
                    <Icon name="ListChecks" size={13} />
                    Открыть список на закупку
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}

      {viewing && <ReceiptViewer receipt={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}

export default ObjectReceiptsCard
