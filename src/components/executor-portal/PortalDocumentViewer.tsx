import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { portalApi, PortalDocument } from "@/lib/executorsApi"
import { downloadContractPdf } from "@/lib/downloadContractPdf"
import { formatMoney, formatDate } from "@/components/crm/documents/constants"

interface Props {
  kind: "contract" | "act"
  id: number
  onClose: () => void
  onSigned: () => void
}

/** Просмотр договора или акта исполнителем и подписание простой электронной подписью */
export function PortalDocumentViewer({ kind, id, onClose, onSigned }: Props) {
  const [doc, setDoc] = useState<PortalDocument | null>(null)
  const [error, setError] = useState("")
  const [agree, setAgree] = useState(false)
  const [busy, setBusy] = useState(false)
  const [pdfBusy, setPdfBusy] = useState(false)

  const load = () =>
    portalApi
      .document(kind, id)
      .then(setDoc)
      .catch((e) => setError((e as Error)?.message || "Не удалось открыть документ"))

  useEffect(() => {
    load()
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, id])

  const label = kind === "contract" ? "Договор" : "Акт"

  const sign = async () => {
    setBusy(true)
    setError("")
    try {
      await portalApi.sign(kind, id)
      await load()
      onSigned()
    } catch (e) {
      setError((e as Error)?.message || "Не удалось подписать")
    } finally {
      setBusy(false)
    }
  }

  const pdf = async () => {
    if (!doc) return
    setPdfBusy(true)
    try {
      await downloadContractPdf(doc.content_html, kind === "act" ? `Акт ${doc.number}` : doc.number)
    } finally {
      setPdfBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#161616] text-white flex flex-col">
      <header className="flex items-center gap-2 px-3 py-2 border-b border-white/10 pt-[calc(env(safe-area-inset-top)+8px)]">
        <button onClick={onClose} className="w-11 h-11 flex items-center justify-center rounded-lg bg-white/5" aria-label="Назад">
          <Icon name="ChevronLeft" size={20} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">
            {label} № {doc?.number || ""}
          </p>
          {doc && (
            <p className="text-xs text-white/40 truncate">
              {formatDate(doc.date)} · {formatMoney(doc.total_amount)}
            </p>
          )}
        </div>
        <button
          onClick={pdf}
          disabled={!doc || pdfBusy}
          className="w-11 h-11 flex items-center justify-center rounded-lg bg-white/5 disabled:opacity-50"
          aria-label="Скачать PDF"
        >
          <Icon name={pdfBusy ? "Loader2" : "Download"} size={18} className={pdfBusy ? "animate-spin" : ""} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {!doc && !error && (
          <div className="flex justify-center py-20">
            <Icon name="Loader2" size={26} className="animate-spin text-white/40" />
          </div>
        )}
        {doc && (
          <div className="p-2 sm:p-4">
            <div className="overflow-x-auto max-w-4xl mx-auto">
              <div className="bg-white text-[#161616] rounded-xl p-4 sm:p-10 break-words min-w-[320px]">
                <div className="contract-content leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: doc.content_html }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-white/10 bg-[#1f1f1f] p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <div className="max-w-4xl mx-auto">
          {error && <p className="text-sm text-red-400 mb-2">{error}</p>}
          {doc?.executor_signed_at ? (
            <div className="flex items-center gap-3 text-sm">
              <Icon name="BadgeCheck" size={22} className="text-emerald-400 shrink-0" />
              <div>
                <p className="font-medium">Вы подписали {kind === "contract" ? "договор" : "акт"}</p>
                <p className="text-xs text-white/50">
                  {new Date(doc.executor_signed_at).toLocaleString("ru-RU", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ) : doc ? (
            <div className="flex flex-col gap-2">
              <label className="flex items-start gap-2 text-xs text-white/70 cursor-pointer">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="accent-[#D4AF37] w-5 h-5 mt-0.5 shrink-0" />
                <span>
                  Я прочитал {kind === "contract" ? "договор" : "акт"} целиком, согласен с условиями и подписываю его простой электронной подписью. Вход в
                  кабинет по моей почте и паролю подтверждает, что подписываю именно я.
                </span>
              </label>
              <button
                onClick={sign}
                disabled={!agree || busy}
                className="flex items-center justify-center gap-2 min-h-[48px] rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium disabled:opacity-40"
              >
                <Icon name={busy ? "Loader2" : "PenLine"} size={17} className={busy ? "animate-spin" : ""} />
                Подписать {kind === "contract" ? "договор" : "акт"}
              </button>
            </div>
          ) : null}
        </div>
      </footer>
    </div>
  )
}

export default PortalDocumentViewer
