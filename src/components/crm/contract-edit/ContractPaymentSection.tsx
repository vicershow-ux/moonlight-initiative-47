import { ToggleGroup } from "@/components/crm/contract-create/ToggleGroup"
import { InlineInput, InlineSelect } from "@/components/crm/contract-create/InlineField"
import { ContractOptions } from "@/lib/api"
import { moneyInWords } from "@/lib/numberToWordsRu"
import { PaymentSchedule } from "./ContractScheduleParts"
import { daysKindOptions } from "./constants"

interface ContractPaymentSectionProps {
  options: Required<ContractOptions>
  updateOption: <K extends keyof ContractOptions>(key: K, value: ContractOptions[K]) => void
  total: number
  fixedAmountNum: number
}

export function ContractPaymentSection({
  options,
  updateOption,
  total,
  fixedAmountNum,
}: ContractPaymentSectionProps) {
  return (
    <>
  {/* 3. Стоимость */}
  <h3 className="text-white font-semibold mt-6 mb-2">3. Стоимость работ и порядок оплаты</h3>
  <ToggleGroup
    label="Стоимость работ"
    required
    value={options.cost_type}
    onChange={(v) => updateOption("cost_type", v)}
    options={[
      { value: "fixed", label: "Фиксированная стоимость" },
      { value: "by_estimate", label: "Стоимость по смете" },
    ]}
  />
  {options.cost_type === "fixed" ? (
    <p>
      3.1. Общая стоимость Работ по настоящему Договору составляет{" "}
      <InlineInput
        value={options.fixed_amount}
        onChange={(v) => updateOption("fixed_amount", v)}
        placeholder={total ? String(Math.round(total)) : "сумма"}
        minWidth={90}
        type="number"
      />
      {" "}рублей (<span className="text-[#D4AF37]">{moneyInWords(fixedAmountNum)}</span>) и является твёрдой и окончательной.
    </p>
  ) : (
    <p>
      3.1. Стоимость Работ определяется в соответствии со Сметой (Приложение №1) и может уточняться по соглашению Сторон при
      изменении объёмов Работ.
    </p>
  )}

  <ToggleGroup
    label="Порядок оплаты"
    required
    value={options.payment_order}
    onChange={(v) => updateOption("payment_order", v)}
    options={[
      { value: "advance_staged", label: "Аванс + поэтапно по актам" },
      { value: "full_prepayment", label: "100% предоплата" },
      { value: "on_completion", label: "Оплата по факту" },
    ]}
  />
  <p>
    3.2.{" "}
    {{
      advance_staged: "Оплата производится Заказчиком поэтапно, в соответствии с Актами сдачи-приёмки выполненных Работ.",
      full_prepayment: "Оплата производится Заказчиком в размере 100% стоимости Работ до начала их выполнения.",
      on_completion: "Оплата производится Заказчиком по факту выполнения и приёмки Работ в полном объёме.",
    }[options.payment_order]}
  </p>

  {options.payment_order === "advance_staged" && (
    <>
      <ToggleGroup
        label="График платежей"
        value={options.payment_schedule}
        onChange={(v) => updateOption("payment_schedule", v)}
        options={[
          { value: "advance_4_stages", label: "Аванс + 4 этапа" },
          { value: "advance_3_stages", label: "Аванс + 3 этапа" },
          { value: "advance_2_stages", label: "Аванс + 2 этапа" },
          { value: "custom_schedule", label: "Свой график" },
        ]}
      />
      <PaymentSchedule
        scheduleKey={options.payment_schedule}
        total={options.cost_type === "fixed" ? fixedAmountNum : total}
        amounts={options.schedule_amounts}
        onAmountChange={(idx, v) => {
          const next = { ...(options.schedule_amounts || {}), [idx]: v }
          updateOption("schedule_amounts", next)
        }}
        customStages={options.custom_stages || []}
        onCustomStagesChange={(next) => updateOption("custom_stages", next)}
      />
    </>
  )}

  <p>
    3.3. Оплата по каждому этапу производится в течение{" "}
    <InlineInput value={options.payment_days} onChange={(v) => updateOption("payment_days", v)} placeholder="5" minWidth={56} type="number" />
    {" "}
    <InlineSelect value={options.payment_days_kind || "working"} onChange={(v) => updateOption("payment_days_kind", v)} options={daysKindOptions} />
    {" "}с момента подписания Заказчиком соответствующего Акта сдачи-приёмки Работ.
  </p>

  {/* Способ оплаты */}
  <ToggleGroup
    label="Способ оплаты"
    value={options.payment_method}
    onChange={(v) => updateOption("payment_method", v)}
    options={[
      { value: "cash_or_bank", label: "Наличные или безнал" },
      { value: "bank_only", label: "Только безнал" },
      { value: "cash_only", label: "Только наличные" },
    ]}
  />
  <p>
    3.4. Способ оплаты:{" "}
    {{
      cash_or_bank: "наличные денежные средства или безналичный перевод на расчётный счёт Подрядчика, указанный в разделе с реквизитами настоящего Договора.",
      bank_only: "безналичный перевод на расчётный счёт Подрядчика, указанный в разделе с реквизитами настоящего Договора.",
      cash_only: "наличные денежные средства, указанные в разделе с реквизитами настоящего Договора.",
    }[options.payment_method]}
  </p>

  {/* Скрытые дефекты */}
  <ToggleGroup
    label="Условие о скрытых дефектах"
    value={options.hidden_defects}
    onChange={(v) => updateOption("hidden_defects", v)}
    options={[
      { value: "include", label: "Включить" },
      { value: "exclude", label: "Не включать" },
    ]}
  />
  {options.hidden_defects === "include" && (
    <p>
      3.5. Стоимость Договора не учитывает скрытые дефекты Объекта, которые невозможно было обнаружить при первоначальном
      осмотре. В случае выявления в процессе ремонта необходимости проведения дополнительных или скрытых работ Подрядчик
      обязан приостановить работы и уведомить об этом Заказчика. Объём и стоимость таких работ оформляются Дополнительным
      соглашением. В случае отказа Заказчика от их оплаты, если без выполнения этих работ невозможно качественное и
      безопасное продолжение ремонта, Подрядчик вправе в одностороннем порядке отказаться от исполнения Договора с оплатой
      фактически выполненных Работ.
    </p>
  )}

  {/* 4. Закупка материалов */}
  <h3 className="text-white font-semibold mt-6 mb-2">4. Материалы и закупка</h3>
  <ToggleGroup
    label="Закупка материалов"
    value={options.materials}
    onChange={(v) => updateOption("materials", v)}
    options={[
      { value: "customer", label: "За счёт Заказчика" },
      { value: "contractor", label: "За счёт Подрядчика" },
      { value: "mixed", label: "Смешанно" },
    ]}
  />
  {options.materials === "customer" && (
    <>
      <p>
        4.1. Закупка строительных и отделочных материалов, необходимых для выполнения Работ, осуществляется за счёт
        Заказчика.
      </p>
      <p>
        4.2. Заказчик может выделить Подрядчику денежные средства на закупку материалов по предварительному согласованию
        Сторон. Способ передачи денежных средств: наличные денежные средства или безналичный перевод на расчётный счёт
        Подрядчика, указанный в разделе с реквизитами настоящего Договора.
      </p>
      <p>
        4.3. В случае закупки материалов Подрядчиком за счёт средств Заказчика Подрядчик обязуется использовать средства
        строго по назначению, предоставлять отчёт по каждой закупке, передавать Заказчику оригиналы чеков, накладных и иных
        подтверждающих документов на приобретённые материалы, а также предоставлять отчёт по доставке и сопутствующим
        расходам.
      </p>
      <p>
        4.4. Все неиспользованные денежные средства, выделенные Заказчиком на закупку, подлежат возврату Заказчику в течение{" "}
        <InlineInput value={options.materials_return_days} onChange={(v) => updateOption("materials_return_days", v)} placeholder="3" minWidth={56} type="number" />
        {" "}
        <InlineSelect value={options.materials_return_days_kind || "working"} onChange={(v) => updateOption("materials_return_days_kind", v)} options={daysKindOptions} />
        {" "}с момента завершения закупок по соответствующему этапу.
      </p>
      <p>
        4.5. Подрядчик своими силами и за свой счёт осуществляет погрузочно-разгрузочные работы, а также подъём и спуск
        материалов, инструментов и мусора на Объекте. Заказчик самостоятельно оплачивает доставку материалов до Объекта, а
        также аренду и вывоз контейнера для строительного мусора.
      </p>
      <p>
        4.6. Подрядчик не несёт ответственности за качество строительных и отделочных материалов, приобретённых Заказчиком
        самостоятельно, и вправе отказаться от их использования, если они имеют явные дефекты или не соответствуют
        технологическим требованиям.
      </p>
    </>
  )}

  {options.materials === "contractor" && (
    <>
      <p>
        4.1. Закупка строительных и отделочных материалов, необходимых для выполнения Работ, осуществляется Подрядчиком, их
        стоимость включена в общую стоимость Работ по настоящему Договору.
      </p>
      <p>
        4.2. Подрядчик своими силами и за свой счёт осуществляет доставку материалов до Объекта, погрузочно-разгрузочные
        работы, а также подъём и спуск материалов, инструментов и мусора на Объекте.
      </p>
      <p>
        4.3. Подрядчик гарантирует, что используемые материалы являются новыми, надлежащего качества и соответствуют
        действующим стандартам и технологическим требованиям.
      </p>
    </>
  )}

  {options.materials === "mixed" && (
    <>
      <p>
        4.1. Черновые материалы приобретаются Подрядчиком и включаются в стоимость Работ, чистовые (отделочные) материалы
        приобретаются за счёт Заказчика. Распределение материалов по видам определяется Сметой (Приложение №1).
      </p>
      <p>
        4.2. Подрядчик своими силами и за свой счёт осуществляет погрузочно-разгрузочные работы, а также подъём и спуск
        материалов, инструментов и мусора на Объекте.
      </p>
      <p>
        4.3. Подрядчик не несёт ответственности за качество материалов, приобретённых Заказчиком самостоятельно, и вправе
        отказаться от их использования при наличии явных дефектов или несоответствия технологическим требованиям.
      </p>
    </>
  )}

  {/* 5. Порядок сдачи и приёмки работ */}
  <h3 className="text-white font-semibold mt-6 mb-2">5. Порядок сдачи и приёмки работ</h3>
  <p>
    5.1. По завершении каждого этапа Работ (а по завершении всех Работ — по завершении последнего этапа) Подрядчик
    предоставляет Заказчику Акт сдачи-приёмки выполненных работ и отчётную документацию.
  </p>
  <p>
    5.2. Заказчик обязан в течение{" "}
    <InlineInput value={options.acceptance_days} onChange={(v) => updateOption("acceptance_days", v)} placeholder="5" minWidth={56} type="number" />
    {" "}
    <InlineSelect value={options.acceptance_days_kind || "working"} onChange={(v) => updateOption("acceptance_days_kind", v)} options={daysKindOptions} />
    {" "}с момента получения Акта либо принять работы и подписать Акт, либо направить Подрядчику мотивированный отказ от
    приёмки с указанием выявленных замечаний.
  </p>

  {/* Направление документов */}
  <ToggleGroup
    label="Направление документов"
    value={options.doc_delivery}
    onChange={(v) => updateOption("doc_delivery", v)}
    options={[
      { value: "personal_messengers", label: "Лично + мессенджеры" },
      { value: "personal_mail", label: "Лично / почтой" },
      { value: "email", label: "По электронной почте" },
    ]}
  />
  <p>
    5.3.{" "}
    {{
      personal_messengers: "Направление Актов сдачи-приёмки, отчётов, уведомлений о дополнительных работах и иных документов осуществляется Сторонами путём личного вручения либо с использованием мессенджеров (WhatsApp, Telegram) по номерам телефонов Сторон, указанным в разделе с реквизитами настоящего Договора. Документ считается полученным в день его отправки в мессенджере.",
      personal_mail: "Направление документов осуществляется путём личного вручения под расписку либо заказным письмом с уведомлением о вручении по адресам Сторон, указанным в разделе с реквизитами настоящего Договора.",
      email: "Направление документов осуществляется по адресам электронной почты Сторон, указанным в разделе с реквизитами настоящего Договора. Документ считается полученным на следующий рабочий день после его отправки.",
    }[options.doc_delivery]}
  </p>
  <p>
    5.4. В случае если в течение{" "}
    <InlineInput value={options.unilateral_days} onChange={(v) => updateOption("unilateral_days", v)} placeholder="5" minWidth={56} type="number" />
    {" "}
    <InlineSelect value={options.unilateral_days_kind || "working"} onChange={(v) => updateOption("unilateral_days_kind", v)} options={daysKindOptions} />
    {" "}с момента отправки Акта сдачи-приёмки Заказчик не подпишет его или не направит Подрядчику письменный мотивированный
    отказ, работы по соответствующему этапу считаются принятыми Заказчиком в полном объёме и надлежащего качества. В этом
    случае односторонний Акт, подписанный Подрядчиком, имеет полную юридическую силу и является основанием для оплаты.
  </p>
    </>
  )
}

export default ContractPaymentSection
