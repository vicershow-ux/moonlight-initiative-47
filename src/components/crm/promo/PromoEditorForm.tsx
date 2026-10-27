import { ChangeEvent, ReactNode, useRef } from "react"
import Icon from "@/components/ui/icon"
import { PromoData, PromoKind } from "@/lib/api"
import { resizeImageToDataUrl } from "@/lib/imageUpload"
import { THEMES } from "./promoConfig"

const inputClass =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
const labelClass = "text-xs text-white/50 mb-1.5 block"

interface Props {
  kind: PromoKind
  title: string
  data: PromoData
  onTitle: (v: string) => void
  onChange: (patch: Partial<PromoData>) => void
  onImage: (field: "image" | "logo", dataUrl: string) => void
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  )
}

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string; icon?: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-lg border border-white/10 bg-[#161616] p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs transition-colors ${
            value === o.value ? "bg-[#D4AF37] font-medium text-[#161616]" : "text-white/60 hover:text-white"
          }`}
        >
          {o.icon && <Icon name={o.icon} size={14} />}
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-3 py-1 text-left">
      <span className="text-sm text-white/80">{label}</span>
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-[#D4AF37]" : "bg-white/15"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  )
}

function ImageButton({ label, has, onPick, onClear, maxSide }: { label: string; has: boolean; onPick: (d: string) => void; onClear: () => void; maxSide: number }) {
  const ref = useRef<HTMLInputElement>(null)
  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ""
    if (f) onPick(await resizeImageToDataUrl(f, maxSide, 0.88))
  }
  return (
    <div className="flex items-center gap-2">
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={pick} />
      <button type="button" onClick={() => ref.current?.click()} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs text-white hover:bg-white/15">
        <Icon name={has ? "RefreshCw" : "Upload"} size={13} />
        {has ? `Заменить: ${label}` : `Загрузить: ${label}`}
      </button>
      {has && (
        <button type="button" onClick={onClear} aria-label="Убрать" className="rounded-lg bg-white/5 p-2 text-white/60 hover:bg-white/10">
          <Icon name="Trash2" size={14} />
        </button>
      )}
    </div>
  )
}

export function PromoEditorForm({ kind, title, data, onTitle, onChange, onImage }: Props) {
  const isCard = kind === "card"

  return (
    <div className="space-y-5">
      <Field label="Название макета (видно только вам)">
        <input className={inputClass} value={title} onChange={(e) => onTitle(e.target.value)} />
      </Field>

      <Field label="Ориентация">
        <Segmented
          value={data.orientation || (isCard ? "landscape" : "portrait")}
          onChange={(v) => onChange({ orientation: v })}
          options={[
            { value: "portrait", label: "Вертикально", icon: "RectangleVertical" },
            { value: "landscape", label: "Горизонтально", icon: "RectangleHorizontal" },
          ]}
        />
      </Field>

      <Field label="Цвет">
        <Segmented
          value={data.theme || "dark"}
          onChange={(v) => onChange({ theme: v })}
          options={Object.entries(THEMES).map(([value, t]) => ({ value: value as NonNullable<PromoData["theme"]>, label: t.label }))}
        />
      </Field>

      <div className="space-y-4 border-t border-white/10 pt-5">
        {isCard ? (
          <>
            <Field label="Имя или название">
              <input className={inputClass} value={data.name || ""} onChange={(e) => onChange({ name: e.target.value })} />
            </Field>
            <Field label="Должность или чем занимаетесь">
              <input className={inputClass} value={data.role || ""} onChange={(e) => onChange({ role: e.target.value })} />
            </Field>
          </>
        ) : (
          <>
            <Field label="Заголовок">
              <textarea rows={2} className={`${inputClass} resize-none`} value={data.headline || ""} onChange={(e) => onChange({ headline: e.target.value })} />
            </Field>
            <Field label="Подзаголовок">
              <input className={inputClass} value={data.subtitle || ""} onChange={(e) => onChange({ subtitle: e.target.value })} />
            </Field>
            <Field label="Преимущества — каждое с новой строки">
              <textarea rows={4} className={`${inputClass} resize-y`} value={data.bullets || ""} onChange={(e) => onChange({ bullets: e.target.value })} />
            </Field>
            <Field label="Выделенное предложение">
              <input className={inputClass} value={data.offer || ""} onChange={(e) => onChange({ offer: e.target.value })} placeholder="Например: замер бесплатно" />
            </Field>
          </>
        )}
      </div>

      <div className="space-y-4 border-t border-white/10 pt-5">
        <Field label="Телефон">
          <input className={inputClass} value={data.phone || ""} onChange={(e) => onChange({ phone: e.target.value })} />
        </Field>
        {isCard && (
          <Field label="Почта">
            <input className={inputClass} value={data.email || ""} onChange={(e) => onChange({ email: e.target.value })} />
          </Field>
        )}
        <Field label="Сайт">
          <input className={inputClass} value={data.website || ""} onChange={(e) => onChange({ website: e.target.value })} />
        </Field>
        {isCard && (
          <Field label="Адрес или город">
            <input className={inputClass} value={data.address || ""} onChange={(e) => onChange({ address: e.target.value })} />
          </Field>
        )}
      </div>

      <div className="space-y-3 border-t border-white/10 pt-5">
        <Toggle checked={!!data.qr_enabled} onChange={(v) => onChange({ qr_enabled: v })} label="QR-код" />
        {data.qr_enabled && (
          <>
            <Field label="Куда ведёт QR-код (ссылка)">
              <input className={inputClass} value={data.qr_url || ""} onChange={(e) => onChange({ qr_url: e.target.value })} placeholder="https://fixkey.ru или ссылка на Telegram" />
            </Field>
            {!isCard && (
              <Field label="Подпись у QR-кода">
                <input className={inputClass} value={data.qr_caption || ""} onChange={(e) => onChange({ qr_caption: e.target.value })} />
              </Field>
            )}
            {!data.qr_url && <p className="text-[11px] text-amber-400">Укажите ссылку — без неё QR-код не появится.</p>}
          </>
        )}
        {!isCard && <Toggle checked={!!data.tear_off} onChange={(v) => onChange({ tear_off: v })} label="Отрывные полоски с телефоном" />}
      </div>

      <div className="space-y-2 border-t border-white/10 pt-5">
        <label className={labelClass}>Картинки</label>
        {!isCard && <ImageButton label="фото" has={!!data.image} maxSide={2000} onPick={(d) => onImage("image", d)} onClear={() => onChange({ image: "" })} />}
        <ImageButton label="логотип" has={!!data.logo} maxSide={800} onPick={(d) => onImage("logo", d)} onClear={() => onChange({ logo: "" })} />
        <p className="text-[11px] text-white/30">Без своего логотипа ставится логотип FixKey.</p>
      </div>
    </div>
  )
}

export default PromoEditorForm
