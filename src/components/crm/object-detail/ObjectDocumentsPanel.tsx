import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { Contract, Estimate, ObjectItem } from "@/lib/api"
import { ObjectMaterialEstimates } from "@/components/crm/ObjectMaterialEstimates"
import { DeleteButton } from "@/components/ui/delete-button"
import { getEstimateStatusColor, getEstimateStatusLabel } from "@/lib/estimateStatus"
import { formatMoney } from "./utils"

interface ObjectDocumentsPanelProps {
  object: ObjectItem
  isClient: boolean
  estimates: Estimate[]
  estimatesLoading: boolean
  contracts: Contract[]
  contractsLoading: boolean
  printingId: number | null
  onCreateContract: () => void
  onPrintEstimate: (estimateId: number) => void
  onDeleteEstimate: (estimateId: number) => void
  onPrintContract: (contract: Contract) => void
  onDeleteContract: (contractId: number) => void
}

export function ObjectDocumentsPanel({
  object,
  isClient,
  estimates,
  estimatesLoading,
  contracts,
  contractsLoading,
  printingId,
  onCreateContract,
  onPrintEstimate,
  onDeleteEstimate,
  onPrintContract,
  onDeleteContract,
}: ObjectDocumentsPanelProps) {
  return (
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
              onClick={onCreateContract}
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
                  onClick={() => onPrintEstimate(est.id)}
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
                  <DeleteButton onConfirm={() => onDeleteEstimate(est.id)} />
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
                  onClick={() => onPrintContract(c)}
                  className="text-white/40 hover:text-white transition-colors"
                  title="Печать"
                >
                  <Icon name="Printer" size={15} />
                </button>
                {!isClient && (
                  <DeleteButton onConfirm={() => onDeleteContract(c.id)} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ObjectDocumentsPanel
