import { useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Icon from "@/components/ui/icon"
import { MobileCard } from "@/components/crm/MobileCard"
import { ElevationMode, chaseTotals, elevationRows, elevationSvg, finishLegend, roomElevations } from "@/lib/planner/elevation"
import { finishCalc } from "@/lib/planner/finishes"
import { toMm } from "@/lib/planner/geometry"
import { ceilingPlan, ceilingRows, ceilingSvg } from "@/lib/planner/ceiling"
import { FURNITURE_PRESETS, PlanScheme, WALL_FINISHES } from "@/lib/planner/types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  scheme: PlanScheme
  roomId: string
  /** Стена, которую открыть первой */
  wallId?: string | null
  /** С чего начать: электрика (по умолчанию) или отделка */
  initialMode?: ElevationMode
}

/** Развёртки стен помещения: где сверлить под розетки, выключатели и щит, и отделка с мебелью у стены */
export function WallElevationsDialog({ open, onOpenChange, scheme, roomId, wallId, initialMode = "electric" }: Props) {
  const [mode, setMode] = useState<ElevationMode>(initialMode)
  const room = scheme.rooms.find((r) => r.id === roomId)
  const elevations = useMemo(() => (room ? roomElevations(scheme, room) : []), [scheme, room])
  const [picked, setPicked] = useState<string | null>(null)
  const activeId = picked ?? wallId ?? elevations.find((e) => e.points.length)?.wall.id ?? elevations[0]?.wall.id
  const e = elevations.find((x) => x.wall.id === activeId) ?? elevations[0]
  const ceiling = useMemo(() => (room ? ceilingPlan(scheme, room) : null), [scheme, room])
  const showCeiling = picked === "ceiling"

  const calc = useMemo(() => (room ? finishCalc(scheme, room) : null), [scheme, room])
  if (!room || !e) return null
  const rows = elevationRows(e)
  const wc = calc?.walls.find((w) => w.id === e.wall.id)
  const legend = wc ? finishLegend(e, wc.net, wc.main) : null
  const ch = chaseTotals(e)

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setPicked(null)
        onOpenChange(v)
      }}
    >
      <DialogContent className="max-w-4xl border-white/10 bg-[#1a1a1a] text-white overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="pr-6 break-words">Развёртки стен · {room.name}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-1.5">
          {(
            [
              ["electric", "Электрика", "Zap"],
              ["finish", "Отделка и мебель", "Paintbrush"],
            ] as const
          ).map(([m, label, icon]) => (
            <button
              key={m}
              onClick={() => {
                setMode(m)
                if (m === "finish" && picked === "ceiling") setPicked(null)
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                mode === m ? "bg-white text-[#161616]" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              <Icon name={icon} size={13} />
              {label}
            </button>
          ))}
        </div>

        <div className="-mx-4 flex gap-1.5 overflow-x-auto whitespace-nowrap px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:whitespace-normal sm:px-0">
          {ceiling && mode === "electric" && (
            <button
              onClick={() => setPicked("ceiling")}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                showCeiling ? "bg-[#D4AF37] text-[#161616]" : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              <Icon name="Lightbulb" size={13} />
              Потолок
              <span className={showCeiling ? "text-[#161616]/60" : "text-white/40"}>
                {ceiling.points.length ? ` · ${ceiling.points.length} шт` : ""}
              </span>
            </button>
          )}
          {elevations.map((x) => (
            <button
              key={x.wall.id}
              onClick={() => setPicked(x.wall.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                !showCeiling && x.wall.id === e.wall.id ? "bg-[#D4AF37] text-[#161616]" : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              {mode === "finish" && x.finish.wall !== "none" && (
                <span
                  className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm border border-black/20 align-middle"
                  style={{ background: x.finish.wallColor || WALL_FINISHES[x.finish.wall].color }}
                />
              )}
              Стена {x.wall.index + 1}
              <span className={!showCeiling && x.wall.id === e.wall.id ? "text-[#161616]/60" : "text-white/40"}>
                {" "}
                · {toMm(x.length)}
                {mode === "electric" && x.points.length ? ` · ${x.points.length} шт` : ""}
                {mode === "finish" && x.finish.own ? " · акцент" : ""}
                {mode === "finish" && x.furniture.length ? ` · мебель ${x.furniture.length}` : ""}
              </span>
            </button>
          ))}
        </div>

        {showCeiling && ceiling ? (
          <>
            <div
              className="overflow-x-auto rounded-lg bg-white p-2 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
              dangerouslySetInnerHTML={{ __html: ceilingSvg(scheme, ceiling, 760) }}
            />
            {ceiling.points.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-white/50">
                <Icon name="Info" size={14} />
                На потолке нет светильников, спотов и распаечных коробок.
              </div>
            ) : (
              <>
              <div className="md:hidden flex flex-col gap-3">
                {ceilingRows(ceiling).map((r) => (
                  <MobileCard
                    key={r.no}
                    title={r.name}
                    badge={<span className="font-semibold text-[#D4AF37]">№ {r.no}</span>}
                    rows={[
                      { label: "От левой стены", value: <span className="font-semibold text-[#D4AF37]">{r.fromLeft}</span> },
                      { label: "От верхней стены", value: <span className="font-semibold text-[#D4AF37]">{r.fromTop}</span> },
                      { label: "До правой", value: r.fromRight },
                      { label: "До нижней", value: r.fromBottom },
                      { label: "Высота", value: r.height },
                    ]}
                  />
                ))}
              </div>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-white/40">
                      <th className="py-1.5 pr-2 font-normal">№</th>
                      <th className="py-1.5 pr-2 font-normal">Точка</th>
                      <th className="py-1.5 pr-2 text-right font-normal">От левой стены</th>
                      <th className="py-1.5 pr-2 text-right font-normal">От верхней стены</th>
                      <th className="py-1.5 pr-2 text-right font-normal">До правой</th>
                      <th className="py-1.5 pr-2 text-right font-normal">До нижней</th>
                      <th className="py-1.5 pr-2 text-right font-normal">Высота</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ceilingRows(ceiling).map((r) => (
                      <tr key={r.no} className="border-t border-white/5">
                        <td className="py-1.5 pr-2 font-semibold text-[#D4AF37]">{r.no}</td>
                        <td className="py-1.5 pr-2">{r.name}</td>
                        <td className="py-1.5 pr-2 text-right font-semibold text-[#D4AF37]">{r.fromLeft}</td>
                        <td className="py-1.5 pr-2 text-right font-semibold text-[#D4AF37]">{r.fromTop}</td>
                        <td className="py-1.5 pr-2 text-right text-white/60">{r.fromRight}</td>
                        <td className="py-1.5 pr-2 text-right text-white/60">{r.fromBottom}</td>
                        <td className="py-1.5 pr-2 text-right text-white/60">{r.height}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </>
        ) : (
        <>
        <div
          className="overflow-x-auto rounded-lg bg-white p-2 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: elevationSvg(e, 760, mode) }}
        />

        {mode === "finish" ? (
          <div className="space-y-3 text-sm">
            {legend && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg bg-[#161616] p-3">
                {legend.color && <span className="h-4 w-4 rounded border border-white/20" style={{ background: legend.color }} />}
                <span className="font-medium">{legend.material}</span>
                {legend.color && <span className="text-xs text-white/40">{legend.color.toUpperCase()}</span>}
                {legend.note && <span className="text-xs text-[#D4AF37]">{legend.note}</span>}
                {wc && <span className="ml-auto text-xs text-white/40">стена без проёмов {wc.net.toFixed(2).replace(".", ",")} м²</span>}
              </div>
            )}
            {e.furniture.length === 0 ? (
              <div className="flex items-center gap-2 text-white/50">
                <Icon name="Info" size={14} />
                У этой стены нет мебели.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-white/40">
                      <th className="py-1.5 pr-2 font-normal">Предмет</th>
                      <th className="py-1.5 pr-2 text-right font-normal">От левого угла</th>
                      <th className="py-1.5 pr-2 text-right font-normal">Ширина</th>
                      <th className="py-1.5 pr-2 text-right font-normal">До правого угла</th>
                      <th className="py-1.5 pr-2 text-right font-normal">Низ / верх</th>
                      <th className="py-1.5 pr-2 text-right font-normal">От стены</th>
                    </tr>
                  </thead>
                  <tbody>
                    {e.furniture.map((it) => (
                      <tr key={it.f.id} className="border-t border-white/5">
                        <td className="py-1.5 pr-2">{it.f.label || FURNITURE_PRESETS[it.f.kind].label}</td>
                        <td className="py-1.5 pr-2 text-right font-semibold text-[#D4AF37]">{toMm(it.x0)}</td>
                        <td className="py-1.5 pr-2 text-right">{toMm(it.x1 - it.x0)}</td>
                        <td className="py-1.5 pr-2 text-right text-white/60">{toMm(e.length - it.x1)}</td>
                        <td className="py-1.5 pr-2 text-right text-white/60">
                          {toMm(it.z0)} / {toMm(it.z1)}
                        </td>
                        <td className="py-1.5 pr-2 text-right text-white/60">{it.gap > 0.005 ? toMm(it.gap) : "вплотную"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Icon name="Info" size={14} />
            На этой стене нет розеток, выключателей и щитов.
          </div>
        ) : (
          <>
          <div className="md:hidden flex flex-col gap-3">
            {rows.map((r) => (
              <MobileCard
                key={r.no}
                title={r.name}
                subtitle={r.note ? <span className="text-amber-400/80">{r.note}</span> : undefined}
                badge={<span className="font-semibold text-[#D4AF37]">№ {r.no}</span>}
                rows={[
                  { label: "От левого угла", value: r.fromLeft },
                  { label: "От правого угла", value: r.fromRight },
                  { label: "От пола", value: <span className="font-semibold text-[#D4AF37]">{r.fromFloor}</span> },
                  { label: "До потолка", value: r.toCeiling },
                ]}
              />
            ))}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-white/40">
                  <th className="py-1.5 pr-2 font-normal">№</th>
                  <th className="py-1.5 pr-2 font-normal">Точка</th>
                  <th className="py-1.5 pr-2 text-right font-normal">От левого угла</th>
                  <th className="py-1.5 pr-2 text-right font-normal">От правого угла</th>
                  <th className="py-1.5 pr-2 text-right font-normal">От пола</th>
                  <th className="py-1.5 pr-2 text-right font-normal">До потолка</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.no} className="border-t border-white/5">
                    <td className="py-1.5 pr-2 font-semibold text-[#D4AF37]">{r.no}</td>
                    <td className="py-1.5 pr-2">
                      {r.name}
                      {r.note && <div className="text-xs text-amber-400/80">{r.note}</div>}
                    </td>
                    <td className="py-1.5 pr-2 text-right">{r.fromLeft}</td>
                    <td className="py-1.5 pr-2 text-right text-white/60">{r.fromRight}</td>
                    <td className="py-1.5 pr-2 text-right font-semibold text-[#D4AF37]">{r.fromFloor}</td>
                    <td className="py-1.5 pr-2 text-right text-white/60">{r.toCeiling}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}

        </>
        )}

        {!showCeiling && mode === "electric" && ch.total > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span className="text-white/50">Штробы на стене:</span>
            <span>вертикальные {toMm(ch.vertical)} мм</span>
            <span>горизонтальные {toMm(ch.horizontal)} мм</span>
            <span className="font-semibold text-[#D4AF37]">всего {(ch.total).toFixed(2).replace(".", ",")} м</span>
          </div>
        )}

        <div className="text-xs leading-relaxed text-white/40">
          Вид на стену изнутри помещения, размеры в мм — до центра коробки, от чистого пола и от углов по
          внутренней стороне стены. Штробы — только вертикально и горизонтально: от верхней коробки к трассе под
          потолком, между коробками на одной высоте — шлейфом. Мимо проёмов штроба обходит их сбоку. Правьте высоту и место точки на слое «Электрика» — развёртка обновится сама.
          Все развёртки попадают в PDF.
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default WallElevationsDialog
