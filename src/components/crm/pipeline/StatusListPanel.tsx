import Icon from "@/components/ui/icon"
import { ObjectStatus } from "@/lib/api"
import { getStatusBadgeClass } from "@/lib/objectStatusColors"

interface StatusListPanelProps {
  statuses: ObjectStatus[]
  canManage: boolean
  onCreateClick: () => void
  onDragStart: (id: number) => void
  onDrop: (targetId: number) => void
  onEdit: (s: ObjectStatus) => void
  onToggleArchive: (s: ObjectStatus) => void
  onDelete: (s: ObjectStatus) => void
}

export function StatusListPanel({
  statuses,
  canManage,
  onCreateClick,
  onDragStart,
  onDrop,
  onEdit,
  onToggleArchive,
  onDelete,
}: StatusListPanelProps) {
  return (
    <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-medium">Список статусов</p>
          <p className="text-xs text-white/40 mt-0.5">
            Статусы сортируются перетаскиванием мышью. Используемые статусы удаляются через архив.
          </p>
        </div>
        {canManage && (
          <button
            onClick={onCreateClick}
            className="w-9 h-9 flex items-center justify-center bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] rounded-lg shrink-0"
            title="Добавить статус"
          >
            <Icon name="Plus" size={16} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {statuses.map((s) => (
          <div
            key={s.id}
            draggable={canManage}
            onDragStart={() => onDragStart(s.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(s.id)}
            className={`flex items-center justify-between bg-[#161616] border border-white/10 rounded-lg px-4 py-3 ${s.is_archived ? "opacity-50" : ""}`}
          >
            <div className="flex items-center gap-3">
              {canManage && <Icon name="GripVertical" size={16} className="text-white/25 cursor-grab shrink-0" />}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(s.color)}`}>
                    {s.name}
                  </span>
                  {s.is_default && <span className="text-[10px] text-white/40">По умолчанию</span>}
                  {s.is_active_stage && <span className="text-[10px] text-green-400">Считается активным</span>}
                  {s.is_final && <span className="text-[10px] text-white/40">Финальный</span>}
                  {s.is_archived && <span className="text-[10px] text-white/30">В архиве</span>}
                </div>
                <p className="text-xs text-white/30 mt-1">
                  Порядок: {s.sort_order} · Объектов: {s.object_count}
                </p>
              </div>
            </div>

            {canManage && (
              <div className="flex items-center gap-4 text-sm shrink-0">
                <button onClick={() => onEdit(s)} className="text-blue-400 hover:underline">
                  Изменить
                </button>
                <button onClick={() => onToggleArchive(s)} className="text-blue-400 hover:underline">
                  {s.is_archived ? "Вернуть" : "В архив"}
                </button>
                {!s.is_default && (
                  <button onClick={() => onDelete(s)} className="text-red-400 hover:underline">
                    Удалить
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
