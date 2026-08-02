import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { estimatesApi, Estimate, EstimateItem } from "@/lib/api"
import { printEstimate, downloadEstimatePdf } from "@/lib/printEstimate"
import { estimateStatusOptions, getEstimateStatusColor, getEstimateStatusLabel, EstimateStatus } from "@/lib/estimateStatus"
import { useAuth } from "@/contexts/AuthContext"

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
  const [savingStatus, setSavingStatus] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

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
        {
          object_code: estimate.object_code || "",
          client_name: estimate.client_name || "",
          client_phone: estimate.client_phone || "",
          object_type: estimate.object_type || "",
          area: estimate.area || 0,
        } as never,
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
        {
          object_code: estimate.object_code || "",
          client_name: estimate.client_name || "",
          client_phone: estimate.client_phone || "",
          object_type: estimate.object_type || "",
          area: estimate.area || 0,
        } as never,
        estimate.company_name || user?.company_name || ""
      )
    } finally {
      setDownloading(false)
    }
  }

  const handleDelete = async () => {
    if (!estimate) return
    if (!window.confirm("Удалить смету безвозвратно?")) return
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
    <CrmLayout title={`Смета №${estimate.id}`} subtitle={`Редакция №${estimate.revision_number ?? 1}`}>
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
                  onClick={handleDelete}
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
                Сформирована {formatDateTime(estimate.created_at)}. Стадия описывает процесс вне SMPro и не ограничивает редактирование.
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

      <div className="bg-white text-[#1a1a1a] rounded-xl p-8 md:p-10 max-w-4xl mx-auto shadow-xl">
        <div className="flex items-center justify-between border-b-2 border-[#D4AF37] pb-4 mb-6">
          <div className="text-xl font-bold tracking-tight">
            Fix<span className="text-[#D4AF37]">Key</span>
          </div>
          <div className="text-right">
            <h1 className="text-lg font-semibold">Смета № {estimate.id}</h1>
            <p className="text-xs text-gray-500">от {formatDate(estimate.created_at)}</p>
          </div>
        </div>

        <div className="mb-2">
          <h2 className="text-xl font-bold tracking-tight">СМЕТА НА РАБОТЫ</h2>
          <p className="text-xs text-gray-500 mt-1">Расчёт ремонтно-отделочных работ</p>
          {estimate.contract_number && (
            <p className="text-xs text-gray-500">
              Приложение к договору № {estimate.contract_number}
              {estimate.contract_date ? ` от ${formatDate(estimate.contract_date)}` : ""}
            </p>
          )}
        </div>

        <div className="h-px bg-gray-200 my-5" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4 mb-6 text-sm">
          <div>
            <p className="text-[10px] uppercase text-gray-400 tracking-wide mb-1">ID объекта</p>
            <p className="font-medium">{estimate.object_code}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-gray-400 tracking-wide mb-1">Заказчик</p>
            <p className="font-medium">{estimate.client_name}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-gray-400 tracking-wide mb-1">Контактный телефон</p>
            <p className="font-medium">{estimate.client_phone || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-gray-400 tracking-wide mb-1">Характеристики объекта</p>
            <p className="font-medium">{estimate.object_type} · {estimate.area} м²</p>
          </div>
        </div>

        {Array.from(groups.entries()).map(([roomName, groupItems]) => {
          const catGroups = new Map<string, EstimateItem[]>()
          groupItems.forEach((it) => {
            const key = it.category || "Прочие работы"
            if (!catGroups.has(key)) catGroups.set(key, [])
            catGroups.get(key)!.push(it)
          })
          const roomTotal = groupItems.reduce((s, it) => s + num(it.amount), 0)

          return (
            <div key={roomName} className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold">{roomName}</h3>
              </div>

              {Array.from(catGroups.entries()).map(([catName, catItems]) => {
                const catTotal = catItems.reduce((s, it) => s + num(it.amount), 0)
                return (
                  <div key={catName} className="mb-3 border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100 text-gray-500 text-[11px] uppercase tracking-wide">
                          <th className="text-left font-medium py-2 px-3 w-10">№</th>
                          <th className="text-left font-medium py-2 px-3">Наименование работы</th>
                          <th className="text-left font-medium py-2 px-3 w-16">Ед.</th>
                          <th className="text-left font-medium py-2 px-3 w-16">Кол-во</th>
                          <th className="text-left font-medium py-2 px-3 w-12">Раз</th>
                          <th className="text-right font-medium py-2 px-3 w-24">Цена</th>
                          <th className="text-right font-medium py-2 px-3 w-24">Сумма</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={7} className="px-3 py-1.5 text-xs font-semibold text-[#B8860B] bg-[#D4AF37]/10 flex items-center gap-1.5">
                            <Icon name="Tag" size={12} />
                            {catName}
                          </td>
                        </tr>
                        {catItems.map((it, idx) => (
                          <tr key={it.id ?? idx} className="border-t border-gray-100">
                            <td className="py-2 px-3 text-gray-400">{idx + 1}</td>
                            <td className="py-2 px-3">{it.name}</td>
                            <td className="py-2 px-3 text-gray-500">{it.unit}</td>
                            <td className="py-2 px-3 text-gray-500">{it.quantity}</td>
                            <td className="py-2 px-3 text-gray-500">{it.times ?? 1}</td>
                            <td className="py-2 px-3 text-right text-gray-500">{formatMoney(it.price)}</td>
                            <td className="py-2 px-3 text-right font-medium">{formatMoney(it.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-gray-200 bg-gray-50">
                          <td colSpan={6} className="py-2 px-3 text-right text-xs text-gray-500">Итого по категории</td>
                          <td className="py-2 px-3 text-right text-sm font-semibold">{formatMoney(catTotal)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )
              })}

              <div className="flex items-center justify-between bg-[#F5EFE4] border-l-4 border-[#C08A2A] rounded px-4 py-3 mt-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-[#A9711F] font-semibold">Итоговая сумма по помещению</p>
                  <p className="text-sm text-gray-600">{roomName}</p>
                </div>
                <p className="text-lg font-bold text-[#A9711F]">{formatMoney(roomTotal)}</p>
              </div>
            </div>
          )
        })}

        <div className="flex justify-end mb-6">
          <div className="w-full sm:w-72 bg-gray-50 rounded-lg p-4 text-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-gray-500">Сумма до скидки:</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex items-center justify-between mb-1.5 text-[#A9711F]">
                <span>Скидка:</span>
                <span>-{formatMoney(discountAmount)}</span>
              </div>
            )}
            <div className="h-px bg-gray-200 my-2" />
            <div className="flex items-center justify-between text-base font-bold">
              <span>ИТОГО К ОПЛАТЕ:</span>
              <span>{formatMoney(estimate.total_amount)}</span>
            </div>
          </div>
        </div>

        {estimate.notes && (
          <div className="mb-6 text-sm">
            <p className="text-[10px] uppercase text-gray-400 tracking-wide mb-1">Примечания</p>
            <p className="text-gray-700">{estimate.notes}</p>
          </div>
        )}

        <div className="h-px bg-gray-200 mb-6" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-[10px] uppercase text-gray-400 tracking-wide mb-1">Исполнитель</p>
            <p className="font-semibold">{estimate.company_name || estimate.created_by_name}</p>
            {estimate.created_by_name && estimate.company_name && (
              <p className="text-gray-500 text-xs mt-0.5">{estimate.created_by_name}</p>
            )}
            {(estimate.created_by_phone || estimate.company_phone) && (
              <p className="text-gray-500 text-xs mt-0.5">Тел: {estimate.created_by_phone || estimate.company_phone}</p>
            )}
            {(estimate.created_by_email || estimate.company_email) && (
              <p className="text-gray-500 text-xs">Email: {estimate.created_by_email || estimate.company_email}</p>
            )}
            {estimate.company_inn && <p className="text-gray-500 text-xs">ИНН: {estimate.company_inn}</p>}
            {estimate.company_legal_address && <p className="text-gray-500 text-xs">{estimate.company_legal_address}</p>}
            {estimate.company_signature_url && (
              <img src={estimate.company_signature_url} alt="Подпись" className="h-10 object-contain mt-2" />
            )}
          </div>
          <div>
            <p className="text-[10px] uppercase text-gray-400 tracking-wide mb-1">Заказчик</p>
            <p className="font-semibold">{estimate.client_name}</p>
            {estimate.client_phone && <p className="text-gray-500 text-xs mt-0.5">Тел: {estimate.client_phone}</p>}
            {estimate.email && <p className="text-gray-500 text-xs">Email: {estimate.email}</p>}
          </div>
        </div>

        <div className="text-right text-[11px] text-gray-300 mt-8">
          Сформировано {formatDateTime(new Date().toISOString())}
        </div>
      </div>
    </CrmLayout>
  )
}