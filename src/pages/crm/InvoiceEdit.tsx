import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import {
  Act,
  actsApi,
  companyApi,
  CompanyData,
  Contract,
  contractsApi,
  Invoice,
  InvoiceItem,
  InvoiceVatMode,
  invoicesApi,
  objectsApi,
  ObjectItem,
} from "@/lib/api"
import { SignStampToggles } from "@/components/crm/common/SignStampToggles"
import { VAT_RATES, buildInvoiceHtml, defaultPaymentNote, defaultPurpose, invoiceTotals } from "@/lib/buildInvoiceHtml"
import { actInvoiceItems, contractInvoiceItem, contractPayments } from "@/lib/invoiceSources"

const field =
  "bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"
const money = (n: number) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(n || 0) + " ₽"
const today = () => new Date().toISOString().slice(0, 10)
const plusDays = (d: string, n: number) => {
  const dt = new Date(d)
  dt.setDate(dt.getDate() + n)
  return dt.toISOString().slice(0, 10)
}

export default function InvoiceEdit() {
  const { id, invoiceId } = useParams()
  const objectId = Number(id)
  const editId = invoiceId ? Number(invoiceId) : null
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [object, setObject] = useState<ObjectItem | null>(null)
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [contracts, setContracts] = useState<Contract[]>([])
  const [acts, setActs] = useState<Act[]>([])

  const [contractId, setContractId] = useState<number | null>(params.get("contract_id") ? Number(params.get("contract_id")) : null)
  const [actId, setActId] = useState<number | null>(params.get("act_id") ? Number(params.get("act_id")) : null)
  const [paymentKey, setPaymentKey] = useState("")
  const [number, setNumber] = useState("")
  const [invDate, setInvDate] = useState(today())
  const [dueDate, setDueDate] = useState(plusDays(today(), 5))
  const [purpose, setPurpose] = useState("")
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [vatMode, setVatMode] = useState<InvoiceVatMode>("none")
  const [notes, setNotes] = useState("")
  const [paymentNote, setPaymentNote] = useState<string | null>(null)
  const [applySignature, setApplySignature] = useState(true)
  const [applyStamp, setApplyStamp] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      objectsApi.get(objectId).catch(() => null),
      companyApi.get().catch(() => null),
      contractsApi.listByObject(objectId).then((d) => d.contracts).catch(() => [] as Contract[]),
      actsApi.listAll().then((d) => d.acts.filter((a) => a.object_id === objectId)).catch(() => [] as Act[]),
      editId ? invoicesApi.get(editId).catch(() => null) : Promise.resolve(null),
    ])
      .then(async ([obj, comp, cs, as, inv]) => {
        setObject(obj)
        setCompany(comp)
        setContracts(cs)
        setActs(as)
        if (inv) {
          setContractId(inv.contract_id || null)
          setActId(inv.act_id || null)
          setNumber(inv.invoice_number)
          setInvDate(String(inv.invoice_date).slice(0, 10))
          setDueDate(inv.due_date ? String(inv.due_date).slice(0, 10) : "")
          setPurpose(inv.purpose)
          setItems(inv.items || [])
          setVatMode(inv.vat_mode || "none")
          setNotes(inv.notes || "")
          setPaymentNote(inv.payment_note ?? null)
          setApplySignature(inv.apply_signature)
          setApplyStamp(inv.apply_stamp)
          return
        }
        // Новый счёт: заполняем по акту или по договору
        const aId = params.get("act_id")
        const cId = params.get("contract_id")
        if (aId) {
          const full = await actsApi.get(Number(aId)).catch(() => null)
          if (full) {
            setItems(actInvoiceItems(full))
            if (full.contract_id) setContractId(full.contract_id)
          }
        } else if (cId) {
          const c = cs.find((x) => x.id === Number(cId))
          if (c) {
            const pays = contractPayments(c)
            const first = pays[1] || pays[0]
            setPaymentKey(first.key)
            setItems([contractInvoiceItem(c, first)])
          }
        }
        if (comp?.signature_url === undefined) setApplySignature(false)
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectId, editId])

  const contract = useMemo(() => contracts.find((c) => c.id === contractId) || null, [contracts, contractId])
  const act = useMemo(() => acts.find((a) => a.id === actId) || null, [acts, actId])
  const payments = useMemo(() => (contract ? contractPayments(contract) : []), [contract])

  const autoPurpose = defaultPurpose({
    contract: contract ? { contract_number: contract.contract_number, contract_date: contract.contract_date, options: contract.options } : null,
    act: act ? { act_number: act.act_number, act_date: act.act_date } : null,
  })

  const chooseContract = (cid: number | null) => {
    setContractId(cid)
    setPaymentKey("")
    const c = contracts.find((x) => x.id === cid)
    if (c && !actId) {
      const pays = contractPayments(c)
      const first = pays[1] || pays[0]
      setPaymentKey(first.key)
      setItems([contractInvoiceItem(c, first)])
    }
  }

  const choosePayment = (key: string) => {
    setPaymentKey(key)
    const p = payments.find((x) => x.key === key)
    if (contract && p) setItems([contractInvoiceItem(contract, p)])
  }

  const chooseAct = async (aid: number | null) => {
    setActId(aid)
    if (!aid) return
    const full = await actsApi.get(aid).catch(() => null)
    if (!full) return
    setItems(actInvoiceItems(full))
    if (full.contract_id) setContractId(full.contract_id)
    setPaymentKey("")
  }

  const updateItem = (i: number, patch: Partial<InvoiceItem>) =>
    setItems((prev) =>
      prev.map((it, idx) => {
        if (idx !== i) return it
        const next = { ...it, ...patch }
        next.amount = (Number(next.quantity) || 0) * (Number(next.price) || 0)
        return next
      }),
    )

  const totals = invoiceTotals({ items, vat_mode: vatMode })

  const preview: Invoice = {
    id: editId || 0,
    object_id: objectId,
    contract_id: contractId,
    act_id: actId,
    invoice_number: number || "—",
    invoice_date: invDate,
    due_date: dueDate || null,
    purpose,
    items,
    vat_mode: vatMode,
    total_amount: totals.total,
    apply_signature: applySignature,
    apply_stamp: applyStamp,
    notes,
    payment_note: paymentNote,
    status: "issued",
    created_at: "",
    updated_at: "",
    company: company || {},
    customer: {
      name: object?.client_name || "",
      phone: object?.client_phone || "",
      email: object?.email || "",
      address: object?.address || "",
      object_code: object?.object_code || "",
    },
    contract: contract ? { contract_number: contract.contract_number, contract_date: contract.contract_date, options: contract.options } : null,
    act: act ? { act_number: act.act_number, act_date: act.act_date } : null,
  }

  const save = async () => {
    setError("")
    if (!items.some((it) => it.name.trim() && Number(it.price) > 0)) {
      setError("Добавьте хотя бы одну позицию с ценой")
      return
    }
    setSaving(true)
    try {
      const payload = {
        object_id: objectId,
        contract_id: contractId,
        act_id: actId,
        invoice_number: number.trim(),
        invoice_date: invDate,
        due_date: dueDate || null,
        purpose: purpose.trim(),
        items,
        vat_mode: vatMode,
        notes: notes.trim(),
        payment_note: paymentNote,
        apply_signature: applySignature,
        apply_stamp: applyStamp,
      }
      if (editId) {
        await invoicesApi.update(editId, payload)
        navigate(`/cabinet/objects/${objectId}/invoices/${editId}`)
      } else {
        const res = await invoicesApi.create(payload)
        navigate(`/cabinet/objects/${objectId}/invoices/${res.id}`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить счёт")
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <CrmLayout title="Счёт на оплату">
        <div className="flex items-center justify-center py-24">
          <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
        </div>
      </CrmLayout>
    )
  }

  const missingBank = !company?.bank_name || !company?.account_number || !company?.bik

  return (
    <CrmLayout title={editId ? `Счёт № ${number}` : "Новый счёт на оплату"} subtitle={object?.client_name || ""}>
      <button
        onClick={() => navigate(editId ? `/cabinet/objects/${objectId}/invoices/${editId}` : `/cabinet/objects/${objectId}`)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white"
      >
        <Icon name="ChevronLeft" size={16} />
        Назад
      </button>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="flex flex-col gap-4">
          {missingBank && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              <Icon name="TriangleAlert" size={16} className="mt-0.5 shrink-0" />
              В разделе «Компания» не заполнены банковские реквизиты — без них заказчик не сможет оплатить счёт.
            </div>
          )}

          <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#1f1f1f] p-5">
            <p className="font-medium">Основание</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Договор</label>
                <select value={contractId ?? ""} onChange={(e) => chooseContract(e.target.value ? Number(e.target.value) : null)} className={field}>
                  <option value="">Без договора</option>
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      Договор № {c.contract_number}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Акт</label>
                <select value={actId ?? ""} onChange={(e) => chooseAct(e.target.value ? Number(e.target.value) : null)} className={field}>
                  <option value="">Без акта</option>
                  {acts.map((a) => (
                    <option key={a.id} value={a.id}>
                      Акт № {a.act_number} — {money(a.total_amount)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {contract && !actId && payments.length > 1 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Какой платёж выставить</label>
                <div className="flex flex-wrap gap-2">
                  {payments.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => choosePayment(p.key)}
                      className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                        paymentKey === p.key ? "bg-[#D4AF37] text-[#161616]" : "bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {p.label} · {money(p.amount)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#1f1f1f] p-5">
            <p className="font-medium">Реквизиты счёта</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Номер счёта</label>
                <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Автоматически" className={field} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Дата счёта</label>
                <input type="date" value={invDate} onChange={(e) => setInvDate(e.target.value)} className={field} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Оплатить до</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={field} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Основание платежа</label>
              <input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder={autoPurpose || "Например: Оплата по Договору № 3"} className={field} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">НДС</label>
              <select value={vatMode} onChange={(e) => setVatMode(e.target.value as InvoiceVatMode)} className={field}>
                <option value="none">Без НДС</option>
                {(vatMode === "included" || vatMode === "on_top") && (
                  <option value={vatMode}>НДС 20% {vatMode === "included" ? "включён в цену" : "сверху"}</option>
                )}
                {VAT_RATES.map((r) => [
                  <option key={`i${r}`} value={`included_${r}`}>НДС {r}% включён в цену</option>,
                  <option key={`t${r}`} value={`on_top_${r}`}>НДС {r}% сверху</option>,
                ])}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#1f1f1f] p-5">
            <p className="font-medium">Позиции</p>
            {items.map((it, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-lg border border-white/10 bg-[#161616] p-3">
                <div className="flex gap-2">
                  <textarea
                    value={it.name}
                    onChange={(e) => updateItem(i, { name: e.target.value })}
                    rows={2}
                    className={`${field} flex-1 resize-none`}
                  />
                  <button
                    onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                    title="Удалить"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/50 transition-colors hover:bg-red-500/20 hover:text-red-300"
                  >
                    <Icon name="Trash2" size={15} />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <input type="number" value={it.quantity} onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })} className={field} title="Количество" />
                  <input value={it.unit} onChange={(e) => updateItem(i, { unit: e.target.value })} className={field} title="Единица" />
                  <input type="number" value={it.price} onChange={(e) => updateItem(i, { price: Number(e.target.value) })} className={field} title="Цена" />
                  <div className="flex items-center justify-end text-sm font-medium">{money((Number(it.quantity) || 0) * (Number(it.price) || 0))}</div>
                </div>
              </div>
            ))}
            <button
              onClick={() => setItems((prev) => [...prev, { name: "", unit: "усл.", quantity: 1, price: 0, amount: 0 }])}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/15 py-2.5 text-sm text-white/60 transition-colors hover:border-[#D4AF37]/40 hover:text-white"
            >
              <Icon name="Plus" size={15} />
              Добавить позицию
            </button>
            <div className="flex flex-col items-end gap-0.5 pt-2 text-sm">
              {vatMode !== "none" && <span className="text-white/50">НДС: {money(totals.vat)}</span>}
              <span className="text-lg font-semibold text-[#D4AF37]">К оплате: {money(totals.total)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#1f1f1f] p-5">
            <p className="font-medium">Дополнительно</p>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Назначение платежа</label>
              <input
                value={paymentNote ?? defaultPaymentNote({ invoice_number: number || "—", invoice_date: invDate })}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Оставьте пустым, чтобы не выводить строку"
                className={field}
              />
              {paymentNote !== null && (
                <button type="button" onClick={() => setPaymentNote(null)} className="self-start text-xs text-[#D4AF37] hover:underline">
                  Вернуть по умолчанию
                </button>
              )}
            </div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Примечание для заказчика (необязательно)" className={`${field} resize-none`} />
            <SignStampToggles
              signatureUrl={company?.signature_url}
              stampUrl={company?.stamp_url}
              applySignature={applySignature}
              applyStamp={applyStamp}
              onChange={(k, v) => (k === "apply_signature" ? setApplySignature(v) : setApplyStamp(v))}
            />
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-sm text-red-400">
              <Icon name="CircleAlert" size={15} />
              {error}
            </p>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-3 text-sm font-medium text-[#161616] transition-colors hover:bg-[#B8860B] disabled:opacity-60"
          >
            {saving ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Check" size={15} />}
            {editId ? "Сохранить счёт" : "Создать счёт"}
          </button>
        </div>

        <div className="xl:sticky xl:top-4 xl:self-start">
          <p className="mb-2 text-xs uppercase tracking-wide text-white/40">Предпросмотр</p>
          {contractId && items.length === 1 && (
            <p className="mb-2 flex items-start gap-1.5 text-xs text-white/50">
              <Icon name="Info" size={13} className="mt-0.5 shrink-0" />
              Если у договора есть смета, после сохранения в счёте будет полный перечень работ с количеством и ценой — как в чеке. Сумма не изменится.
            </p>
          )}
          <div className="rounded-xl bg-white p-6 text-[#161616] shadow-lg sm:p-8">
            <div dangerouslySetInnerHTML={{ __html: buildInvoiceHtml({ ...preview, purpose: purpose || autoPurpose }) }} />
          </div>
        </div>
      </div>
    </CrmLayout>
  )
}
