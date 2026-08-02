import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { estimatesApi, objectsApi, objectStatusesApi, contractsApi, Estimate, ObjectItem, ObjectStatus, Contract } from "@/lib/api"
import { printEstimate, downloadEstimatePdf } from "@/lib/printEstimate"
import { getStatusBadgeClass } from "@/lib/objectStatusColors"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

type TabKey = "all" | "estimates" | "contracts" | "acts"

const tabs: { key: TabKey; label: string }[] = [
  { key: "all", label: "Все документы" },
  { key: "estimates", label: "Сметы" },
  { key: "contracts", label: "Договоры" },
  { key: "acts", label: "Акты" },
]

const formatMoney = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " ₽"

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })

export default function Documents() {
  const { user } = useAuth()
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [objectsMap, setObjectsMap] = useState<Record<number, ObjectItem>>({})
  const [objectStatuses, setObjectStatuses] = useState<ObjectStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>("all")
  const [search, setSearch] = useState("")
  const [printingId, setPrintingId] = useState<number | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    Promise.all([estimatesApi.listAll(), contractsApi.listAll(), objectsApi.list(), objectStatusesApi.list()])
      .then(([estData, contractsData, objData, statusData]) => {
        setEstimates(estData.estimates)
        setContracts(contractsData.contracts)
        const map: Record<number, ObjectItem> = {}
        objData.objects.forEach((o) => { map[o.id] = o })
        setObjectsMap(map)
        setObjectStatuses(statusData.statuses)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id: number) => {
    await estimatesApi.remove(id)
    load()
  }

  const handleDeleteContract = async (id: number) => {
    await contractsApi.remove(id)
    load()
  }

  const handlePrint = async (est: Estimate) => {
    const obj = objectsMap[est.object_id]
    if (!obj) return
    setPrintingId(est.id)
    try {
      const full = await estimatesApi.get(est.id)
      printEstimate(full, obj, user?.company_name || "")
    } finally {
      setPrintingId(null)
    }
  }

  const handlePrintContract = (contract: Contract) => {
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>Договор № ${contract.contract_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; line-height: 1.5; color: #161616; }
            h2, h3 { color: #161616; }
            table { border-collapse: collapse; }
          </style>
        </head>
        <body>${contract.content_html}</body>
      </html>
    `)
    win.document.close()
    win.focus()
    win.print()
  }

  const handleDownloadPdf = async (est: Estimate) => {
    const obj = objectsMap[est.object_id]
    if (!obj) return
    setDownloadingId(est.id)
    try {
      const full = await estimatesApi.get(est.id)
      await downloadEstimatePdf(full, obj, user?.company_name || "")
    } finally {
      setDownloadingId(null)
    }
  }

  const filteredEstimates = useMemo(() => {
    const q = search.trim().toLowerCase()
    return estimates.filter((e) => {
      if (!q) return true
      return (
        String(e.id).includes(q) ||
        (e.object_code || "").toLowerCase().includes(q) ||
        (e.client_name || "").toLowerCase().includes(q)
      )
    })
  }, [estimates, search])

  const filteredContracts = useMemo(() => {
    const q = search.trim().toLowerCase()
    return contracts.filter((c) => {
      if (!q) return true
      return (
        c.contract_number.toLowerCase().includes(q) ||
        (c.object_code || "").toLowerCase().includes(q) ||
        (c.client_name || "").toLowerCase().includes(q)
      )
    })
  }, [contracts, search])

  const isActsTab = tab === "acts"
  const showEstimates = tab === "all" || tab === "estimates"
  const showContracts = tab === "all" || tab === "contracts"
  const hasAnyRows = (showEstimates && filteredEstimates.length > 0) || (showContracts && filteredContracts.length > 0)

  return (
    <CrmLayout title="Реестр документов" subtitle="Единый центр управления сметами, договорами подряда и актами выполненных работ вашей компании">
      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-white/10">
          <div className="flex items-center gap-1 bg-[#161616] rounded-lg p-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors",
                  tab === t.key ? "bg-[#D4AF37] text-[#161616]" : "text-white/50 hover:text-white"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по номеру, адресу, заказчику..."
              className="w-full bg-[#161616] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Icon name="Loader2" size={24} className="animate-spin text-white/40" />
          </div>
        ) : isActsTab ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
              <Icon name="FileText" size={22} className="text-white/30" />
            </div>
            <p className="text-white/50 text-sm mb-1">Актов пока нет</p>
            <p className="text-white/30 text-xs">Акты выполненных работ по объектам</p>
          </div>
        ) : !hasAnyRows ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <Icon name="FileText" size={36} className="text-white/20 mb-3" />
            <p className="text-white/50 text-sm">Документов пока нет</p>
            <p className="text-white/30 text-xs mt-1">
              {tab === "contracts"
                ? "Составьте договор на странице объекта — он появится здесь"
                : "Создайте смету на странице объекта — она появится здесь"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-[11px] uppercase border-b border-white/10">
                  <th className="text-left font-medium py-3 px-4">Тип</th>
                  <th className="text-left font-medium py-3 px-4">Документ</th>
                  <th className="text-left font-medium py-3 px-4">Дата</th>
                  <th className="text-left font-medium py-3 px-4">Объект</th>
                  <th className="text-left font-medium py-3 px-4">Заказчик</th>
                  <th className="text-left font-medium py-3 px-4">Сумма</th>
                  <th className="text-left font-medium py-3 px-4">Статус объекта</th>
                  <th className="text-left font-medium py-3 px-4">Статус</th>
                  <th className="text-left font-medium py-3 px-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {showEstimates && filteredEstimates.map((e) => {
                  const obj = objectsMap[e.object_id]
                  return (
                    <tr key={`est-${e.id}`} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                      <td className="py-3 px-4">
                        <span className="text-[#D4AF37] font-medium text-xs">Смета</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">Смета на ремонтные работы</p>
                        <p className="text-xs text-white/30">№{e.id}</p>
                      </td>
                      <td className="py-3 px-4 text-white/60">{formatDate(e.created_at)}</td>
                      <td className="py-3 px-4 text-white/60">
                        {obj?.object_code || e.object_code || "—"}
                      </td>
                      <td className="py-3 px-4 text-white/60">{e.client_name || obj?.client_name || "—"}</td>
                      <td className="py-3 px-4 font-medium">{formatMoney(e.total_amount)}</td>
                      <td className="py-3 px-4">
                        {obj?.status ? (
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs",
                            getStatusBadgeClass(objectStatuses.find((s) => s.name === obj.status)?.color)
                          )}>
                            {obj.status}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="py-3 px-4">
                        {e.has_pending ? (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-orange-500/20 text-orange-300">
                            ожидает согласования
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-300">
                            утверждена
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/cabinet/objects/${e.object_id}/estimates/${e.id}`}
                            className="text-white/40 hover:text-white transition-colors"
                            title="Просмотр"
                          >
                            <Icon name="Eye" size={15} />
                          </Link>
                          <Link
                            to={`/cabinet/objects/${e.object_id}/estimates/${e.id}/edit`}
                            className="text-white/40 hover:text-white transition-colors"
                            title="Редактировать"
                          >
                            <Icon name="Pencil" size={15} />
                          </Link>
                          <button
                            onClick={() => handlePrint(e)}
                            className="text-white/40 hover:text-white transition-colors"
                            title="Печать"
                          >
                            {printingId === e.id ? (
                              <Icon name="Loader2" size={15} className="animate-spin" />
                            ) : (
                              <Icon name="Printer" size={15} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDownloadPdf(e)}
                            className="text-white/40 hover:text-white transition-colors"
                            title="Скачать PDF"
                          >
                            {downloadingId === e.id ? (
                              <Icon name="Loader2" size={15} className="animate-spin" />
                            ) : (
                              <Icon name="Download" size={15} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(e.id)}
                            className="text-white/40 hover:text-red-400 transition-colors"
                            title="Удалить"
                          >
                            <Icon name="Trash2" size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {showContracts && filteredContracts.map((c) => {
                  const obj = objectsMap[c.object_id]
                  return (
                    <tr key={`contract-${c.id}`} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                      <td className="py-3 px-4">
                        <span className="text-blue-400 font-medium text-xs">Договор</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">Договор подряда на ремонт квартиры</p>
                        <p className="text-xs text-white/30">№ {c.contract_number}</p>
                      </td>
                      <td className="py-3 px-4 text-white/60">{formatDate(c.contract_date || c.created_at)}</td>
                      <td className="py-3 px-4 text-white/60">
                        {obj?.object_code || c.object_code || "—"}
                      </td>
                      <td className="py-3 px-4 text-white/60">{c.client_name || obj?.client_name || "—"}</td>
                      <td className="py-3 px-4 font-medium">{formatMoney(c.total_amount)}</td>
                      <td className="py-3 px-4">
                        {obj?.status ? (
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs",
                            getStatusBadgeClass(objectStatuses.find((s) => s.name === obj.status)?.color)
                          )}>
                            {obj.status}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs",
                          c.status === "signed" ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/50"
                        )}>
                          {c.status === "signed" ? "подписан" : "черновик"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/cabinet/objects/${c.object_id}/contracts/${c.id}`}
                            className="text-white/40 hover:text-[#D4AF37] transition-colors"
                            title="Просмотр"
                          >
                            <Icon name="Eye" size={15} />
                          </Link>
                          <Link
                            to={`/cabinet/objects/${c.object_id}/contracts/${c.id}/edit`}
                            className="text-white/40 hover:text-white transition-colors"
                            title="Редактировать"
                          >
                            <Icon name="Pencil" size={15} />
                          </Link>
                          <button
                            onClick={() => handlePrintContract(c)}
                            className="text-white/40 hover:text-white transition-colors"
                            title="Печать"
                          >
                            <Icon name="Printer" size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteContract(c.id)}
                            className="text-white/40 hover:text-red-400 transition-colors"
                            title="Удалить"
                          >
                            <Icon name="Trash2" size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CrmLayout>
  )
}