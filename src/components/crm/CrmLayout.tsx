import { ReactNode, useEffect, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { NotificationBell } from "@/components/crm/NotificationBell"
import { hasHrefAccess } from "@/lib/positions"

interface CrmLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

interface NavItem {
  label: string
  icon: string
  href: string
  roles: string[]
  siteOnly?: boolean
  badge?: string
}

const fullNavItems: NavItem[] = [
  { label: "Dashboard", icon: "LayoutDashboard", href: "/cabinet", roles: ["owner", "admin", "employee"] },
  { label: "Объекты", icon: "Building2", href: "/cabinet/objects", roles: ["owner", "admin", "employee", "client"] },
  { label: "Документы", icon: "FileText", href: "/cabinet/documents", roles: ["owner", "admin", "employee"] },
  { label: "Заказчики", icon: "Users", href: "/cabinet/customers", roles: ["owner", "admin", "employee"] },
  { label: "Услуги", icon: "Wrench", href: "/cabinet/services", roles: ["owner", "admin", "employee"] },
  { label: "Имущество", icon: "Boxes", href: "/cabinet/company-assets", roles: ["owner", "admin", "employee"] },
  { label: "Склад учет", icon: "Warehouse", href: "/cabinet/warehouse", roles: ["owner", "admin", "employee"] },
  { label: "Материалы", icon: "Package", href: "/cabinet/materials", roles: ["owner", "admin", "employee"] },
  { label: "Аренда", icon: "Handshake", href: "/cabinet/rentals", roles: ["owner", "admin", "employee"] },
  { label: "Компания", icon: "Building", href: "/cabinet/company", roles: ["owner", "admin", "employee"] },
  { label: "Сайт", icon: "Globe", href: "/cabinet/site", roles: ["owner", "admin", "employee"], siteOnly: true },
  { label: "Команда", icon: "UsersRound", href: "/cabinet/team", roles: ["owner", "admin", "employee"] },
  { label: "Профиль", icon: "User", href: "/cabinet/profile", roles: ["owner", "admin", "employee", "client"] },
]

const tabHrefs = ["/cabinet", "/cabinet/objects", "/cabinet/documents", "/cabinet/customers"]

export function CrmLayout({ children, title, subtitle }: CrmLayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    document.title = `${title} — FixKey`

    let robots = document.querySelector('meta[name="robots"]')
    if (!robots) {
      robots = document.createElement("meta")
      robots.setAttribute("name", "robots")
      document.head.appendChild(robots)
    }
    robots.setAttribute("content", "noindex, nofollow")

    const desc = document.querySelector('meta[name="description"]')
    if (desc) desc.setAttribute("content", subtitle || `${title} — рабочий кабинет FixKey`)

    return () => {
      document.querySelector('meta[name="robots"]')?.remove()
    }
  }, [title, subtitle])

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const canManageSite = user?.role === "owner" || user?.position === "super_admin"
  const navItems = fullNavItems
    .map((item) => ({
    ...item,
    locked: !(
      (!user?.role || item.roles.includes(user.role)) &&
      hasHrefAccess(user?.role, user?.position, item.href) &&
      (!item.siteOnly || canManageSite)
    ),
  }))
  const showNotifications = user?.role === "owner" || user?.role === "admin" || user?.role === "employee"

  const today = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })

  const tabItems = navItems.filter((i) => tabHrefs.includes(i.href) && !i.locked)

  return (
    <div className="min-h-screen bg-[#161616] text-white flex">
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[#1a1a1a]/95 backdrop-blur border-b border-white/10 flex items-center gap-2 px-2">
        <button
          className="w-11 h-11 flex items-center justify-center rounded-lg text-white/70 active:bg-white/10"
          onClick={() => setMobileOpen(true)}
          aria-label="Меню"
        >
          <Icon name="Menu" size={22} />
        </button>
        <p className="flex-1 text-base font-medium truncate">{title}</p>
        {showNotifications && <NotificationBell />}
      </header>

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-[#1a1a1a] border-r border-white/10 flex flex-col transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="px-5 py-6 flex items-center gap-2 border-b border-white/10">
          <img
            src="/logo-112.png"
            srcSet="/logo-112.png 1x, /logo-168.png 1.5x, /logo-224.png 2x, /logo-448.png 4x"
            alt="FixKey"
            width={56}
            height={56}
            className="w-14 h-14 object-contain"
          />
          <span className="text-xl font-semibold tracking-tight"><span className="text-white">Fix</span><span className="text-[#D4AF37]">Key</span></span>
          <button
            className="md:hidden ml-auto w-10 h-10 flex items-center justify-center rounded-lg text-white/60 active:bg-white/10"
            onClick={() => setMobileOpen(false)}
            aria-label="Закрыть меню"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-xs text-white/40 mb-1">Активная компания</p>
          <p className="text-sm font-medium truncate">{user?.company_name}</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <p className="text-[10px] uppercase tracking-wider text-white/30 px-3 mb-2">Platform</p>
          <ul className="flex flex-col gap-1">
            {navItems.map((item) =>
              item.locked ? (
                <li key={item.href}>
                  <div
                    title="Недоступно для вашей должности"
                    aria-disabled="true"
                    className="flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg text-sm text-white/25 cursor-not-allowed"
                  >
                    <Icon name={item.icon} size={17} />
                    <span className="flex-1">{item.label}</span>
                    <Icon name="Lock" size={13} className="text-white/25" />
                  </div>
                </li>
              ) : (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    end={item.href === "/cabinet"}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg text-sm transition-colors",
                        isActive
                          ? "bg-[#D4AF37] text-[#161616]"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      )
                    }
                  >
                    <Icon name={item.icon} size={17} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-semibold bg-white/10 text-white/50 px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              )
            )}
          </ul>
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors mb-2"
          >
            <Icon name="LogOut" size={17} />
            Выйти
          </button>
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium">
              {user?.full_name?.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.full_name}</p>
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main className="flex-1 min-h-screen overflow-y-auto md:ml-64 pt-14 md:pt-0 pb-20 md:pb-0">
        <div className="px-4 sm:px-6 md:px-10 py-5 md:py-10 max-w-[1600px] mx-auto">
          <div className="mb-6 md:mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="hidden md:block text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-white/40 md:mt-1">{subtitle || today}</p>
            </div>
            <div className="hidden md:block">{showNotifications && <NotificationBell />}</div>
          </div>
          {children}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1a1a1a]/95 backdrop-blur border-t border-white/10 flex pb-[env(safe-area-inset-bottom)]">
        {tabItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === "/cabinet"}
            className={({ isActive }) =>
              cn(
                "flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-h-[56px] text-[11px] transition-colors",
                isActive ? "text-[#D4AF37]" : "text-white/50 active:text-white"
              )
            }
          >
            <Icon name={item.icon} size={20} />
            <span className="leading-none">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-h-[56px] text-[11px] text-white/50 active:text-white transition-colors"
        >
          <Icon name="Menu" size={20} />
          <span className="leading-none">Ещё</span>
        </button>
      </nav>
    </div>
  )
}