import { useEffect, useMemo } from "react"
import Icon from "@/components/ui/icon"
import { MaterialItem, MaterialObject, ObjectMaterial } from "@/lib/api"
import { buildPurchasePlan } from "@/lib/purchaseList"
import { printPurchaseList } from "@/lib/printPurchaseList"
import { money, num } from "./constants"

interface PurchaseListModalProps {
  object: MaterialObject
  items: ObjectMaterial[]
  catalog: MaterialItem[]
  companyName: string
  onClose: () => void
}

export function PurchaseListModal({
  object,
  items,
  catalog,
  companyName,
  onClose,
}: PurchaseListModalProps) {
  const plan = useMemo(() => buildPurchasePlan(items, catalog), [items, catalog])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="my-8 w-full max-w-4xl rounded-xl border border-white/10 bg-[#1f1f1f] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-medium">Список на закупку</div>
            <div className="mt-0.5 text-xs text-white/40">
              Объект № {object.object_code} · {object.client_name}
            </div>
          </div>
          <button
            className="rounded-lg p-1.5 text-white/40 transition-colors hover:text-white"
            onClick={onClose}
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="mb-5 flex flex-wrap gap-3">
          <div className="min-w-[130px] flex-1 rounded-lg border border-white/10 bg-[#161616] px-4 py-3">
            <div className="text-xs text-white/40">Итого закупка</div>
            <div className="mt-1 text-lg text-[#D4AF37]">{money(plan.total)}</div>
          </div>
          <div className="min-w-[130px] flex-1 rounded-lg border border-white/10 bg-[#161616] px-4 py-3">
            <div className="text-xs text-white/40">Магазинов</div>
            <div className="mt-1 text-lg">{plan.shops.length}</div>
          </div>
          {plan.saved > 0 && (
            <div className="min-w-[130px] flex-1 rounded-lg border border-emerald-500/30 bg-[#161616] px-4 py-3">
              <div className="text-xs text-white/40">Экономия на выборе</div>
              <div className="mt-1 text-lg text-emerald-400">{money(plan.saved)}</div>
            </div>
          )}
          {plan.shortageCount > 0 && (
            <div className="min-w-[130px] flex-1 rounded-lg border border-red-500/30 bg-[#161616] px-4 py-3">
              <div className="text-xs text-white/40">Не хватает</div>
              <div className="mt-1 text-lg text-red-400">{plan.shortageCount} поз.</div>
            </div>
          )}
        </div>

        {plan.shops.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 py-12 text-center text-sm text-white/30">
            На объекте пока нет материалов
          </div>
        ) : (
          <div className="space-y-4">
            {plan.shops.map((shop) => (
              <div key={shop.name} className="rounded-lg border border-white/10 bg-[#161616]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm">
                      {shop.name}
                      {shop.hasShortage && (
                        <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] uppercase text-red-400">
                          не всё есть
                        </span>
                      )}
                    </div>
                    {(shop.address || shop.phone) && (
                      <div className="mt-0.5 text-xs text-white/30">
                        {shop.address}
                        {shop.address && shop.phone ? " · " : ""}
                        {shop.phone && (
                          <a href={`tel:${shop.phone}`} className="hover:text-[#D4AF37]">
                            {shop.phone}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-sm text-[#D4AF37]">
                    {money(shop.sum)}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-xs uppercase text-white/40">
                        <th className="py-2 pl-4 pr-3 text-left font-medium">Материал</th>
                        <th className="py-2 pr-3 text-right font-medium">Нужно</th>
                        <th className="py-2 pr-3 text-left font-medium">Наличие</th>
                        <th className="py-2 pr-3 text-right font-medium">Цена</th>
                        <th className="py-2 pr-4 text-right font-medium">Сумма</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shop.lines.map((line, i) => (
                        <tr key={i} className="border-b border-white/5 last:border-0">
                          <td className="py-2.5 pl-4 pr-3">
                            {line.name}
                            {line.roomName && (
                              <div className="text-xs text-white/30">{line.roomName}</div>
                            )}
                          </td>
                          <td className="whitespace-nowrap py-2.5 pr-3 text-right text-white/60">
                            {line.qty} {line.unit}
                          </td>
                          <td className="whitespace-nowrap py-2.5 pr-3 text-xs">
                            {line.stock === null ? (
                              <span className="text-white/30">не указано</span>
                            ) : line.enough ? (
                              <span className="text-emerald-400">
                                есть {line.stock} {line.unit}
                              </span>
                            ) : (
                              <span className="text-red-400">
                                есть {line.stock}, не хватает {line.missing}
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap py-2.5 pr-3 text-right text-white/60">
                            {money(num(line.price))}
                          </td>
                          <td className="whitespace-nowrap py-2.5 pr-4 text-right text-[#D4AF37]">
                            {money(line.sum)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            className="flex items-center gap-2 rounded-lg bg-[#D4AF37] px-5 py-2.5 text-sm text-[#161616] transition-colors hover:bg-[#B8860B] disabled:opacity-40"
            disabled={plan.shops.length === 0}
            onClick={() => printPurchaseList(object, items, catalog, companyName, true)}
          >
            <Icon name="Printer" size={16} />
            Распечатать список
          </button>
          <button
            className="flex items-center gap-2 rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/60 transition-colors hover:text-white disabled:opacity-40"
            disabled={plan.shops.length === 0}
            onClick={() => printPurchaseList(object, items, catalog, companyName, false)}
          >
            <Icon name="Eye" size={16} />
            Открыть для просмотра
          </button>
        </div>
      </div>
    </div>
  )
}

export default PurchaseListModal
