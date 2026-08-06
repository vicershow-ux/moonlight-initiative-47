import { Dispatch, SetStateAction } from "react"
import Icon from "@/components/ui/icon"
import { DeleteButton } from "@/components/ui/delete-button"
import { warehouseApi, WarehouseItem, WarehouseObject, WarehouseRow } from "@/lib/api"
import { money, num, inputCls, goldBtn, kindBadge, ItemForm } from "./constants"

interface SearchResult {
  item: WarehouseItem
  wh: WarehouseRow | undefined
}

interface WarehouseLedgerTabProps {
  warehouses: WarehouseRow[]
  objects: WarehouseObject[]
  stockItems: WarehouseItem[]
  searchResults: SearchResult[]
  globalSearch: string
  setGlobalSearch: Dispatch<SetStateAction<string>>
  itemForm: ItemForm
  setItemForm: Dispatch<SetStateAction<ItemForm>>
  showItemForm: boolean
  setShowItemForm: Dispatch<SetStateAction<boolean>>
  addItem: () => void
  editItem: WarehouseItem | null
  setEditItem: Dispatch<SetStateAction<WarehouseItem | null>>
  editItemForm: ItemForm
  setEditItemForm: Dispatch<SetStateAction<ItemForm>>
  startEditItem: (i: WarehouseItem) => void
  submitEditItem: () => void
  restockFor: WarehouseItem | null
  setRestockFor: Dispatch<SetStateAction<WarehouseItem | null>>
  restockQty: string
  setRestockQty: Dispatch<SetStateAction<string>>
  restockPrice: string
  setRestockPrice: Dispatch<SetStateAction<string>>
  submitRestock: () => void
  issueFor: WarehouseItem | null
  setIssueFor: Dispatch<SetStateAction<WarehouseItem | null>>
  issueObject: string
  setIssueObject: Dispatch<SetStateAction<string>>
  issueQty: string
  setIssueQty: Dispatch<SetStateAction<string>>
  submitIssue: () => void
  run: (fn: () => Promise<unknown>) => Promise<void>
}

export function WarehouseLedgerTab({
  warehouses,
  objects,
  stockItems,
  searchResults,
  globalSearch,
  setGlobalSearch,
  itemForm,
  setItemForm,
  showItemForm,
  setShowItemForm,
  addItem,
  editItem,
  setEditItem,
  editItemForm,
  setEditItemForm,
  startEditItem,
  submitEditItem,
  restockFor,
  setRestockFor,
  restockQty,
  setRestockQty,
  restockPrice,
  setRestockPrice,
  submitRestock,
  issueFor,
  setIssueFor,
  issueObject,
  setIssueObject,
  issueQty,
  setIssueQty,
  submitIssue,
  run,
}: WarehouseLedgerTabProps) {
  return (
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
        <button className={goldBtn} onClick={() => setShowItemForm((v) => !v)}>
          <Icon name={showItemForm ? "X" : "Plus"} size={16} />
          {showItemForm ? "Отмена" : "Добавить позицию"}
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
                      <DeleteButton onConfirm={() => run(() => warehouseApi.removeItem(i.id))} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default WarehouseLedgerTab
