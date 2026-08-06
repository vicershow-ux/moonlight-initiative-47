import { useEffect, useMemo, useState } from "react"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { teamApi, TeamMember } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { SetPasswordDialog } from "@/components/crm/SetPasswordDialog"
import { getPositionLabel, PositionKey } from "@/lib/positions"
import { TeamOwnerCard } from "@/components/crm/team/TeamOwnerCard"
import { TeamStatsBar } from "@/components/crm/team/TeamStatsBar"
import { TeamMembersPanel, RoleFilter, StatusFilter, SortKey } from "@/components/crm/team/TeamMembersPanel"
import { CreateMemberDialog } from "@/components/crm/team/CreateMemberDialog"

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
  const [objectIds, setObjectIds] = useState<number[]>([])

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
    setObjectIds([])
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
        object_ids: position === "designer" ? objectIds : undefined,
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

      {owner && <TeamOwnerCard owner={owner} formatDateTime={formatDateTime} initials={initials} />}

      <TeamStatsBar stats={stats} tab={tab} setTab={setTab} />

      <TeamMembersPanel
        tab={tab}
        members={members}
        filtered={filtered}
        loading={loading}
        canManage={canManage}
        search={search}
        setSearch={setSearch}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortKey={sortKey}
        setSortKey={setSortKey}
        resetFilters={resetFilters}
        togglingId={togglingId}
        handleToggleActive={handleToggleActive}
        handleChangePosition={handleChangePosition}
        handleDelete={handleDelete}
        setPasswordFor={setPasswordFor}
        setOpen={setOpen}
        formatDate={formatDate}
        formatDateTime={formatDateTime}
        initials={initials}
      />

      <CreateMemberDialog
        open={open}
        onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}
        fullName={fullName}
        setFullName={setFullName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        phone={phone}
        setPhone={setPhone}
        position={position}
        setPosition={setPosition}
        objectIds={objectIds}
        setObjectIds={setObjectIds}
        error={error}
        saving={saving}
        onCreate={handleCreate}
      />

      <SetPasswordDialog
        open={!!passwordFor}
        onOpenChange={(v) => { if (!v) setPasswordFor(null) }}
        memberId={passwordFor?.id ?? null}
        memberName={passwordFor?.full_name ?? ""}
      />
    </CrmLayout>
  )
}
