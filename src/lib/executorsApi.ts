import { authHeaders, funcUrl, parseResponse } from "@/lib/api"

const URL_ = funcUrl("executors")
const PORTAL_TOKEN_KEY = "fixkey_executor_token"

export type ExecutorKind = "individual" | "self_employed" | "foreign_citizen" | "entrepreneur" | "legal"

export const executorKindLabels: Record<ExecutorKind, string> = {
  self_employed: "Самозанятый",
  individual: "Физлицо",
  entrepreneur: "ИП",
  legal: "Юрлицо",
  foreign_citizen: "Иностранный гражданин",
}

export interface ExecutorObject {
  id: number
  object_code: string
  address: string
}

export interface ExecutorContract {
  id: number
  object_id: number
  contract_number: string
  contract_date: string
  status: "draft" | "signed"
  total_amount: number
  object_code?: string
  work_subject: string
  paid: number
}

export interface Executor {
  id: number
  kind: ExecutorKind
  full_name: string
  org_name: string
  director_position: string
  director_name: string
  gender: "m" | "f"
  inn: string
  ogrnip: string
  passport: string
  country: string
  phone: string
  email: string
  address: string
  account: string
  bank_name: string
  bik: string
  corr_account: string
  specialty: string
  note: string
  is_archived: boolean
  created_at: string
  display_name: string
  login_email: string
  access_enabled: boolean
  last_login_at: string | null
  has_password?: boolean
  contracts_count?: number
  contracts_total?: number
  paid_total?: number
  reports_new?: number
  reports_total?: number
  tasks_open?: number
  tasks_done?: number
  tasks_overdue?: number
  objects?: ExecutorObject[]
  contracts?: ExecutorContract[]
}

export type ExecutorForm = Omit<
  Executor,
  "id" | "created_at" | "display_name" | "last_login_at" | "has_password" | "tasks_open" | "tasks_done" | "tasks_overdue" | "contracts_count" | "contracts_total" | "paid_total" | "reports_new" | "reports_total" | "objects" | "contracts"
> & { object_ids: number[]; password?: string }

export const emptyExecutor: ExecutorForm = {
  kind: "self_employed",
  full_name: "",
  org_name: "",
  director_position: "",
  director_name: "",
  gender: "m",
  inn: "",
  ogrnip: "",
  passport: "",
  country: "",
  phone: "",
  email: "",
  address: "",
  account: "",
  bank_name: "",
  bik: "",
  corr_account: "",
  specialty: "",
  note: "",
  is_archived: false,
  login_email: "",
  access_enabled: false,
  object_ids: [],
  password: "",
}

export interface ExecutorPayment {
  id: number
  amount: number
  expense_date: string
  description: string
  contract_id: number | null
  object_id: number | null
  contract_number: string | null
}

export interface ExecutorReport {
  id: number
  executor_id: number
  object_id: number
  contract_id: number | null
  report_date: string
  work_text: string
  progress_pct: number
  photos: string[]
  status: "new" | "accepted" | "rework"
  reply: string
  created_at: string
  reviewed_at: string | null
  object_code: string
  address: string
  executor_name: string
}

const json = (method: string, body: unknown) => ({
  method,
  headers: { "Content-Type": "application/json", ...authHeaders() },
  body: JSON.stringify(body),
})

export const executorsApi = {
  async list() {
    const res = await fetch(URL_, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<{ executors: Executor[] }>
  },
  async get(id: number) {
    const res = await fetch(`${URL_}?id=${id}`, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<{ executor: Executor }>
  },
  async save(form: Partial<ExecutorForm>, id?: number) {
    const res = await fetch(id ? `${URL_}?id=${id}` : URL_, json(id ? "PUT" : "POST", form))
    return parseResponse(res) as Promise<{ id: number }>
  },
  async archive(id: number) {
    const res = await fetch(`${URL_}?id=${id}`, { method: "DELETE", headers: { ...authHeaders() } })
    return parseResponse(res)
  },
  async payments(params: { contract_id?: number; executor_id?: number }) {
    const q = new URLSearchParams({ action: "payment" })
    if (params.contract_id) q.set("contract_id", String(params.contract_id))
    if (params.executor_id) q.set("executor_id", String(params.executor_id))
    const res = await fetch(`${URL_}?${q}`, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<{ payments: ExecutorPayment[] }>
  },
  async addPayment(payload: { contract_id: number; amount: number; payment_date: string; note?: string }) {
    const res = await fetch(`${URL_}?action=payment`, json("POST", payload))
    return parseResponse(res) as Promise<{ id: number }>
  },
  async removePayment(id: number) {
    const res = await fetch(`${URL_}?action=payment&id=${id}`, { method: "DELETE", headers: { ...authHeaders() } })
    return parseResponse(res)
  },
  async reports(params: { object_id?: number; executor_id?: number } = {}) {
    const q = new URLSearchParams({ action: "reports" })
    if (params.object_id) q.set("object_id", String(params.object_id))
    if (params.executor_id) q.set("executor_id", String(params.executor_id))
    const res = await fetch(`${URL_}?${q}`, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<{ reports: ExecutorReport[] }>
  },
  async reviewReport(id: number, status: "accepted" | "rework", reply = "") {
    const res = await fetch(`${URL_}?action=reports&id=${id}`, json("PUT", { status, reply }))
    return parseResponse(res)
  },
}

export type TaskStatus = "open" | "done" | "accepted"

export interface ExecutorTask {
  id: number
  executor_id: number
  object_id: number
  title: string
  description: string
  due_date: string | null
  status: TaskStatus
  executor_comment: string
  photos: string[]
  done_at: string | null
  created_at: string
  updated_at: string
  object_code: string
  address: string
  executor_name: string
}

export const tasksApi = {
  async list(params: { object_id?: number; executor_id?: number } = {}) {
    const q = new URLSearchParams({ action: "tasks" })
    if (params.object_id) q.set("object_id", String(params.object_id))
    if (params.executor_id) q.set("executor_id", String(params.executor_id))
    const res = await fetch(`${URL_}?${q}`, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<{ tasks: ExecutorTask[] }>
  },
  async create(payload: { executor_id: number; object_id: number; title: string; description?: string; due_date?: string }) {
    const res = await fetch(`${URL_}?action=tasks`, json("POST", payload))
    return parseResponse(res) as Promise<{ id: number }>
  },
  async update(id: number, payload: { title: string; description?: string; due_date?: string }) {
    const res = await fetch(`${URL_}?action=tasks&id=${id}`, json("PUT", payload))
    return parseResponse(res)
  },
  async setStatus(id: number, status: "accepted" | "open") {
    const res = await fetch(`${URL_}?action=tasks&id=${id}`, json("PUT", { status }))
    return parseResponse(res)
  },
  async remove(id: number) {
    const res = await fetch(`${URL_}?action=tasks&id=${id}`, { method: "DELETE", headers: { ...authHeaders() } })
    return parseResponse(res)
  },
}

/** Срок задания: просрочено / сегодня / осталось N дней */
export function dueInfo(due: string | null, status: TaskStatus) {
  if (!due) return { text: "без срока", cls: "text-white/40" }
  const d = new Date(due + "T00:00:00")
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Math.round((d.getTime() - today.getTime()) / 86400000)
  const label = d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
  if (status !== "open") return { text: `срок ${label}`, cls: "text-white/40" }
  if (days < 0) return { text: `просрочено · ${label}`, cls: "text-red-400" }
  if (days === 0) return { text: "срок сегодня", cls: "text-amber-300" }
  if (days <= 2) return { text: `срок ${label}`, cls: "text-amber-300" }
  return { text: `срок ${label}`, cls: "text-white/50" }
}

export interface ObjectSummary {
  object: { id: number; object_code: string; client_name: string; address: string }
  income: { contracted: number; received: number; outstanding: number }
  executors: { contract_id: number; contract_number: string; contract_date: string; name: string; work_subject: string; total: number; paid: number; status: string; executor_id?: number | null }[]
  receipts: { shop: string; amount: number; count: number }[]
  materials: { name: string; unit: string; qty: number; price: number; sum: number }[]
  other: { category: string; label: string; amount: number; count: number }[]
  totals: {
    executors_paid: number
    executors_total: number
    executors_debt: number
    receipts: number
    materials: number
    other: number
    costs: number
    profit: number
    planned_profit: number
  }
}

export const objectSummaryApi = {
  async get(objectId: number) {
    const res = await fetch(`${URL_}?action=object_summary&object_id=${objectId}`, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<ObjectSummary>
  },
}

/** Кабинет исполнителя — свой токен, вход через общую форму «Войти» */
export const getPortalToken = () =>
  localStorage.getItem(PORTAL_TOKEN_KEY) || ""
export const setPortalToken = (t: string) => localStorage.setItem(PORTAL_TOKEN_KEY, t)
export const clearPortalToken = () => localStorage.removeItem(PORTAL_TOKEN_KEY)

const portalHeaders = (): Record<string, string> => {
  const t = getPortalToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

export interface PortalData {
  executor: { id: number; name: string; specialty: string; phone: string }
  company: { name: string; phone: string }
  objects: { id: number; object_code: string; address: string; status: string }[]
  contracts: ExecutorContract[]
  reports: ExecutorReport[]
  tasks: ExecutorTask[]
}

export const portalApi = {
  async login(email: string, password: string) {
    const res = await fetch(`${URL_}?portal=1&action=login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    return parseResponse(res) as Promise<{ token: string }>
  },
  async me() {
    const res = await fetch(`${URL_}?portal=1&action=me`, { headers: portalHeaders() })
    return parseResponse(res) as Promise<PortalData>
  },
  async logout() {
    await fetch(`${URL_}?portal=1&action=logout`, { headers: portalHeaders() }).catch(() => null)
    clearPortalToken()
  },
  async upload(fileName: string, data: string) {
    const res = await fetch(`${URL_}?portal=1&action=upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...portalHeaders() },
      body: JSON.stringify({ file_name: fileName, data }),
    })
    return parseResponse(res) as Promise<{ url: string }>
  },
  async sendReport(payload: { object_id: number; contract_id?: number | null; work_text: string; progress_pct: number; photos: string[]; report_date?: string }) {
    const res = await fetch(`${URL_}?portal=1&action=report`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...portalHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res) as Promise<{ id: number }>
  },
  async completeTask(id: number, payload: { done: boolean; comment?: string; photos?: string[] }) {
    const res = await fetch(`${URL_}?portal=1&action=task&id=${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...portalHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res)
  },
  async removeReport(id: number) {
    const res = await fetch(`${URL_}?portal=1&action=report&id=${id}`, { method: "DELETE", headers: portalHeaders() })
    return parseResponse(res)
  },
}

/** Перенос исполнителя из справочника в поля договора */
export function executorToContractOptions(e: Executor) {
  return {
    executor_id: e.id,
    contractor_type: e.kind,
    contractor_name: e.full_name,
    contractor_gender: e.gender,
    contractor_org_name: e.org_name,
    contractor_director_position: e.director_position,
    contractor_director_name: e.director_name,
    contractor_ogrnip: e.ogrnip,
    contractor_country: e.country,
    contractor_inn: e.inn,
    contractor_passport: e.passport,
    contractor_phone: e.phone,
    contractor_email: e.email,
    contractor_address: e.address,
    contractor_account: e.account,
    contractor_bank_name: e.bank_name,
    contractor_bik: e.bik,
    contractor_corr_account: e.corr_account,
  }
}
