import { useRef, useState } from "react"
import Icon from "@/components/ui/icon"
import type { PlanPoint, PlanUnderlay } from "@/lib/planner/types"
import { fromMm, toMm } from "@/lib/planner/geometry"

interface Props {
  underlay?: PlanUnderlay
  calibrating: boolean
  calibPts: PlanPoint[]
  onChange: (u: PlanUnderlay | undefined) => void
  uploadImage: (dataUrl: string) => Promise<string>
  onStartCalibrate: () => void
  onApplyCalibrate: (meters: number) => void
  onCancelCalibrate: () => void
}

const btn = "flex min-h-[34px] items-center gap-1.5 rounded-lg bg-white/5 px-3 text-xs text-white/70 hover:bg-white/10 disabled:opacity-40"

/** Сжимаем фото до 2400 px по длинной стороне — план читается, файл лёгкий */
async function shrink(file: File): Promise<{ dataUrl: string; w: number; h: number }> {
  const src = await new Promise<string>((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(String(r.result))
    r.onerror = rej
    r.readAsDataURL(file)
  })
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = rej
    i.src = src
  })
  const k = Math.min(1, 2400 / Math.max(img.width, img.height))
  const c = document.createElement("canvas")
  c.width = Math.round(img.width * k)
  c.height = Math.round(img.height * k)
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height)
  return { dataUrl: c.toDataURL("image/jpeg", 0.85), w: c.width, h: c.height }
}

/** Подложка плана: загрузка фото/скана, прозрачность и масштаб по известному размеру */
export function UnderlayPanel({ underlay, calibrating, calibPts, onChange, uploadImage, onStartCalibrate, onApplyCalibrate, onCancelCalibrate }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")
  const [mm, setMm] = useState("")

  const pick = async (file: File) => {
    setBusy(true)
    setErr("")
    try {
      const { dataUrl, w, h } = await shrink(file)
      const url = await uploadImage(dataUrl)
      // Пока масштаб не задан — подложка шириной 10 м, потом подгоняем по размеру
      const wm = 10
      onChange({ url, x: 0, y: 0, w: wm, h: (wm * h) / w, opacity: 0.5 })
      onStartCalibrate()
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Не удалось загрузить")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mb-4 rounded-xl border border-white/10 bg-[#1f1f1f] p-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) pick(f)
          e.target.value = ""
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 pr-1 text-xs uppercase text-white/40">
          <Icon name="ImageUp" size={14} />
          Подложка
        </span>
        <button className={btn} onClick={() => fileRef.current?.click()} disabled={busy}>
          <Icon name={busy ? "Loader2" : "Upload"} size={14} className={busy ? "animate-spin" : ""} />
          {underlay ? "Заменить фото" : "Загрузить фото плана"}
        </button>
        {underlay && (
          <>
            <button className={btn} onClick={onStartCalibrate} disabled={calibrating}>
              <Icon name="Ruler" size={14} />
              {underlay.calibrated ? "Перезадать масштаб" : "Задать масштаб"}
            </button>
            <label className="flex items-center gap-2 text-xs text-white/50">
              Прозрачность
              <input
                type="range"
                min={10}
                max={100}
                value={Math.round(underlay.opacity * 100)}
                onChange={(e) => onChange({ ...underlay, opacity: Number(e.target.value) / 100 })}
                className="w-24 accent-[#D4AF37]"
              />
            </label>
            <button className={btn} onClick={() => onChange({ ...underlay, hidden: !underlay.hidden })}>
              <Icon name={underlay.hidden ? "Eye" : "EyeOff"} size={14} />
              {underlay.hidden ? "Показать" : "Скрыть"}
            </button>
            <button className={`${btn} hover:text-red-300`} onClick={() => onChange(undefined)}>
              <Icon name="Trash2" size={14} />
              Убрать
            </button>
            {!underlay.calibrated && !calibrating && <span className="text-xs text-amber-300">Масштаб не задан — размеры будут неверными</span>}
          </>
        )}
      </div>

      {calibrating && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-500/5 p-2.5 text-xs">
          <Icon name="Crosshair" size={14} className="text-rose-300" />
          {calibPts.length < 2 ? (
            <span className="text-white/70">
              Щёлкните по {calibPts.length === 0 ? "началу" : "концу"} любого известного размера на фото — например, стены «2.90» у кухни.
              Удобнее приблизить колесом мыши.
            </span>
          ) : (
            <>
              <span className="text-white/70">Сколько это в реальности, мм:</span>
              <input
                autoFocus
                type="number"
                min={100}
                step={10}
                value={mm}
                onChange={(e) => setMm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && Number(mm) > 0) {
                    onApplyCalibrate(fromMm(Number(mm)))
                    setMm("")
                  }
                }}
                placeholder="2900"
                className="w-24 rounded-lg border border-white/10 bg-[#161616] px-2 py-1.5 text-sm outline-none focus:border-[#D4AF37]/50"
              />
              <button
                className="rounded-lg bg-[#D4AF37] px-3 py-1.5 font-medium text-[#161616] disabled:opacity-40"
                disabled={!(Number(mm) > 0)}
                onClick={() => {
                  onApplyCalibrate(fromMm(Number(mm)))
                  setMm("")
                }}
              >
                Применить
              </button>
            </>
          )}
          <button className="ml-auto text-white/50 hover:text-white" onClick={onCancelCalibrate}>
            Отмена
          </button>
        </div>
      )}
      {underlay?.calibrated && !calibrating && (
        <div className="mt-2 text-[11px] text-white/40">
          Подложка {toMm(underlay.w)}×{toMm(underlay.h)} мм. Обводите комнаты инструментом «Стены» по углам; нужные длины потом введите в списке стен помещения — остальные подстроятся сами.
        </div>
      )}
      {err && <div className="mt-2 text-xs text-red-300">{err}</div>}
    </div>
  )
}

export default UnderlayPanel
