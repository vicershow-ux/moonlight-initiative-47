import { ReactNode, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Icon from "@/components/ui/icon"
import type { PromoDesign } from "@/lib/promoTypes"
import { MM_PX, PALETTE, pageSize } from "./formats"
import { SideView } from "./SideView"

const isTransparent = (c: string) => !c || c === "transparent"

export function ColorButton({ value, onChange, title, allowNone }: { value: string; onChange: (v: string) => void; title?: string; allowNone?: boolean }) {
  const [hex, setHex] = useState(value)
  return (
    <Popover onOpenChange={(o) => o && setHex(value)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={title}
          className="h-8 w-8 shrink-0 rounded-md border border-white/20"
          style={{
            background: isTransparent(value)
              ? "repeating-conic-gradient(#555 0 25%, #333 0 50%) 0 0 / 8px 8px"
              : value,
          }}
        />
      </PopoverTrigger>
      <PopoverContent className="w-60 border-white/10 bg-[#1f1f1f] p-3 text-white" align="start">
        {title && <div className="mb-2 text-xs text-white/50">{title}</div>}
        <div className="grid grid-cols-8 gap-1.5">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className={`h-6 w-6 rounded border ${value.toLowerCase() === c.toLowerCase() ? "border-[#D4AF37] ring-1 ring-[#D4AF37]" : "border-white/15"}`}
              style={{ background: c }}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="color"
            value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
          />
          <input
            value={hex}
            onChange={(e) => {
              setHex(e.target.value)
              if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(e.target.value)) onChange(e.target.value)
            }}
            className="w-full rounded-md border border-white/10 bg-[#161616] px-2 py-1.5 text-xs outline-none"
          />
        </div>
        {allowNone && (
          <button type="button" onClick={() => onChange("transparent")} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md bg-white/5 py-1.5 text-xs text-white/70 hover:bg-white/10">
            <Icon name="Ban" size={12} /> Без цвета
          </button>
        )}
      </PopoverContent>
    </Popover>
  )
}

export function ToolBtn({ icon, title, onClick, active, disabled, children }: { icon?: string; title: string; onClick: () => void; active?: boolean; disabled?: boolean; children?: ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-8 min-w-8 items-center justify-center gap-1 rounded-md px-1.5 text-xs transition-colors disabled:opacity-30 ${
        active ? "bg-[#D4AF37] text-[#161616]" : "text-white/75 hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon && <Icon name={icon} size={15} />}
      {children}
    </button>
  )
}

export function NumField({ value, onChange, step = 1, min, max, title, suffix, width = 56 }: { value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number; title: string; suffix?: string; width?: number }) {
  return (
    <label title={title} className="flex h-8 items-center rounded-md border border-white/10 bg-[#161616] pr-1.5 text-xs">
      <input
        type="number"
        value={Number.isFinite(value) ? Math.round(value * 10) / 10 : 0}
        step={step}
        min={min}
        max={max}
        onChange={(e) => {
          const v = parseFloat(e.target.value)
          if (!Number.isNaN(v)) onChange(v)
        }}
        style={{ width }}
        className="h-full bg-transparent px-2 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      {suffix && <span className="text-white/35">{suffix}</span>}
    </label>
  )
}

/** Миниатюра стороны макета */
export function DesignThumb({ design, side = 0, width }: { design: PromoDesign; side?: number; width: number }) {
  const { w, h } = pageSize(design.format, design.orientation)
  const s = width / (w * MM_PX)
  return (
    <div style={{ width, height: h * MM_PX * s, overflow: "hidden", position: "relative" }} className="shadow-lg">
      <div style={{ transform: `scale(${s})`, transformOrigin: "top left", position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
        <SideView side={design.sides[side] || design.sides[0]} w={w} h={h} />
      </div>
    </div>
  )
}
