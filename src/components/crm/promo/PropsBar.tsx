import { useRef } from "react"
import Icon from "@/components/ui/icon"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PromoEl, TextEl } from "@/lib/promoTypes"
import { FONTS, fontStack } from "./formats"
import { ColorButton, NumField, ToolBtn } from "./ui"

interface Props {
  el: PromoEl
  onChange: (patch: Partial<PromoEl>) => void
  onAction: (a: "delete" | "duplicate" | "front" | "back" | "lock" | "center-h" | "center-v" | "fit") => void
  onReplaceImage: (file: File) => void
}

const Sep = () => <div className="mx-1 h-6 w-px bg-white/10" />

export function PropsBar({ el, onChange, onAction, onReplaceImage }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const t = el as TextEl
  const set = <K extends keyof PromoEl>(k: K, v: PromoEl[K]) => onChange({ [k]: v } as Partial<PromoEl>)

  return (
    <div className="flex flex-wrap items-center gap-1">
      {el.type === "text" && (
        <>
          <Select value={t.font} onValueChange={(v) => onChange({ font: v } as Partial<PromoEl>)}>
            <SelectTrigger className="h-8 w-40 border-white/10 bg-[#161616] text-xs" style={{ fontFamily: fontStack(t.font) }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-80 border-white/10 bg-[#1f1f1f] text-white">
              {FONTS.map((f) => (
                <SelectItem key={f.family} value={f.family} style={{ fontFamily: fontStack(f.family) }}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <NumField title="Размер шрифта, pt" value={t.size} step={0.5} min={3} onChange={(v) => onChange({ size: Math.max(3, v) } as Partial<PromoEl>)} suffix="pt" width={44} />
          <ColorButton value={t.color} onChange={(v) => onChange({ color: v } as Partial<PromoEl>)} title="Цвет текста" />
          <Sep />
          <ToolBtn icon="Bold" title="Жирный" active={(t.weight || 400) >= 700} onClick={() => onChange({ weight: (t.weight || 400) >= 700 ? 400 : 700 } as Partial<PromoEl>)} />
          <ToolBtn icon="Italic" title="Курсив" active={!!t.italic} onClick={() => onChange({ italic: !t.italic } as Partial<PromoEl>)} />
          <ToolBtn icon="Underline" title="Подчёркнутый" active={!!t.underline} onClick={() => onChange({ underline: !t.underline } as Partial<PromoEl>)} />
          <ToolBtn icon="CaseUpper" title="ЗАГЛАВНЫЕ" active={!!t.upper} onClick={() => onChange({ upper: !t.upper } as Partial<PromoEl>)} />
          <Sep />
          {(["left", "center", "right"] as const).map((a) => (
            <ToolBtn key={a} icon={a === "left" ? "AlignLeft" : a === "center" ? "AlignCenter" : "AlignRight"} title="Выравнивание" active={(t.align || "left") === a} onClick={() => onChange({ align: a } as Partial<PromoEl>)} />
          ))}
          {(["top", "middle", "bottom"] as const).map((a) => (
            <ToolBtn key={a} icon={a === "top" ? "AlignVerticalJustifyStart" : a === "middle" ? "AlignVerticalJustifyCenter" : "AlignVerticalJustifyEnd"} title="По вертикали" active={(t.valign || "top") === a} onClick={() => onChange({ valign: a } as Partial<PromoEl>)} />
          ))}
          <NumField title="Межстрочный интервал" value={t.lh || 1.2} step={0.05} min={0.7} onChange={(v) => onChange({ lh: v } as Partial<PromoEl>)} suffix="↕" width={40} />
          <NumField title="Расстояние между буквами" value={t.ls || 0} step={0.02} onChange={(v) => onChange({ ls: v } as Partial<PromoEl>)} suffix="↔" width={40} />
          <Sep />
        </>
      )}

      {el.type === "image" && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              e.target.value = ""
              if (f) onReplaceImage(f)
            }}
          />
          <ToolBtn icon="RefreshCw" title="Заменить фото" onClick={() => fileRef.current?.click()}>Заменить</ToolBtn>
          <ToolBtn icon="Crop" title="Заполнить рамку" active={(el.fit || "cover") === "cover"} onClick={() => set("fit" as never, "cover" as never)} />
          <ToolBtn icon="Scan" title="Вписать целиком" active={el.fit === "contain"} onClick={() => set("fit" as never, "contain" as never)} />
          <ToolBtn icon="Maximize" title="Растянуть на весь макет" onClick={() => onAction("fit")}>На весь макет</ToolBtn>
          <Select value={el.filter || "none"} onValueChange={(v) => onChange({ filter: v } as Partial<PromoEl>)}>
            <SelectTrigger className="h-8 w-32 border-white/10 bg-[#161616] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#1f1f1f] text-white">
              <SelectItem value="none">Без фильтра</SelectItem>
              <SelectItem value="gray">Чёрно-белое</SelectItem>
              <SelectItem value="sepia">Сепия</SelectItem>
              <SelectItem value="dark">Затемнить</SelectItem>
            </SelectContent>
          </Select>
          <NumField title="Скругление углов, мм" value={el.radius || 0} step={0.5} min={0} onChange={(v) => onChange({ radius: v } as Partial<PromoEl>)} suffix="◜" width={36} />
          <Sep />
        </>
      )}

      {(el.type === "rect" || el.type === "ellipse") && (
        <>
          <ColorButton value={el.fill} onChange={(v) => onChange({ fill: v } as Partial<PromoEl>)} title="Заливка" allowNone />
          <ColorButton value={el.stroke || "transparent"} onChange={(v) => onChange({ stroke: v, sw: el.sw || 0.4 } as Partial<PromoEl>)} title="Обводка" allowNone />
          <NumField title="Толщина обводки, мм" value={el.sw || 0} step={0.1} min={0} onChange={(v) => onChange({ sw: v } as Partial<PromoEl>)} suffix="мм" width={36} />
          <ToolBtn icon="SeparatorHorizontal" title="Пунктир" active={!!el.dashed} onClick={() => onChange({ dashed: !el.dashed } as Partial<PromoEl>)} />
          {el.type === "rect" && <NumField title="Скругление, мм" value={el.radius || 0} step={0.5} min={0} onChange={(v) => onChange({ radius: v } as Partial<PromoEl>)} suffix="◜" width={36} />}
          <Sep />
        </>
      )}

      {el.type === "qr" && (
        <>
          <input
            value={el.value}
            onChange={(e) => onChange({ value: e.target.value } as Partial<PromoEl>)}
            placeholder="Ссылка"
            className="h-8 w-56 rounded-md border border-white/10 bg-[#161616] px-2 text-xs outline-none focus:border-[#D4AF37]/50"
          />
          <ColorButton value={el.fg} onChange={(v) => onChange({ fg: v } as Partial<PromoEl>)} title="Цвет QR" />
          <ColorButton value={el.bg} onChange={(v) => onChange({ bg: v } as Partial<PromoEl>)} title="Фон QR" allowNone />
          <Sep />
        </>
      )}

      {el.type === "icon" && (
        <>
          <ColorButton value={el.color} onChange={(v) => onChange({ color: v } as Partial<PromoEl>)} title="Цвет иконки" />
          <Sep />
        </>
      )}

      {el.type === "tear" && (
        <>
          <input value={el.text} onChange={(e) => onChange({ text: e.target.value } as Partial<PromoEl>)} className="h-8 w-40 rounded-md border border-white/10 bg-[#161616] px-2 text-xs outline-none" title="Текст полоски" />
          <input value={el.sub} onChange={(e) => onChange({ sub: e.target.value } as Partial<PromoEl>)} className="h-8 w-28 rounded-md border border-white/10 bg-[#161616] px-2 text-xs outline-none" title="Вторая строка" />
          <NumField title="Количество полосок" value={el.count} min={2} max={16} onChange={(v) => onChange({ count: Math.min(16, Math.max(2, Math.round(v))) } as Partial<PromoEl>)} suffix="шт" width={34} />
          <NumField title="Размер шрифта" value={el.size} step={0.5} min={5} onChange={(v) => onChange({ size: v } as Partial<PromoEl>)} suffix="pt" width={36} />
          <ColorButton value={el.color} onChange={(v) => onChange({ color: v } as Partial<PromoEl>)} title="Цвет текста" />
          <ColorButton value={el.bg} onChange={(v) => onChange({ bg: v } as Partial<PromoEl>)} title="Фон полосок" />
          <Sep />
        </>
      )}

      <label title="Прозрачность" className="flex h-8 items-center gap-1.5 px-1 text-xs text-white/50">
        <Icon name="Blend" size={14} />
        <input type="range" min={0.1} max={1} step={0.05} value={el.opacity ?? 1} onChange={(e) => set("opacity", parseFloat(e.target.value))} className="w-16 accent-[#D4AF37]" />
      </label>
      <NumField title="Поворот, °" value={el.rot || 0} step={1} onChange={(v) => set("rot", v)} suffix="°" width={36} />
      <Sep />
      <ToolBtn icon="AlignCenterVertical" title="По центру по горизонтали" onClick={() => onAction("center-h")} />
      <ToolBtn icon="AlignCenterHorizontal" title="По центру по вертикали" onClick={() => onAction("center-v")} />
      <ToolBtn icon="BringToFront" title="На передний план" onClick={() => onAction("front")} />
      <ToolBtn icon="SendToBack" title="На задний план" onClick={() => onAction("back")} />
      <ToolBtn icon="Copy" title="Дублировать (Ctrl+D)" onClick={() => onAction("duplicate")} />
      <ToolBtn icon={el.locked ? "Lock" : "LockOpen"} title={el.locked ? "Разблокировать" : "Заблокировать"} active={!!el.locked} onClick={() => onAction("lock")} />
      <ToolBtn icon="Trash2" title="Удалить (Delete)" onClick={() => onAction("delete")} />
    </div>
  )
}

export default PropsBar
