import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { FinanceData, FinanceIncome, financeApi } from "@/lib/api"
import { IncomeDialog } from "./IncomeDialog"
import { INCOME_COLORS, INCOME_ICONS, INCOME_LABELS } from "./incomeMeta"
import { card, dateRu, rub } from "./format"

const SOURCE_LABEL: Record<string, string> = { online: "онлайн", bank: "банк" }

export function FinanceIncomes({ data, onChanged }: { data: FinanceData; onChanged: () => void }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<FinanceIncome | null>(null)
  const [removing, setRemoving] = useState<FinanceIncome | null>(null)
  const [cat, setCat] = useState("")
  const [objectId, setObjectId] = useState("")

  const labels = { ...data.income_categories, ...INCOME_LABELS }
  const incomes = data.incomes || []

  const byCat = useMemo(() => {
    const m = new Map<string, number>()
    incomes.forEach((i) => m.set(i.category, (m.get(i.category) || 0) + i.amount))
    return Array.from(m.entries()).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
  }, [incomes])
  const catTotal = byCat.reduce((a, [, v]) => a + v, 0)

  const list = useMemo(
    () =>
      incomes.filter((i) => {
        if (cat && i.category !== cat) return false
        if (objectId === "none" && i.object_id) return false
        if (objectId && objectId !== "none" && String(i.object_id) !== objectId) return false
        return true
      }),
    [incomes, cat, objectId],
  )
  const listTotal = list.reduce((a, i) => a + i.amount, 0)

  return (
    <div className={`${card} flex flex-col gap-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-medium flex items-center gap-2">
          <Icon name="TrendingUp" size={16} className="text-green-300" />
          Доходы
          <span className="text-sm font-normal text-green-300">+{rub(catTotal)}</span>
        </p>
        <button
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
          className="inline-flex justify-center min-h-[44px] sm:min-h-0 w-full sm:w-auto items-center gap-1.5 rounded-lg bg-[#D4AF37] px-3 py-2 text-sm font-medium text-[#161616] hover:bg-[#B8860B]"
        >
          <Icon name="Plus" size={15} />
          Добавить доход
        </button>
      </div>

      {byCat.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-white/5">
            {byCat.map(([k, v]) => (
              <div key={k} style={{ width: `${(v / catTotal) * 100}%`, background: INCOME_COLORS[k] || "#6b7280" }} title={labels[k]} />
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {byCat.map(([k, v]) => (
              <button
                key={k}
                onClick={() => setCat(cat === k ? "" : k)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                  cat === k ? "bg-white/15 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: INCOME_COLORS[k] || "#6b7280" }} />
                {labels[k] || k}
                <span className="text-white/90">{rub(v)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {incomes.length > 0 && (
        <select
          value={objectId}
          onChange={(e) => setObjectId(e.target.value)}
          className="w-full sm:w-72 rounded-lg border border-white/10 bg-[#161616] px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"
        >
          <option value="">Все объекты</option>
          <option value="none">Общие доходы компании</option>
          {data.object_options
            .filter((o) => incomes.some((i) => i.object_id === o.id))
            .map((o) => (
              <option key={o.id} value={o.id}>
                {o.object_code}
                {o.client_name ? ` · ${o.client_name}` : ""}
              </option>
            ))}
        </select>
      )}

      {list.length === 0 ? (
        <div className="py-8 flex flex-col items-center gap-2 text-center">
          <Icon name="PiggyBank" size={28} className="text-white/20" />
          <p className="text-sm text-white/40">
            {incomes.length
              ? "По фильтру доходов нет"
              : "Оплаты по счетам появятся здесь сами. Наличные и переводы без счёта добавьте вручную"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-white/5 -my-1">
          {list.map((i) => (
            <div key={`${i.kind}-${i.id}`} className="group flex flex-wrap sm:flex-nowrap items-center gap-x-3 gap-y-2 py-2.5">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${INCOME_COLORS[i.category] || "#6b7280"}26`, color: INCOME_COLORS[i.category] || "#9ca3af" }}
              >
                <Icon name={INCOME_ICONS[i.category] || "Circle"} size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">
                  {labels[i.category] || i.category}
                  {SOURCE_LABEL[i.source] && (
                    <span className="ml-1.5 inline-flex translate-y-[-1px] items-center gap-0.5 rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/50">
                      <Icon name={i.source === "bank" ? "Landmark" : "Globe"} size={10} />
                      {SOURCE_LABEL[i.source]}
                    </span>
                  )}
                  {i.payer && <span className="text-white/60"> · {i.payer}</span>}
                </p>
                <p className="truncate text-xs text-white/40">
                  {dateRu(i.income_date)}
                  {" · "}
                  {i.object_id ? (
                    <Link to={`/cabinet/objects/${i.object_id}`} className="hover:text-white">
                      {i.object_code}
                    </Link>
                  ) : (
                    "общий"
                  )}
                  {i.description && ` · ${i.description}`}
                </p>
              </div>
              <span className="shrink-0 font-medium text-green-300 whitespace-nowrap">+{rub(i.amount)}</span>
              {i.kind === "manual" ? (
                <div className="flex w-full sm:w-auto justify-end shrink-0 gap-2 sm:gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditing(i)
                      setOpen(true)
                    }}
                    className="flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10"
                    title="Изменить"
                  >
                    <Icon name="Pencil" size={13} />
                  </button>
                  <button
                    onClick={() => setRemoving(i)}
                    className="flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-300"
                    title="Удалить"
                  >
                    <Icon name="Trash2" size={13} />
                  </button>
                </div>
              ) : (
                <span className="w-[68px] shrink-0 text-right text-[10px] text-white/30">авто</span>
              )}
            </div>
          ))}
          <div className="flex justify-between pt-3 text-sm">
            <span className="text-white/50">Итого по списку · {list.length} шт.</span>
            <span className="font-semibold text-green-300">{rub(listTotal)}</span>
          </div>
        </div>
      )}

      <IncomeDialog
        open={open}
        onOpenChange={setOpen}
        income={editing}
        categories={data.income_categories}
        objects={data.object_options}
        onSaved={onChanged}
      />
      <ConfirmDeleteDialog
        open={!!removing}
        onOpenChange={(v) => !v && setRemoving(null)}
        title="Удалить доход?"
        description={removing ? `${labels[removing.category] || ""} на ${rub(removing.amount)} от ${dateRu(removing.income_date)}` : ""}
        onConfirm={async () => {
          if (removing) await financeApi.removeIncome(removing.id)
          setRemoving(null)
          onChanged()
        }}
      />
    </div>
  )
}

export default FinanceIncomes
