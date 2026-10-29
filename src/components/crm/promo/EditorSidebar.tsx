import { Dispatch, ReactNode, SetStateAction } from "react"
import Icon from "@/components/ui/icon"
import { PanelTab, TABS } from "./LeftPanel"

interface Props {
  tab: PanelTab
  panelOpen: boolean
  setTab: Dispatch<SetStateAction<PanelTab>>
  setPanelOpen: Dispatch<SetStateAction<boolean>>
  children: ReactNode
}

/** Вертикальное меню вкладок и выдвижная панель с инструментами */
export function EditorSidebar({ tab, panelOpen, setTab, setPanelOpen, children }: Props) {
  return (
    <>
      <nav className="flex w-[68px] shrink-0 flex-col border-r border-white/10 bg-[#1a1a1a] py-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              if (tab === t.id) setPanelOpen((o) => !o)
              else {
                setTab(t.id)
                setPanelOpen(true)
              }
            }}
            className={`flex flex-col items-center gap-1 py-3 text-[10px] ${tab === t.id && panelOpen ? "bg-[#D4AF37]/15 text-[#D4AF37]" : "text-white/55 hover:text-white"}`}
          >
            <Icon name={t.icon} size={20} />
            {t.label}
          </button>
        ))}
      </nav>

      {panelOpen && (
        <aside className="absolute bottom-0 left-[68px] top-14 z-10 w-72 overflow-y-auto border-r border-white/10 bg-[#1f1f1f] p-4 shadow-2xl md:static md:shadow-none">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium">{TABS.find((t) => t.id === tab)?.label}</span>
            <button onClick={() => setPanelOpen(false)} className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-white" aria-label="Скрыть">
              <Icon name="ChevronsLeft" size={16} />
            </button>
          </div>
          {children}
        </aside>
      )}
    </>
  )
}

export default EditorSidebar
