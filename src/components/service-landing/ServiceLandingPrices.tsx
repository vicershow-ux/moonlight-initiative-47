import Icon from "@/components/ui/icon"
import { PublicServiceItem } from "@/lib/api"
import { ServiceLandingMeta } from "@/lib/serviceLanding"
import { WorkQtyControl } from "@/components/services/WorkQtyControl"
import { formatPrice } from "./formatPrice"

interface Props {
  meta: ServiceLandingMeta
  loading: boolean
  items: PublicServiceItem[]
  grouped: [string, PublicServiceItem[]][]
}

export function ServiceLandingPrices({ meta, loading, items, grouped }: Props) {
  return (
    <section className="pb-20 md:pb-28">
      <div className="container mx-auto px-6 md:px-12">
        <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-3">
          Цены на {meta.category.toLowerCase()}
        </h2>
        <p className="text-muted-foreground mb-10 max-w-2xl">
          Стоимость указана за работу без учёта материалов. Отметьте нужные работы и укажите
          объём — посчитаем ориентировочную сумму, а точную зафиксируем в смете после бесплатного замера.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Icon name="Loader2" size={26} className="animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">
            Прайс на это направление уточняется — оставьте заявку, рассчитаем стоимость под ваш
            объект.
          </p>
        ) : (
          <div className="space-y-10">
            {grouped.map(([group, list]) => (
              <div key={group}>
                <h3 className="text-sm font-medium tracking-[0.15em] uppercase text-muted-foreground mb-4">
                  {group}
                </h3>
                <div className="rounded-xl border border-border overflow-hidden">
                  {list.map((item, i) => (
                    <div
                      key={`${item.name}-${i}`}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-6 px-4 md:px-6 py-3.5 ${
                        i % 2 ? "bg-muted/40" : ""
                      }`}
                    >
                      <span className="text-sm md:text-base">{item.name}</span>
                      <span className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                        <span className="text-sm md:text-base font-medium whitespace-nowrap">
                          {formatPrice(item.price)} ₽
                          <span className="text-muted-foreground font-normal">
                            {item.unit ? ` / ${item.unit}` : ""}
                          </span>
                        </span>
                        <WorkQtyControl name={item.name} category={meta.category} unit={item.unit} price={item.price} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default ServiceLandingPrices
