import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { portalApi } from "@/lib/executorsApi"
import { ExecutorChatThread } from "@/components/crm/executors/ExecutorChatThread"

interface Props {
  objects: { id: number; object_code: string; address: string }[]
  companyName: string
}

/** Чат исполнителя с заказчиком работ — отдельно по каждому объекту */
export function PortalChat({ objects, companyName }: Props) {
  const [unread, setUnread] = useState<Record<string, number>>({})
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    const load = () =>
      portalApi
        .chatUnread()
        .then((d) => {
          setUnread(d.unread || {})
          const first = Object.keys(d.unread || {})[0]
          setActive((cur) => cur ?? (first ? Number(first) : null))
        })
        .catch(() => null)
    load()
    const t = setInterval(() => {
      if (document.visibilityState === "visible") load()
    }, 30000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (active == null && objects.length) setActive(objects[0].id)
  }, [objects, active])

  if (!objects.length) return null
  const current = objects.find((o) => o.id === active) || objects[0]
  const total = Object.values(unread).reduce((a, b) => a + b, 0)

  return (
    <section className="bg-[#1f1f1f] border border-white/10 rounded-xl flex flex-col">
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <Icon name="MessagesSquare" size={17} className="text-[#D4AF37]" />
        <p className="font-medium">Чат с заказчиком</p>
        {total > 0 && <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] flex items-center justify-center">{total}</span>}
        <span className="text-xs text-white/40 ml-auto truncate">{companyName}</span>
      </div>

      {objects.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-3 pt-3 pb-1">
          {objects.map((o) => {
            const n = unread[String(o.id)] || 0
            return (
              <button
                key={o.id}
                onClick={() => {
                  setActive(o.id)
                  setUnread((u) => ({ ...u, [String(o.id)]: 0 }))
                }}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-3 min-h-[40px] rounded-full text-sm border transition-colors",
                  current.id === o.id ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]" : "border-white/10 text-white/60"
                )}
              >
                {o.object_code}
                {n > 0 && <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">{n}</span>}
              </button>
            )
          })}
        </div>
      )}
      <p className="px-4 pt-2 text-xs text-white/40 truncate">
        {current.object_code}
        {current.address ? ` · ${current.address}` : ""}
      </p>

      <ExecutorChatThread
        threadKey={String(current.id)}
        me="executor"
        height="h-[360px]"
        load={(after) => portalApi.chatMessages(current.id, after)}
        send={(body, photos) => portalApi.chatSend(current.id, body, photos)}
        emptyText="Напишите вопрос по объекту или пришлите фото — заказчик ответит здесь же."
      />
    </section>
  )
}

export default PortalChat
