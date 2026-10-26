import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { contractsApi, Contract } from "@/lib/api"
import { downloadContractPdf } from "@/lib/downloadContractPdf"
import { docBrandHeader, docBrandStyles } from "@/lib/docBrandHeader"
import { printHtml } from "@/lib/printHtml"
import { contractTitle, titleFromHtml } from "@/lib/contractSubject"
import { SendContractEmailDialog } from "@/components/crm/SendContractEmailDialog"
import { useAuth } from "@/contexts/AuthContext"
import { ContractAddendaList } from "@/components/crm/ContractAddendaList"
import { DocSignBar } from "@/components/crm/DocSignBar"
import { ContractPaymentsCard } from "@/components/crm/executors/ContractPaymentsCard"

export default function ContractView() {
  const { id, contractId } = useParams()
  const navigate = useNavigate()
  const objectId = Number(id)
  const { user } = useAuth()
  const isClient = user?.role === "client"

  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)

  const reload = () => {
    if (contractId) contractsApi.get(Number(contractId)).then(setContract)
  }

  useEffect(() => {
    if (!contractId) return
    setLoading(true)
    contractsApi
      .get(Number(contractId))
      .then(setContract)
      .catch(() => navigate(isClient ? `/cabinet/objects/${objectId}` : "/cabinet/documents"))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId])

  const handlePrint = () => {
    if (!contract) return
    printHtml(`Договор № ${contract.contract_number}`, `${docBrandHeader("")}${contract.content_html}`, docBrandStyles)
  }

  const handleDownload = async () => {
    if (!contract) return
    setDownloading(true)
    try {
      await downloadContractPdf(contract.content_html, contract.contract_number)
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <CrmLayout title="Договор">
        <div className="flex items-center justify-center py-24">
          <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
        </div>
      </CrmLayout>
    )
  }

  if (!contract) return null
  const docTitle = contract.options?.work_subject
    ? contractTitle(contract.options.work_subject)
    : titleFromHtml(contract.content_html) || contractTitle()

  return (
    <CrmLayout
      title={`${docTitle} № ${contract.contract_number}`}
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <Link
          to={isClient ? `/cabinet/objects/${objectId}` : "/cabinet/documents"}
          className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
        >
          <Icon name="ChevronLeft" size={16} />
          {isClient ? "К объекту" : "К документам"}
        </Link>

        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:items-center sm:w-auto">
          <span className={cn(
            "col-span-2 justify-self-start px-2.5 py-1 rounded-full text-xs font-medium",
            contract.status === "signed" ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/50"
          )}>
            {contract.status === "signed" ? "подписан" : "черновик"}
          </span>
          {!isClient && (<>
          {!contract.signed_at && (
          <Link
            to={`/cabinet/objects/${objectId}/contracts/${contract.id}/edit`}
            className="flex items-center justify-center min-h-[44px] sm:min-h-0 gap-1.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm px-3 py-2 rounded-lg"
          >
            <Icon name="Pencil" size={14} />
            Редактировать
          </Link>
          )}
          <Link
            to={`/cabinet/objects/${objectId}/contracts/${contract.id}/addenda/new`}
            className="flex items-center justify-center min-h-[44px] sm:min-h-0 gap-1.5 bg-white/10 hover:bg-white/15 transition-colors text-white text-sm px-3 py-2 rounded-lg"
          >
            <Icon name="FilePlus2" size={14} />
            Допсоглашение
          </Link>
          <Link
            to={`/cabinet/objects/${objectId}/acts/new?contract_id=${contract.id}`}
            className="flex items-center justify-center min-h-[44px] sm:min-h-0 gap-1.5 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-3 py-2 rounded-lg"
          >
            <Icon name="Plus" size={14} />
            {contract.options?.our_role === "customer" ? "Акт приёмки работ" : "Составить акт"}
          </Link>
{contract.options?.our_role !== "customer" && (
          <Link
            to={`/cabinet/objects/${objectId}/invoices/new?contract_id=${contract.id}`}
            className="flex items-center justify-center min-h-[44px] sm:min-h-0 gap-1.5 bg-white/10 hover:bg-white/15 transition-colors text-white text-sm px-3 py-2 rounded-lg"
          >
            <Icon name="Receipt" size={14} />
            Выставить счёт
          </Link>
          )}
          <button
            onClick={() => setSendOpen(true)}
            className="flex items-center justify-center min-h-[44px] sm:min-h-0 gap-1.5 bg-white/10 hover:bg-white/15 transition-colors text-white text-sm px-3 py-2 rounded-lg"
          >
            <Icon name="Mail" size={14} />
            Отправить на почту
          </button>
          </>)}
          <button
            onClick={handlePrint}
            title="Печать"
            className="flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg"
          >
            <Icon name="Printer" size={15} />
            <span className="sm:hidden">Печать</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            title="Скачать PDF"
            className="flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg disabled:opacity-60"
          >
            {downloading ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Download" size={15} />}
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </div>

      {isClient ? (
        <DocSignBar
          signedAt={contract.signed_at}
          isSigned={contract.status === "signed"}
          docLabel="Договор"
          docTitle={`договор № ${contract.contract_number}`}
          amountLabel="Цена договора"
          amount={Number(contract.total_amount)}
          onSign={() => contractsApi.sign(contract.id)}
          onDone={reload}
        />
      ) : (
        contract.signed_at && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 p-3 sm:p-4 flex items-center gap-3 max-w-4xl mx-auto text-sm">
            <Icon name="BadgeCheck" size={20} className="text-emerald-400" />
            Заказчик подписал договор онлайн{" "}
            {new Date(contract.signed_at).toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
          </div>
        )
      )}

      <ContractAddendaList objectId={objectId} contractId={contract.id} isClient={isClient} />

      {!isClient && contract.options?.our_role === "customer" && (
        <div className="max-w-4xl mx-auto mb-4 flex flex-col gap-2">
          {contract.options.executor_id && (
            <Link
              to={`/cabinet/executors/${contract.options.executor_id}`}
              className="self-start inline-flex items-center gap-1.5 text-sm text-orange-300 hover:text-orange-200"
            >
              <Icon name="HardHat" size={15} />
              Карточка исполнителя
            </Link>
          )}
          <ContractPaymentsCard contractId={contract.id} total={Number(contract.total_amount)} />
        </div>
      )}

      <div className="overflow-x-auto md:overflow-visible max-w-4xl mx-auto">
      <div className="bg-white text-[#161616] rounded-xl p-4 sm:p-12 max-w-4xl mx-auto shadow-lg break-words">
        <div
          className="contract-content leading-relaxed text-sm"
          dangerouslySetInnerHTML={{ __html: contract.content_html }}
        />
      </div>
      </div>
      <SendContractEmailDialog open={sendOpen} onOpenChange={setSendOpen} contract={contract} title={docTitle} />
    </CrmLayout>
  )
}