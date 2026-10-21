import { Dispatch, SetStateAction } from "react"
import Icon from "@/components/ui/icon"
import { DeleteButton } from "@/components/ui/delete-button"
import { warehouseApi, WarehouseRow } from "@/lib/api"
import { inputCls, goldBtn, WhForm, WhItemForm } from "./constants"
import { MobileCard, CardAction } from "@/components/crm/MobileCard"

interface WarehouseStockTabProps {
  warehouses: WarehouseRow[]
  whForm: WhForm
  setWhForm: Dispatch<SetStateAction<WhForm>>
  showWhForm: boolean
  setShowWhForm: Dispatch<SetStateAction<boolean>>
  addWarehouse: () => void
  addToWh: WarehouseRow | null
  setAddToWh: Dispatch<SetStateAction<WarehouseRow | null>>
  whItemForm: WhItemForm
  setWhItemForm: Dispatch<SetStateAction<WhItemForm>>
  submitWhItem: () => void
  editWh: WarehouseRow | null
  setEditWh: Dispatch<SetStateAction<WarehouseRow | null>>
  editForm: WhForm
  setEditForm: Dispatch<SetStateAction<WhForm>>
  startEdit: (w: WarehouseRow) => void
  submitEdit: () => void
  setViewWh: Dispatch<SetStateAction<WarehouseRow | null>>
  run: (fn: () => Promise<unknown>) => Promise<void>
}

export function WarehouseStockTab({
  warehouses,
  whForm,
  setWhForm,
  showWhForm,
  setShowWhForm,
  addWarehouse,
  addToWh,
  setAddToWh,
  whItemForm,
  setWhItemForm,
  submitWhItem,
  editWh,
  setEditWh,
  editForm,
  setEditForm,
  startEdit,
  submitEdit,
  setViewWh,
  run,
}: WarehouseStockTabProps) {
  const renderEditForm = () => (
    <div className="grid grid-cols-1 gap-3 rounded-lg border border-[#D4AF37]/30 bg-[#161616] p-3 sm:p-4 md:grid-cols-3">
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
        className={`${goldBtn} min-h-[44px] justify-center md:min-h-0 md:justify-start`}
        onClick={submitEdit}
        disabled={editForm.name.trim().length < 2}
      >
        <Icon name="Check" size={16} />
        Сохранить
      </button>
      <button
        className="min-h-[44px] rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white/60 transition-colors hover:text-white md:min-h-0"
        onClick={() => setEditWh(null)}
      >
        Отмена
      </button>
    </div>
  )

  const renderAddForm = (w: WarehouseRow) => (
    <div className="grid grid-cols-1 gap-3 rounded-lg border border-[#D4AF37]/30 bg-[#161616] p-3 sm:p-4 md:grid-cols-3">
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
        className={`${goldBtn} min-h-[44px] justify-center md:min-h-0 md:justify-start`}
        onClick={submitWhItem}
        disabled={whItemForm.name.trim().length < 2}
      >
        <Icon name="Check" size={16} />
        Добавить
      </button>
    </div>
  )

  return (
    <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5">
      <div className="mb-4 flex justify-end">
        <button className={`${goldBtn} min-h-[44px] w-full justify-center sm:min-h-0 sm:w-auto sm:justify-start`} onClick={() => setShowWhForm((v) => !v)}>
          <Icon name={showWhForm ? "X" : "Plus"} size={16} />
          {showWhForm ? "Отмена" : "Добавить склад"}
        </button>
      </div>

      {showWhForm && (
        <div className="mb-5 grid grid-cols-1 gap-3 rounded-lg border border-white/10 bg-[#161616] p-3 sm:p-4 md:grid-cols-4">
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
          <button className={`${goldBtn} min-h-[44px] justify-center md:min-h-0 md:justify-start`} onClick={addWarehouse} disabled={whForm.name.length < 2}>
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
        <>
        <div className="flex flex-col gap-3 md:hidden">
          {warehouses.map((w) => (
            <div key={w.id} className="flex flex-col gap-3">
              <MobileCard
                title={w.name}
                subtitle={w.address || undefined}
                badge={
                  <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-white/60">
                    {w.positions} поз.
                  </span>
                }
                rows={[
                  { label: "Ответственный", value: w.responsible || "—" },
                  {
                    label: "Телефон",
                    value: w.phone ? (
                      <a href={`tel:${w.phone}`} className="text-[#D4AF37]">
                        {w.phone}
                      </a>
                    ) : (
                      "—"
                    ),
                  },
                ]}
                actions={
                  <>
                    <CardAction
                      icon={<Icon name={addToWh?.id === w.id ? "X" : "Plus"} size={16} />}
                      label=""
                      className="text-[#D4AF37]"
                      onClick={() => {
                        setEditWh(null)
                        setAddToWh((prev) => (prev?.id === w.id ? null : w))
                      }}
                    />
                    <CardAction
                      icon={<Icon name="Eye" size={16} />}
                      label=""
                      onClick={() => setViewWh(w)}
                    />
                    <CardAction
                      icon={<Icon name={editWh?.id === w.id ? "X" : "Pencil"} size={16} />}
                      label=""
                      onClick={() => (editWh?.id === w.id ? setEditWh(null) : startEdit(w))}
                    />
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
                      <DeleteButton onConfirm={() => run(() => warehouseApi.removeWarehouse(w.id))} />
                    </div>
                  </>
                }
              />
              {editWh?.id === w.id && renderEditForm()}
              {editWh?.id !== w.id && addToWh?.id === w.id && renderAddForm(w)}
            </div>
          ))}
        </div>
        <div className="hidden overflow-x-auto md:block">
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
                      <DeleteButton onConfirm={() => run(() => warehouseApi.removeWarehouse(w.id))} />
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
                        {renderEditForm()}
                      </td>
                    </tr>,
                  ]
                }

                if (addToWh?.id !== w.id) return [row]
                return [
                  row,
                  <tr key={`form-${w.id}`} className="border-b border-white/5">
                    <td colSpan={6} className="py-3">
                      {renderAddForm(w)}
                    </td>
                  </tr>,
                ]
              })}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  )
}

export default WarehouseStockTab
