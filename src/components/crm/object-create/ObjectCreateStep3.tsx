const YES_NO = [
  { value: "", label: "Не указано" },
  { value: "есть", label: "Есть" },
  { value: "нет", label: "Нет" },
]
const MATERIAL_OPTIONS = [
  { value: "", label: "Не указано" },
  { value: "наш", label: "Наш" },
  { value: "заказчика", label: "Заказчика" },
  { value: "частично", label: "Частично" },
]
const COMPLETION_TYPES = [
  { value: "", label: "Не указано" },
  { value: "стандарт", label: "Стандарт" },
  { value: "премиум", label: "Премиум" },
]
const DESIGN_PROJECTS = [
  "Планировочное решение",
  "Экспресс проект",
  "Экспресс + визуализация",
  "Стандарт проект",
  "Стандарт + визуализация",
  "Премиум проект",
  "Премиум + визуализация",
  "Инженерный проект (ЭОМ, ВИК)",
  "Авторский надзор",
]

interface ObjectCreateStep3Props {
  hasElevator: string
  setHasElevator: (v: string) => void
  completionType: string
  setCompletionType: (v: string) => void
  materialUnloading: string
  setMaterialUnloading: (v: string) => void
  roughMaterial: string
  setRoughMaterial: (v: string) => void
  finishMaterial: string
  setFinishMaterial: (v: string) => void
  kitchenFurniture: string
  setKitchenFurniture: (v: string) => void
  designProjects: string[]
  toggleDesignProject: (value: string) => void
}

export function ObjectCreateStep3({
  hasElevator,
  setHasElevator,
  completionType,
  setCompletionType,
  materialUnloading,
  setMaterialUnloading,
  roughMaterial,
  setRoughMaterial,
  finishMaterial,
  setFinishMaterial,
  kitchenFurniture,
  setKitchenFurniture,
  designProjects,
  toggleDesignProject,
}: ObjectCreateStep3Props) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-medium">Дополнительные параметры</p>
        <p className="text-xs text-white/40 mt-1">Эти поля необязательны для заполнения</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/50">Наличие лифта</label>
          <select
            value={hasElevator}
            onChange={(e) => setHasElevator(e.target.value)}
            className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none"
          >
            {YES_NO.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/50">Комплектация</label>
          <select
            value={completionType}
            onChange={(e) => setCompletionType(e.target.value)}
            className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none"
          >
            {COMPLETION_TYPES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/50">Разгрузка материала</label>
          <select
            value={materialUnloading}
            onChange={(e) => setMaterialUnloading(e.target.value)}
            className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none"
          >
            {YES_NO.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/50">Черновой материал</label>
          <select
            value={roughMaterial}
            onChange={(e) => setRoughMaterial(e.target.value)}
            className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none"
          >
            {MATERIAL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/50">Чистовой материал</label>
          <select
            value={finishMaterial}
            onChange={(e) => setFinishMaterial(e.target.value)}
            className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none"
          >
            {MATERIAL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/50">Кухня и мебель</label>
          <select
            value={kitchenFurniture}
            onChange={(e) => setKitchenFurniture(e.target.value)}
            className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none"
          >
            {MATERIAL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <p className="text-xs text-white/50 mb-2">Дизайн-проект (можно выбрать несколько)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DESIGN_PROJECTS.map((dp) => (
            <label
              key={dp}
              className="flex items-center gap-2 text-sm bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 cursor-pointer hover:border-white/20 transition-colors"
            >
              <input
                type="checkbox"
                checked={designProjects.includes(dp)}
                onChange={() => toggleDesignProject(dp)}
                className="w-4 h-4 rounded border-white/20 bg-[#161616]"
              />
              {dp}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
