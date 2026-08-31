import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DeleteButton } from "@/components/ui/delete-button"
import { MobileCard } from "@/components/crm/MobileCard"
import { CounterpartyForm } from "@/components/crm/rental/CounterpartyForm"
import {
  RentalForm,
  RentalFormValue,
  emptyRentalForm,
  rentalToForm,
} from "@/components/crm/rental/RentalForm"
import {
  rentalsApi,
  Rental,
  RentalCounterparty,
  RentalStockItem,
  WarehouseObject,
} from "@/lib/api"
import {
  PARTY_LABEL,
  PERIOD_SHORT,
  daysLeft,
  isOverdue,
  money,
  num,
  periodsCount,
  rentalTotal,
} from "@/lib/rental"

type Tab = "active" | "returned" | "counterparties"

const goldBtn =
  "flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 min-h-[44px] rounded-lg disabled:opacity-40"

const ghostBtn =
  "flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 transition-colors text-sm px-4 min-h-[44px] rounded-lg"

const card = "rounded-xl border border-white/10 bg-[#1f1f1f] p-4 md:p-5"

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

  return (
    <CrmLayout title="Аренда" subtitle="Инструмент, который мы выдали и который взяли сами">
      {error && !rentalOpen && !cpOpen && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          <Icon name="CircleAlert" size={16} />
          {error}
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={card}>
          <div className="text-xs text-white/40">В аренде сейчас</div>
          <div className="text-2xl text-[#D4AF37]">{active.length}</div>
        </div>
        <div className={card}>
          <div className="text-xs text-white/40">Просрочено</div>
          <div className={`text-2xl ${overdue.length ? "text-red-400" : "text-white/60"}`}>
            {overdue.length}
          </div>
        </div>
        <div className={card}>
          <div className="text-xs text-white/40">Начислено аренды</div>
          <div className="text-xl text-[#7FB5E8] md:text-2xl">{money(activeSum)}</div>
        </div>
        <div className={card}>
          <div className="text-xs text-white/40">Залогов на руках</div>
          <div className="text-xl md:text-2xl">{money(depositSum)}</div>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto">
          {([
            ["active", `Активные (${active.length})`],
            ["returned", `История (${returned.length})`],
            ["counterparties", `Контрагенты (${counterparties.length})`],
          ] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`min-h-[40px] shrink-0 rounded-lg px-4 text-sm transition-colors ${
                tab === key
                  ? "bg-[#D4AF37] text-[#161616]"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          className={goldBtn}
          onClick={tab === "counterparties" ? openCpCreate : openCreate}
        >
          <Icon name="Plus" size={16} />
          {tab === "counterparties" ? "Новый контрагент" : "Оформить аренду"}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Icon name="Loader2" size={24} className="animate-spin text-white/40" />
        </div>
      ) : tab === "counterparties" ? (
        counterparties.length === 0 ? (
          <div className={`${card} py-16 text-center text-sm text-white/30`}>
            Контрагентов пока нет — добавьте того, кому выдаёте инструмент
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 md:hidden">
              {counterparties.map((c) => (
                <MobileCard
                  key={c.id}
                  title={c.display_name}
                  subtitle={c.phone || c.email || "контакт не указан"}
                  badge={
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/60">
                      {PARTY_LABEL[c.party_kind]}
                    </span>
                  }
                  rows={[
                    {
                      label: c.party_kind === "individual" ? "Паспорт" : "ИНН",
                      value:
                        c.party_kind === "individual"
                          ? [c.passport_series, c.passport_number].filter(Boolean).join(" ") || "—"
                          : c.inn || "—",
                    },
                    {
                      label: "Аренд",
                      value: rentals.filter((r) => r.counterparty_id === c.id).length,
                    },
                  ]}
                  actions={
                    <>
                      <button
                        onClick={() => openCpEdit(c)}
                        className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/5 text-xs text-white/70"
                      >
                        <Icon name="Pencil" size={15} />
                        Изменить
                      </button>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
                        <DeleteButton onConfirm={() => removeCp(c.id)} />
                      </div>
                    </>
                  }
                />
              ))}
            </div>

            <div className={`hidden md:block ${card}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase text-white/40">
                      <th className="py-2 pr-4 text-left font-medium">Контрагент</th>
                      <th className="py-2 pr-4 text-left font-medium">Тип</th>
                      <th className="py-2 pr-4 text-left font-medium">Документ</th>
                      <th className="py-2 pr-4 text-left font-medium">Телефон</th>
                      <th className="py-2 pr-4 text-left font-medium">Аренд</th>
                      <th className="py-2 pr-4 text-left font-medium">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {counterparties.map((c) => (
                      <tr key={c.id} className="border-b border-white/5 last:border-0">
                        <td className="py-3 pr-4">{c.display_name}</td>
                        <td className="py-3 pr-4 text-white/60">{PARTY_LABEL[c.party_kind]}</td>
                        <td className="py-3 pr-4 text-white/60">
                          {c.party_kind === "individual"
                            ? [c.passport_series, c.passport_number].filter(Boolean).join(" ") || "—"
                            : c.inn
                            ? `ИНН ${c.inn}`
                            : "—"}
                        </td>
                        <td className="py-3 pr-4 text-white/60">{c.phone || "—"}</td>
                        <td className="py-3 pr-4">
                          {rentals.filter((r) => r.counterparty_id === c.id).length}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => openCpEdit(c)}
                              className="text-white/40 transition-colors hover:text-white"
                              title="Изменить"
                            >
                              <Icon name="Pencil" size={16} />
                            </button>
                            <DeleteButton onConfirm={() => removeCp(c.id)} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )
      ) : rows.length === 0 ? (
        <div className={`${card} py-16 text-center text-sm text-white/30`}>
          {tab === "active"
            ? "Сейчас ничего не в аренде — оформите первую выдачу"
            : "История пуста"}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {rows.map((r) => (
              <MobileCard
                key={r.id}
                title={r.item_name}
                subtitle={`${r.rental_number} · ${r.counterparty_name || "без контрагента"}`}
                badge={statusBadge(r)}
                rows={[
                  {
                    label: "Направление",
                    value: r.direction === "out" ? "Мы сдали" : "Мы взяли",
                  },
                  { label: "Количество", value: `${num(r.qty)} ${r.unit}` },
                  {
                    label: "Ставка",
                    value: `${money(num(r.rate))}/${PERIOD_SHORT[r.rate_period]}`,
                  },
                  {
                    label: "Срок",
                    value: `${new Date(r.date_from).toLocaleDateString("ru-RU")} — ${
                      r.date_to ? new Date(r.date_to).toLocaleDateString("ru-RU") : "бессрочно"
                    }`,
                  },
                  {
                    label: "Начислено",
                    value: (
                      <span className="text-[#D4AF37]">
                        {money(rentalTotal(r))} ({periodsCount(r)} {PERIOD_SHORT[r.rate_period]})
                      </span>
                    ),
                  },
                  ...(num(r.deposit) ? [{ label: "Залог", value: money(num(r.deposit)) }] : []),
                ]}
                actions={
                  <>
                    {r.status === "active" && (
                      <button
                        onClick={() => {
                          setReturnFor(r)
                          setReturnQty(String(num(r.qty) - num(r.returned_qty)))
                        }}
                        className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/5 text-xs text-white/70"
                      >
                        <Icon name="RotateCcw" size={15} />
                        Вернуть
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/cabinet/rentals/${r.id}/contract`)}
                      className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/5 text-xs text-white/70"
                    >
                      <Icon name="FileText" size={15} />
                      Договор
                    </button>
                    <button
                      onClick={() => openEdit(r)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/60"
                    >
                      <Icon name="Pencil" size={15} />
                    </button>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
                      <DeleteButton onConfirm={() => removeRental(r.id)} />
                    </div>
                  </>
                }
              />
            ))}
          </div>

          <div className={`hidden md:block ${card}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase text-white/40">
                    <th className="py-2 pr-4 text-left font-medium">Инструмент</th>
                    <th className="py-2 pr-4 text-left font-medium">Кто</th>
                    <th className="py-2 pr-4 text-left font-medium">Кол-во</th>
                    <th className="py-2 pr-4 text-left font-medium">Ставка</th>
                    <th className="py-2 pr-4 text-left font-medium">Срок</th>
                    <th className="py-2 pr-4 text-left font-medium">Начислено</th>
                    <th className="py-2 pr-4 text-left font-medium">Статус</th>
                    <th className="py-2 pr-4 text-left font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-white/5 last:border-0">
                      <td className="py-3 pr-4">
                        <p>{r.item_name}</p>
                        <p className="text-xs text-white/30">
                          {r.rental_number} · {r.direction === "out" ? "мы сдали" : "мы взяли"}
                        </p>
                      </td>
                      <td className="py-3 pr-4 text-white/60">
                        {r.counterparty_name || "—"}
                        {r.object_code && (
                          <p className="text-xs text-white/30">объект {r.object_code}</p>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-white/60">
                        {num(r.qty)} {r.unit}
                      </td>
                      <td className="py-3 pr-4 text-white/60">
                        {money(num(r.rate))}/{PERIOD_SHORT[r.rate_period]}
                      </td>
                      <td className="py-3 pr-4 text-white/60">
                        {new Date(r.date_from).toLocaleDateString("ru-RU")}
                        {" — "}
                        {r.date_to ? new Date(r.date_to).toLocaleDateString("ru-RU") : "бессрочно"}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-[#D4AF37]">{money(rentalTotal(r))}</span>
                        <p className="text-xs text-white/30">
                          {periodsCount(r)} {PERIOD_SHORT[r.rate_period]}
                        </p>
                      </td>
                      <td className="py-3 pr-4">{statusBadge(r)}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          {r.status === "active" && (
                            <button
                              onClick={() => {
                                setReturnFor(r)
                                setReturnQty(String(num(r.qty) - num(r.returned_qty)))
                              }}
                              className="text-white/40 transition-colors hover:text-[#D4AF37]"
                              title="Оформить возврат"
                            >
                              <Icon name="RotateCcw" size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/cabinet/rentals/${r.id}/contract`)}
                            className="text-white/40 transition-colors hover:text-white"
                            title="Договор аренды"
                          >
                            <Icon name="FileText" size={16} />
                          </button>
                          <button
                            onClick={() => openEdit(r)}
                            className="text-white/40 transition-colors hover:text-white"
                            title="Изменить"
                          >
                            <Icon name="Pencil" size={16} />
                          </button>
                          <DeleteButton onConfirm={() => removeRental(r.id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <Dialog open={rentalOpen} onOpenChange={setRentalOpen}>
        <DialogContent className="border-white/10 bg-[#1f1f1f] text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingRental ? "Изменить аренду" : "Оформить аренду"}</DialogTitle>
          </DialogHeader>

          <RentalForm
            value={form}
            onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
            stock={stock}
            counterparties={counterparties}
            objects={objects}
            onCreateCounterparty={openCpCreate}
            editing={!!editingRental}
          />

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400">
              <Icon name="CircleAlert" size={15} />
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button className={ghostBtn} onClick={() => setRentalOpen(false)}>
              Отмена
            </button>
            <button className={goldBtn} onClick={saveRental} disabled={saving}>
              {saving ? (
                <Icon name="Loader2" size={16} className="animate-spin" />
              ) : (
                <Icon name="Check" size={16} />
              )}
              Сохранить
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={cpOpen} onOpenChange={setCpOpen}>
        <DialogContent className="border-white/10 bg-[#1f1f1f] text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCp ? "Изменить контрагента" : "Новый контрагент"}</DialogTitle>
          </DialogHeader>

          <CounterpartyForm
            value={cpForm}
            onChange={(patch) => setCpForm((f) => ({ ...f, ...patch }))}
          />

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400">
              <Icon name="CircleAlert" size={15} />
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button className={ghostBtn} onClick={() => setCpOpen(false)}>
              Отмена
            </button>
            <button className={goldBtn} onClick={saveCp} disabled={saving}>
              {saving ? (
                <Icon name="Loader2" size={16} className="animate-spin" />
              ) : (
                <Icon name="Check" size={16} />
              )}
              Сохранить
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!returnFor} onOpenChange={(v) => !v && setReturnFor(null)}>
        <DialogContent className="border-white/10 bg-[#1f1f1f] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Возврат инструмента</DialogTitle>
          </DialogHeader>

          {returnFor && (
            <div className="space-y-4">
              <div className="rounded-lg border border-white/10 bg-[#161616] p-4 text-sm">
                <div className="font-medium">{returnFor.item_name}</div>
                <div className="mt-1 text-white/40">
                  Выдано {num(returnFor.qty)} {returnFor.unit}
                  {num(returnFor.returned_qty) > 0 &&
                    `, уже вернули ${num(returnFor.returned_qty)}`}
                </div>
                <div className="mt-2 text-[#D4AF37]">
                  К оплате: {money(rentalTotal(returnFor))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-white/50">Сколько возвращают</label>
                <input
                  className="w-full rounded-lg border border-white/10 bg-[#161616] px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={returnQty}
                  onChange={(e) => setReturnQty(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-white/50">
                  Состояние при возврате
                </label>
                <textarea
                  className="min-h-[70px] w-full resize-y rounded-lg border border-white/10 bg-[#161616] px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  placeholder="Исправен, без повреждений"
                />
              </div>

              {returnFor.warehouse_item_id && returnFor.direction === "out" && (
                <div className="text-xs text-white/40">
                  Количество вернётся на склад автоматически
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button className={ghostBtn} onClick={() => setReturnFor(null)}>
                  Отмена
                </button>
                <button className={goldBtn} onClick={doReturn} disabled={saving}>
                  {saving ? (
                    <Icon name="Loader2" size={16} className="animate-spin" />
                  ) : (
                    <Icon name="Check" size={16} />
                  )}
                  Оформить возврат
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </CrmLayout>
  )
}