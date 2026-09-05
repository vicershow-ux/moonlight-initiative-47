import Icon from "@/components/ui/icon"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CounterpartyForm } from "@/components/crm/rental/CounterpartyForm"
import { RentalForm, RentalFormValue } from "@/components/crm/rental/RentalForm"
import {
  Rental,
  RentalCounterparty,
  RentalStockItem,
  WarehouseObject,
} from "@/lib/api"
import { money, num, rentalTotal } from "@/lib/rental"
import { ghostBtn, goldBtn } from "./rentalsUi"

interface Props {
  error: string
  saving: boolean

  rentalOpen: boolean
  setRentalOpen: (open: boolean) => void
  editingRental: Rental | null
  form: RentalFormValue
  onFormChange: (patch: Partial<RentalFormValue>) => void
  stock: RentalStockItem[]
  counterparties: RentalCounterparty[]
  objects: WarehouseObject[]
  onCreateCounterparty: () => void
  onSaveRental: () => void

  cpOpen: boolean
  setCpOpen: (open: boolean) => void
  editingCp: RentalCounterparty | null
  cpForm: Partial<RentalCounterparty>
  onCpFormChange: (patch: Partial<RentalCounterparty>) => void
  onSaveCp: () => void

  returnFor: Rental | null
  setReturnFor: (rental: Rental | null) => void
  returnQty: string
  setReturnQty: (qty: string) => void
  returnNote: string
  setReturnNote: (note: string) => void
  onReturn: () => void
}

export function RentalsDialogs({
  error,
  saving,
  rentalOpen,
  setRentalOpen,
  editingRental,
  form,
  onFormChange,
  stock,
  counterparties,
  objects,
  onCreateCounterparty,
  onSaveRental,
  cpOpen,
  setCpOpen,
  editingCp,
  cpForm,
  onCpFormChange,
  onSaveCp,
  returnFor,
  setReturnFor,
  returnQty,
  setReturnQty,
  returnNote,
  setReturnNote,
  onReturn,
}: Props) {
  return (
    <>
      <Dialog open={rentalOpen} onOpenChange={setRentalOpen}>
        <DialogContent className="border-white/10 bg-[#1f1f1f] text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingRental ? "Изменить аренду" : "Оформить аренду"}</DialogTitle>
          </DialogHeader>

          <RentalForm
            value={form}
            onChange={onFormChange}
            stock={stock}
            counterparties={counterparties}
            objects={objects}
            onCreateCounterparty={onCreateCounterparty}
            editing={!!editingRental}
          />

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400">
              <Icon name="CircleAlert" size={15} />
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button className={ghostBtn} onClick={() => setRentalOpen(false)}>
              Отмена
            </button>
            <button className={goldBtn} onClick={onSaveRental} disabled={saving}>
              {saving ? (
                <Icon name="Loader2" size={16} className="animate-spin" />
              ) : (
                <Icon name="Check" size={16} />
              )}
              Сохранить
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={cpOpen} onOpenChange={setCpOpen}>
        <DialogContent className="border-white/10 bg-[#1f1f1f] text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCp ? "Изменить контрагента" : "Новый контрагент"}</DialogTitle>
          </DialogHeader>

          <CounterpartyForm value={cpForm} onChange={onCpFormChange} />

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400">
              <Icon name="CircleAlert" size={15} />
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button className={ghostBtn} onClick={() => setCpOpen(false)}>
              Отмена
            </button>
            <button className={goldBtn} onClick={onSaveCp} disabled={saving}>
              {saving ? (
                <Icon name="Loader2" size={16} className="animate-spin" />
              ) : (
                <Icon name="Check" size={16} />
              )}
              Сохранить
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!returnFor} onOpenChange={(v) => !v && setReturnFor(null)}>
        <DialogContent className="border-white/10 bg-[#1f1f1f] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Возврат инструмента</DialogTitle>
          </DialogHeader>

          {returnFor && (
            <div className="space-y-4">
              <div className="rounded-lg border border-white/10 bg-[#161616] p-4 text-sm">
                <div className="font-medium">{returnFor.item_name}</div>
                <div className="mt-1 text-white/40">
                  Выдано {num(returnFor.qty)} {returnFor.unit}
                  {num(returnFor.returned_qty) > 0 &&
                    `, уже вернули ${num(returnFor.returned_qty)}`}
                </div>
                <div className="mt-2 text-[#D4AF37]">
                  К оплате: {money(rentalTotal(returnFor))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-white/50">Сколько возвращают</label>
                <input
                  className="w-full rounded-lg border border-white/10 bg-[#161616] px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={returnQty}
                  onChange={(e) => setReturnQty(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-white/50">
                  Состояние при возврате
                </label>
                <textarea
                  className="min-h-[70px] w-full resize-y rounded-lg border border-white/10 bg-[#161616] px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  placeholder="Исправен, без повреждений"
                />
              </div>

              {returnFor.warehouse_item_id && returnFor.direction === "out" && (
                <div className="text-xs text-white/40">
                  Количество вернётся на склад автоматически
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button className={ghostBtn} onClick={() => setReturnFor(null)}>
                  Отмена
                </button>
                <button className={goldBtn} onClick={onReturn} disabled={saving}>
                  {saving ? (
                    <Icon name="Loader2" size={16} className="animate-spin" />
                  ) : (
                    <Icon name="Check" size={16} />
                  )}
                  Оформить возврат
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default RentalsDialogs
