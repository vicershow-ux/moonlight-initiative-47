import { useEffect, useState } from "react"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { teamApi, objectsApi, TeamMember, ObjectItem } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
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
  client: "Заказчик",
}

const roleColors: Record<string, string> = {
  owner: "bg-red-500/20 text-red-300",
  admin: "bg-orange-500/20 text-orange-300",
  employee: "bg-blue-500/20 text-blue-300",
  client: "bg-green-500/20 text-green-300",
}

export default function Team() {
  const { user } = useAuth()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [objects, setObjects] = useState<ObjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<"employee" | "client">("employee")
  const [selectedObjectIds, setSelectedObjectIds] = useState<number[]>([])

  const canManage = user?.role === "owner" || user?.role === "admin"

  const load = () => {
    setLoading(true)
    Promise.all([teamApi.list(), objectsApi.list()])
      .then(([teamData, objData]) => {
        setMembers(teamData.members)
        setObjects(objData.objects)
      })
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
    setRole("employee")
    setSelectedObjectIds([])
    setError("")
  }

  const toggleObject = (id: number) => {
    setSelectedObjectIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
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
    if (role === "client" && selectedObjectIds.length === 0) {
      setError("Выберите хотя бы один объект для заказчика")
      return
    }

    setSaving(true)
    try {
      await teamApi.create({
        full_name: fullName,
        email,
        password,
        role,
        phone,
        object_ids: role === "client" ? selectedObjectIds : undefined,
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
    <CrmLayout title="Команда" subtitle="Сотрудники и заказчики вашей компании">
      {canManage && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 transition-colors text-white text-sm px-4 py-2.5 rounded-lg"
          >
            <Icon name="UserPlus" size={16} />
            Создать логин
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
                  <th className="text-left font-medium py-2 pr-4">Объекты</th>
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
                    <td className="py-3 pr-4 text-white/60">
                      {m.objects && m.objects.length > 0
                        ? m.objects.map((o) => o.object_code).join(", ")
                        : "—"}
                    </td>
                    <td className="py-3 pr-4 text-white/40">{formatDate(m.created_at)}</td>
                    {canManage && (
                      <td className="py-3 pr-4">
                        {m.role !== "owner" && (
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="text-white/40 hover:text-red-400 transition-colors"
                          >
                            <Icon name="Trash2" size={16} />
                          </button>
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
        <DialogContent className="bg-[#1f1f1f] border-white/10 text-white sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Новый логин</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-2">
            <div className="flex gap-2">
              <button
                onClick={() => setRole("employee")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${role === "employee" ? "bg-red-500 text-white" : "bg-[#161616] text-white/50 border border-white/10"}`}
              >
                Сотрудник
              </button>
              <button
                onClick={() => setRole("client")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${role === "client" ? "bg-red-500 text-white" : "bg-[#161616] text-white/50 border border-white/10"}`}
              >
                Заказчик
              </button>
            </div>

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

            {role === "client" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Доступные объекты</label>
                {objects.length === 0 ? (
                  <p className="text-xs text-white/30">Сначала создайте хотя бы один объект</p>
                ) : (
                  <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto border border-white/10 rounded-lg p-2">
                    {objects.map((o) => (
                      <label key={o.id} className="flex items-center gap-2 text-sm px-2 py-1.5 rounded hover:bg-white/5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedObjectIds.includes(o.id)}
                          onChange={() => toggleObject(o.id)}
                          className="accent-red-500"
                        />
                        <span className="text-red-400">{o.object_code}</span>
                        <span className="text-white/50">— {o.client_name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

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
              {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : "Создать логин"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </CrmLayout>
  )
}
