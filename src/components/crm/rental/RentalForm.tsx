import { useMemo, useState } from "react"
import Icon from "@/components/ui/icon"
import {
  Rental,
  RentalCounterparty,
  RentalStockItem,
  WarehouseObject,
} from "@/lib/api"
import { PERIOD_LABEL, money, num, periodsCount, rentalTotal } from "@/lib/rental"

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"

export interface RentalFormValue {
  direction: "out" | "in"
  warehouse_item_id: string
  item_name: string
  unit: string
  qty: string
  counterparty_id: string
  object_id: string
  rate: string
  rate_period: "day" | "week" | "month"
  deposit: string
  date_from: string
  date_to: string
  condition_note: string
  notes: string
}

export const emptyRentalForm = (): RentalFormValue => ({
  direction: "out",
  warehouse_item_id: "",
  item_name: "",
  unit: "шт",
  qty: "1",
  counterparty_id: "",
  object_id: "",
  rate: "",
  rate_period: "day",
  deposit: "",
  date_from: new Date().toISOString().slice(0, 10),
  date_to: "",
  condition_note: "",
  notes: "",
})

export const rentalToForm = (r: Rental): RentalFormValue => ({
  direction: r.direction,
  warehouse_item_id: r.warehouse_item_id ? String(r.warehouse_item_id) : "",
  item_name: r.item_name,
  unit: r.unit,
  qty: String(num(r.qty)),
  counterparty_id: r.counterparty_id ? String(r.counterparty_id) : "",
  object_id: r.object_id ? String(r.object_id) : "",
  rate: String(num(r.rate)),
  rate_period: r.rate_period,
  deposit: String(num(r.deposit)),
  date_from: r.date_from ? String(r.date_from).slice(0, 10) : "",
  date_to: r.date_to ? String(r.date_to).slice(0, 10) : "",
  condition_note: r.condition_note || "",
  notes: r.notes || "",
})

interface Props {
  value: RentalFormValue
  onChange: (patch: Partial<RentalFormValue>) => void
  stock: RentalStockItem[]
  counterparties: RentalCounterparty[]
  objects: WarehouseObject[]
  onCreateCounterparty: () => void
  editing?: boolean
}

export function RentalForm({
  value,
  onChange,
  stock,
  counterparties,
  objects,
  onCreateCounterparty,
  editing,
}: Props) {
  const [manualItem, setManualItem] = useState(!value.warehouse_item_id && !!value.item_name)

  const selectedItem = useMemo(
    () => stock.find((i) => String(i.id) === value.warehouse_item_id),
    [stock, value.warehouse_item_id],
  )

  const preview = useMemo(() => {
    const fake = {
      date_from: value.date_from,
      date_to: value.date_to || null,
      rate_period: value.rate_period,
      returned_at: null,
      rate: num(value.rate),
      qty: num(value.qty),
    }
    return { periods: periodsCount(fake), total: rentalTotal(fake) }
  }, [value.date_from, value.date_to, value.rate_period, value.rate, value.qty])

  const isOut = value.direction === "out"

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["out", "in"] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onChange({ direction: d })}
            className={`min-h-[44px] flex-1 rounded-lg px-4 text-sm transition-colors sm:flex-none ${
              value.direction === d
                ? "bg-[#D4AF37] text-[#161616]"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {d === "out" ? "Мы сдаём в аренду" : "Мы берём в аренду"}
          </button>
        ))}
      </div>

      {isOut && !editing && (
        <div>
          <label className="mb-1.5 block text-xs text-white/50">Инструмент со склада</label>
          <select
            className={inputCls}
            value={manualItem ? "manual" : value.warehouse_item_id}
            onChange={(e) => {
              if (e.target.value === "manual") {
                setManualItem(true)
                onChange({ warehouse_item_id: "", item_name: "" })
                return
              }
              setManualItem(false)
              const item = stock.find((i) => String(i.id) === e.target.value)
              onChange({
                warehouse_item_id: e.target.value,
                item_name: item?.name || "",
                unit: item?.unit || "шт",
              })
            }}
          >
            <option value="">Выберите позицию со склада</option>
            {stock.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} — свободно {num(i.qty)} {i.unit}
                {i.warehouse_name ? ` · ${i.warehouse_name}` : ""}
              </option>
            ))}
            <option value="manual">Указать вручную (не со склада)</option>
          </select>
          {selectedItem && (
            <div className="mt-1.5 text-xs text-white/40">
              При выдаче количество спишется со склада «{selectedItem.warehouse_name || "без склада"}»
            </div>
          )}
          {stock.length === 0 && (
            <div className="mt-1.5 text-xs text-amber-400">
              На складе нет инструмента и оборудования — укажите позицию вручную
            </div>
          )}
        </div>
      )}

      {(manualItem || !isOut || editing) && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs text-white/50">Наименование</label>
            <input
              className={inputCls}
              value={value.item_name}
              onChange={(e) => onChange({ item_name: e.target.value })}
              placeholder="Перфоратор Bosch GBH 2-26"
            />
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs text-white/50">Количество</label>
          <input
            className={inputCls}
            type="number"
            min="0.01"
            step="0.01"
            value={value.qty}
            onChange={(e) => onChange({ qty: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-white/50">Единица</label>
          <input
            className={inputCls}
            value={value.unit}
            onChange={(e) => onChange({ unit: e.target.value })}
            placeholder="шт"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-white/50">Залог, ₽</label>
          <input
            className={inputCls}
            type="number"
            min="0"
            step="1"
            value={value.deposit}
            onChange={(e) => onChange({ deposit: e.target.value })}
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs text-white/50">
          {isOut ? "Кому выдаём" : "У кого арендуем"}
        </label>
        <div className="flex gap-2">
          <select
            className={inputCls}
            value={value.counterparty_id}
            onChange={(e) => onChange({ counterparty_id: e.target.value })}
          >
            <option value="">Выберите контрагента</option>
            {counterparties.map((c) => (
              <option key={c.id} value={c.id}>
                {c.display_name}
                {c.phone ? ` · ${c.phone}` : ""}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onCreateCounterparty}
            className="flex min-h-[42px] shrink-0 items-center gap-1.5 rounded-lg bg-white/5 px-3 text-sm text-white/70 transition-colors hover:bg-white/10"
          >
            <Icon name="UserPlus" size={16} />
            <span className="hidden sm:inline">Новый</span>
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs text-white/50">Ставка, ₽</label>
          <input
            className={inputCls}
            type="number"
            min="0"
            step="1"
            value={value.rate}
            onChange={(e) => onChange({ rate: e.target.value })}
            placeholder="0"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-white/50">За период</label>
          <select
            className={inputCls}
            value={value.rate_period}
            onChange={(e) => onChange({ rate_period: e.target.value as "day" | "week" | "month" })}
          >
            <option value="day">За сутки</option>
            <option value="week">За неделю</option>
            <option value="month">За месяц</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-white/50">Объект (необязательно)</label>
          <select
            className={inputCls}
            value={value.object_id}
            onChange={(e) => onChange({ object_id: e.target.value })}
          >
            <option value="">Не привязан</option>
            {objects.map((o) => (
              <option key={o.id} value={o.id}>
                {o.object_code} — {o.client_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs text-white/50">Дата выдачи</label>
          <input
            className={inputCls}
            type="date"
            value={value.date_from}
            onChange={(e) => onChange({ date_from: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-white/50">Вернуть до</label>
          <input
            className={inputCls}
            type="date"
            value={value.date_to}
            onChange={(e) => onChange({ date_to: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs text-white/50">Состояние при передаче</label>
        <input
          className={inputCls}
          value={value.condition_note}
          onChange={(e) => onChange({ condition_note: e.target.value })}
          placeholder="Исправен, в кейсе, два бура в комплекте"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs text-white/50">Заметка</label>
        <textarea
          className={`${inputCls} min-h-[60px] resize-y`}
          value={value.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
        />
      </div>

      {num(value.rate) > 0 && (
        <div className="rounded-lg border border-[#D4AF37]/30 bg-[#161616] p-4">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase text-white/40">
            <Icon name="Calculator" size={14} className="text-[#D4AF37]" />
            Предварительный расчёт
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <div className="text-xs text-white/40">Срок</div>
              <div>
                {preview.periods} × {PERIOD_LABEL[value.rate_period]}
              </div>
            </div>
            <div>
              <div className="text-xs text-white/40">Ставка</div>
              <div>
                {money(num(value.rate))} за {PERIOD_LABEL[value.rate_period]}
              </div>
            </div>
            <div>
              <div className="text-xs text-white/40">Итого</div>
              <div className="text-[#D4AF37]">{money(preview.total)}</div>
            </div>
          </div>
          {!value.date_to && (
            <div className="mt-2 border-t border-white/10 pt-2 text-xs text-white/40">
              Срок возврата не указан — сумма считается по сегодняшний день
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RentalForm
