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

const statusLabels: Record<string, string> = {
  approved: "",
  pending: "ожидает подтверждения",
  rejected: "отклонено",
}

const statusColors: Record<string, string> = {
  pending: "bg-orange-500/20 text-orange-300",
  rejected: "bg-red-500/20 text-red-300",
}

export function EstimatesListModal({ open, onOpenChange, object }: EstimatesListModalProps) {
  const { user } = useAuth()
  const isClient = user?.role === "client"
  const canModerate = user?.role === "owner" || user?.role === "admin" || user?.role === "employee"

  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [expandedData, setExpandedData] = useState<Estimate | null>(null)
  const [printingId, setPrintingId] = useState<number | null>(null)

  const [proposeOpenFor, setProposeOpenFor] = useState<number | null>(null)
  const [proposeName, setProposeName] = useState("")
  const [proposeUnit, setProposeUnit] = useState("м²")
  const [proposePrice, setProposePrice] = useState("")
  const [proposeQty, setProposeQty] = useState("")
  const [proposing, setProposing] = useState(false)
  const [proposeError, setProposeError] = useState("")

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

  const refreshExpanded = async (id: number) => {
    const data = await estimatesApi.get(id)
    setExpandedData(data)
    setEstimates((prev) => prev.map((e) => (e.id === id ? { ...e, total_amount: data.total_amount } : e)))
  }

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

  const openPropose = (estimateId: number) => {
    setProposeOpenFor(estimateId)
    setProposeName("")
    setProposeUnit("м²")
    setProposePrice("")
    setProposeQty("")
    setProposeError("")
  }

  const handlePropose = async (estimateId: number) => {
    setProposeError("")
    if (proposeName.trim().length < 2) {
      setProposeError("Введите название работы")
      return
    }
    const price = Number(proposePrice)
    const quantity = Number(proposeQty)
    if (!price || price <= 0) {
      setProposeError("Укажите цену")
      return
    }
    if (!quantity || quantity <= 0) {
      setProposeError("Укажите количество")
      return
    }

    setProposing(true)
    try {
      await estimatesApi.propose({
        estimate_id: estimateId,
        name: proposeName,
        unit: proposeUnit,
        price,
        quantity,
      })
      setProposeOpenFor(null)
      if (expandedId === estimateId) {
        await refreshExpanded(estimateId)
      }
    } catch (err) {
      setProposeError(err instanceof Error ? err.message : "Не удалось отправить предложение")
    } finally {
      setProposing(false)
    }
  }

  const handleApprove = async (itemId: number, estimateId: number) => {
    await estimatesApi.approveItem(itemId)
    await refreshExpanded(estimateId)
  }

  const handleReject = async (itemId: number, estimateId: number) => {
    await estimatesApi.rejectItem(itemId)
    await refreshExpanded(estimateId)
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1f1f1f] border-white/10 text-white sm:max-w-lg max-h-[85vh] overflow-y-auto">
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
                    {!isClient && (
                      <Icon
                        name="Trash2"
                        size={15}
                        className="text-white/30 hover:text-red-400 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(est.id)
                        }}
                      />
                    )}
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
                          {canModerate && <th className="text-left font-medium py-1"></th>}
                        </tr>
                      </thead>
                      <tbody>
                        {expandedData.items?.map((it) => (
                          <tr key={it.id} className="border-t border-white/5">
                            <td className="py-1.5">
                              {it.name}
                              {it.status && it.status !== "approved" && (
                                <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${statusColors[it.status]}`}>
                                  {statusLabels[it.status]}
                                </span>
                              )}
                              {it.proposed_by_name && (
                                <p className="text-[10px] text-white/30">от {it.proposed_by_name}</p>
                              )}
                            </td>
                            <td className="py-1.5 text-white/60">{it.quantity} {it.unit}</td>
                            <td className="py-1.5 text-white/60">{formatMoney(it.price)}</td>
                            <td className="py-1.5">{formatMoney(it.amount)}</td>
                            {canModerate && (
                              <td className="py-1.5">
                                {it.status === "pending" && it.id && (
                                  <div className="flex gap-1.5">
                                    <button
                                      onClick={() => handleApprove(it.id as number, est.id)}
                                      className="text-green-400 hover:text-green-300"
                                      title="Подтвердить"
                                    >
                                      <Icon name="Check" size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleReject(it.id as number, est.id)}
                                      className="text-red-400 hover:text-red-300"
                                      title="Отклонить"
                                    >
                                      <Icon name="X" size={14} />
                                    </button>
                                  </div>
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {isClient && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        {proposeOpenFor === est.id ? (
                          <div className="flex flex-col gap-2">
                            <input
                              value={proposeName}
                              onChange={(e) => setProposeName(e.target.value)}
                              placeholder="Название работы"
                              className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-red-500/50"
                            />
                            <div className="grid grid-cols-3 gap-2">
                              <input
                                value={proposeUnit}
                                onChange={(e) => setProposeUnit(e.target.value)}
                                placeholder="Ед."
                                className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-xs outline-none"
                              />
                              <input
                                type="number"
                                value={proposeQty}
                                onChange={(e) => setProposeQty(e.target.value)}
                                placeholder="Кол-во"
                                className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-xs outline-none"
                              />
                              <input
                                type="number"
                                value={proposePrice}
                                onChange={(e) => setProposePrice(e.target.value)}
                                placeholder="Цена"
                                className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-xs outline-none"
                              />
                            </div>
                            {proposeError && (
                              <p className="text-xs text-red-400 flex items-center gap-1">
                                <Icon name="CircleAlert" size={12} />
                                {proposeError}
                              </p>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handlePropose(est.id)}
                                disabled={proposing}
                                className="flex-1 bg-red-500 hover:bg-red-600 transition-colors text-white text-xs px-3 py-2 rounded-lg disabled:opacity-60 flex items-center justify-center gap-1.5"
                              >
                                {proposing ? <Icon name="Loader2" size={13} className="animate-spin" /> : "Отправить на согласование"}
                              </button>
                              <button
                                onClick={() => setProposeOpenFor(null)}
                                className="px-3 py-2 rounded-lg text-xs text-white/50 hover:text-white transition-colors"
                              >
                                Отмена
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => openPropose(est.id)}
                            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
                          >
                            <Icon name="Plus" size={13} />
                            Предложить дополнительную работу
                          </button>
                        )}
                      </div>
                    )}
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
