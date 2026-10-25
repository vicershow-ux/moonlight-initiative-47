import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { ContractOptions } from "@/lib/api"

interface ContractRoleSwitchProps {
  value: Required<ContractOptions>["our_role"]
  onChange: (v: Required<ContractOptions>["our_role"]) => void
}

const ROLES = [
  {
    value: "contractor" as const,
    icon: "HardHat",
    title: "Я — Исполнитель",
    text: "Выполняю работы для заказчика объекта",
  },
  {
    value: "customer" as const,
    icon: "Briefcase",
    title: "Я — Заказчик",
    text: "Нанимаю исполнителя на отдельный вид работ",
  },
]

export function ContractRoleSwitch({ value, onChange }: ContractRoleSwitchProps) {
  return (
    <div className="mb-6 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/[0.05] p-3 sm:p-4">
      <p className="mb-3 text-center text-sm font-medium text-white/90">
        Кто вы в этом договоре<span className="ml-0.5 text-[#D4AF37]">*</span>
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ROLES.map((r) => {
          const active = value === r.value
          return (
            <button
              key={r.value}
              type="button"
              onClick={() => onChange(r.value)}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors min-h-[44px]",
                active
                  ? "border-[#D4AF37] bg-[#D4AF37] text-[#161616]"
                  : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white"
              )}
            >
              <Icon name={r.icon} size={20} className="mt-0.5 shrink-0" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{r.title}</span>
                <span className={cn("block text-xs", active ? "text-[#161616]/70" : "text-white/40")}>{r.text}</span>
              </span>
            </button>
          )
        })}
      </div>
      {value === "customer" && (
        <p className="mt-3 text-center text-xs text-white/50">
          Ваша компания подставлена как Заказчик. Заполните данные исполнителя — их можно поменять в любой момент.
        </p>
      )}
    </div>
  )
}

export default ContractRoleSwitch
