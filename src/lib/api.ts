import funcUrls from "../../backend/func2url.json"

const AUTH_URL = funcUrls.auth
const OBJECTS_URL = funcUrls.objects
const SERVICES_URL = funcUrls.services
const DASHBOARD_URL = funcUrls.dashboard
const ESTIMATES_URL = funcUrls.estimates

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
  async register(payload: { full_name: string; email: string; password: string; company_name?: string }) {
    const res = await fetch(`${AUTH_URL}?action=register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    return parseResponse(res) as Promise<{ token: string; user: UserData }>
  },

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
}

export interface Estimate {
  id: number
  object_id: number
  total_amount: number
  created_at: string
  items?: EstimateItem[]
}

export const estimatesApi = {
  async listByObject(objectId: number) {
    const res = await fetch(`${ESTIMATES_URL}?object_id=${objectId}`, { headers: { ...authHeaders() } })
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
}