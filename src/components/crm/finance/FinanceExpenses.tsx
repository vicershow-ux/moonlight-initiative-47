import { useMemo, useRef, useState } from "react"
import { Link } from "@/lib/router-compat"
import Icon from "@/components/ui/icon"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { FinanceData, FinanceExpense, financeApi } from "@/lib/api"
import { ExpenseDialog } from "./ExpenseDialog"
import { EXPENSE_COLORS, EXPENSE_ICONS } from "./expenseMeta"
import { card, dateRu, rub } from "./format"
import { ExpenseFileThumb, useExpenseUpload } from "./ExpenseFiles"
import { ExpenseExportButton } from "./ExpenseExportButton"

export function FinanceExpenses({ data, onChanged }: { data: FinanceData; onChanged: () => void }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<FinanceExpense | null>(null)
  const [removing, setRemoving] = useState<FinanceExpense | null>(null)
  const [cat, setCat] = useState("")
  const [objectId, setObjectId] = useState<string>("")
  const [noDocs, setNoDocs] = useState(false)
  const [attachTo, setAttachTo] = useState<FinanceExpense | null>(null)
  const quickRef = useRef<HTMLInputElement>(null)
  const { upload, uploading, error: uploadError } = useExpenseUpload()

  const quickAttach = (e: FinanceExpense) => {
    setAttachTo(e)
    quickRef.current?.click()
  }

  const onQuickFiles = async (list: FileList | null) => {
    const target = attachTo
    if (!target || !list?.length) return
    const added = await upload(list)
    if (quickRef.current) quickRef.current.value = ""
    if (added.length) {
      await financeApi.attachExpenseFiles(target.id, [...(target.attachments || []), ...added].slice(0, 10)).catch(() => null)
      onChanged()
    }
    setAttachTo(null)
  }

  const s = data.summary
  const byCat = Object.entries(s.expenses_by_category || {})
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
  const catTotal = byCat.reduce((a, [, v]) => a + v, 0)

  const list = useMemo(
    () =>
      data.expenses.filter((e) => {
        if (cat && e.category !== cat) return false
        if (noDocs && (e.attachments || []).length) return false
        if (objectId === "none" && e.object_id) return false
        if (objectId && objectId !== "none" && String(e.object_id) !== objectId) return false
        return true
      }),
    [data.expenses, cat, objectId, noDocs],
  )
  const listTotal = list.reduce((a, e) => a + e.amount, 0)
  const withoutDocs = data.expenses.filter((e) => !(e.attachments || []).length).length

  const add = () => {
    setEditing(null)
    setOpen(true)
  }

  return (
    <div className={`${card} flex flex-col gap-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-medium flex items-center gap-2">
          <Icon name="Wallet" size={16} className="text-[#D4AF37]" />
          Расходы
        </p>
        <div className="grid grid-cols-2 w-full sm:w-auto sm:flex sm:flex-wrap gap-2">
          <ExpenseExportButton />
          <button
            onClick={add}
            className="inline-flex justify-center min-h-[44px] sm:min-h-0 w-full sm:w-auto items-center gap-1.5 rounded-lg bg-[#D4AF37] px-3 py-2 text-sm font-medium text-[#161616] hover:bg-[#B8860B]"
          >
            <Icon name="Plus" size={15} />
            Добавить расход
          </button>
        </div>
      </div>

      {byCat.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-white/5">
            {byCat.map(([k, v]) => (
              <div key={k} style={{ width: `${(v / catTotal) * 100}%`, background: EXPENSE_COLORS[k] || "#6b7280" }} title={data.categories[k]} />
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
                <span className="h-2 w-2 rounded-full" style={{ background: EXPENSE_COLORS[k] || "#6b7280" }} />
                {data.categories[k] || k}
                <span className="text-white/90">{rub(v)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {data.expenses.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
        <select
          value={objectId}
          onChange={(e) => setObjectId(e.target.value)}
          className="w-full sm:w-72 rounded-lg border border-white/10 bg-[#161616] px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"
        >
          <option value="">Все объекты</option>
          <option value="none">Общие расходы компании</option>
          {data.object_options
            .filter((o) => data.expenses.some((e) => e.object_id === o.id))
            .map((o) => (
              <option key={o.id} value={o.id}>
                {o.object_code}
                {o.client_name ? ` · ${o.client_name}` : ""}
              </option>
            ))}
        </select>
          {withoutDocs > 0 && (
            <button
              onClick={() => setNoDocs((v) => !v)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                noDocs ? "bg-amber-500/20 text-amber-200" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              <Icon name="FileWarning" size={14} />
              Без документов · {withoutDocs}
            </button>
          )}
        </div>
      )}
      {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}
      <input ref={quickRef} type="file" accept="image/*,.heic,.pdf" multiple hidden onChange={(e) => onQuickFiles(e.target.files)} />

      {list.length === 0 ? (
        <div className="py-8 flex flex-col items-center gap-2 text-center">
          <Icon name="ReceiptText" size={28} className="text-white/20" />
          <p className="text-sm text-white/40">
            {data.expenses.length ? "По фильтру расходов нет" : "Внесите зарплаты, транспорт, инструмент — и увидите настоящую прибыль по объектам"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-white/5 -my-1">
          {list.map((e) => (
            <div key={e.id} className="group flex flex-wrap sm:flex-nowrap items-center gap-x-3 gap-y-2 py-2.5">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${EXPENSE_COLORS[e.category] || "#6b7280"}26`, color: EXPENSE_COLORS[e.category] || "#9ca3af" }}
              >
                <Icon name={EXPENSE_ICONS[e.category] || "Circle"} size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">
                  {data.categories[e.category] || e.category}
                  {e.from_bank && (
                    <span className="ml-1.5 inline-flex translate-y-[-1px] items-center gap-0.5 rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/50">
                      <Icon name="Landmark" size={10} />
                      банк
                    </span>
                  )}
                  {e.payee && <span className="text-white/60"> · {e.payee}</span>}
                </p>
                <p className="truncate text-xs text-white/40">
                  {dateRu(e.expense_date)}
                  {" · "}
                  {e.object_id ? (
                    <Link to={`/cabinet/objects/${e.object_id}`} className="hover:text-white">
                      {e.object_code}
                    </Link>
                  ) : (
                    "общий"
                  )}
                  {e.description && ` · ${e.description}`}
                </p>
              </div>
              <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                {(e.attachments || []).slice(0, 3).map((f) => (
                  <ExpenseFileThumb key={f.url} f={f} size="sm" />
                ))}
                {(e.attachments || []).length > 3 && <span className="text-xs text-white/40">+{(e.attachments || []).length - 3}</span>}
              </div>
              {(e.attachments || []).length > 0 && (
                <Icon name="Paperclip" size={13} className="shrink-0 text-white/40 sm:hidden" />
              )}
              <span className="shrink-0 font-medium text-red-300 whitespace-nowrap">−{rub(e.amount)}</span>
              <div className="flex w-full sm:w-auto justify-end shrink-0 gap-2 sm:gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                {!(e.attachments || []).length && (
                  <button
                    onClick={() => quickAttach(e)}
                    disabled={uploading}
                    className="flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-[#D4AF37]/20 hover:text-[#D4AF37]"
                    title="Прикрепить чек или накладную"
                  >
                    <Icon name={uploading && attachTo?.id === e.id ? "Loader2" : "Paperclip"} size={13} className={uploading && attachTo?.id === e.id ? "animate-spin" : ""} />
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditing(e)
                    setOpen(true)
                  }}
                  className="flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10"
                  title="Изменить"
                >
                  <Icon name="Pencil" size={13} />
                </button>
                <button
                  onClick={() => setRemoving(e)}
                  className="flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-300"
                  title="Удалить"
                >
                  <Icon name="Trash2" size={13} />
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-between pt-3 text-sm">
            <span className="text-white/50">Итого по списку · {list.length} шт.</span>
            <span className="font-semibold">{rub(listTotal)}</span>
          </div>
        </div>
      )}

      <ExpenseDialog
        open={open}
        onOpenChange={setOpen}
        expense={editing}
        categories={data.categories}
        objects={data.object_options}
        onSaved={onChanged}
      />
      <ConfirmDeleteDialog
        open={!!removing}
        onOpenChange={(v) => !v && setRemoving(null)}
        title="Удалить расход?"
        description={removing ? `${data.categories[removing.category] || ""} на ${rub(removing.amount)} от ${dateRu(removing.expense_date)}` : ""}
        onConfirm={async () => {
          if (removing) await financeApi.removeExpense(removing.id)
          setRemoving(null)
          onChanged()
        }}
      />
    </div>
  )
}

export default FinanceExpenses
