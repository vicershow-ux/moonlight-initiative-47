import { useMemo } from "react"
import { fromMm, toMm } from "@/lib/planner/geometry"
import { TILE_LAYOUTS, TILE_SIZES, TileLayout, TileSpec } from "@/lib/planner/types"
import { svgPatternDef, tilePattern, tileCount } from "@/lib/planner/finishTextures"

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-[#D4AF37]/50"
const labelCls = "mb-1 block text-[11px] text-white/45"

/** Готовые сочетания — как в каталогах: быстро примерить и показать заказчику */
const PRESETS: { label: string; t: Partial<TileSpec> }[] = [
  { label: "Белый кабанчик", t: { w: 0.2, h: 0.1, layout: "offset", color: "#f5f5f4", grout: "#d4d4d4", gloss: true, joint: 0.002 } },
  { label: "Серый 60×60", t: { w: 0.6, h: 0.6, layout: "grid", color: "#a8a8a3", grout: "#6b7280", gloss: false, joint: 0.002 } },
  { label: "Мрамор 60×120", t: { w: 1.2, h: 0.6, layout: "grid", color: "#ecebe7", grout: "#cfcfcb", gloss: true, joint: 0.0015 } },
  { label: "Бетон 30×60", t: { w: 0.6, h: 0.3, layout: "third", color: "#8f8f8c", grout: "#5f5f5c", gloss: false, joint: 0.002 } },
  { label: "Ёлочка под дерево", t: { w: 0.6, h: 0.15, layout: "herringbone", color: "#a27c57", grout: "#6b4f36", gloss: false, joint: 0.002 } },
  { label: "Шахматка ч/б", t: { w: 0.3, h: 0.3, layout: "checker", color: "#f3f4f6", color2: "#1f2937", grout: "#9ca3af", gloss: true, joint: 0.002 } },
  { label: "Зелёный зеллиж", t: { w: 0.1, h: 0.1, layout: "grid", color: "#2f6b5e", grout: "#e7e5e4", gloss: true, joint: 0.002 } },
  { label: "Терракота диагональ", t: { w: 0.3, h: 0.3, layout: "diagonal", color: "#b5653d", grout: "#e7d8c9", gloss: false, joint: 0.003 } },
]

interface Props {
  tile: TileSpec
  onChange: (patch: Partial<TileSpec>) => void
  /** Площадь под плитку — для подсказки количества */
  area?: number
}

/** Плитка: размер, шов, раскладка, цвет и затирка — с живым образцом */
export function TileSpecEditor({ tile, onChange, area }: Props) {
  const preview = useMemo(() => {
    const p = tilePattern(tile)
    // Образец — квадрат 1,2 × 1,2 м, чтобы было видно рисунок раскладки
    const s = 150 / 1.2
    return `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><defs>${svgPatternDef("tp", p, s)}</defs><rect width="150" height="150" fill="url(#tp)"/></svg>`
  }, [tile])
  const sizeKey = `${toMm(tile.w)}×${toMm(tile.h)}`
  const cnt = area && area > 0 ? tileCount(tile, area) : null

  return (
    <div className="space-y-2 rounded-lg border border-white/10 bg-[#161616] p-2.5">
      <div className="flex gap-2.5">
        <div className="h-[110px] w-[110px] shrink-0 overflow-hidden rounded-md border border-white/10 [&_svg]:h-full [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: preview }} />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div>
            <label className={labelCls}>Размер, мм</label>
            <select
              className={inputCls}
              value={TILE_SIZES.some(([w, h]) => `${toMm(w)}×${toMm(h)}` === sizeKey) ? sizeKey : "custom"}
              onChange={(e) => {
                const hit = TILE_SIZES.find(([w, h]) => `${toMm(w)}×${toMm(h)}` === e.target.value)
                if (hit) onChange({ w: hit[0], h: hit[1] })
              }}
            >
              {TILE_SIZES.map(([w, h]) => (
                <option key={`${w}x${h}`} value={`${toMm(w)}×${toMm(h)}`}>
                  {toMm(w)}×{toMm(h)}
                </option>
              ))}
              <option value="custom">Свой размер</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <input className={inputCls} type="number" min="20" step="5" title="Ширина, мм" value={toMm(tile.w)} onChange={(e) => onChange({ w: Math.max(fromMm(Number(e.target.value)), 0.02) })} />
            <input className={inputCls} type="number" min="20" step="5" title="Высота, мм" value={toMm(tile.h)} onChange={(e) => onChange({ h: Math.max(fromMm(Number(e.target.value)), 0.02) })} />
          </div>
          <select className={inputCls} value={tile.layout} onChange={(e) => onChange({ layout: e.target.value as TileLayout })}>
            {(Object.keys(TILE_LAYOUTS) as TileLayout[]).map((k) => (
              <option key={k} value={k}>
                {TILE_LAYOUTS[k].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        <div>
          <label className={labelCls}>Плитка</label>
          <input type="color" className="h-8 w-full cursor-pointer rounded border border-white/10 bg-transparent" value={tile.color} onChange={(e) => onChange({ color: e.target.value })} />
        </div>
        {tile.layout === "checker" ? (
          <div>
            <label className={labelCls}>2-й цвет</label>
            <input type="color" className="h-8 w-full cursor-pointer rounded border border-white/10 bg-transparent" value={tile.color2 || "#1f2937"} onChange={(e) => onChange({ color2: e.target.value })} />
          </div>
        ) : (
          <div>
            <label className={labelCls}>Глянец</label>
            <label className="flex h-8 items-center justify-center rounded border border-white/10">
              <input type="checkbox" checked={!!tile.gloss} onChange={(e) => onChange({ gloss: e.target.checked })} />
            </label>
          </div>
        )}
        <div>
          <label className={labelCls}>Затирка</label>
          <input type="color" className="h-8 w-full cursor-pointer rounded border border-white/10 bg-transparent" value={tile.grout} onChange={(e) => onChange({ grout: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Шов, мм</label>
          <input className={inputCls} type="number" min="0.5" max="10" step="0.5" value={Math.round(tile.joint * 10000) / 10} onChange={(e) => onChange({ joint: Math.min(Math.max(Number(e.target.value) / 1000, 0.0005), 0.01) })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <input className={inputCls} placeholder="Артикул / коллекция" value={tile.note || ""} onChange={(e) => onChange({ note: e.target.value })} />
        <input className={inputCls} type="number" min="1" placeholder="Плиток в коробке" value={tile.perBox || ""} onChange={(e) => onChange({ perBox: Number(e.target.value) > 0 ? Math.round(Number(e.target.value)) : undefined })} />
      </div>

      <div className="flex flex-wrap gap-1">
        {PRESETS.map((p) => (
          <button key={p.label} onClick={() => onChange(p.t)} className="rounded-md bg-white/5 px-2 py-1 text-[11px] text-white/60 hover:bg-white/10 hover:text-white">
            {p.label}
          </button>
        ))}
      </div>

      {cnt && (
        <div className="text-[11px] text-white/50">
          Нужно: <b className="text-[#D4AF37]">{cnt.pieces} шт</b> ≈ {cnt.m2.toFixed(2).replace(".", ",")} м²
          {cnt.boxes ? ` · ${cnt.boxes} кор.` : ""} · запас {Math.round(TILE_LAYOUTS[tile.layout].waste * 100)}% на подрезку
        </div>
      )}
    </div>
  )
}

export default TileSpecEditor
