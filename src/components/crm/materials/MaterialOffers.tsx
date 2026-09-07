import { useState } from "react"
import Icon from "@/components/ui/icon"
import { DeleteButton } from "@/components/ui/delete-button"
import { materialsApi, MaterialOffer } from "@/lib/api"
import { money, num, inputCls } from "./constants"

const labelCls = "mb-1.5 block text-xs text-white/50"

const emptyForm = {
  shop_name: "",
  shop_address: "",
  shop_phone: "",
  shop_url: "",
  price: "",
  stock: "",
  stock_known: false,
  note: "",
}

type OfferForm = typeof emptyForm

interface MaterialOffersProps {
  materialId: number
  unit: string
  offers: MaterialOffer[]
  onChanged: () => void
}

export function MaterialOffers({ materialId, unit, offers, onChanged }: MaterialOffersProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<OfferForm>(emptyForm)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const set = (k: keyof OfferForm, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }))

  const prices = offers.map((o) => num(o.price)).filter((p) => p > 0)
  const minPrice = prices.length ? Math.min(...prices) : 0

  const startAdd = () => {
    setForm(emptyForm)
    setEditingId(null)
    setAdding(true)
    setError("")
  }

  const startEdit = (o: MaterialOffer) => {
    setForm({
      shop_name: o.shop_name || "",
      shop_address: o.shop_address || "",
      shop_phone: o.shop_phone || "",
      shop_url: o.shop_url || "",
      price: num(o.price) ? String(num(o.price)) : "",
      stock: o.stock_known ? String(num(o.stock)) : "",
      stock_known: !!o.stock_known,
      note: o.note || "",
    })
    setAdding(false)
    setEditingId(o.id)
    setError("")
  }

  const cancel = () => {
    setAdding(false)
    setEditingId(null)
    setError("")
  }

  const save = async () => {
    setError("")
    setBusy(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price || 0),
        stock: Number(form.stock || 0),
      }
      if (editingId) {
        await materialsApi.updateOffer(editingId, payload)
      } else {
        await materialsApi.createOffer({ ...payload, material_id: materialId })
      }
      cancel()
      onChanged()
    } catch (e) {
      setError((e as Error)?.message || "Не удалось сохранить магазин")
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id: number) => {
    setError("")
    try {
      await materialsApi.removeOffer(id)
      onChanged()
    } catch (e) {
      setError((e as Error)?.message || "Не удалось удалить магазин")
    }
  }

  const editor = (
    <div className="rounded-lg border border-[#D4AF37]/30 bg-[#161616] p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Название магазина</label>
          <input
            className={inputCls}
            placeholder="Например: Леруа Мерлен"
            value={form.shop_name}
            onChange={(e) => set("shop_name", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Цена за 1 {unit}, ₽</label>
          <input
            className={inputCls}
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Адрес</label>
          <input
            className={inputCls}
            placeholder="Город, улица, дом"
            value={form.shop_address}
            onChange={(e) => set("shop_address", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Телефон</label>
          <input
            className={inputCls}
            type="tel"
            placeholder="+7"
            value={form.shop_phone}
            onChange={(e) => set("shop_phone", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Ссылка на товар</label>
          <input
            className={inputCls}
            placeholder="https://"
            value={form.shop_url}
            onChange={(e) => set("shop_url", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[#D4AF37]"
              checked={form.stock_known}
              onChange={(e) => set("stock_known", e.target.checked)}
            />
            Знаю, сколько есть в наличии
          </label>
        </div>
        {form.stock_known && (
          <div>
            <label className={labelCls}>Сколько есть, {unit}</label>
            <input
              className={inputCls}
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={form.stock}
              onChange={(e) => set("stock", e.target.value)}
            />
          </div>
        )}
        <div className={form.stock_known ? "" : "sm:col-span-2"}>
          <label className={labelCls}>Примечание</label>
          <input
            className={inputCls}
            placeholder="Необязательно"
            value={form.note}
            onChange={(e) => set("note", e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          className="flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2 text-sm text-[#161616] transition-colors hover:bg-[#B8860B] disabled:opacity-40"
          onClick={save}
          disabled={busy || form.shop_name.trim().length < 2}
        >
          <Icon name={busy ? "Loader2" : "Check"} size={15} className={busy ? "animate-spin" : ""} />
          {editingId ? "Сохранить магазин" : "Добавить магазин"}
        </button>
        <button
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:text-white"
          onClick={cancel}
        >
          Отмена
        </button>
      </div>
    </div>
  )

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase text-white/40">Магазины и цены</div>
          <div className="mt-1 text-xs text-white/30">
            Добавьте все магазины — увидите, где дешевле и где есть в наличии
          </div>
        </div>
        {!adding && editingId === null && (
          <button
            className="flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/40 px-3 py-1.5 text-sm text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/10"
            onClick={startAdd}
          >
            <Icon name="Plus" size={15} />
            Добавить магазин
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {error}
        </div>
      )}

      {offers.length === 0 && !adding && (
        <div className="rounded-lg border border-dashed border-white/10 py-8 text-center text-sm text-white/30">
          Магазины не добавлены
        </div>
      )}

      <div className="space-y-2">
        {offers.map((o) =>
          editingId === o.id ? (
            <div key={o.id}>{editor}</div>
          ) : (
            <div
              key={o.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-white/10 bg-[#161616] px-4 py-3"
            >
              <div className="min-w-[150px] flex-1">
                <div className="flex items-center gap-2 text-sm">
                  {o.shop_url ? (
                    <a
                      href={o.shop_url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[#D4AF37]"
                    >
                      {o.shop_name || "Без названия"}
                    </a>
                  ) : (
                    <span>{o.shop_name || "Без названия"}</span>
                  )}
                  {num(o.price) > 0 && num(o.price) === minPrice && offers.length > 1 && (
                    <span className="rounded bg-[#D4AF37]/15 px-1.5 py-0.5 text-[10px] uppercase text-[#D4AF37]">
                      дешевле
                    </span>
                  )}
                </div>
                {o.shop_address && (
                  <div className="mt-0.5 text-xs text-white/30">{o.shop_address}</div>
                )}
                {o.note && <div className="mt-0.5 text-xs text-white/30">{o.note}</div>}
              </div>

              <div className="whitespace-nowrap text-sm text-[#D4AF37]">
                {num(o.price) > 0 ? `${money(num(o.price))} / ${unit}` : "цена не указана"}
              </div>

              <div className="min-w-[110px] whitespace-nowrap text-xs">
                {o.stock_known ? (
                  num(o.stock) > 0 ? (
                    <span className="text-emerald-400">
                      в наличии {num(o.stock)} {unit}
                    </span>
                  ) : (
                    <span className="text-red-400">нет в наличии</span>
                  )
                ) : (
                  <span className="text-white/30">наличие не указано</span>
                )}
              </div>

              {o.shop_phone && (
                <a
                  href={`tel:${o.shop_phone}`}
                  className="whitespace-nowrap text-xs text-white/50 hover:text-[#D4AF37]"
                >
                  {o.shop_phone}
                </a>
              )}

              <div className="flex items-center gap-1">
                <button
                  className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-[#D4AF37]"
                  title="Изменить магазин"
                  onClick={() => startEdit(o)}
                >
                  <Icon name="Pencil" size={14} />
                </button>
                <DeleteButton onConfirm={() => remove(o.id)} />
              </div>
            </div>
          )
        )}
      </div>

      {adding && <div className="mt-2">{editor}</div>}
    </div>
  )
}

export default MaterialOffers
