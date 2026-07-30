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

const TOKEN_KEY = "fixkey_token"

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
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