import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { darkenActHtml } from "@/lib/printAct"
import { addendaApi, AddendumItem, AddendumOptions, contractsApi, Contract, estimatesApi, companyApi, CompanyData } from "@/lib/api"
import { SignStampToggles } from "@/components/crm/common/SignStampToggles"

const n = (v: unknown) => {
  const x = typeof v === "string" ? parseFloat(v.replace(",", ".").replace(/\s/g, "")) : Number(v)
  return Number.isFinite(x) ? x : 0
}
const money = (v: unknown) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(n(v)) + " ₽"
const today = () => new Date().toISOString().slice(0, 10)
const blank = (): AddendumItem => ({ name: "", unit: "шт", quantity: 1, price: "" })

const input =
  "bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50 w-full"

function ItemsTable({
  title,
  hint,
  rows,
  onChange,
}: {
  title: string
  hint: string
  rows: AddendumItem[]
  onChange: (rows: AddendumItem[]) => void
}) {
  const upd = (i: number, patch: Partial<AddendumItem>) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  const sum = rows.reduce((s, r) => s + n(r.quantity) * n(r.price), 0)
  return (
    <div>
      <p className="text-sm font-medium mb-1">{title}</p>
      <p className="text-xs text-white/40 mb-2">{hint}</p>
      <div className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_70px_80px_100px_32px] gap-2 items-center">
            <input value={r.name} onChange={(e) => upd(i, { name: e.target.value })} placeholder="Наименование работ" className={input} />
            <input value={r.unit} onChange={(e) => upd(i, { unit: e.target.value })} placeholder="ед." className={input} />
            <input value={String(r.quantity)} inputMode="decimal" onChange={(e) => upd(i, { quantity: e.target.value })} placeholder="кол-во" className={input} />
            <input value={String(r.price)} inputMode="decimal" onChange={(e) => upd(i, { price: e.target.value })} placeholder="цена" className={input} />
            <button onClick={() => onChange(rows.filter((_, j) => j !== i))} className="text-white/40 hover:text-red-400" title="Удалить строку">
              <Icon name="Trash2" size={15} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-2">
        <button onClick={() => onChange([...rows, blank()])} className="inline-flex items-center gap-1.5 text-sm text-[#D4AF37] hover:underline">
          <Icon name="Plus" size={14} />
          Добавить строку
        </button>
        {rows.length > 0 && <span className="text-sm text-white/60">Итого: {money(sum)}</span>}
      </div>
    </div>
  )
}

export default function AddendumEdit() {
  const { id, contractId, addendumId } = useParams()
  const navigate = useNavigate()
  const objectId = Number(id)

  const [contract, setContract] = useState<Contract | null>(null)
  const [number, setNumber] = useState("")
  const [addDate, setAddDate] = useState(today())
  const [status, setStatus] = useState<"draft" | "signed">("draft")
  const [items, setItems] = useState<AddendumItem[]>([])
  const [removed, setRemoved] = useState<AddendumItem[]>([])
  const [oldTotal, setOldTotal] = useState<string>("")
  const [manual, setManual] = useState(false)
  const [newTotal, setNewTotal] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("")
  const [changeDeadline, setChangeDeadline] = useState(false)
  const [deadline, setDeadline] = useState("")
  const [reason, setReason] = useState("")
  const [custom, setCustom] = useState("")
  const [applySignature, setApplySignature] = useState(false)
  const [applyStamp, setApplyStamp] = useState(false)
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [previewHtml, setPreviewHtml] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    companyApi.get().then(setCompany).catch(() => null)
  }, [])

  useEffect(() => {
    const cid = Number(contractId)
    Promise.all([contractsApi.get(cid), addendumId ? addendaApi.get(Number(addendumId)) : Promise.resolve(null), addendaApi.list({ contract_id: cid })])
      .then(([c, a, list]) => {
        setContract(c)
        if (a) {
          const o = a.options || {}
          setNumber(a.addendum_number)
          setAddDate(String(a.addendum_date).slice(0, 10))
          setStatus(a.status)
          setItems(o.items || [])
          setRemoved(o.removed_items || [])
          setOldTotal(String(o.old_total ?? c.total_amount ?? ""))
          setManual(o.price_mode === "manual")
          setNewTotal(String(o.new_total ?? ""))
          setPaymentTerms(o.payment_terms || "")
          setChangeDeadline(!!o.change_deadline)
          setDeadline(o.new_deadline || "")
          setReason(o.deadline_reason || "")
          setCustom(o.custom_terms || "")
          setApplySignature(!!o.apply_signature)
          setApplyStamp(!!o.apply_stamp)
        } else {
          const last = list.addenda[list.addenda.length - 1]
          setNumber(String(list.addenda.length + 1))
          setOldTotal(String(last ? n(last.total_amount) : n(c.total_amount)))
          setItems([blank()])
        }
      })
      .catch(() => navigate(`/cabinet/objects/${objectId}`))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId, addendumId])

  const options: AddendumOptions = useMemo(
    () => ({
      items: items.filter((r) => r.name.trim()),
      removed_items: removed.filter((r) => r.name.trim()),
      old_total: oldTotal,
      price_mode: manual ? "manual" : "auto",
      new_total: newTotal,
      payment_terms: paymentTerms,
      change_deadline: changeDeadline,
      new_deadline: deadline,
      deadline_reason: reason,
      custom_terms: custom,
      apply_signature: applySignature,
      apply_stamp: applyStamp,
    }),
    [items, removed, oldTotal, manual, newTotal, paymentTerms, changeDeadline, deadline, reason, custom, applySignature, applyStamp],
  )

  const autoTotal =
    n(oldTotal) + items.reduce((s, r) => s + n(r.quantity) * n(r.price), 0) - removed.reduce((s, r) => s + n(r.quantity) * n(r.price), 0)

  useEffect(() => {
    if (!contract) return
    const t = setTimeout(() => {
      addendaApi
        .preview({ contract_id: contract.id, addendum_number: number, addendum_date: addDate, options })
        .then((r) => setPreviewHtml(r.content_html))
        .catch(() => {})
    }, 600)
    return () => clearTimeout(t)
  }, [contract, number, addDate, options])

  const importPending = async () => {
    setImporting(true)
    setError("")
    try {
      const { estimates } = await estimatesApi.listByObject(objectId)
      const full = await Promise.all(estimates.filter((e) => e.status !== "inactive").slice(0, 3).map((e) => estimatesApi.get(e.id)))
      const extra = full
        .flatMap((e) => e.items || [])
        .filter((it) => it.proposed_by && it.status === "approved")
        .map((it) => ({ name: it.name, unit: it.unit, quantity: Number(it.quantity), price: Number(it.price) }))
      if (!extra.length) {
        setError("Согласованных доп. работ от заказчика не найдено")
        return
      }
      const seen = new Set(items.map((r) => r.name))
      setItems((prev) => [...prev.filter((r) => r.name.trim()), ...extra.filter((x) => !seen.has(x.name))])
    } finally {
      setImporting(false)
    }
  }

  const save = async () => {
    if (!contract) return
    setError("")
    if (!options.items?.length && !options.removed_items?.length && !changeDeadline && !custom.trim() && !manual) {
      setError("Добавьте хотя бы одно изменение: работы, сроки или свои условия")
      return
    }
    setSaving(true)
    try {
      const res = await addendaApi.save(
        { contract_id: contract.id, addendum_number: number, addendum_date: addDate, status, options },
        addendumId ? Number(addendumId) : undefined,
      )
      navigate(`/cabinet/objects/${objectId}/contracts/${contract.id}/addenda/${res.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить")
    } finally {
      setSaving(false)
    }
  }

  if (loading || !contract) {
    return (
      <CrmLayout title="Дополнительное соглашение">
        <div className="flex items-center justify-center py-24">
          <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
        </div>
      </CrmLayout>
    )
  }

  const card = "bg-[#1f1f1f] border border-white/10 rounded-xl p-5 flex flex-col gap-4"

  return (
    <CrmLayout title={`Доп. соглашение к договору № ${contract.contract_number}`} subtitle={addendumId ? "Редактирование" : "Новое соглашение"}>
      <Link
        to={`/cabinet/objects/${objectId}/contracts/${contract.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors mb-4"
      >
        <Icon name="ChevronLeft" size={16} />
        К договору
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 items-start">
        <div className="flex flex-col gap-4">
          <div className={card}>
            <div className="grid grid-cols-3 gap-3">
              <label className="flex flex-col gap-1 text-xs text-white/50">
                Номер
                <input value={number} onChange={(e) => setNumber(e.target.value)} className={input} />
              </label>
              <label className="flex flex-col gap-1 text-xs text-white/50">
                Дата
                <input type="date" value={addDate} onChange={(e) => setAddDate(e.target.value)} className={input} />
              </label>
              <label className="flex flex-col gap-1 text-xs text-white/50">
                Статус
                <select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "signed")} className={input}>
                  <option value="draft">Черновик</option>
                  <option value="signed">Подписано</option>
                </select>
              </label>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-white/50">Подпись и печать Исполнителя</span>
              <SignStampToggles
                signatureUrl={company?.signature_url}
                stampUrl={company?.stamp_url}
                applySignature={applySignature}
                applyStamp={applyStamp}
                onChange={(k, v) => (k === "apply_signature" ? setApplySignature(v) : setApplyStamp(v))}
              />
            </div>
          </div>

          <div className={card}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium flex items-center gap-2">
                <Icon name="ListPlus" size={16} className="text-[#D4AF37]" />
                Изменение объёма работ
              </p>
              <button
                onClick={importPending}
                disabled={importing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs disabled:opacity-60"
              >
                <Icon name={importing ? "Loader2" : "Download"} size={14} className={importing ? "animate-spin" : ""} />
                Подставить согласованные доп. работы
              </button>
            </div>
            <ItemsTable title="Дополнительные работы" hint="Работы, которых не было в договоре" rows={items} onChange={setItems} />
            <ItemsTable title="Исключаемые работы" hint="Если какие-то работы убираются из договора" rows={removed} onChange={setRemoved} />
          </div>

          <div className={card}>
            <p className="font-medium flex items-center gap-2">
              <Icon name="Wallet" size={16} className="text-[#D4AF37]" />
              Цена договора
            </p>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-xs text-white/50">
                Действующая цена, ₽
                <input value={oldTotal} inputMode="decimal" onChange={(e) => setOldTotal(e.target.value)} className={input} />
              </label>
              <label className="flex flex-col gap-1 text-xs text-white/50">
                Новая цена, ₽
                {manual ? (
                  <input value={newTotal} inputMode="decimal" onChange={(e) => setNewTotal(e.target.value)} className={input} />
                ) : (
                  <div className={`${input} text-[#D4AF37] font-medium`}>{money(autoTotal)}</div>
                )}
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" checked={manual} onChange={(e) => setManual(e.target.checked)} />
              Указать новую цену вручную
            </label>
            <textarea
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              rows={2}
              placeholder="Порядок оплаты доп. работ (необязательно): например, 50% аванс в течение 3 дней, остаток после приёмки"
              className={`${input} resize-none`}
            />
          </div>

          <div className={card}>
            <label className="flex items-center gap-2 font-medium">
              <input type="checkbox" checked={changeDeadline} onChange={(e) => setChangeDeadline(e.target.checked)} />
              <Icon name="CalendarClock" size={16} className="text-[#D4AF37]" />
              Изменить срок окончания работ
            </label>
            {changeDeadline && (
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-xs text-white/50">
                  Новый срок
                  <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={input} />
                </label>
                <label className="flex flex-col gap-1 text-xs text-white/50">
                  В связи с
                  <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="увеличением объёма работ" className={input} />
                </label>
              </div>
            )}
          </div>

          <div className={card}>
            <p className="font-medium flex items-center gap-2">
              <Icon name="PenLine" size={16} className="text-[#D4AF37]" />
              Свои условия
            </p>
            <textarea
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              rows={4}
              placeholder="Каждый абзац станет отдельным пунктом соглашения"
              className={`${input} resize-y`}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 flex items-center gap-1.5">
              <Icon name="CircleAlert" size={15} />
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] px-5 py-2.5 text-sm font-medium text-[#161616] disabled:opacity-60"
            >
              {saving && <Icon name="Loader2" size={15} className="animate-spin" />}
              Сохранить соглашение
            </button>
            <Link to={`/cabinet/objects/${objectId}/contracts/${contract.id}`} className="rounded-lg bg-white/5 hover:bg-white/10 px-5 py-2.5 text-sm">
              Отмена
            </Link>
          </div>
        </div>

        <div className="xl:sticky xl:top-4">
          <p className="text-xs text-white/40 uppercase tracking-wide mb-2">Предпросмотр</p>
          <div className="bg-white text-[#161616] rounded-xl p-6 sm:p-8 shadow-lg max-h-[85vh] overflow-y-auto">
            {previewHtml ? (
              <div dangerouslySetInnerHTML={{ __html: darkenActHtml(previewHtml) }} />
            ) : (
              <div className="flex justify-center py-16">
                <Icon name="Loader2" size={22} className="animate-spin text-black/30" />
              </div>
            )}
          </div>
        </div>
      </div>
    </CrmLayout>
  )
}
