import { useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { materialsApi, MaterialEstimate, MaterialItem } from "@/lib/api"
import { buildPurchasePlan } from "@/lib/purchaseList"
import { printPurchaseList, downloadPurchaseListPdf } from "@/lib/printPurchaseList"
import { formatMoney } from "@/components/crm/documents/constants"

const telHref = (phone: string) => "tel:" + phone.replace(/[^\d+]/g, "")
const qtyFmt = (n: number) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(n)

export default function PurchaseListView() {
  const { id } = useParams()
  const { user } = useAuth()
  const [estimate, setEstimate] = useState<MaterialEstimate | null>(null)
  const [catalog, setCatalog] = useState<MaterialItem[]>([])
  const [bought, setBought] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [hideBought, setHideBought] = useState(false)
  const [saveState, setSaveState] = useState<"idle" | "saving" | "error">("idle")
  const [pdfBusy, setPdfBusy] = useState(false)
  const saveTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([materialsApi.getEstimate(Number(id)), materialsApi.list().catch(() => null)])
      .then(([est, mat]) => {
        setEstimate(est.estimate)
        setBought(new Set(est.estimate.bought || []))
        setCatalog(mat?.materials || [])
      })
      .catch((e) => setError((e as Error)?.message || "Не удалось загрузить список"))
      .finally(() => setLoading(false))
  }, [id])

  const items = useMemo(() => estimate?.items || [], [estimate])
  const plan = useMemo(() => buildPurchasePlan(items, catalog), [items, catalog])

  const allLines = plan.shops.flatMap((s) => s.lines)
  const boughtSum = allLines.filter((l) => bought.has(l.index)).reduce((s, l) => s + l.sum, 0)
  const boughtCount = allLines.filter((l) => bought.has(l.index)).length
  const leftCount = allLines.length - boughtCount
  const leftSum = plan.total - boughtSum
  const progress = allLines.length ? Math.round((boughtCount / allLines.length) * 100) : 0

  const persist = (next: Set<number>) => {
    if (!estimate) return
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    setSaveState("saving")
    saveTimer.current = window.setTimeout(() => {
      materialsApi
        .setBought(estimate.id, Array.from(next))
        .then(() => setSaveState("idle"))
        .catch(() => setSaveState("error"))
    }, 500)
  }

  const toggle = (index: number) => {
    setBought((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      persist(next)
      return next
    })
  }

  const toggleShop = (indexes: number[], value: boolean) => {
    setBought((prev) => {
      const next = new Set(prev)
      indexes.forEach((i) => (value ? next.add(i) : next.delete(i)))
      persist(next)
      return next
    })
  }

  const obj = estimate
    ? { id: estimate.object_id, object_code: estimate.object_code, client_name: estimate.client_name, address: estimate.address || "" }
    : null
  const company = user?.company_name || ""

  const downloadPdf = async () => {
    if (!obj) return
    setPdfBusy(true)
    try {
      await downloadPurchaseListPdf(obj, items, catalog, company)
    } finally {
      setPdfBusy(false)
    }
  }

  const btn =
    "flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg border border-white/10 text-sm text-white/80 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors"

  return (
    <CrmLayout
      title="Список на закупку"
      subtitle={estimate ? `Объект ${estimate.object_code} · ${estimate.client_name}` : undefined}
    >
      {loading ? (
        <div className="flex justify-center py-16">
          <Icon name="Loader2" size={24} className="animate-spin text-white/40" />
        </div>
      ) : error || !estimate ? (
        <div className="rounded-xl border border-white/10 bg-[#1f1f1f] p-8 text-center text-sm text-white/50">
          {error || "Список не найден"}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="sticky top-14 md:top-0 z-20 -mx-3 sm:mx-0 rounded-none sm:rounded-xl border-y sm:border border-white/10 bg-[#1f1f1f]/95 backdrop-blur p-3 sm:p-5">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-white/40">Осталось купить</p>
                <p className="text-2xl font-semibold text-[#D4AF37]">{formatMoney(leftSum)}</p>
                <p className="text-xs text-white/50 mt-0.5">
                  {leftCount === 0 ? "Всё куплено" : `${leftCount} из ${allLines.length} позиций`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-white/40">Куплено</p>
                <p className="text-base font-medium text-emerald-400">{formatMoney(boughtSum)}</p>
                <p className="text-[11px] text-white/30 mt-0.5 h-4">
                  {saveState === "saving" ? "сохраняю…" : saveState === "error" ? <span className="text-red-400">не сохранилось</span> : "сохранено"}
                </p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            <button
              onClick={() => setHideBought((v) => !v)}
              className={cn(btn, "col-span-2 sm:col-auto", hideBought && "border-[#D4AF37]/50 text-[#D4AF37]")}
            >
              <Icon name={hideBought ? "EyeOff" : "Eye"} size={16} />
              {hideBought ? "Показать купленное" : "Скрыть купленное"}
            </button>
            <button onClick={() => obj && printPurchaseList(obj, items, catalog, company, true)} className={btn}>
              <Icon name="Printer" size={16} />
              Печать
            </button>
            <button onClick={downloadPdf} className={btn} disabled={pdfBusy}>
              <Icon name={pdfBusy ? "Loader2" : "Download"} size={16} className={pdfBusy ? "animate-spin" : ""} />
              PDF
            </button>
          </div>

          {plan.shops.map((shop) => {
            const indexes = shop.lines.map((l) => l.index)
            const shopDone = indexes.every((i) => bought.has(i))
            const lines = hideBought ? shop.lines.filter((l) => !bought.has(l.index)) : shop.lines
            if (hideBought && lines.length === 0) return null
            const shopLeft = shop.lines.filter((l) => !bought.has(l.index)).reduce((s, l) => s + l.sum, 0)
            return (
              <div key={shop.name} className="rounded-xl border border-white/10 bg-[#1f1f1f] overflow-hidden">
                <div className="flex items-start justify-between gap-3 p-3 sm:p-4 border-b border-white/10">
                  <div className="min-w-0">
                    <p className={cn("font-medium break-words", shopDone && "text-white/40 line-through")}>{shop.name}</p>
                    {shop.address && <p className="text-xs text-white/40 mt-0.5 break-words">{shop.address}</p>}
                    <p className="text-xs text-white/50 mt-1">
                      осталось {formatMoney(shopLeft)} из {formatMoney(shop.sum)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {shop.phone && (
                      <a
                        href={telHref(shop.phone)}
                        className="w-11 h-11 flex items-center justify-center rounded-lg bg-[#D4AF37] text-[#161616]"
                        aria-label="Позвонить"
                      >
                        <Icon name="Phone" size={18} />
                      </a>
                    )}
                    <button
                      onClick={() => toggleShop(indexes, !shopDone)}
                      className="min-h-[44px] px-3 rounded-lg bg-white/5 active:bg-white/10 text-xs text-white/70"
                    >
                      {shopDone ? "Снять все" : "Купил всё"}
                    </button>
                  </div>
                </div>

                <ul>
                  {lines.map((l) => {
                    const done = bought.has(l.index)
                    return (
                      <li key={l.index} className="border-b border-white/5 last:border-0">
                        <button
                          onClick={() => toggle(l.index)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 sm:px-4 text-left transition-colors active:bg-white/5",
                            done && "bg-emerald-500/[0.06]"
                          )}
                        >
                          <span
                            className={cn(
                              "w-7 h-7 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors",
                              done ? "bg-emerald-500 border-emerald-500 text-[#161616]" : "border-white/30"
                            )}
                          >
                            {done && <Icon name="Check" size={18} />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className={cn("block text-[15px] break-words", done && "line-through text-white/40")}>
                              {l.name}
                            </span>
                            <span className="block text-xs text-white/40 mt-0.5">
                              {qtyFmt(l.qty)} {l.unit} × {formatMoney(l.price)}
                              {l.roomName ? ` · ${l.roomName}` : ""}
                            </span>
                            {!l.enough && !done && (
                              <span className="block text-xs text-amber-400 mt-0.5">
                                в магазине не хватает {qtyFmt(l.missing)} {l.unit}
                              </span>
                            )}
                          </span>
                          <span className={cn("shrink-0 text-sm font-medium", done ? "text-white/30" : "text-white")}>
                            {formatMoney(l.sum)}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}

          {hideBought && leftCount === 0 && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center text-sm text-emerald-300">
              Всё по списку куплено
            </div>
          )}
        </div>
      )}
    </CrmLayout>
  )
}
