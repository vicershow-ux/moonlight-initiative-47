import Icon from "@/components/ui/icon"
import { DeleteButton } from "@/components/ui/delete-button"
import { MobileCard } from "@/components/crm/MobileCard"
import { Rental, RentalCounterparty } from "@/lib/api"
import { PARTY_LABEL } from "@/lib/rental"
import { card } from "./rentalsUi"

interface Props {
  counterparties: RentalCounterparty[]
  rentals: Rental[]
  onEdit: (c: RentalCounterparty) => void
  onRemove: (id: number) => void
}

export function CounterpartiesList({ counterparties, rentals, onEdit, onRemove }: Props) {
  if (counterparties.length === 0) {
    return (
      <div className={`${card} py-16 text-center text-sm text-white/30`}>
        Контрагентов пока нет — добавьте того, кому выдаёте инструмент
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {counterparties.map((c) => (
          <MobileCard
            key={c.id}
            title={c.display_name}
            subtitle={c.phone || c.email || "контакт не указан"}
            badge={
              <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/60">
                {PARTY_LABEL[c.party_kind]}
              </span>
            }
            rows={[
              {
                label: c.party_kind === "individual" ? "Паспорт" : "ИНН",
                value:
                  c.party_kind === "individual"
                    ? [c.passport_series, c.passport_number].filter(Boolean).join(" ") || "—"
                    : c.inn || "—",
              },
              {
                label: "Аренд",
                value: rentals.filter((r) => r.counterparty_id === c.id).length,
              },
            ]}
            actions={
              <>
                <button
                  onClick={() => onEdit(c)}
                  className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/5 text-xs text-white/70"
                >
                  <Icon name="Pencil" size={15} />
                  Изменить
                </button>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
                  <DeleteButton onConfirm={() => onRemove(c.id)} />
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
                <th className="py-2 pr-4 text-left font-medium">Контрагент</th>
                <th className="py-2 pr-4 text-left font-medium">Тип</th>
                <th className="py-2 pr-4 text-left font-medium">Документ</th>
                <th className="py-2 pr-4 text-left font-medium">Телефон</th>
                <th className="py-2 pr-4 text-left font-medium">Аренд</th>
                <th className="py-2 pr-4 text-left font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {counterparties.map((c) => (
                <tr key={c.id} className="border-b border-white/5 last:border-0">
                  <td className="py-3 pr-4">{c.display_name}</td>
                  <td className="py-3 pr-4 text-white/60">{PARTY_LABEL[c.party_kind]}</td>
                  <td className="py-3 pr-4 text-white/60">
                    {c.party_kind === "individual"
                      ? [c.passport_series, c.passport_number].filter(Boolean).join(" ") || "—"
                      : c.inn
                      ? `ИНН ${c.inn}`
                      : "—"}
                  </td>
                  <td className="py-3 pr-4 text-white/60">{c.phone || "—"}</td>
                  <td className="py-3 pr-4">
                    {rentals.filter((r) => r.counterparty_id === c.id).length}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onEdit(c)}
                        className="text-white/40 transition-colors hover:text-white"
                        title="Изменить"
                      >
                        <Icon name="Pencil" size={16} />
                      </button>
                      <DeleteButton onConfirm={() => onRemove(c.id)} />
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

export default CounterpartiesList
