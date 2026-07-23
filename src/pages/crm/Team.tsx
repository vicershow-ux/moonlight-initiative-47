import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"

export default function Team() {
  return (
    <CrmLayout title="Команда" subtitle="Сотрудники вашей компании">
      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-16 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
          <Icon name="UsersRound" size={22} className="text-white/30" />
        </div>
        <p className="text-white/50 text-sm mb-1">Раздел доступен в тарифе PRO</p>
        <p className="text-white/30 text-xs">Приглашайте сотрудников и распределяйте роли в команде</p>
      </div>
    </CrmLayout>
  )
}
