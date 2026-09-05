import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { ContractOptionsPanel } from "@/components/crm/rental/ContractOptionsPanel"
import { ContractTermsCard } from "@/components/crm/rental/ContractTermsCard"
import { ContractEditorPane } from "@/components/crm/rental/ContractEditorPane"
import {
  companyApi,
  rentalsApi,
  CompanyData,
  Rental,
  RentalContract as RentalContractRow,
  RentalCounterparty,
} from "@/lib/api"
import {
  buildRentalContractHtml,
  RentalContractOptions,
} from "@/lib/buildRentalContractHtml"
import { counterpartyReady, rentalTotal } from "@/lib/rental"
import { docBrandHeader, docBrandStyles } from "@/lib/docBrandHeader"
import { downloadContractPdf } from "@/lib/downloadContractPdf"

export default function RentalContractPage() {
  const { rentalId } = useParams<{ rentalId: string }>()
  const navigate = useNavigate()
  const editorRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const [rental, setRental] = useState<Rental | null>(null)
  const [counterparty, setCounterparty] = useState<RentalCounterparty | null>(null)
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [existing, setExisting] = useState<RentalContractRow | null>(null)

  const [html, setHtml] = useState("")
  const [edited, setEdited] = useState(false)
  const [options, setOptions] = useState<RentalContractOptions>({
    city: "",
    contract_number: "",
    contract_date: new Date().toISOString().slice(0, 10),
    purpose: "",
    delivery: "self_pickup",
    penalty_pct: "0,5",
    claim_days: "10",
    copies_total: "двух",
    extra_terms: "",
  })

  useEffect(() => {
    if (!rentalId) return
    setLoading(true)
    Promise.all([rentalsApi.list(), companyApi.get()])
      .then(async ([data, comp]) => {
        const found = (data.rentals || []).find((r) => r.id === Number(rentalId))
        if (!found) {
          navigate("/cabinet/rentals")
          return
        }
        setRental(found)
        setCompany(comp as CompanyData)
        const cp = (data.counterparties || []).find((c) => c.id === found.counterparty_id) || null
        setCounterparty(cp)

        if (found.contract_id) {
          const doc = await rentalsApi.contracts.get(found.contract_id)
          setExisting(doc)
          setHtml(doc.content_html)
          setOptions((o) => ({
            ...o,
            ...(doc.options as RentalContractOptions),
            contract_number: doc.contract_number,
            contract_date: String(doc.contract_date).slice(0, 10),
          }))
        } else {
          setOptions((o) => ({ ...o, contract_number: found.rental_number }))
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Не удалось загрузить"))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rentalId])

  const generated = useMemo(() => {
    if (!rental) return ""
    return buildRentalContractHtml({ rental, counterparty, company, options })
  }, [rental, counterparty, company, options])

  useEffect(() => {
    if (!rental || edited) return
    if (existing && html) return
    setHtml(generated)
  }, [generated, rental, edited, existing, html])

  const missing = useMemo(
    () => (counterparty ? counterpartyReady(counterparty) : ["контрагент не выбран"]),
    [counterparty],
  )

  const regenerate = () => {
    setHtml(generated)
    setEdited(false)
    if (editorRef.current) editorRef.current.innerHTML = generated
    setMessage("Текст пересобран по данным аренды")
    setTimeout(() => setMessage(""), 2500)
  }

  const save = async () => {
    if (!rental) return
    setSaving(true)
    setError("")
    try {
      const content = editorRef.current?.innerHTML || html
      const payload = {
        rental_id: rental.id,
        contract_number: options.contract_number || rental.rental_number,
        contract_date: options.contract_date || new Date().toISOString().slice(0, 10),
        status: existing?.status || "draft",
        options: options as Record<string, unknown>,
        content_html: content,
        total_amount: rentalTotal(rental),
      }

      if (existing) {
        await rentalsApi.contracts.update(existing.id, payload)
      } else {
        const created = await rentalsApi.contracts.create(payload)
        setExisting({
          id: created.id,
          rental_id: rental.id,
          contract_number: payload.contract_number,
          contract_date: payload.contract_date,
          status: "draft",
          options: payload.options,
          content_html: content,
          total_amount: payload.total_amount,
          created_at: new Date().toISOString(),
        })
      }
      setHtml(content)
      setMessage("Договор сохранён")
      setTimeout(() => setMessage(""), 2500)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить")
    } finally {
      setSaving(false)
    }
  }

  const handlePrint = () => {
    const content = editorRef.current?.innerHTML || html
    const title = `Договор аренды № ${options.contract_number || rental?.rental_number || ""}`
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>${title}</title>
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
        <body>${docBrandHeader(title)}${content}</body>
      </html>
    `)
    win.document.close()
    win.focus()
    win.print()
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const content = editorRef.current?.innerHTML || html
      await downloadContractPdf(
        content,
        options.contract_number || rental?.rental_number || "аренда",
      )
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <CrmLayout title="Договор аренды">
        <div className="flex items-center justify-center py-24">
          <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
        </div>
      </CrmLayout>
    )
  }

  if (!rental) return null

  return (
    <CrmLayout
      title="Договор аренды"
      subtitle={`${rental.item_name} · ${rental.counterparty_name || "контрагент не выбран"}`}
    >
      <button
        onClick={() => navigate("/cabinet/rentals")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white"
      >
        <Icon name="ChevronLeft" size={16} />
        Назад к аренде
      </button>

      {missing.length > 0 && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
          <Icon name="TriangleAlert" size={16} className="mt-0.5 shrink-0" />
          <div>
            В договоре останутся пропуски — у контрагента не заполнено: {missing.join(", ")}.{" "}
            <button
              onClick={() => navigate("/cabinet/rentals")}
              className="underline hover:text-white"
            >
              Заполнить
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          <Icon name="CircleAlert" size={16} />
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">
          <Icon name="Check" size={16} />
          {message}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <ContractOptionsPanel
            options={options}
            onChange={(patch) => setOptions((o) => ({ ...o, ...patch }))}
          />

          <ContractTermsCard rental={rental} edited={edited} onRegenerate={regenerate} />
        </div>

        <ContractEditorPane
          editorRef={editorRef}
          html={html}
          saving={saving}
          downloading={downloading}
          hasExisting={!!existing}
          onEdit={() => setEdited(true)}
          onSave={save}
          onPrint={handlePrint}
          onDownload={handleDownload}
        />
      </div>
    </CrmLayout>
  )
}
