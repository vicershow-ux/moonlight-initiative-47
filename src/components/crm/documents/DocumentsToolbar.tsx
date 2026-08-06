import { Dispatch, SetStateAction } from "react"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { tabs, TabKey } from "./constants"

interface DocumentsToolbarProps {
  tab: TabKey
  setTab: Dispatch<SetStateAction<TabKey>>
  search: string
  setSearch: Dispatch<SetStateAction<string>>
}

export function DocumentsToolbar({ tab, setTab, search, setSearch }: DocumentsToolbarProps) {
  return (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-white/10">
    <div className="flex items-center gap-1 bg-[#161616] rounded-lg p-1 overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => setTab(t.key)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors",
            tab === t.key ? "bg-[#D4AF37] text-[#161616]" : "text-white/50 hover:text-white"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>

    <div className="relative w-full sm:w-72">
      <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск по номеру, адресу, заказчику..."
        className="w-full bg-[#161616] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50"
      />
    </div>
  </div>
  )
}

export default DocumentsToolbar
