import Icon from "@/components/ui/icon"
import { PlanTool } from "@/components/crm/planner/PlanCanvas"
import { FURNITURE_PRESETS, FurnitureKind, HEATING_PRESETS, HeatingKind, LibraryItem } from "@/lib/planner/types"

interface Props {
  tool: PlanTool
  clearDraft?: () => void
  setTool: (t: PlanTool) => void
  furnitureKind: FurnitureKind
  setFurnitureKind: (k: FurnitureKind) => void
  heatingKind: HeatingKind
  setHeatingKind: (k: HeatingKind) => void
  library: LibraryItem[]
  libraryItemId: number | null
  setLibraryItemId: (id: number | null) => void
  onDeleteLibraryItem: (id: number) => Promise<void>
  onCreateLibraryItem: () => void
}

const GROUPS = ["Спальня", "Гостиная", "Кухня", "Санузел", "Прочее"] as const

const btn = (on: boolean) =>
  `flex min-h-[34px] items-center gap-1.5 rounded-lg px-2.5 text-sm transition-colors ${
    on ? "bg-[#D4AF37] text-[#161616]" : "bg-white/5 text-white/60 hover:bg-white/10"
  }`

/** Что ставим на слое «Мебель и отделка»: предметы по группам и зоны тёплого пола */
export function PlannerInteriorPicker({
  tool,
  clearDraft,
  setTool,
  furnitureKind,
  setFurnitureKind,
  heatingKind,
  setHeatingKind,
  library,
  libraryItemId,
  setLibraryItemId,
  onDeleteLibraryItem,
  onCreateLibraryItem,
}: Props) {
  const kinds = Object.keys(FURNITURE_PRESETS) as FurnitureKind[]
  const pick = (t: PlanTool) => {
    setTool(t)
    clearDraft?.()
  }
  return (
    <div className="mb-4 space-y-3 rounded-xl border border-white/10 bg-[#1f1f1f] p-3">
      <div className="flex flex-wrap gap-2">
        <button className={btn(tool === "select")} onClick={() => pick("select")}>
          <Icon name="MousePointer2" size={15} />
          Выбор и перенос
        </button>
        <button className={btn(tool === "furniture")} onClick={() => pick("furniture")}>
          <Icon name="Sofa" size={15} />
          Мебель
        </button>
        <button className={btn(tool === "heating")} onClick={() => pick("heating")}>
          <Icon name="Thermometer" size={15} />
          Тёплый пол
        </button>
        <span className="flex items-center pl-1 text-xs text-white/40">
          Отделку пола, стен и потолка задайте в карточке помещения справа — щёлкните по комнате
        </span>
      </div>

      {tool === "furniture" && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[#D4AF37]/25 bg-[#D4AF37]/5 p-1.5">
            <span className="w-20 shrink-0 pl-1 text-xs uppercase text-[#D4AF37]/80">Мои</span>
            {library.map((l) => (
              <span key={l.id} className="group relative">
                <button className={btn(libraryItemId === l.id)} onClick={() => setLibraryItemId(l.id)} title={`${Math.round(l.width * 1000)}×${Math.round(l.depth * 1000)}×${Math.round(l.height * 1000)} мм`}>
                  {l.color && <span className="h-2.5 w-2.5 rounded-sm" style={{ background: l.color }} />}
                  {l.name}
                  <span className="text-[11px] opacity-50">
                    {Math.round(l.width * 1000)}×{Math.round(l.depth * 1000)}
                  </span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Удалить «${l.name}» из библиотеки? На уже расставленных планах предмет останется`)) onDeleteLibraryItem(l.id)
                  }}
                  title="Удалить из библиотеки"
                  className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-[#2a2a2a] text-white/60 hover:text-red-300 group-hover:flex"
                >
                  <Icon name="X" size={11} />
                </button>
              </span>
            ))}
            <button onClick={onCreateLibraryItem} className="flex min-h-[34px] items-center gap-1 rounded-lg border border-dashed border-[#D4AF37]/40 px-2.5 text-sm text-[#D4AF37] hover:bg-[#D4AF37]/10">
              <Icon name="Plus" size={14} />
              Новый предмет
            </button>
            {library.length === 0 && (
              <span className="text-xs text-white/40">Сохраняйте свои предметы — кнопка «В библиотеку» в карточке предмета</span>
            )}
          </div>
          {GROUPS.map((g) => (
            <div key={g} className="flex flex-wrap items-center gap-1.5">
              <span className="w-20 shrink-0 text-xs uppercase text-white/35">{g}</span>
              {kinds
                .filter((k) => FURNITURE_PRESETS[k].group === g)
                .map((k) => (
                  <button key={k} className={btn(furnitureKind === k && !libraryItemId)} onClick={() => setFurnitureKind(k)}>
                    {FURNITURE_PRESETS[k].label}
                  </button>
                ))}
            </div>
          ))}
          <div className="text-xs text-white/40">
            Щелчок — поставить. Золотые размеры показывают отступ каждой стороны предмета до стены в мм, зелёная метка — вплотную. Пристенные предметы сами прижимаются к стене и разворачиваются в комнату; с Alt — без прилипания. Точный отступ, размер и поворот — в карточке справа
          </div>
        </div>
      )}

      {tool === "heating" && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(HEATING_PRESETS) as HeatingKind[]).map((k) => (
              <button key={k} className={btn(heatingKind === k)} onClick={() => setHeatingKind(k)}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: HEATING_PRESETS[k].color }} />
                {HEATING_PRESETS[k].label}
                <span className="text-xs opacity-60">· {HEATING_PRESETS[k].hint}</span>
              </button>
            ))}
          </div>
          <div className="text-xs text-white/40">
            Обведите зону по углам щелчками и замкните у первой точки. Места под мебелью без ножек вычитаются автоматически. Терморегулятор поставьте на слое «Электрика»
          </div>
        </div>
      )}
    </div>
  )
}

export default PlannerInteriorPicker
