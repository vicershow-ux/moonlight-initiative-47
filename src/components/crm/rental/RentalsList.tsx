import { ReactNode } from "react"
import Icon from "@/components/ui/icon"
import { DeleteButton } from "@/components/ui/delete-button"
import { MobileCard } from "@/components/crm/MobileCard"
import { Rental } from "@/lib/api"
import { PERIOD_SHORT, money, num, periodsCount, rentalTotal } from "@/lib/rental"
import { Tab, card } from "./rentalsUi"

interface Props {
  rows: Rental[]
  tab: Tab
  statusBadge: (r: Rental) => ReactNode
  onReturn: (r: Rental) => void
  onContract: (r: Rental) => void
  onEdit: (r: Rental) => void
  onRemove: (id: number) => void
}

export function RentalsList({
  rows,
  tab,
  statusBadge,
  onReturn,
  onContract,
  onEdit,
  onRemove,
}: Props) {
  if (rows.length === 0) {
    return (
      <div className={`${card} py-16 text-center text-sm text-white/30`}>
        {tab === "active"
          ? "Сейчас ничего не в аренде — оформите первую выдачу"
          : "История пуста"}
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((r) => (
          <MobileCard
            key={r.id}
            title={r.item_name}
            subtitle={`${r.rental_number} · ${r.counterparty_name || "без контрагента"}`}
            badge={statusBadge(r)}
            rows={[
              {
                label: "Направление",
                value: r.direction === "out" ? "Мы сдали" : "Мы взяли",
              },
              { label: "Количество", value: `${num(r.qty)} ${r.unit}` },
              {
                label: "Ставка",
                value: `${money(num(r.rate))}/${PERIOD_SHORT[r.rate_period]}`,
              },
              {
                label: "Срок",
                value: `${new Date(r.date_from).toLocaleDateString("ru-RU")} — ${
                  r.date_to ? new Date(r.date_to).toLocaleDateString("ru-RU") : "бессрочно"
                }`,
              },
              {
                label: "Начислено",
                value: (
                  <span className="text-[#D4AF37]">
                    {money(rentalTotal(r))} ({periodsCount(r)} {PERIOD_SHORT[r.rate_period]})
                  </span>
                ),
              },
              ...(num(r.deposit) ? [{ label: "Залог", value: money(num(r.deposit)) }] : []),
            ]}
            actions={
              <>
                {r.status === "active" && (
                  <button
                    onClick={() => onReturn(r)}
                    className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/5 text-xs text-white/70"
                  >
                    <Icon name="RotateCcw" size={15} />
                    Вернуть
                  </button>
                )}
                <button
                  onClick={() => onContract(r)}
                  className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/5 text-xs text-white/70"
                >
                  <Icon name="FileText" size={15} />
                  Договор
                </button>
                <button
                  onClick={() => onEdit(r)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/60"
                >
                  <Icon name="Pencil" size={15} />
                </button>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
                  <DeleteButton onConfirm={() => onRemove(r.id)} />
                </div>
              </>
            }
          />
        ))}
      </div>

      <div className={`hidden md:block ${card}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-white/40">
                <th className="py-2 pr-4 text-left font-medium">Инструмент</th>
                <th className="py-2 pr-4 text-left font-medium">Кто</th>
                <th className="py-2 pr-4 text-left font-medium">Кол-во</th>
                <th className="py-2 pr-4 text-left font-medium">Ставка</th>
                <th className="py-2 pr-4 text-left font-medium">Срок</th>
                <th className="py-2 pr-4 text-left font-medium">Начислено</th>
                <th className="py-2 pr-4 text-left font-medium">Статус</th>
                <th className="py-2 pr-4 text-left font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-white/5 last:border-0">
                  <td className="py-3 pr-4">
                    <p>{r.item_name}</p>
                    <p className="text-xs text-white/30">
                      {r.rental_number} · {r.direction === "out" ? "мы сдали" : "мы взяли"}
                    </p>
                  </td>
                  <td className="py-3 pr-4 text-white/60">
                    {r.counterparty_name || "—"}
                    {r.object_code && (
                      <p className="text-xs text-white/30">объект {r.object_code}</p>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-white/60">
                    {num(r.qty)} {r.unit}
                  </td>
                  <td className="py-3 pr-4 text-white/60">
                    {money(num(r.rate))}/{PERIOD_SHORT[r.rate_period]}
                  </td>
                  <td className="py-3 pr-4 text-white/60">
                    {new Date(r.date_from).toLocaleDateString("ru-RU")}
                    {" — "}
                    {r.date_to ? new Date(r.date_to).toLocaleDateString("ru-RU") : "бессрочно"}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-[#D4AF37]">{money(rentalTotal(r))}</span>
                    <p className="text-xs text-white/30">
                      {periodsCount(r)} {PERIOD_SHORT[r.rate_period]}
                    </p>
                  </td>
                  <td className="py-3 pr-4">{statusBadge(r)}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      {r.status === "active" && (
                        <button
                          onClick={() => onReturn(r)}
                          className="text-white/40 transition-colors hover:text-[#D4AF37]"
                          title="Оформить возврат"
                        >
                          <Icon name="RotateCcw" size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => onContract(r)}
                        className="text-white/40 transition-colors hover:text-white"
                        title="Договор аренды"
                      >
                        <Icon name="FileText" size={16} />
                      </button>
                      <button
                        onClick={() => onEdit(r)}
                        className="text-white/40 transition-colors hover:text-white"
                        title="Изменить"
                      >
                        <Icon name="Pencil" size={16} />
                      </button>
                      <DeleteButton onConfirm={() => onRemove(r.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default RentalsList
