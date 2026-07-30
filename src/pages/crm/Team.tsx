import { useEffect, useMemo, useState } from "react"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { teamApi, TeamMember } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { SetPasswordDialog } from "@/components/crm/SetPasswordDialog"
import { positionOptions, getPositionLabel, getPositionColor, PositionKey } from "@/lib/positions"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type RoleFilter = "all" | PositionKey
type StatusFilter = "all" | "active" | "inactive" | "never"
type SortKey = "created_desc" | "created_asc" | "name_asc" | "last_login" | "position"

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })

const formatDateTime = (d: string) =>
  new Date(d).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")

export default function Team() {
  const { user } = useAuth()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [tab, setTab] = useState<"members" | "invites">("members")

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [position, setPosition] = useState<PositionKey>("manager")

  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sortKey, setSortKey] = useState<SortKey>("created_desc")

  const canManage = user?.role === "owner" || user?.role === "admin"

  const [passwordFor, setPasswordFor] = useState<TeamMember | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    teamApi
      .list()
      .then((data) => setMembers(data.members.filter((m) => m.role !== "client")))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const resetForm = () => {
    setFullName("")
    setEmail("")
    setPassword("")
    setPhone("")
    setPosition("manager")
    setError("")
  }

  const handleCreate = async () => {
    setError("")
    if (fullName.trim().length < 2) {
      setError("Введите имя")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Введите корректный email")
      return
    }
    if (password.length < 6) {
      setError("Пароль должен быть не короче 6 символов")
      return
    }

    setSaving(true)
    try {
      await teamApi.create({
        full_name: fullName,
        email,
        password,
        role: "employee",
        phone,
        position,
      })
      setOpen(false)
      resetForm()
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("Удалить сотрудника безвозвратно?")) return
    await teamApi.remove(id)
    load()
  }

  const handleToggleActive = async (m: TeamMember) => {
    setTogglingId(m.id)
    try {
      await teamApi.setActive(m.id, !m.is_active)
      setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, is_active: !m.is_active } : x)))
    } finally {
      setTogglingId(null)
    }
  }

  const handleChangePosition = async (m: TeamMember, newPosition: string) => {
    await teamApi.setPosition(m.id, newPosition)
    setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, position: newPosition } : x)))
  }

  const owner = members.find((m) => m.role === "owner")

  const stats = useMemo(() => {
    const total = members.length
    const active = members.filter((m) => m.is_active).length
    const inactive = members.filter((m) => !m.is_active).length
    return { total, active, inactive, invites: 0 }
  }, [members])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = members.filter((m) => m.role !== "owner")
    if (q) {
      list = list.filter(
        (m) => m.full_name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
      )
    }
    if (roleFilter !== "all") {
      list = list.filter((m) => m.position === roleFilter)
    }
    if (statusFilter !== "all") {
      list = list.filter((m) => {
        if (statusFilter === "active") return m.is_active
        if (statusFilter === "inactive") return !m.is_active
        return !m.last_login_at
      })
    }
    list = [...list].sort((a, b) => {
      switch (sortKey) {
        case "created_asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "name_asc":
          return a.full_name.localeCompare(b.full_name)
        case "last_login":
          return new Date(b.last_login_at || 0).getTime() - new Date(a.last_login_at || 0).getTime()
        case "position":
          return getPositionLabel(a.position).localeCompare(getPositionLabel(b.position))
        case "created_desc":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
    return list
  }, [members, search, roleFilter, statusFilter, sortKey])

  const resetFilters = () => {
    setSearch("")
    setRoleFilter("all")
    setStatusFilter("all")
    setSortKey("created_desc")
  }

  return (
    <CrmLayout
      title="Команда"
      subtitle="Просматривайте состав команды, управляйте ролями и доступом, отслеживайте приглашения и контролируйте критичные действия без лишнего шума в интерфейсе."
    >
      {canManage && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg"
          >
            <Icon name="UserPlus" size={16} />
            Пригласить сотрудника
          </button>
        </div>
      )}

      {owner && (
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
      )}

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

      {tab === "invites" ? (
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
      ) : (
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
      )}

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
        <DialogContent className="bg-[#1f1f1f] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Новый сотрудник</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Имя</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Иванов Иван"
                className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Телефон</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 900 000 00 00"
                className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Роль</label>
              <Select value={position} onValueChange={(v) => setPosition(v as PositionKey)}>
                <SelectTrigger className="bg-[#161616] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {positionOptions.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="text-sm text-red-400 flex items-center gap-1.5">
                <Icon name="CircleAlert" size={15} />
                {error}
              </p>
            )}

            <button
              onClick={handleCreate}
              disabled={saving}
              className="mt-2 flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-3 rounded-lg disabled:opacity-60"
            >
              {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : "Пригласить сотрудника"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <SetPasswordDialog
        open={!!passwordFor}
        onOpenChange={(v) => { if (!v) setPasswordFor(null) }}
        memberId={passwordFor?.id ?? null}
        memberName={passwordFor?.full_name ?? ""}
      />
    </CrmLayout>
  )
}