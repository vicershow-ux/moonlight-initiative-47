import { Dispatch, SetStateAction } from "react"
import Icon from "@/components/ui/icon"
import { ToggleGroup } from "@/components/crm/contract-create/ToggleGroup"
import { InlineInput, InlineSelect } from "@/components/crm/contract-create/InlineField"
import { CompanyData, ContractOptions, ObjectItem } from "@/lib/api"
import { durationWordsOnlyRu } from "@/lib/numberToWordsRu"
import { copiesTotalOptions, copiesPerPartyOptions, daysKindOptions } from "./constants"

interface ContractLegalSectionProps {
  options: Required<ContractOptions>
  updateOption: <K extends keyof ContractOptions>(key: K, value: ContractOptions[K]) => void
  guaranteeNum: number
  company: CompanyData | null
  object: ObjectItem | null
  status: "draft" | "signed"
  setStatus: Dispatch<SetStateAction<"draft" | "signed">>
  error: string
}

export function ContractLegalSection({
  options,
  updateOption,
  guaranteeNum,
  company,
  object,
  status,
  setStatus,
  error,
}: ContractLegalSectionProps) {
  return (
    <>
  {/* 6. Гарантия на работы */}
  <h3 className="text-white font-semibold mt-6 mb-2">6. Гарантия на работы</h3>
  <ToggleGroup
    label="Гарантия на работы"
    value={options.warranty_mode}
    onChange={(v) => updateOption("warranty_mode", v)}
    options={[
      { value: "custom", label: "Установить гарантию" },
      { value: "by_law", label: "По закону" },
    ]}
  />
  {options.warranty_mode === "by_law" ? (
    <p>6.1. Гарантийный срок на выполненные Работы Договором не устанавливается. Стороны руководствуются гарантийными сроками, предусмотренными действующим законодательством Российской Федерации.</p>
  ) : (
    <p>
      6.1. Гарантийный срок на выполненные Работы составляет{" "}
      <InlineInput value={options.guarantee_months} onChange={(v) => updateOption("guarantee_months", v)} placeholder="6" minWidth={56} type="number" />
      {" "}(<span className="text-[#D4AF37]">{durationWordsOnlyRu(guaranteeNum, "months")}</span>) с даты подписания итогового Акта сдачи-приёмки Работ по Договору.
    </p>
  )}
  <p>
    6.2. Подрядчик несёт ответственность за недостатки Работ, обнаруженные в пределах гарантийного срока, и обязуется устранить
    их за свой счёт в течение{" "}
    <InlineInput value={options.defect_fix_days} onChange={(v) => updateOption("defect_fix_days", v)} placeholder="10" minWidth={56} type="number" />
    {" "}
    <InlineSelect value={options.defect_fix_days_kind || "working"} onChange={(v) => updateOption("defect_fix_days_kind", v)} options={daysKindOptions} />
    {" "}с момента получения соответствующего уведомления от Заказчика, если не докажет, что они произошли вследствие
    нормального износа Объекта, неправильной его эксплуатации либо ненадлежащего ремонта Объекта, произведённого самим
    Заказчиком или привлечёнными им третьими лицами.
  </p>
  <p>
    6.3. Ответственность за нарушение сроков. В случае просрочки выполнения Работ по вине Подрядчика Заказчик вправе
    потребовать уплаты неустойки (пени) в размере{" "}
    <InlineInput value={options.penalty_work_pct} onChange={(v) => updateOption("penalty_work_pct", v)} placeholder="0,1" minWidth={56} />
    {" "}% от стоимости невыполненного этапа Работ за каждый день просрочки, но не более{" "}
    <InlineInput value={options.penalty_work_max_pct} onChange={(v) => updateOption("penalty_work_max_pct", v)} placeholder="10" minWidth={56} />
    {" "}% от общей стоимости Договора.
  </p>
  <p>
    6.4. Ответственность за нарушение оплаты. В случае просрочки оплаты выполненных Работ по вине Заказчика Подрядчик вправе
    потребовать уплаты неустойки (пени) в размере{" "}
    <InlineInput value={options.penalty_pay_pct} onChange={(v) => updateOption("penalty_pay_pct", v)} placeholder="0,1" minWidth={56} />
    {" "}% от суммы просроченного платежа за каждый день просрочки, но не более{" "}
    <InlineInput value={options.penalty_pay_max_pct} onChange={(v) => updateOption("penalty_pay_max_pct", v)} placeholder="10" minWidth={56} />
    {" "}% от общей стоимости Договора.
  </p>
  <p>
    6.5. Стороны несут ответственность за неисполнение или ненадлежащее исполнение своих обязательств в соответствии с
    законодательством Российской Федерации.
  </p>

  {/* 7. Форс-мажор */}
  <h3 className="text-white font-semibold mt-6 mb-2">7. Форс-мажор</h3>
  <p>
    7.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему Договору,
    если это неисполнение явилось следствием обстоятельств непреодолимой силы (форс-мажор), возникших после заключения
    Договора, которые Стороны не могли предвидеть или предотвратить разумными мерами.
  </p>

  {/* 8. Разрешение споров */}
  <h3 className="text-white font-semibold mt-6 mb-2">8. Разрешение споров</h3>
  <p>
    8.1. Споры и разногласия, возникающие между Сторонами, решаются путём переговоров и предъявления письменной претензии.
    Срок рассмотрения претензии —{" "}
    <InlineInput value={options.claim_days} onChange={(v) => updateOption("claim_days", v)} placeholder="10" minWidth={56} type="number" />
    {" "}
    <InlineSelect value={options.claim_days_kind || "working"} onChange={(v) => updateOption("claim_days_kind", v)} options={daysKindOptions} />
    {" "}с момента её получения.
  </p>
  <ToggleGroup
    label="Порядок разрешения споров"
    value={options.dispute_venue}
    onChange={(v) => updateOption("dispute_venue", v)}
    options={[
      { value: "customer", label: "По месту Заказчика" },
      { value: "contractor", label: "По месту Подрядчика" },
      { value: "specific", label: "Конкретный суд" },
    ]}
  />
  <p>
    8.2. В случае недостижения согласия спор передаётся на рассмотрение в суд{" "}
    {options.dispute_venue === "specific" ? (
      <>
        <InlineInput value={options.dispute_court} onChange={(v) => updateOption("dispute_court", v)} placeholder="наименование суда" minWidth={160} />{" "}
        в соответствии с законодательством Российской Федерации.
      </>
    ) : options.dispute_venue === "contractor" ? (
      "по месту нахождения Подрядчика в соответствии с законодательством Российской Федерации."
    ) : (
      "по месту нахождения Заказчика в соответствии с законодательством Российской Федерации."
    )}
  </p>

  {/* 9. Заключительные положения */}
  <h3 className="text-white font-semibold mt-6 mb-2">9. Заключительные положения</h3>
  <p>
    9.1. Настоящий Договор вступает в силу с момента его подписания обеими Сторонами и действует до полного исполнения
    Сторонами своих обязательств.
  </p>
  <p>
    9.2. Договор составлен в{" "}
    <InlineSelect value={options.copies_total} onChange={(v) => updateOption("copies_total", v)} options={copiesTotalOptions} />
    {" "}экземплярах, имеющих равную юридическую силу, — по{" "}
    <InlineSelect value={options.copies_per_party} onChange={(v) => updateOption("copies_per_party", v)} options={copiesPerPartyOptions} />
    {" "}для каждой из Сторон.
  </p>

  {/* 10. Реквизиты и подписи сторон */}
  <h3 className="text-white font-semibold mt-6 mb-2">10. Реквизиты и подписи сторон</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/10 pt-4 items-stretch">
    <div className="md:border-r md:border-white/10 md:pr-6 flex flex-col">
      <p className="text-xs uppercase tracking-wide text-white/50 mb-2">Подрядчик (Исполнитель)</p>
      <p className="font-semibold text-white">{company?.name || company?.contact_full_name || options.contractor_name || "—"}</p>
      {company?.phone && <p className="text-sm text-white/70">Тел.: {company.phone}</p>}
      {company?.email && <p className="text-sm text-white/70">Email: {company.email}</p>}
      {company?.inn && <p className="text-sm text-white/70">ИНН: {company.inn}</p>}
      {company?.legal_address && <p className="text-sm text-white/70">Юр. адрес: {company.legal_address}</p>}
      {company?.bank_name && <p className="text-sm text-white/70">Банк: {company.bank_name}</p>}
      {company?.account_number && <p className="text-sm text-white/70">Р/с: {company.account_number}</p>}
      <div className="mt-auto pt-10">
        <p className="text-xs uppercase tracking-wide text-white/50 mb-6">От имени Подрядчика</p>
        <div className="border-t border-white/30 pt-1 max-w-[240px]">
          <p className="font-semibold text-white text-sm">{company?.contact_full_name || options.contractor_name || "—"}</p>
          <p className="text-xs text-white/40">(подпись, М.П.)</p>
        </div>
      </div>
    </div>
    <div className="flex flex-col">
      <p className="text-xs uppercase tracking-wide text-white/50 mb-2">Заказчик</p>
      <p className="font-semibold text-white">{options.customer_name || object?.client_name || "—"}</p>
      {object?.client_phone && <p className="text-sm text-white/70">Тел.: {object.client_phone}</p>}
      {object?.email && <p className="text-sm text-white/70">Email: {object.email}</p>}
      {options.object_address && <p className="text-sm text-white/70">Адрес: {options.object_address}</p>}
      <div className="mt-auto pt-10">
        <p className="text-xs uppercase tracking-wide text-white/50 mb-6">От имени Заказчика</p>
        <div className="border-t border-white/30 pt-1 max-w-[240px]">
          <p className="font-semibold text-white text-sm">{options.customer_name || object?.client_name || "—"}</p>
          <p className="text-xs text-white/40">(подпись)</p>
        </div>
      </div>
    </div>
  </div>

  {/* Статус договора */}
  <div className="mt-6">
    <ToggleGroup
      label="Статус договора"
      value={status}
      onChange={(v) => setStatus(v)}
      options={[
        { value: "draft", label: "Черновик" },
        { value: "signed", label: "Подписан" },
      ]}
    />
  </div>

  {error && (
    <p className="text-sm text-red-400 flex items-center gap-1.5 mt-4">
      <Icon name="CircleAlert" size={15} />
      {error}
    </p>
  )}
    </>
  )
}

export default ContractLegalSection
