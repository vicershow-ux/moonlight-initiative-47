import Icon from "@/components/ui/icon"
import { DeleteButton } from "@/components/ui/delete-button"
import { fmtNum, toMm } from "@/lib/planner/geometry"
import { LINK_SPECS, PlanGroup, PlanLayer, PlanLink } from "@/lib/planner/types"
import { CableTotals } from "@/lib/planner/cable"

const inputCls =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"

const labelCls = "mb-1.5 block text-xs text-white/50"

interface Props {
  selectedLink: PlanLink
  layer: Exclude<PlanLayer, "plan">
  isElectric: boolean
  groups: PlanGroup[]
  linkCable: (l: PlanLink) => CableTotals
  onUpdateLink: (id: string, patch: Partial<PlanLink>) => void
  onDeleteLink: (id: string) => void
  onAddGroup: () => string
}

export function SelectedLinkCard({
  selectedLink,
  layer,
  isElectric,
  groups,
  linkCable,
  onUpdateLink,
  onDeleteLink,
  onAddGroup,
}: Props) {
  return (
    <div className="rounded-xl border border-[#D4AF37]/30 bg-[#1f1f1f] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon name="Spline" size={15} />
          {layer === "electric" ? "Кабель" : "Труба"}
        </div>
        <DeleteButton onConfirm={() => onDeleteLink(selectedLink.id)} title="Удалить линию?" />
      </div>

      <div className="mb-3">
        <label className={labelCls}>
          {layer === "electric" ? "Сечение" : "Диаметр"}
        </label>
        <select
          className={inputCls}
          value={selectedLink.spec}
          onChange={(e) => onUpdateLink(selectedLink.id, { spec: e.target.value })}
        >
          {LINK_SPECS[layer].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {layer === "electric" && (
        <div className="mb-3">
          <label className={labelCls}>Группа щита</label>
          <select
            className={inputCls}
            value={selectedLink.groupId || ""}
            onChange={(e) => {
              if (e.target.value === "__new") {
                onUpdateLink(selectedLink.id, { groupId: onAddGroup() })
                return
              }
              onUpdateLink(selectedLink.id, { groupId: e.target.value || null })
            }}
          >
            <option value="">Без группы</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                Гр. {g.num} · {g.breaker}
                {g.name ? ` · ${g.name}` : ""}
              </option>
            ))}
            <option value="__new">+ Новая группа</option>
          </select>
        </div>
      )}

      <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-white/70">
        <input
          type="checkbox"
          checked={selectedLink.ortho !== false}
          onChange={(e) => onUpdateLink(selectedLink.id, { ortho: e.target.checked })}
          className="h-4 w-4 accent-[#D4AF37]"
        />
        Только прямые углы (по ГОСТ)
      </label>

      <div className="mb-3 space-y-1 text-sm">
        {(() => {
          const c = linkCable(selectedLink)
          return (
            <>
              <div className="flex justify-between">
                <span className="text-white/40">По плану</span>
                <span>{fmtNum(toMm(c.plan), 0)} мм</span>
              </div>
              {isElectric && (
                <>
                  <div className="flex justify-between">
                    <span className="text-white/40">Спуски к точкам</span>
                    <span>+{fmtNum(toMm(c.drops), 0)} мм</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Запас на концы</span>
                    <span>+{fmtNum(toMm(c.reserve), 0)} мм</span>
                  </div>
                </>
              )}
              <div className="flex justify-between border-t border-white/10 pt-1">
                <span className="text-white/60">{isElectric ? "С запасом" : "Длина"}</span>
                <span className="font-medium text-[#D4AF37]">{fmtNum(toMm(c.total), 0)} мм</span>
              </div>
            </>
          )
        })()}
        <div className="flex justify-between pt-1">
          <span className="text-white/40">Поворотов задано</span>
          <span>{(selectedLink.points || []).length}</span>
        </div>
      </div>

      {(selectedLink.points || []).length > 0 && (
        <button
          onClick={() => onUpdateLink(selectedLink.id, { points: [] })}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10"
        >
          <Icon name="RotateCcw" size={14} />
          Сбросить повороты
        </button>
      )}

      <div className="mt-2 text-xs text-white/40">
        Квадратики на трассе — повороты, их можно перетаскивать мышью
      </div>
    </div>
  )
}

export default SelectedLinkCard
