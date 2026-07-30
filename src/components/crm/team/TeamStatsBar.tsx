interface TeamStats {
  total: number
  active: number
  inactive: number
  invites: number
}

interface TeamStatsBarProps {
  stats: TeamStats
  tab: "members" | "invites"
  setTab: (tab: "members" | "invites") => void
}

export function TeamStatsBar({ stats, tab, setTab }: TeamStatsBarProps) {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-4">
          <p className="text-xs text-white/40 mb-2">Всего сотрудников</p>
          <p className="text-2xl font-semibold">{stats.total}</p>
          <p className="text-xs text-white/30 mt-1">Все пользователи компании</p>
        </div>
        <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-4">
          <p className="text-xs text-white/40 mb-2">Активные</p>
          <p className="text-2xl font-semibold text-green-400">{stats.active}</p>
          <p className="text-xs text-white/30 mt-1">Есть доступ и возможность входа</p>
        </div>
        <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-4">
          <p className="text-xs text-white/40 mb-2">Отключённые</p>
          <p className="text-2xl font-semibold text-red-400">{stats.inactive}</p>
          <p className="text-xs text-white/30 mt-1">Доступ временно отключён</p>
        </div>
        <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-4">
          <p className="text-xs text-white/40 mb-2">Ожидают приглашение</p>
          <p className="text-2xl font-semibold">{stats.invites}</p>
          <p className="text-xs text-white/30 mt-1">Ещё не приняли приглашение</p>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-[#1f1f1f] border border-white/10 rounded-lg p-1 mb-6 w-fit">
        <button
          onClick={() => setTab("members")}
          className={`px-4 py-2 rounded-md text-sm transition-colors ${tab === "members" ? "bg-[#D4AF37] text-[#161616]" : "text-white/50 hover:text-white"}`}
        >
          Сотрудники
        </button>
        <button
          onClick={() => setTab("invites")}
          className={`px-4 py-2 rounded-md text-sm transition-colors ${tab === "invites" ? "bg-[#D4AF37] text-[#161616]" : "text-white/50 hover:text-white"}`}
        >
          Приглашения
        </button>
      </div>
    </>
  )
}
