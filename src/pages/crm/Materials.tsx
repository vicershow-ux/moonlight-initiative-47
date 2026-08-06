import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Icon from "@/components/ui/icon"
import { RoomCalculator } from "@/components/crm/RoomCalculator"
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

  const [openObject, setOpenObject] = useState<number | null>(null)
  const [addForObject, setAddForObject] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    materialsApi
      .list()
      .then((d) => {
        setMaterials(d.materials || [])
        setObjects(d.objects || [])
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

  const startAdd = (objectId: number) => {
    setAddForObject(objectId)
    setOpenObject(objectId)
  }

  const addFromCalc = async (payload: { material_id: number; qty: number; note: string }) => {
    if (!addForObject) return
    await materialsApi.addToObject({ object_id: addForObject, ...payload })
    setAddForObject(null)
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
                <div className="space-y-3">
                  {objects.map((o) => {
                    const list = materialsOf(o.id)
                    const isOpen = openObject === o.id
                    return (
                      <div key={o.id} className="rounded-lg border border-white/10 bg-[#161616]">
                        <div className="flex flex-wrap items-center gap-3 p-4">
                          <button
                            className="flex flex-1 items-center gap-3 text-left"
                            onClick={() => setOpenObject(isOpen ? null : o.id)}
                          >
                            <Icon
                              name={isOpen ? "ChevronDown" : "ChevronRight"}
                              size={16}
                              className="text-white/40"
                            />
                            <div>
                              <div className="text-sm">
                                {o.object_code} — {o.client_name}
                              </div>
                              <div className="text-xs text-white/40">{o.address || "Адрес не указан"}</div>
                            </div>
                          </button>

                          <div className="text-right text-xs text-white/40">
                            <div>{list.length} позиций</div>
                            <div className="text-sm text-[#D4AF37]">{money(sumOf(o.id))}</div>
                          </div>

                          <button
                            className={goldBtn}
                            onClick={() => (addForObject === o.id ? setAddForObject(null) : startAdd(o.id))}
                          >
                            <Icon name={addForObject === o.id ? "X" : "Calculator"} size={16} />
                            {addForObject === o.id ? "Отмена" : "Рассчитать помещение"}
                          </button>
                        </div>

                        {addForObject === o.id && (
                          <div className="border-t border-white/10 p-4">
                            <RoomCalculator
                              objectId={o.id}
                              materials={materials}
                              rooms={rooms}
                              onAdd={addFromCalc}
                              onCancel={() => setAddForObject(null)}
                            />
                          </div>
                        )}

                        {isOpen && (
                          <div className="border-t border-white/10 p-4">
                            {list.length === 0 ? (
                              <div className="py-6 text-center text-sm text-white/30">
                                Для этого объекта материалы ещё не добавлены
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-white/10 text-xs uppercase text-white/40">
                                      <th className="py-2 pr-4 text-left font-medium">Материал</th>
                                      <th className="py-2 pr-4 text-left font-medium">Кол-во</th>
                                      <th className="py-2 pr-4 text-left font-medium">Цена</th>
                                      <th className="py-2 pr-4 text-left font-medium">Сумма</th>
                                      <th className="py-2 pr-4 text-left font-medium">Магазин</th>
                                      <th className="py-2 pr-4 text-left font-medium">Действия</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {list.map((m) => (
                                      <tr key={m.id} className="border-b border-white/5 last:border-0">
                                        <td className="py-2.5 pr-4">
                                          {m.name}
                                          {m.note && (
                                            <div className="text-xs text-white/30">{m.note}</div>
                                          )}
                                        </td>
                                        <td className="py-2.5 pr-4">
                                          {num(m.qty)} {m.unit}
                                        </td>
                                        <td className="py-2.5 pr-4 text-white/60">
                                          {money(num(m.price))}
                                        </td>
                                        <td className="py-2.5 pr-4 text-[#D4AF37]">
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
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
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
