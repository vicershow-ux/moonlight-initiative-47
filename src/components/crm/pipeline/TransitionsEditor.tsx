import Icon from "@/components/ui/icon"
import { Checkbox } from "@/components/ui/checkbox"
import { ObjectStatus } from "@/lib/api"
import { getStatusBadgeClass } from "@/lib/objectStatusColors"

interface TransitionsEditorProps {
  selectedStatus: ObjectStatus | null
  otherStatuses: ObjectStatus[]
  statuses: ObjectStatus[]
  pendingToIds: Set<number>
  toggleTo: (id: number, checked: boolean) => void
  canManage: boolean
  savingTransitions: boolean
  onSaveTransitions: () => void
}

export function TransitionsEditor({
  selectedStatus,
  otherStatuses,
  statuses,
  pendingToIds,
  toggleTo,
  canManage,
  savingTransitions,
  onSaveTransitions,
}: TransitionsEditorProps) {
  return (
    <div className="bg-[#161616] border border-white/10 rounded-lg p-4 h-fit">
      <p className="text-[11px] text-white/40 uppercase tracking-wide mb-3">Редактирование переходов</p>

      {selectedStatus ? (
        <>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedStatus.color)}`}>
            {selectedStatus.name}
          </span>
          <p className="text-xs text-white/30 mt-2">
            Можно настроить {otherStatuses.length} потенциальных переходов
          </p>
          <p className="text-xs text-white/30">Активные исходящие: {pendingToIds.size}</p>

          <div className="mt-4">
            <p className="text-xs text-white/40 mb-2">Текущие связи</p>
            <div className="flex items-center flex-wrap gap-1.5">
              <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeClass(selectedStatus.color)}`}>
                {selectedStatus.name}
              </span>
              {Array.from(pendingToIds).map((id) => {
                const st = statuses.find((x) => x.id === id)
                if (!st) return null
                return (
                  <span key={id} className="flex items-center gap-1.5">
                    <Icon name="ArrowRight" size={12} className="text-white/20" />
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeClass(st.color)}`}>
                      {st.name}
                    </span>
                  </span>
                )
              })}
              {pendingToIds.size === 0 && <span className="text-xs text-white/20">Нет разрешённых переходов</span>}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs text-white/40 mb-2">Можно перейти в</p>
            <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
              {otherStatuses.map((s) => (
                <label
                  key={s.id}
                  className="flex items-start gap-2.5 bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2.5 cursor-pointer"
                >
                  <Checkbox
                    checked={pendingToIds.has(s.id)}
                    onCheckedChange={(v) => toggleTo(s.id, !!v)}
                    disabled={!canManage}
                    className="mt-0.5"
                  />
                  <div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeClass(s.color)}`}>{s.name}</span>
                    <p className="text-[11px] text-white/30 mt-1">
                      Разрешить прямой переход из статуса «{selectedStatus.name}».
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {canManage && (
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
              <p className="text-[11px] text-white/30 max-w-[220px]">
                Изменения применятся после сохранения и сразу повлияют на доступные переходы объектов.
              </p>
              <button
                onClick={onSaveTransitions}
                disabled={savingTransitions}
                className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm px-3 py-2 rounded-lg disabled:opacity-60 shrink-0"
              >
                {savingTransitions && <Icon name="Loader2" size={14} className="animate-spin" />}
                Сохранить переходы
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-xs text-white/30">Выберите статус слева</p>
      )}
    </div>
  )
}
