import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { materialsApi } from "@/lib/api"

const UNITS = ["шт", "м²", "м", "м.п.", "м³", "кг", "т", "л", "уп", "рул", "меш", "компл"]

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"

const labelCls = "mb-1.5 block text-xs text-white/50"

export default function MaterialCreate() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    category: "",
    unit: "шт",
    price: "",
    shop_name: "",
    shop_address: "",
    shop_phone: "",
    shop_url: "",
    note: "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const set = (k: string, v: string) => setForm({ ...form, [k]: v })

  const save = async () => {
    setError("")
    setSaving(true)
    try {
      await materialsApi.create({ ...form, price: Number(form.price || 0) })
      navigate("/cabinet/materials")
    } catch (e) {
      setError((e as Error)?.message || "Не удалось сохранить материал")
    } finally {
      setSaving(false)
    }
  }

  return (
    <CrmLayout title="Добавление материала" subtitle="Новая позиция в справочнике материалов">
      <Link
        to="/cabinet/materials"
        className="mb-2 inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white"
      >
        <Icon name="ArrowLeft" size={15} />
        Назад к списку
      </Link>

      {error && (
        <div className="mb-4 max-w-4xl rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="max-w-4xl rounded-xl border border-white/10 bg-[#1f1f1f] p-6">
        <div className="mb-5 text-xs uppercase text-white/40">Материал</div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>Название материала</label>
            <input
              className={inputCls}
              placeholder="Например: Гипсокартон Knauf 12.5 мм"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Категория</label>
            <input
              className={inputCls}
              placeholder="Например: Черновые материалы"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Единица измерения</label>
            <select
              className={inputCls}
              value={form.unit}
              onChange={(e) => set("unit", e.target.value)}
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Цена за единицу, ₽</label>
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
        </div>

        <div className="mb-5 mt-7 text-xs uppercase text-white/40">Магазин</div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
            <label className={labelCls}>Адрес магазина</label>
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
          <div>
            <label className={labelCls}>Сайт или ссылка на товар</label>
            <input
              className={inputCls}
              placeholder="https://"
              value={form.shop_url}
              onChange={(e) => set("shop_url", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Примечание</label>
            <input
              className={inputCls}
              placeholder="Необязательно"
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
            />
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            className="flex items-center gap-2 rounded-lg bg-[#D4AF37] px-5 py-2.5 text-sm text-[#161616] transition-colors hover:bg-[#B8860B] disabled:opacity-40"
            onClick={save}
            disabled={form.name.trim().length < 2 || saving}
          >
            <Icon name={saving ? "Loader2" : "Check"} size={16} className={saving ? "animate-spin" : ""} />
            Сохранить материал
          </button>
          <Link
            to="/cabinet/materials"
            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/60 transition-colors hover:text-white"
          >
            Отмена
          </Link>
        </div>
      </div>
    </CrmLayout>
  )
}
