import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"

export default function Documents() {
  return (
    <CrmLayout title="Документы" subtitle="Документы по вашим объектам">
      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-16 flex flex-col items-center justify-center text-center">
        <Icon name="FileText" size={40} className="text-white/20 mb-4" />
        <p className="text-white/50 text-sm">Пока нет документов</p>
        <p className="text-white/30 text-xs mt-1">Документы будут появляться здесь по мере создания объектов</p>
      </div>
    </CrmLayout>
  )
}
