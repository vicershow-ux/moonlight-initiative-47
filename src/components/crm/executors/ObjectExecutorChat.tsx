import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { ChatThread, executorChatApi } from "@/lib/executorsApi"
import { ExecutorChatThread } from "./ExecutorChatThread"

/** Чат с исполнителями по объекту — отдельная переписка с каждым */
export function ObjectExecutorChat({ objectId }: { objectId: number }) {
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [active, setActive] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const loadThreads = () =>
    executorChatApi
      .threads(objectId)
      .then((d) => {
        setThreads(d.threads || [])
        setActive((cur) => cur ?? d.threads?.find((t) => t.unread)?.executor_id ?? d.threads?.[0]?.executor_id ?? null)
      })
      .catch(() => setThreads([]))
      .finally(() => setLoading(false))

  useEffect(() => {
    setActive(null)
    setLoading(true)
    loadThreads()
    const t = setInterval(() => {
      if (document.visibilityState === "visible") loadThreads()
    }, 30000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectId])

  if (loading || threads.length === 0) return null
  const current = threads.find((t) => t.executor_id === active)

  return (
    <div className="bg-[#1f1f1f] border border-white/10 rounded-xl flex flex-col">
      <div className="px-4 sm:px-5 py-4 border-b border-white/10 flex items-center gap-2">
        <Icon name="MessageSquareMore" size={17} className="text-orange-300" />
        <p className="font-medium">Чат с исполнителями</p>
        <span className="text-xs text-white/40 ml-auto hidden sm:inline">заказчик объекта эту переписку не видит</span>
      </div>

      {threads.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-3 sm:px-4 pt-3 pb-1">
          {threads.map((t) => (
            <button
              key={t.executor_id}
              onClick={() => {
                setActive(t.executor_id)
                setThreads((list) => list.map((x) => (x.executor_id === t.executor_id ? { ...x, unread: 0 } : x)))
              }}
              className={cn(
                "shrink-0 flex items-center gap-1.5 px-3 min-h-[36px] rounded-full text-sm border transition-colors",
                active === t.executor_id ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]" : "border-white/10 text-white/60 hover:text-white"
              )}
            >
              {t.name}
              {t.unread > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">{t.unread}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {current && (
        <>
          <p className="px-4 sm:px-5 pt-2 text-xs text-white/40">
            {current.name}
            {current.specialty ? ` · ${current.specialty}` : ""}
            {!current.access_enabled && (
              <span className="text-amber-300"> · кабинет исполнителя закрыт — он не увидит сообщения, пока вы не откроете доступ</span>
            )}
          </p>
          <ExecutorChatThread
            threadKey={`${objectId}-${current.executor_id}`}
            me="company"
            load={(after) => executorChatApi.messages(objectId, current.executor_id, after)}
            send={(body, photos) => executorChatApi.send(objectId, current.executor_id, body, photos)}
            emptyText="Сообщений пока нет. Напишите исполнителю — он увидит сообщение в своём кабинете."
          />
        </>
      )}
    </div>
  )
}

export default ObjectExecutorChat
