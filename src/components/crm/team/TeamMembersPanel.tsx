import Icon from "@/components/ui/icon"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TeamMember } from "@/lib/api"
import { positionOptions, getPositionLabel, getPositionColor, PositionKey } from "@/lib/positions"

export type RoleFilter = "all" | PositionKey
export type StatusFilter = "all" | "active" | "inactive" | "never"
export type SortKey = "created_desc" | "created_asc" | "name_asc" | "last_login" | "position"

interface TeamMembersPanelProps {
  tab: "members" | "invites"
  members: TeamMember[]
  filtered: TeamMember[]
  loading: boolean
  canManage: boolean

  search: string
  setSearch: (v: string) => void
  roleFilter: RoleFilter
  setRoleFilter: (v: RoleFilter) => void
  statusFilter: StatusFilter
  setStatusFilter: (v: StatusFilter) => void
  sortKey: SortKey
  setSortKey: (v: SortKey) => void
  resetFilters: () => void

  togglingId: number | null
  handleToggleActive: (m: TeamMember) => void
  handleChangePosition: (m: TeamMember, newPosition: string) => void
  handleDelete: (id: number) => void
  setPasswordFor: (m: TeamMember) => void
  setOpen: (v: boolean) => void

  formatDate: (d: string) => string
  formatDateTime: (d: string) => string
  initials: (name: string) => string
}

export function TeamMembersPanel({
  tab,
  members,
  filtered,
  loading,
  canManage,
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  sortKey,
  setSortKey,
  resetFilters,
  togglingId,
  handleToggleActive,
  handleChangePosition,
  handleDelete,
  setPasswordFor,
  setOpen,
  formatDate,
  formatDateTime,
  initials,
}: TeamMembersPanelProps) {
  if (tab === "invites") {
    return (
      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
        {members.filter((m) => m.role !== "owner").length === 0 ? (
          <div className="text-center py-16 text-white/30 text-sm">Пока нет добавленных сотрудников</div>
        ) : (
          <div className="flex flex-col gap-2">
            {members
              .filter((m) => m.role !== "owner")
              .map((m) => (
                <div key={m.id} className="flex items-center justify-between bg-[#161616] border border-white/10 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium">
                      {initials(m.full_name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{m.full_name}</p>
                      <p className="text-xs text-white/40">{m.email}</p>
                    </div>
                  </div>
                  <p className="text-xs text-white/40">Добавлен {formatDate(m.created_at)}</p>
                </div>
              ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Поиск сотрудника</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Имя или email"
              className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Роль</label>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleFilter)}>
              <SelectTrigger className="bg-[#161616] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все роли</SelectItem>
                {positionOptions.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Статус</label>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="bg-[#161616] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="active">Активен</SelectItem>
                <SelectItem value="inactive">Отключён</SelectItem>
                <SelectItem value="never">Не входил ни разу</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Сортировка</label>
            <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
              <SelectTrigger className="bg-[#161616] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_desc">По дате добавления</SelectItem>
                <SelectItem value="name_asc">По имени А-Я</SelectItem>
                <SelectItem value="last_login">По последнему входу</SelectItem>
                <SelectItem value="position">По роли</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
          <p className="text-xs text-white/40">Найдено сотрудников: {filtered.length}</p>
          <div className="flex items-center gap-3">
            <button onClick={resetFilters} className="text-xs text-[#D4AF37] hover:underline">
              Сбросить фильтры
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
        {loading ? (
          <div className="flex justify-center py-16">
            <Icon name="Loader2" size={24} className="animate-spin text-white/40" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-medium mb-1">Сотрудников пока нет</p>
            <p className="text-sm text-white/30 mb-4">Добавьте первого сотрудника, чтобы распределить роли и доступ внутри компании.</p>
            {canManage && (
              <button
                onClick={() => setOpen(true)}
                className="bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg"
              >
                Пригласить первого сотрудника
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-xs uppercase border-b border-white/10">
                  <th className="text-left font-medium py-2 pr-4">Сотрудник</th>
                  <th className="text-left font-medium py-2 pr-4">Роль</th>
                  <th className="text-left font-medium py-2 pr-4">Статус</th>
                  <th className="text-left font-medium py-2 pr-4">Последний вход</th>
                  <th className="text-left font-medium py-2 pr-4">Дата добавления</th>
                  {canManage && <th className="text-left font-medium py-2 pr-4">Действия</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b border-white/5 last:border-0">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium shrink-0">
                          {initials(m.full_name)}
                        </div>
                        <div>
                          <p className="font-medium">{m.full_name}</p>
                          <p className="text-xs text-white/40">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      {canManage ? (
                        <Select value={m.position || "manager"} onValueChange={(v) => handleChangePosition(m, v)}>
                          <SelectTrigger className={`h-7 w-auto border-none px-2 py-0.5 rounded-full text-xs ${getPositionColor(m.position)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {positionOptions.map((p) => (
                              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getPositionColor(m.position)}`}>
                          {getPositionLabel(m.position)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${m.is_active ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                        {m.is_active ? "Активен" : "Отключён"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-white/40">
                      {m.last_login_at ? formatDateTime(m.last_login_at) : "—"}
                    </td>
                    <td className="py-3 pr-4 text-white/40">{formatDate(m.created_at)}</td>
                    {canManage && (
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleActive(m)}
                            disabled={togglingId === m.id}
                            className="text-white/40 hover:text-white transition-colors disabled:opacity-50"
                            title={m.is_active ? "Отключить доступ" : "Включить доступ"}
                          >
                            {togglingId === m.id ? (
                              <Icon name="Loader2" size={16} className="animate-spin" />
                            ) : (
                              <Icon name={m.is_active ? "UserX" : "UserCheck"} size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => setPasswordFor(m)}
                            className="text-white/40 hover:text-white transition-colors"
                            title="Задать пароль для входа"
                          >
                            <Icon name="KeyRound" size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="text-white/40 hover:text-red-400 transition-colors"
                            title="Удалить"
                          >
                            <Icon name="Trash2" size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
