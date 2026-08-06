import Icon from "@/components/ui/icon"
import { ActItem } from "@/lib/api"
import { formatMoney } from "./constants"

interface ActWorksStepProps {
  items: ActItem[]
  total: number
  error: string
  saving: boolean
  updateField: (i: number, key: "name" | "unit" | "price", value: string) => void
  updateQuantity: (i: number, value: string) => void
  removeItem: (i: number) => void
  addCustomItem: () => void
  goToPreview: () => void
}

export function ActWorksStep({
  items,
  total,
  error,
  saving,
  updateField,
  updateQuantity,
  removeItem,
  addCustomItem,
  goToPreview,
}: ActWorksStepProps) {
  return (
    <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-6">
      <div className="flex items-start justify-between mb-5 gap-4">
        <div>
          <p className="text-base font-semibold">Работы по акту</p>
          <p className="text-xs text-white/40 mt-1">
            Отредактируйте количество, удалите лишнее или добавьте новые услуги.
          </p>
        </div>
        <div className="text-right whitespace-nowrap">
          <p className="text-xs text-white/40">Итого по акту:</p>
          <p className="text-xl font-bold">{formatMoney(total)}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-white/40 py-8 text-center">Работ пока нет — добавьте услугу</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-white/40 border-b border-white/10">
                <th className="text-left font-medium py-2 pr-2">Наименование</th>
                <th className="text-center font-medium py-2 px-2 w-20">Ед.</th>
                <th className="text-center font-medium py-2 px-2 w-24">Кол-во</th>
                <th className="text-right font-medium py-2 px-2 w-28">Цена</th>
                <th className="text-right font-medium py-2 px-2 w-28">Сумма</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0">
                  <td className="py-2 pr-2">
                    <input
                      value={it.name}
                      onChange={(e) => updateField(i, "name", e.target.value)}
                      className="w-full bg-transparent outline-none focus:bg-[#161616] rounded px-1 py-1"
                    />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <input
                      value={it.unit}
                      onChange={(e) => updateField(i, "unit", e.target.value)}
                      className="w-full bg-transparent text-center text-white/60 outline-none focus:bg-[#161616] rounded px-1 py-1"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      min={0}
                      value={it.quantity}
                      onChange={(e) => updateQuantity(i, e.target.value)}
                      className="w-full bg-[#161616] border border-white/10 rounded text-center outline-none focus:border-[#D4AF37]/50 px-1 py-1"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      min={0}
                      value={it.price}
                      onChange={(e) => updateField(i, "price", e.target.value)}
                      className="w-full bg-transparent text-right text-white/70 outline-none focus:bg-[#161616] rounded px-1 py-1"
                    />
                  </td>
                  <td className="py-2 px-2 text-right font-medium whitespace-nowrap">
                    {formatMoney(it.amount)}
                  </td>
                  <td className="py-2 pl-2 text-center">
                    <button
                      onClick={() => removeItem(i)}
                      className="text-white/30 hover:text-red-400 transition-colors"
                      title="Удалить"
                    >
                      <Icon name="X" size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={addCustomItem}
        className="mt-4 inline-flex items-center gap-2 border border-white/15 hover:border-white/30 hover:bg-white/5 transition-colors text-sm px-4 py-2.5 rounded-lg"
      >
        <Icon name="Plus" size={15} />
        Добавить произвольную услугу
      </button>

      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1.5 mt-4">
          <Icon name="CircleAlert" size={15} />
          {error}
        </p>
      )}

      <div className="flex justify-end mt-6">
        <button
          onClick={goToPreview}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-white text-[#161616] text-sm font-medium px-5 py-3 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-60"
        >
          {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : null}
          Предпросмотр документа
          <Icon name="ArrowRight" size={16} />
        </button>
      </div>
    </div>
  )
}

export default ActWorksStep
