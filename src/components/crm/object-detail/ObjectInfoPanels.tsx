import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { ObjectItem, ObjectRoom } from "@/lib/api"
import { yesNo, capitalizeFirst } from "./utils"

interface ObjectInfoPanelsProps {
  object: ObjectItem
  rooms: ObjectRoom[]
  roomsLoading: boolean
}

export function ObjectInfoPanels({ object, rooms, roomsLoading }: ObjectInfoPanelsProps) {
  return (
    <>
      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
        <p className="font-medium mb-4">Информация о заказчике</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-white/40 mb-1">ФИО / Организация</p>
            <p className="font-medium">{object.client_name}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Правовой статус</p>
            <p className="font-medium">{capitalizeFirst(object.legal_status)}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Телефон</p>
            <p className="font-medium">{object.client_phone || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Email</p>
            <p className="font-medium text-[#D4AF37]">{object.email || "—"}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
        <p className="font-medium mb-4">Параметры объекта</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-white/40 mb-1">Тип объекта</p>
            <p className="font-medium">{object.object_type}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Площадь</p>
            <p className="font-medium">{object.area} м²</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-white/40 mb-1">Адрес объекта</p>
            <p className="font-medium">{object.address || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Тип оплаты</p>
            <p className="font-medium">{capitalizeFirst(object.payment_type)}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Проживание на объекте</p>
            <p className="font-medium">{yesNo(object.residence_during_works)}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Наличие лифта</p>
            <p className="font-medium">{capitalizeFirst(object.has_elevator) || "Не указано"}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Разгрузка материала</p>
            <p className="font-medium">{capitalizeFirst(object.material_unloading) || "Не указано"}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Комплектация</p>
            <p className="font-medium">{capitalizeFirst(object.completion_type)}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Отказ от гарантии</p>
            <p className={`font-medium ${object.warranty_waiver ? "text-red-400" : "text-green-400"}`}>
              {yesNo(object.warranty_waiver)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
        <p className="font-medium mb-4">Материалы и мебель</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-white/40 mb-1">Черновой материал</p>
            <p className="font-medium">{capitalizeFirst(object.rough_material) || "Не указано"}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Чистовой материал</p>
            <p className="font-medium">{capitalizeFirst(object.finish_material) || "Не указано"}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Кухня и мебель</p>
            <p className="font-medium">{capitalizeFirst(object.kitchen_furniture) || "Не указано"}</p>
          </div>
        </div>
      </div>

      {object.measurer_comment && (
        <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
          <p className="font-medium mb-3">Комментарий замерщика</p>
          <p className="text-sm text-white/60 whitespace-pre-wrap">{object.measurer_comment}</p>
        </div>
      )}

      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
        <p className="font-medium mb-3">Дизайн-проект</p>
        {object.design_project ? (
          <div className="flex flex-wrap gap-2">
            {(() => {
              try {
                const list = JSON.parse(object.design_project) as string[]
                return list.map((dp) => (
                  <span key={dp} className="inline-block px-3 py-1.5 rounded-lg text-sm bg-blue-500/15 text-blue-300">
                    {dp}
                  </span>
                ))
              } catch {
                return (
                  <span className="inline-block px-3 py-1.5 rounded-lg text-sm bg-blue-500/15 text-blue-300">
                    {object.design_project}
                  </span>
                )
              }
            })()}
          </div>
        ) : (
          <p className="text-sm text-white/30">Не выбрано</p>
        )}
      </div>

      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-medium">Эталонные помещения</p>
          <Link
            to={`/cabinet/objects/${object.id}/rooms`}
            className="text-sm text-[#D4AF37] hover:text-[#B8860B] transition-colors"
          >
            Управлять
          </Link>
        </div>
        {roomsLoading ? (
          <div className="flex justify-center py-6">
            <Icon name="Loader2" size={18} className="animate-spin text-white/40" />
          </div>
        ) : rooms.length === 0 ? (
          <p className="text-sm text-white/30">Помещений пока нет</p>
        ) : (
          <div className="flex flex-col gap-2">
            {rooms.map((room) => (
              <div key={room.id} className="bg-[#161616] border border-white/10 rounded-lg p-4">
                <p className="text-sm font-medium">{room.name}</p>
                <p className="text-xs text-white/30 mt-1">
                  {room.room_type && `${room.room_type} · `}
                  {room.area} м² · {room.perimeter} м/п
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default ObjectInfoPanels
