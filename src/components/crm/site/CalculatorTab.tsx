import { useMemo, useState } from "react"
import Icon from "@/components/ui/icon"
import { SiteSettings } from "@/lib/api"
import {
  LEVELS,
  ROOM_TYPES,
  LevelKey,
  RoomTypeKey,
  calculate,
  formatMoney,
} from "@/lib/calculator"

interface CalculatorTabProps {
  form: SiteSettings
  update: (field: keyof SiteSettings, value: string) => void
}

export function CalculatorTab({ form, update }: CalculatorTabProps) {
  const [testArea, setTestArea] = useState(55)
  const [testRoom, setTestRoom] = useState<RoomTypeKey>("apartment")
  const [testLevel, setTestLevel] = useState<LevelKey>("standard")

  const preview = useMemo(
    () => calculate(form, testArea, testRoom, testLevel),
    [form, testArea, testRoom, testLevel]
  )

  const inputClass =
    "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
  const labelClass = "text-xs text-white/50 mb-1.5 block"

  const enabled = form.calc_enabled !== false

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-[#1f1f1f] border border-white/10 rounded-lg p-4 flex items-start gap-2.5">
        <Icon name="Info" size={16} className="text-[#D4AF37] mt-0.5 shrink-0" />
        <p className="text-sm text-white/60 leading-relaxed">
          Стоимость считается так: цена за м² для выбранного уровня отделки умножается на коэффициент
          типа помещения и на площадь. Посетителю показывается диапазон −10% / +15% от результата.
        </p>
      </div>

      <label className="flex items-center gap-3 cursor-pointer select-none bg-[#161616] border border-white/10 rounded-lg px-4 py-3.5">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => update("calc_enabled", e.target.checked ? "true" : "false")}
          className="peer sr-only"
        />
        <span className="w-4 h-4 shrink-0 border border-white/30 rounded flex items-center justify-center transition-colors peer-checked:bg-[#D4AF37] peer-checked:border-[#D4AF37]">
          {enabled && <Icon name="Check" size={12} className="text-[#161616]" />}
        </span>
        <span className="text-sm">
          Показывать калькулятор на сайте
          <span className="block text-xs text-white/40 mt-0.5">
            Снимите галочку, чтобы убрать блок с лендинга
          </span>
        </span>
      </label>

      <div className="border-t border-white/10 pt-6 space-y-4">
        <p className="text-sm font-medium text-white/80">Тексты блока</p>
        <div>
          <label className={labelClass}>Надпись над заголовком</label>
          <input
            className={inputClass}
            value={form.calc_eyebrow || ""}
            onChange={(e) => update("calc_eyebrow", e.target.value)}
            placeholder="Расчёт стоимости"
          />
        </div>
        <div>
          <label className={labelClass}>Заголовок</label>
          <input
            className={inputClass}
            value={form.calc_title || ""}
            onChange={(e) => update("calc_title", e.target.value)}
            placeholder="Сколько будет стоить ваш ремонт"
          />
          <p className="text-[11px] text-white/30 mt-1.5">
            Последнее слово автоматически подчёркивается золотой линией
          </p>
        </div>
        <div>
          <label className={labelClass}>Описание</label>
          <textarea
            rows={2}
            className={`${inputClass} resize-none`}
            value={form.calc_description || ""}
            onChange={(e) => update("calc_description", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Примечание под кнопкой</label>
          <textarea
            rows={2}
            className={`${inputClass} resize-none`}
            value={form.calc_note || ""}
            onChange={(e) => update("calc_note", e.target.value)}
          />
          <p className="text-[11px] text-white/30 mt-1.5">
            Важно оставить оговорку, что расчёт не является публичной офертой
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 pt-6">
        <p className="text-sm font-medium text-white/80 mb-1">Цена за квадратный метр</p>
        <p className="text-xs text-white/40 mb-4">Базовая стоимость работ по уровню отделки, ₽/м²</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {LEVELS.map((lv) => (
            <div key={lv.key}>
              <label className={labelClass}>{lv.label}</label>
              <input
                type="number"
                min={0}
                step={100}
                className={inputClass}
                value={String(form[lv.settingsKey] ?? "")}
                onChange={(e) => update(lv.settingsKey, e.target.value)}
                placeholder={String(lv.fallback)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 pt-6">
        <p className="text-sm font-medium text-white/80 mb-1">Коэффициенты типа помещения</p>
        <p className="text-xs text-white/40 mb-4">
          1 — базовая цена, 1.6 — дороже на 60%, 0.95 — дешевле на 5%
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {ROOM_TYPES.map((rt) => (
            <div key={rt.key}>
              <label className={labelClass}>
                {rt.label}
                <span className="text-white/25 ml-1.5">{rt.hint}</span>
              </label>
              <input
                type="number"
                min={0.1}
                step={0.05}
                className={inputClass}
                value={String(form[rt.settingsKey] ?? "")}
                onChange={(e) => update(rt.settingsKey, e.target.value)}
                placeholder={String(rt.fallback)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 pt-6">
        <p className="text-sm font-medium text-white/80 mb-4">Проверить расчёт</p>

        <div className="bg-[#161616] border border-white/10 rounded-lg p-4 space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Площадь, м²</label>
              <input
                type="number"
                min={2}
                max={300}
                className="w-full bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"
                value={testArea}
                onChange={(e) => setTestArea(Number(e.target.value))}
              />
            </div>
            <div>
              <label className={labelClass}>Помещение</label>
              <select
                className="w-full bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"
                value={testRoom}
                onChange={(e) => setTestRoom(e.target.value as RoomTypeKey)}
              >
                {ROOM_TYPES.map((rt) => (
                  <option key={rt.key} value={rt.key}>
                    {rt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Отделка</label>
              <select
                className="w-full bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"
                value={testLevel}
                onChange={(e) => setTestLevel(e.target.value as LevelKey)}
              >
                {LEVELS.map((lv) => (
                  <option key={lv.key} value={lv.key}>
                    {lv.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-end justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-white/40 mb-1">Посетитель увидит</p>
              <p className="text-xl font-medium">
                {formatMoney(preview.totalMin)} — {formatMoney(preview.totalMax)} ₽
              </p>
            </div>
            <p className="text-xs text-white/40">
              {formatMoney(preview.basePrice)} ₽/м² × {preview.coefficient} ={" "}
              <span className="text-[#D4AF37]">{formatMoney(preview.pricePerMeter)} ₽/м²</span>
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-white/30">
        Не забудьте нажать «Сохранить» вверху страницы.
      </p>
    </div>
  )
}