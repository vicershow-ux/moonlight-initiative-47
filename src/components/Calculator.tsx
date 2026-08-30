import { useMemo, useState } from "react"
import Icon from "@/components/ui/icon"
import { HighlightedText } from "./HighlightedText"
import { LeadForm } from "./LeadForm"
import { useSiteContent } from "@/hooks/useSiteContent"
import { reachGoal } from "@/lib/metrika"
import {
  LEVELS,
  ROOM_TYPES,
  LevelKey,
  RoomTypeKey,
  areaLimits,
  buildCalcComment,
  calculate,
  formatMoney,
} from "@/lib/calculator"

export function Calculator() {
  const { content } = useSiteContent()
  const s = content?.settings

  const [area, setArea] = useState(55)
  const [roomType, setRoomType] = useState<RoomTypeKey>("apartment")
  const [level, setLevel] = useState<LevelKey>("standard")
  const [formOpen, setFormOpen] = useState(false)

  const result = useMemo(() => calculate(s, area, roomType, level), [s, area, roomType, level])
  const activeLevel = LEVELS.find((l) => l.key === level) || LEVELS[1]
  const limits = areaLimits(roomType)

  const selectRoomType = (key: RoomTypeKey) => {
    setRoomType(key)
    const next = areaLimits(key)
    setArea((prev) => (prev < next.min || prev > next.max ? next.preset : prev))
  }

  if (s && s.calc_enabled === false) return null

  const eyebrow = s?.calc_eyebrow || "Расчёт стоимости"
  const title = s?.calc_title || "Сколько будет стоить ваш ремонт"
  const description =
    s?.calc_description ||
    "Укажите площадь, тип помещения и уровень отделки — покажем ориентировочную стоимость работ и отправим расчёт на согласование."
  const note =
    s?.calc_note ||
    "Расчёт предварительный и не является публичной офертой. Точная смета составляется после бесплатного замера на объекте."

  const titleWords = title.trim().split(" ")
  const lastWord = titleWords.length > 1 ? titleWords.pop() : ""
  const titleStart = titleWords.join(" ")

  return (
    <section id="calculator" className="py-32 md:py-29 bg-secondary/40">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-3xl mb-14">
          <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6">{eyebrow}</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.15] tracking-tight mb-6 text-balance">
            {titleStart} {lastWord && <HighlightedText>{lastWord}</HighlightedText>}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 items-start">
          <div className="space-y-10">
            <div>
              <div className="flex items-end justify-between mb-5 gap-4">
                <label htmlFor="calc-area" className="text-sm font-medium">
                  Площадь помещения
                </label>
                <div className="flex items-baseline gap-1.5">
                  <input
                    id="calc-area"
                    type="number"
                    min={limits.min}
                    max={limits.max}
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    onBlur={() =>
                      setArea((v) => Math.min(Math.max(v || limits.preset, limits.min), limits.max))
                    }
                    className="w-20 bg-background border border-border rounded-lg px-3 py-1.5 text-right text-lg font-medium outline-none focus:border-[#D4AF37] transition-colors"
                  />
                  <span className="text-muted-foreground text-sm">м²</span>
                </div>
              </div>
              <input
                type="range"
                min={limits.min}
                max={limits.max}
                step={1}
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                aria-label="Площадь помещения в квадратных метрах"
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-border accent-[#D4AF37]
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D4AF37]
                  [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md
                  [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:border-0
                  [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#D4AF37]"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{limits.min} м²</span>
                <span>{limits.max} м²</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-4">Тип помещения</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ROOM_TYPES.map((rt) => (
                  <button
                    key={rt.key}
                    onClick={() => selectRoomType(rt.key)}
                    aria-pressed={roomType === rt.key}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      roomType === rt.key
                        ? "border-[#D4AF37] bg-[#D4AF37]/10"
                        : "border-border bg-background hover:border-[#D4AF37]/40"
                    }`}
                  >
                    <Icon
                      name={rt.icon}
                      size={20}
                      className={roomType === rt.key ? "text-[#D4AF37]" : "text-muted-foreground"}
                    />
                    <p className="text-sm font-medium mt-2.5">{rt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{rt.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-4">Уровень отделки</p>
              <div className="grid sm:grid-cols-3 gap-3">
                {LEVELS.map((lv) => (
                  <button
                    key={lv.key}
                    onClick={() => setLevel(lv.key)}
                    aria-pressed={level === lv.key}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      level === lv.key
                        ? "border-[#D4AF37] bg-[#D4AF37]/10"
                        : "border-border bg-background hover:border-[#D4AF37]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{lv.label}</p>
                      {level === lv.key && <Icon name="Check" size={15} className="text-[#D4AF37]" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{lv.hint}</p>
                  </button>
                ))}
              </div>

              <div className="mt-4 bg-background border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-2.5">
                  Что входит в «{activeLevel.label.toLowerCase()}» ремонт:
                </p>
                <ul className="space-y-1.5">
                  {activeLevel.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Icon name="Check" size={14} className="text-[#D4AF37] mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-28">
            <div className="bg-foreground text-primary-foreground rounded-2xl p-6 md:p-7">
              {formOpen ? (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-sm font-medium">Отправить расчёт</p>
                    <button
                      onClick={() => setFormOpen(false)}
                      className="text-primary-foreground/50 hover:text-primary-foreground transition-colors"
                      aria-label="Вернуться к расчёту"
                    >
                      <Icon name="X" size={17} />
                    </button>
                  </div>

                  <div className="bg-primary-foreground/5 rounded-xl p-3.5 mb-5 text-sm">
                    <p className="text-primary-foreground/60 text-xs mb-1">Ваш расчёт</p>
                    <p className="font-medium">
                      {result.roomLabel}, {result.area} м², {result.levelLabel.toLowerCase()}
                    </p>
                    <p className="text-[#D4AF37] font-medium mt-1">
                      {formatMoney(result.totalMin)} — {formatMoney(result.totalMax)} ₽
                    </p>
                  </div>

                  <LeadForm
                    formName="Калькулятор — расчёт"
                    presetComment={buildCalcComment(result)}
                    commentPlaceholder="Адрес, сроки, пожелания (необязательно)"
                    submitLabel="Отправить расчёт"
                    successText="Проверим расчёт и свяжемся с вами в течение 24 часов"
                  />
                </>
              ) : (
                <>
                  <p className="text-primary-foreground/60 text-xs tracking-[0.2em] uppercase mb-4">
                    Предварительная стоимость
                  </p>

                  <div className="mb-1 flex flex-col">
                    <span className="text-3xl md:text-4xl font-medium tracking-tight whitespace-nowrap">
                      {formatMoney(result.totalMin)}
                    </span>
                    <span className="text-3xl md:text-4xl font-medium tracking-tight whitespace-nowrap">
                      <span className="text-primary-foreground/50">— </span>
                      {formatMoney(result.totalMax)}
                      <span className="text-primary-foreground/60 text-xl ml-1.5">₽</span>
                    </span>
                  </div>

                  <p className="text-primary-foreground/50 text-sm mb-6">
                    от {formatMoney(result.pricePerMeter)} ₽ за м²
                  </p>

                  <div className="space-y-2.5 py-5 border-y border-primary-foreground/10 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-primary-foreground/50">Помещение</span>
                      <span className="text-right">{result.roomLabel}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-primary-foreground/50">Площадь</span>
                      <span>{result.area} м²</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-primary-foreground/50">Отделка</span>
                      <span className="text-right">{result.levelLabel}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setFormOpen(true)
                      reachGoal("calc_used", {
                        tip: result.roomLabel,
                        uroven: result.levelLabel,
                        ploshad: result.area,
                      })
                    }}
                    className="w-full mt-6 inline-flex items-center justify-center gap-2.5 bg-[#D4AF37] text-foreground px-6 py-4 rounded-full text-sm font-medium tracking-wide hover:bg-[#B8860B] transition-colors group"
                  >
                    Отправить расчёт заявкой
                    <Icon
                      name="ArrowRight"
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>

                  <p className="text-primary-foreground/40 text-xs leading-relaxed mt-5">{note}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}