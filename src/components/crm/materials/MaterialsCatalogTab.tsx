import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { DeleteButton } from "@/components/ui/delete-button"
import { materialsApi, MaterialItem } from "@/lib/api"
import { money, num, inputCls, goldBtn } from "./constants"

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
                    <DeleteButton onConfirm={() => run(() => materialsApi.remove(m.id))} />
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

export default MaterialsCatalogTab
