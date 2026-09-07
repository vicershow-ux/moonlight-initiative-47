import { useState } from "react"
import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { DeleteButton } from "@/components/ui/delete-button"
import { materialsApi, MaterialItem } from "@/lib/api"
import { money, num, inputCls, goldBtn } from "./constants"
import { CatalogEditModal } from "./CatalogEditModal"

interface MaterialsCatalogTabProps {
  materials: MaterialItem[]
  filtered: MaterialItem[]
  shops: string[]
  search: string
  setSearch: (v: string) => void
  shopFilter: string
  setShopFilter: (v: string) => void
  run: (fn: () => Promise<unknown>) => Promise<void>
}

export function MaterialsCatalogTab({
  materials,
  filtered,
  shops,
  search,
  setSearch,
  shopFilter,
  setShopFilter,
  run,
}: MaterialsCatalogTabProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const editing = materials.find((m) => m.id === editingId) || null

  return (
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
                <th className="py-2 pr-4 text-left font-medium">Где дешевле</th>
                <th className="py-2 pr-4 text-left font-medium">Магазины</th>
                <th className="py-2 pr-4 text-left font-medium">Наличие</th>
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
                    {(() => {
                      const offers = m.offers || []
                      const priced = offers.filter((o) => num(o.price) > 0)
                      if (priced.length === 0) return <span className="text-white/30">—</span>
                      const best = priced.reduce((a, b) => (num(b.price) < num(a.price) ? b : a))
                      return (
                        <>
                          {best.shop_url ? (
                            <a
                              href={best.shop_url}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-[#D4AF37]"
                            >
                              {best.shop_name || "—"}
                            </a>
                          ) : (
                            best.shop_name || "—"
                          )}
                          {best.shop_address && (
                            <div className="text-xs text-white/30">{best.shop_address}</div>
                          )}
                        </>
                      )
                    })()}
                  </td>
                  <td className="whitespace-nowrap py-3 pr-4 text-white/60">
                    {(() => {
                      const offers = m.offers || []
                      if (offers.length === 0)
                        return <span className="text-white/30">не добавлены</span>
                      const priced = offers
                        .filter((o) => num(o.price) > 0)
                        .map((o) => num(o.price))
                      if (priced.length < 2) return `${offers.length} шт`
                      const min = Math.min(...priced)
                      const max = Math.max(...priced)
                      return (
                        <>
                          {offers.length} шт
                          {max > min && (
                            <div className="text-xs text-white/30">
                              от {money(min)} до {money(max)}
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </td>
                  <td className="whitespace-nowrap py-3 pr-4 text-xs">
                    {(() => {
                      const known = (m.offers || []).filter((o) => o.stock_known)
                      if (known.length === 0)
                        return <span className="text-white/30">не указано</span>
                      const inStock = known.filter((o) => num(o.stock) > 0)
                      if (inStock.length === 0)
                        return <span className="text-red-400">нет в наличии</span>
                      const total = inStock.reduce((s, o) => s + num(o.stock), 0)
                      return (
                        <span className="text-emerald-400">
                          {total} {m.unit}
                          <div className="text-white/30">
                            в {inStock.length} из {known.length}
                          </div>
                        </span>
                      )
                    })()}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1">
                      <button
                        className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-[#D4AF37]"
                        title="Редактировать материал"
                        onClick={() => setEditingId(m.id)}
                      >
                        <Icon name="Pencil" size={15} />
                      </button>
                      <DeleteButton onConfirm={() => run(() => materialsApi.remove(m.id))} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <CatalogEditModal
          key={editing.id}
          material={editing}
          onClose={() => setEditingId(null)}
          onSaved={() => run(async () => {})}
        />
      )}
    </div>
  )
}

export default MaterialsCatalogTab