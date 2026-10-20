import Icon from "@/components/ui/icon"
import { TabKey } from "@/components/crm/documents/constants"

export function DocumentsEmptyState({ tab }: { tab: TabKey }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16">
      <Icon name="FileText" size={36} className="text-white/20 mb-3" />
      <p className="text-white/50 text-sm">Документов пока нет</p>
      <p className="text-white/30 text-xs mt-1">
        {tab === "contracts"
          ? "Составьте договор на странице объекта — он появится здесь"
          : tab === "addenda"
          ? "Создайте доп. соглашение на странице договора — оно появится здесь"
          : "Создайте смету на странице объекта — она появится здесь"}
      </p>
    </div>
  )
}

export default DocumentsEmptyState
