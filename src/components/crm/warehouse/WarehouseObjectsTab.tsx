import { Dispatch, SetStateAction } from "react"
import Icon from "@/components/ui/icon"
import { warehouseApi, WarehouseItem, WarehouseObject, WarehouseLogRow } from "@/lib/api"
import { money, num, fmtDate, fmtDateTime, actionCls, inputCls, kindBadge } from "./constants"

interface WarehouseObjectsTabProps {
  usedObjects: WarehouseObject[]
  filteredIssued: WarehouseItem[]
  objectFilter: string
  setObjectFilter: Dispatch<SetStateAction<string>>
  run: (fn: () => Promise<unknown>) => Promise<void>
}

export function WarehouseObjectsTab({
  usedObjects,
  filteredIssued,
  objectFilter,
  setObjectFilter,
  run,
}: WarehouseObjectsTabProps) {
  return (
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
  )
}

interface WarehouseHistoryTabProps {
  logRows: WarehouseLogRow[]
  filteredLog: WarehouseLogRow[]
  logActions: string[]
  logSearch: string
  setLogSearch: Dispatch<SetStateAction<string>>
  logAction: string
  setLogAction: Dispatch<SetStateAction<string>>
}

export function WarehouseHistoryTab({
  logRows,
  filteredLog,
  logActions,
  logSearch,
  setLogSearch,
  logAction,
  setLogAction,
}: WarehouseHistoryTabProps) {
  return (
    <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Icon
            name="Search"
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            className={`${inputCls} pl-9`}
            placeholder="Поиск: позиция, склад, объект, сотрудник"
            value={logSearch}
            onChange={(e) => setLogSearch(e.target.value)}
          />
        </div>
        <select
          className={`${inputCls} max-w-[220px]`}
          value={logAction}
          onChange={(e) => setLogAction(e.target.value)}
        >
          <option value="">Все операции</option>
          {logActions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <span className="text-xs text-white/40">Записей: {filteredLog.length}</span>
      </div>

      {filteredLog.length === 0 ? (
        <div className="py-16 text-center text-sm text-white/30">
          {logRows.length === 0
            ? "История пуста — здесь появятся все операции со складом"
            : "Ничего не найдено по заданным условиям"}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-white/40">
                <th className="py-2 pr-4 text-left font-medium">Дата и время</th>
                <th className="py-2 pr-4 text-left font-medium">Сотрудник</th>
                <th className="py-2 pr-4 text-left font-medium">Операция</th>
                <th className="py-2 pr-4 text-left font-medium">Позиция</th>
                <th className="py-2 pr-4 text-left font-medium">Кол-во</th>
                <th className="py-2 pr-4 text-left font-medium">Склад</th>
                <th className="py-2 pr-4 text-left font-medium">Объект</th>
              </tr>
            </thead>
            <tbody>
              {filteredLog.map((l) => (
                <tr key={l.id} className="border-b border-white/5 last:border-0">
                  <td className="whitespace-nowrap py-3 pr-4 text-white/60">
                    {fmtDateTime(l.created_at)}
                  </td>
                  <td className="py-3 pr-4">{l.user_name || "—"}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-md px-2 py-0.5 text-xs ${actionCls(l.action)}`}>
                      {l.action}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    {l.item_name || "—"}
                    {l.kind && (
                      <span className="ml-2 text-xs text-white/30">{l.kind}</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    {num(l.qty) ? `${num(l.qty)} ${l.unit}` : "—"}
                  </td>
                  <td className="py-3 pr-4 text-white/60">{l.warehouse_name || "—"}</td>
                  <td className="py-3 pr-4 text-white/60">{l.object_code || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
