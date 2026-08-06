import { useEffect, useMemo, useState } from "react"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { materialsApi, MaterialItem } from "@/lib/api"

const money = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(n || 0) + " ₽"

const num = (n: unknown) => Number(n || 0)

const UNITS = ["шт", "м²", "м", "м.п.", "м³", "кг", "т", "л", "уп", "рул", "меш", "компл"]

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"

const goldBtn =
  "flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg disabled:opacity-40"

const emptyForm = {
  name: "",
  category: "",
  unit: "шт",
  price: "",
  shop_name: "",
  shop_address: "",
  shop_phone: "",
  shop_url: "",
  note: "",
}

export default function Materials() {
  const [materials, setMaterials] = useState<MaterialItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)

  const [search, setSearch] = useState("")
  const [shopFilter, setShopFilter] = useState("")

  const load = () => {
    setLoading(true)
    materialsApi
      .list()
      .then((d) => setMaterials(d.materials || []))
      .catch((e) => setError(e?.message || "Не удалось загрузить материалы"))
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

  const openCreate = () => {
    setEditId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (m: MaterialItem) => {
    setEditId(m.id)
    setForm({
      name: m.name || "",
      category: m.category || "",
      unit: m.unit || "шт",
      price: String(num(m.price)),
      shop_name: m.shop_name || "",
      shop_address: m.shop_address || "",
      shop_phone: m.shop_phone || "",
      shop_url: m.shop_url || "",
      note: m.note || "",
    })
    setShowForm(true)
  }

  const submit = () =>
    run(async () => {
      const payload = { ...form, price: Number(form.price || 0) }
      if (editId) await materialsApi.update(editId, payload)
      else await materialsApi.create(payload)
      setShowForm(false)
      setEditId(null)
      setForm(emptyForm)
    })

  return (
    <CrmLayout title="Материалы" subtitle="Справочник материалов, магазинов и цен">
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

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
          <button className={goldBtn} onClick={() => (showForm ? setShowForm(false) : openCreate())}>
            <Icon name={showForm ? "X" : "Plus"} size={16} />
            {showForm ? "Отмена" : "Добавить материал"}
          </button>
        </div>

        {showForm && (
          <div className="mb-5 rounded-lg border border-[#D4AF37]/30 bg-[#161616] p-4">
            <div className="mb-3 text-sm text-white/70">
              {editId ? "Редактирование материала" : "Новый материал"}
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-4">
              <input
                className={inputCls}
                placeholder="Название материала"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Категория"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <select
                className={inputCls}
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <input
                className={inputCls}
                type="number"
                min="0"
                step="0.01"
                placeholder="Цена за единицу"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>

            <div className="mb-3 text-xs uppercase text-white/40">Магазин</div>
            <div className="mb-4 grid gap-3 md:grid-cols-4">
              <input
                className={inputCls}
                placeholder="Название магазина"
                value={form.shop_name}
                onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Адрес магазина"
                value={form.shop_address}
                onChange={(e) => setForm({ ...form, shop_address: e.target.value })}
              />
              <input
                className={inputCls}
                type="tel"
                placeholder="Телефон"
                value={form.shop_phone}
                onChange={(e) => setForm({ ...form, shop_phone: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Сайт или ссылка на товар"
                value={form.shop_url}
                onChange={(e) => setForm({ ...form, shop_url: e.target.value })}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <input
                className={`${inputCls} md:col-span-2`}
                placeholder="Примечание"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
              <button className={goldBtn} onClick={submit} disabled={form.name.trim().length < 2}>
                <Icon name="Check" size={16} />
                {editId ? "Сохранить" : "Добавить"}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Icon name="Loader2" size={24} className="animate-spin text-white/40" />
          </div>
        ) : filtered.length === 0 ? (
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
                      <div className="flex items-center gap-3">
                        <button
                          className="text-white/60 transition-colors hover:text-[#D4AF37]"
                          title="Редактировать"
                          onClick={() => openEdit(m)}
                        >
                          <Icon name="Pencil" size={16} />
                        </button>
                        <button
                          className="text-white/40 transition-colors hover:text-red-400"
                          title="Удалить"
                          onClick={() => run(() => materialsApi.remove(m.id))}
                        >
                          <Icon name="Trash2" size={16} />
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
    </CrmLayout>
  )
}
