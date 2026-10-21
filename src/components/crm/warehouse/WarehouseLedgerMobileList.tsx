import Icon from "@/components/ui/icon"
import { DeleteButton } from "@/components/ui/delete-button"
import { MobileCard, CardAction } from "@/components/crm/MobileCard"
import { WarehouseItem } from "@/lib/api"
import { money, num, kindBadge } from "./constants"

interface WarehouseLedgerMobileListProps {
  items: WarehouseItem[]
  editItem: WarehouseItem | null
  onRestock: (i: WarehouseItem) => void
  onIssue: (i: WarehouseItem) => void
  onEdit: (i: WarehouseItem) => void
  onDelete: (i: WarehouseItem) => void | Promise<void>
}

export function WarehouseLedgerMobileList({
  items,
  editItem,
  onRestock,
  onIssue,
  onEdit,
  onDelete,
}: WarehouseLedgerMobileListProps) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {items.map((i) => (
        <MobileCard
          key={i.id}
          title={i.name}
          subtitle={i.warehouse_name || "Склад не указан"}
          badge={kindBadge(i.kind)}
          rows={[
            { label: "Кол-во", value: `${num(i.qty)} ${i.unit}` },
            { label: "Цена", value: money(num(i.price)) },
            {
              label: "Сумма",
              value: <span className="text-[#D4AF37]">{money(num(i.qty) * num(i.price))}</span>,
            },
          ]}
          actions={
            <>
              <CardAction
                icon={<Icon name="PackagePlus" size={16} />}
                label="Приход"
                className="text-emerald-400"
                onClick={() => onRestock(i)}
              />
              <button
                disabled={num(i.qty) <= 0}
                onClick={() => onIssue(i)}
                className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/5 text-xs text-[#D4AF37] transition-colors active:bg-white/10 disabled:opacity-30"
              >
                <Icon name="Send" size={16} />
                Выдать
              </button>
              <button
                onClick={() => onEdit(i)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/60 active:bg-white/10"
                title="Редактировать позицию"
              >
                <Icon name={editItem?.id === i.id ? "X" : "Pencil"} size={16} />
              </button>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
                <DeleteButton onConfirm={() => onDelete(i)} />
              </div>
            </>
          }
        />
      ))}
    </div>
  )
}

export default WarehouseLedgerMobileList
