import Icon from "@/components/ui/icon"

const steps = [
  { label: "Основные данные" },
  { label: "Данные заказчика" },
  { label: "Дополнительно" },
]

interface ObjectCreateStepperProps {
  step: number
}

export function ObjectCreateStepper({ step }: ObjectCreateStepperProps) {
  return (
    <div className="flex items-center mb-6 max-w-2xl">
      {steps.map((s, idx) => {
        const num = idx + 1
        const isActive = step === num
        const isDone = step > num
        return (
          <div key={s.label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isDone
                    ? "bg-green-500 text-white"
                    : isActive
                      ? "bg-[#D4AF37] text-[#161616]"
                      : "bg-white/10 text-white/40"
                }`}
              >
                {isDone ? <Icon name="Check" size={16} /> : num}
              </div>
              <span className={`text-xs whitespace-nowrap ${isActive || isDone ? "text-white" : "text-white/40"}`}>
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 ${isDone ? "bg-green-500" : "bg-white/10"}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
