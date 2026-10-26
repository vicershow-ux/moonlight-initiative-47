import { useEffect, useState } from "react"
import { useNavigate } from "@/lib/router-compat"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import Icon from "@/components/ui/icon"
import { estimatesApi, Estimate, ObjectItem } from "@/lib/api"

interface CreateContractModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  object: ObjectItem | null
}

const formatMoney = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " ₽"

export function CreateContractModal({ open, onOpenChange, object }: CreateContractModalProps) {
  const navigate = useNavigate()
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [loading, setLoading] = useState(false)
  const [estimateId, setEstimateId] = useState("")
  const [templateKey, setTemplateKey] = useState("apartment_renovation")
  const [role, setRole] = useState<"contractor" | "customer">("contractor")

  useEffect(() => {
    if (open && object) {
      setLoading(true)
      setEstimateId("")
      setRole("contractor")
      estimatesApi
        .listByObject(object.id)
        .then((data) => setEstimates(data.estimates))
        .finally(() => setLoading(false))
    }
  }, [open, object])

  const handleSubmit = () => {
    if (!object) return
    const params = new URLSearchParams()
    if (estimateId) params.set("estimate_id", estimateId)
    params.set("template", templateKey)
    if (role === "customer") params.set("role", "customer")
    navigate(`/cabinet/objects/${object.id}/contracts/new?${params.toString()}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1f1f1f] border-white/10 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Составить договор</DialogTitle>
          <DialogDescription className="text-white/40">
            Формирование договора подряда по шаблону на основе сметы
          </DialogDescription>
        </DialogHeader>

        {object && (
          <div className="bg-[#161616] border border-white/10 rounded-xl p-3 sm:p-4">
            <p className="text-xs text-white/40 uppercase tracking-wide mb-1">Объект</p>
            <p className="font-semibold break-words">{object.address || object.client_name}</p>
            <p className="text-sm text-white/40 mt-0.5">Площадь: {object.area} м²</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Кто вы в договоре</label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { v: "contractor", t: "Я — Исполнитель", d: "работаю для заказчика" },
              { v: "customer", t: "Я — Заказчик", d: "нанимаю исполнителя" },
            ] as const).map((r) => (
              <button
                key={r.v}
                type="button"
                onClick={() => setRole(r.v)}
                className={`min-h-[44px] rounded-lg border px-3 py-2 text-left transition-colors ${
                  role === r.v
                    ? "border-[#D4AF37] bg-[#D4AF37] text-[#161616]"
                    : "border-white/10 bg-[#161616] text-white/70 hover:text-white"
                }`}
              >
                <span className="block text-sm font-medium">{r.t}</span>
                <span className={`block text-xs ${role === r.v ? "text-[#161616]/70" : "text-white/40"}`}>{r.d}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">{role === "customer" ? "Смета на работы исполнителя (необязательно)" : "Выберите смету для договора"}</label>
          <div className="relative">
            <select
              value={estimateId}
              onChange={(e) => setEstimateId(e.target.value)}
              disabled={loading}
              className="w-full appearance-none bg-[#161616] border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#D4AF37]/50 disabled:opacity-50"
            >
              <option value="">-- Выберите смету --</option>
              {estimates.map((est) => (
                <option key={est.id} value={est.id}>
                  Смета №{est.estimate_number || est.id} — {formatMoney(est.total_amount)}
                </option>
              ))}
            </select>
            <Icon
              name="ChevronsUpDown"
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
            />
          </div>
          {!loading && estimates.length === 0 && (
            <p className="text-xs text-white/30">
              По этому объекту ещё нет смет — договор можно составить и без привязки к смете
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Шаблон договора</label>
          <div className="relative">
            <select
              value={templateKey}
              onChange={(e) => setTemplateKey(e.target.value)}
              className="w-full appearance-none bg-[#161616] border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#D4AF37]/50"
            >
              <option value="apartment_renovation">Договор подряда на ремонт квартиры (Встроенный)</option>
            </select>
            <Icon
              name="ChevronsUpDown"
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2 sm:gap-3 pt-2 border-t border-white/10 mt-1">
          <button
            onClick={handleSubmit}
            className="flex w-full sm:w-auto min-h-[44px] sm:min-h-0 items-center justify-center gap-2 bg-white text-[#161616] hover:bg-white/90 transition-colors text-sm font-medium px-5 py-2.5 rounded-lg"
          >
            Сформировать договор
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto min-h-[44px] sm:min-h-0 text-sm text-white/50 hover:text-white transition-colors px-3 py-2.5"
          >
            Отмена
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
