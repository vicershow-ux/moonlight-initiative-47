import Icon from "@/components/ui/icon"
import { Rental } from "@/lib/api"
import { money, rentalTotal } from "@/lib/rental"
import { ghostBtn } from "./rentalsUi"

interface Props {
  rental: Rental
  edited: boolean
  onRegenerate: () => void
}

export function ContractTermsCard({ rental, edited, onRegenerate }: Props) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1f1f1f] p-4 text-sm">
      <div className="mb-3 text-xs uppercase text-white/40">Условия аренды</div>
      <div className="space-y-2 text-white/70">
        <div className="flex justify-between gap-3">
          <span className="text-white/40">Инструмент</span>
          <span className="text-right">{rental.item_name}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-white/40">Количество</span>
          <span>
            {Number(rental.qty)} {rental.unit}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-white/40">Сумма аренды</span>
          <span className="text-[#D4AF37]">{money(rentalTotal(rental))}</span>
        </div>
        {Number(rental.deposit) > 0 && (
          <div className="flex justify-between gap-3">
            <span className="text-white/40">Залог</span>
            <span>{money(Number(rental.deposit))}</span>
          </div>
        )}
      </div>
      <button onClick={onRegenerate} className={`${ghostBtn} mt-4 w-full`}>
        <Icon name="RefreshCw" size={15} />
        Пересобрать текст
      </button>
      {edited && (
        <div className="mt-2 text-xs text-amber-400">
          Текст правился вручную — пересборка сотрёт правки
        </div>
      )}
    </div>
  )
}

export default ContractTermsCard
