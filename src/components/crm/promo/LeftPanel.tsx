import { ChangeEvent, useRef, useState } from "react"
import Icon from "@/components/ui/icon"
import type { PromoDesign, PromoEl, PromoSide } from "@/lib/promoTypes"
import type { PromoAsset, PromoAssetKind } from "@/lib/api"
import { ICONS, PHOTOS, uid } from "./formats"
import { Contacts, TEMPLATES } from "./templates"
import { ColorButton, DesignThumb } from "./ui"

export type PanelTab = "templates" | "text" | "photo" | "bg" | "shapes" | "qr"

export const TABS: { id: PanelTab; label: string; icon: string }[] = [
  { id: "templates", label: "Шаблоны", icon: "LayoutTemplate" },
  { id: "text", label: "Текст", icon: "Type" },
  { id: "photo", label: "Фото", icon: "Image" },
  { id: "bg", label: "Фон", icon: "PaintBucket" },
  { id: "shapes", label: "Элементы", icon: "Shapes" },
  { id: "qr", label: "QR-код", icon: "QrCode" },
]

interface Props {
  tab: PanelTab
  design: PromoDesign
  side: PromoSide
  pageW: number
  pageH: number
  contacts: Contacts
  uploads: PromoAsset[]
  uploading: boolean
  onUpload: (file: File, kind?: PromoAssetKind) => Promise<string | null>
  onRemoveAsset: (a: PromoAsset) => void
  onToggleAssetKind: (a: PromoAsset) => void
  onAdd: (el: PromoEl) => void
  onSide: (patch: Partial<PromoSide>) => void
  onTemplate: (d: PromoDesign) => void
}

const card = "rounded-lg border border-white/10 bg-[#161616] hover:border-[#D4AF37]/60 transition-colors"

export function LeftPanel({ tab, design, side, pageW, pageH, contacts, uploads, uploading, onUpload, onRemoveAsset, onToggleAssetKind, onAdd, onSide, onTemplate }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const bgFileRef = useRef<HTMLInputElement>(null)
  const logoFileRef = useRef<HTMLInputElement>(null)
  const [qrValue, setQrValue] = useState(`https://${contacts.website}`)
  const k = Math.min(pageW, pageH) / 50
  const isCard = design.format === "card"

  const center = (w: number, h: number) => ({ x: Math.round((pageW - w) / 2), y: Math.round((pageH - h) / 2), w, h })

  const addText = (text: string, size: number, weight: number, font = "Montserrat") => {
    const s = size * (isCard ? 1 : 2.6)
    const w = Math.min(pageW - 8, (text.length * s * 0.55 * 25.4) / 72 + 4)
    const h = ((s * 1.3 * 25.4) / 72) * text.split("\n").length + 1
    const color = side.bg === "#ffffff" || side.bg === "#f5f1e8" ? "#161616" : "#ffffff"
    onAdd({ id: uid(), type: "text", text, font, size: s, weight, color, align: "left", lh: 1.2, ...center(w, h) })
  }

  const addImage = (src: string) => {
    const w = pageW * 0.5
    onAdd({ id: uid(), type: "image", src, fit: "cover", ...center(w, w * 0.66) })
  }

  const addLogo = (src: string) => onAdd({ id: uid(), type: "image", src, fit: "contain", ...center(20 * k, 12 * k) })

  const pickFile = async (e: ChangeEvent<HTMLInputElement>, mode: "photo" | "bg" | "logo") => {
    const files = Array.from(e.target.files || [])
    e.target.value = ""
    for (const [i, f] of files.entries()) {
      const url = await onUpload(f, mode === "logo" ? "logo" : "photo")
      if (!url || i > 0) continue
      if (mode === "bg") onSide({ bgImage: url })
      else if (mode === "logo") addLogo(url)
      else addImage(url)
    }
  }

  const photos = uploads.filter((u) => u.kind !== "logo")
  const logos = uploads.filter((u) => u.kind === "logo")

  const assetTile = (a: PromoAsset, onPick: () => void, contain = false) => (
    <div key={a.id} className={`${card} group relative aspect-square overflow-hidden`}>
      <button type="button" onClick={onPick} className={`h-full w-full ${contain ? "bg-[repeating-conic-gradient(#2a2a2a_0_25%,#202020_0_50%)] bg-[length:12px_12px] p-1.5" : ""}`} title={a.name || "Добавить на макет"}>
        <img src={a.url} alt="" className={`h-full w-full ${contain ? "object-contain" : "object-cover"}`} loading="lazy" />
      </button>
      <div className="absolute right-1 top-1 hidden gap-1 group-hover:flex">
        <button type="button" onClick={() => onToggleAssetKind(a)} title={a.kind === "logo" ? "Перенести в фото" : "Перенести в логотипы"} className="rounded bg-black/70 p-1 text-white/80 hover:text-[#D4AF37]">
          <Icon name={a.kind === "logo" ? "Image" : "BadgeCheck"} size={12} />
        </button>
        <button type="button" onClick={() => onRemoveAsset(a)} title="Удалить из библиотеки" className="rounded bg-black/70 p-1 text-white/80 hover:text-red-400">
          <Icon name="Trash2" size={12} />
        </button>
      </div>
    </div>
  )

  if (tab === "templates") {
    const list = TEMPLATES.filter((t) => (isCard ? t.kind === "card" : t.kind === "flyer"))
    return (
      <div className="space-y-3">
        <p className="text-xs text-white/40">Кликните по шаблону — он заменит текущий макет. Потом меняйте всё прямо на листе.</p>
        <div className={isCard ? "grid grid-cols-1 gap-3" : "grid grid-cols-2 gap-3"}>
          {list.map((t) => {
            const d = t.build(contacts)
            return (
              <button key={t.id} type="button" onClick={() => onTemplate({ ...d, template: t.id })} className={`${card} p-2 text-left`}>
                <div className="flex justify-center gap-1.5">
                  <DesignThumb design={d} width={isCard ? (d.orientation === "portrait" ? 70 : 118) : 118} />
                  {isCard && d.sides[1] && <DesignThumb design={d} side={1} width={d.orientation === "portrait" ? 70 : 118} />}
                </div>
                <div className="mt-2 truncate text-xs text-white/70">{t.name}</div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (tab === "text") {
    return (
      <div className="space-y-2">
        <button type="button" onClick={() => addText("Заголовок", 14, 800)} className={`${card} w-full px-3 py-3 text-left text-xl font-extrabold`}>
          Добавить заголовок
        </button>
        <button type="button" onClick={() => addText("Подзаголовок", 9, 600)} className={`${card} w-full px-3 py-2.5 text-left text-base font-semibold`}>
          Добавить подзаголовок
        </button>
        <button type="button" onClick={() => addText("Обычный текст", 6.5, 400)} className={`${card} w-full px-3 py-2.5 text-left text-sm`}>
          Добавить текст
        </button>
        <div className="pt-3 text-xs text-white/40">Готовые надписи</div>
        {[
          { t: contacts.phone, s: 9, w: 700 },
          { t: contacts.website, s: 6.5, w: 500 },
          { t: contacts.email, s: 6.5, w: 400 },
          { t: contacts.city, s: 6.5, w: 400 },
          { t: "Ремонт под ключ", s: 8, w: 700 },
          { t: "Гарантия 3 года", s: 7, w: 600 },
          { t: "Скидка 10%", s: 14, w: 800, f: "Oswald" },
          { t: "Иван Петров", s: 9, w: 700 },
        ]
          .filter((x) => x.t)
          .map((x) => (
            <button key={x.t} type="button" onClick={() => addText(x.t, x.s, x.w, x.f)} className={`${card} w-full truncate px-3 py-2 text-left text-xs text-white/80`}>
              {x.t}
            </button>
          ))}
        <p className="pt-2 text-[11px] text-white/35">Двойной клик по тексту на макете — редактирование прямо на листе.</p>
      </div>
    )
  }

  if (tab === "photo") {
    return (
      <div className="space-y-3">
        <input ref={fileRef} type="file" multiple accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={(e) => pickFile(e, "photo")} />
        <input ref={logoFileRef} type="file" multiple accept="image/png,image/svg+xml,image/webp,image/jpeg" hidden onChange={(e) => pickFile(e, "logo")} />
        <div className="grid grid-cols-2 gap-2">
          <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className="flex items-center justify-center gap-1.5 rounded-lg bg-[#D4AF37] py-2.5 text-xs font-medium text-[#161616] hover:bg-[#B8860B] disabled:opacity-50">
            <Icon name={uploading ? "Loader2" : "Upload"} size={14} className={uploading ? "animate-spin" : ""} />
            Фото
          </button>
          <button type="button" disabled={uploading} onClick={() => logoFileRef.current?.click()} className="flex items-center justify-center gap-1.5 rounded-lg bg-white/10 py-2.5 text-xs font-medium hover:bg-white/15 disabled:opacity-50">
            <Icon name={uploading ? "Loader2" : "BadgeCheck"} size={14} className={uploading ? "animate-spin" : ""} />
            Логотип
          </button>
        </div>
        <p className="text-[11px] text-white/35">Всё загруженное сохраняется в библиотеку и доступно во всех макетах.</p>

        <div className="text-xs text-white/40">Мои логотипы</div>
        <div className="grid grid-cols-3 gap-2">
          <button type="button" onClick={() => addLogo("/fixkey-logo.svg")} className={`${card} aspect-square overflow-hidden bg-[repeating-conic-gradient(#2a2a2a_0_25%,#202020_0_50%)] bg-[length:12px_12px] p-1.5`} title="Логотип FixKey">
            <img src="/fixkey-logo.svg" alt="" className="h-full w-full object-contain" />
          </button>
          {logos.map((a) => assetTile(a, () => addLogo(a.url), true))}
        </div>

        {photos.length > 0 && (
          <>
            <div className="text-xs text-white/40">Мои фото</div>
            <div className="grid grid-cols-3 gap-2">{photos.map((a) => assetTile(a, () => addImage(a.url)))}</div>
          </>
        )}

        <div className="text-xs text-white/40">Фото для ремонта</div>
        <div className="grid grid-cols-2 gap-2">
          {PHOTOS.map((p) => (
            <button key={p.src} type="button" onClick={() => addImage(p.src)} className={`${card} aspect-[4/3] overflow-hidden`} title={p.label}>
              <img src={p.src} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (tab === "bg") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/80">Цвет фона</span>
          <ColorButton value={side.bg} onChange={(v) => onSide({ bg: v })} title="Цвет фона" />
        </div>
        <div className="space-y-2">
          <div className="text-xs text-white/40">Фото на весь макет</div>
          <input ref={bgFileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => pickFile(e, "bg")} />
          <button type="button" disabled={uploading} onClick={() => bgFileRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 py-2.5 text-sm hover:bg-white/15 disabled:opacity-50">
            <Icon name={uploading ? "Loader2" : "Upload"} size={15} className={uploading ? "animate-spin" : ""} />
            Загрузить фото на фон
          </button>
          <div className="grid grid-cols-3 gap-2">
            {[...photos.map((p) => p.url), ...PHOTOS.map((p) => p.src)].map((src) => (
              <button key={src} type="button" onClick={() => onSide({ bgImage: src })} className={`${card} aspect-square overflow-hidden ${side.bgImage === src ? "!border-[#D4AF37]" : ""}`}>
                <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
        {side.bgImage && (
          <div className="space-y-3 rounded-lg border border-white/10 p-3">
            <label className="block text-xs text-white/50">
              Затемнение фото: {Math.round((side.bgDim || 0) * 100)}%
              <input type="range" min={0} max={0.85} step={0.05} value={side.bgDim || 0} onChange={(e) => onSide({ bgDim: parseFloat(e.target.value) })} className="mt-2 w-full accent-[#D4AF37]" />
            </label>
            <button type="button" onClick={() => onSide({ bgImage: "", bgDim: 0 })} className="flex w-full items-center justify-center gap-1.5 rounded-md bg-white/5 py-2 text-xs text-white/70 hover:bg-white/10">
              <Icon name="Trash2" size={13} /> Убрать фото с фона
            </button>
          </div>
        )}
      </div>
    )
  }

  if (tab === "shapes") {
    const shape = (type: "rect" | "ellipse", fill: string, extra: Partial<PromoEl> = {}, w = 20 * k, h = 12 * k) =>
      onAdd({ id: uid(), type, fill, ...center(w, h), ...extra } as PromoEl)
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <button type="button" title="Прямоугольник" onClick={() => shape("rect", "#D4AF37")} className={`${card} flex aspect-square items-center justify-center`}>
            <span className="h-8 w-11 bg-[#D4AF37]" />
          </button>
          <button type="button" title="Скруглённый" onClick={() => shape("rect", "#D4AF37", { radius: 2 * k })} className={`${card} flex aspect-square items-center justify-center`}>
            <span className="h-8 w-11 rounded-md bg-[#D4AF37]" />
          </button>
          <button type="button" title="Круг" onClick={() => shape("ellipse", "#D4AF37", {}, 14 * k, 14 * k)} className={`${card} flex aspect-square items-center justify-center`}>
            <span className="h-10 w-10 rounded-full bg-[#D4AF37]" />
          </button>
          <button type="button" title="Рамка" onClick={() => onAdd({ id: uid(), type: "rect", fill: "transparent", stroke: "#D4AF37", sw: 0.4, x: 3, y: 3, w: pageW - 6, h: pageH - 6 })} className={`${card} flex aspect-square items-center justify-center`}>
            <span className="h-8 w-11 border-2 border-[#D4AF37]" />
          </button>
          <button type="button" title="Линия" onClick={() => shape("rect", "#D4AF37", {}, 20 * k, 0.5)} className={`${card} flex aspect-square items-center justify-center`}>
            <span className="h-0.5 w-11 bg-[#D4AF37]" />
          </button>
          <button type="button" title="Пунктир" onClick={() => onAdd({ id: uid(), type: "rect", fill: "transparent", stroke: "#D4AF37", sw: 0.4, dashed: true, ...center(30 * k, 14 * k) })} className={`${card} flex aspect-square items-center justify-center`}>
            <span className="h-8 w-11 border-2 border-dashed border-[#D4AF37]" />
          </button>
        </div>
        {!isCard && (
          <button
            type="button"
            onClick={() => onAdd({ id: uid(), type: "tear", count: 8, text: contacts.phone, sub: contacts.website, color: "#161616", bg: "#ffffff", size: 10, x: 0, y: pageH - 34, w: pageW, h: 34 })}
            className={`${card} flex w-full items-center gap-2 px-3 py-2.5 text-xs`}
          >
            <Icon name="Scissors" size={16} className="text-[#D4AF37]" /> Отрывные номера телефона
          </button>
        )}
        <div className="text-xs text-white/40">Иконки</div>
        <div className="grid grid-cols-6 gap-1.5">
          {ICONS.map((n) => (
            <button key={n} type="button" title={n} onClick={() => onAdd({ id: uid(), type: "icon", name: n, color: "#D4AF37", ...center(6 * k, 6 * k) })} className={`${card} flex aspect-square items-center justify-center text-[#D4AF37]`}>
              <Icon name={n} size={18} />
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <label className="block text-xs text-white/50">
        Куда ведёт QR-код
        <input value={qrValue} onChange={(e) => setQrValue(e.target.value)} className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#161616] px-3 py-2.5 text-sm text-white outline-none focus:border-[#D4AF37]/50" />
      </label>
      <div className="flex flex-wrap gap-1.5">
        {[
          { l: "Сайт", v: `https://${contacts.website}` },
          { l: "Telegram", v: contacts.telegram },
          { l: "Позвонить", v: `tel:${contacts.phone.replace(/[^\d+]/g, "")}` },
          { l: "Почта", v: `mailto:${contacts.email}` },
        ]
          .filter((x) => x.v && !x.v.endsWith(":"))
          .map((x) => (
            <button key={x.l} type="button" onClick={() => setQrValue(x.v)} className="rounded-md bg-white/5 px-2.5 py-1.5 text-xs text-white/70 hover:bg-white/10">
              {x.l}
            </button>
          ))}
      </div>
      <button
        type="button"
        disabled={!qrValue.trim()}
        onClick={() => onAdd({ id: uid(), type: "qr", value: qrValue.trim(), fg: "#161616", bg: "#ffffff", ...center(18 * k, 18 * k) })}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#D4AF37] py-2.5 text-sm font-medium text-[#161616] hover:bg-[#B8860B] disabled:opacity-50"
      >
        <Icon name="QrCode" size={15} /> Добавить QR-код
      </button>
      <p className="text-[11px] text-white/35">Чтобы поменять ссылку у готового QR-кода — выделите его на макете.</p>
    </div>
  )
}

export default LeftPanel
