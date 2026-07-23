import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Icon from "@/components/ui/icon"
import { estimatesApi, Estimate, ObjectItem } from "@/lib/api"
import { printEstimate } from "@/lib/printEstimate"
import { useAuth } from "@/contexts/AuthContext"

interface EstimatesListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  object: ObjectItem | null
}

const formatMoney = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " ₽"

export function EstimatesListModal({ open, onOpenChange, object }: EstimatesListModalProps) {
  const { user } = useAuth()
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [expandedData, setExpandedData] = useState<Estimate | null>(null)
  const [printingId, setPrintingId] = useState<number | null>(null)

  useEffect(() => {
    if (open && object) {
      setLoading(true)
      estimatesApi
        .listByObject(object.id)
        .then((data) => setEstimates(data.estimates))
        .finally(() => setLoading(false))
      setExpandedId(null)
      setExpandedData(null)
    }
  }, [open, object])

  const toggleExpand = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null)
      setExpandedData(null)
      return
    }
    setExpandedId(id)
    const data = await estimatesApi.get(id)
    setExpandedData(data)
  }

  const handleDelete = async (id: number) => {
    await estimatesApi.remove(id)
    setEstimates((prev) => prev.filter((e) => e.id !== id))
    if (expandedId === id) {
      setExpandedId(null)
      setExpandedData(null)
    }
  }

  const handlePrint = async (id: number) => {
    if (!object) return
    setPrintingId(id)
    try {
      const full = expandedId === id && expandedData ? expandedData : await estimatesApi.get(id)
      printEstimate(full, object, user?.company_name || "")
    } finally {
      setPrintingId(null)
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1f1f1f] border-white/10 text-white sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Сметы {object ? `— ${object.client_name}` : ""}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <Icon name="Loader2" size={22} className="animate-spin text-white/40" />
          </div>
        ) : estimates.length === 0 ? (
          <div className="text-center py-10 text-white/30 text-sm">
            По этому объекту ещё нет смет
          </div>
        ) : (
          <div className="flex flex-col gap-2 mt-2">
            {estimates.map((est) => (
              <div key={est.id} className="border border-white/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleExpand(est.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <div className="text-left">
                    <p className="text-sm font-medium">{formatMoney(est.total_amount)}</p>
                    <p className="text-xs text-white/40">{formatDate(est.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {printingId === est.id ? (
                      <Icon name="Loader2" size={15} className="text-white/40 animate-spin" />
                    ) : (
                      <Icon
                        name="Printer"
                        size={15}
                        className="text-white/30 hover:text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePrint(est.id)
                        }}
                      />
                    )}
                    <Icon
                      name="Trash2"
                      size={15}
                      className="text-white/30 hover:text-red-400 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(est.id)
                      }}
                    />
                    <Icon name={expandedId === est.id ? "ChevronUp" : "ChevronDown"} size={16} className="text-white/40" />
                  </div>
                </button>

                {expandedId === est.id && expandedData && (
                  <div className="px-4 pb-3 border-t border-white/10">
                    <table className="w-full text-xs mt-2">
                      <thead>
                        <tr className="text-white/40">
                          <th className="text-left font-medium py-1">Название</th>
                          <th className="text-left font-medium py-1">Кол-во</th>
                          <th className="text-left font-medium py-1">Цена</th>
                          <th className="text-left font-medium py-1">Сумма</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expandedData.items?.map((it) => (
                          <tr key={it.id} className="border-t border-white/5">
                            <td className="py-1.5">{it.name}</td>
                            <td className="py-1.5 text-white/60">{it.quantity} {it.unit}</td>
                            <td className="py-1.5 text-white/60">{formatMoney(it.price)}</td>
                            <td className="py-1.5">{formatMoney(it.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}