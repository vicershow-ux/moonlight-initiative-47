import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { estimatesApi, Estimate, EstimateItem } from "@/lib/api"
import { printEstimate, downloadEstimatePdf, estimatePdfBase64, estimatePreviewHtml } from "@/lib/printEstimate"
import { estimateStatusOptions, getEstimateStatusColor, getEstimateStatusLabel, EstimateStatus } from "@/lib/estimateStatus"
import { useAuth } from "@/contexts/AuthContext"
import { SendDocEmailDialog } from "@/components/crm/SendDocEmailDialog"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v)
  return Number.isFinite(n) ? n : fallback
}

const formatMoney = (n: unknown) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(num(n)) + " ₽"

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })

const formatDateTime = (d: string) =>
  new Date(d).toLocaleString("ru-RU", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })

const estObject = (e: Estimate) =>
  ({
    object_code: e.object_code || "",
    client_name: e.client_name || "",
    client_phone: e.client_phone || "",
    object_type: e.object_type || "",
    area: e.area || 0,
    email: e.email || "",
    address: e.address || "",
  }) as never

export default function EstimateView() {
  const { id, estimateId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isClient = user?.role === "client"
  const objectId = Number(id)

  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [loading, setLoading] = useState(true)
  const [printing, setPrinting] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const load = () => {
    if (!estimateId) return
    setLoading(true)
    estimatesApi
      .get(Number(estimateId))
      .then(setEstimate)
      .catch(() => navigate(`/cabinet/objects/${objectId}`))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimateId])

  const handlePrint = () => {
    if (!estimate) return
    setPrinting(true)
    try {
      printEstimate(
        estimate,
        estObject(estimate),
        estimate.company_name || user?.company_name || ""
      )
    } finally {
      setPrinting(false)
    }
  }

  const handleStatusChange = async (newStatus: EstimateStatus) => {
    if (!estimate) return
    setSavingStatus(true)
    try {
      await estimatesApi.setStatus(estimate.id, newStatus)
      setEstimate((prev) => (prev ? { ...prev, status: newStatus } : prev))
    } finally {
      setSavingStatus(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!estimate) return
    setDownloading(true)
    try {
      await downloadEstimatePdf(
        estimate,
        estObject(estimate),
        estimate.company_name || user?.company_name || ""
      )
    } finally {
      setDownloading(false)
    }
  }

  const handleDelete = async () => {
    if (!estimate) return
    setDeleting(true)
    try {
      await estimatesApi.remove(estimate.id)
      navigate(`/cabinet/objects/${objectId}`)
    } finally {
      setDeleting(false)
    }
  }

  if (loading || !estimate) {
    return (
      <CrmLayout title="Смета">
        <div className="flex items-center justify-center py-24">
          <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
        </div>
      </CrmLayout>
    )
  }

  const items = estimate.items || []
  const groups = new Map<string, EstimateItem[]>()
  items.forEach((it) => {
    const key = it.room_name || "Без помещения"
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(it)
  })

  const subtotal = num(estimate.subtotal_amount ?? estimate.total_amount)
  const discountAmount = num(estimate.discount_amount ?? 0)
  const revisions = estimate.revisions || []

  return (
    <CrmLayout title={`Смета №${estimate.estimate_number || estimate.id}`} subtitle={`Редакция №${estimate.revision_number ?? 1}`}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <Link
          to={`/cabinet/objects/${objectId}`}
          className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
        >
          <Icon name="ChevronLeft" size={16} />
          К объекту
        </Link>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getEstimateStatusColor(estimate.status)}`}>
            {getEstimateStatusLabel(estimate.status)}
          </span>
          {!isClient && (
            <Link
              to={`/cabinet/objects/${objectId}/estimates/${estimate.id}/edit`}
              className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm px-3 py-2 rounded-lg"
            >
              <Icon name="Pencil" size={14} />
              Редактировать
            </Link>
          )}
          <button
            onClick={() => setSendOpen(true)}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 transition-colors text-white text-sm px-3 py-2 rounded-lg"
          >
            <Icon name="Mail" size={14} />
            Отправить на почту
          </button>
          <button
            onClick={handlePrint}
            disabled={printing}
            title="Печать"
            className="flex items-center justify-center w-9 h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg disabled:opacity-60"
          >
            {printing ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Printer" size={15} />}
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            title="Скачать PDF"
            className="flex items-center justify-center w-9 h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg disabled:opacity-60"
          >
            {downloading ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Download" size={15} />}
          </button>
          {!isClient && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  title="Ещё"
                  className="flex items-center justify-center w-9 h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg"
                >
                  <Icon name="MoreVertical" size={15} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    setConfirmDelete(true)
                  }}
                  disabled={deleting}
                  className="text-red-500 focus:text-red-500"
                >
                  <Icon name="Trash2" size={14} className="mr-2" />
                  Удалить смету
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {!isClient && (
        <div className="bg-[#1f1f1f] border border-white/10 rounded-xl mb-4 p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                Сформированная редакция №{estimate.revision_number ?? 1}
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${getEstimateStatusColor(estimate.status)}`}>
                  {getEstimateStatusLabel(estimate.status)}
                </span>
              </p>
              <p className="text-xs text-white/40 mt-1">
                Сформирована {formatDateTime(estimate.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={estimate.status || "ready"}
                onValueChange={(v) => handleStatusChange(v as EstimateStatus)}
                disabled={savingStatus}
              >
                <SelectTrigger className="w-[200px] bg-[#161616] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {estimateStatusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {revisions.length > 1 && (
        <div className="bg-[#1f1f1f] border border-white/10 rounded-xl mb-4 overflow-hidden">
          <button
            onClick={() => setHistoryOpen((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors"
          >
            <span className="text-sm text-white/60 flex items-center gap-2">
              <Icon name="History" size={15} />
              История сформированных редакций ({revisions.length})
            </span>
            <Icon name={historyOpen ? "ChevronUp" : "ChevronDown"} size={16} className="text-white/40" />
          </button>
          {historyOpen && (
            <div className="border-t border-white/10 divide-y divide-white/5">
              {revisions.map((rev) => (
                <Link
                  key={rev.id}
                  to={`/cabinet/objects/${objectId}/estimates/${rev.id}`}
                  className={`flex items-center justify-between px-5 py-3 text-sm hover:bg-white/5 transition-colors ${rev.id === estimate.id ? "bg-white/5" : ""}`}
                >
                  <span className="flex items-center gap-2">
                    Редакция №{rev.revision_number}
                    {rev.id === estimate.id && <span className="text-[#D4AF37] text-xs">(текущая)</span>}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${getEstimateStatusColor(rev.status)}`}>
                      {getEstimateStatusLabel(rev.status)}
                    </span>
                  </span>
                  <span className="text-white/40">{formatDate(rev.created_at)} · {formatMoney(rev.total_amount)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl p-6 md:p-10 max-w-4xl mx-auto shadow-xl overflow-x-auto">
        <div
          dangerouslySetInnerHTML={{
            __html: estimatePreviewHtml(estimate, estObject(estimate), estimate.company_name || user?.company_name || ""),
          }}
        />
      </div>
      <ConfirmDeleteDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        onConfirm={handleDelete}
        title="Удалить смету?"
        description="Смета и все её позиции будут удалены безвозвратно."
      />

      <SendDocEmailDialog
        open={sendOpen}
        onOpenChange={setSendOpen}
        docName="смету"
        objectId={estimate.object_id}
        fileName={`Смета_${estimate.estimate_number || estimate.id}.pdf`}
        makePdf={() => estimatePdfBase64(estimate, estObject(estimate), estimate.company_name || user?.company_name || "")}
        send={(p) => estimatesApi.sendEmail(estimate.id, p)}
      />
    </CrmLayout>
  )
}