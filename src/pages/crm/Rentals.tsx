import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import {
  RentalFormValue,
  emptyRentalForm,
  rentalToForm,
} from "@/components/crm/rental/RentalForm"
import { RentalsHeader } from "@/components/crm/rental/RentalsHeader"
import { RentalsList } from "@/components/crm/rental/RentalsList"
import { CounterpartiesList } from "@/components/crm/rental/CounterpartiesList"
import { RentalsDialogs } from "@/components/crm/rental/RentalsDialogs"
import { Tab } from "@/components/crm/rental/rentalsUi"
import {
  rentalsApi,
  Rental,
  RentalCounterparty,
  RentalStockItem,
  WarehouseObject,
} from "@/lib/api"
import { daysLeft, isOverdue, num, rentalTotal } from "@/lib/rental"

export default function Rentals() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>("active")
  const [loading, setLoading] = useState(true)
  const [rentals, setRentals] = useState<Rental[]>([])
  const [counterparties, setCounterparties] = useState<RentalCounterparty[]>([])
  const [stock, setStock] = useState<RentalStockItem[]>([])
  const [objects, setObjects] = useState<WarehouseObject[]>([])
  const [error, setError] = useState("")

  const [rentalOpen, setRentalOpen] = useState(false)
  const [editingRental, setEditingRental] = useState<Rental | null>(null)
  const [form, setForm] = useState<RentalFormValue>(emptyRentalForm())
  const [saving, setSaving] = useState(false)

  const [cpOpen, setCpOpen] = useState(false)
  const [editingCp, setEditingCp] = useState<RentalCounterparty | null>(null)
  const [cpForm, setCpForm] = useState<Partial<RentalCounterparty>>({ party_kind: "individual" })

  const [returnFor, setReturnFor] = useState<Rental | null>(null)
  const [returnQty, setReturnQty] = useState("")
  const [returnNote, setReturnNote] = useState("")

  const load = () => {
    setLoading(true)
    rentalsApi
      .list()
      .then((d) => {
        setRentals(d.rentals || [])
        setCounterparties(d.counterparties || [])
        setStock(d.stock || [])
        setObjects(d.objects || [])
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Не удалось загрузить"))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const active = useMemo(() => rentals.filter((r) => r.status === "active"), [rentals])
  const returned = useMemo(() => rentals.filter((r) => r.status !== "active"), [rentals])
  const overdue = useMemo(() => active.filter(isOverdue), [active])

  const activeSum = useMemo(
    () => active.reduce((s, r) => s + rentalTotal(r), 0),
    [active],
  )
  const depositSum = useMemo(
    () => active.reduce((s, r) => s + num(r.deposit), 0),
    [active],
  )

  const openCreate = () => {
    setEditingRental(null)
    setForm(emptyRentalForm())
    setError("")
    setRentalOpen(true)
  }

  const openEdit = (r: Rental) => {
    setEditingRental(r)
    setForm(rentalToForm(r))
    setError("")
    setRentalOpen(true)
  }

  const saveRental = async () => {
    setError("")
    if (!form.item_name.trim() && !form.warehouse_item_id) {
      setError("Укажите инструмент")
      return
    }
    if (num(form.qty) <= 0) {
      setError("Количество должно быть больше нуля")
      return
    }

    setSaving(true)
    try {
      const payload = {
        direction: form.direction,
        warehouse_item_id: form.warehouse_item_id ? Number(form.warehouse_item_id) : null,
        item_name: form.item_name.trim(),
        unit: form.unit.trim() || "шт",
        qty: num(form.qty),
        counterparty_id: form.counterparty_id ? Number(form.counterparty_id) : null,
        object_id: form.object_id ? Number(form.object_id) : null,
        rate: num(form.rate),
        rate_period: form.rate_period,
        deposit: num(form.deposit),
        date_from: form.date_from,
        date_to: form.date_to || null,
        condition_note: form.condition_note.trim(),
        notes: form.notes.trim(),
      }

      if (editingRental) {
        await rentalsApi.update(editingRental.id, payload as Partial<Rental>)
      } else {
        await rentalsApi.create(payload as Partial<Rental>)
      }
      setRentalOpen(false)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить")
    } finally {
      setSaving(false)
    }
  }

  const openCpCreate = () => {
    setEditingCp(null)
    setCpForm({ party_kind: "individual" })
    setError("")
    setCpOpen(true)
  }

  const openCpEdit = (c: RentalCounterparty) => {
    setEditingCp(c)
    setCpForm({ ...c })
    setError("")
    setCpOpen(true)
  }

  const saveCp = async () => {
    setError("")
    if (!cpForm.display_name?.trim()) {
      setError("Укажите, как отображать контрагента в списке")
      return
    }
    setSaving(true)
    try {
      if (editingCp) {
        await rentalsApi.counterparties.update(editingCp.id, cpForm)
      } else {
        const created = await rentalsApi.counterparties.create(cpForm)
        if (rentalOpen) setForm((f) => ({ ...f, counterparty_id: String(created.id) }))
      }
      setCpOpen(false)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить")
    } finally {
      setSaving(false)
    }
  }

  const doReturn = async () => {
    if (!returnFor) return
    setSaving(true)
    try {
      await rentalsApi.returnItem(returnFor.id, {
        qty: returnQty ? num(returnQty) : undefined,
        condition_note: returnNote.trim() || undefined,
      })
      setReturnFor(null)
      setReturnQty("")
      setReturnNote("")
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось оформить возврат")
    } finally {
      setSaving(false)
    }
  }

  const removeRental = async (id: number) => {
    await rentalsApi.remove(id)
    load()
  }

  const removeCp = async (id: number) => {
    try {
      await rentalsApi.counterparties.remove(id)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось удалить")
    }
  }

  const rows = tab === "active" ? active : returned

  const statusBadge = (r: Rental) => {
    if (r.status !== "active") {
      return (
        <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/60">
          возвращён
        </span>
      )
    }
    if (isOverdue(r)) {
      return (
        <span className="rounded-full bg-red-500/20 px-2 py-1 text-[11px] text-red-300">
          просрочен
        </span>
      )
    }
    const left = daysLeft(r.date_to)
    return (
      <span className="rounded-full bg-green-500/20 px-2 py-1 text-[11px] text-green-300">
        {left === null ? "в аренде" : `осталось ${left} дн.`}
      </span>
    )
  }

  const openReturn = (r: Rental) => {
    setReturnFor(r)
    setReturnQty(String(num(r.qty) - num(r.returned_qty)))
  }

  return (
    <CrmLayout title="Аренда" subtitle="Инструмент, который мы выдали и который взяли сами">
      <RentalsHeader
        error={error}
        showError={!rentalOpen && !cpOpen}
        activeCount={active.length}
        overdueCount={overdue.length}
        returnedCount={returned.length}
        counterpartiesCount={counterparties.length}
        activeSum={activeSum}
        depositSum={depositSum}
        tab={tab}
        onTabChange={setTab}
        onCreate={tab === "counterparties" ? openCpCreate : openCreate}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Icon name="Loader2" size={24} className="animate-spin text-white/40" />
        </div>
      ) : tab === "counterparties" ? (
        <CounterpartiesList
          counterparties={counterparties}
          rentals={rentals}
          onEdit={openCpEdit}
          onRemove={removeCp}
        />
      ) : (
        <RentalsList
          rows={rows}
          tab={tab}
          statusBadge={statusBadge}
          onReturn={openReturn}
          onContract={(r) => navigate(`/cabinet/rentals/${r.id}/contract`)}
          onEdit={openEdit}
          onRemove={removeRental}
        />
      )}

      <RentalsDialogs
        error={error}
        saving={saving}
        rentalOpen={rentalOpen}
        setRentalOpen={setRentalOpen}
        editingRental={editingRental}
        form={form}
        onFormChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
        stock={stock}
        counterparties={counterparties}
        objects={objects}
        onCreateCounterparty={openCpCreate}
        onSaveRental={saveRental}
        cpOpen={cpOpen}
        setCpOpen={setCpOpen}
        editingCp={editingCp}
        cpForm={cpForm}
        onCpFormChange={(patch) => setCpForm((f) => ({ ...f, ...patch }))}
        onSaveCp={saveCp}
        returnFor={returnFor}
        setReturnFor={setReturnFor}
        returnQty={returnQty}
        setReturnQty={setReturnQty}
        returnNote={returnNote}
        setReturnNote={setReturnNote}
        onReturn={doReturn}
      />
    </CrmLayout>
  )
}
