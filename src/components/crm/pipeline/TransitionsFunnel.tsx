import { ObjectStatus } from "@/lib/api"
import { getStatusBadgeClass } from "@/lib/objectStatusColors"

interface TransitionsFunnelProps {
  activeStatuses: ObjectStatus[]
  nonFinalStatuses: ObjectStatus[]
  finalStatuses: ObjectStatus[]
  selectedFromId: number | null
  setSelectedFromId: (id: number) => void
  countTransitionsFrom: (id: number) => number
}

export function TransitionsFunnel({
  activeStatuses,
  nonFinalStatuses,
  finalStatuses,
  selectedFromId,
  setSelectedFromId,
  countTransitionsFrom,
}: TransitionsFunnelProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium">Воронка переходов</p>
          <p className="text-xs text-white/30 mt-0.5">
            Порядок берётся из списка статусов. Финальные статусы вынесены отдельно.
          </p>
        </div>
        <p className="text-xs text-[#D4AF37] shrink-0">Активные статусы: {activeStatuses.length}</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        {nonFinalStatuses.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedFromId(s.id)}
            className={`text-left bg-[#161616] border rounded-lg px-3 py-2.5 w-[190px] transition-colors ${
              selectedFromId === s.id ? "border-[#D4AF37]" : "border-white/10 hover:border-white/20"
            }`}
          >
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeClass(s.color)}`}>{s.name}</span>
              {selectedFromId === s.id && <span className="text-[10px] text-[#D4AF37] font-medium">Выбран</span>}
            </div>
            <p className="text-xs text-white/30 mt-1.5">Переходов: {countTransitionsFrom(s.id)}</p>
          </button>
        ))}
      </div>

      {finalStatuses.length > 0 && (
        <div className="border-t border-white/10 pt-4">
          <p className="text-sm font-medium">
            Финальные статусы <span className="text-xs text-white/30 font-normal ml-1">Ветка завершения или отмены</span>
          </p>
          <div className="flex flex-wrap gap-3 mt-2.5">
            {finalStatuses.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedFromId(s.id)}
                className={`text-left bg-[#161616] border rounded-lg px-3 py-2.5 w-[190px] transition-colors ${
                  selectedFromId === s.id ? "border-[#D4AF37]" : "border-white/10 hover:border-white/20"
                }`}
              >
                <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeClass(s.color)}`}>{s.name}</span>
                <p className="text-xs text-white/30 mt-1.5">Переходов: {countTransitionsFrom(s.id)}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
