import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { actsApi, Act } from "@/lib/api"
import { downloadContractPdf } from "@/lib/downloadContractPdf"

export default function ActView() {
  const { actId } = useParams()
  const navigate = useNavigate()

  const [act, setAct] = useState<Act | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!actId) return
    setLoading(true)
    actsApi
      .get(Number(actId))
      .then(setAct)
      .catch(() => navigate("/cabinet/documents"))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actId])

  const handlePrint = () => {
    if (!act) return
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>Акт № ${act.act_number}</title>
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            body { font-family: Arial, sans-serif; padding: 0 2mm; line-height: 1.5; color: #1a1a1a; font-size: 13px; }
            table { border-collapse: collapse; width: 100%; }
            td, th { overflow-wrap: break-word; }
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              body { padding: 0 2mm; color: #1a1a1a !important; }
              table, tr, td, th { page-break-inside: avoid; }
              table:not(.works-table) td,
              table:not(.works-table) th { border: none !important; }
              .works-table thead th { background: #5C3A11 !important; color: #ffffff !important; font-weight: 700 !important; }
              .works-table tbody td,
              .works-table thead th { border: 1.2px solid #6B4508 !important; }
              .works-table tbody td { color: #1a1a1a !important; }
            }
          </style>
        </head>
        <body>${act.content_html}</body>
      </html>
    `)
    win.document.close()
    win.focus()
    win.print()
  }

  const handleDownload = async () => {
    if (!act) return
    setDownloading(true)
    try {
      await downloadContractPdf(act.content_html, `Акт ${act.act_number}`)
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <CrmLayout title="Акт">
        <div className="flex items-center justify-center py-24">
          <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
        </div>
      </CrmLayout>
    )
  }

  if (!act) return null

  return (
    <CrmLayout title={`Акт выполненных работ № ${act.act_number}`}>
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
            act.status === "signed" ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/50"
          )}>
            {act.status === "signed" ? "подписан" : "черновик"}
          </span>
          <Link
            to={`/cabinet/objects/${act.object_id}/acts/${act.id}/edit`}
            className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm px-3 py-2 rounded-lg"
          >
            <Icon name="Pencil" size={14} />
            Редактировать
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
        <div dangerouslySetInnerHTML={{ __html: act.content_html }} />
      </div>
    </CrmLayout>
  )
}