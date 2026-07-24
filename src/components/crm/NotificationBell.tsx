import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { notificationsApi, NotificationItem } from "@/lib/api"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  const load = () => {
    notificationsApi.list().then((data) => {
      setNotifications(data.notifications)
      setUnreadCount(data.unread_count)
    })
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleOpenChange = (v: boolean) => {
    setOpen(v)
    if (v && unreadCount > 0) {
      notificationsApi.markRead().then(() => {
        setUnreadCount(0)
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      })
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button className="relative w-9 h-9 rounded-lg bg-[#1f1f1f] border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
          <Icon name="Bell" size={17} className="text-white/70" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="bg-[#1f1f1f] border-white/10 text-white p-0 w-80">
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-sm font-medium">Уведомления</p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-white/30 text-sm">Пока нет уведомлений</div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5">
                <p className="text-sm font-medium mb-0.5">{n.title}</p>
                <p className="text-xs text-white/50 mb-1">{n.message}</p>
                <p className="text-[10px] text-white/30">{formatDate(n.created_at)}</p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
