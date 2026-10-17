import { useEffect, useMemo, useRef, useState } from "react"
import Icon from "@/components/ui/icon"
import { ServiceLandingMeta } from "@/lib/serviceLanding"

const POPULAR_COUNT = 6

export function ServiceDirectionPicker({ landings }: { landings: ServiceLandingMeta[] }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const boxRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    setTimeout(() => inputRef.current?.focus(), 0)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? landings.filter((l) => l.category.toLowerCase().includes(q)) : landings
  }, [landings, query])

  if (!landings.length) return null

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div ref={boxRef} className="relative w-full sm:max-w-md">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={`w-full flex items-center justify-between gap-3 px-5 py-3.5 rounded-full border bg-background text-left transition-colors ${
              open ? "border-[#D4AF37]" : "border-border hover:border-[#D4AF37]"
            }`}
          >
            <span className="flex items-center gap-3 min-w-0">
              <Icon name="LayoutGrid" size={18} className="text-[#D4AF37] shrink-0" />
              <span className="truncate">Выберите направление работ</span>
              <span className="text-xs text-muted-foreground shrink-0">{landings.length}</span>
            </span>
            <Icon name="ChevronDown" size={18} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute z-30 left-0 right-0 mt-2 rounded-2xl border border-border bg-background shadow-xl overflow-hidden">
              <div className="p-2 border-b border-border">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50">
                  <Icon name="Search" size={16} className="text-muted-foreground shrink-0" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Найти, например «плитка»"
                    className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto py-1">
                {filtered.length ? (
                  filtered.map((c) => (
                    <a
                      key={c.slug}
                      href={`/uslugi/${c.slug}`}
                      className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm hover:bg-muted/60 hover:text-[#B8962E] transition-colors"
                    >
                      {c.category}
                      <Icon name="ArrowUpRight" size={15} className="text-muted-foreground shrink-0" />
                    </a>
                  ))
                ) : (
                  <p className="px-5 py-4 text-sm text-muted-foreground">Ничего не нашлось</p>
                )}
              </div>
            </div>
          )}
        </div>

        <a
          href="/uslugi"
          className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-foreground text-background text-sm hover:opacity-90 transition-opacity"
        >
          Все услуги и цены
          <Icon name="ArrowRight" size={16} />
        </a>
      </div>

      <div className="hidden md:flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground mr-1">Часто ищут:</span>
        {landings.slice(0, POPULAR_COUNT).map((c) => (
          <a
            key={c.slug}
            href={`/uslugi/${c.slug}`}
            className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
          >
            {c.category}
          </a>
        ))}
      </div>
    </div>
  )
}

export default ServiceDirectionPicker
