import { ReactNode } from "react"
import { DeleteButton } from "@/components/ui/delete-button"
import type { RoomWorkItem } from "@/components/crm/estimate-create/EstimateRoomBlock"

const formatMoney = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(Number.isFinite(n) ? n : 0) + " ₽"

const inputCls =
  "bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2.5 outline-none w-full text-base focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"

interface Props {
  work: RoomWorkItem
  updateWork: (key: string, patch: Partial<RoomWorkItem>) => void
  removeWork: (key: string) => void
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-white/40 min-w-0">
      {label}
      {children}
    </label>
  )
}

function NumInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      value={value === 0 ? "" : value}
      onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      className={inputCls}
    />
  )
}

export function EstimateWorkMobileCard({ work: w, updateWork, removeWork }: Props) {
  const isFromCatalog = !!w.service_id
  return (
    <div className="bg-[#161616]/60 border border-white/10 rounded-xl p-3 flex flex-col gap-3">
      <div className="min-w-0">
        {isFromCatalog ? (
          <p className="text-sm font-medium leading-snug break-words">{w.name}</p>
        ) : (
          <Field label="Работа">
            <textarea
              value={w.name}
              onChange={(e) => updateWork(w.key, { name: e.target.value })}
              placeholder="Название работы"
              rows={2}
              className={`${inputCls} resize-none leading-snug text-white`}
            />
          </Field>
        )}
        {(w.category || w.subcategory) && (
          <p className="text-xs text-white/35 mt-1 break-words">{[w.category, w.subcategory].filter(Boolean).join(" → ")}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Ед.">
          {isFromCatalog ? (
            <p className="py-2.5 text-base text-white">{w.unit}</p>
          ) : (
            <input value={w.unit} onChange={(e) => updateWork(w.key, { unit: e.target.value })} className={`${inputCls} text-white`} />
          )}
        </Field>
        <Field label="Кол-во">
          <NumInput value={w.quantity} onChange={(v) => updateWork(w.key, { quantity: v })} />
        </Field>
        <Field label="Раз">
          <NumInput value={w.times} onChange={(v) => updateWork(w.key, { times: v })} />
        </Field>
        <Field label="Цена">
          {isFromCatalog ? (
            <p className="py-2.5 text-base text-white break-all">{formatMoney(w.price)}</p>
          ) : (
            <NumInput value={w.price} onChange={(v) => updateWork(w.key, { price: v })} />
          )}
        </Field>
        <Field label="Скидка %">
          <NumInput value={w.discountPercent} onChange={(v) => updateWork(w.key, { discountPercent: v })} />
        </Field>
        <Field label="Сумма">
          <p className="py-2.5 text-base font-medium text-white break-all">
            {w.quantity > 0 && w.times > 0 && w.price > 0 ? formatMoney(w.amount) : "—"}
          </p>
        </Field>
      </div>

      <DeleteButton
        size={15}
        label="Удалить работу"
        className="w-full min-h-[44px] justify-center rounded-lg bg-red-500/10 text-red-300 text-sm"
        title="Удалить работу?"
        description="Позиция будет убрана из сметы."
        onConfirm={() => removeWork(w.key)}
      />
    </div>
  )
}

export default EstimateWorkMobileCard
