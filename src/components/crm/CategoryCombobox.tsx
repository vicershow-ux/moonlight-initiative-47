import { useEffect, useRef, useState } from "react"
import Icon from "@/components/ui/icon"

interface CategoryComboboxProps {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  placeholder?: string
}

export function CategoryCombobox({ value, onChange, suggestions, placeholder }: CategoryComboboxProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const filtered = suggestions.filter((s) => s.toLowerCase().includes(value.trim().toLowerCase()))

  return (
    <div ref={ref} className="relative">
      <input
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder || "Выберите или введите новую"}
        className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-[#1f1f1f] border border-white/10 rounded-lg max-h-64 overflow-y-auto shadow-lg">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { onChange(s); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-white/5 text-white/80 transition-colors"
            >
              <Icon name="Folder" size={14} className="text-white/40 flex-shrink-0" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
