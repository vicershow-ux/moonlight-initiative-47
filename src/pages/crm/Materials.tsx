import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Icon from "@/components/ui/icon"
import { RoomCalculator } from "@/components/crm/RoomCalculator"
import { exportMaterialsToExcel } from "@/lib/exportMaterials"
import {
  materialsApi,
  MaterialItem,
  MaterialObject,
  MaterialRoom,
  ObjectMaterial,
} from "@/lib/api"

const money = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(n || 0) + " ₽"

const num = (n: unknown) => Number(n || 0)

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"

const goldBtn =
  "flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg disabled:opacity-40"

export default function Materials() {
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
            <div className="rounded-xl border border-white/10 bg-[#1f1f1f] p-5">
              {objects.length === 0 ? (
                <div className="py-16 text-center text-sm text-white/30">
                  Объектов пока нет —{" "}
                  <Link to="/cabinet/objects" className="text-[#D4AF37] hover:underline">
                    создать объект
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-5 flex flex-wrap items-end gap-3">
                    <div className="min-w-[280px] flex-1">
                      <label className="mb-1.5 block text-xs text-white/50">Объект</label>
                      <select
                        className={inputCls}
                        value={selectedObject ?? ""}
                        onChange={(e) => {
                          setSelectedObject(e.target.value ? Number(e.target.value) : null)
                          setShowCalc(false)
                        }}
                      >
                        <option value="">Выберите объект</option>
                        {objects.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.object_code} — {o.client_name}
                            {o.address ? ` · ${o.address}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {activeObject && (
                      <>
                        <button className={goldBtn} onClick={() => setShowCalc(!showCalc)}>
                          <Icon name={showCalc ? "X" : "Calculator"} size={16} />
                          {showCalc ? "Свернуть" : "Рассчитать помещение"}
                        </button>
                        <button
                          className="flex items-center gap-2 rounded-lg border border-[#D4AF37]/40 px-4 py-2.5 text-sm text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/10 disabled:opacity-40"
                          disabled={materialsOf(activeObject.id).length === 0}
                          onClick={() =>
                            exportMaterialsToExcel(
                              activeObject,
                              materialsOf(activeObject.id),
                              materials
                            )
                          }
                        >
                          <Icon name="FileSpreadsheet" size={16} />
                          Выгрузить в Excel
                        </button>
                      </>
                    )}
                  </div>

                  {!activeObject ? (
                    <div className="py-16 text-center text-sm text-white/30">
                      Выберите объект, чтобы увидеть его расчёты и материалы
                    </div>
                  ) : (
                    <>
                      {showCalc && (
                        <div className="mb-5 rounded-lg border border-[#D4AF37]/30 bg-[#161616] p-4">
                          <RoomCalculator
                            objectId={activeObject.id}
                            materials={materials}
                            rooms={rooms}
                            existing={materialsOf(activeObject.id)}
                            onAdd={addFromCalc}
                            onCancel={() => setShowCalc(false)}
                          />
                        </div>
                      )}

                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#161616] px-4 py-3 text-sm">
                        <div className="text-white/60">
                          {activeObject.object_code} — {activeObject.client_name}
                          <span className="ml-2 text-white/30">
                            {materialsOf(activeObject.id).length} позиций
                          </span>
                        </div>
                        <div className="text-[#D4AF37]">
                          Итого: {money(sumOf(activeObject.id))}
                        </div>
                      </div>

                      {materialsOf(activeObject.id).length === 0 ? (
                        <div className="py-14 text-center text-sm text-white/30">
                          Для этого объекта расчётов ещё нет — нажмите «Рассчитать помещение»
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {groupedByRoom(activeObject.id).map((group) => (
                            <div
                              key={group.key}
                              className="rounded-lg border border-white/10 bg-[#161616]"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                                <div className="flex items-center gap-2 text-sm">
                                  <Icon name="DoorOpen" size={15} className="text-[#D4AF37]" />
                                  {group.title}
                                </div>
                                <div className="text-sm text-[#D4AF37]">{money(group.sum)}</div>
                              </div>
                              <div className="overflow-x-auto p-4">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-white/10 text-xs uppercase text-white/40">
                                      <th className="py-2 pr-4 text-left font-medium">Материал</th>
                                      <th className="py-2 pr-4 text-left font-medium">Вид работ</th>
                                      <th className="py-2 pr-4 text-left font-medium">Кол-во</th>
                                      <th className="py-2 pr-4 text-left font-medium">Цена</th>
                                      <th className="py-2 pr-4 text-left font-medium">Сумма</th>
                                      <th className="py-2 pr-4 text-left font-medium">Магазин</th>
                                      <th className="py-2 pr-4 text-left font-medium">Действия</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {group.items.map((m) => (
                                      <tr
                                        key={m.id}
                                        className="border-b border-white/5 last:border-0"
                                      >
                                        <td className="py-2.5 pr-4">
                                          {m.name}
                                          {m.note && (
                                            <div className="text-xs text-white/30">{m.note}</div>
                                          )}
                                        </td>
                                        <td className="py-2.5 pr-4 text-white/60">
                                          {m.work_type || "—"}
                                        </td>
                                        <td className="whitespace-nowrap py-2.5 pr-4">
                                          {num(m.qty)} {m.unit}
                                        </td>
                                        <td className="py-2.5 pr-4 text-white/60">
                                          {money(num(m.price))}
                                        </td>
                                        <td className="whitespace-nowrap py-2.5 pr-4 text-[#D4AF37]">
                                          {money(num(m.qty) * num(m.price))}
                                        </td>
                                        <td className="py-2.5 pr-4 text-white/60">
                                          {m.shop_name || "—"}
                                        </td>
                                        <td className="py-2.5 pr-4">
                                          <button
                                            className="text-white/40 transition-colors hover:text-red-400"
                                            title="Убрать с объекта"
                                            onClick={() =>
                                              run(() => materialsApi.removeFromObject(m.id))
                                            }
                                          >
                                            <Icon name="Trash2" size={16} />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="catalog">
            <div className="rounded-xl border border-white/10 bg-[#1f1f1f] p-5">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="relative min-w-[220px] flex-1">
                  <Icon
                    name="Search"
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <input
                    className={`${inputCls} pl-9`}
                    placeholder="Поиск: материал, категория, магазин, адрес"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select
                  className={`${inputCls} max-w-[200px]`}
                  value={shopFilter}
                  onChange={(e) => setShopFilter(e.target.value)}
                >
                  <option value="">Все магазины</option>
                  {shops.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <Link to="/cabinet/materials/new" className={goldBtn}>
                  <Icon name="Plus" size={16} />
                  Добавить материал
                </Link>
              </div>

              {filtered.length === 0 ? (
                <div className="py-16 text-center text-sm text-white/30">
                  {materials.length === 0
                    ? "Справочник пуст — добавьте первый материал"
                    : "Ничего не найдено по заданным условиям"}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-xs uppercase text-white/40">
                        <th className="py-2 pr-4 text-left font-medium">Материал</th>
                        <th className="py-2 pr-4 text-left font-medium">Категория</th>
                        <th className="py-2 pr-4 text-left font-medium">Ед. изм.</th>
                        <th className="py-2 pr-4 text-left font-medium">Цена</th>
                        <th className="py-2 pr-4 text-left font-medium">Расход</th>
                        <th className="py-2 pr-4 text-left font-medium">Магазин</th>
                        <th className="py-2 pr-4 text-left font-medium">Адрес</th>
                        <th className="py-2 pr-4 text-left font-medium">Контакты</th>
                        <th className="py-2 pr-4 text-left font-medium">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((m) => (
                        <tr key={m.id} className="border-b border-white/5 last:border-0">
                          <td className="py-3 pr-4">
                            {m.name}
                            {m.note && <div className="text-xs text-white/30">{m.note}</div>}
                          </td>
                          <td className="py-3 pr-4 text-white/60">{m.category || "—"}</td>
                          <td className="py-3 pr-4 text-white/60">{m.unit}</td>
                          <td className="whitespace-nowrap py-3 pr-4 text-[#D4AF37]">
                            {money(num(m.price))}
                          </td>
                          <td className="whitespace-nowrap py-3 pr-4 text-white/60">
                            {num(m.consumption) > 0 ? (
                              <>
                                1 {m.unit} = {num(m.consumption)} {m.consumption_unit}
                                {num(m.price) > 0 && (
                                  <div className="text-xs text-white/30">
                                    {(num(m.price) / num(m.consumption)).toFixed(2)} ₽ за{" "}
                                    {m.consumption_unit}
                                  </div>
                                )}
                              </>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-3 pr-4">
                            {m.shop_url ? (
                              <a
                                href={m.shop_url}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-[#D4AF37]"
                              >
                                {m.shop_name || "—"}
                              </a>
                            ) : (
                              m.shop_name || "—"
                            )}
                          </td>
                          <td className="py-3 pr-4 text-white/60">{m.shop_address || "—"}</td>
                          <td className="py-3 pr-4 text-white/60">
                            {m.shop_phone ? (
                              <a href={`tel:${m.shop_phone}`} className="hover:text-[#D4AF37]">
                                {m.shop_phone}
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-3 pr-4">
                            <button
                              className="text-white/40 transition-colors hover:text-red-400"
                              title="Удалить"
                              onClick={() => run(() => materialsApi.remove(m.id))}
                            >
                              <Icon name="Trash2" size={16} />
                            </button>
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
    </CrmLayout>
  )
}
