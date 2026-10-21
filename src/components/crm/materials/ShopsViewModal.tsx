import { useEffect } from "react"
import Icon from "@/components/ui/icon"
import { MaterialItem, MaterialOffer } from "@/lib/api"
import { money, num } from "./constants"

interface ShopsViewModalProps {
  material: MaterialItem
  onClose: () => void
}

const telHref = (phone: string) => "tel:" + phone.replace(/[^\d+]/g, "")

const mapHref = (address: string) =>
  "https://yandex.ru/maps/?text=" + encodeURIComponent(address)

const formatDate = (s: string) => {
  if (!s) return ""
  const d = new Date(s)
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("ru-RU")
}

export function ShopsViewModal({ material, onClose }: ShopsViewModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  let offers: MaterialOffer[] = material.offers || []
  if (offers.length === 0 && (material.shop_name || material.shop_phone || material.shop_address)) {
    offers = [
      {
        id: 0,
        material_id: material.id,
        shop_name: material.shop_name,
        shop_address: material.shop_address,
        shop_phone: material.shop_phone,
        shop_url: material.shop_url,
        price: material.price,
        stock: 0,
        stock_known: false,
        note: "",
        checked_at: "",
      },
    ]
  }

  const sorted = [...offers].sort((a, b) => {
    const pa = num(a.price) || Infinity
    const pb = num(b.price) || Infinity
    return pa - pb
  })
  const prices = offers.map((o) => num(o.price)).filter((p) => p > 0)
  const minPrice = prices.length ? Math.min(...prices) : 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overflow-x-hidden bg-black/70 p-2 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="my-2 w-full min-w-0 max-w-2xl rounded-xl border border-white/10 bg-[#1f1f1f] p-4 sm:my-8 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase text-white/40">Магазины</div>
            <div className="mt-1 break-words text-lg">{material.name}</div>
          </div>
          <button
            className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
            onClick={onClose}
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {sorted.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-[#161616] p-6 text-center text-sm text-white/40">
            Магазины для этого материала ещё не добавлены
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((o, i) => {
              const best = minPrice > 0 && num(o.price) === minPrice && prices.length > 1
              return (
                <div
                  key={o.id || i}
                  className={`rounded-lg border bg-[#161616] p-3 sm:p-4 ${
                    best ? "border-[#D4AF37]/40" : "border-white/10"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="break-words font-medium">{o.shop_name || "Без названия"}</span>
                        {best && (
                          <span className="rounded bg-[#D4AF37]/15 px-1.5 py-0.5 text-[10px] uppercase text-[#D4AF37]">
                            дешевле всех
                          </span>
                        )}
                      </div>
                      {o.shop_address && (
                        <a
                          href={mapHref(o.shop_address)}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 flex items-center gap-1.5 break-words text-sm text-white/60 hover:text-[#D4AF37]"
                        >
                          <Icon name="MapPin" size={14} />
                          {o.shop_address}
                        </a>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-[#D4AF37]">{num(o.price) > 0 ? money(num(o.price)) : "—"}</div>
                      <div className="text-xs">
                        {o.stock_known ? (
                          num(o.stock) > 0 ? (
                            <span className="text-emerald-400">
                              в наличии {num(o.stock)} {material.unit}
                            </span>
                          ) : (
                            <span className="text-red-400">нет в наличии</span>
                          )
                        ) : (
                          <span className="text-white/30">наличие не указано</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {o.note && <div className="mt-2 text-xs text-white/40">{o.note}</div>}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {o.shop_phone && (
                      <a
                        href={telHref(o.shop_phone)}
                        className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg bg-[#D4AF37] px-3 py-2 text-sm sm:min-h-0 sm:w-auto sm:justify-start text-[#161616] transition-colors hover:bg-[#B8860B]"
                      >
                        <Icon name="Phone" size={14} />
                        {o.shop_phone}
                      </a>
                    )}
                    {o.shop_url && (
                      <a
                        href={o.shop_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm sm:min-h-0 sm:w-auto sm:justify-start text-white/70 transition-colors hover:border-[#D4AF37]/50 hover:text-[#D4AF37]"
                      >
                        <Icon name="ExternalLink" size={14} />
                        Товар на сайте
                      </a>
                    )}
                    {o.checked_at && (
                      <span className="text-xs text-white/30 sm:ml-auto">
                        обновлено {formatDate(o.checked_at)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ShopsViewModal
