import Icon from "@/components/ui/icon"
import { DeleteButton } from "@/components/ui/delete-button"
import { fmtNum, fromMm, toMm } from "@/lib/planner/geometry"
import { FIXTURE_PRESETS, PlanFixture, PlanScheme } from "@/lib/planner/types"
import {
  FLOATING_OFFSET,
  fixtureLength,
  floatingArea,
  floatingContour,
  floatingPerimeter,
  trackOffsets,
} from "@/lib/planner/fixtures"

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"
const labelCls = "mb-1.5 block text-xs text-white/50"

interface Props {
  fixture: PlanFixture
  scheme: PlanScheme
  onUpdate: (id: string, patch: Partial<PlanFixture>) => void
  onDelete: (id: string) => void
}

/** Карточка магнитного трека или парящего потолка: длина, отступы от стен, высота */
export function SelectedFixtureCard({ fixture: f, scheme, onUpdate, onDelete }: Props) {
  const preset = FIXTURE_PRESETS[f.kind]
  const room = scheme.rooms.find((r) => r.id === f.roomId)

  /** Длина трека: конец сдвигается по оси трека */
  const setLength = (mm: number) => {
    const len = fixtureLength(f) || 1
    const L = Math.max(fromMm(mm), 0.05)
    onUpdate(f.id, { b: { x: f.a.x + ((f.b.x - f.a.x) / len) * L, y: f.a.y + ((f.b.y - f.a.y) / len) * L } })
  }

  /** Отступ сбоку — трек переезжает параллельно стене */
  const setSide = (mm: number) => {
    const o = trackOffsets(scheme, f)
    if (o.side === null) return
    const d = (o.side - fromMm(mm)) * o.sideDir
    const shift = o.horiz ? { x: 0, y: d } : { x: d, y: 0 }
    onUpdate(f.id, { a: { x: f.a.x + shift.x, y: f.a.y + shift.y }, b: { x: f.b.x + shift.x, y: f.b.y + shift.y } })
  }

  /** Отступ от начального торца — трек сдвигается вдоль оси */
  const setStart = (mm: number) => {
    const o = trackOffsets(scheme, f)
    if (o.startEnd === null) return
    const d = fromMm(mm) - o.startEnd
    const shift = o.horiz ? { x: d, y: 0 } : { x: 0, y: d }
    onUpdate(f.id, { a: { x: f.a.x + shift.x, y: f.a.y + shift.y }, b: { x: f.b.x + shift.x, y: f.b.y + shift.y } })
  }

  const o = f.kind === "track" ? trackOffsets(scheme, f) : null
  const contour = f.kind === "floating" ? floatingContour(scheme, f) : null

  return (
    <div className="rounded-xl border border-[#D4AF37]/30 bg-[#1f1f1f] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon name={preset.icon} size={15} />
          {preset.label}
          <span className="font-bold text-[#D4AF37]">{preset.code}</span>
        </div>
        <DeleteButton onConfirm={() => onDelete(f.id)} title={`Удалить: ${preset.label.toLowerCase()}?`} />
      </div>

      <div className="mb-3">
        <label className={labelCls}>Подпись на плане</label>
        <input className={inputCls} placeholder={preset.label} value={f.label} onChange={(e) => onUpdate(f.id, { label: e.target.value })} />
      </div>

      {f.kind === "track" && o && (
        <>
          <div className="mb-3">
            <label className={labelCls}>Длина трека, мм</label>
            <input className={inputCls} type="number" min="50" step="10" value={toMm(fixtureLength(f))} onChange={(e) => setLength(Number(e.target.value))} />
          </div>
          <div className="mb-3 grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>От стены сбоку, мм</label>
              <input
                className={inputCls}
                type="number"
                step="10"
                disabled={o.side === null}
                value={o.side !== null ? toMm(o.side) : ""}
                onChange={(e) => setSide(Number(e.target.value))}
              />
            </div>
            <div>
              <label className={labelCls}>{o.horiz ? "От левой стены" : "От верхней стены"}, мм</label>
              <input
                className={inputCls}
                type="number"
                step="10"
                disabled={o.startEnd === null}
                value={o.startEnd !== null ? toMm(o.startEnd) : ""}
                onChange={(e) => setStart(Number(e.target.value))}
              />
            </div>
          </div>
          {o.endEnd !== null && (
            <div className="mb-3 text-xs text-white/40">
              До {o.horiz ? "правой" : "нижней"} стены: {toMm(o.endEnd)} мм
            </div>
          )}
        </>
      )}

      {f.kind === "floating" && (
        <>
          <div className="mb-3">
            <label className={labelCls}>Отступ светящегося контура от стен, мм</label>
            <input
              className={inputCls}
              type="number"
              min="0"
              step="10"
              value={toMm(f.offset ?? FLOATING_OFFSET)}
              onChange={(e) => onUpdate(f.id, { offset: Math.max(fromMm(Number(e.target.value)), 0) })}
            />
          </div>
          {contour && (
            <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-[#161616] p-2">
                <div className="text-white/40">Подсветка (периметр)</div>
                <div className="font-semibold">{fmtNum(floatingPerimeter(contour), 2)} м</div>
              </div>
              <div className="rounded-lg bg-[#161616] p-2">
                <div className="text-white/40">Площадь полотна</div>
                <div className="font-semibold">{fmtNum(floatingArea(contour), 2)} м²</div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="mb-3">
        <label className={labelCls}>Высота от пола, мм</label>
        <input
          className={inputCls}
          type="number"
          min="0"
          step="10"
          value={toMm(f.height)}
          onChange={(e) => onUpdate(f.id, { height: fromMm(Number(e.target.value)) })}
        />
      </div>

      <div className="text-xs text-white/40">Помещение: {room?.name || "вне помещений"}</div>
    </div>
  )
}

export default SelectedFixtureCard
