import { useEffect, useMemo, useState } from "react"
import { CrmLayout } from "@/components/crm/CrmLayout"
import { WarehouseViewModal } from "@/components/crm/WarehouseViewModal"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Icon from "@/components/ui/icon"
import {
  warehouseApi,
  WarehouseRow,
  WarehouseItem,
  WarehouseObject,
} from "@/lib/api"

const money = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n || 0) + " ₽"

const num = (n: unknown) => Number(n || 0)

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("ru-RU") : "—"

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"

const goldBtn =
  "flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg disabled:opacity-40"

export default function Warehouse() {
  const [warehouses, setWarehouses] = useState<WarehouseRow[]>([])
  const [items, setItems] = useState<WarehouseItem[]>([])
  const [objects, setObjects] = useState<WarehouseObject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [whForm, setWhForm] = useState({ name: "", address: "", responsible: "", phone: "" })
  const [showWhForm, setShowWhForm] = useState(false)

  const [itemForm, setItemForm] = useState({
    name: "",
    kind: "материал",
    unit: "шт",
    qty: "",
    price: "",
    warehouse_id: "",
  })
  const [showItemForm, setShowItemForm] = useState(false)

  const [issueFor, setIssueFor] = useState<WarehouseItem | null>(null)
  const [issueObject, setIssueObject] = useState("")
  const [issueQty, setIssueQty] = useState("")

  const [editWh, setEditWh] = useState<WarehouseRow | null>(null)
  const [editForm, setEditForm] = useState({ name: "", address: "", responsible: "", phone: "" })

  const [globalSearch, setGlobalSearch] = useState("")

  const [viewWh, setViewWh] = useState<WarehouseRow | null>(null)

  const [addToWh, setAddToWh] = useState<WarehouseRow | null>(null)
  const [whItemForm, setWhItemForm] = useState({
    name: "",
    kind: "материал",
    unit: "шт",
    qty: "1",
    price: "",
  })

  const [editItem, setEditItem] = useState<WarehouseItem | null>(null)
  const [editItemForm, setEditItemForm] = useState({
    name: "",
    kind: "материал",
    unit: "шт",
    qty: "",
    price: "",
    warehouse_id: "",
  })

  const [restockFor, setRestockFor] = useState<WarehouseItem | null>(null)
  const [restockQty, setRestockQty] = useState("")
  const [restockPrice, setRestockPrice] = useState("")

  const [objectFilter, setObjectFilter] = useState("")

  const load = () => {
    setLoading(true)
    warehouseApi
      .list()
      .then((d) => {
        setWarehouses(d.warehouses || [])
        setItems(d.items || [])
        setObjects(d.objects || [])
      })
      .catch((e) => setError(e?.message || "Не удалось загрузить данные"))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const stockItems = useMemo(() => items.filter((i) => !i.object_id), [items])
  const issuedItems = useMemo(() => items.filter((i) => i.object_id), [items])

  const filteredIssued = useMemo(
    () =>
      objectFilter
        ? issuedItems.filter((i) => String(i.object_id) === objectFilter)
        : issuedItems,
    [issuedItems, objectFilter]
  )

  const searchResults = useMemo(() => {
    const q = globalSearch.trim().toLowerCase()
    if (!q) return []
    const whById = new Map(warehouses.map((w) => [w.id, w]))
    return items
      .map((item) => ({ item, wh: item.warehouse_id ? whById.get(item.warehouse_id) : undefined }))
      .filter(({ item, wh }) =>
        [item.name, item.kind, item.unit, wh?.name, wh?.responsible, wh?.phone, wh?.address]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      )
  }, [globalSearch, items, warehouses])

  const usedObjects = useMemo(() => {
    const ids = new Set(issuedItems.map((i) => i.object_id))
    return objects.filter((o) => ids.has(o.id))
  }, [issuedItems, objects])

  const run = async (fn: () => Promise<unknown>) => {
    setError("")
    try {
      await fn()
      load()
    } catch (e) {
      setError((e as Error)?.message || "Операция не выполнена")
    }
  }

  const addWarehouse = () =>
    run(async () => {
      await warehouseApi.createWarehouse(whForm)
      setWhForm({ name: "", address: "", responsible: "", phone: "" })
      setShowWhForm(false)
    })

  const addItem = () =>
    run(async () => {
      await warehouseApi.createItem({
        name: itemForm.name,
        kind: itemForm.kind,
        unit: itemForm.unit,
        qty: Number(itemForm.qty || 0),
        price: Number(itemForm.price || 0),
        warehouse_id: itemForm.warehouse_id ? Number(itemForm.warehouse_id) : null,
      })
      setItemForm({ name: "", kind: "материал", unit: "шт", qty: "", price: "", warehouse_id: "" })
      setShowItemForm(false)
    })

  const submitIssue = () =>
    run(async () => {
      if (!issueFor) return
      await warehouseApi.issue(issueFor.id, Number(issueObject), Number(issueQty || 0))
      setIssueFor(null)
      setIssueObject("")
      setIssueQty("")
    })

  const startEdit = (w: WarehouseRow) => {
    setAddToWh(null)
    setEditWh(w)
    setEditForm({
      name: w.name || "",
      address: w.address || "",
      responsible: w.responsible || "",
      phone: w.phone || "",
    })
  }

  const submitEdit = () =>
    run(async () => {
      if (!editWh) return
      await warehouseApi.updateWarehouse(editWh.id, editForm)
      setEditWh(null)
    })

  const submitWhItem = () =>
    run(async () => {
      if (!addToWh) return
      await warehouseApi.createItem({
        name: whItemForm.name,
        kind: whItemForm.kind,
        unit: whItemForm.unit,
        qty: Number(whItemForm.qty || 0),
        price: Number(whItemForm.price || 0),
        warehouse_id: addToWh.id,
      })
      setAddToWh(null)
      setWhItemForm({ name: "", kind: "материал", unit: "шт", qty: "1", price: "" })
    })

  const startEditItem = (i: WarehouseItem) => {
    setRestockFor(null)
    setIssueFor(null)
    setEditItem(i)
    setEditItemForm({
      name: i.name || "",
      kind: i.kind || "материал",
      unit: i.unit || "шт",
      qty: String(num(i.qty)),
      price: String(num(i.price)),
      warehouse_id: i.warehouse_id ? String(i.warehouse_id) : "",
    })
  }

  const submitEditItem = () =>
    run(async () => {
      if (!editItem) return
      await warehouseApi.updateItem(editItem.id, {
        name: editItemForm.name,
        kind: editItemForm.kind,
        unit: editItemForm.unit,
        qty: Number(editItemForm.qty || 0),
        price: Number(editItemForm.price || 0),
        warehouse_id: editItemForm.warehouse_id ? Number(editItemForm.warehouse_id) : null,
      })
      setEditItem(null)
    })

  const submitRestock = () =>
    run(async () => {
      if (!restockFor) return
      await warehouseApi.restock(
        restockFor.id,
        Number(restockQty || 0),
        restockPrice ? Number(restockPrice) : undefined
      )
      setRestockFor(null)
      setRestockQty("")
      setRestockPrice("")
    })

  const kindStyle: Record<string, { cls: string; icon: string }> = {
    инструмент: { cls: "bg-[#4A90D9]/15 text-[#7FB5E8]", icon: "Hammer" },
    оборудование: { cls: "bg-[#9B7BD4]/15 text-[#B49AE5]", icon: "Cog" },
    расходник: { cls: "bg-emerald-500/15 text-emerald-400", icon: "Layers" },
  }

  const kindBadge = (kind: string) => {
    const st = kindStyle[kind] || { cls: "bg-[#D4AF37]/15 text-[#D4AF37]", icon: "Package" }
    return (
      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs ${st.cls}`}>
        <Icon name={st.icon} size={12} />
        {kind}
      </span>
    )
  }

  return (
    <CrmLayout title="Склад учет" subtitle="Склады, движение материалов и выдача на объекты">
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Icon name="Loader2" size={24} className="animate-spin text-white/40" />
        </div>
      ) : (
        <Tabs defaultValue="stock">
          <TabsList className="bg-[#1f1f1f] border border-white/10 mb-6 flex-wrap h-auto">
            <TabsTrigger value="stock">Склад</TabsTrigger>
            <TabsTrigger value="ledger">Учет</TabsTrigger>
            <TabsTrigger value="objects">Объекты</TabsTrigger>
          </TabsList>

          <TabsContent value="stock">
            <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="relative min-w-[240px] flex-1">
                  <Icon
                    name="Search"
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <input
                    className={`${inputCls} pl-9`}
                    placeholder="Поиск по всем складам: материал, инструмент, ответственный, телефон"
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                  />
                  {globalSearch && (
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                      onClick={() => setGlobalSearch("")}
                    >
                      <Icon name="X" size={15} />
                    </button>
                  )}
                </div>
                <button className={goldBtn} onClick={() => setShowWhForm((v) => !v)}>
                  <Icon name={showWhForm ? "X" : "Plus"} size={16} />
                  {showWhForm ? "Отмена" : "Добавить склад"}
                </button>
              </div>

              {globalSearch.trim().length > 0 && (
                <div className="mb-5 rounded-lg border border-[#D4AF37]/30 bg-[#161616] p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm text-white/70">
                    <Icon name="Search" size={15} className="text-[#D4AF37]" />
                    Найдено: {searchResults.length}
                  </div>

                  {searchResults.length === 0 ? (
                    <div className="py-6 text-center text-sm text-white/30">
                      Ничего не найдено по запросу «{globalSearch}»
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {searchResults.map((r) => (
                        <div
                          key={r.item.id}
                          className="rounded-lg border border-white/10 bg-[#1f1f1f] p-3"
                        >
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="text-sm">{r.item.name}</span>
                            {kindBadge(r.item.kind)}
                            <span className="text-sm text-white/50">
                              {num(r.item.qty)} {r.item.unit}
                            </span>
                            {r.item.object_id && (
                              <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/60">
                                выдано на {r.item.object_code}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/50">
                            <span className="flex items-center gap-1.5">
                              <Icon name="Warehouse" size={13} className="text-[#D4AF37]" />
                              {r.wh?.name || "Склад не указан"}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Icon name="User" size={13} />
                              {r.wh?.responsible || "Ответственный не указан"}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Icon name="Phone" size={13} />
                              {r.wh?.phone ? (
                                <a href={`tel:${r.wh.phone}`} className="hover:text-[#D4AF37]">
                                  {r.wh.phone}
                                </a>
                              ) : (
                                "Телефон не указан"
                              )}
                            </span>
                            {r.wh?.address && (
                              <span className="flex items-center gap-1.5">
                                <Icon name="MapPin" size={13} />
                                {r.wh.address}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {showWhForm && (
                <div className="mb-5 grid gap-3 rounded-lg border border-white/10 bg-[#161616] p-4 md:grid-cols-4">
                  <input
                    className={inputCls}
                    placeholder="Название склада"
                    value={whForm.name}
                    onChange={(e) => setWhForm({ ...whForm, name: e.target.value })}
                  />
                  <input
                    className={inputCls}
                    placeholder="Адрес"
                    value={whForm.address}
                    onChange={(e) => setWhForm({ ...whForm, address: e.target.value })}
                  />
                  <input
                    className={inputCls}
                    placeholder="Ответственный"
                    value={whForm.responsible}
                    onChange={(e) => setWhForm({ ...whForm, responsible: e.target.value })}
                  />
                  <input
                    className={inputCls}
                    placeholder="Номер телефона"
                    type="tel"
                    value={whForm.phone}
                    onChange={(e) => setWhForm({ ...whForm, phone: e.target.value })}
                  />
                  <button className={goldBtn} onClick={addWarehouse} disabled={whForm.name.length < 2}>
                    <Icon name="Check" size={16} />
                    Сохранить
                  </button>
                </div>
              )}

              {warehouses.length === 0 ? (
                <div className="py-16 text-center text-sm text-white/30">
                  Складов пока нет — добавьте первый склад
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-xs uppercase text-white/40">
                        <th className="py-2 pr-4 text-left font-medium">Название</th>
                        <th className="py-2 pr-4 text-left font-medium">Адрес</th>
                        <th className="py-2 pr-4 text-left font-medium">Ответственный</th>
                        <th className="py-2 pr-4 text-left font-medium">Телефон</th>
                        <th className="py-2 pr-4 text-left font-medium">Позиций</th>
                        <th className="py-2 pr-4 text-left font-medium">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {warehouses.map((w) => (
                        <tr key={w.id} className="border-b border-white/5 last:border-0">
                          <td className="py-3 pr-4">{w.name}</td>
                          <td className="py-3 pr-4 text-white/60">{w.address || "—"}</td>
                          <td className="py-3 pr-4 text-white/60">{w.responsible || "—"}</td>
                          <td className="py-3 pr-4 text-white/60">{w.phone || "—"}</td>
                          <td className="py-3 pr-4">{w.positions}</td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-3">
                              <button
                                className="text-[#D4AF37] transition-colors hover:text-[#B8860B]"
                                title="Добавить позицию на этот склад"
                                onClick={() => {
                                  setEditWh(null)
                                  setAddToWh((prev) => (prev?.id === w.id ? null : w))
                                }}
                              >
                                <Icon name={addToWh?.id === w.id ? "X" : "Plus"} size={18} />
                              </button>
                              <button
                                className="text-white/60 transition-colors hover:text-white"
                                title="Просмотр содержимого склада"
                                onClick={() => setViewWh(w)}
                              >
                                <Icon name="Eye" size={17} />
                              </button>
                              <button
                                className="text-white/60 transition-colors hover:text-[#D4AF37]"
                                title="Редактировать склад"
                                onClick={() =>
                                  editWh?.id === w.id ? setEditWh(null) : startEdit(w)
                                }
                              >
                                <Icon name={editWh?.id === w.id ? "X" : "Pencil"} size={16} />
                              </button>
                              <button
                                className="text-white/40 transition-colors hover:text-red-400"
                                title="Удалить склад"
                                onClick={() => run(() => warehouseApi.removeWarehouse(w.id))}
                              >
                                <Icon name="Trash2" size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )).flatMap((row, idx) => {
                        const w = warehouses[idx]

                        if (editWh?.id === w.id) {
                          return [
                            row,
                            <tr key={`edit-${w.id}`} className="border-b border-white/5">
                              <td colSpan={6} className="py-3">
                                <div className="grid gap-3 rounded-lg border border-[#D4AF37]/30 bg-[#161616] p-4 md:grid-cols-3">
                                  <div className="text-sm text-white/70 md:col-span-3">
                                    Редактирование склада
                                  </div>
                                  <input
                                    className={inputCls}
                                    placeholder="Название склада"
                                    value={editForm.name}
                                    onChange={(e) =>
                                      setEditForm({ ...editForm, name: e.target.value })
                                    }
                                  />
                                  <input
                                    className={inputCls}
                                    placeholder="Адрес"
                                    value={editForm.address}
                                    onChange={(e) =>
                                      setEditForm({ ...editForm, address: e.target.value })
                                    }
                                  />
                                  <input
                                    className={inputCls}
                                    placeholder="Ответственный"
                                    value={editForm.responsible}
                                    onChange={(e) =>
                                      setEditForm({ ...editForm, responsible: e.target.value })
                                    }
                                  />
                                  <input
                                    className={inputCls}
                                    placeholder="Номер телефона"
                                    type="tel"
                                    value={editForm.phone}
                                    onChange={(e) =>
                                      setEditForm({ ...editForm, phone: e.target.value })
                                    }
                                  />
                                  <button
                                    className={goldBtn}
                                    onClick={submitEdit}
                                    disabled={editForm.name.trim().length < 2}
                                  >
                                    <Icon name="Check" size={16} />
                                    Сохранить
                                  </button>
                                  <button
                                    className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white/60 transition-colors hover:text-white"
                                    onClick={() => setEditWh(null)}
                                  >
                                    Отмена
                                  </button>
                                </div>
                              </td>
                            </tr>,
                          ]
                        }

                        if (addToWh?.id !== w.id) return [row]
                        return [
                          row,
                          <tr key={`form-${w.id}`} className="border-b border-white/5">
                            <td colSpan={6} className="py-3">
                              <div className="grid gap-3 rounded-lg border border-[#D4AF37]/30 bg-[#161616] p-4 md:grid-cols-3">
                                <div className="text-sm text-white/70 md:col-span-3">
                                  Добавить позицию на склад «{w.name}»
                                </div>
                                <input
                                  className={inputCls}
                                  placeholder="Название"
                                  value={whItemForm.name}
                                  onChange={(e) =>
                                    setWhItemForm({ ...whItemForm, name: e.target.value })
                                  }
                                />
                                <select
                                  className={inputCls}
                                  value={whItemForm.kind}
                                  onChange={(e) =>
                                    setWhItemForm({ ...whItemForm, kind: e.target.value })
                                  }
                                >
                                  <option value="материал">Материал</option>
                                  <option value="инструмент">Инструмент</option>
                                  <option value="оборудование">Оборудование</option>
                                  <option value="расходник">Расходник</option>
                                </select>
                                <select
                                  className={inputCls}
                                  value={whItemForm.unit}
                                  onChange={(e) =>
                                    setWhItemForm({ ...whItemForm, unit: e.target.value })
                                  }
                                >
                                  {["шт", "м²", "м", "м³", "кг", "т", "л", "уп", "рул", "меш", "компл"].map(
                                    (u) => (
                                      <option key={u} value={u}>
                                        {u}
                                      </option>
                                    )
                                  )}
                                </select>
                                <input
                                  className={inputCls}
                                  type="number"
                                  min="0"
                                  placeholder="Количество"
                                  value={whItemForm.qty}
                                  onChange={(e) =>
                                    setWhItemForm({ ...whItemForm, qty: e.target.value })
                                  }
                                />
                                <input
                                  className={inputCls}
                                  type="number"
                                  min="0"
                                  placeholder="Цена за единицу"
                                  value={whItemForm.price}
                                  onChange={(e) =>
                                    setWhItemForm({ ...whItemForm, price: e.target.value })
                                  }
                                />
                                <button
                                  className={goldBtn}
                                  onClick={submitWhItem}
                                  disabled={whItemForm.name.trim().length < 2}
                                >
                                  <Icon name="Check" size={16} />
                                  Добавить
                                </button>
                              </div>
                            </td>
                          </tr>,
                        ]
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ledger">
            <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
              <div className="mb-4 flex justify-end">
                <button className={goldBtn} onClick={() => setShowItemForm((v) => !v)}>
                  <Icon name={showItemForm ? "X" : "Plus"} size={16} />
                  {showItemForm ? "Отмена" : "Добавить позицию"}
                </button>
              </div>

              {showItemForm && (
                <div className="mb-5 grid gap-3 rounded-lg border border-white/10 bg-[#161616] p-4 md:grid-cols-4">
                  <input
                    className={inputCls}
                    placeholder="Название"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  />
                  <select
                    className={inputCls}
                    value={itemForm.kind}
                    onChange={(e) => setItemForm({ ...itemForm, kind: e.target.value })}
                  >
                    <option value="материал">Материал</option>
                    <option value="инструмент">Инструмент</option>
                    <option value="оборудование">Оборудование</option>
                    <option value="расходник">Расходник</option>
                  </select>
                  <select
                    className={inputCls}
                    value={itemForm.warehouse_id}
                    onChange={(e) => setItemForm({ ...itemForm, warehouse_id: e.target.value })}
                  >
                    <option value="">Склад не выбран</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                  <input
                    className={inputCls}
                    placeholder="Ед. изм."
                    value={itemForm.unit}
                    onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                  />
                  <input
                    className={inputCls}
                    placeholder="Количество"
                    type="number"
                    value={itemForm.qty}
                    onChange={(e) => setItemForm({ ...itemForm, qty: e.target.value })}
                  />
                  <input
                    className={inputCls}
                    placeholder="Цена"
                    type="number"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                  />
                  <button className={goldBtn} onClick={addItem} disabled={itemForm.name.length < 2}>
                    <Icon name="Check" size={16} />
                    Сохранить
                  </button>
                </div>
              )}

              {editItem && (
                <div className="mb-5 grid gap-3 rounded-lg border border-[#D4AF37]/30 bg-[#161616] p-4 md:grid-cols-3">
                  <div className="text-sm text-white/70 md:col-span-3">
                    Редактирование позиции «{editItem.name}»
                  </div>
                  <input
                    className={inputCls}
                    placeholder="Название"
                    value={editItemForm.name}
                    onChange={(e) => setEditItemForm({ ...editItemForm, name: e.target.value })}
                  />
                  <select
                    className={inputCls}
                    value={editItemForm.kind}
                    onChange={(e) => setEditItemForm({ ...editItemForm, kind: e.target.value })}
                  >
                    <option value="материал">Материал</option>
                    <option value="инструмент">Инструмент</option>
                    <option value="оборудование">Оборудование</option>
                    <option value="расходник">Расходник</option>
                  </select>
                  <select
                    className={inputCls}
                    value={editItemForm.warehouse_id}
                    onChange={(e) =>
                      setEditItemForm({ ...editItemForm, warehouse_id: e.target.value })
                    }
                  >
                    <option value="">Склад не выбран</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className={inputCls}
                    value={editItemForm.unit}
                    onChange={(e) => setEditItemForm({ ...editItemForm, unit: e.target.value })}
                  >
                    {["шт", "м²", "м", "м³", "кг", "т", "л", "уп", "рул", "меш", "компл"].map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  <input
                    className={inputCls}
                    type="number"
                    min="0"
                    placeholder="Количество"
                    value={editItemForm.qty}
                    onChange={(e) => setEditItemForm({ ...editItemForm, qty: e.target.value })}
                  />
                  <input
                    className={inputCls}
                    type="number"
                    min="0"
                    placeholder="Цена за единицу"
                    value={editItemForm.price}
                    onChange={(e) => setEditItemForm({ ...editItemForm, price: e.target.value })}
                  />
                  <button
                    className={goldBtn}
                    onClick={submitEditItem}
                    disabled={editItemForm.name.trim().length < 2}
                  >
                    <Icon name="Check" size={16} />
                    Сохранить
                  </button>
                  <button
                    className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white/60 transition-colors hover:text-white"
                    onClick={() => setEditItem(null)}
                  >
                    Отмена
                  </button>
                </div>
              )}

              {restockFor && (
                <div className="mb-5 grid gap-3 rounded-lg border border-emerald-500/30 bg-[#161616] p-4 md:grid-cols-4">
                  <div className="flex items-center text-sm text-white/70 md:col-span-4">
                    Приход «{restockFor.name}» — сейчас на складе {num(restockFor.qty)} {restockFor.unit}
                  </div>
                  <input
                    className={inputCls}
                    placeholder="Сколько поступило"
                    type="number"
                    value={restockQty}
                    onChange={(e) => setRestockQty(e.target.value)}
                  />
                  <input
                    className={inputCls}
                    placeholder="Новая цена (необязательно)"
                    type="number"
                    value={restockPrice}
                    onChange={(e) => setRestockPrice(e.target.value)}
                  />
                  <button
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm text-white transition-colors hover:bg-emerald-700 disabled:opacity-40"
                    onClick={submitRestock}
                    disabled={Number(restockQty) <= 0}
                  >
                    <Icon name="PackagePlus" size={16} />
                    Оприходовать
                  </button>
                  <button
                    className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white/60 transition-colors hover:text-white"
                    onClick={() => setRestockFor(null)}
                  >
                    Отмена
                  </button>
                </div>
              )}

              {issueFor && (
                <div className="mb-5 grid gap-3 rounded-lg border border-[#D4AF37]/30 bg-[#161616] p-4 md:grid-cols-4">
                  <div className="flex items-center text-sm text-white/70 md:col-span-4">
                    Выдать «{issueFor.name}» — на складе {num(issueFor.qty)} {issueFor.unit}
                  </div>
                  <select
                    className={inputCls}
                    value={issueObject}
                    onChange={(e) => setIssueObject(e.target.value)}
                  >
                    <option value="">Выберите объект</option>
                    {objects.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.object_code} — {o.client_name}
                      </option>
                    ))}
                  </select>
                  <input
                    className={inputCls}
                    placeholder="Количество"
                    type="number"
                    value={issueQty}
                    onChange={(e) => setIssueQty(e.target.value)}
                  />
                  <button
                    className={goldBtn}
                    onClick={submitIssue}
                    disabled={!issueObject || Number(issueQty) <= 0}
                  >
                    <Icon name="Send" size={16} />
                    Выдать
                  </button>
                  <button
                    className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white/60 transition-colors hover:text-white"
                    onClick={() => setIssueFor(null)}
                  >
                    Отмена
                  </button>
                </div>
              )}

              {stockItems.length === 0 ? (
                <div className="py-16 text-center text-sm text-white/30">
                  Позиций пока нет — добавьте материал или инструмент
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-xs uppercase text-white/40">
                        <th className="py-2 pr-4 text-left font-medium">Название</th>
                        <th className="py-2 pr-4 text-left font-medium">Тип</th>
                        <th className="py-2 pr-4 text-left font-medium">Склад</th>
                        <th className="py-2 pr-4 text-left font-medium">Кол-во</th>
                        <th className="py-2 pr-4 text-left font-medium">Ед. изм.</th>
                        <th className="py-2 pr-4 text-left font-medium">Цена</th>
                        <th className="py-2 pr-4 text-left font-medium">Сумма</th>
                        <th className="py-2 pr-4 text-left font-medium">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockItems.map((i) => (
                        <tr key={i.id} className="border-b border-white/5 last:border-0">
                          <td className="py-3 pr-4">{i.name}</td>
                          <td className="py-3 pr-4">{kindBadge(i.kind)}</td>
                          <td className="py-3 pr-4 text-white/60">{i.warehouse_name || "—"}</td>
                          <td className="py-3 pr-4">{num(i.qty)}</td>
                          <td className="py-3 pr-4 text-white/60">{i.unit}</td>
                          <td className="py-3 pr-4">{money(num(i.price))}</td>
                          <td className="py-3 pr-4">{money(num(i.qty) * num(i.price))}</td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-3">
                              <button
                                className="text-emerald-400 transition-colors hover:text-emerald-300"
                                title="Приход на склад"
                                onClick={() => {
                                  setEditItem(null)
                                  setRestockFor(i)
                                  setRestockQty("")
                                  setRestockPrice("")
                                }}
                              >
                                <Icon name="PackagePlus" size={16} />
                              </button>
                              <button
                                className="text-[#D4AF37] transition-colors hover:text-[#B8860B] disabled:opacity-30"
                                title="Выдать на объект"
                                disabled={num(i.qty) <= 0}
                                onClick={() => {
                                  setEditItem(null)
                                  setIssueFor(i)
                                  setIssueQty(String(num(i.qty)))
                                }}
                              >
                                <Icon name="Send" size={16} />
                              </button>
                              <button
                                className="text-white/60 transition-colors hover:text-[#D4AF37]"
                                title="Редактировать позицию"
                                onClick={() =>
                                  editItem?.id === i.id ? setEditItem(null) : startEditItem(i)
                                }
                              >
                                <Icon name={editItem?.id === i.id ? "X" : "Pencil"} size={16} />
                              </button>
                              <button
                                className="text-white/40 transition-colors hover:text-red-400"
                                title="Удалить"
                                onClick={() => run(() => warehouseApi.removeItem(i.id))}
                              >
                                <Icon name="Trash2" size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="objects">
            <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <select
                  className={`${inputCls} max-w-xs`}
                  value={objectFilter}
                  onChange={(e) => setObjectFilter(e.target.value)}
                >
                  <option value="">Все объекты</option>
                  {usedObjects.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.object_code} — {o.client_name}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-white/40">
                  Показаны только позиции, выданные со склада
                </span>
                <span className="ml-auto rounded-lg border border-white/10 px-3 py-2 text-sm">
                  <span className="text-white/40">Израсходовано на сумму:</span>{" "}
                  <span className="text-[#D4AF37]">
                    {money(
                      filteredIssued.reduce((s, i) => s + num(i.used_qty) * num(i.price), 0)
                    )}
                  </span>
                </span>
              </div>

              {filteredIssued.length === 0 ? (
                <div className="py-16 text-center text-sm text-white/30">
                  На объекты пока ничего не выдано — выдайте позицию на вкладке «Учет»
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-xs uppercase text-white/40">
                        <th className="py-2 pr-4 text-left font-medium">Объект</th>
                        <th className="py-2 pr-4 text-left font-medium">Адрес</th>
                        <th className="py-2 pr-4 text-left font-medium">Позиция</th>
                        <th className="py-2 pr-4 text-left font-medium">Тип</th>
                        <th className="py-2 pr-4 text-left font-medium">Выдано</th>
                        <th className="py-2 pr-4 text-left font-medium">Израсходовано</th>
                        <th className="py-2 pr-4 text-left font-medium">Остаток</th>
                        <th className="py-2 pr-4 text-left font-medium">Дата выдачи</th>
                        <th className="py-2 pr-4 text-left font-medium">Затраты</th>
                        <th className="py-2 pr-4 text-left font-medium">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIssued.map((i) => (
                        <tr key={i.id} className="border-b border-white/5 last:border-0">
                          <td className="py-3 pr-4">
                            <div>{i.object_code}</div>
                            <div className="text-xs text-white/40">{i.object_client}</div>
                          </td>
                          <td className="py-3 pr-4 text-white/60">{i.object_address || "—"}</td>
                          <td className="py-3 pr-4">{i.name}</td>
                          <td className="py-3 pr-4">{kindBadge(i.kind)}</td>
                          <td className="py-3 pr-4">
                            {num(i.issued_qty)} {i.unit}
                          </td>
                          <td className="py-3 pr-4 text-emerald-400">
                            {num(i.used_qty)} {i.unit}
                          </td>
                          <td className="py-3 pr-4">
                            {num(i.issued_qty) - num(i.used_qty)} {i.unit}
                          </td>
                          <td className="py-3 pr-4 text-white/60">{fmtDate(i.issued_at)}</td>
                          <td className="py-3 pr-4">{money(num(i.used_qty) * num(i.price))}</td>
                          <td className="py-3 pr-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 px-3 py-1.5 text-xs text-emerald-400 transition-colors hover:bg-emerald-500/10 disabled:opacity-30"
                                disabled={num(i.issued_qty) - num(i.used_qty) <= 0}
                                onClick={() => {
                                  const rest = num(i.issued_qty) - num(i.used_qty)
                                  const val = window.prompt(
                                    `Сколько израсходовано? Доступно ${rest} ${i.unit}`,
                                    String(rest)
                                  )
                                  if (val === null) return
                                  const q = Number(val)
                                  if (q > 0) run(() => warehouseApi.consume(i.id, q))
                                }}
                              >
                                <Icon name="CheckCheck" size={14} />
                                Списать
                              </button>
                              <button
                                className="flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/40 px-3 py-1.5 text-xs text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/10 disabled:opacity-30"
                                disabled={num(i.issued_qty) - num(i.used_qty) <= 0}
                                onClick={() => run(() => warehouseApi.returnToStock(i.id))}
                              >
                                <Icon name="Undo2" size={14} />
                                Вернуть на склад
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      <WarehouseViewModal
        warehouse={viewWh}
        items={items}
        open={!!viewWh}
        onOpenChange={(o) => !o && setViewWh(null)}
      />
    </CrmLayout>
  )
}