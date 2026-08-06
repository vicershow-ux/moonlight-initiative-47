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
  WarehouseLogRow,
} from "@/lib/api"
import { WarehouseStockTab } from "@/components/crm/warehouse/WarehouseStockTab"
import { WarehouseLedgerTab } from "@/components/crm/warehouse/WarehouseLedgerTab"
import { WarehouseObjectsTab, WarehouseHistoryTab } from "@/components/crm/warehouse/WarehouseObjectsTab"
import { num } from "@/components/crm/warehouse/constants"

export default function Warehouse() {
  const [warehouses, setWarehouses] = useState<WarehouseRow[]>([])
  const [items, setItems] = useState<WarehouseItem[]>([])
  const [objects, setObjects] = useState<WarehouseObject[]>([])
  const [logRows, setLogRows] = useState<WarehouseLogRow[]>([])
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

  const [logSearch, setLogSearch] = useState("")
  const [logAction, setLogAction] = useState("")

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
        setLogRows(d.log || [])
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

  const logActions = useMemo(
    () => Array.from(new Set(logRows.map((l) => l.action))).sort(),
    [logRows]
  )

  const filteredLog = useMemo(() => {
    const q = logSearch.trim().toLowerCase()
    return logRows.filter(
      (l) =>
        (!logAction || l.action === logAction) &&
        (!q ||
          [l.item_name, l.warehouse_name, l.object_code, l.user_name, l.action]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q)))
    )
  }, [logRows, logSearch, logAction])

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
            <TabsTrigger value="history">История</TabsTrigger>
          </TabsList>

          <TabsContent value="stock">
            <WarehouseStockTab
              warehouses={warehouses}
              whForm={whForm}
              setWhForm={setWhForm}
              showWhForm={showWhForm}
              setShowWhForm={setShowWhForm}
              addWarehouse={addWarehouse}
              addToWh={addToWh}
              setAddToWh={setAddToWh}
              whItemForm={whItemForm}
              setWhItemForm={setWhItemForm}
              submitWhItem={submitWhItem}
              editWh={editWh}
              setEditWh={setEditWh}
              editForm={editForm}
              setEditForm={setEditForm}
              startEdit={startEdit}
              submitEdit={submitEdit}
              setViewWh={setViewWh}
              run={run}
            />
          </TabsContent>

          <TabsContent value="ledger">
            <WarehouseLedgerTab
              warehouses={warehouses}
              objects={objects}
              stockItems={stockItems}
              searchResults={searchResults}
              globalSearch={globalSearch}
              setGlobalSearch={setGlobalSearch}
              itemForm={itemForm}
              setItemForm={setItemForm}
              showItemForm={showItemForm}
              setShowItemForm={setShowItemForm}
              addItem={addItem}
              editItem={editItem}
              setEditItem={setEditItem}
              editItemForm={editItemForm}
              setEditItemForm={setEditItemForm}
              startEditItem={startEditItem}
              submitEditItem={submitEditItem}
              restockFor={restockFor}
              setRestockFor={setRestockFor}
              restockQty={restockQty}
              setRestockQty={setRestockQty}
              restockPrice={restockPrice}
              setRestockPrice={setRestockPrice}
              submitRestock={submitRestock}
              issueFor={issueFor}
              setIssueFor={setIssueFor}
              issueObject={issueObject}
              setIssueObject={setIssueObject}
              issueQty={issueQty}
              setIssueQty={setIssueQty}
              submitIssue={submitIssue}
              run={run}
            />
          </TabsContent>

          <TabsContent value="objects">
            <WarehouseObjectsTab
              usedObjects={usedObjects}
              filteredIssued={filteredIssued}
              objectFilter={objectFilter}
              setObjectFilter={setObjectFilter}
              run={run}
            />
          </TabsContent>
          <TabsContent value="history">
            <WarehouseHistoryTab
              logRows={logRows}
              filteredLog={filteredLog}
              logActions={logActions}
              logSearch={logSearch}
              setLogSearch={setLogSearch}
              logAction={logAction}
              setLogAction={setLogAction}
            />
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
