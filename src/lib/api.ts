import funcUrls from "../../backend/func2url.json"

const AUTH_URL = funcUrls.auth
const OBJECTS_URL = funcUrls.objects
const SERVICES_URL = funcUrls.services
const DASHBOARD_URL = funcUrls.dashboard
const ESTIMATES_URL = funcUrls.estimates
const LEADS_URL = funcUrls.leads

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
  company_id: number
  company_name: string
}

async function parseResponse(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || "Ошибка запроса")
  }
  return data
}

export const authApi = {
  async login(payload: { email: string; password: string }) {
    const res = await fetch(`${AUTH_URL}?action=login`, {
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

export interface ObjectItem {
  id: number
  object_code: string
  client_name: string
  client_phone: string
  object_type: string
  area: number
  status: string
  created_at: string
}

export const objectsApi = {
  async list() {
    const res = await fetch(OBJECTS_URL, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<{ objects: ObjectItem[] }>
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
  amount: number
  status?: "approved" | "pending" | "rejected"
  proposed_by?: number | null
  proposed_by_name?: string | null
}

export interface Estimate {
  id: number
  object_id: number
  total_amount: number
  created_at: string
  items?: EstimateItem[]
  object_code?: string
  client_name?: string
  object_type?: string
  area?: number
  has_pending?: boolean
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

  async create(payload: { object_id: number; items: EstimateItem[] }) {
    const res = await fetch(ESTIMATES_URL, {
      method: "POST",
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

export interface TeamMember {
  id: number
  full_name: string
  email: string
  role: string
  phone: string | null
  created_at: string
  objects?: { id: number; object_code: string; client_name: string }[]
}

export const teamApi = {
  async list() {
    const res = await fetch(`${AUTH_URL}?resource=team`, { headers: { ...authHeaders() } })
    return parseResponse(res) as Promise<{ members: TeamMember[] }>
  },

  async create(payload: { full_name: string; email: string; password: string; role: "employee" | "client"; phone?: string; object_ids?: number[] }) {
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