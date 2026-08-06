import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { RoomCalculator } from "@/components/crm/RoomCalculator"
import { DeleteButton } from "@/components/ui/delete-button"
import { printMaterials, downloadMaterialsPdf } from "@/lib/printMaterials"
import {
  materialsApi,
  MaterialItem,
  MaterialObject,
  MaterialRoom,
  ObjectMaterial,
} from "@/lib/api"
import { money, num, inputCls, goldBtn, RoomGroup } from "./constants"

interface MaterialsObjectsTabProps {
  objects: MaterialObject[]
  materials: MaterialItem[]
  rooms: MaterialRoom[]
  companyName: string
  selectedObject: number | null
  setSelectedObject: (v: number | null) => void
  activeObject: MaterialObject | null
  showCalc: boolean
  setShowCalc: (v: boolean) => void
  savingEstimate: boolean
  saveEstimate: () => void
  materialsOf: (objectId: number) => ObjectMaterial[]
  sumOf: (objectId: number) => number
  groupedByRoom: (objectId: number) => RoomGroup[]
  addFromCalc: (payload: {
    material_id: number
    qty: number
    note: string
    room_id: number | null
    room_name: string
    work_type: string
    merge: boolean
  }) => Promise<void>
  openEdit: (m: ObjectMaterial) => void
  run: (fn: () => Promise<unknown>) => Promise<void>
}

export function MaterialsObjectsTab({
  objects,
  materials,
  rooms,
  companyName,
  selectedObject,
  setSelectedObject,
  activeObject,
  showCalc,
  setShowCalc,
  savingEstimate,
  saveEstimate,
  materialsOf,
  sumOf,
  groupedByRoom,
  addFromCalc,
  openEdit,
  run,
}: MaterialsObjectsTabProps) {
  return (
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
                  disabled={materialsOf(activeObject.id).length === 0 || savingEstimate}
                  onClick={saveEstimate}
                >
                  <Icon
                    name={savingEstimate ? "Loader2" : "FileText"}
                    size={16}
                    className={savingEstimate ? "animate-spin" : ""}
                  />
                  Сохранить смету на материал
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
                                  <div className="flex items-center gap-2.5">
                                    <button
                                      className="text-white/50 transition-colors hover:text-[#D4AF37]"
                                      title="Просмотр"
                                      onClick={() =>
                                        printMaterials(
                                          activeObject,
                                          [m],
                                          materials,
                                          companyName
                                        )
                                      }
                                    >
                                      <Icon name="Eye" size={16} />
                                    </button>
                                    <button
                                      className="text-white/50 transition-colors hover:text-[#D4AF37]"
                                      title="Редактировать"
                                      onClick={() => openEdit(m)}
                                    >
                                      <Icon name="Pencil" size={16} />
                                    </button>
                                    <button
                                      className="text-white/50 transition-colors hover:text-[#D4AF37]"
                                      title="Печать"
                                      onClick={() =>
                                        printMaterials(
                                          activeObject,
                                          [m],
                                          materials,
                                          companyName,
                                          true
                                        )
                                      }
                                    >
                                      <Icon name="Printer" size={16} />
                                    </button>
                                    <button
                                      className="text-white/50 transition-colors hover:text-[#D4AF37]"
                                      title="Скачать PDF"
                                      onClick={() =>
                                        downloadMaterialsPdf(
                                          activeObject,
                                          [m],
                                          materials,
                                          companyName
                                        )
                                      }
                                    >
                                      <Icon name="FileDown" size={16} />
                                    </button>
                                    <DeleteButton onConfirm={() =>
                                        run(() => materialsApi.removeFromObject(m.id))} />
                                  </div>
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
  )
}

export default MaterialsObjectsTab
