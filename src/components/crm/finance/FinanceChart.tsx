import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import Icon from "@/components/ui/icon"
import { FinanceData } from "@/lib/api"
import { card, monthRu, rub, shortRub } from "./format"

const SERIES = [
  { key: "issued", name: "Выставлено", color: "#6b7280" },
  { key: "received", name: "Поступило", color: "#D4AF37" },
  { key: "materials", name: "Материалы", color: "#ef4444" },
] as const

export function FinanceChart({ months }: { months: FinanceData["months"] }) {
  const data = months.map((m) => ({ ...m, label: monthRu(m.month) }))
  const empty = data.every((m) => !m.received && !m.issued && !m.materials)
  return (
    <div className={`${card} flex flex-col gap-4`}>
      <p className="font-medium flex items-center gap-2">
        <Icon name="ChartColumn" size={16} className="text-[#D4AF37]" />
        Движение денег за 12 месяцев
      </p>
      {empty ? (
        <p className="text-sm text-white/30 py-16 text-center">Данных пока нет</p>
      ) : (
        <div className="h-72 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={shortRub} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} width={56} />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                contentStyle={{ background: "#161616", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }}
                formatter={(v: number, n: string) => [rub(v), n]}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }} />
              {SERIES.map((s) => (
                <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} maxBarSize={22} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
