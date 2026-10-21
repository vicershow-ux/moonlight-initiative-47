import Icon from "@/components/ui/icon"
import { DeleteButton } from "@/components/ui/delete-button"
import { MobileCard, CardAction } from "@/components/crm/MobileCard"
import { ObjectMaterial } from "@/lib/api"
import { money, num } from "./constants"

interface MaterialsObjectsMobileListProps {
  items: ObjectMaterial[]
  productUrl: (m: ObjectMaterial) => string
  onView: (m: ObjectMaterial) => void
  onEdit: (m: ObjectMaterial) => void
  onPrint: (m: ObjectMaterial) => void
  onPdf: (m: ObjectMaterial) => void
  onDelete: (m: ObjectMaterial) => void | Promise<void>
}

export function MaterialsObjectsMobileList({
  items,
  productUrl,
  onView,
  onEdit,
  onPrint,
  onPdf,
  onDelete,
}: MaterialsObjectsMobileListProps) {
  return (
    <div className="flex flex-col gap-3 p-3 md:hidden">
      {items.map((m) => {
        const url = productUrl(m)
        return (
          <MobileCard
            key={m.id}
            title={m.name}
            subtitle={m.note || undefined}
            badge={
              <span className="whitespace-nowrap text-sm text-[#D4AF37]">
                {money(num(m.qty) * num(m.price))}
              </span>
            }
            rows={[
              { label: "Кол-во", value: `${num(m.qty)} ${m.unit}` },
              { label: "Цена", value: money(num(m.price)) },
              { label: "Магазин", value: m.shop_name || "—" },
              {
                label: "Ссылка",
                value: url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#D4AF37]"
                  >
                    <Icon name="ExternalLink" size={14} />
                    Открыть
                  </a>
                ) : (
                  <span className="text-white/30">—</span>
                ),
              },
            ]}
            actions={
              <>
                <CardAction icon={<Icon name="Eye" size={16} />} label="" onClick={() => onView(m)} />
                <CardAction icon={<Icon name="Pencil" size={16} />} label="" onClick={() => onEdit(m)} />
                <CardAction icon={<Icon name="Printer" size={16} />} label="" onClick={() => onPrint(m)} />
                <CardAction icon={<Icon name="FileDown" size={16} />} label="" onClick={() => onPdf(m)} />
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
                  <DeleteButton onConfirm={() => onDelete(m)} />
                </div>
              </>
            }
          />
        )
      })}
    </div>
  )
}

export default MaterialsObjectsMobileList
