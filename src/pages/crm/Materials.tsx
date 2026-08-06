import { useEffect, useMemo, useState } from "react"
import { CrmLayout } from "@/components/crm/CrmLayout"
import { useAuth } from "@/contexts/AuthContext"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Icon from "@/components/ui/icon"
import { printMaterials } from "@/lib/printMaterials"
import {
  materialsApi,
  MaterialItem,
  MaterialObject,
  MaterialRoom,
  ObjectMaterial,
} from "@/lib/api"
import { MaterialsObjectsTab } from "@/components/crm/materials/MaterialsObjectsTab"
import { MaterialsCatalogTab } from "@/components/crm/materials/MaterialsCatalogTab"
import { MaterialEditModal } from "@/components/crm/materials/MaterialEditModal"
import { num } from "@/components/crm/materials/constants"

export default function Materials() {
  const { user } = useAuth()
  const companyName = user?.company_name || ""
  const [materials, setMaterials] = useState<MaterialItem[]>([])
  const [objects, setObjects] = useState<MaterialObject[]>([])
  const [objMaterials, setObjMaterials] = useState<ObjectMaterial[]>([])
  const [rooms, setRooms] = useState<MaterialRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [search, setSearch] = useState("")
  const [shopFilter, setShopFilter] = useState("")

  const [selectedObject, setSelectedObject] = useState<number | null>(null)
  const [showCalc, setShowCalc] = useState(false)
  const [editRow, setEditRow] = useState<ObjectMaterial | null>(null)
  const [savingEstimate, setSavingEstimate] = useState(false)
  const [savedMsg, setSavedMsg] = useState("")
  const [editForm, setEditForm] = useState({
    material_id: "",
    name: "",
    unit: "",
    qty: "",
    price: "",
    shop_name: "",
    room_id: "",
    work_type: "",
    note: "",
  })

  const load = () => {
    setLoading(true)
    materialsApi
      .list()
      .then((d) => {
        setMaterials(d.materials || [])
        const list = d.objects || []
        setObjects(list)
        setSelectedObject((prev) =>
          prev && list.some((o) => o.id === prev) ? prev : list[0]?.id ?? null
        )
        setObjMaterials(d.object_materials || [])
        setRooms(d.rooms || [])
      })
      .catch((e) => setError(e?.message || "Не удалось загрузить данные"))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const run = async (fn: () => Promise<unknown>) => {
    setError("")
    try {
      await fn()
      load()
    } catch (e) {
      setError((e as Error)?.message || "Операция не выполнена")
    }
  }

  const shops = useMemo(
    () => Array.from(new Set(materials.map((m) => m.shop_name).filter(Boolean))).sort(),
    [materials]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return materials.filter(
      (m) =>
        (!shopFilter || m.shop_name === shopFilter) &&
        (!q ||
          [m.name, m.category, m.shop_name, m.shop_address]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q)))
    )
  }, [materials, search, shopFilter])

  const materialsOf = (objectId: number) =>
    objMaterials.filter((m) => m.object_id === objectId)

  const sumOf = (objectId: number) =>
    materialsOf(objectId).reduce((s, m) => s + num(m.qty) * num(m.price), 0)

  const activeObject = objects.find((o) => o.id === selectedObject) || null

  const groupedByRoom = (objectId: number) => {
    const list = materialsOf(objectId)
    const map = new Map<string, { key: string; title: string; items: ObjectMaterial[]; sum: number }>()
    list.forEach((m) => {
      const key = m.room_id ? `room-${m.room_id}` : "other"
      const title = m.room_name || (m.room_id ? "Помещение" : "Без помещения")
      if (!map.has(key)) map.set(key, { key, title, items: [], sum: 0 })
      const group = map.get(key)!
      group.items.push(m)
      group.sum += num(m.qty) * num(m.price)
    })
    return Array.from(map.values())
  }

  const saveEstimate = () =>
    run(async () => {
      if (!activeObject) return
      setSavingEstimate(true)
      try {
        await materialsApi.createEstimate({
          object_id: activeObject.id,
          title: "Смета на материал",
          items: materialsOf(activeObject.id),
        })
        setSavedMsg("Смета на материал сохранена — она появилась в разделе «Документы»")
        setTimeout(() => setSavedMsg(""), 5000)
      } finally {
        setSavingEstimate(false)
      }
    })

  const openEdit = (m: ObjectMaterial) => {
    setEditRow(m)
    setEditForm({
      material_id: m.material_id ? String(m.material_id) : "",
      name: m.name || "",
      unit: m.unit || "шт",
      qty: String(num(m.qty)),
      price: String(num(m.price)),
      shop_name: m.shop_name || "",
      room_id: m.room_id ? String(m.room_id) : "",
      work_type: m.work_type || "",
      note: m.note || "",
    })
  }

  const pickMaterial = (id: string) => {
    const ref = materials.find((x) => String(x.id) === id)
    setEditForm((f) => ({
      ...f,
      material_id: id,
      name: ref ? ref.name : f.name,
      unit: ref ? ref.unit : f.unit,
      price: ref ? String(num(ref.price)) : f.price,
      shop_name: ref ? ref.shop_name : f.shop_name,
    }))
  }

  const saveEdit = (thenPrint = false) =>
    run(async () => {
      if (!editRow || !activeObject) return
      const room = rooms.find((r) => String(r.id) === editForm.room_id)
      const updated: ObjectMaterial = {
        ...editRow,
        material_id: editForm.material_id ? Number(editForm.material_id) : null,
        name: editForm.name,
        unit: editForm.unit,
        qty: Number(editForm.qty || 0),
        price: Number(editForm.price || 0),
        shop_name: editForm.shop_name,
        room_id: room ? room.id : null,
        room_name: room ? room.name : "",
        work_type: editForm.work_type,
        note: editForm.note,
      }
      await materialsApi.updateObjectMaterial(editRow.id, {
        material_id: updated.material_id,
        name: updated.name,
        unit: updated.unit,
        qty: updated.qty,
        price: updated.price,
        shop_name: updated.shop_name,
        room_id: updated.room_id,
        room_name: updated.room_name,
        work_type: updated.work_type,
        note: updated.note,
      })
      setEditRow(null)
      if (thenPrint) printMaterials(activeObject, [updated], materials, companyName, true)
    })

  const addFromCalc = async (payload: {
    material_id: number
    qty: number
    note: string
    room_id: number | null
    room_name: string
    work_type: string
    merge: boolean
  }) => {
    if (!selectedObject) return
    await materialsApi.addToObject({ object_id: selectedObject, ...payload })
    load()
  }

  return (
    <CrmLayout title="Материалы" subtitle="Справочник материалов и закупки по объектам">
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {savedMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <Icon name="CircleCheck" size={16} />
          {savedMsg}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Icon name="Loader2" size={24} className="animate-spin text-white/40" />
        </div>
      ) : (
        <Tabs defaultValue="objects">
          <TabsList className="mb-6 h-auto flex-wrap border border-white/10 bg-[#1f1f1f]">
            <TabsTrigger value="objects">Объекты</TabsTrigger>
            <TabsTrigger value="catalog">Справочник</TabsTrigger>
          </TabsList>

          <TabsContent value="objects">
            <MaterialsObjectsTab
              objects={objects}
              materials={materials}
              rooms={rooms}
              companyName={companyName}
              selectedObject={selectedObject}
              setSelectedObject={setSelectedObject}
              activeObject={activeObject}
              showCalc={showCalc}
              setShowCalc={setShowCalc}
              savingEstimate={savingEstimate}
              saveEstimate={saveEstimate}
              materialsOf={materialsOf}
              sumOf={sumOf}
              groupedByRoom={groupedByRoom}
              addFromCalc={addFromCalc}
              openEdit={openEdit}
              run={run}
            />
          </TabsContent>

          <TabsContent value="catalog">
            <MaterialsCatalogTab
              materials={materials}
              filtered={filtered}
              shops={shops}
              search={search}
              setSearch={setSearch}
              shopFilter={shopFilter}
              setShopFilter={setShopFilter}
              run={run}
            />
          </TabsContent>
        </Tabs>
      )}

      {editRow && (
        <MaterialEditModal
          editRow={editRow}
          setEditRow={setEditRow}
          editForm={editForm}
          setEditForm={setEditForm}
          activeObject={activeObject}
          materials={materials}
          rooms={rooms}
          pickMaterial={pickMaterial}
          saveEdit={saveEdit}
        />
      )}
    </CrmLayout>
  )
}
