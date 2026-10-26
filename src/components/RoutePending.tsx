import Icon from "@/components/ui/icon"

export function RoutePending() {
  return (
    <div className="min-h-screen bg-[#161616] flex items-center justify-center">
      <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
      <span className="sr-only">Загрузка личного кабинета FixKey…</span>
    </div>
  )
}
