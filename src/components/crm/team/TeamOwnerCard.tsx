import { TeamMember } from "@/lib/api"

interface TeamOwnerCardProps {
  owner: TeamMember
  formatDateTime: (d: string) => string
  initials: (name: string) => string
}

export function TeamOwnerCard({ owner, formatDateTime, initials }: TeamOwnerCardProps) {
  return (
    <div className="relative bg-gradient-to-br from-[#3a1f14] via-[#2a1a12] to-[#1f1f1f] border border-white/10 rounded-xl p-5 mb-6 overflow-hidden">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center text-sm font-semibold shrink-0">
            {initials(owner.full_name)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium">{owner.full_name}</p>
              <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-300">Владелец компании</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/60">Супер-администратор</span>
            </div>
            <p className="text-sm text-[#D4AF37] mt-0.5">{owner.email}</p>
            <p className="text-xs text-white/40 mt-2 max-w-xl">
              Этот пользователь является владельцем компании и имеет полный доступ к управлению настройками, сотрудниками, приглашениями и критичными действиями.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs">
            <p className="text-white/40 mb-0.5">Последний вход</p>
            <p className="font-medium">{owner.last_login_at ? formatDateTime(owner.last_login_at) : "—"}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs">
            <p className="text-white/40 mb-0.5">Дата назначения</p>
            <p className="font-medium">{formatDateTime(owner.created_at)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
