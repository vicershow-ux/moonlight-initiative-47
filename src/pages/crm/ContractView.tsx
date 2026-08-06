import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { contractsApi, Contract } from "@/lib/api"
import { downloadContractPdf } from "@/lib/downloadContractPdf"
import { docBrandHeader, docBrandStyles } from "@/lib/docBrandHeader"

export default function ContractView() {
  const { id, contractId } = useParams()
  const navigate = useNavigate()
  const objectId = Number(id)

  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!contractId) return
    setLoading(true)
    contractsApi
      .get(Number(contractId))
      .then(setContract)
      .catch(() => navigate("/cabinet/documents"))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId])

  const handlePrint = () => {
    if (!contract) return
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>Договор № ${contract.contract_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; line-height: 1.5; color: #161616; }
            h2, h3 { color: #161616; }
            h2 { margin: 28px 0 12px; }
            h3 { margin: 24px 0 10px; }
            p { margin: 0 0 14px; }
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

  return (
    <CrmLayout title={`Договор подряда на ремонт квартиры № ${contract.contract_number}`}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <Link
          to="/cabinet/documents"
          className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
        >
          <Icon name="ChevronLeft" size={16} />
          К документам
        </Link>

        <div className="flex items-center gap-2">
          <span className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium",
            contract.status === "signed" ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/50"
          )}>
            {contract.status === "signed" ? "подписан" : "черновик"}
          </span>
          <Link
            to={`/cabinet/objects/${objectId}/contracts/${contract.id}/edit`}
            className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm px-3 py-2 rounded-lg"
          >
            <Icon name="Pencil" size={14} />
            Редактировать
          </Link>
          <Link
            to={`/cabinet/objects/${objectId}/acts/new?contract_id=${contract.id}`}
            className="flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-3 py-2 rounded-lg"
          >
            <Icon name="Plus" size={14} />
            Составить акт
          </Link>
          <button
            onClick={handlePrint}
            title="Печать"
            className="flex items-center justify-center w-9 h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg"
          >
            <Icon name="Printer" size={15} />
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            title="Скачать PDF"
            className="flex items-center justify-center w-9 h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg disabled:opacity-60"
          >
            {downloading ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Download" size={15} />}
          </button>
        </div>
      </div>

      <div className="bg-white text-[#161616] rounded-xl p-8 sm:p-12 max-w-4xl mx-auto shadow-lg">
        <div
          className="contract-content leading-relaxed text-sm"
          dangerouslySetInnerHTML={{ __html: contract.content_html }}
        />
      </div>
    </CrmLayout>
  )
}