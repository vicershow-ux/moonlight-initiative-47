import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
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

  useEffect(() => {
    if (open && object) {
      setLoading(true)
      setEstimateId("")
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
          <div className="bg-[#161616] border border-white/10 rounded-xl p-4">
            <p className="text-xs text-white/40 uppercase tracking-wide mb-1">Объект</p>
            <p className="font-semibold">{object.address || object.client_name}</p>
            <p className="text-sm text-white/40 mt-0.5">Площадь: {object.area} м²</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Выберите смету для договора</label>
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
                  Смета №{est.id} — {formatMoney(est.total_amount)}
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

        <div className="flex items-center gap-3 pt-2 border-t border-white/10 mt-1">
          <button
            onClick={handleSubmit}
            className="flex items-center justify-center gap-2 bg-white text-[#161616] hover:bg-white/90 transition-colors text-sm font-medium px-5 py-2.5 rounded-lg"
          >
            Сформировать договор
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="text-sm text-white/50 hover:text-white transition-colors px-3 py-2.5"
          >
            Отмена
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
