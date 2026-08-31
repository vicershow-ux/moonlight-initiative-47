export type PositionKey =
  | "super_admin"
  | "director"
  | "estimator"
  | "surveyor"
  | "foreman"
  | "manager"
  | "designer"

export const positionOptions: { value: PositionKey; label: string }[] = [
  { value: "super_admin", label: "Супер-администратор" },
  { value: "director", label: "Директор" },
  { value: "estimator", label: "Сметчик" },
  { value: "surveyor", label: "Замерщик" },
  { value: "foreman", label: "Прораб" },
  { value: "manager", label: "Менеджер" },
  { value: "designer", label: "Дизайнер" },
]

export const positionLabels: Record<string, string> = Object.fromEntries(
  positionOptions.map((o) => [o.value, o.label])
)

export const positionColors: Record<string, string> = {
  super_admin: "bg-red-500/20 text-red-300",
  director: "bg-purple-500/20 text-purple-300",
  estimator: "bg-orange-500/20 text-orange-300",
  surveyor: "bg-cyan-500/20 text-cyan-300",
  foreman: "bg-yellow-500/20 text-yellow-300",
  manager: "bg-blue-500/20 text-blue-300",
  designer: "bg-pink-500/20 text-pink-300",
}

export const getPositionLabel = (position?: string) =>
  (position && positionLabels[position]) || "Сотрудник"

export const getPositionColor = (position?: string) =>
  (position && positionColors[position]) || "bg-white/10 text-white/60"

// Разделы CRM (по префиксу пути), доступные каждой должности сотрудника.
// Владелец и супер-администратор (роль owner/admin) всегда видят всё.
const ALL_PREFIXES = [
  "/cabinet/objects",
  "/cabinet/documents",
  "/cabinet/customers",
  "/cabinet/services",
  "/cabinet/company",
  "/cabinet/team",
  "/cabinet/rentals",
]

export const positionPrefixes: Record<PositionKey, string[]> = {
  super_admin: ["/cabinet", ...ALL_PREFIXES],
  director: ["/cabinet", ...ALL_PREFIXES],
  estimator: ["/cabinet/objects", "/cabinet/documents"],
  surveyor: ["/cabinet/objects"],
  foreman: ["/cabinet/objects", "/cabinet/documents", "/cabinet/rentals"],
  manager: ["/cabinet", "/cabinet/objects", "/cabinet/documents", "/cabinet/customers"],
  designer: ["/cabinet/objects"],
}

const matchesPrefix = (path: string, prefix: string) =>
  prefix === "/cabinet" ? path === "/cabinet" : path === prefix || path.startsWith(prefix + "/")

export const hasHrefAccess = (
  role: string | undefined,
  position: string | undefined,
  path: string
) => {
  if (role !== "employee") return true
  if (!position || !(position in positionPrefixes)) return true
  return positionPrefixes[position as PositionKey].some((prefix) => matchesPrefix(path, prefix))
}