import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import {
  companyApi,
  warehouseApi,
  CompanyData,
  WarehouseRow,
  WarehouseItem,
} from "@/lib/api"

const money = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n || 0) + " ₽"

const num = (n: unknown) => Number(n || 0)

const KIND_STYLE: Record<string, { cls: string; icon: string }> = {
  инструмент: { cls: "bg-[#4A90D9]/15 text-[#7FB5E8]", icon: "Hammer" },
  оборудование: { cls: "bg-[#9B7BD4]/15 text-[#B49AE5]", icon: "Cog" },
  расходник: { cls: "bg-emerald-500/15 text-emerald-400", icon: "Layers" },
}

const kindOf = (kind: string) =>
  KIND_STYLE[kind] || { cls: "bg-[#D4AF37]/15 text-[#D4AF37]", icon: "Package" }

const ENTITY_LABEL: Record<string, string> = {
  individual: "Физическое лицо",
  ip: "Индивидуальный предприниматель",
  company: "Юридическое лицо",
}

function Field({ label, value, href }: { label: string; value?: string; href?: string }) {
  if (!value) return null
  return (
    <div>
      <div className="mb-0.5 text-xs text-white/40">{label}</div>
      {href ? (
        <a href={href} className="text-sm text-white/90 hover:text-[#D4AF37]">
          {value}
        </a>
      ) : (
        <div className="text-sm text-white/90">{value}</div>
      )}
    </div>
  )
}

export default function CompanyAssets() {
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [warehouses, setWarehouses] = useState<WarehouseRow[]>([])
  const [items, setItems] = useState<WarehouseItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([companyApi.get(), warehouseApi.list()])
      .then(([c, w]) => {
        setCompany(c as CompanyData)
        setWarehouses(w.warehouses || [])
        setItems(w.items || [])
      })
      .finally(() => setLoading(false))
  }, [])

  const stock = useMemo(() => items.filter((i) => !i.object_id), [items])
  const issued = useMemo(() => items.filter((i) => i.object_id), [items])

  const stockSum = useMemo(
    () => stock.reduce((s, i) => s + num(i.qty) * num(i.price), 0),
    [stock]
  )
  const issuedSum = useMemo(
    () => issued.reduce((s, i) => s + (num(i.issued_qty) - num(i.used_qty)) * num(i.price), 0),
    [issued]
  )

  const byKind = useMemo(() => {
    const map = new Map<string, { count: number; qty: number; sum: number }>()
    items.forEach((i) => {
      const q = i.object_id ? num(i.issued_qty) - num(i.used_qty) : num(i.qty)
      if (q <= 0) return
      const cur = map.get(i.kind) || { count: 0, qty: 0, sum: 0 }
      cur.count += 1
      cur.qty += q
      cur.sum += q * num(i.price)
      map.set(i.kind, cur)
    })
    return Array.from(map.entries()).sort((a, b) => b[1].sum - a[1].sum)
  }, [items])

  const tech = useMemo(
    () =>
      items
        .filter((i) => ["инструмент", "оборудование"].includes(i.kind))
        .filter((i) => (i.object_id ? num(i.issued_qty) - num(i.used_qty) : num(i.qty)) > 0),
    [items]
  )

  const techSum = useMemo(
    () =>
      tech.reduce(
        (s, i) =>
          s + (i.object_id ? num(i.issued_qty) - num(i.used_qty) : num(i.qty)) * num(i.price),
        0
      ),
    [tech]
  )

  const card = "rounded-xl border border-white/10 bg-[#1f1f1f] p-5"

  if (loading) {
    return (
      <CrmLayout title="Компания" subtitle="Склады, техника и имущество компании">
        <div className="flex justify-center py-16">
          <Icon name="Loader2" size={24} className="animate-spin text-white/40" />
        </div>
      </CrmLayout>
    )
  }

  const hasRequisites =
    company?.inn || company?.legal_address || company?.bank_name || company?.account_number

  return (
    <CrmLayout title="Компания" subtitle="Склады, техника и имущество компании">
      <div className="space-y-5">
        <div className={card}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Icon name="Building" size={17} className="text-[#D4AF37]" />
              Данные компании
            </div>
            <Link
              to="/cabinet/company"
              className="flex items-center gap-1.5 text-xs text-white/40 transition-colors hover:text-[#D4AF37]"
            >
              <Icon name="Pencil" size={13} />
              Изменить
            </Link>
          </div>

          {!company?.name ? (
            <div className="py-8 text-center text-sm text-white/30">
              Данные компании не заполнены —{" "}
              <Link to="/cabinet/company" className="text-[#D4AF37] hover:underline">
                заполнить
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Название" value={company.name} />
                <Field
                  label="Тип субъекта"
                  value={ENTITY_LABEL[company.entity_type] || company.entity_type}
                />
                <Field label="Контактное лицо" value={company.contact_full_name} />
                <Field
                  label="Телефон"
                  value={company.phone}
                  href={company.phone ? `tel:${company.phone}` : undefined}
                />
                <Field
                  label="Email"
                  value={company.email}
                  href={company.email ? `mailto:${company.email}` : undefined}
                />
                <Field label="Сайт" value={company.website} href={company.website} />
                <Field label="Вид деятельности" value={company.activity_type} />
              </div>

              {hasRequisites && (
                <div className="mt-5 rounded-lg border border-white/10 p-4">
                  <div className="mb-3 text-xs uppercase text-white/40">Реквизиты</div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="ИНН" value={company.inn} />
                    <Field label="Юридический адрес" value={company.legal_address} />
                    <Field label="Банк" value={company.bank_name} />
                    <Field label="БИК" value={company.bik} />
                    <Field label="Расчётный счёт" value={company.account_number} />
                    <Field label="Корр. счёт" value={company.correspondent_account} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className={card}>
            <div className="text-xs text-white/40">Складов</div>
            <div className="text-2xl text-[#D4AF37]">{warehouses.length}</div>
          </div>
          <div className={card}>
            <div className="text-xs text-white/40">Позиций на складах</div>
            <div className="text-2xl text-[#D4AF37]">{stock.length}</div>
          </div>
          <div className={card}>
            <div className="text-xs text-white/40">Техника и оборудование</div>
            <div className="text-2xl text-[#7FB5E8]">{money(techSum)}</div>
          </div>
          <div className={card}>
            <div className="text-xs text-white/40">Всего имущества</div>
            <div className="text-2xl text-[#D4AF37]">{money(stockSum + issuedSum)}</div>
          </div>
        </div>

        <div className={card}>
          <div className="mb-4 flex items-center gap-2 text-sm text-white/70">
            <Icon name="Warehouse" size={17} className="text-[#D4AF37]" />
            Склады компании
          </div>

          {warehouses.length === 0 ? (
            <div className="py-8 text-center text-sm text-white/30">
              Складов пока нет —{" "}
              <Link to="/cabinet/warehouse" className="text-[#D4AF37] hover:underline">
                добавить склад
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase text-white/40">
                    <th className="py-2 pr-4 text-left font-medium">Склад</th>
                    <th className="py-2 pr-4 text-left font-medium">Адрес</th>
                    <th className="py-2 pr-4 text-left font-medium">Ответственный</th>
                    <th className="py-2 pr-4 text-left font-medium">Телефон</th>
                    <th className="py-2 pr-4 text-left font-medium">Позиций</th>
                    <th className="py-2 pr-4 text-left font-medium">Стоимость</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.map((w) => {
                    const sum = stock
                      .filter((i) => i.warehouse_id === w.id)
                      .reduce((s, i) => s + num(i.qty) * num(i.price), 0)
                    return (
                      <tr key={w.id} className="border-b border-white/5 last:border-0">
                        <td className="py-3 pr-4">{w.name}</td>
                        <td className="py-3 pr-4 text-white/60">{w.address || "—"}</td>
                        <td className="py-3 pr-4 text-white/60">{w.responsible || "—"}</td>
                        <td className="py-3 pr-4 text-white/60">
                          {w.phone ? (
                            <a href={`tel:${w.phone}`} className="hover:text-[#D4AF37]">
                              {w.phone}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 pr-4">{w.positions}</td>
                        <td className="py-3 pr-4">{money(sum)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {byKind.length > 0 && (
          <div className={card}>
            <div className="mb-4 flex items-center gap-2 text-sm text-white/70">
              <Icon name="ChartPie" size={17} className="text-[#D4AF37]" />
              Имущество по категориям
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {byKind.map(([kind, v]) => {
                const st = kindOf(kind)
                return (
                  <div key={kind} className="rounded-lg border border-white/10 bg-[#161616] p-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs ${st.cls}`}
                    >
                      <Icon name={st.icon} size={12} />
                      {kind}
                    </span>
                    <div className="mt-2 text-lg">{money(v.sum)}</div>
                    <div className="text-xs text-white/40">{v.count} наименований</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className={card}>
          <div className="mb-4 flex items-center gap-2 text-sm text-white/70">
            <Icon name="Hammer" size={17} className="text-[#7FB5E8]" />
            Техника и оборудование
          </div>

          {tech.length === 0 ? (
            <div className="py-8 text-center text-sm text-white/30">
              Инструменты и оборудование пока не заведены
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase text-white/40">
                    <th className="py-2 pr-4 text-left font-medium">Наименование</th>
                    <th className="py-2 pr-4 text-left font-medium">Тип</th>
                    <th className="py-2 pr-4 text-left font-medium">Кол-во</th>
                    <th className="py-2 pr-4 text-left font-medium">Где находится</th>
                    <th className="py-2 pr-4 text-left font-medium">Стоимость</th>
                  </tr>
                </thead>
                <tbody>
                  {tech.map((i) => {
                    const st = kindOf(i.kind)
                    const q = i.object_id ? num(i.issued_qty) - num(i.used_qty) : num(i.qty)
                    return (
                      <tr key={i.id} className="border-b border-white/5 last:border-0">
                        <td className="py-3 pr-4">{i.name}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs ${st.cls}`}
                          >
                            <Icon name={st.icon} size={12} />
                            {i.kind}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          {q} {i.unit}
                        </td>
                        <td className="py-3 pr-4 text-white/60">
                          {i.object_id ? (
                            <span className="flex items-center gap-1.5">
                              <Icon name="Building2" size={13} className="text-[#D4AF37]" />
                              {i.object_code}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <Icon name="Warehouse" size={13} />
                              {i.warehouse_name || "Склад не указан"}
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4">{money(q * num(i.price))}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </CrmLayout>
  )
}
