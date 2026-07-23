import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { useAuth } from "@/contexts/AuthContext"

export default function Company() {
  const { user } = useAuth()

  return (
    <CrmLayout title="Компания" subtitle="Данные вашей компании">
      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-red-500/15 flex items-center justify-center">
            <Icon name="Building" size={24} className="text-red-400" />
          </div>
          <div>
            <p className="text-lg font-semibold">{user?.company_name}</p>
            <p className="text-sm text-white/40">Суперадминистратор: {user?.full_name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#161616] border border-white/10 rounded-lg p-4">
            <p className="text-xs text-white/40 mb-1">Email компании</p>
            <p className="text-sm">{user?.email}</p>
          </div>
          <div className="bg-[#161616] border border-white/10 rounded-lg p-4">
            <p className="text-xs text-white/40 mb-1">Роль</p>
            <p className="text-sm capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </CrmLayout>
  )
}
