import { CSSProperties, ReactNode } from "react"
import { QRCodeSVG } from "qrcode.react"
import Icon from "@/components/ui/icon"
import type { PromoEl, PromoSide } from "@/lib/promoTypes"
import { fontStack } from "./formats"

const mm = (v: number) => `${v}mm`
const CUT = "0.3mm dashed #8a8a8a"

const FILTERS: Record<string, string> = {
  none: "none",
  gray: "grayscale(1)",
  sepia: "sepia(0.85)",
  dark: "brightness(0.55)",
}

export function textStyle(el: Extract<PromoEl, { type: "text" }>): CSSProperties {
  return {
    fontFamily: fontStack(el.font),
    fontSize: `${el.size}pt`,
    color: el.color,
    fontWeight: el.weight || 400,
    fontStyle: el.italic ? "italic" : "normal",
    textDecoration: el.underline ? "underline" : "none",
    textAlign: el.align || "left",
    lineHeight: el.lh || 1.2,
    letterSpacing: el.ls ? `${el.ls}em` : undefined,
    textTransform: el.upper ? "uppercase" : "none",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    outline: "none",
  }
}

export function ElementContent({ el }: { el: PromoEl }): ReactNode {
  switch (el.type) {
    case "text": {
      const justify = el.valign === "middle" ? "center" : el.valign === "bottom" ? "flex-end" : "flex-start"
      return (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: justify }}>
          <div style={textStyle(el)}>{el.text || " "}</div>
        </div>
      )
    }
    case "image":
      return (
        <img
          src={el.src}
          alt=""
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: el.fit || "cover",
            borderRadius: el.radius ? mm(el.radius) : undefined,
            filter: FILTERS[el.filter || "none"],
            display: "block",
          }}
        />
      )
    case "rect":
    case "ellipse":
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: el.fill,
            border: el.stroke && el.sw ? `${el.sw}mm ${el.dashed ? "dashed" : "solid"} ${el.stroke}` : undefined,
            borderRadius: el.type === "ellipse" ? "50%" : el.radius ? mm(el.radius) : undefined,
            boxSizing: "border-box",
          }}
        />
      )
    case "qr":
      return (
        <div style={{ width: "100%", height: "100%", background: el.bg, padding: "6%", boxSizing: "border-box", lineHeight: 0 }}>
          <QRCodeSVG value={el.value || " "} size={512} fgColor={el.fg} bgColor={el.bg} level="M" style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
      )
    case "icon":
      return <Icon name={el.name} color={el.color} strokeWidth={2} style={{ width: "100%", height: "100%", display: "block" }} />
    case "tear":
      return (
        <div style={{ width: "100%", height: "100%", display: "flex", borderTop: CUT, background: el.bg, color: el.color, boxSizing: "border-box" }}>
          {Array.from({ length: Math.max(1, el.count) }).map((_, i) => (
            <div key={i} style={{ flex: 1, borderLeft: i === 0 ? "none" : CUT, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <div style={{ transform: "rotate(-90deg)", whiteSpace: "nowrap", textAlign: "center", lineHeight: 1.2, fontFamily: fontStack("Montserrat") }}>
                <div style={{ fontSize: `${el.size}pt`, fontWeight: 700 }}>{el.text}</div>
                {el.sub && <div style={{ fontSize: `${el.size * 0.65}pt`, opacity: 0.7 }}>{el.sub}</div>}
              </div>
            </div>
          ))}
        </div>
      )
  }
}

export function elementBox(el: PromoEl): CSSProperties {
  return {
    position: "absolute",
    left: mm(el.x),
    top: mm(el.y),
    width: mm(el.w),
    height: mm(el.h),
    transform: el.rot ? `rotate(${el.rot}deg)` : undefined,
    opacity: el.opacity ?? 1,
  }
}

/** Фон стороны: цвет, фото на весь макет и затемнение */
export function SideBackground({ side }: { side: PromoSide }) {
  return (
    <>
      {side.bgImage && (
        <img src={side.bgImage} alt="" draggable={false} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      {!!side.bgImage && !!side.bgDim && <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${side.bgDim})` }} />}
    </>
  )
}

/** Статичная отрисовка стороны в миллиметрах — для превью и печати */
export function SideView({ side, w, h }: { side: PromoSide; w: number; h: number }) {
  return (
    <div style={{ width: mm(w), height: mm(h), background: side.bg, position: "relative", overflow: "hidden" }}>
      <SideBackground side={side} />
      {side.elements.map((el) => (
        <div key={el.id} style={elementBox(el)}>
          <ElementContent el={el} />
        </div>
      ))}
    </div>
  )
}
