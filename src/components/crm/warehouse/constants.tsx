import Icon from "@/components/ui/icon"

export const money = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n || 0) + " \u20bd"

export const num = (n: unknown) => Number(n || 0)

export const fmtDateTime = (d: string | null) =>
  d
    ? new Date(d).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "\u2014"

export const actionCls = (a: string) => {
  if (a.includes("\u0412\u044b\u0434\u0430\u043d\u043e")) return "bg-[#D4AF37]/15 text-[#D4AF37]"
  if (a.includes("\u0412\u043e\u0437\u0432\u0440\u0430\u0442") || a.includes("\u041f\u0440\u0438\u0445\u043e\u0434")) return "bg-emerald-500/15 text-emerald-400"
  if (a.includes("\u0421\u043f\u0438\u0441\u0430\u043d\u043e")) return "bg-[#9B7BD4]/15 text-[#B49AE5]"
  if (a.includes("\u0423\u0434\u0430\u043b")) return "bg-red-500/15 text-red-400"
  return "bg-white/10 text-white/60"
}

export const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("ru-RU") : "\u2014"

export const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"

export const goldBtn =
  "flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg disabled:opacity-40"

export const kindStyle: Record<string, { cls: string; icon: string }> = {
  \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442: { cls: "bg-[#4A90D9]/15 text-[#7FB5E8]", icon: "Hammer" },
  \u043e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u0435: { cls: "bg-[#9B7BD4]/15 text-[#B49AE5]", icon: "Cog" },
  \u0440\u0430\u0441\u0445\u043e\u0434\u043d\u0438\u043a: { cls: "bg-emerald-500/15 text-emerald-400", icon: "Layers" },
}

export const kindBadge = (kind: string) => {
  const st = kindStyle[kind] || { cls: "bg-[#D4AF37]/15 text-[#D4AF37]", icon: "Package" }
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs ${st.cls}`}>
      <Icon name={st.icon} size={12} />
      {kind}
    </span>
  )
}

export interface WhForm {
  name: string
  address: string
  responsible: string
  phone: string
}

export interface ItemForm {
  name: string
  kind: string
  unit: string
  qty: string
  price: string
  warehouse_id: string
}

export interface WhItemForm {
  name: string
  kind: string
  unit: string
  qty: string
  price: string
}
