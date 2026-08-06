import funcUrls from "../../backend/func2url.json"
import { EstimateStatus } from "@/lib/estimateStatus"

const AUTH_URL = funcUrls.auth
const OBJECTS_URL = funcUrls.objects
const SERVICES_URL = funcUrls.services
const DASHBOARD_URL = funcUrls.dashboard
const ESTIMATES_URL = funcUrls.estimates
const LEADS_URL = funcUrls.leads
const OBJECT_ROOMS_URL = funcUrls.object_rooms
const OBJECT_STATUSES_URL = funcUrls.object_statuses
const SITE_URL = funcUrls.site
const CONTRACTS_URL = funcUrls.contracts
const ACTS_URL = funcUrls.acts
const WAREHOUSE_URL = funcUrls.warehouse
const MATERIALS_URL = funcUrls.materials

const TOKEN_KEY = "fixkey_token"

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string, remember = true) {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token)
    sessionStorage.removeItem(TOKEN_KEY)
  } else {
    sessionStorage.setItem(TOKEN_KEY, token)
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { "X-Authorization": token } : {}
}

export interface UserData {
  id: number
  full_name: string
  email: string
  role: string
  position?: string
  company_id: number
  company_name: string
  totp_enabled?: boolean
}

async function parseResponse(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || "Ошибка запроса")
  }
  return data
}

export interface LoginResult {
  token?: string
  user?: UserData
  requires_2fa?: boolean
  challenge_token?: string
}

export const authApi = {
  async login(payload: { email: string; password: string }) {
    const res = await fetch(`${AUTH_URL}?action=login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    return parseResponse(res) as Promise<LoginResult>
  },

  async verify2fa(payload: { challenge_token: string; code: string }) {
    const res = await fetch(`${AUTH_URL}?action=verify_2fa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    return parseResponse(res) as Promise<{ token: string; user: UserData }>
  },

  async me() {
    const res = await fetch(`${AUTH_URL}?action=me`, {
      method: "GET",
      headers: { ...authHeaders() },
    })
    return parseResponse(res) as Promise<{ user: UserData }>
  },
}

export const profileApi = {
  async update(payload: { full_name?: string; email?: string; current_password?: string; new_password?: string }) {
    const res = await fetch(`${AUTH_URL}?resource=profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res) as Promise<{ full_name: string; email: string }>
  },

  async remove() {
    const res = await fetch(`${AUTH_URL}?resource=profile`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    })
    return parseResponse(res)
  },
}

export const twoFactorApi = {
  async setup() {
    const res = await fetch(`${AUTH_URL}?resource=2fa&action=setup`, {
      method: "POST",
      headers: { ...authHeaders() },
    })
    return parseResponse(res) as Promise<{ secret: string; otp_uri: string }>
  },

  async confirm(code: string) {
    const res = await fetch(`${AUTH_URL}?resource=2fa&action=confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ code }),
    })
    return parseResponse(res) as Promise<{ success: boolean; totp_enabled: boolean }>
  },

  async disable(password: string) {
    const res = await fetch(`${AUTH_URL}?resource=2fa&action=disable`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ password }),
    })
    return parseResponse(res) as Promise<{ success: boolean; totp_enabled: boolean }>
  },
}

export interface ObjectItem {
  id: number
  object_code: string
  client_name: string
  client_phone: string
  object_type: string
  area: number
  status: string
  email: string
  legal_status: string
  address: string
  payment_type: string
  has_elevator: string
  residence_during_works: boolean
  material_unloading: string
  completion_type: string
  warranty_waiver: boolean
  rough_material: string
  finish_material: string
  kitchen_furniture: string
  measurer_comment: string
  design_project: string
  created_at: string
  updated_at: string
}

export const objectsApi = {
  async list() {
    const res = await fetch(OBJECTS_URL, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<{ objects: ObjectItem[] }>
  },

  async get(id: number) {
    const res = await fetch(`${OBJECTS_URL}?id=${id}`, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<ObjectItem>
  },

  async create(payload: Partial<ObjectItem>) {
    const res = await fetch(OBJECTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res) as Promise<ObjectItem>
  },

  async update(id: number, payload: Partial<ObjectItem>) {
    const res = await fetch(`${OBJECTS_URL}?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res)
  },

  async remove(id: number) {
    const res = await fetch(`${OBJECTS_URL}?id=${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    })
    return parseResponse(res)
  },
}

export interface ServiceItem {
  id: number
  name: string
  unit: string
  price: number
  category: string
  subcategory: string
  description: string
  is_active: boolean
  created_at: string
}

export const servicesApi = {
  async list() {
    const res = await fetch(SERVICES_URL, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<{ services: ServiceItem[] }>
  },

  async create(payload: Partial<ServiceItem>) {
    const res = await fetch(SERVICES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res) as Promise<ServiceItem>
  },

  async update(id: number, payload: Partial<ServiceItem>) {
    const res = await fetch(`${SERVICES_URL}?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res)
  },

  async remove(id: number) {
    const res = await fetch(`${SERVICES_URL}?id=${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    })
    return parseResponse(res)
  },

  async importExcel(fileBase64: string) {
    const res = await fetch(`${SERVICES_URL}?action=import`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ file: fileBase64 }),
    })
    return parseResponse(res) as Promise<{ success: boolean; imported: number; skipped: number }>
  },
}

export interface DashboardStats {
  total_objects: number
  total_estimates: number
  month_amount: number
  statuses: { status: string; count: number }[]
  team_count: number
  invites_count: number
  recent_objects: ObjectItem[]
}

export const dashboardApi = {
  async stats() {
    const res = await fetch(DASHBOARD_URL, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<DashboardStats>
  },
}

export interface EstimateItem {
  id?: number
  service_id?: number | null
  name: string
  unit: string
  price: number
  quantity: number
  times?: number
  discount_percent?: number
  amount: number
  status?: "approved" | "pending" | "rejected"
  proposed_by?: number | null
  proposed_by_name?: string | null
  room_id?: number | null
  room_name?: string
  category?: string
  subcategory?: string
}

export interface EstimateRevision {
  id: number
  total_amount: number
  created_at: string
  revision_number: number
  status: string
}

export interface Estimate {
  id: number
  object_id: number
  total_amount: number
  subtotal_amount?: number
  contract_number?: string
  contract_date?: string | null
  discount_percent?: number
  discount_amount?: number
  notes?: string
  created_at: string
  items?: EstimateItem[]
  object_code?: string
  client_name?: string
  client_phone?: string
  email?: string
  object_type?: string
  area?: number
  has_pending?: boolean
  status?: EstimateStatus
  revision_number?: number
  created_by?: number | null
  company_name?: string
  company_phone?: string
  company_email?: string
  company_website?: string
  company_inn?: string
  company_legal_address?: string
  company_bank_name?: string
  company_bik?: string
  company_account_number?: string
  company_bank_inn?: string
  company_bank_kpp?: string
  company_correspondent_account?: string
  company_signature_url?: string
  revisions?: EstimateRevision[]
}

export const estimatesApi = {
  async listByObject(objectId: number) {
    const res = await fetch(`${ESTIMATES_URL}?object_id=${objectId}`, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<{ estimates: Estimate[] }>
  },

  async listAll() {
    const res = await fetch(ESTIMATES_URL, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<{ estimates: Estimate[] }>
  },

  async get(id: number) {
    const res = await fetch(`${ESTIMATES_URL}?id=${id}`, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<Estimate>
  },

  async create(payload: {
    object_id: number
    items: EstimateItem[]
    contract_number?: string
    contract_date?: string
    discount_percent?: number
    discount_amount?: number
    notes?: string
  }) {
    const res = await fetch(ESTIMATES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res) as Promise<Estimate>
  },

  async update(id: number, payload: {
    items: EstimateItem[]
    contract_number?: string
    contract_date?: string
    discount_percent?: number
    discount_amount?: number
    notes?: string
  }) {
    const res = await fetch(`${ESTIMATES_URL}?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res) as Promise<Estimate>
  },

  async remove(id: number) {
    const res = await fetch(`${ESTIMATES_URL}?id=${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    })
    return parseResponse(res)
  },

  async setStatus(id: number, status: EstimateStatus) {
    const res = await fetch(`${ESTIMATES_URL}?action=set_status&id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ status }),
    })
    return parseResponse(res)
  },

  async propose(payload: { estimate_id: number; name: string; unit: string; price: number; quantity: number }) {
    const res = await fetch(`${ESTIMATES_URL}?action=propose`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res)
  },

  async approveItem(itemId: number) {
    const res = await fetch(`${ESTIMATES_URL}?action=approve&item_id=${itemId}`, {
      method: "PUT",
      headers: { ...authHeaders() },
    })
    return parseResponse(res)
  },

  async rejectItem(itemId: number) {
    const res = await fetch(`${ESTIMATES_URL}?action=reject&item_id=${itemId}`, {
      method: "PUT",
      headers: { ...authHeaders() },
    })
    return parseResponse(res)
  },
}

export interface ContractOptions {
  customer_type?: "individual" | "legal" | "entrepreneur"
  contractor_type?: "individual" | "self_employed" | "foreign_citizen" | "entrepreneur" | "legal"
  design_project?: "none" | "with_project"
  work_order?: "staged" | "single" | "custom"
  subcontractors?: "allowed" | "personal_only"
  work_start?: "advance_and_handover" | "advance_only" | "signing"
  cost_type?: "fixed" | "by_estimate"
  payment_order?: "advance_staged" | "full_prepayment" | "on_completion"
  payment_schedule?: "advance_4_stages" | "advance_3_stages" | "advance_2_stages" | "custom_schedule"
  duration_months?: string
  duration_unit?: "months" | "working_days" | "calendar_days"
  work_stages?: string[]
  guarantee_months?: string
  // Ручные поля внутри текста
  city?: string
  customer_gender?: "m" | "f"
  contractor_gender?: "m" | "f"
  customer_org_name?: string
  customer_ogrnip?: string
  customer_ogrn?: string
  customer_director_position?: string
  customer_director_name?: string
  customer_basis?: string
  // Ручные поля подрядчика
  contractor_ogrnip?: string
  contractor_country?: string
  contractor_residence_basis?: string
  contractor_work_permit?: string
  contractor_org_name?: string
  contractor_director_position?: string
  contractor_director_name?: string
  contractor_basis?: string
  design_author?: string
  custom_stages_text?: string
  fixed_amount?: string
  schedule_amounts?: Record<string, string>
  // Редактируемые (подтянутые, но с возможностью правки) поля
  customer_name?: string
  contractor_name?: string
  object_address?: string
  hidden_defects?: "include" | "exclude"
  materials?: "contractor" | "customer" | "mixed"
  materials_return_days?: string
  materials_return_days_kind?: "working" | "calendar"
  doc_delivery?: "personal_messengers" | "personal_mail" | "email"
  custom_stages?: { label: string; amount: string; when: string }[]
  payment_days?: string
  payment_days_kind?: "working" | "calendar"
  acceptance_days?: string
  acceptance_days_kind?: "working" | "calendar"
  unilateral_days?: string
  unilateral_days_kind?: "working" | "calendar"
  payment_method?: "cash_or_bank" | "bank_only" | "cash_only"
  // 6. Гарантия
  warranty_mode?: "custom" | "by_law"
  defect_fix_days?: string
  defect_fix_days_kind?: "working" | "calendar"
  penalty_work_pct?: string
  penalty_work_max_pct?: string
  penalty_pay_pct?: string
  penalty_pay_max_pct?: string
  // 8. Разрешение споров
  claim_days?: string
  claim_days_kind?: "working" | "calendar"
  dispute_venue?: "customer" | "contractor" | "specific"
  dispute_court?: string
  // 9. Заключительные положения
  copies_total?: string
  copies_per_party?: string
}

export interface Contract {
  id: number
  object_id: number
  estimate_id?: number | null
  contract_number: string
  contract_date: string
  status: "draft" | "signed"
  template_key: string
  options: ContractOptions
  content_html: string
  total_amount: number
  created_by?: number | null
  created_at: string
  updated_at: string
  object_code?: string
  client_name?: string
  address?: string
}

export const contractsApi = {
  async listByObject(objectId: number) {
    const res = await fetch(`${CONTRACTS_URL}?object_id=${objectId}`, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<{ contracts: Contract[] }>
  },

  async listAll() {
    const res = await fetch(CONTRACTS_URL, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<{ contracts: Contract[] }>
  },

  async get(id: number) {
    const res = await fetch(`${CONTRACTS_URL}?id=${id}`, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<Contract>
  },

  async generate(payload: {
    object_id: number
    estimate_id?: number
    options: ContractOptions
    contract_number?: string
    contract_date?: string
  }) {
    const res = await fetch(`${CONTRACTS_URL}?action=generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res) as Promise<{ content_html: string; total_amount: number; contract_number: string }>
  },

  async create(payload: {
    object_id: number
    estimate_id?: number
    contract_number: string
    contract_date: string
    template_key?: string
    options: ContractOptions
    content_html: string
    total_amount: number
    status?: string
  }) {
    const res = await fetch(CONTRACTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res) as Promise<Contract>
  },

  async update(id: number, payload: Partial<{
    contract_number: string
    contract_date: string
    status: string
    options: ContractOptions
    content_html: string
    total_amount: number
    estimate_id: number
  }>) {
    const res = await fetch(`${CONTRACTS_URL}?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res) as Promise<Contract>
  },

  async remove(id: number) {
    const res = await fetch(`${CONTRACTS_URL}?id=${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    })
    return parseResponse(res)
  },
}

export interface ActItem {
  name: string
  unit: string
  price: number
  quantity: number
  amount: number
  room_name?: string
  category?: string
}

export interface ActOptions {
  period_from?: string
  period_to?: string
  scope?: string
  inspection_result?: string
  calculation?: string
  appendix?: string
}

export interface Act {
  id: number
  object_id: number
  contract_id?: number | null
  estimate_id?: number | null
  act_number: string
  act_date: string
  act_type: string
  status: "draft" | "signed"
  options: ActOptions
  items: ActItem[]
  content_html: string
  total_amount: number
  created_by?: number | null
  created_at: string
  updated_at: string
  object_code?: string
  client_name?: string
  address?: string
}

export const actsApi = {
  async listAll() {
    const res = await fetch(ACTS_URL, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<{ acts: Act[] }>
  },

  async listByContract(contractId: number) {
    const res = await fetch(`${ACTS_URL}?contract_id=${contractId}`, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<{ acts: Act[] }>
  },

  async get(id: number) {
    const res = await fetch(`${ACTS_URL}?id=${id}`, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<Act>
  },

  async generate(payload: {
    object_id: number
    contract_id?: number | null
    estimate_id?: number | null
    act_type: string
    act_number?: string
    act_date: string
    options: ActOptions
    items: ActItem[]
  }) {
    const res = await fetch(`${ACTS_URL}?action=generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res) as Promise<{ content_html: string; total_amount: number; act_number: string }>
  },

  async create(payload: {
    object_id: number
    contract_id?: number | null
    estimate_id?: number | null
    act_type: string
    act_number?: string
    act_date: string
    options: ActOptions
    items: ActItem[]
    content_html: string
    total_amount: number
    status?: string
  }) {
    const res = await fetch(ACTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res) as Promise<{ id: number; act_number: string; created_at: string }>
  },

  async update(id: number, payload: {
    act_number?: string
    act_date?: string
    act_type?: string
    status?: string
    options?: ActOptions
    items?: ActItem[]
    content_html?: string
    total_amount?: number
  }) {
    const res = await fetch(`${ACTS_URL}?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res)
  },

  async remove(id: number) {
    const res = await fetch(`${ACTS_URL}?id=${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    })
    return parseResponse(res)
  },
}

export interface ObjectRoom {
  id: number
  object_id: number
  name: string
  room_type: string
  area: number
  perimeter: number
  ceiling_height: number
  wall_area: number
  notes: string
  created_at: string
  updated_at: string
}

export const objectRoomsApi = {
  async listByObject(objectId: number) {
    const res = await fetch(`${OBJECT_ROOMS_URL}?object_id=${objectId}`, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<{ rooms: ObjectRoom[] }>
  },

  async create(payload: Partial<ObjectRoom> & { object_id: number; name: string }) {
    const res = await fetch(OBJECT_ROOMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res) as Promise<ObjectRoom>
  },

  async update(id: number, payload: Partial<ObjectRoom>) {
    const res = await fetch(`${OBJECT_ROOMS_URL}?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res)
  },

  async remove(id: number) {
    const res = await fetch(`${OBJECT_ROOMS_URL}?id=${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    })
    return parseResponse(res)
  },
}

export interface TeamMember {
  id: number
  full_name: string
  email: string
  role: string
  position?: string
  phone: string | null
  created_at: string
  is_active: boolean
  last_login_at: string | null
  objects?: { id: number; object_code: string; client_name: string }[]
}

export const teamApi = {
  async list() {
    const res = await fetch(`${AUTH_URL}?resource=team`, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<{ members: TeamMember[] }>
  },

  async create(payload: { full_name: string; email: string; password: string; role: "employee" | "client"; phone?: string; object_ids?: number[]; position?: string }) {
    const res = await fetch(`${AUTH_URL}?resource=team`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res) as Promise<TeamMember>
  },

  async updateObjects(id: number, objectIds: number[]) {
    const res = await fetch(`${AUTH_URL}?resource=team&id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ object_ids: objectIds }),
    })
    return parseResponse(res)
  },

  async setPassword(id: number, password: string) {
    const res = await fetch(`${AUTH_URL}?resource=team&id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ password }),
    })
    return parseResponse(res)
  },

  async setActive(id: number, isActive: boolean) {
    const res = await fetch(`${AUTH_URL}?resource=team&id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ is_active: isActive }),
    })
    return parseResponse(res)
  },

  async setPosition(id: number, position: string) {
    const res = await fetch(`${AUTH_URL}?resource=team&id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ position }),
    })
    return parseResponse(res)
  },

  async remove(id: number) {
    const res = await fetch(`${AUTH_URL}?resource=team&id=${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    })
    return parseResponse(res)
  },
}

export interface NotificationItem {
  id: number
  type: string
  title: string
  message: string
  payload: Record<string, unknown> | null
  is_read: boolean
  created_at: string
}

export const notificationsApi = {
  async list() {
    const res = await fetch(`${AUTH_URL}?resource=notifications`, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<{ notifications: NotificationItem[]; unread_count: number }>
  },

  async markRead(id?: number) {
    const url = id ? `${AUTH_URL}?resource=notifications&id=${id}` : `${AUTH_URL}?resource=notifications`
    const res = await fetch(url, {
      method: "PUT",
      headers: { ...authHeaders() },
    })
    return parseResponse(res)
  },
}

export const leadsApi = {
  async create(payload: { client_name: string; client_phone: string; comment?: string }) {
    const res = await fetch(LEADS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    return parseResponse(res) as Promise<{ success: boolean; object_code: string }>
  },
}

export interface CompanyData {
  name: string
  entity_type: string
  contact_full_name: string
  phone: string
  email: string
  website: string
  activity_type: string
  inn: string
  legal_address: string
  bank_name: string
  bik: string
  account_number: string
  bank_inn: string
  bank_kpp: string
  correspondent_account: string
  estimate_mode: string
  currency: string
  unit_system: string
  signature_url: string
}

export const companyApi = {
  async get() {
    const res = await fetch(`${AUTH_URL}?resource=company`, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<CompanyData>
  },

  async update(payload: Partial<CompanyData> & { signature_file?: string }) {
    const res = await fetch(`${AUTH_URL}?resource=company`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res) as Promise<CompanyData>
  },
}

export interface ObjectStatus {
  id: number
  name: string
  color: string
  sort_order: number
  is_default: boolean
  is_active_stage: boolean
  is_final: boolean
  is_archived: boolean
  object_count: number
}

export interface ObjectStatusTransition {
  from_status_id: number
  to_status_id: number
}

export const objectStatusesApi = {
  async list() {
    const res = await fetch(OBJECT_STATUSES_URL, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<{ statuses: ObjectStatus[]; transitions: ObjectStatusTransition[] }>
  },

  async create(payload: { name: string; color: string; is_active_stage?: boolean; is_final?: boolean }) {
    const res = await fetch(OBJECT_STATUSES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res) as Promise<ObjectStatus>
  },

  async update(id: number, payload: Partial<{ name: string; color: string; is_active_stage: boolean; is_final: boolean; is_archived: boolean }>) {
    const res = await fetch(`${OBJECT_STATUSES_URL}?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res)
  },

  async reorder(order: number[]) {
    const res = await fetch(`${OBJECT_STATUSES_URL}?action=reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ order }),
    })
    return parseResponse(res)
  },

  async remove(id: number) {
    const res = await fetch(`${OBJECT_STATUSES_URL}?id=${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    })
    return parseResponse(res)
  },

  async setTransitions(fromId: number, toIds: number[]) {
    const res = await fetch(`${OBJECT_STATUSES_URL}?action=transitions&id=${fromId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ to_status_ids: toIds }),
    })
    return parseResponse(res)
  },
}

export interface SiteSettings {
  brand_name: string
  logo_url: string
  favicon_url: string
  meta_title: string
  meta_description: string
  phone: string
  email: string
  telegram_url: string
  vk_url: string
  hero_eyebrow: string
  hero_title_line1: string
  hero_title_line2: string
  hero_bg_image: string
  hero_fg_image: string
  about_eyebrow: string
  about_title_line1: string
  about_title_highlight: string
  about_description: string
  about_image: string
  projects_eyebrow: string
  projects_title: string
  services_eyebrow: string
  services_title_highlight: string
  services_title_rest: string
  services_description: string
  faq_eyebrow: string
  faq_title: string
  cta_eyebrow: string
  cta_title_line1: string
  cta_title_highlight: string
  cta_description: string
  footer_description: string
  copyright_text: string
  analytics_head: string
}

export interface SitePhilosophyItem {
  id: number
  sort_order: number
  title: string
  description: string
}

export interface SiteProject {
  id: number
  sort_order: number
  title: string
  category: string
  location: string
  year: string
  image_url: string
}

export interface SiteExpertiseItem {
  id: number
  sort_order: number
  title: string
  description: string
  icon: string
}

export interface SiteFaqItem {
  id: number
  sort_order: number
  question: string
  answer: string
}

export interface SitePublicContent {
  settings: SiteSettings
  philosophy: SitePhilosophyItem[]
  projects: SiteProject[]
  expertise: SiteExpertiseItem[]
  faq: SiteFaqItem[]
}

export const siteApi = {
  async getPublic() {
    const res = await fetch(`${SITE_URL}?resource=public`)
    return parseResponse(res) as Promise<SitePublicContent>
  },

  async getSettings() {
    const res = await fetch(`${SITE_URL}?resource=settings`, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<SiteSettings>
  },

  async updateSettings(payload: Partial<SiteSettings> & Record<`${string}_file`, string | undefined>) {
    const res = await fetch(`${SITE_URL}?resource=settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res) as Promise<SiteSettings>
  },

  philosophy: {
    async list() {
      const res = await fetch(`${SITE_URL}?resource=philosophy`, { headers: { ...authHeaders() } })
      return parseResponse(res) as Promise<{ items: SitePhilosophyItem[] }>
    },
    async create(payload: { title: string; description: string }) {
      const res = await fetch(`${SITE_URL}?resource=philosophy`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      })
      return parseResponse(res)
    },
    async update(id: number, payload: Partial<{ title: string; description: string }>) {
      const res = await fetch(`${SITE_URL}?resource=philosophy&id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      })
      return parseResponse(res)
    },
    async reorder(order: number[]) {
      const res = await fetch(`${SITE_URL}?resource=philosophy&action=reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ order }),
      })
      return parseResponse(res)
    },
    async remove(id: number) {
      const res = await fetch(`${SITE_URL}?resource=philosophy&id=${id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      })
      return parseResponse(res)
    },
  },

  projects: {
    async list() {
      const res = await fetch(`${SITE_URL}?resource=projects`, { headers: { ...authHeaders() } })
      return parseResponse(res) as Promise<{ items: SiteProject[] }>
    },
    async create(payload: { title: string; category: string; location: string; year: string; image_url?: string; image_file?: string }) {
      const res = await fetch(`${SITE_URL}?resource=projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      })
      return parseResponse(res)
    },
    async update(id: number, payload: Partial<{ title: string; category: string; location: string; year: string; image_url: string; image_file: string }>) {
      const res = await fetch(`${SITE_URL}?resource=projects&id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      })
      return parseResponse(res)
    },
    async reorder(order: number[]) {
      const res = await fetch(`${SITE_URL}?resource=projects&action=reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ order }),
      })
      return parseResponse(res)
    },
    async remove(id: number) {
      const res = await fetch(`${SITE_URL}?resource=projects&id=${id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      })
      return parseResponse(res)
    },
  },

  expertise: {
    async list() {
      const res = await fetch(`${SITE_URL}?resource=expertise`, { headers: { ...authHeaders() } })
      return parseResponse(res) as Promise<{ items: SiteExpertiseItem[] }>
    },
    async create(payload: { title: string; description: string; icon: string }) {
      const res = await fetch(`${SITE_URL}?resource=expertise`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      })
      return parseResponse(res)
    },
    async update(id: number, payload: Partial<{ title: string; description: string; icon: string }>) {
      const res = await fetch(`${SITE_URL}?resource=expertise&id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      })
      return parseResponse(res)
    },
    async reorder(order: number[]) {
      const res = await fetch(`${SITE_URL}?resource=expertise&action=reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ order }),
      })
      return parseResponse(res)
    },
    async remove(id: number) {
      const res = await fetch(`${SITE_URL}?resource=expertise&id=${id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      })
      return parseResponse(res)
    },
  },

  faq: {
    async list() {
      const res = await fetch(`${SITE_URL}?resource=faq`, { headers: { ...authHeaders() } })
      return parseResponse(res) as Promise<{ items: SiteFaqItem[] }>
    },
    async create(payload: { question: string; answer: string }) {
      const res = await fetch(`${SITE_URL}?resource=faq`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      })
      return parseResponse(res)
    },
    async update(id: number, payload: Partial<{ question: string; answer: string }>) {
      const res = await fetch(`${SITE_URL}?resource=faq&id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      })
      return parseResponse(res)
    },
    async reorder(order: number[]) {
      const res = await fetch(`${SITE_URL}?resource=faq&action=reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ order }),
      })
      return parseResponse(res)
    },
    async remove(id: number) {
      const res = await fetch(`${SITE_URL}?resource=faq&id=${id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      })
      return parseResponse(res)
    },
  },
}

export interface WarehouseRow {
  id: number
  name: string
  address: string
  responsible: string
  phone: string
  positions: number
  created_at: string
}

export interface WarehouseItem {
  id: number
  warehouse_id: number | null
  warehouse_name: string | null
  name: string
  kind: string
  unit: string
  qty: number
  price: number
  object_id: number | null
  object_code: string | null
  object_client: string | null
  object_address: string | null
  issued_qty: number
  issued_at: string | null
  used_qty: number
  used_at: string | null
  created_at: string
}

export interface WarehouseObject {
  id: number
  object_code: string
  client_name: string
  address: string
}

export interface WarehouseLogRow {
  id: number
  user_name: string
  action: string
  item_name: string
  kind: string
  unit: string
  qty: number
  warehouse_name: string
  object_code: string
  details: string
  created_at: string
}

export const warehouseApi = {
  async list() {
    const res = await fetch(WAREHOUSE_URL, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<{
      warehouses: WarehouseRow[]
      items: WarehouseItem[]
      objects: WarehouseObject[]
      log: WarehouseLogRow[]
    }>
  },

  async createWarehouse(payload: Partial<WarehouseRow>) {
    const res = await fetch(`${WAREHOUSE_URL}?entity=warehouse`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res)
  },

  async updateWarehouse(id: number, payload: Partial<WarehouseRow>) {
    const res = await fetch(`${WAREHOUSE_URL}?entity=warehouse&id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res)
  },

  async removeWarehouse(id: number) {
    const res = await fetch(`${WAREHOUSE_URL}?entity=warehouse&id=${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    })
    return parseResponse(res)
  },

  async createItem(payload: Partial<WarehouseItem>) {
    const res = await fetch(`${WAREHOUSE_URL}?entity=item`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res)
  },

  async updateItem(id: number, payload: Partial<WarehouseItem>) {
    const res = await fetch(`${WAREHOUSE_URL}?entity=item&id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res)
  },

  async removeItem(id: number) {
    const res = await fetch(`${WAREHOUSE_URL}?entity=item&id=${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    })
    return parseResponse(res)
  },

  async issue(id: number, objectId: number, qty: number) {
    const res = await fetch(`${WAREHOUSE_URL}?action=issue&id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ object_id: objectId, qty }),
    })
    return parseResponse(res)
  },

  async restock(id: number, qty: number, price?: number) {
    const res = await fetch(`${WAREHOUSE_URL}?action=restock&id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(price ? { qty, price } : { qty }),
    })
    return parseResponse(res)
  },

  async consume(id: number, qty?: number) {
    const res = await fetch(`${WAREHOUSE_URL}?action=consume&id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(qty ? { qty } : {}),
    })
    return parseResponse(res)
  },

  async returnToStock(id: number, qty?: number) {
    const res = await fetch(`${WAREHOUSE_URL}?action=return&id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(qty ? { qty } : {}),
    })
    return parseResponse(res)
  },
}

export interface MaterialItem {
  id: number
  name: string
  category: string
  unit: string
  price: number
  shop_name: string
  shop_address: string
  shop_phone: string
  shop_url: string
  note: string
  created_at: string
}

export const materialsApi = {
  async list() {
    const res = await fetch(MATERIALS_URL, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<{ materials: MaterialItem[] }>
  },

  async create(payload: Partial<MaterialItem>) {
    const res = await fetch(MATERIALS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res)
  },

  async update(id: number, payload: Partial<MaterialItem>) {
    const res = await fetch(`${MATERIALS_URL}?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    })
    return parseResponse(res)
  },

  async remove(id: number) {
    const res = await fetch(`${MATERIALS_URL}?id=${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    })
    return parseResponse(res)
  },
}
