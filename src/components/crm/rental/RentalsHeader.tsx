import Icon from "@/components/ui/icon"
import { money } from "@/lib/rental"
import { Tab, card, goldBtn } from "./rentalsUi"

interface Props {
  error: string
  showError: boolean
  activeCount: number
  overdueCount: number
  returnedCount: number
  counterpartiesCount: number
  activeSum: number
  depositSum: number
  tab: Tab
  onTabChange: (tab: Tab) => void
  onCreate: () => void
}

export function RentalsHeader({
  error,
  showError,
  activeCount,
  overdueCount,
  returnedCount,
  counterpartiesCount,
  activeSum,
  depositSum,
  tab,
  onTabChange,
  onCreate,
}: Props) {
  return (
    <>
      {error && showError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          <Icon name="CircleAlert" size={16} />
          {error}
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={card}>
          <div className="text-xs text-white/40">В аренде сейчас</div>
          <div className="text-2xl text-[#D4AF37]">{activeCount}</div>
        </div>
        <div className={card}>
          <div className="text-xs text-white/40">Просрочено</div>
          <div className={`text-2xl ${overdueCount ? "text-red-400" : "text-white/60"}`}>
            {overdueCount}
          </div>
        </div>
        <div className={card}>
          <div className="text-xs text-white/40">Начислено аренды</div>
          <div className="text-xl text-[#7FB5E8] md:text-2xl">{money(activeSum)}</div>
        </div>
        <div className={card}>
          <div className="text-xs text-white/40">Залогов на руках</div>
          <div className="text-xl md:text-2xl">{money(depositSum)}</div>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto">
          {([
            ["active", `Активные (${activeCount})`],
            ["returned", `История (${returnedCount})`],
            ["counterparties", `Контрагенты (${counterpartiesCount})`],
          ] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`min-h-[40px] shrink-0 rounded-lg px-4 text-sm transition-colors ${
                tab === key
                  ? "bg-[#D4AF37] text-[#161616]"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button className={goldBtn} onClick={onCreate}>
          <Icon name="Plus" size={16} />
          {tab === "counterparties" ? "Новый контрагент" : "Оформить аренду"}
        </button>
      </div>
    </>
  )
}

export default RentalsHeader
