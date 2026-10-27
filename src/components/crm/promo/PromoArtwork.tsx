import { CSSProperties } from "react"
import { QRCodeSVG } from "qrcode.react"
import { PromoData, PromoKind } from "@/lib/api"
import { CARD, DEFAULT_LOGO, cardSheet, sheetSize, themeOf } from "./promoConfig"

const mm = (v: number) => `${v}mm`
const FONT = "'Montserrat', Arial, sans-serif"
const CUT = "0.3mm dashed #8a8a8a"

function Qr({ url, size, fg, bg }: { url: string; size: number; fg: string; bg: string }) {
  return (
    <div style={{ background: bg, padding: mm(size * 0.06), borderRadius: mm(1.5), lineHeight: 0, flexShrink: 0 }}>
      <QRCodeSVG value={url} size={512} fgColor={fg} bgColor={bg} level="M" style={{ width: mm(size), height: mm(size), display: "block" }} />
    </div>
  )
}

function lines(text?: string) {
  return (text || "").split("\n").map((l) => l.trim()).filter(Boolean)
}

/** Объявление А4: шапка, фото, преимущества, предложение, QR и отрывные полоски с телефоном */
export function Flyer({ data }: { data: PromoData }) {
  const t = themeOf(data)
  const { w, h } = sheetSize("flyer", data)
  const landscape = data.orientation === "landscape"
  const pad = 14
  const tabs = data.tear_off ? (landscape ? 10 : 8) : 0
  const tabH = data.tear_off ? 34 : 0
  const items = lines(data.bullets)
  const showQr = data.qr_enabled && data.qr_url

  const wrap: CSSProperties = {
    width: mm(w),
    height: mm(h),
    background: t.bg,
    color: t.text,
    fontFamily: FONT,
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  }

  const body = (
    <div style={{ display: "flex", flexDirection: landscape ? "row" : "column", gap: mm(8), flex: 1, minHeight: 0 }}>
      {data.image && (
        <div
          style={{
            flex: landscape ? "0 0 45%" : "0 0 32%",
            borderRadius: mm(3),
            backgroundImage: `url(${data.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: mm(5), minHeight: 0 }}>
        {items.length > 0 && (
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: mm(3) }}>
            {items.map((b, i) => (
              <li key={i} style={{ display: "flex", gap: mm(3), alignItems: "flex-start", fontSize: "15pt", lineHeight: 1.25, fontWeight: 500 }}>
                <span style={{ width: mm(3), height: mm(3), marginTop: mm(1.6), borderRadius: "50%", background: t.accent, flexShrink: 0 }} />
                {b}
              </li>
            ))}
          </ul>
        )}
        {data.offer && (
          <div style={{ marginTop: "auto", background: t.box, border: `0.4mm solid ${t.line}`, borderRadius: mm(3), padding: `${mm(4)} ${mm(5)}`, fontSize: "17pt", fontWeight: 700, color: t.accent }}>
            {data.offer}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div style={wrap}>
      <div style={{ flex: 1, minHeight: 0, padding: mm(pad), paddingBottom: mm(8), display: "flex", flexDirection: "column", gap: mm(7), boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: mm(6) }}>
          <img src={data.logo || DEFAULT_LOGO} alt="" style={{ height: mm(16), maxWidth: mm(60), objectFit: "contain" }} />
          {data.website && <span style={{ fontSize: "12pt", color: t.muted, fontWeight: 500 }}>{data.website}</span>}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: landscape ? "36pt" : "40pt", lineHeight: 1.05, fontWeight: 800, letterSpacing: "-0.01em" }}>{data.headline}</h1>
          {data.subtitle && <p style={{ margin: `${mm(4)} 0 0`, fontSize: "16pt", color: t.accent, fontWeight: 600 }}>{data.subtitle}</p>}
        </div>
        {body}
        <div style={{ display: "flex", alignItems: "center", gap: mm(6), borderTop: `0.4mm solid ${t.line}`, paddingTop: mm(6) }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "11pt", color: t.muted, marginBottom: mm(1) }}>Звоните или пишите</div>
            <div style={{ fontSize: "28pt", fontWeight: 800, whiteSpace: "nowrap" }}>{data.phone}</div>
          </div>
          {showQr && (
            <div style={{ display: "flex", alignItems: "center", gap: mm(3) }}>
              {data.qr_caption && <span style={{ maxWidth: mm(32), fontSize: "10pt", color: t.muted, textAlign: "right", lineHeight: 1.3 }}>{data.qr_caption}</span>}
              <Qr url={data.qr_url!} size={30} fg="#161616" bg="#ffffff" />
            </div>
          )}
        </div>
      </div>
      {tabs > 0 && (
        <div style={{ height: mm(tabH), display: "flex", borderTop: CUT, background: "#ffffff", color: "#161616", flexShrink: 0 }}>
          {Array.from({ length: tabs }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                borderLeft: i === 0 ? "none" : CUT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <div style={{ transform: "rotate(-90deg)", whiteSpace: "nowrap", textAlign: "center", lineHeight: 1.2 }}>
                <div style={{ fontSize: "10pt", fontWeight: 700 }}>{data.phone}</div>
                <div style={{ fontSize: "6.5pt", color: "#555" }}>{data.website || "Ремонт"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Одна визитка 90×50 (или 50×90) мм */
export function BusinessCard({ data }: { data: PromoData }) {
  const t = themeOf(data)
  const vertical = data.orientation === "portrait"
  const w = vertical ? CARD.h : CARD.w
  const h = vertical ? CARD.w : CARD.h
  const showQr = data.qr_enabled && data.qr_url
  const qrSize = vertical ? 20 : 17

  const contacts = [data.phone, data.email, data.website, data.address].filter(Boolean)

  return (
    <div
      style={{
        width: mm(w),
        height: mm(h),
        background: t.bg,
        color: t.text,
        fontFamily: FONT,
        boxSizing: "border-box",
        padding: mm(5),
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        textAlign: vertical ? "center" : "left",
        alignItems: vertical ? "center" : "stretch",
      }}
    >
      <img src={data.logo || DEFAULT_LOGO} alt="" style={{ height: mm(vertical ? 11 : 8), maxWidth: mm(vertical ? 38 : 34), objectFit: "contain", alignSelf: vertical ? "center" : "flex-start" }} />
      <div style={{ marginTop: mm(vertical ? 5 : 2.5) }}>
        <div style={{ fontSize: vertical ? "10.5pt" : "11pt", fontWeight: 700, lineHeight: 1.15 }}>{data.name}</div>
        {data.role && <div style={{ fontSize: "6.5pt", color: t.accent, fontWeight: 600, marginTop: mm(0.8), lineHeight: 1.25 }}>{data.role}</div>}
      </div>
      <div style={{ marginTop: "auto", display: "flex", flexDirection: vertical ? "column" : "row", alignItems: vertical ? "center" : "flex-end", gap: mm(3) }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: mm(0.6), minWidth: 0 }}>
          {contacts.map((c, i) => (
            <div key={i} style={{ fontSize: i === 0 ? "9pt" : "6.5pt", fontWeight: i === 0 ? 700 : 400, color: i === 0 ? t.text : t.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {c}
            </div>
          ))}
        </div>
        {showQr && <Qr url={data.qr_url!} size={qrSize} fg="#161616" bg="#ffffff" />}
      </div>
    </div>
  )
}

/** Лист А4 с визитками и пунктиром для отреза на всю ширину и высоту листа */
export function CardSheet({ data }: { data: PromoData }) {
  const s = cardSheet(data.orientation)
  const xs = Array.from({ length: s.cols + 1 }, (_, i) => s.x0 + i * s.cw)
  const ys = Array.from({ length: s.rows + 1 }, (_, i) => s.y0 + i * s.ch)

  return (
    <div style={{ width: mm(s.sheetW), height: mm(s.sheetH), background: "#ffffff", position: "relative", overflow: "hidden" }}>
      {Array.from({ length: s.rows * s.cols }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: mm(s.x0 + (i % s.cols) * s.cw), top: mm(s.y0 + Math.floor(i / s.cols) * s.ch) }}>
          <BusinessCard data={data} />
        </div>
      ))}
      {xs.map((x, i) => (
        <div key={`x${i}`} style={{ position: "absolute", left: mm(x), top: 0, bottom: 0, borderLeft: CUT, marginLeft: "-0.15mm" }} />
      ))}
      {ys.map((y, i) => (
        <div key={`y${i}`} style={{ position: "absolute", top: mm(y), left: 0, right: 0, borderTop: CUT, marginTop: "-0.15mm" }} />
      ))}
      <div style={{ position: "absolute", right: mm(4), bottom: mm(2), fontFamily: FONT, fontSize: "6pt", color: "#999" }}>
        ✂ Режьте по пунктиру · {s.rows * s.cols} визиток {CARD.w}×{CARD.h} мм
      </div>
    </div>
  )
}

export function PromoArtwork({ kind, data }: { kind: PromoKind; data: PromoData }) {
  return kind === "card" ? <CardSheet data={data} /> : <Flyer data={data} />
}
