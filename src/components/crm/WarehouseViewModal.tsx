import { useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Icon from "@/components/ui/icon"
import { WarehouseRow, WarehouseItem } from "@/lib/api"

const money = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n || 0) + " ₽"

const num = (n: unknown) => Number(n || 0)

const KIND_STYLE: Record<string, { cls: string; icon: string }> = {
  инструмент: { cls: "bg-[#4A90D9]/15 text-[#7FB5E8]", icon: "Hammer" },
  оборудование: { cls: "bg-[#9B7BD4]/15 text-[#B49AE5]", icon: "Cog" },
  расходник: { cls: "bg-emerald-500/15 text-emerald-400", icon: "Layers" },
}

const kindOf = (kind: string) =>
  KIND_STYLE[kind] || { cls: "bg-[#D4AF37]/15 text-[#D4AF37]", icon: "Package" }

interface Props {
  warehouse: WarehouseRow | null
  items: WarehouseItem[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WarehouseViewModal({ warehouse, items, open, onOpenChange }: Props) {
  const [search, setSearch] = useState("")
  const [kindFilter, setKindFilter] = useState("")
  const [view, setView] = useState<"list" | "grid">("list")

  const stock = useMemo(
    () => items.filter((i) => !i.object_id && i.warehouse_id === warehouse?.id),
    [items, warehouse]
  )

  const issued = useMemo(
    () => items.filter((i) => i.object_id && i.warehouse_id === warehouse?.id),
    [items, warehouse]
  )

  const kinds = useMemo(
    () => Array.from(new Set(stock.map((i) => i.kind))).sort(),
    [stock]
  )

  const filtered = useMemo(
    () =>
      stock.filter(
        (i) =>
          (!kindFilter || i.kind === kindFilter) &&
          (!search || i.name.toLowerCase().includes(search.toLowerCase()))
      ),
    [stock, kindFilter, search]
  )

  const totalSum = useMemo(
    () => filtered.reduce((s, i) => s + num(i.qty) * num(i.price), 0),
    [filtered]
  )

  const issuedSum = useMemo(
    () => issued.reduce((s, i) => s + num(i.issued_qty) * num(i.price), 0),
    [issued]
  )

  const byKind = useMemo(() => {
    const map = new Map<string, { qty: number; sum: number; count: number }>()
    filtered.forEach((i) => {
      const cur = map.get(i.kind) || { qty: 0, sum: 0, count: 0 }
      cur.qty += num(i.qty)
      cur.sum += num(i.qty) * num(i.price)
      cur.count += 1
      map.set(i.kind, cur)
    })
    return Array.from(map.entries())
  }, [filtered])

  const inputCls =
    "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-5xl overflow-y-auto bg-[#1f1f1f] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Icon name="Warehouse" size={20} className="text-[#D4AF37]" />
            {warehouse?.name || "Склад"}
          </DialogTitle>
        </DialogHeader>

        <div className="mb-1 flex flex-wrap gap-4 text-xs text-white/50">
          {warehouse?.address && (
            <span className="flex items-center gap-1.5">
              <Icon name="MapPin" size={13} />
              {warehouse.address}
            </span>
          )}
          {warehouse?.responsible && (
            <span className="flex items-center gap-1.5">
              <Icon name="User" size={13} />
              {warehouse.responsible}
            </span>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-[#161616] p-3">
            <div className="text-xs text-white/40">Позиций на складе</div>
            <div className="text-xl text-[#D4AF37]">{stock.length}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#161616] p-3">
            <div className="text-xs text-white/40">Стоимость остатков</div>
            <div className="text-xl text-[#D4AF37]">{money(totalSum)}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#161616] p-3">
            <div className="text-xs text-white/40">Выдано на объекты</div>
            <div className="text-xl text-white/80">{money(issuedSum)}</div>
          </div>
        </div>

        {byKind.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {byKind.map(([kind, v]) => {
              const st = kindOf(kind)
              return (
                <span
                  key={kind}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs ${st.cls}`}
                >
                  <Icon name={st.icon} size={12} />
                  {kind}: {v.count} поз. · {money(v.sum)}
                </span>
              )
            })}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Icon
              name="Search"
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              className={`${inputCls} pl-9`}
              placeholder="Поиск по названию"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className={`${inputCls} max-w-[180px]`}
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
          >
            <option value="">Все типы</option>
            {kinds.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <div className="flex overflow-hidden rounded-lg border border-white/10">
            <button
              className={`px-3 py-2 ${view === "list" ? "bg-[#D4AF37] text-[#161616]" : "text-white/50"}`}
              onClick={() => setView("list")}
              title="Списком"
            >
              <Icon name="List" size={16} />
            </button>
            <button
              className={`px-3 py-2 ${view === "grid" ? "bg-[#D4AF37] text-[#161616]" : "text-white/50"}`}
              onClick={() => setView("grid")}
              title="Плиткой"
            >
              <Icon name="LayoutGrid" size={16} />
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-14 text-center text-sm text-white/30">
            {stock.length === 0
              ? "На этом складе пока пусто — добавьте позицию кнопкой «+»"
              : "Ничего не найдено по заданным условиям"}
          </div>
        ) : view === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase text-white/40">
                  <th className="py-2 pr-4 text-left font-medium">Название</th>
                  <th className="py-2 pr-4 text-left font-medium">Тип</th>
                  <th className="py-2 pr-4 text-left font-medium">Кол-во</th>
                  <th className="py-2 pr-4 text-left font-medium">Цена</th>
                  <th className="py-2 pr-4 text-left font-medium">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => {
                  const st = kindOf(i.kind)
                  return (
                    <tr key={i.id} className="border-b border-white/5 last:border-0">
                      <td className="py-2.5 pr-4">{i.name}</td>
                      <td className="py-2.5 pr-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs ${st.cls}`}
                        >
                          <Icon name={st.icon} size={12} />
                          {i.kind}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        {num(i.qty)} {i.unit}
                      </td>
                      <td className="py-2.5 pr-4 text-white/60">{money(num(i.price))}</td>
                      <td className="py-2.5 pr-4">{money(num(i.qty) * num(i.price))}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((i) => {
              const st = kindOf(i.kind)
              return (
                <div key={i.id} className="rounded-lg border border-white/10 bg-[#161616] p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="text-sm">{i.name}</div>
                    <span className={`rounded-md px-1.5 py-0.5 text-[11px] ${st.cls}`}>
                      <Icon name={st.icon} size={11} />
                    </span>
                  </div>
                  <div className="text-xs text-white/40">
                    {num(i.qty)} {i.unit} × {money(num(i.price))}
                  </div>
                  <div className="mt-1 text-sm text-[#D4AF37]">
                    {money(num(i.qty) * num(i.price))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {issued.length > 0 && (
          <div className="mt-2 rounded-lg border border-white/10 bg-[#161616] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm text-white/70">
              <Icon name="Send" size={15} className="text-[#D4AF37]" />
              Выдано с этого склада на объекты
            </div>
            <div className="space-y-2">
              {issued.map((i) => (
                <div
                  key={i.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2 text-sm last:border-0 last:pb-0"
                >
                  <span>{i.name}</span>
                  <span className="text-white/50">
                    {i.object_code} · {num(i.issued_qty)} {i.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
