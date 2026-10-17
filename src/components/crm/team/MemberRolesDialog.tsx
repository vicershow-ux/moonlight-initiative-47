import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Icon from "@/components/ui/icon"
import { objectsApi, teamApi, TeamMember } from "@/lib/api"
import { getPositionColor, getPositionLabel, positionOptions, positionPrefixes, PositionKey } from "@/lib/positions"

const sectionLabels: Record<string, string> = {
  "/cabinet": "Дашборд",
  "/cabinet/objects": "Объекты",
  "/cabinet/documents": "Документы",
  "/cabinet/customers": "Заказчики",
  "/cabinet/services": "Услуги",
  "/cabinet/company": "Компания",
  "/cabinet/team": "Команда",
  "/cabinet/rentals": "Аренда",
}

const roleHint = (p: PositionKey) =>
  p === "super_admin" || p === "director"
    ? "Полный доступ ко всем разделам"
    : p === "designer"
      ? "Только свои объекты: может создавать их и добавлять файлы"
      : positionPrefixes[p].map((x) => sectionLabels[x]).filter(Boolean).join(", ")

interface ObjectItem {
  id: number
  object_code: string
  client_name: string
}

interface Props {
  member: TeamMember | null
  onOpenChange: (v: boolean) => void
  onSaved: (patch: Partial<TeamMember> & { id: number }) => void
}

export function MemberRolesDialog({ member, onOpenChange, onSaved }: Props) {
  const [extra, setExtra] = useState<string[]>([])
  const [objectIds, setObjectIds] = useState<number[]>([])
  const [objects, setObjects] = useState<ObjectItem[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const main = member?.position || "manager"
  const roles = [main, ...extra]
  const isDesigner = roles.includes("designer")

  useEffect(() => {
    if (!member) return
    setExtra((member.extra_positions || []).filter((p) => p !== member.position))
    setObjectIds((member.objects || []).map((o) => o.id))
    setError("")
  }, [member])

  useEffect(() => {
    if (!member || !isDesigner || objects.length) return
    objectsApi.list().then((d) => setObjects(d.objects || []))
  }, [member, isDesigner, objects.length])

  const toggleRole = (p: string) => setExtra((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))
  const toggleObj = (id: number) =>
    setObjectIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const save = async () => {
    if (!member) return
    setSaving(true)
    setError("")
    try {
      await teamApi.setExtraPositions(member.id, extra)
      if (isDesigner) await teamApi.updateObjects(member.id, objectIds)
      onSaved({
        id: member.id,
        extra_positions: extra,
        objects: isDesigner ? objects.filter((o) => objectIds.includes(o.id)) : member.objects,
      })
      onOpenChange(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={!!member} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1f1f1f] border-white/10 text-white sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Роли и полномочия</DialogTitle>
        </DialogHeader>
        {member && (
          <div className="flex flex-col gap-4 mt-1">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#161616] px-3 py-2.5">
              <div className="min-w-0">
                <p className="font-medium truncate">{member.full_name}</p>
                <p className="text-xs text-white/40">Основная роль меняется в таблице команды</p>
              </div>
              <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs ${getPositionColor(main)}`}>{getPositionLabel(main)}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-xs text-white/50">Дополнительные роли — полномочия складываются</p>
              {positionOptions
                .filter((p) => p.value !== main)
                .map((p) => {
                  const on = extra.includes(p.value)
                  return (
                    <label
                      key={p.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                        on ? "border-[#D4AF37]/50 bg-[#D4AF37]/5" : "border-white/10 hover:bg-white/5"
                      }`}
                    >
                      <input type="checkbox" checked={on} onChange={() => toggleRole(p.value)} className="mt-1 accent-[#D4AF37]" />
                      <span className="min-w-0">
                        <span className="block text-sm">{p.label}</span>
                        <span className="block text-xs text-white/40">{roleHint(p.value)}</span>
                      </span>
                    </label>
                  )
                })}
            </div>

            {isDesigner && (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs text-white/50">Объекты дизайнера ({objectIds.length})</p>
                <p className="text-xs text-white/30">
                  {roles.length > 1
                    ? "Есть другие роли — сотрудник видит все объекты по ним, а эти закреплены за ним как за дизайнером"
                    : "Видит только отмеченные объекты и те, что создал сам"}
                </p>
                <div className="max-h-44 overflow-y-auto rounded-lg border border-white/10 bg-[#161616] p-2 flex flex-col gap-1">
                  {objects.length === 0 ? (
                    <p className="py-3 text-center text-xs text-white/30">Объектов пока нет</p>
                  ) : (
                    objects.map((o) => (
                      <label key={o.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-white/5">
                        <input type="checkbox" checked={objectIds.includes(o.id)} onChange={() => toggleObj(o.id)} className="accent-[#D4AF37]" />
                        <span className="truncate">{o.object_code} — {o.client_name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-400 flex items-center gap-1.5">
                <Icon name="CircleAlert" size={15} />
                {error}
              </p>
            )}

            <button
              onClick={save}
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-3 rounded-lg disabled:opacity-60"
            >
              {saving && <Icon name="Loader2" size={16} className="animate-spin" />}
              Сохранить
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default MemberRolesDialog
