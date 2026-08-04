import { useLayoutEffect, useRef } from "react"

interface InlineInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minWidth?: number
  type?: "text" | "number"
}

export function InlineInput({ value, onChange, placeholder, minWidth = 60, type = "text" }: InlineInputProps) {
  const spanRef = useRef<HTMLSpanElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useLayoutEffect(() => {
    if (spanRef.current && inputRef.current) {
      const w = spanRef.current.offsetWidth
      const pad = type === "number" ? 24 : 18
      inputRef.current.style.width = `${Math.max(minWidth, w + pad)}px`
    }
  }, [value, placeholder, minWidth, type])

  return (
    <span className="inline-flex items-baseline align-baseline">
      <span
        ref={spanRef}
        className="invisible absolute whitespace-pre text-sm"
        aria-hidden
      >
        {value || placeholder || ""}
      </span>
      <input
        ref={inputRef}
        type={type}
        inputMode={type === "number" ? "decimal" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="inline-block bg-[#161616] border border-[#D4AF37]/40 rounded px-1.5 py-0.5 text-sm text-white outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/40 placeholder:text-white/30 mx-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </span>
  )
}

interface InlineSelectProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
}

export function InlineSelect<T extends string>({ value, onChange, options }: InlineSelectProps<T>) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="inline-block bg-[#161616] border border-[#D4AF37]/40 rounded px-1 py-0.5 text-sm text-white outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/40 mx-0.5 cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#1f1f1f]">
          {opt.label}
        </option>
      ))}
    </select>
  )
}