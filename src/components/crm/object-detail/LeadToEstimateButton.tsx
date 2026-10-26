import { useState } from "react"
import { useNavigate } from "@/lib/router-compat"
import Icon from "@/components/ui/icon"
import { estimatesApi } from "@/lib/api"

export function LeadToEstimateButton({ objectId }: { objectId: number }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const create = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await estimatesApi.fromLead(objectId)
      navigate(`/cabinet/objects/${objectId}/estimates/${res.id}/edit`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось создать смету")
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={create}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] px-3.5 py-2 text-sm font-medium text-[#161616] transition-colors disabled:opacity-60"
      >
        <Icon name={loading ? "Loader2" : "FilePlus2"} size={16} className={loading ? "animate-spin" : ""} />
        Создать смету из заявки
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export default LeadToEstimateButton
