interface ToggleOption<T extends string> {
  value: T
  label: string
}

interface ToggleGroupProps<T extends string> {
  label: string
  options: ToggleOption<T>[]
  value: T
  onChange: (value: T) => void
}

export function ToggleGroup<T extends string>({ label, options, value, onChange }: ToggleGroupProps<T>) {
  return (
    <div className="bg-[#161616] border border-white/10 rounded-xl p-4">
      <p className="text-sm font-medium mb-3 text-center text-white/80">{label}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3.5 py-2 rounded-lg text-sm transition-colors ${
              value === opt.value
                ? "bg-[#D4463C] text-white"
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
