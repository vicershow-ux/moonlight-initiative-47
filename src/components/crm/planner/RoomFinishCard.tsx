import { useState } from "react"
import Icon from "@/components/ui/icon"
import { fmtNum, fromMm, toMm } from "@/lib/planner/geometry"
import {
  CEILING_FINISHES,
  CeilingFinish,
  FLOOR_FINISHES,
  FloorFinish,
  PlanRoom,
  PlanScheme,
  RoomFinish,
  WALL_FINISHES,
  WallFinish,
  WallOverride,
  wallFinishOf,
  floorTileOf,
  wallTileOf,
} from "@/lib/planner/types"
import { TileSpecEditor } from "./TileSpecEditor"
import { MaterialPicker } from "./MaterialPicker"
import { finishCalc } from "@/lib/planner/finishes"

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"
const labelCls = "mb-1.5 block text-xs text-white/50"

interface Props {
  room: PlanRoom
  scheme: PlanScheme
  onUpdate: (roomId: string, patch: Partial<RoomFinish>, applyToAll?: boolean) => void
  /** Подсветка стены на плане при наведении на строку */
  onHoverWall?: (wallId: string | null) => void
}

/** Отделка помещения: пол, стены, потолок, плинтусы, черновые работы и расчёт объёмов */
export function RoomFinishCard({ room, scheme, onUpdate, onHoverWall }: Props) {
  const c = finishCalc(scheme, room)
  const f = c.finish
  const [all, setAll] = useState(false)
  const set = (patch: Partial<RoomFinish>) => onUpdate(room.id, patch, all)
  const mm = (v: number | undefined) => toMm(v || 0)
  const isTileFloor = f.floor === "tile" || f.floor === "porcelain"
  const [openWall, setOpenWall] = useState<string | null>(null)
  // Своя отделка стены — меняем только эту комнату, не все
  const setWall = (wallId: string, patch: Partial<WallOverride> | null) => {
    const cur = { ...(f.walls || {}) }
    if (patch === null) delete cur[wallId]
    else cur[wallId] = { ...wallFinishOf(f, wallId), ...(cur[wallId] || {}), ...patch }
    if (cur[wallId]) delete (cur[wallId] as WallOverride & { own?: boolean }).own
    onUpdate(room.id, { walls: cur })
  }

  return (
    <div className="rounded-xl border border-[#D4AF37]/30 bg-[#1f1f1f] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon name="Paintbrush" size={15} />
          Отделка · {room.name}
        </div>
        <label className="flex items-center gap-1.5 text-xs text-white/50">
          <input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} />
          на все помещения
        </label>
      </div>

      <div className="mb-3">
        <label className={labelCls}>Пол</label>
        <div className="flex gap-2">
          <select className={inputCls} value={f.floor} onChange={(e) => set({ floor: e.target.value as FloorFinish })}>
            {(Object.keys(FLOOR_FINISHES) as FloorFinish[]).map((k) => (
              <option key={k} value={k}>
                {FLOOR_FINISHES[k].label}
              </option>
            ))}
          </select>
          {f.floor !== "none" && !isTileFloor && (
            <input
              type="color"
              className="h-[38px] w-11 shrink-0 cursor-pointer rounded-lg border border-white/10 bg-[#161616]"
              value={f.floorColor || FLOOR_FINISHES[f.floor].color}
              onChange={(e) => set({ floorColor: e.target.value })}
              title="Цвет покрытия на плане"
            />
          )}
        </div>
        {f.floor !== "none" && (
          <div className="mt-2">
            <MaterialPicker value={f.floorMaterial} onChange={(m) => set({ floorMaterial: m })} prefer={["floor", "tile", "stone", "wood"]} only="repeat" label="Своё покрытие с фото (вместо рисунка)" />
          </div>
        )}
        {isTileFloor && !f.floorMaterial && (
          <div className="mt-2">
            <TileSpecEditor tile={floorTileOf(f)} area={c.floorArea} onChange={(patch) => set({ floorTile: { ...floorTileOf(f), ...patch } })} />
          </div>
        )}
      </div>

      <div className="mb-3">
        <label className={labelCls}>Стены</label>
        <div className="flex gap-2">
          <select className={inputCls} value={f.wall} onChange={(e) => set({ wall: e.target.value as WallFinish })}>
            {(Object.keys(WALL_FINISHES) as WallFinish[]).map((k) => (
              <option key={k} value={k}>
                {WALL_FINISHES[k].label}
              </option>
            ))}
          </select>
          {f.wall !== "none" && (
            <input
              type="color"
              className="h-[38px] w-11 shrink-0 cursor-pointer rounded-lg border border-white/10 bg-[#161616]"
              value={f.wallColor || WALL_FINISHES[f.wall].color}
              onChange={(e) => set({ wallColor: e.target.value })}
              title="Цвет стен на плане"
            />
          )}
        </div>
        {f.wall !== "none" && (
          <div className="mt-2">
            <MaterialPicker value={f.wallMaterial} onChange={(m) => set({ wallMaterial: m })} prefer={["wallpaper", "paint", "stone", "tile"]} only="repeat" label="Свои обои или покрытие с фото — для всех стен" />
          </div>
        )}
      </div>

      {f.wall === "wallpaper" && (
        <div className="mb-3 grid grid-cols-3 gap-2">
          <div>
            <label className={labelCls}>Ширина рулона</label>
            <input className={inputCls} type="number" step="10" value={mm(f.rollWidth)} onChange={(e) => set({ rollWidth: Math.max(fromMm(Number(e.target.value)), 0.3) })} />
          </div>
          <div>
            <label className={labelCls}>Длина рулона</label>
            <input className={inputCls} type="number" step="10" value={mm(f.rollLength)} onChange={(e) => set({ rollLength: Math.max(fromMm(Number(e.target.value)), 1) })} />
          </div>
          <div>
            <label className={labelCls}>Раппорт</label>
            <input className={inputCls} type="number" step="10" min="0" value={mm(f.rapport)} onChange={(e) => set({ rapport: Math.max(fromMm(Number(e.target.value)), 0) })} />
          </div>
        </div>
      )}
      {(f.wall === "paint" || f.ceiling === "paint" || f.ceiling === "gkl") && (
        <div className="mb-3">
          <label className={labelCls}>Слоёв краски</label>
          <input className={inputCls} type="number" min="1" max="4" value={f.paintCoats || 2} onChange={(e) => set({ paintCoats: Math.min(Math.max(Number(e.target.value) || 1, 1), 4) })} />
        </div>
      )}
      {f.wall !== "tile" && (
        <div className="mb-3">
          <label className={labelCls}>Плитка на стенах до высоты, мм (фартук, панель; 0 — нет)</label>
          <input className={inputCls} type="number" min="0" step="50" value={mm(f.tileHeight)} onChange={(e) => set({ tileHeight: Math.max(fromMm(Number(e.target.value)), 0) })} />
        </div>
      )}
      {(f.wall === "tile" || (f.tileHeight || 0) > 0) && (
        <div className="mb-3">
          <label className={labelCls}>Плитка на стенах</label>
          <TileSpecEditor tile={wallTileOf(f)} area={c.wallTile} onChange={(patch) => set({ wallTile: { ...wallTileOf(f), ...patch } })} />
        </div>
      )}

      <div className="mb-3">
        <div className={labelCls}>Отделка по стенам — акцентная стена другим цветом или обоями</div>
        <div className="space-y-1.5">
          {c.walls.map((w) => {
            const own = w.finish.own
            const open = openWall === w.id
            const col = w.finish.wall !== "none" ? w.finish.wallColor || WALL_FINISHES[w.finish.wall].color : "transparent"
            return (
              <div
                key={w.id}
                className={`rounded-lg border ${own ? "border-[#D4AF37]/40 bg-[#D4AF37]/5" : "border-white/10 bg-[#161616]"}`}
                onMouseEnter={() => onHoverWall?.(w.id)}
                onMouseLeave={() => onHoverWall?.(null)}
              >
                <button onClick={() => setOpenWall(open ? null : w.id)} className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm">
                  <span className="h-3.5 w-3.5 shrink-0 rounded-sm border border-white/20" style={{ background: col }} />
                  <span className="font-medium">Стена {w.index + 1}</span>
                  <span className="text-xs text-white/40">{toMm(w.length)} мм · {fmtNum(w.net, 2)} м²</span>
                  <span className={`ml-auto truncate text-xs ${own ? "text-[#D4AF37]" : "text-white/40"}`}>
                    {own ? `акцент: ${WALL_FINISHES[w.finish.wall].label.toLowerCase()}` : "как в комнате"}
                  </span>
                  <Icon name={open ? "ChevronUp" : "ChevronDown"} size={14} className="shrink-0 text-white/40" />
                </button>
                {open && (
                  <div className="space-y-2 border-t border-white/10 p-2.5">
                    <div className="flex gap-2">
                      <select
                        className={inputCls}
                        value={own ? w.finish.wall : "__room"}
                        onChange={(e) => (e.target.value === "__room" ? setWall(w.id, null) : setWall(w.id, { wall: e.target.value as WallFinish }))}
                      >
                        <option value="__room">Как в комнате ({WALL_FINISHES[f.wall].label.toLowerCase()})</option>
                        {(Object.keys(WALL_FINISHES) as WallFinish[])
                          .filter((k) => k !== "none")
                          .map((k) => (
                            <option key={k} value={k}>
                              {WALL_FINISHES[k].label}
                            </option>
                          ))}
                      </select>
                      {own && (
                        <input
                          type="color"
                          className="h-[38px] w-11 shrink-0 cursor-pointer rounded-lg border border-white/10 bg-[#161616]"
                          value={w.finish.wallColor || WALL_FINISHES[w.finish.wall].color}
                          onChange={(e) => setWall(w.id, { wallColor: e.target.value })}
                          title="Цвет стены"
                        />
                      )}
                    </div>
                    {own && (
                      <>
                        <MaterialPicker
                          value={w.finish.material}
                          onChange={(m) => setWall(w.id, { material: m })}
                          prefer={["fresco", "wallpaper", "stone", "tile"]}
                          label="Свой материал: обои, мрамор или фреска-панно"
                        />
                        {w.finish.material?.mode === "panel" && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="mb-1 block text-[11px] text-white/40">Панно от левого угла, мм</label>
                              <input
                                className={inputCls}
                                type="number"
                                step="10"
                                placeholder={`по центру: ${toMm(Math.max((w.length - Math.min(w.finish.material.w, w.length)) / 2, 0))}`}
                                value={w.finish.panelX != null ? toMm(w.finish.panelX) : ""}
                                onChange={(e) => setWall(w.id, { panelX: e.target.value === "" ? undefined : Math.max(fromMm(Number(e.target.value)), 0) })}
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-[11px] text-white/40">Низ панно от пола, мм</label>
                              <input
                                className={inputCls}
                                type="number"
                                step="10"
                                min="0"
                                value={toMm(w.finish.panelZ || 0)}
                                onChange={(e) => setWall(w.id, { panelZ: Math.max(fromMm(Number(e.target.value)), 0) })}
                              />
                            </div>
                          </div>
                        )}
                        <input
                          className={inputCls}
                          placeholder="Артикул или название для сметы, например «Обои Marburg 31038»"
                          value={w.finish.note || ""}
                          onChange={(e) => setWall(w.id, { note: e.target.value })}
                        />
                        {w.finish.wall === "tile" && (
                          <TileSpecEditor
                            tile={wallTileOf(f, w.finish)}
                            area={w.tile}
                            onChange={(patch) => setWall(w.id, { tile: { ...wallTileOf(f, w.finish), ...patch } })}
                          />
                        )}
                        {w.finish.wall === "wallpaper" && (
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="mb-1 block text-[11px] text-white/40">Ширина рулона</label>
                              <input className={inputCls} type="number" step="10" value={mm(w.finish.rollWidth || 1.06)} onChange={(e) => setWall(w.id, { rollWidth: Math.max(fromMm(Number(e.target.value)), 0.3) })} />
                            </div>
                            <div>
                              <label className="mb-1 block text-[11px] text-white/40">Длина рулона</label>
                              <input className={inputCls} type="number" step="10" value={mm(w.finish.rollLength || 10.05)} onChange={(e) => setWall(w.id, { rollLength: Math.max(fromMm(Number(e.target.value)), 1) })} />
                            </div>
                            <div>
                              <label className="mb-1 block text-[11px] text-white/40">Раппорт</label>
                              <input className={inputCls} type="number" step="10" min="0" value={mm(w.finish.rapport)} onChange={(e) => setWall(w.id, { rapport: Math.max(fromMm(Number(e.target.value)), 0) })} />
                            </div>
                          </div>
                        )}
                        <div className="text-[11px] text-white/40">
                          Под отделку: {fmtNum(w.main, 2)} м²
                          {(() => {
                            const g = c.groups.find((x) => x.walls.includes(w.index + 1) && x.accent)
                            if (!g) return ""
                            return g.finish.wall === "wallpaper" ? ` · ${g.rolls} рул.` : g.finish.wall === "paint" ? ` · ${fmtNum(g.paint, 1)} л краски` : ""
                          })()}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-1 text-[11px] text-white/35">Наведите на стену — она подсветится на плане</div>
      </div>

      <div className="mb-3">
        <label className={labelCls}>Потолок</label>
        <select className={inputCls} value={f.ceiling} onChange={(e) => set({ ceiling: e.target.value as CeilingFinish })}>
          {(Object.keys(CEILING_FINISHES) as CeilingFinish[]).map((k) => (
            <option key={k} value={k}>
              {CEILING_FINISHES[k].label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-white/70">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={f.skirting} onChange={(e) => set({ skirting: e.target.checked })} />
          Плинтус напольный
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={f.cornice} onChange={(e) => set({ cornice: e.target.checked })} />
          Потолочный плинтус
        </label>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Стяжка пола, мм (0 — нет)</label>
          <input className={inputCls} type="number" min="0" step="5" value={mm(f.screed)} onChange={(e) => set({ screed: Math.max(fromMm(Number(e.target.value)), 0) })} />
        </div>
        <div>
          <label className={labelCls}>Штукатурка стен, мм (0 — нет)</label>
          <input className={inputCls} type="number" min="0" step="5" value={mm(f.wallPlaster)} onChange={(e) => set({ wallPlaster: Math.max(fromMm(Number(e.target.value)), 0) })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          ["Пол", `${fmtNum(c.floorArea, 2)} м²`],
          ["Стены без проёмов", `${fmtNum(c.wallNet, 2)} м²`],
          ...(c.wallTile > 0 ? [["Плитка на стенах", `${fmtNum(c.wallTile, 2)} м²`]] : []),
          ...(c.rolls > 0 ? [["Обои", `${c.rolls} рул.${c.groups.some((g) => g.accent) ? " (с акцентом)" : ` (${c.stripsPerRoll} полос/рул.)`}`]] : []),
          ...(c.paintWall > 0 ? [["Краска стен", `${fmtNum(c.paintWall, 1)} л`]] : []),
          ...(c.paintCeiling > 0 ? [["Краска потолка", `${fmtNum(c.paintCeiling, 1)} л`]] : []),
          ...(c.skirting > 0 ? [["Плинтус", `${fmtNum(c.skirting, 2)} м (без дверей)`]] : []),
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-[#161616] p-2">
            <div className="text-white/40">{k}</div>
            <div className="font-semibold">{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RoomFinishCard
