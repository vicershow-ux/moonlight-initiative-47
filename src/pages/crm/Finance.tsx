import { useEffect, useState } from "react"
import { Link } from "@/lib/router-compat"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { financeApi, FinanceData, FinancePeriod } from "@/lib/api"
import { FinanceBalance, FinanceKpis } from "@/components/crm/finance/FinanceKpis"
import { FinanceChart } from "@/components/crm/finance/FinanceChart"
import { FinanceObjects } from "@/components/crm/finance/FinanceObjects"
import { FinanceInvoices } from "@/components/crm/finance/FinanceInvoices"
import { FinanceUpcoming } from "@/components/crm/finance/FinanceUpcoming"
import { FinanceExpenses } from "@/components/crm/finance/FinanceExpenses"
import { FinanceIncomes } from "@/components/crm/finance/FinanceIncomes"
import { BankDebitsInbox } from "@/components/crm/finance/BankDebitsInbox"

const PERIODS: { k: FinancePeriod; l: string }[] = [
  { k: "month", l: "Месяц" },
  { k: "quarter", l: "Квартал" },
  { k: "year", l: "Год" },
  { k: "all", l: "Всё время" },
]

export default function Finance() {
  const [period, setPeriod] = useState<FinancePeriod>("year")
  const [data, setData] = useState<FinanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    setLoading(true)
    setError("")
    financeApi
      .get(period)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Не удалось загрузить данные"))
      .finally(() => setLoading(false))
  }, [period])

  const reload = () => financeApi.get(period).then(setData).catch(() => null)

  useEffect(() => {
    window.addEventListener("invoice-paid", reload)
    return () => window.removeEventListener("invoice-paid", reload)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period])

  return (
    <CrmLayout title="Финансы" subtitle="Доходы, расходы, долги заказчиков и прибыль по объектам">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex w-full sm:w-auto overflow-x-auto whitespace-nowrap rounded-lg bg-white/5 p-0.5 text-sm">
            {PERIODS.map((p) => (
              <button
                key={p.k}
                onClick={() => setPeriod(p.k)}
                className={`flex-1 sm:flex-none shrink-0 min-h-[40px] sm:min-h-0 rounded-md px-3 py-1.5 ${period === p.k ? "bg-[#D4AF37] text-[#161616] font-medium" : "text-white/60 hover:text-white"}`}
              >
                {p.l}
              </button>
            ))}
          </div>
          <Link to="/cabinet/integrations" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white">
            <Icon name="Blocks" size={15} />
            Онлайн-оплата и банк
          </Link>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {!data ? (
          loading && (
            <div className="flex justify-center py-24">
              <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
            </div>
          )
        ) : (
          <div className={`flex flex-col gap-4 transition-opacity ${loading ? "opacity-60" : ""}`}>
            <FinanceKpis s={data.summary} />
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4 items-start">
              <FinanceChart months={data.months} />
              <div className="flex flex-col gap-4">
                <FinanceBalance s={data.summary} categories={data.categories} incomeCategories={data.income_categories} />
                <FinanceUpcoming items={data.upcoming} />
              </div>
            </div>
            <BankDebitsInbox data={data} onChanged={reload} />
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 items-start">
              <FinanceIncomes data={data} onChanged={reload} />
              <FinanceExpenses data={data} onChanged={reload} />
            </div>
            <FinanceObjects objects={data.objects} />
            <FinanceInvoices invoices={data.invoices} />
          </div>
        )}
      </div>
    </CrmLayout>
  )
}
