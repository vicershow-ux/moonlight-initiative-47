import { useEffect, useMemo, useRef, useState } from "react"
import { Navigate } from "@/lib/router-compat"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { hasPosition } from "@/lib/positions"
import { PromoData, PromoItem, PromoKind, siteApi } from "@/lib/api"
import { Contacts, cardPreset, flyerPresets } from "@/components/crm/promo/promoConfig"
import { PromoPreview } from "@/components/crm/promo/PromoPreview"
import { PromoEditorForm } from "@/components/crm/promo/PromoEditorForm"
import { printPromo } from "@/components/crm/promo/printPromo"

interface Draft {
  id?: number
  kind: PromoKind
  title: string
  data: PromoData
  image_file?: string
  logo_file?: string
}

const KIND_LABEL: Record<PromoKind, string> = { flyer: "Объявление А4", card: "Визитки" }

export default function Promo() {
  const { user } = useAuth()
  const { toast } = useToast()
  const canManage = user?.role === "owner" || hasPosition(user, "super_admin")

  const [items, setItems] = useState<PromoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [contacts, setContacts] = useState<Contacts>({ phone: "", email: "", website: "fixkey.ru", brand: "FixKey" })
  const [draft, setDraft] = useState<Draft | null>(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!canManage) return
    Promise.all([siteApi.promo.list(), siteApi.getSettings().catch(() => null)])
      .then(([list, s]) => {
        setItems(list.items || [])
        if (s) setContacts({ phone: s.phone || "", email: s.email || "", website: "fixkey.ru", brand: s.brand_name || "FixKey" })
      })
      .catch((e) => toast({ variant: "destructive", title: "Не удалось загрузить", description: e instanceof Error ? e.message : "" }))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const presets = useMemo(() => flyerPresets(contacts), [contacts])

  if (!canManage) return <Navigate to="/cabinet/company" replace />

  const confirmLeave = () => !dirty || window.confirm("Изменения не сохранены. Закрыть без сохранения?")

  const open = (d: Draft) => {
    if (!confirmLeave()) return
    setDraft(d)
    setDirty(false)
  }

  const change = (patch: Partial<PromoData>) => {
    setDraft((d) => (d ? { ...d, data: { ...d.data, ...patch } } : d))
    setDirty(true)
  }

  const setImage = (field: "image" | "logo", dataUrl: string) => {
    setDraft((d) => (d ? { ...d, data: { ...d.data, [field]: dataUrl }, [`${field}_file`]: dataUrl } : d))
    setDirty(true)
  }

  const save = async () => {
    if (!draft) return
    setSaving(true)
    try {
      const data = { ...draft.data }
      if (draft.image_file) delete data.image
      if (draft.logo_file) delete data.logo
      const saved = await siteApi.promo.save({ ...draft, data })
      setItems((list) => [saved, ...list.filter((i) => i.id !== saved.id)])
      setDraft({ id: saved.id, kind: saved.kind, title: saved.title, data: saved.data })
      setDirty(false)
      toast({ title: "Макет сохранён" })
    } catch (e) {
      toast({ variant: "destructive", title: "Не удалось сохранить", description: e instanceof Error ? e.message : "" })
    } finally {
      setSaving(false)
    }
  }

  const remove = async (item: PromoItem) => {
    if (!window.confirm(`Удалить «${item.title}»?`)) return
    try {
      await siteApi.promo.remove(item.id)
      setItems((list) => list.filter((i) => i.id !== item.id))
      if (draft?.id === item.id) setDraft(null)
    } catch (e) {
      toast({ variant: "destructive", title: "Не удалось удалить", description: e instanceof Error ? e.message : "" })
    }
  }

  const print = () => {
    if (draft && sheetRef.current) printPromo(draft.kind, draft.data, sheetRef.current, draft.title)
  }

  if (loading) {
    return (
      <CrmLayout title="Промо" subtitle="Объявления А4 и визитки для печати">
        <div className="flex items-center justify-center py-24">
          <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
        </div>
      </CrmLayout>
    )
  }

  if (draft) {
    return (
      <CrmLayout title="Промо" subtitle={KIND_LABEL[draft.kind]}>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <button
            onClick={() => confirmLeave() && (setDraft(null), setDirty(false))}
            className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70 hover:bg-white/10"
          >
            <Icon name="ArrowLeft" size={15} />
            Все макеты
          </button>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {dirty && <span className="text-xs text-amber-400">не сохранено</span>}
            <button
              onClick={print}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm text-white hover:bg-white/15"
            >
              <Icon name="Printer" size={15} />
              Печать
            </button>
            <button
              onClick={save}
              disabled={saving || (!dirty && !!draft.id)}
              className="flex items-center gap-2 rounded-lg bg-[#D4AF37] px-5 py-2.5 text-sm font-medium text-[#161616] hover:bg-[#B8860B] disabled:opacity-50"
            >
              <Icon name={saving ? "Loader2" : "Check"} size={15} className={saving ? "animate-spin" : ""} />
              Сохранить
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="order-2 rounded-xl border border-white/10 bg-[#1f1f1f] p-4 lg:order-1 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto">
            <PromoEditorForm
              kind={draft.kind}
              title={draft.title}
              data={draft.data}
              onTitle={(v) => {
                setDraft({ ...draft, title: v })
                setDirty(true)
              }}
              onChange={change}
              onImage={setImage}
            />
          </div>
          <div className="order-1 rounded-xl border border-white/10 bg-[#2a2a2a] p-4 md:p-8 lg:order-2">
            <PromoPreview ref={sheetRef} kind={draft.kind} data={draft.data} />
            <p className="mt-4 text-center text-xs text-white/40">
              {draft.kind === "card"
                ? "На листе А4 — 10 визиток 90×50 мм с пунктиром для отреза. При печати выберите «Масштаб 100%»."
                : "Лист А4. При печати выберите «Масштаб 100%» и включите «Фон и цвета»."}
            </p>
          </div>
        </div>
      </CrmLayout>
    )
  }

  const card = cardPreset(contacts)

  return (
    <CrmLayout title="Промо" subtitle="Объявления А4 и визитки для печати">
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium text-white/70">Создать новый макет</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => open({ kind: "flyer", title: p.title, data: p.data })}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#1f1f1f] p-4 text-left transition-colors hover:border-[#D4AF37]/50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/15 text-[#D4AF37]">
                <Icon name="FileText" size={18} />
              </span>
              <span>
                <span className="block text-sm font-medium">Объявление А4</span>
                <span className="block text-xs text-white/40">Шаблон «{p.label}»</span>
              </span>
            </button>
          ))}
          <button
            onClick={() => open({ kind: "card", title: card.title, data: card.data })}
            className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#1f1f1f] p-4 text-left transition-colors hover:border-[#D4AF37]/50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/15 text-[#D4AF37]">
              <Icon name="IdCard" fallback="CreditCard" size={18} />
            </span>
            <span>
              <span className="block text-sm font-medium">Визитки</span>
              <span className="block text-xs text-white/40">10 штук на листе, линии отреза</span>
            </span>
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-white/70">Мои макеты</h2>
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 py-14 text-center text-sm text-white/40">
            Пока нет сохранённых макетов — выберите шаблон выше
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#1f1f1f] p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/60">
                  <Icon name={item.kind === "card" ? "CreditCard" : "FileText"} size={16} />
                </span>
                <button onClick={() => open({ id: item.id, kind: item.kind, title: item.title, data: item.data })} className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-sm font-medium">{item.title}</span>
                  <span className="block text-xs text-white/40">
                    {KIND_LABEL[item.kind]} · {item.data.orientation === "landscape" ? "горизонтально" : "вертикально"}
                    {item.data.qr_enabled ? " · QR-код" : ""}
                  </span>
                </button>
                <button
                  onClick={() => open({ ...item, title: `${item.title} (копия)`, id: undefined })}
                  title="Сделать копию"
                  className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white"
                >
                  <Icon name="Copy" size={15} />
                </button>
                <button onClick={() => remove(item)} title="Удалить" className="rounded-lg p-2 text-white/50 hover:bg-red-500/15 hover:text-red-300">
                  <Icon name="Trash2" size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </CrmLayout>
  )
}
