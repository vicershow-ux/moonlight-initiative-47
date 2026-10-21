import Icon from "@/components/ui/icon"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TeamMember } from "@/lib/api"
import { positionOptions, getPositionLabel, getPositionColor } from "@/lib/positions"
import { DeleteButton } from "@/components/ui/delete-button"
import { MobileCard, CardAction } from "@/components/crm/MobileCard"

interface TeamMemberMobileListProps {
  members: TeamMember[]
  canManage: boolean
  togglingId: number | null
  handleToggleActive: (m: TeamMember) => void
  handleChangePosition: (m: TeamMember, newPosition: string) => void
  handleDelete: (id: number) => void
  setPasswordFor: (m: TeamMember) => void
  setRolesFor: (m: TeamMember) => void
  formatDate: (d: string) => string
  formatDateTime: (d: string) => string
}

export function TeamMemberMobileList({
  members,
  canManage,
  togglingId,
  handleToggleActive,
  handleChangePosition,
  handleDelete,
  setPasswordFor,
  setRolesFor,
  formatDate,
  formatDateTime,
}: TeamMemberMobileListProps) {
  return (
    <div className="md:hidden flex flex-col gap-3">
      {members.map((m) => (
        <MobileCard
          key={m.id}
          title={m.full_name}
          subtitle={m.email}
          badge={
            <span className={`px-2 py-1 rounded-full text-[11px] ${m.is_active ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
              {m.is_active ? "Активен" : "Отключён"}
            </span>
          }
          rows={[
            {
              label: "Роль",
              value: (
                <div className="flex flex-col items-end gap-1">
                  {canManage ? (
                    <Select value={m.position || "manager"} onValueChange={(v) => handleChangePosition(m, v)}>
                      <SelectTrigger className={`h-9 w-auto border-none px-3 py-0.5 rounded-full text-xs ${getPositionColor(m.position)}`}>
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
                  {(m.extra_positions || []).length > 0 && (
                    <div className="flex flex-wrap justify-end gap-1">
                      {(m.extra_positions || []).map((p) => (
                        <span key={p} className={`px-1.5 py-0.5 rounded-full text-[10px] ${getPositionColor(p)}`}>
                          + {getPositionLabel(p)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ),
            },
            { label: "Последний вход", value: m.last_login_at ? formatDateTime(m.last_login_at) : "—" },
            { label: "Добавлен", value: formatDate(m.created_at) },
          ]}
          actions={
            canManage ? (
              <>
                <CardAction
                  icon={
                    togglingId === m.id ? (
                      <Icon name="Loader2" size={16} className="animate-spin" />
                    ) : (
                      <Icon name={m.is_active ? "UserX" : "UserCheck"} size={16} />
                    )
                  }
                  label={m.is_active ? "Откл." : "Вкл."}
                  onClick={() => {
                    if (togglingId !== m.id) handleToggleActive(m)
                  }}
                />
                <CardAction icon={<Icon name="ShieldCheck" size={16} />} label="Роли" onClick={() => setRolesFor(m)} />
                <CardAction icon={<Icon name="KeyRound" size={16} />} label="Пароль" onClick={() => setPasswordFor(m)} />
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 shrink-0">
                  <DeleteButton onConfirm={() => handleDelete(m.id)} />
                </div>
              </>
            ) : undefined
          }
        />
      ))}
    </div>
  )
}

export default TeamMemberMobileList
