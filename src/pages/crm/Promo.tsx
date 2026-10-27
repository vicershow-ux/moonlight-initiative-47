import { useEffect, useState } from "react"
import { Navigate } from "@/lib/router-compat"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { hasPosition } from "@/lib/positions"
import { PromoItem, siteApi } from "@/lib/api"
import type { PromoDesign } from "@/lib/promoTypes"
import { FONTS_HREF, FORMATS } from "@/components/crm/promo/formats"
import { Contacts, TEMPLATES, blankDesign } from "@/components/crm/promo/templates"
import { DesignThumb } from "@/components/crm/promo/ui"
import { PromoEditor } from "@/components/crm/promo/PromoEditor"

interface Open {
  id?: number
  title: string
  design: PromoDesign
}

const isDesign = (d: unknown): d is PromoDesign => !!d && Array.isArray((d as PromoDesign).sides)

export default function Promo() {
  const { user } = useAuth()
  const { toast } = useToast()
  const canManage = user?.role === "owner" || hasPosition(user, "super_admin")
  const [items, setItems] = useState<PromoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"card" | "flyer">("card")
  const [open, setOpen] = useState<Open | null>(null)
  const [contacts, setContacts] = useState<Contacts>({ brand: "FixKey", phone: "", email: "", website: "fixkey.ru", telegram: "", city: "Хабаровск" })

  useEffect(() => {
    if (!document.querySelector("link[data-promo-fonts]")) {
      const l = document.createElement("link")
      l.rel = "stylesheet"
      l.href = FONTS_HREF
      l.dataset.promoFonts = "1"
      document.head.appendChild(l)
    }
    if (!canManage) return
    Promise.all([siteApi.promo.list(), siteApi.getSettings().catch(() => null)])
      .then(([list, s]) => {
        setItems((list.items || []).filter((i) => isDesign(i.data)))
        if (s)
          setContacts((c) => ({
            ...c,
            brand: s.brand_name || c.brand,
            phone: s.phone || "",
            email: s.email || "",
            telegram: s.telegram_url || "",
          }))
      })
      .catch((e) => toast({ variant: "destructive", title: "Не удалось загрузить", description: e instanceof Error ? e.message : "" }))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!canManage) return <Navigate to="/cabinet/company" replace />

  if (open) {
    return (
      <PromoEditor
        id={open.id}
        title={open.title}
        design={open.design}
        contacts={contacts}
        onClose={() => setOpen(null)}
        onSaved={(id, title, design) => {
          const kind = design.format === "card" ? "card" : "flyer"
          setItems((list) => [{ id, title, kind, data: design }, ...list.filter((i) => i.id !== id)])
        }}
      />
    )
  }

  const remove = async (item: PromoItem) => {
    if (!window.confirm(`Удалить «${item.title}»?`)) return
    try {
      await siteApi.promo.remove(item.id)
      setItems((l) => l.filter((i) => i.id !== item.id))
    } catch (e) {
      toast({ variant: "destructive", title: "Не удалось удалить", description: e instanceof Error ? e.message : "" })
    }
  }

  const templates = TEMPLATES.filter((t) => t.kind === filter)
  const mine = items.filter((i) => i.kind === filter)
  const isCard = filter === "card"
  const grid = isCard ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"

  return (
    <CrmLayout title="Промо" subtitle="Конструктор визиток и листовок для печати">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-white/10 bg-[#1f1f1f] p-1">
          {(
            [
              ["card", "Визитки", "CreditCard"],
              ["flyer", "Листовки и объявления", "FileText"],
            ] as const
          ).map(([v, l, ic]) => (
            <button key={v} onClick={() => setFilter(v)} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm ${filter === v ? "bg-[#D4AF37] font-medium text-[#161616]" : "text-white/60 hover:text-white"}`}>
              <Icon name={ic} size={15} />
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
        </div>
      ) : (
        <>
          {mine.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-3 text-sm font-medium text-white/70">Мои макеты</h2>
              <div className={`grid gap-4 ${grid}`}>
                {mine.map((item) => (
                  <div key={item.id} className="rounded-xl border border-white/10 bg-[#1f1f1f] p-3">
                    <button onClick={() => setOpen({ id: item.id, title: item.title, design: item.data })} className="flex w-full justify-center rounded-lg bg-[#2b2b2b] p-4">
                      <DesignThumb design={item.data} width={isCard ? (item.data.orientation === "portrait" ? 110 : 200) : 150} />
                    </button>
                    <div className="mt-2 flex items-center gap-1">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{item.title}</div>
                        <div className="text-xs text-white/40">
                          {FORMATS[item.data.format]?.label} · {item.data.orientation === "landscape" ? "горизонтально" : "вертикально"}
                        </div>
                      </div>
                      <button onClick={() => setOpen({ title: `${item.title} (копия)`, design: item.data })} title="Сделать копию" className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white">
                        <Icon name="Copy" size={15} />
                      </button>
                      <button onClick={() => remove(item)} title="Удалить" className="rounded-lg p-2 text-white/50 hover:bg-red-500/15 hover:text-red-300">
                        <Icon name="Trash2" size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-sm font-medium text-white/70">{isCard ? "Шаблоны визиток 90×50 мм" : "Шаблоны листовок А4"}</h2>
            <div className={`grid gap-4 ${grid}`}>
              <button
                onClick={() => setOpen({ title: isCard ? "Моя визитка" : "Моя листовка", design: blankDesign(filter) })}
                className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#D4AF37]/50 bg-[#1f1f1f] p-4 text-[#D4AF37] hover:bg-[#D4AF37]/5"
              >
                <Icon name="SquarePlus" size={40} strokeWidth={1.5} />
                <span className="text-sm font-medium">Создать свой дизайн</span>
              </button>
              {templates.map((t) => {
                const d = t.build(contacts)
                const portrait = d.orientation === "portrait"
                return (
                  <button key={t.id} onClick={() => setOpen({ title: t.name, design: { ...d, template: t.id } })} className="rounded-xl border border-white/10 bg-[#1f1f1f] p-3 text-left transition-colors hover:border-[#D4AF37]/60">
                    <div className="flex items-center justify-center rounded-lg bg-[#2b2b2b] p-4">
                      {isCard ? (
                        <div className={`flex ${portrait ? "flex-row" : "flex-col"} gap-2`}>
                          <DesignThumb design={d} width={portrait ? 80 : 170} />
                          {d.sides[1] && <DesignThumb design={d} side={1} width={portrait ? 80 : 170} />}
                        </div>
                      ) : (
                        <DesignThumb design={d} width={150} />
                      )}
                    </div>
                    <div className="mt-2 truncate text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-white/40">{isCard ? "90×50 мм · 2 стороны" : "А4 · 210×297 мм"}</div>
                  </button>
                )
              })}
            </div>
          </section>
        </>
      )}
    </CrmLayout>
  )
}
