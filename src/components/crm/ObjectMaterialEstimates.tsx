import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { materialsApi, MaterialEstimate } from "@/lib/api"
import { printMaterials, downloadMaterialsPdf, materialsPdfBase64 } from "@/lib/printMaterials"
import { SendDocEmailDialog } from "@/components/crm/SendDocEmailDialog"
import { useAuth } from "@/contexts/AuthContext"
import { DeleteButton } from "@/components/ui/delete-button"

const formatMoney = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Number(n) || 0) + " ₽"

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })

interface Props {
  objectId: number
  isClient?: boolean
}

export function ObjectMaterialEstimates({ objectId, isClient }: Props) {
  const { user } = useAuth()
  const [estimates, setEstimates] = useState<MaterialEstimate[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [sendFor, setSendFor] = useState<MaterialEstimate | null>(null)

  const load = () => {
    setLoading(true)
    materialsApi
      .list()
      .then((d) => setEstimates((d.estimates || []).filter((e) => e.object_id === objectId)))
      .finally(() => setLoading(false))
  }

  useEffect(load, [objectId])

  const loadDoc = async (id: number) => {
    const { estimate } = await materialsApi.getEstimate(id)
    const obj = {
      id: estimate.object_id,
      object_code: estimate.object_code,
      client_name: estimate.client_name,
      address: estimate.address || "",
    }
    return { obj, items: estimate.items || [] }
  }

  const openDoc = async (m: MaterialEstimate, mode: "print" | "pdf") => {
    setBusyId(m.id)
    try {
      const { obj, items } = await loadDoc(m.id)
      if (mode === "print") printMaterials(obj, items, [], user?.company_name || "", false, m.title)
      else await downloadMaterialsPdf(obj, items, [], user?.company_name || "", m.title)
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (id: number) => {
    await materialsApi.removeEstimate(id)
    load()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Icon name="Loader2" size={20} className="animate-spin text-white/40" />
      </div>
    )
  }

  if (estimates.length === 0) {
    return (
      <div className="text-center py-8 text-white/30 text-sm">
        По этому объекту ещё нет смет на материал
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {estimates.map((m) => (
        <div key={m.id} className="bg-[#161616] border border-white/10 rounded-lg p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <p className="text-sm font-medium">
              {m.title} №{m.id}
            </p>
            <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-300">
              Сохранена
            </span>
          </div>
          <p className="text-xs text-white/30 mb-2">
            {formatDate(m.created_at)}
            {m.room_names ? ` · ${m.room_names}` : ""}
          </p>
          <p className="text-lg font-semibold mb-2">{formatMoney(m.total_amount)}</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => openDoc(m, "print")}
              className="text-white/40 hover:text-white transition-colors"
              title="Печать"
            >
              {busyId === m.id ? (
                <Icon name="Loader2" size={15} className="animate-spin" />
              ) : (
                <Icon name="Printer" size={15} />
              )}
            </button>
            <button
              onClick={() => openDoc(m, "pdf")}
              className="text-white/40 hover:text-white transition-colors"
              title="Скачать PDF"
            >
              <Icon name="Download" size={15} />
            </button>
            {!isClient && (
              <button
                onClick={() => setSendFor(m)}
                className="text-white/40 hover:text-white transition-colors"
                title="Отправить заказчику на почту"
              >
                <Icon name="Mail" size={15} />
              </button>
            )}
            {!isClient && (
              <DeleteButton onConfirm={() => remove(m.id)} />
            )}
          </div>
        </div>
      ))}
      {sendFor && (
        <SendDocEmailDialog
          open={!!sendFor}
          onOpenChange={(v) => !v && setSendFor(null)}
          docName="смету на материалы"
          objectId={objectId}
          fileName={`Смета_материалы_${sendFor.id}.pdf`}
          makePdf={async () => {
            const { obj, items } = await loadDoc(sendFor.id)
            return materialsPdfBase64(obj, items, [], user?.company_name || "", sendFor.title)
          }}
          send={(p) => materialsApi.sendEstimateEmail(sendFor.id, p)}
        />
      )}
    </div>
  )
}

export default ObjectMaterialEstimates
