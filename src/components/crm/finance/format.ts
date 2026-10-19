export const rub = (v: unknown) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(Number(v) || 0)) + " ₽"

export const shortRub = (v: number) => {
  const n = Math.abs(v)
  if (n >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(".0", "")} млн`
  if (n >= 1000) return `${Math.round(v / 1000)} тыс`
  return String(Math.round(v))
}

export const dateRu = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" }) : "—"

export const monthRu = (key: string) => {
  const [y, m] = key.split("-").map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString("ru-RU", { month: "short" }).replace(".", "")
}

export const card = "rounded-xl border border-white/10 bg-[#1f1f1f] p-5"
