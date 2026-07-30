import Icon from "@/components/ui/icon"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { statusColorOptions } from "@/lib/objectStatusColors"

export interface StatusForm {
  name: string
  color: string
  is_active_stage: boolean
  is_final: boolean
}

interface StatusFormDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  form: StatusForm
  setForm: (updater: (f: StatusForm) => StatusForm) => void
  error: string
  saving: boolean
  onSubmit: () => void
  submitLabel: string
  namePlaceholder?: string
}

export function StatusFormDialog({
  open,
  onOpenChange,
  title,
  form,
  setForm,
  error,
  saving,
  onSubmit,
  submitLabel,
  namePlaceholder,
}: StatusFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1f1f1f] border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50">Название</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={namePlaceholder}
              className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50">Цвет</label>
            <Select value={form.color} onValueChange={(v) => setForm((f) => ({ ...f, color: v }))}>
              <SelectTrigger className="bg-[#161616] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusColorOptions.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <span className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                      {c.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.is_active_stage}
              onCheckedChange={(v) => setForm((f) => ({ ...f, is_active_stage: !!v }))}
            />
            Считается активным (объект в работе)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.is_final}
              onCheckedChange={(v) => setForm((f) => ({ ...f, is_final: !!v }))}
            />
            Финальный статус (завершение или отмена)
          </label>

          {error && (
            <p className="text-sm text-red-400 flex items-center gap-1.5">
              <Icon name="CircleAlert" size={15} />
              {error}
            </p>
          )}

          <button
            onClick={onSubmit}
            disabled={saving}
            className="mt-2 flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-3 rounded-lg disabled:opacity-60"
          >
            {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : submitLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
