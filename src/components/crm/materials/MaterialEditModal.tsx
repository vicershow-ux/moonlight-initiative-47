import Icon from "@/components/ui/icon"
import { MaterialItem, MaterialObject, MaterialRoom, ObjectMaterial } from "@/lib/api"
import { money, num, inputCls, goldBtn, UNITS, WORK_TYPES, EditFormState } from "./constants"

interface MaterialEditModalProps {
  editRow: ObjectMaterial
  setEditRow: (v: ObjectMaterial | null) => void
  editForm: EditFormState
  setEditForm: (v: EditFormState) => void
  activeObject: MaterialObject | null
  materials: MaterialItem[]
  rooms: MaterialRoom[]
  pickMaterial: (id: string) => void
  saveEdit: (thenPrint?: boolean) => void
}

export function MaterialEditModal({
  editRow,
  setEditRow,
  editForm,
  setEditForm,
  activeObject,
  materials,
  rooms,
  pickMaterial,
  saveEdit,
}: MaterialEditModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={() => setEditRow(null)}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/10 bg-[#1f1f1f] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 text-base">Редактирование позиции</div>
        <div className="mb-5 text-xs text-white/40">
          {activeObject?.object_code} — {activeObject?.client_name}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs text-white/50">Материал из справочника</label>
            <select
              className={inputCls}
              value={editForm.material_id}
              onChange={(e) => pickMaterial(e.target.value)}
            >
              <option value="">Произвольная позиция</option>
              {materials.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name} — {money(num(x.price))}/{x.unit}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs text-white/50">Наименование</label>
            <input
              className={inputCls}
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-white/50">Помещение</label>
            <select
              className={inputCls}
              value={editForm.room_id}
              onChange={(e) => setEditForm({ ...editForm, room_id: e.target.value })}
            >
              <option value="">Без помещения</option>
              {rooms
                .filter((r) => r.object_id === editRow.object_id)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-white/50">Вид работ</label>
            <select
              className={inputCls}
              value={editForm.work_type}
              onChange={(e) => setEditForm({ ...editForm, work_type: e.target.value })}
            >
              <option value="">Не указан</option>
              {WORK_TYPES.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-white/50">Количество</label>
            <input
              className={inputCls}
              type="number"
              min="0"
              step="0.01"
              value={editForm.qty}
              onChange={(e) => setEditForm({ ...editForm, qty: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-white/50">Единица измерения</label>
            <select
              className={inputCls}
              value={editForm.unit}
              onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-white/50">Цена за единицу, ₽</label>
            <input
              className={inputCls}
              type="number"
              min="0"
              step="0.01"
              value={editForm.price}
              onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-white/50">Магазин</label>
            <input
              className={inputCls}
              value={editForm.shop_name}
              onChange={(e) => setEditForm({ ...editForm, shop_name: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs text-white/50">Примечание</label>
            <input
              className={inputCls}
              value={editForm.note}
              onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
            />
          </div>

          <div className="rounded-lg border border-[#D4AF37]/30 bg-[#161616] px-4 py-2.5 text-sm sm:col-span-2">
            Сумма:{" "}
            <span className="text-[#D4AF37]">
              {money(Number(editForm.qty || 0) * Number(editForm.price || 0))}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button className={goldBtn} onClick={() => saveEdit(false)}>
            <Icon name="Check" size={16} />
            Сохранить
          </button>
          <button
            className="flex items-center gap-2 rounded-lg border border-[#D4AF37]/40 px-4 py-2.5 text-sm text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/10"
            onClick={() => saveEdit(true)}
          >
            <Icon name="Printer" size={16} />
            Сохранить и печать
          </button>
          <button
            className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white/60 transition-colors hover:text-white"
            onClick={() => setEditRow(null)}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  )
}

export default MaterialEditModal
