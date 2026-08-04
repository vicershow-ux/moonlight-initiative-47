interface ToggleOption<T extends string> {
  value: T
  label: string
}

interface ToggleGroupProps<T extends string> {
  label: string
  options: ToggleOption<T>[]
  value: T
  onChange: (value: T) => void
  required?: boolean
}

export function ToggleGroup<T extends string>({ label, options, value, onChange, required }: ToggleGroupProps<T>) {
  return (
    <div className="border border-[#D4AF37]/40 rounded-xl p-4 my-4 bg-[#D4AF37]/[0.05]">
      <p className="text-sm font-medium mb-3 text-center text-white/90">
        {label}
        {required && <span className="text-[#D4AF37] ml-0.5">*</span>}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3.5 py-2 rounded-full text-sm transition-colors ${
              value === opt.value
                ? "bg-[#D4AF37] text-[#161616] font-medium"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}