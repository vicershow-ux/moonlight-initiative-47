import { useEffect, useState } from "react"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { teamApi, TeamMember } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { SetPasswordDialog } from "@/components/crm/SetPasswordDialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const roleLabels: Record<string, string> = {
  owner: "Владелец",
  admin: "Администратор",
  employee: "Сотрудник",
}

const roleColors: Record<string, string> = {
  owner: "bg-red-500/20 text-red-300",
  admin: "bg-orange-500/20 text-orange-300",
  employee: "bg-blue-500/20 text-blue-300",
}

export default function Team() {
  const { user } = useAuth()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")

  const canManage = user?.role === "owner" || user?.role === "admin"

  const [passwordFor, setPasswordFor] = useState<TeamMember | null>(null)

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
    await teamApi.remove(id)
    load()
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })

  return (
    <CrmLayout title="Команда" subtitle="Сотрудники вашей компании">
      {canManage && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 transition-colors text-white text-sm px-4 py-2.5 rounded-lg"
          >
            <Icon name="UserPlus" size={16} />
            Пригласить сотрудника
          </button>
        </div>
      )}

      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
        {loading ? (
          <div className="flex justify-center py-16">
            <Icon name="Loader2" size={24} className="animate-spin text-white/40" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-16 text-white/30 text-sm">
            Пока никого нет в команде
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-xs uppercase border-b border-white/10">
                  <th className="text-left font-medium py-2 pr-4">Имя</th>
                  <th className="text-left font-medium py-2 pr-4">Email</th>
                  <th className="text-left font-medium py-2 pr-4">Роль</th>
                  <th className="text-left font-medium py-2 pr-4">С нами с</th>
                  {canManage && <th className="text-left font-medium py-2 pr-4">Действия</th>}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b border-white/5 last:border-0">
                    <td className="py-3 pr-4">{m.full_name}</td>
                    <td className="py-3 pr-4 text-white/60">{m.email}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${roleColors[m.role] || "bg-white/10 text-white/60"}`}>
                        {roleLabels[m.role] || m.role}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-white/40">{formatDate(m.created_at)}</td>
                    {canManage && (
                      <td className="py-3 pr-4">
                        {m.role !== "owner" && (
                          <div className="flex items-center gap-3">
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
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
                className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-red-500/50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-red-500/50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-red-500/50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Телефон</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 900 000 00 00"
                className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-red-500/50"
              />
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
              className="mt-2 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 transition-colors text-white text-sm px-4 py-3 rounded-lg disabled:opacity-60"
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