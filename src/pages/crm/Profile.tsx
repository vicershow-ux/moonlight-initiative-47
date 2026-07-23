import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { useAuth } from "@/contexts/AuthContext"

export default function Profile() {
  const { user } = useAuth()

  return (
    <CrmLayout title="Профиль" subtitle="Ваши личные данные">
      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-xl font-semibold">
            {user?.full_name?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold">{user?.full_name}</p>
            <p className="text-sm text-white/40">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#161616] border border-white/10 rounded-lg p-4 flex items-center gap-3">
            <Icon name="Mail" size={18} className="text-white/40" />
            <div>
              <p className="text-xs text-white/40">Email</p>
              <p className="text-sm">{user?.email}</p>
            </div>
          </div>
          <div className="bg-[#161616] border border-white/10 rounded-lg p-4 flex items-center gap-3">
            <Icon name="Shield" size={18} className="text-white/40" />
            <div>
              <p className="text-xs text-white/40">Роль</p>
              <p className="text-sm capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </CrmLayout>
  )
}
