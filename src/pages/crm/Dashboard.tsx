import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { dashboardApi, DashboardStats } from "@/lib/api"

const statusColors: Record<string, string> = {
  "лид": "bg-purple-500/20 text-purple-300",
  "в работе": "bg-blue-500/20 text-blue-300",
  "завершён": "bg-green-500/20 text-green-300",
  "отменён": "bg-red-500/20 text-red-300",
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi
      .stats()
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  const formatMoney = (n: number) =>
    new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " ₽"

  if (loading) {
    return (
      <CrmLayout title="Главная">
        <div className="flex items-center justify-center py-24">
          <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
        </div>
      </CrmLayout>
    )
  }

  return (
    <CrmLayout title="Главная">
      <div className="flex items-center justify-end gap-3 mb-6">
        <div className="bg-[#1f1f1f] border border-white/10 rounded-xl px-4 py-2 text-center">
          <p className="text-xs text-white/40">Сотрудники</p>
          <p className="text-lg font-semibold">{stats?.team_count ?? 0}</p>
        </div>
        <div className="bg-[#1f1f1f] border border-white/10 rounded-xl px-4 py-2 text-center">
          <p className="text-xs text-white/40">Приглашения</p>
          <p className="text-lg font-semibold">{stats?.invites_count ?? 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-white/50">Всего объектов</p>
            <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center">
              <Icon name="Building2" size={18} className="text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-semibold">{stats?.total_objects ?? 0}</p>
          <p className="text-xs text-white/30 mt-1">активных</p>
        </div>

        <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-white/50">Всего смет</p>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <Icon name="FileText" size={18} className="text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-semibold">{stats?.total_estimates ?? 0}</p>
          <p className="text-xs text-white/30 mt-1">всего создано смет</p>
        </div>

        <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-white/50">Сметы за месяц</p>
            <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/15 flex items-center justify-center">
              <Icon name="Wallet" size={18} className="text-[#D4AF37]" />
            </div>
          </div>
          <p className="text-2xl font-semibold">{formatMoney(stats?.month_amount ?? 0)}</p>
          <p className="text-xs text-white/30 mt-1">общая сумма смет за текущий месяц</p>
        </div>

        <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
          <p className="text-sm text-white/50 mb-3">Статусы объектов</p>
          <div className="flex flex-col gap-2">
            {stats && stats.statuses.length > 0 ? (
              stats.statuses.map((s) => (
                <div key={s.status} className="flex items-center justify-between text-sm">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[s.status] || "bg-white/10 text-white/60"}`}>
                    {s.status}
                  </span>
                  <span className="font-medium">{s.count}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-white/30">Нет данных</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-medium">Последние объекты</p>
            <Link to="/cabinet/objects" className="text-sm text-[#D4AF37] hover:text-[#B8860B]">
              Все объекты →
            </Link>
          </div>

          {stats && stats.recent_objects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/40 text-xs uppercase border-b border-white/10">
                    <th className="text-left font-medium py-2 pr-4">ID объекта</th>
                    <th className="text-left font-medium py-2 pr-4">Клиент</th>
                    <th className="text-left font-medium py-2 pr-4">Тип</th>
                    <th className="text-left font-medium py-2 pr-4">Площадь</th>
                    <th className="text-left font-medium py-2 pr-4">Статус</th>
                    <th className="text-left font-medium py-2 pr-4">Дата создания</th>
                    <th className="text-left font-medium py-2 pr-4">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_objects.map((obj) => (
                    <tr key={obj.id} className="border-b border-white/5 last:border-0">
                      <td className="py-3 pr-4 text-[#D4AF37]">{obj.object_code}</td>
                      <td className="py-3 pr-4">
                        <p>{obj.client_name}</p>
                        <p className="text-xs text-white/30">{obj.client_phone}</p>
                      </td>
                      <td className="py-3 pr-4 text-white/60">{obj.object_type}</td>
                      <td className="py-3 pr-4 text-white/60">{obj.area} м²</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[obj.status] || "bg-white/10 text-white/60"}`}>
                          {obj.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-white/40 text-xs">
                        {new Date(obj.created_at).toLocaleDateString("ru-RU")}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/cabinet/objects/${obj.id}`}
                            className="text-white/60 hover:text-white transition-colors"
                            title="Просмотр"
                          >
                            <Icon name="Eye" size={15} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-white/30 text-sm">
              Пока нет объектов — создайте первый
            </div>
          )}
        </div>

        <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
          <p className="font-medium mb-4">Быстрые действия</p>
          <div className="flex flex-col gap-2">
            <Link
              to="/cabinet/objects/new"
              className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-3 rounded-lg"
            >
              <Icon name="Plus" size={16} />
              Создать объект
            </Link>
            <Link
              to="/cabinet/objects"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors text-sm px-4 py-3 rounded-lg"
            >
              <Icon name="List" size={16} />
              Все объекты
            </Link>
            <Link
              to="/cabinet/services"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors text-sm px-4 py-3 rounded-lg"
            >
              <Icon name="ClipboardList" size={16} />
              Справочник услуг
            </Link>
          </div>
        </div>
      </div>
    </CrmLayout>
  )
}