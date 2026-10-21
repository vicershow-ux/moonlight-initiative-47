import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { bankApi, BankSettings, paySettingsApi, PaySettings } from "@/lib/api"
import { YookassaSettings } from "@/components/crm/integrations/YookassaSettings"
import { TbankSettings } from "@/components/crm/integrations/TbankSettings"

type Status = "on" | "off" | "soon"

interface IntegrationDef {
  slug: string
  name: string
  category: string
  description: string
  icon: string
  color: string
  available: boolean
}

const INTEGRATIONS: IntegrationDef[] = [
  {
    slug: "yookassa",
    name: "ЮKassa",
    category: "Онлайн-оплата",
    description: "Оплата счетов картой, СБП и кошельками прямо из кабинета заказчика. Онлайн-чеки по 54-ФЗ.",
    icon: "CreditCard",
    color: "#4A9BFF",
    available: true,
  },
  {
    slug: "telegram",
    name: "Telegram",
    category: "Уведомления",
    description: "Уведомления о новых заявках, оплатах и подписании документов в Telegram.",
    icon: "Send",
    color: "#2AABEE",
    available: false,
  },
  {
    slug: "tbank",
    name: "Т-Банк Бизнес",
    category: "Банк",
    description: "Счета автоматически отмечаются оплаченными по поступлениям на расчётный счёт.",
    icon: "Landmark",
    color: "#FFDD2D",
    available: true,
  },
  {
    slug: "moysklad",
    name: "МойСклад",
    category: "Учёт",
    description: "Синхронизация материалов и остатков склада.",
    icon: "Warehouse",
    color: "#22C55E",
    available: false,
  },
]

const STATUS: Record<Status, { label: string; cls: string }> = {
  on: { label: "Подключено", cls: "bg-green-500/20 text-green-300" },
  off: { label: "Не подключено", cls: "bg-white/10 text-white/50" },
  soon: { label: "Скоро", cls: "bg-[#D4AF37]/15 text-[#D4AF37]" },
}

export default function Integrations() {
  const { slug } = useParams()
  const [yk, setYk] = useState<PaySettings | null>(null)
  const [bank, setBank] = useState<BankSettings | null>(null)

  useEffect(() => {
    if (slug) return
    paySettingsApi.get().then(setYk).catch(() => null)
    bankApi.get().then(setBank).catch(() => null)
  }, [slug])

  const statusOf = (it: IntegrationDef): Status => {
    if (!it.available) return "soon"
    if (it.slug === "yookassa") return yk?.enabled && yk.shop_id && yk.has_secret ? "on" : "off"
    if (it.slug === "tbank") return bank?.enabled && bank.has_token && bank.account_number ? "on" : "off"
    return "off"
  }

  const current = INTEGRATIONS.find((i) => i.slug === slug && i.available)

  if (current) {
    return (
      <CrmLayout title={current.name} subtitle={`Интеграции · ${current.category}`}>
        <Link to="/cabinet/integrations" className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white">
          <Icon name="ArrowLeft" size={15} />
          Все интеграции
        </Link>
        {current.slug === "yookassa" && <YookassaSettings onChange={setYk} />}
        {current.slug === "tbank" && <TbankSettings onChange={setBank} />}
      </CrmLayout>
    )
  }

  return (
    <CrmLayout title="Интеграции" subtitle="Подключение внешних сервисов к кабинету">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {INTEGRATIONS.map((it) => {
          const st = STATUS[statusOf(it)]
          const body = (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg" style={{ backgroundColor: `${it.color}22` }}>
                  <Icon name={it.icon} size={22} style={{ color: it.color }} />
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${st.cls}`}>{st.label}</span>
              </div>
              <div>
                <p className="font-medium">{it.name}</p>
                <p className="text-xs text-white/40">{it.category}</p>
              </div>
              <p className="flex-1 text-sm text-white/60">{it.description}</p>
              {it.available && (
                <span className="inline-flex items-center gap-1 text-sm text-[#D4AF37]">
                  {statusOf(it) === "on" ? "Настроить" : "Подключить"}
                  <Icon name="ArrowRight" size={14} />
                </span>
              )}
            </>
          )
          const cls = "flex flex-col gap-3 rounded-xl border border-white/10 bg-[#1f1f1f] p-3 sm:p-5"
          return it.available ? (
            <Link key={it.slug} to={`/cabinet/integrations/${it.slug}`} className={`${cls} transition-colors hover:border-[#D4AF37]/40`}>
              {body}
            </Link>
          ) : (
            <div key={it.slug} className={`${cls} opacity-70`}>
              {body}
            </div>
          )
        })}
      </div>
    </CrmLayout>
  )
}
