import { ContractOptions } from "@/lib/api"

export const formatMoney = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " ₽"

export const defaultOptions: Required<ContractOptions> = {
  customer_type: "individual",
  contractor_type: "individual",
  design_project: "none",
  work_order: "staged",
  subcontractors: "allowed",
  work_start: "advance_and_handover",
  cost_type: "fixed",
  payment_order: "advance_staged",
  payment_schedule: "advance_4_stages",
  duration_months: "6",
  duration_unit: "months",
  work_stages: [
    "Подготовительные и черновые работы: демонтаж, возведение перегородок, грунтовка, штукатурка стен, стяжка пола, частичное выполнение инженерных и электромонтажных работ",
    "Санузел и ванная: гидроизоляция, укладка плитки, монтаж сантехнических коммуникаций и оборудования, электромонтаж, монтаж вентиляции",
  ],
  guarantee_months: "12",
  city: "",
  customer_gender: "m",
  contractor_gender: "m",
  customer_org_name: "",
  customer_ogrnip: "",
  customer_ogrn: "",
  customer_director_position: "",
  customer_director_name: "",
  customer_basis: "",
  contractor_ogrnip: "",
  contractor_country: "",
  contractor_residence_basis: "",
  contractor_work_permit: "",
  contractor_org_name: "",
  contractor_director_position: "",
  contractor_director_name: "",
  contractor_basis: "",
  design_author: "",
  custom_stages_text: "",
  fixed_amount: "",
  schedule_amounts: {},
  customer_name: "",
  contractor_name: "",
  object_address: "",
  hidden_defects: "include",
  materials: "customer",
  materials_return_days: "3",
  materials_return_days_kind: "working",
  doc_delivery: "personal_messengers",
  custom_stages: [
    { label: "Аванс", amount: "", when: "до начала выполнения Работ" },
    { label: "Этап 1", amount: "", when: "по завершении Работ и подписания Акта сдачи-приёмки" },
  ],
  payment_days: "5",
  payment_days_kind: "working",
  acceptance_days: "5",
  acceptance_days_kind: "working",
  unilateral_days: "5",
  unilateral_days_kind: "working",
  payment_method: "cash_or_bank",
  warranty_mode: "custom",
  defect_fix_days: "10",
  defect_fix_days_kind: "working",
  penalty_work_pct: "0,1",
  penalty_work_max_pct: "10",
  penalty_pay_pct: "0,1",
  penalty_pay_max_pct: "10",
  claim_days: "10",
  claim_days_kind: "working",
  dispute_venue: "customer",
  dispute_court: "",
  copies_total: "двух",
  copies_per_party: "одному",
}

export const copiesTotalOptions = [
  { value: "двух", label: "двух" },
  { value: "трёх", label: "трёх" },
  { value: "четырёх", label: "четырёх" },
]

export const copiesPerPartyOptions = [
  { value: "одному", label: "одному" },
  { value: "двум", label: "двум" },
]

export const genderOptions = [
  { value: "m" as const, label: "ий" },
  { value: "f" as const, label: "ая" },
]

export const daysKindOptions = [
  { value: "working" as const, label: "рабочих дней" },
  { value: "calendar" as const, label: "календарных дней" },
]

export const durationUnitOptions = [
  { value: "months" as const, label: "месяцев" },
  { value: "working_days" as const, label: "рабочих дней" },
  { value: "calendar_days" as const, label: "календарных дней" },
]
