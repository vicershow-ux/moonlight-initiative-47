import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { objectsApi, objectStatusesApi, estimatesApi, objectRoomsApi, contractsApi, materialsApi, Estimate, ObjectItem, ObjectRoom, ObjectStatus, Contract } from "@/lib/api"
import { EstimatesListModal } from "@/components/crm/EstimatesListModal"
import { ObjectMaterialEstimates } from "@/components/crm/ObjectMaterialEstimates"
import { ObjectFilesCard } from "@/components/crm/ObjectFilesCard"
import { CreateContractModal } from "@/components/crm/CreateContractModal"
import { printEstimate } from "@/lib/printEstimate"
import { getEstimateStatusColor, getEstimateStatusLabel } from "@/lib/estimateStatus"
import { getStatusBadgeClass } from "@/lib/objectStatusColors"
import { useAuth } from "@/contexts/AuthContext"
import { DeleteButton } from "@/components/ui/delete-button"

const formatMoney = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " ₽"

const formatDateTime = (d: string) =>
  new Date(d).toLocaleString("ru-RU", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })

const yesNo = (v: boolean) => (v ? "Да" : "Нет")

const capitalizeFirst = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

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
          </style>
        </head>
        <body>${contract.content_html}</body>
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

      <div className="flex items-center justify-between mb-6 -mt-2">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">{object.object_code}</h2>
          <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeClass(statuses.find((s) => s.name === object.status)?.color)}`}>
            {object.status}
          </span>
        </div>
        {!isClient && (
          <div className="flex items-center gap-2">
            <Link
              to={`/cabinet/objects/${object.id}/rooms`}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm px-4 py-2.5 rounded-lg"
            >
              <Icon name="DoorOpen" size={16} />
              Помещения
            </Link>
            <Link
              to={`/cabinet/objects/${object.id}/edit`}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors text-white text-sm px-4 py-2.5 rounded-lg"
            >
              <Icon name="Pencil" size={16} />
              Редактировать
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
            <p className="font-medium mb-4">Информация о заказчике</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-white/40 mb-1">ФИО / Организация</p>
                <p className="font-medium">{object.client_name}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Правовой статус</p>
                <p className="font-medium">{capitalizeFirst(object.legal_status)}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Телефон</p>
                <p className="font-medium">{object.client_phone || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Email</p>
                <p className="font-medium text-[#D4AF37]">{object.email || "—"}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
            <p className="font-medium mb-4">Параметры объекта</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-white/40 mb-1">Тип объекта</p>
                <p className="font-medium">{object.object_type}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Площадь</p>
                <p className="font-medium">{object.area} м²</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-white/40 mb-1">Адрес объекта</p>
                <p className="font-medium">{object.address || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Тип оплаты</p>
                <p className="font-medium">{capitalizeFirst(object.payment_type)}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Проживание на объекте</p>
                <p className="font-medium">{yesNo(object.residence_during_works)}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Наличие лифта</p>
                <p className="font-medium">{capitalizeFirst(object.has_elevator) || "Не указано"}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Разгрузка материала</p>
                <p className="font-medium">{capitalizeFirst(object.material_unloading) || "Не указано"}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Комплектация</p>
                <p className="font-medium">{capitalizeFirst(object.completion_type)}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Отказ от гарантии</p>
                <p className={`font-medium ${object.warranty_waiver ? "text-red-400" : "text-green-400"}`}>
                  {yesNo(object.warranty_waiver)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
            <p className="font-medium mb-4">Материалы и мебель</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-white/40 mb-1">Черновой материал</p>
                <p className="font-medium">{capitalizeFirst(object.rough_material) || "Не указано"}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Чистовой материал</p>
                <p className="font-medium">{capitalizeFirst(object.finish_material) || "Не указано"}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Кухня и мебель</p>
                <p className="font-medium">{capitalizeFirst(object.kitchen_furniture) || "Не указано"}</p>
              </div>
            </div>
          </div>

          {object.measurer_comment && (
            <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
              <p className="font-medium mb-3">Комментарий замерщика</p>
              <p className="text-sm text-white/60 whitespace-pre-wrap">{object.measurer_comment}</p>
            </div>
          )}

          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
            <p className="font-medium mb-3">Дизайн-проект</p>
            {object.design_project ? (
              <div className="flex flex-wrap gap-2">
                {(() => {
                  try {
                    const list = JSON.parse(object.design_project) as string[]
                    return list.map((dp) => (
                      <span key={dp} className="inline-block px-3 py-1.5 rounded-lg text-sm bg-blue-500/15 text-blue-300">
                        {dp}
                      </span>
                    ))
                  } catch {
                    return (
                      <span className="inline-block px-3 py-1.5 rounded-lg text-sm bg-blue-500/15 text-blue-300">
                        {object.design_project}
                      </span>
                    )
                  }
                })()}
              </div>
            ) : (
              <p className="text-sm text-white/30">Не выбрано</p>
            )}
          </div>

          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium">Эталонные помещения</p>
              <Link
                to={`/cabinet/objects/${object.id}/rooms`}
                className="text-sm text-[#D4AF37] hover:text-[#B8860B] transition-colors"
              >
                Управлять
              </Link>
            </div>
            {roomsLoading ? (
              <div className="flex justify-center py-6">
                <Icon name="Loader2" size={18} className="animate-spin text-white/40" />
              </div>
            ) : rooms.length === 0 ? (
              <p className="text-sm text-white/30">Помещений пока нет</p>
            ) : (
              <div className="flex flex-col gap-2">
                {rooms.map((room) => (
                  <div key={room.id} className="bg-[#161616] border border-white/10 rounded-lg p-4">
                    <p className="text-sm font-medium">{room.name}</p>
                    <p className="text-xs text-white/30 mt-1">
                      {room.room_type && `${room.room_type} · `}
                      {room.area} м² · {room.perimeter} м/п
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-medium">Документы объекта</p>
              {!isClient && (
                <div className="flex items-center gap-2">
                  <Link
                    to={`/cabinet/objects/${object.id}/estimates/new`}
                    className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-3 py-2 rounded-lg"
                  >
                    <Icon name="Plus" size={14} />
                    Создать смету
                  </Link>
                  <button
                    onClick={() => setCreateContractOpen(true)}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm px-3 py-2 rounded-lg"
                  >
                    <Icon name="FileSignature" size={14} />
                    Составить договор
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-white/40 uppercase tracking-wide mb-2">Сметы на работу</p>
            {estimatesLoading ? (
              <div className="flex justify-center py-8">
                <Icon name="Loader2" size={20} className="animate-spin text-white/40" />
              </div>
            ) : estimates.length === 0 ? (
              <div className="text-center py-8 text-white/30 text-sm">
                По этому объекту ещё нет смет
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {estimates.map((est) => (
                  <div key={est.id} className="bg-[#161616] border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">Смета №{est.id} (ред. №{est.revision_number ?? 1})</p>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getEstimateStatusColor(est.status)}`}>
                          {getEstimateStatusLabel(est.status)}
                        </span>
                        {est.has_pending && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-orange-500/20 text-orange-300">Ожидает согласования</span>
                        )}
                      </div>
                    </div>
                    <p className="text-lg font-semibold mb-2">{formatMoney(est.total_amount)}</p>
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/cabinet/objects/${object.id}/estimates/${est.id}`}
                        className="text-white/40 hover:text-white transition-colors"
                        title="Просмотр"
                      >
                        <Icon name="Eye" size={15} />
                      </Link>
                      {!isClient && (
                        <Link
                          to={`/cabinet/objects/${object.id}/estimates/${est.id}/edit`}
                          className="text-white/40 hover:text-white transition-colors"
                          title="Редактировать"
                        >
                          <Icon name="Pencil" size={15} />
                        </Link>
                      )}
                      <button
                        onClick={() => handlePrint(est.id)}
                        className="text-white/40 hover:text-white transition-colors"
                        title="Печать"
                      >
                        {printingId === est.id ? (
                          <Icon name="Loader2" size={15} className="animate-spin" />
                        ) : (
                          <Icon name="Printer" size={15} />
                        )}
                      </button>
                      {!isClient && (
                        <DeleteButton onConfirm={() => handleDeleteEstimate(est.id)} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-white/40 uppercase tracking-wide mb-2 mt-6">Сметы на материал</p>
            <ObjectMaterialEstimates objectId={object.id} isClient={isClient} />

            <p className="text-xs text-white/40 uppercase tracking-wide mb-2 mt-6">Договоры</p>
            {contractsLoading ? (
              <div className="flex justify-center py-8">
                <Icon name="Loader2" size={20} className="animate-spin text-white/40" />
              </div>
            ) : contracts.length === 0 ? (
              <div className="text-center py-8 text-white/30 text-sm">
                По этому объекту ещё нет договоров
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {contracts.map((c) => (
                  <div key={c.id} className="bg-[#161616] border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">Договор № {c.contract_number}</p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          c.status === "signed" ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/50"
                        }`}
                      >
                        {c.status === "signed" ? "Подписан" : "Черновик"}
                      </span>
                    </div>
                    <p className="text-lg font-semibold mb-2">{formatMoney(c.total_amount)}</p>
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/cabinet/objects/${object.id}/contracts/${c.id}`}
                        className="text-white/40 hover:text-[#D4AF37] transition-colors"
                        title="Просмотр"
                      >
                        <Icon name="Eye" size={15} />
                      </Link>
                      {!isClient && (
                        <Link
                          to={`/cabinet/objects/${object.id}/contracts/${c.id}/edit`}
                          className="text-white/40 hover:text-white transition-colors"
                          title="Редактировать"
                        >
                          <Icon name="Pencil" size={15} />
                        </Link>
                      )}
                      <button
                        onClick={() => handlePrintContract(c)}
                        className="text-white/40 hover:text-white transition-colors"
                        title="Печать"
                      >
                        <Icon name="Printer" size={15} />
                      </button>
                      {!isClient && (
                        <DeleteButton onConfirm={() => handleDeleteContract(c.id)} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
            <p className="font-medium mb-4">Стоимость проекта</p>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/50">Работы</span>
                <span className="font-medium">{formatMoney(worksTotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Материалы</span>
                <span className="font-medium">{formatMoney(materialsTotal)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-white/70">Итого</span>
                <span className="text-lg font-semibold text-[#D4AF37]">
                  {formatMoney(worksTotal + materialsTotal)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
            <p className="font-medium mb-4">Информация</p>
            <div className="flex flex-col gap-3 text-sm">
              <div>
                <p className="text-xs text-white/40 mb-1">Создал</p>
                <p className="font-medium">{user?.full_name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Дата создания</p>
                <p className="font-medium">{formatDateTime(object.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Последнее обновление</p>
                <p className="font-medium">{formatDateTime(object.updated_at)}</p>
              </div>
            </div>
          </div>

          <ObjectFilesCard objectId={object.id} />
        </div>
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