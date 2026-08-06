import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { materialsApi, MaterialEstimate, ObjectMaterial } from "@/lib/api"

const num = (n: unknown) => Number(n || 0)

const formatMoney = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n || 0) + " ₽"

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })

type TabKey = "items" | "estimates"

const tabs: { key: TabKey; label: string }[] = [
  { key: "items", label: "Рассчитанные материалы" },
  { key: "estimates", label: "Сметы на материал" },
]

interface Props {
  objectId: number
}

export function ObjectMaterialsCard({ objectId }: Props) {
  const [items, setItems] = useState<ObjectMaterial[]>([])
  const [estimates, setEstimates] = useState<MaterialEstimate[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>("items")

  useEffect(() => {
    setLoading(true)
    materialsApi
      .list()
      .then((d) => {
        setItems((d.object_materials || []).filter((m) => m.object_id === objectId))
        setEstimates((d.estimates || []).filter((e) => e.object_id === objectId))
      })
      .finally(() => setLoading(false))
  }, [objectId])

  const totalItems = useMemo(
    () => items.reduce((s, m) => s + num(m.qty) * num(m.price), 0),
    [items]
  )

  const totalEstimates = useMemo(
    () => estimates.reduce((s, e) => s + num(e.total_amount), 0),
    [estimates]
  )

  const groups = useMemo(() => {
    const map = new Map<string, { title: string; items: ObjectMaterial[]; sum: number }>()
    items.forEach((m) => {
      const key = m.room_name || "Без помещения"
      if (!map.has(key)) map.set(key, { title: key, items: [], sum: 0 })
      const g = map.get(key)!
      g.items.push(m)
      g.sum += num(m.qty) * num(m.price)
    })
    return Array.from(map.values())
  }, [items])

  return (
    <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="font-medium">Материалы</p>
        <Link
          to="/cabinet/materials"
          className="text-sm text-[#D4AF37] hover:text-[#B8860B] transition-colors"
        >
          Управлять
        </Link>
      </div>

      <div className="flex items-center gap-1 bg-[#161616] rounded-lg p-1 mb-4 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors",
              tab === t.key ? "bg-[#D4AF37] text-[#161616]" : "text-white/50 hover:text-white"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Icon name="Loader2" size={20} className="animate-spin text-white/40" />
        </div>
      ) : tab === "items" ? (
        items.length === 0 ? (
          <div className="text-center py-8 text-white/30 text-sm">
            По этому объекту материалы ещё не рассчитаны
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {groups.map((g) => (
                <div key={g.title} className="bg-[#161616] border border-white/10 rounded-lg p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="DoorOpen" size={15} className="text-[#D4AF37]" />
                      {g.title}
                    </div>
                    <span className="text-sm text-[#D4AF37]">{formatMoney(g.sum)}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 text-sm">
                    {g.items.map((m) => (
                      <div key={m.id} className="flex flex-wrap justify-between gap-2">
                        <span className="text-white/70">
                          {m.name}
                          {m.work_type && (
                            <span className="ml-2 text-xs text-white/30">{m.work_type}</span>
                          )}
                        </span>
                        <span className="text-white/50">
                          {num(m.qty)} {m.unit} · {formatMoney(num(m.qty) * num(m.price))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4">
              <span className="text-sm text-white/50">
                Позиций: {items.length} · Помещений: {groups.length}
              </span>
              <span className="text-lg font-semibold text-[#D4AF37]">
                {formatMoney(totalItems)}
              </span>
            </div>
          </>
        )
      ) : estimates.length === 0 ? (
        <div className="text-center py-8 text-white/30 text-sm">
          Сохранённых смет на материал пока нет
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {estimates.map((e) => (
              <div key={e.id} className="bg-[#161616] border border-white/10 rounded-lg p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-medium">
                    {e.title} №{e.id}
                  </p>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-300">
                    сохранена
                  </span>
                </div>
                <p className="text-xs text-white/30 mb-2">
                  {formatDate(e.created_at)}
                  {e.room_names ? ` · ${e.room_names}` : ""}
                </p>
                <p className="text-lg font-semibold">{formatMoney(num(e.total_amount))}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4">
            <span className="text-sm text-white/50">Смет: {estimates.length}</span>
            <span className="text-lg font-semibold text-[#D4AF37]">
              {formatMoney(totalEstimates)}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

export default ObjectMaterialsCard
