export type TabKey = "all" | "estimates" | "material_estimates" | "contracts" | "acts"

export const tabs: { key: TabKey; label: string }[] = [
  { key: "all", label: "\u0412\u0441\u0435 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u044b" },
  { key: "estimates", label: "\u0421\u043c\u0435\u0442\u044b \u043d\u0430 \u0440\u0430\u0431\u043e\u0442\u0443" },
  { key: "material_estimates", label: "\u0421\u043c\u0435\u0442\u044b \u043d\u0430 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u044b" },
  { key: "contracts", label: "\u0414\u043e\u0433\u043e\u0432\u043e\u0440\u044b" },
  { key: "acts", label: "\u0410\u043a\u0442\u044b" },
]

export const formatMoney = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " \u20bd"

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })
