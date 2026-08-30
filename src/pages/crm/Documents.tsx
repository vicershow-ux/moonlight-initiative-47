import { useEffect, useMemo, useState } from "react"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { estimatesApi, objectsApi, objectStatusesApi, contractsApi, actsApi, materialsApi, Estimate, ObjectItem, ObjectStatus, Contract, Act, MaterialEstimate } from "@/lib/api"
import { printMaterials, downloadMaterialsPdf } from "@/lib/printMaterials"
import { printEstimate, downloadEstimatePdf } from "@/lib/printEstimate"
import { downloadContractPdf } from "@/lib/downloadContractPdf"
import { docBrandHeader, docBrandStyles } from "@/lib/docBrandHeader"
import { useAuth } from "@/contexts/AuthContext"
import { DocumentsToolbar } from "@/components/crm/documents/DocumentsToolbar"
import { DocumentEstimateRow, DocumentMatEstimateRow } from "@/components/crm/documents/DocumentEstimateRows"
import { DocumentContractRow, DocumentActRow } from "@/components/crm/documents/DocumentContractRows"
import { TabKey } from "@/components/crm/documents/constants"
import { DocumentMobileCard } from "@/components/crm/documents/DocumentMobileCard"
import { DeleteButton } from "@/components/ui/delete-button"

export default function Documents() {
  const { user } = useAuth()
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [acts, setActs] = useState<Act[]>([])
  const [matEstimates, setMatEstimates] = useState<MaterialEstimate[]>([])
  const [matBusyId, setMatBusyId] = useState<number | null>(null)
  const [objectsMap, setObjectsMap] = useState<Record<number, ObjectItem>>({})
  const [objectStatuses, setObjectStatuses] = useState<ObjectStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>("all")
  const [search, setSearch] = useState("")
  const [printingId, setPrintingId] = useState<number | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [downloadingContractId, setDownloadingContractId] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    Promise.all([estimatesApi.listAll(), contractsApi.listAll(), actsApi.listAll(), objectsApi.list(), objectStatusesApi.list(), materialsApi.list()])
      .then(([estData, contractsData, actsData, objData, statusData, matData]) => {
        setEstimates(estData.estimates)
        setContracts(contractsData.contracts)
        setActs(actsData.acts)
        setMatEstimates(matData.estimates || [])
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

  const handleDeleteAct = async (id: number) => {
    await actsApi.remove(id)
    load()
  }

  const handleDownloadActPdf = async (act: Act) => {
    setDownloadingContractId(-act.id)
    try {
      await downloadContractPdf(act.content_html, `Акт ${act.act_number}`)
    } finally {
      setDownloadingContractId(null)
    }
  }

  const handlePrintAct = (act: Act) => {
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>Акт № ${act.act_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; line-height: 1.5; color: #161616; }
            table { border-collapse: collapse; }
            ${docBrandStyles}
          </style>
        </head>
        <body>${docBrandHeader(`Акт № ${act.act_number}`)}${act.content_html}</body>
      </html>
    `)
    win.document.close()
    win.focus()
    win.print()
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
            ${docBrandStyles}
          </style>
        </head>
        <body>${docBrandHeader(`Договор № ${contract.contract_number}`)}${contract.content_html}</body>
      </html>
    `)
    win.document.close()
    win.focus()
    win.print()
  }

  const handleDownloadContractPdf = async (contract: Contract) => {
    setDownloadingContractId(contract.id)
    try {
      await downloadContractPdf(contract.content_html, contract.contract_number)
    } finally {
      setDownloadingContractId(null)
    }
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

  const filteredMatEstimates = useMemo(() => {
    const q = search.trim().toLowerCase()
    return matEstimates.filter((m) => {
      if (!q) return true
      return (
        String(m.id).includes(q) ||
        (m.object_code || "").toLowerCase().includes(q) ||
        (m.client_name || "").toLowerCase().includes(q)
      )
    })
  }, [matEstimates, search])

  const handleDeleteMatEstimate = async (id: number) => {
    await materialsApi.removeEstimate(id)
    load()
  }

  const openMatEstimate = async (m: MaterialEstimate, mode: "print" | "pdf") => {
    setMatBusyId(m.id)
    try {
      const { estimate } = await materialsApi.getEstimate(m.id)
      const obj = {
        id: estimate.object_id,
        object_code: estimate.object_code,
        client_name: estimate.client_name,
        address: estimate.address || "",
      }
      const items = estimate.items || []
      if (mode === "print") printMaterials(obj, items, [], user?.company_name || "")
      else await downloadMaterialsPdf(obj, items, [], user?.company_name || "")
    } finally {
      setMatBusyId(null)
    }
  }

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

  const filteredActs = useMemo(() => {
    const q = search.trim().toLowerCase()
    return acts.filter((a) => {
      if (!q) return true
      return (
        a.act_number.toLowerCase().includes(q) ||
        (a.object_code || "").toLowerCase().includes(q) ||
        (a.client_name || "").toLowerCase().includes(q)
      )
    })
  }, [acts, search])

  const showEstimates = tab === "all" || tab === "estimates"
  const showMatEstimates = tab === "all" || tab === "material_estimates"
  const showContracts = tab === "all" || tab === "contracts"
  const showActs = tab === "all" || tab === "acts"
  const hasAnyRows =
    (showEstimates && filteredEstimates.length > 0) ||
    (showMatEstimates && filteredMatEstimates.length > 0) ||
    (showContracts && filteredContracts.length > 0) ||
    (showActs && filteredActs.length > 0)

  return (
    <CrmLayout title="Реестр документов" subtitle="Единый центр управления сметами, договорами подряда и актами выполненных работ вашей компании">
      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl overflow-hidden">
        <DocumentsToolbar
          tab={tab}
          setTab={setTab}
          search={search}
          setSearch={setSearch}
        />

        {loading ? (
          <div className="flex justify-center py-16">
            <Icon name="Loader2" size={24} className="animate-spin text-white/40" />
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
          <>
          <div className="md:hidden flex flex-col gap-3">
            {showEstimates && filteredEstimates.map((e) => (
              <DocumentMobileCard
                key={`m-est-${e.id}`}
                kind="Смета на работу"
                kindClass="text-[#D4AF37]"
                title="Смета на ремонтные работы"
                subtitle={`№${e.id}`}
                createdAt={e.created_at}
                amount={Number(e.total_amount)}
                obj={objectsMap[e.object_id]}
                objectCode={e.object_code}
                clientName={e.client_name}
                objectStatuses={objectStatuses}
                statusBadge={
                  e.has_pending ? (
                    <span className="px-2 py-1 rounded-full text-[11px] bg-orange-500/20 text-orange-300">ожидает</span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-[11px] bg-green-500/20 text-green-300">утверждена</span>
                  )
                }
                viewTo={`/cabinet/objects/${e.object_id}/estimates/${e.id}`}
                editTo={`/cabinet/objects/${e.object_id}/estimates/${e.id}/edit`}
                onPrint={() => handlePrint(e)}
                onDownload={() => handleDownloadPdf(e)}
                printing={printingId === e.id}
                downloading={downloadingId === e.id}
                deleteButton={<DeleteButton onConfirm={() => handleDelete(e.id)} />}
              />
            ))}

            {showMatEstimates && filteredMatEstimates.map((m) => (
              <DocumentMobileCard
                key={`m-mat-${m.id}`}
                kind="Смета на материал"
                kindClass="text-[#B49AE5]"
                title={m.title}
                subtitle={`№${m.id}${m.room_names ? ` · ${m.room_names}` : ""}`}
                createdAt={m.created_at}
                amount={Number(m.total_amount)}
                obj={objectsMap[m.object_id]}
                objectCode={m.object_code}
                clientName={m.client_name}
                objectStatuses={objectStatuses}
                statusBadge={
                  <span className="px-2 py-1 rounded-full text-[11px] bg-green-500/20 text-green-300">сохранена</span>
                }
                viewTo="/cabinet/materials"
                onPrint={() => openMatEstimate(m, "print")}
                onDownload={() => openMatEstimate(m, "pdf")}
                printing={matBusyId === m.id}
                deleteButton={<DeleteButton onConfirm={() => handleDeleteMatEstimate(m.id)} />}
              />
            ))}

            {showContracts && filteredContracts.map((c) => (
              <DocumentMobileCard
                key={`m-con-${c.id}`}
                kind="Договор"
                kindClass="text-blue-400"
                title="Договор подряда на ремонт"
                subtitle={`№ ${c.contract_number}`}
                createdAt={c.contract_date || c.created_at}
                amount={Number(c.total_amount)}
                obj={objectsMap[c.object_id]}
                objectCode={c.object_code}
                clientName={c.client_name}
                objectStatuses={objectStatuses}
                statusBadge={
                  <span className={`px-2 py-1 rounded-full text-[11px] ${c.status === "signed" ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/50"}`}>
                    {c.status === "signed" ? "подписан" : "черновик"}
                  </span>
                }
                viewTo={`/cabinet/objects/${c.object_id}/contracts/${c.id}`}
                editTo={`/cabinet/objects/${c.object_id}/contracts/${c.id}/edit`}
                onPrint={() => handlePrintContract(c)}
                onDownload={() => handleDownloadContractPdf(c)}
                downloading={downloadingContractId === c.id}
                deleteButton={<DeleteButton onConfirm={() => handleDeleteContract(c.id)} />}
              />
            ))}

            {showActs && filteredActs.map((a) => (
              <DocumentMobileCard
                key={`m-act-${a.id}`}
                kind="Акт"
                kindClass="text-purple-400"
                title="Акт выполненных работ"
                subtitle={`№ ${a.act_number}`}
                createdAt={a.act_date || a.created_at}
                amount={Number(a.total_amount)}
                obj={objectsMap[a.object_id]}
                objectCode={a.object_code}
                clientName={a.client_name}
                objectStatuses={objectStatuses}
                statusBadge={
                  <span className={`px-2 py-1 rounded-full text-[11px] ${a.status === "signed" ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/50"}`}>
                    {a.status === "signed" ? "подписан" : "черновик"}
                  </span>
                }
                viewTo={`/cabinet/objects/${a.object_id}/acts/${a.id}`}
                editTo={`/cabinet/objects/${a.object_id}/acts/${a.id}/edit`}
                onPrint={() => handlePrintAct(a)}
                onDownload={() => handleDownloadActPdf(a)}
                downloading={downloadingContractId === a.id}
                deleteButton={<DeleteButton onConfirm={() => handleDeleteAct(a.id)} />}
              />
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
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
                {showEstimates && filteredEstimates.map((e) => (
                  <DocumentEstimateRow
                    key={`est-${e.id}`}
                    e={e}
                    obj={objectsMap[e.object_id]}
                    objectStatuses={objectStatuses}
                    printingId={printingId}
                    downloadingId={downloadingId}
                    handlePrint={handlePrint}
                    handleDownloadPdf={handleDownloadPdf}
                    handleDelete={handleDelete}
                  />
                ))}

                {showMatEstimates && filteredMatEstimates.map((m) => (
                  <DocumentMatEstimateRow
                    key={`matest-${m.id}`}
                    m={m}
                    obj={objectsMap[m.object_id]}
                    objectStatuses={objectStatuses}
                    matBusyId={matBusyId}
                    openMatEstimate={openMatEstimate}
                    handleDeleteMatEstimate={handleDeleteMatEstimate}
                  />
                ))}

                {showContracts && filteredContracts.map((c) => (
                  <DocumentContractRow
                    key={`contract-${c.id}`}
                    c={c}
                    obj={objectsMap[c.object_id]}
                    objectStatuses={objectStatuses}
                    downloadingContractId={downloadingContractId}
                    handlePrintContract={handlePrintContract}
                    handleDownloadContractPdf={handleDownloadContractPdf}
                    handleDeleteContract={handleDeleteContract}
                  />
                ))}

                {showActs && filteredActs.map((a) => (
                  <DocumentActRow
                    key={`act-${a.id}`}
                    a={a}
                    obj={objectsMap[a.object_id]}
                    objectStatuses={objectStatuses}
                    downloadingContractId={downloadingContractId}
                    handlePrintAct={handlePrintAct}
                    handleDownloadActPdf={handleDownloadActPdf}
                    handleDeleteAct={handleDeleteAct}
                  />
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>
    </CrmLayout>
  )
}