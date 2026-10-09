import { useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Icon from "@/components/ui/icon"
import { chaseTotals, elevationRows, elevationSvg, roomElevations } from "@/lib/planner/elevation"
import { toMm } from "@/lib/planner/geometry"
import { ceilingPlan, ceilingRows, ceilingSvg } from "@/lib/planner/ceiling"
import { PlanScheme } from "@/lib/planner/types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  scheme: PlanScheme
  roomId: string
  /** Стена, которую открыть первой */
  wallId?: string | null
}

/** Развёртки стен помещения: где сверлить под розетки, выключатели и щит */
export function WallElevationsDialog({ open, onOpenChange, scheme, roomId, wallId }: Props) {
  const room = scheme.rooms.find((r) => r.id === roomId)
  const elevations = useMemo(() => (room ? roomElevations(scheme, room) : []), [scheme, room])
  const [picked, setPicked] = useState<string | null>(null)
  const activeId = picked ?? wallId ?? elevations.find((e) => e.points.length)?.wall.id ?? elevations[0]?.wall.id
  const e = elevations.find((x) => x.wall.id === activeId) ?? elevations[0]
  const ceiling = useMemo(() => (room ? ceilingPlan(scheme, room) : null), [scheme, room])
  const showCeiling = picked === "ceiling"

  if (!room || !e) return null
  const rows = elevationRows(e)
  const ch = chaseTotals(e)

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setPicked(null)
        onOpenChange(v)
      }}
    >
      <DialogContent className="max-w-4xl border-white/10 bg-[#1a1a1a] text-white">
        <DialogHeader>
          <DialogTitle>Развёртки стен · {room.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-1.5">
          {ceiling && (
            <button
              onClick={() => setPicked("ceiling")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
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
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                !showCeiling && x.wall.id === e.wall.id ? "bg-[#D4AF37] text-[#161616]" : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              Стена {x.wall.index + 1}
              <span className={!showCeiling && x.wall.id === e.wall.id ? "text-[#161616]/60" : "text-white/40"}>
                {" "}
                · {toMm(x.length)}
                {x.points.length ? ` · ${x.points.length} шт` : ""}
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
              <div className="overflow-x-auto">
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
            )}
          </>
        ) : (
        <>
        <div
          className="overflow-x-auto rounded-lg bg-white p-2 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: elevationSvg(e, 760) }}
        />

        {rows.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Icon name="Info" size={14} />
            На этой стене нет розеток, выключателей и щитов.
          </div>
        ) : (
          <div className="overflow-x-auto">
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
        )}

        </>
        )}

        {!showCeiling && ch.total > 0 && (
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
