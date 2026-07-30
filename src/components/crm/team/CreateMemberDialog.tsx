import Icon from "@/components/ui/icon"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { positionOptions, PositionKey } from "@/lib/positions"

interface CreateMemberDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void

  fullName: string
  setFullName: (v: string) => void
  email: string
  setEmail: (v: string) => void
  password: string
  setPassword: (v: string) => void
  phone: string
  setPhone: (v: string) => void
  position: PositionKey
  setPosition: (v: PositionKey) => void

  error: string
  saving: boolean
  onCreate: () => void
}

export function CreateMemberDialog({
  open,
  onOpenChange,
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  phone,
  setPhone,
  position,
  setPosition,
  error,
  saving,
  onCreate,
}: CreateMemberDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1f1f1f] border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новый сотрудник</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50">Имя</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Иванов Иван"
              className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50">Телефон</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 900 000 00 00"
              className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50">Роль</label>
            <Select value={position} onValueChange={(v) => setPosition(v as PositionKey)}>
              <SelectTrigger className="bg-[#161616] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {positionOptions.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-red-400 flex items-center gap-1.5">
              <Icon name="CircleAlert" size={15} />
              {error}
            </p>
          )}

          <button
            onClick={onCreate}
            disabled={saving}
            className="mt-2 flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-3 rounded-lg disabled:opacity-60"
          >
            {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : "Пригласить сотрудника"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
