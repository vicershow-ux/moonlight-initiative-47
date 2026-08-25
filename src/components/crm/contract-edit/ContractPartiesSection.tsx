import { Dispatch, SetStateAction } from "react"
import { ToggleGroup } from "@/components/crm/contract-create/ToggleGroup"
import { InlineInput, InlineSelect } from "@/components/crm/contract-create/InlineField"
import { ContractOptions } from "@/lib/api"
import { genderOptions } from "./constants"

interface ContractPartiesSectionProps {
  contractNumber: string
  setContractNumber: Dispatch<SetStateAction<string>>
  contractDate: string
  setContractDate: Dispatch<SetStateAction<string>>
  options: Required<ContractOptions>
  updateOption: <K extends keyof ContractOptions>(key: K, value: ContractOptions[K]) => void
}

export function ContractPartiesSection({
  contractNumber,
  setContractNumber,
  contractDate,
  setContractDate,
  options,
  updateOption,
}: ContractPartiesSectionProps) {
  return (
    <>
  {/* Заголовок */}
  <h2 className="text-center text-lg font-semibold text-white mb-2">
    Договор подряда на ремонт квартиры №{" "}
    <InlineInput value={contractNumber} onChange={setContractNumber} placeholder="№" minWidth={56} />
  </h2>
  <div className="flex items-center justify-between text-sm mb-6">
    <span>
      г.{" "}
      <InlineInput value={options.city} onChange={(v) => updateOption("city", v)} placeholder="г. Хабаровск" minWidth={90} />
    </span>
    <input
      type="date"
      value={contractDate}
      onChange={(e) => setContractDate(e.target.value)}
      className="bg-[#161616] border border-[#D4AF37]/40 rounded px-2 py-1 text-sm outline-none focus:border-[#D4AF37]"
    />
  </div>

  {/* Статус Заказчика */}
  <ToggleGroup
    label="Статус Заказчика"
    required
    value={options.customer_type}
    onChange={(v) => updateOption("customer_type", v)}
    options={[
      { value: "individual", label: "Физическое лицо" },
      { value: "legal", label: "Юридическое лицо" },
      { value: "entrepreneur", label: "Индивидуальный предприниматель" },
    ]}
  />

  {options.customer_type === "individual" && (
    <p>
      <InlineInput value={options.customer_name} onChange={(v) => updateOption("customer_name", v)} placeholder="ФИО заказчика" minWidth={120} />
      , действующ
      <InlineSelect value={options.customer_gender} onChange={(v) => updateOption("customer_gender", v)} options={genderOptions} />
      как физическое лицо (далее — «Заказчик»), с одной стороны, и
    </p>
  )}
  {options.customer_type === "entrepreneur" && (
    <p>
      Индивидуальный предприниматель{" "}
      <InlineInput value={options.customer_name} onChange={(v) => updateOption("customer_name", v)} placeholder="ФИО" minWidth={100} />
      , зарегистрирован
      <InlineSelect
        value={options.customer_gender}
        onChange={(v) => updateOption("customer_gender", v)}
        options={[{ value: "m", label: "ный" }, { value: "f", label: "ная" }]}
      />
      в реестре индивидуальных предпринимателей под №{" "}
      <InlineInput value={options.customer_ogrnip} onChange={(v) => updateOption("customer_ogrnip", v)} placeholder="указать ОГРНИП" minWidth={110} />
      {" "}(далее — «Заказчик»), с одной стороны, и
    </p>
  )}
  {options.customer_type === "legal" && (
    <p>
      <InlineInput value={options.customer_org_name} onChange={(v) => updateOption("customer_org_name", v)} placeholder="Укажите наименование" minWidth={150} />
      , именуемое в дальнейшем «Заказчик», от имени которого действует{" "}
      <InlineInput value={options.customer_director_position} onChange={(v) => updateOption("customer_director_position", v)} placeholder="генеральный директор" minWidth={130} />
      {" "}
      <InlineInput value={options.customer_director_name} onChange={(v) => updateOption("customer_director_name", v)} placeholder="ФИО" minWidth={90} />
      {" "}на основании{" "}
      <InlineInput value={options.customer_basis} onChange={(v) => updateOption("customer_basis", v)} placeholder="Устава" minWidth={70} />
      , с одной стороны, и
    </p>
  )}

  {/* Статус Подрядчика */}
  <ToggleGroup
    label="Статус Подрядчика"
    required
    value={options.contractor_type}
    onChange={(v) => updateOption("contractor_type", v)}
    options={[
      { value: "individual", label: "Физическое лицо" },
      { value: "self_employed", label: "Самозанятый (НПД)" },
      { value: "foreign_citizen", label: "Иностранный гражданин" },
      { value: "entrepreneur", label: "Индивидуальный предприниматель" },
      { value: "legal", label: "Юридическое лицо" },
    ]}
  />
  {options.contractor_type === "individual" && (
    <p>
      <InlineInput value={options.contractor_name} onChange={(v) => updateOption("contractor_name", v)} placeholder="ФИО подрядчика" minWidth={150} />
      , действующ
      <InlineSelect value={options.contractor_gender} onChange={(v) => updateOption("contractor_gender", v)} options={genderOptions} />
      как физическое лицо (далее — «Подрядчик»), с другой стороны,
    </p>
  )}
  {options.contractor_type === "self_employed" && (
    <p>
      <InlineInput value={options.contractor_name} onChange={(v) => updateOption("contractor_name", v)} placeholder="ФИО подрядчика" minWidth={150} />
      , действующ
      <InlineSelect value={options.contractor_gender} onChange={(v) => updateOption("contractor_gender", v)} options={genderOptions} />
      как физическое лицо с применением налогового режима «налог на профессиональный доход» (далее — «Подрядчик»), с другой
      стороны,
    </p>
  )}
  {options.contractor_type === "foreign_citizen" && (
    <p>
      <InlineInput value={options.contractor_name} onChange={(v) => updateOption("contractor_name", v)} placeholder="ФИО подрядчика" minWidth={150} />
      , граждан
      <InlineSelect
        value={options.contractor_gender}
        onChange={(v) => updateOption("contractor_gender", v)}
        options={[{ value: "m", label: "ин" }, { value: "f", label: "ка" }]}
      />
      {" "}
      <InlineInput value={options.contractor_country} onChange={(v) => updateOption("contractor_country", v)} placeholder="укажите страну" minWidth={110} />
      , основанием пребывания на территории Российской Федерации является{" "}
      <InlineInput value={options.contractor_residence_basis} onChange={(v) => updateOption("contractor_residence_basis", v)} placeholder="например ВНЖ" minWidth={100} />
      , наличие разрешения на работу подтверждается{" "}
      <InlineInput value={options.contractor_work_permit} onChange={(v) => updateOption("contractor_work_permit", v)} placeholder="например патент" minWidth={110} />
      , действующ
      <InlineSelect value={options.contractor_gender} onChange={(v) => updateOption("contractor_gender", v)} options={genderOptions} />
      как физическое лицо (далее — «Подрядчик»), с другой стороны,
    </p>
  )}
  {options.contractor_type === "entrepreneur" && (
    <p>
      Индивидуальный предприниматель{" "}
      <InlineInput value={options.contractor_name} onChange={(v) => updateOption("contractor_name", v)} placeholder="ФИО" minWidth={130} />
      , зарегистрирован
      <InlineSelect
        value={options.contractor_gender}
        onChange={(v) => updateOption("contractor_gender", v)}
        options={[{ value: "m", label: "ный" }, { value: "f", label: "ная" }]}
      />
      в реестре индивидуальных предпринимателей под №{" "}
      <InlineInput value={options.contractor_ogrnip} onChange={(v) => updateOption("contractor_ogrnip", v)} placeholder="указать ОГРНИП" minWidth={110} />
      {" "}(далее — «Подрядчик»), с другой стороны,
    </p>
  )}
  {options.contractor_type === "legal" && (
    <p>
      <InlineInput value={options.contractor_org_name} onChange={(v) => updateOption("contractor_org_name", v)} placeholder="Наименование" minWidth={130} />
      , именуемое в дальнейшем «Подрядчик», от имени которого действует{" "}
      <InlineInput value={options.contractor_director_position} onChange={(v) => updateOption("contractor_director_position", v)} placeholder="Директор" minWidth={90} />
      {" "}
      <InlineInput value={options.contractor_director_name} onChange={(v) => updateOption("contractor_director_name", v)} placeholder="ФИО" minWidth={90} />
      {" "}на основании{" "}
      <InlineInput value={options.contractor_basis} onChange={(v) => updateOption("contractor_basis", v)} placeholder="Устава" minWidth={70} />
      , с другой стороны,
    </p>
  )}
  <p>
    вместе именуемые «Стороны», а индивидуально — «Сторона», заключили настоящий договор подряда на ремонт квартиры
    (далее — «Договор») о нижеследующем:
  </p>
    </>
  )
}

export default ContractPartiesSection
