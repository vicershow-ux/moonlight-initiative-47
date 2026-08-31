import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { objectsApi, objectStatusesApi, estimatesApi, objectRoomsApi, contractsApi, materialsApi, Estimate, ObjectItem, ObjectRoom, ObjectStatus, Contract } from "@/lib/api"
import { EstimatesListModal } from "@/components/crm/EstimatesListModal"
import { CreateContractModal } from "@/components/crm/CreateContractModal"
import { ObjectInfoPanels } from "@/components/crm/object-detail/ObjectInfoPanels"
import { ObjectDocumentsPanel } from "@/components/crm/object-detail/ObjectDocumentsPanel"
import { ObjectSidebar } from "@/components/crm/object-detail/ObjectSidebar"
import { formatDateTime } from "@/components/crm/object-detail/utils"
import { printEstimate } from "@/lib/printEstimate"
import { docBrandHeader, docBrandStyles } from "@/lib/docBrandHeader"
import { getStatusBadgeClass } from "@/lib/objectStatusColors"
import { useAuth } from "@/contexts/AuthContext"

export default function ObjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isClient = user?.role === "client"

  const [object, setObject] = useState<ObjectItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [estimatesLoading, setEstimatesLoading] = useState(true)
  const [printingId, setPrintingId] = useState<number | null>(null)
  const [rooms, setRooms] = useState<ObjectRoom[]>([])
  const [roomsLoading, setRoomsLoading] = useState(true)
  const [statuses, setStatuses] = useState<ObjectStatus[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [contractsLoading, setContractsLoading] = useState(true)
  const [materialsTotal, setMaterialsTotal] = useState(0)

  const [estimatesListOpen, setEstimatesListOpen] = useState(false)
  const [createContractOpen, setCreateContractOpen] = useState(false)

  const loadMaterialsTotal = () => {
    if (!id) return
    materialsApi.list().then((d) => {
      const sum = (d.object_materials || [])
        .filter((m) => m.object_id === Number(id))
        .reduce((acc, m) => acc + Number(m.qty || 0) * Number(m.price || 0), 0)
      setMaterialsTotal(sum)
    })
  }

  const load = () => {
    if (!id) return
    setLoading(true)
    objectsApi
      .get(Number(id))
      .then(setObject)
      .catch(() => navigate("/cabinet/objects"))
      .finally(() => setLoading(false))
    objectStatusesApi.list().then((data) => setStatuses(data.statuses))
  }

  const loadEstimates = () => {
    if (!id) return
    setEstimatesLoading(true)
    estimatesApi
      .listByObject(Number(id))
      .then((data) => setEstimates(data.estimates))
      .finally(() => setEstimatesLoading(false))
  }

  const loadRooms = () => {
    if (!id) return
    setRoomsLoading(true)
    objectRoomsApi
      .listByObject(Number(id))
      .then((data) => setRooms(data.rooms))
      .finally(() => setRoomsLoading(false))
  }

  const loadContracts = () => {
    if (!id) return
    setContractsLoading(true)
    contractsApi
      .listByObject(Number(id))
      .then((data) => setContracts(data.contracts))
      .finally(() => setContractsLoading(false))
  }

  useEffect(() => {
    load()
    loadEstimates()
    loadRooms()
    loadContracts()
    loadMaterialsTotal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const worksTotal = estimates.reduce((s, e) => s + Number(e.total_amount || 0), 0)

  const handlePrint = async (estimateId: number) => {
    if (!object) return
    setPrintingId(estimateId)
    try {
      const full = await estimatesApi.get(estimateId)
      printEstimate(full, object, user?.company_name || "")
    } finally {
      setPrintingId(null)
    }
  }

  const handleDeleteEstimate = async (estimateId: number) => {
    await estimatesApi.remove(estimateId)
    setEstimates((prev) => prev.filter((e) => e.id !== estimateId))
  }

  const handleDeleteContract = async (contractId: number) => {
    await contractsApi.remove(contractId)
    setContracts((prev) => prev.filter((c) => c.id !== contractId))
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

  if (loading || !object) {
    return (
      <CrmLayout title="Объект">
        <div className="flex items-center justify-center py-24">
          <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
        </div>
      </CrmLayout>
    )
  }

  return (
    <CrmLayout title={object.object_code} subtitle={`Создан ${formatDateTime(object.created_at)}`}>
      <Link
        to="/cabinet/objects"
        className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors mb-4"
      >
        <Icon name="ChevronLeft" size={16} />
        Назад к списку
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 -mt-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{object.object_code}</h2>
          <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeClass(statuses.find((s) => s.name === object.status)?.color)}`}>
            {object.status}
          </span>
        </div>
        {!isClient && (
          <div className="flex items-center gap-2">
            <Link
              to={`/cabinet/objects/${object.id}/planner`}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 min-h-[44px] rounded-lg"
            >
              <Icon name="PenLine" size={16} />
              Планировщик
            </Link>
            <Link
              to={`/cabinet/objects/${object.id}/rooms`}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm px-4 min-h-[44px] rounded-lg"
            >
              <Icon name="DoorOpen" size={16} />
              Помещения
            </Link>
            <Link
              to={`/cabinet/objects/${object.id}/edit`}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 transition-colors text-white text-sm px-4 min-h-[44px] rounded-lg"
            >
              <Icon name="Pencil" size={16} />
              Редактировать
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <ObjectInfoPanels
            object={object}
            rooms={rooms}
            roomsLoading={roomsLoading}
          />

          <ObjectDocumentsPanel
            object={object}
            isClient={isClient}
            estimates={estimates}
            estimatesLoading={estimatesLoading}
            contracts={contracts}
            contractsLoading={contractsLoading}
            printingId={printingId}
            onCreateContract={() => setCreateContractOpen(true)}
            onPrintEstimate={handlePrint}
            onDeleteEstimate={handleDeleteEstimate}
            onPrintContract={handlePrintContract}
            onDeleteContract={handleDeleteContract}
          />
        </div>

        <ObjectSidebar
          object={object}
          worksTotal={worksTotal}
          materialsTotal={materialsTotal}
          userFullName={user?.full_name}
        />
      </div>

      <EstimatesListModal
        open={estimatesListOpen}
        onOpenChange={setEstimatesListOpen}
        object={object}
      />
      <CreateContractModal
        open={createContractOpen}
        onOpenChange={setCreateContractOpen}
        object={object}
      />
    </CrmLayout>
  )
}