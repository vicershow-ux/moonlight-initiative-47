import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Icon from "@/components/ui/icon"
import { teamApi } from "@/lib/api"

interface SetPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberId: number | null
  memberName: string
  onSaved?: () => void
}

export function SetPasswordDialog({ open, onOpenChange, memberId, memberName, onSaved }: SetPasswordDialogProps) {
  const [password, setPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleClose = (v: boolean) => {
    onOpenChange(v)
    if (!v) {
      setPassword("")
      setError("")
      setSuccess(false)
    }
  }

  const handleSave = async () => {
    setError("")
    if (password.length < 6) {
      setError("Пароль должен быть не короче 6 символов")
      return
    }
    if (!memberId) return

    setSaving(true)
    try {
      await teamApi.setPassword(memberId, password)
      setSuccess(true)
      setPassword("")
      onSaved?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось изменить пароль")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1f1f1f] border-white/10 text-white sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Пароль для входа — {memberName}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50">Новый пароль</label>
            <input
              type="text"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setSuccess(false) }}
              placeholder="Минимум 6 символов"
              className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 flex items-center gap-1.5">
              <Icon name="CircleAlert" size={15} />
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-green-400 flex items-center gap-1.5">
              <Icon name="CircleCheck" size={15} />
              Пароль обновлён — сообщите его пользователю
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-1 flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-3 rounded-lg disabled:opacity-60"
          >
            {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : "Сохранить пароль"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}