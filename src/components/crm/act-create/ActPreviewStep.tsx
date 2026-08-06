import Icon from "@/components/ui/icon"

interface ActPreviewStepProps {
  previewHtml: string
  error: string
  saving: boolean
  editingActId: number | null
  setStep: (v: number) => void
  handleSave: () => void
}

export function ActPreviewStep({
  previewHtml,
  error,
  saving,
  editingActId,
  setStep,
  handleSave,
}: ActPreviewStepProps) {
  return (
    <div>
      <div className="bg-white text-[#161616] rounded-xl p-8 shadow-lg mb-4">
        <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
      </div>

      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1.5 mb-3">
          <Icon name="CircleAlert" size={15} />
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => setStep(2)}
          className="px-4 py-3 rounded-lg text-sm bg-white/5 hover:bg-white/10 transition-colors"
        >
          Назад
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm font-medium px-5 py-3 rounded-lg disabled:opacity-60"
        >
          {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Check" size={16} />}
          {editingActId ? "Сохранить изменения" : "Сохранить акт"}
        </button>
      </div>
    </div>
  )
}

export default ActPreviewStep
