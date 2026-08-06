import { ObjectItem } from "@/lib/api"
import { ObjectFilesCard } from "@/components/crm/ObjectFilesCard"
import { formatMoney, formatDateTime } from "./utils"

interface ObjectSidebarProps {
  object: ObjectItem
  worksTotal: number
  materialsTotal: number
  userFullName?: string
}

export function ObjectSidebar({
  object,
  worksTotal,
  materialsTotal,
  userFullName,
}: ObjectSidebarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
        <p className="font-medium mb-4">Стоимость проекта</p>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-white/50">Работы</span>
            <span className="font-medium">{formatMoney(worksTotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/50">Материалы</span>
            <span className="font-medium">{formatMoney(materialsTotal)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-3">
            <span className="text-white/70">Итого</span>
            <span className="text-lg font-semibold text-[#D4AF37]">
              {formatMoney(worksTotal + materialsTotal)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
        <p className="font-medium mb-4">Информация</p>
        <div className="flex flex-col gap-3 text-sm">
          <div>
            <p className="text-xs text-white/40 mb-1">Создал</p>
            <p className="font-medium">{userFullName || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Дата создания</p>
            <p className="font-medium">{formatDateTime(object.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Последнее обновление</p>
            <p className="font-medium">{formatDateTime(object.updated_at)}</p>
          </div>
        </div>
      </div>

      <ObjectFilesCard objectId={object.id} />
    </div>
  )
}

export default ObjectSidebar
