import { Dispatch, SetStateAction } from "react"
import { ToggleGroup } from "@/components/crm/contract-create/ToggleGroup"
import { InlineInput, InlineSelect } from "@/components/crm/contract-create/InlineField"
import { ContractOptions, Estimate } from "@/lib/api"
import { durationWordsOnlyRu } from "@/lib/numberToWordsRu"
import { WorkStages } from "./ContractScheduleParts"
import { formatMoney, durationUnitOptions } from "./constants"

interface ContractSubjectSectionProps {
  options: Required<ContractOptions>
  updateOption: <K extends keyof ContractOptions>(key: K, value: ContractOptions[K]) => void
  estimateId: string
  setEstimateId: Dispatch<SetStateAction<string>>
  estimates: Estimate[]
  isStaged: boolean
  durationNum: number
}

export function ContractSubjectSection({
  options,
  updateOption,
  estimateId,
  setEstimateId,
  estimates,
  isStaged,
  durationNum,
}: ContractSubjectSectionProps) {
  return (
    <>
  {/* 1. Предмет договора */}
  <h3 className="text-white font-semibold mt-6 mb-2">1. Предмет договора</h3>
  <p>
    1.1. Подрядчик обязуется по заданию Заказчика выполнить ремонтно-отделочные работы (далее — «Работы») в квартире по
    адресу:{" "}
    <InlineInput value={options.object_address} onChange={(v) => updateOption("object_address", v)} placeholder="адрес объекта" minWidth={150} />
    {" "}(далее — «Объект»), а Заказчик обязуется принять результат Работ и оплатить его.
  </p>
  <p>
    1.2. Перечень, объёмы и стоимость Работ, а также график их выполнения определяются в{" "}
    <select
      value={estimateId}
      onChange={(e) => setEstimateId(e.target.value)}
      className="inline-block bg-[#161616] border border-[#D4AF37]/40 rounded px-1.5 py-0.5 text-sm text-white outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/40 mx-0.5 cursor-pointer align-baseline"
    >
      <option value="" className="bg-[#1f1f1f]">Смете (не выбрана)</option>
      {estimates.map((est) => (
        <option key={est.id} value={est.id} className="bg-[#1f1f1f]">
          Смете №{est.id} — {formatMoney(est.total_amount)}
        </option>
      ))}
    </select>
    , являющейся неотъемлемой частью настоящего Договора (Приложение №1 — Смета/Техническое задание).
  </p>

  {/* Дизайн-проект */}
  <ToggleGroup
    label="Дизайн-проект"
    value={options.design_project}
    onChange={(v) => updateOption("design_project", v)}
    options={[
      { value: "none", label: "Без дизайн-проекта" },
      { value: "with_project", label: "По дизайн-проекту" },
    ]}
  />
  {options.design_project === "with_project" && (
    <p>
      Работы выполняются в соответствии с дизайн-проектом, разработанным{" "}
      <InlineInput value={options.design_author} onChange={(v) => updateOption("design_author", v)} placeholder="студией / архитектором ..." minWidth={160} />
      {" "}и согласованным Сторонами, который является неотъемлемой частью настоящего Договора (Приложение №2).
    </p>
  )}
  <p>
    1.3. Качество работ должно соответствовать действующим строительным нормам и правилам (СНиП), сводам правил (СП),
    государственным стандартам (ГОСТ) и техническим регламентам. При отсутствии конкретных требований качество определяется
    общепринятой практикой выполнения строительных и отделочных работ.
  </p>

  {/* Порядок выполнения работ */}
  <ToggleGroup
    label="Порядок выполнения работ"
    required
    value={options.work_order}
    onChange={(v) => updateOption("work_order", v)}
    options={[
      { value: "staged", label: "Поэтапно (стандартные 4 этапа)" },
      { value: "single", label: "Единым комплексом" },
      { value: "custom", label: "Свой состав этапов" },
    ]}
  />
  {isStaged ? (
    <>
      <p>1.4. Работы выполняются поэтапно в соответствии со следующим графиком:</p>
      <p>1.4.1. Этап 1 — Подготовительные и черновые работы: демонтаж, возведение перегородок, грунтовка, штукатурка стен, стяжка пола, частичное выполнение инженерных и электромонтажных работ.</p>
      <p>1.4.2. Этап 2 — Санузел и ванная: гидроизоляция, укладка плитки, монтаж сантехнических коммуникаций и оборудования, электромонтаж, монтаж вентиляции.</p>
      <p>1.4.3. Этап 3 — Подготовка и инженерия: шпатлёвка, армирование, выравнивание и шлифовка стен, завершение электромонтажных и сантехнических работ, подготовка полов.</p>
      <p>1.4.4. Этап 4 — Финишные работы: напольные покрытия, обои/покраска, натяжные потолки, двери, чистовая сантехника, розетки, светильники, плинтусы.</p>
    </>
  ) : options.work_order === "single" ? (
    <p>
      1.4. Работы выполняются единым комплексом без разбивки на отдельные этапы. Промежуточные сроки и объёмы определяются
      Сметой (Приложение №1).
    </p>
  ) : (
    <WorkStages stages={options.work_stages || []} onChange={(next) => updateOption("work_stages", next)} />
  )}

  {/* Субподрядчики */}
  <ToggleGroup
    label="Привлечение субподрядчиков"
    value={options.subcontractors}
    onChange={(v) => updateOption("subcontractors", v)}
    options={[
      { value: "allowed", label: "Вправе привлекать" },
      { value: "personal_only", label: "Только лично" },
    ]}
  />
  <p>
    1.5.{" "}
    {options.subcontractors === "allowed"
      ? "Подрядчик вправе привлекать субподрядчиков для выполнения отдельных видов Работ, оставаясь ответственным перед Заказчиком за результат их деятельности."
      : "Подрядчик выполняет Работы лично, без привлечения субподрядчиков."}
  </p>

  {/* 2. Сроки */}
  <h3 className="text-white font-semibold mt-6 mb-2">2. Сроки выполнения работ</h3>
  <ToggleGroup
    label="Начало течения срока работ"
    required
    value={options.work_start}
    onChange={(v) => updateOption("work_start", v)}
    options={[
      { value: "advance_and_handover", label: "Аванс + передача ключей" },
      { value: "advance_only", label: "С момента аванса" },
      { value: "signing", label: "С момента подписания" },
    ]}
  />
  <p>
    2.1. Общий срок выполнения Работ составляет{" "}
    <InlineInput value={options.duration_months} onChange={(v) => updateOption("duration_months", v)} placeholder="6" minWidth={56} type="number" />
    {" "}
    <InlineSelect value={options.duration_unit || "months"} onChange={(v) => updateOption("duration_unit", v)} options={durationUnitOptions} />
    {" "}(<span className="text-[#D4AF37]">{durationWordsOnlyRu(durationNum, options.duration_unit || "months")}</span>). Течение срока начинается{" "}
    {{
      advance_and_handover:
        "с момента выполнения Заказчиком двух условий: внесения аванса, предусмотренного п. 3.2.1 настоящего Договора, и передачи Подрядчику ключей от Объекта с подписанием Сторонами Акта приёма-передачи Объекта в ремонт",
      advance_only: "с момента внесения Заказчиком аванса, предусмотренного п. 3.2.1 настоящего Договора",
      signing: "с момента подписания настоящего Договора обеими Сторонами",
    }[options.work_start]}
    .
  </p>
  <p>
    2.2. При нарушении Заказчиком обязательств, препятствующих выполнению Работ, Подрядчик вправе приостановить их выполнение.
    2.3. Сроки соразмерно отодвигаются на время просрочки со стороны Заказчика.
  </p>
    </>
  )
}

export default ContractSubjectSection
