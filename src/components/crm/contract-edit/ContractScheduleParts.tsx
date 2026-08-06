import Icon from "@/components/ui/icon"
import { InlineInput } from "@/components/crm/contract-create/InlineField"
import { moneyInWords } from "@/lib/numberToWordsRu"

type CustomStage = { label: string; amount: string; when: string }

export function PaymentSchedule({
  scheduleKey,
  total,
  amounts,
  onAmountChange,
  customStages,
  onCustomStagesChange,
}: {
  scheduleKey: string
  total: number
  amounts?: Record<string, string>
  onAmountChange: (idx: number, value: string) => void
  customStages: CustomStage[]
  onCustomStagesChange: (next: CustomStage[]) => void
}) {
  if (scheduleKey === "custom_schedule") {
    return (
      <CustomSchedule stages={customStages} onChange={onCustomStagesChange} />
    )
  }
  const scheduleMap: Record<string, [string, number, string][]> = {
    advance_4_stages: [
      ["Аванс", 25, "до начала выполнения Работ"],
      ["Этап 1", 25, "по завершении чернового этапа"],
      ["Этап 2", 25, "по завершении инженерного этапа"],
      ["Этап 3", 25, "по завершении финишных работ и подписания Акта сдачи-приёмки"],
    ],
    advance_3_stages: [
      ["Аванс", 30, "до начала выполнения Работ"],
      ["Этап 1", 40, "по завершении чернового и инженерного этапов"],
      ["Этап 2", 30, "по завершении финишных работ и подписания Акта сдачи-приёмки"],
    ],
    advance_2_stages: [
      ["Аванс", 50, "до начала выполнения Работ"],
      ["Этап 1", 50, "по завершении Работ и подписания Акта сдачи-приёмки"],
    ],
  }
  const schedule = scheduleMap[scheduleKey] || scheduleMap.advance_4_stages
  return (
    <>
      {schedule.map(([label, pct, when], i) => {
        const manual = amounts?.[i]
        const amountNum = manual ? Number(manual) || 0 : (total * pct) / 100
        return (
          <p key={i}>
            3.2.{i + 1}. {label} —{" "}
            <InlineInput
              value={manual ?? ""}
              onChange={(v) => onAmountChange(i, v)}
              placeholder={String(Math.round((total * pct) / 100))}
              minWidth={90}
              type="number"
            />
            {" "}рублей (<span className="text-[#D4AF37]">{moneyInWords(amountNum)}</span>). Оплачивается Заказчиком {when}.
          </p>
        )
      })}
    </>
  )
}

export function CustomSchedule({ stages, onChange }: { stages: CustomStage[]; onChange: (next: CustomStage[]) => void }) {
  const update = (i: number, patch: Partial<CustomStage>) => {
    onChange(stages.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
  }
  const remove = (i: number) => onChange(stages.filter((_, idx) => idx !== i))
  const add = () =>
    onChange([...stages, { label: `Этап ${stages.length}`, amount: "", when: "по завершении Работ и подписания Акта сдачи-приёмки" }])

  return (
    <>
      {stages.map((s, i) => {
        const amountNum = Number(s.amount) || 0
        return (
          <p key={i} className="group flex items-baseline flex-wrap gap-y-1">
            <span>3.2.{i + 1}.{" "}</span>
            <InlineInput value={s.label} onChange={(v) => update(i, { label: v })} placeholder="Название этапа" minWidth={80} />
            {" "}—{" "}
            <InlineInput value={s.amount} onChange={(v) => update(i, { amount: v })} placeholder="сумма" minWidth={90} type="number" />
            {" "}рублей (<span className="text-[#D4AF37]">{moneyInWords(amountNum)}</span>). Оплачивается Заказчиком{" "}
            <InlineInput value={s.when} onChange={(v) => update(i, { when: v })} placeholder="условие оплаты" minWidth={200} />.
            {stages.length > 1 && (
              <button
                type="button"
                onClick={() => remove(i)}
                className="ml-1 text-white/30 hover:text-[#D4AF37] opacity-0 group-hover:opacity-100 transition"
                title="Удалить этап"
              >
                <Icon name="X" size={15} />
              </button>
            )}
          </p>
        )
      })}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1 text-sm text-[#D4AF37] hover:text-[#E5C158] transition mt-1"
      >
        <Icon name="Plus" size={15} />
        Добавить этап
      </button>
    </>
  )
}

export function WorkStages({ stages, onChange }: { stages: string[]; onChange: (next: string[]) => void }) {
  const update = (i: number, value: string) => onChange(stages.map((s, idx) => (idx === i ? value : s)))
  const remove = (i: number) => onChange(stages.filter((_, idx) => idx !== i))
  const add = () => onChange([...stages, ""])

  return (
    <div className="space-y-2">
      <p className="mb-1">1.4. Работы выполняются поэтапно в соответствии со следующим графиком:</p>
      {stages.map((s, i) => (
        <div key={i} className="group flex items-start gap-2">
          <span className="pt-2 shrink-0 whitespace-nowrap">1.4.{i + 1}. Этап {i + 1} —</span>
          <textarea
            value={s}
            onChange={(e) => update(i, e.target.value)}
            placeholder="Опишите работы этапа..."
            rows={2}
            className="flex-1 bg-[#161616] border border-[#D4AF37]/40 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/40 placeholder:text-white/30 resize-y"
          />
          {stages.length > 1 && (
            <button
              type="button"
              onClick={() => remove(i)}
              className="pt-2 text-white/30 hover:text-[#D4AF37] opacity-0 group-hover:opacity-100 transition shrink-0"
              title="Удалить этап"
            >
              <Icon name="X" size={16} />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1 text-sm text-[#D4AF37] hover:text-[#E5C158] transition"
      >
        <Icon name="Plus" size={15} />
        Добавить этап
      </button>
    </div>
  )
}