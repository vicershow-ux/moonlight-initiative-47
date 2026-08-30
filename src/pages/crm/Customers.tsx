import { useEffect, useState } from "react"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { teamApi, objectsApi, TeamMember, ObjectItem } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { SetPasswordDialog } from "@/components/crm/SetPasswordDialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DeleteButton } from "@/components/ui/delete-button"
import { MobileCard, CardAction } from "@/components/crm/MobileCard"

export default function Customers() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<TeamMember[]>([])
  const [objects, setObjects] = useState<ObjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [editingId, setEditingId] = useState<number | null>(null)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [selectedObjectIds, setSelectedObjectIds] = useState<number[]>([])

  const canManage = user?.role === "owner" || user?.role === "admin"
  const [passwordFor, setPasswordFor] = useState<TeamMember | null>(null)

  const load = () => {
    setLoading(true)
    Promise.all([teamApi.list(), objectsApi.list()])
      .then(([teamData, objData]) => {
        setCustomers(teamData.members.filter((m) => m.role === "client"))
        setObjects(objData.objects)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const resetForm = () => {
    setEditingId(null)
    setFullName("")
    setEmail("")
    setPassword("")
    setPhone("")
    setSelectedObjectIds([])
    setError("")
  }

  const toggleObject = (id: number) => {
    setSelectedObjectIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const openCreate = () => {
    resetForm()
    setOpen(true)
  }

  const openEdit = (c: TeamMember) => {
    setEditingId(c.id)
    setFullName(c.full_name)
    setEmail(c.email)
    setPassword("")
    setPhone(c.phone || "")
    setSelectedObjectIds(c.objects?.map((o) => o.id) || [])
    setError("")
    setOpen(true)
  }

  const handleSave = async () => {
    setError("")

    if (editingId) {
      if (selectedObjectIds.length === 0) {
        setError("Выберите хотя бы один объект")
        return
      }
      setSaving(true)
      try {
        await teamApi.updateObjects(editingId, selectedObjectIds)
        setOpen(false)
        resetForm()
        load()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка сохранения")
      } finally {
        setSaving(false)
      }
      return
    }

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
    if (selectedObjectIds.length === 0) {
      setError("Выберите хотя бы один объект для заказчика")
      return
    }

    setSaving(true)
    try {
      await teamApi.create({
        full_name: fullName,
        email,
        password,
        role: "client",
        phone,
        object_ids: selectedObjectIds,
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
    <CrmLayout title="Заказчики" subtitle="База ваших клиентов с доступом в кабинет">
      {canManage && (
        <div className="flex justify-end mb-6">
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg"
          >
            <Icon name="UserPlus" size={16} />
            Создать логин заказчика
          </button>
        </div>
      )}

      <div className="md:bg-[#1f1f1f] md:border md:border-white/10 md:rounded-xl md:p-5">
        {loading ? (
          <div className="flex justify-center py-16">
            <Icon name="Loader2" size={24} className="animate-spin text-white/40" />
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16 text-white/30 text-sm">
            Пока нет заказчиков с доступом в кабинет
          </div>
        ) : (
          <>
          <div className="md:hidden flex flex-col gap-3">
            {customers.map((c) => (
              <MobileCard
                key={c.id}
                title={c.full_name}
                subtitle={c.email}
                rows={[
                  {
                    label: "Объекты",
                    value:
                      c.objects && c.objects.length > 0
                        ? c.objects.map((o) => o.object_code).join(", ")
                        : "—",
                  },
                  { label: "С нами с", value: formatDate(c.created_at) },
                ]}
                actions={
                  canManage ? (
                    <>
                      <CardAction
                        icon={<Icon name="Pencil" size={15} />}
                        label="Объекты"
                        onClick={() => openEdit(c)}
                      />
                      <CardAction
                        icon={<Icon name="KeyRound" size={15} />}
                        label="Пароль"
                        onClick={() => setPasswordFor(c)}
                      />
                      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 shrink-0">
                        <DeleteButton onConfirm={() => handleDelete(c.id)} />
                      </div>
                    </>
                  ) : undefined
                }
              />
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-xs uppercase border-b border-white/10">
                  <th className="text-left font-medium py-2 pr-4">Имя</th>
                  <th className="text-left font-medium py-2 pr-4">Email</th>
                  <th className="text-left font-medium py-2 pr-4">Объекты</th>
                  <th className="text-left font-medium py-2 pr-4">С нами с</th>
                  {canManage && <th className="text-left font-medium py-2 pr-4">Действия</th>}
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 last:border-0">
                    <td className="py-3 pr-4">{c.full_name}</td>
                    <td className="py-3 pr-4 text-white/60">{c.email}</td>
                    <td className="py-3 pr-4 text-white/60">
                      {c.objects && c.objects.length > 0
                        ? c.objects.map((o) => o.object_code).join(", ")
                        : "—"}
                    </td>
                    <td className="py-3 pr-4 text-white/40">{formatDate(c.created_at)}</td>
                    {canManage && (
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEdit(c)}
                            className="text-white/40 hover:text-white transition-colors"
                            title="Изменить объекты"
                          >
                            <Icon name="Pencil" size={16} />
                          </button>
                          <button
                            onClick={() => setPasswordFor(c)}
                            className="text-white/40 hover:text-white transition-colors"
                            title="Задать пароль для входа"
                          >
                            <Icon name="KeyRound" size={16} />
                          </button>
                          <DeleteButton onConfirm={() => handleDelete(c.id)} />
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
        <DialogContent className="bg-[#1f1f1f] border-white/10 text-white sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Объекты заказчика" : "Новый заказчик"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-2">
            {!editingId && (
              <>
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
              </>
            )}

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
                        className="accent-[#D4AF37]"
                      />
                      <span className="text-[#D4AF37]">{o.object_code}</span>
                      <span className="text-white/50">— {o.client_name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-400 flex items-center gap-1.5">
                <Icon name="CircleAlert" size={15} />
                {error}
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-2 flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-3 rounded-lg disabled:opacity-60"
            >
              {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : editingId ? "Сохранить объекты" : "Создать логин заказчика"}
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