import Icon from "@/components/ui/icon"
import { DeleteButton } from "@/components/ui/delete-button"
import { MobileCard, CardAction } from "@/components/crm/MobileCard"
import { MaterialItem } from "@/lib/api"
import { consumptionLabel } from "@/lib/materialConsumption"
import { money, num } from "./constants"

interface MaterialsCatalogMobileListProps {
  items: MaterialItem[]
  onViewShops: (id: number) => void
  onEdit: (id: number) => void
  onDelete: (id: number) => void | Promise<void>
}

function bestOffer(m: MaterialItem) {
  const priced = (m.offers || []).filter((o) => num(o.price) > 0)
  if (priced.length === 0) return null
  return priced.reduce((a, b) => (num(b.price) < num(a.price) ? b : a))
}

function stockLabel(m: MaterialItem) {
  const known = (m.offers || []).filter((o) => o.stock_known)
  if (known.length === 0) return <span className="text-white/30">не указано</span>
  const inStock = known.filter((o) => num(o.stock) > 0)
  if (inStock.length === 0) return <span className="text-red-400">нет в наличии</span>
  const total = inStock.reduce((s, o) => s + num(o.stock), 0)
  return (
    <span className="text-emerald-400">
      {total} {m.unit} <span className="text-white/30">в {inStock.length} из {known.length}</span>
    </span>
  )
}

export function MaterialsCatalogMobileList({
  items,
  onViewShops,
  onEdit,
  onDelete,
}: MaterialsCatalogMobileListProps) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {items.map((m) => {
        const best = bestOffer(m)
        const offers = m.offers || []
        return (
          <MobileCard
            key={m.id}
            title={m.name}
            subtitle={m.note || undefined}
            badge={
              <span className="whitespace-nowrap text-sm text-[#D4AF37]">
                {money(num(m.price))}
                <span className="text-white/40"> / {m.unit}</span>
              </span>
            }
            rows={[
              {
                label: "Расход",
                value: num(m.consumption) > 0 ? consumptionLabel(m) : "—",
              },
              {
                label: "Где дешевле",
                value: best ? (
                  <>
                    {best.shop_url ? (
                      <a
                        href={best.shop_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#D4AF37]"
                      >
                        {best.shop_name || "—"}
                      </a>
                    ) : (
                      best.shop_name || "—"
                    )}
                    {best.shop_address && (
                      <div className="break-words text-xs text-white/30">{best.shop_address}</div>
                    )}
                  </>
                ) : (
                  <span className="text-white/30">—</span>
                ),
              },
              {
                label: "Магазины",
                value:
                  offers.length === 0 ? (
                    <span className="text-white/30">не добавлены</span>
                  ) : (
                    `${offers.length} шт`
                  ),
              },
              { label: "Наличие", value: stockLabel(m) },
            ]}
            actions={
              <>
                <CardAction
                  icon={<Icon name="Store" size={16} />}
                  label="Магазины"
                  onClick={() => onViewShops(m.id)}
                />
                <CardAction
                  icon={<Icon name="Pencil" size={16} />}
                  label="Изменить"
                  onClick={() => onEdit(m.id)}
                />
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
                  <DeleteButton onConfirm={() => onDelete(m.id)} />
                </div>
              </>
            }
          />
        )
      })}
    </div>
  )
}

export default MaterialsCatalogMobileList
