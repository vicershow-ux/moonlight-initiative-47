import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { objectsApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { Executor, ExecutorForm, ExecutorKind, emptyExecutor, executorKindLabels, executorsApi } from "@/lib/executorsApi"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  executor: Executor | null
  onSaved: (id: number) => void
}

const input =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 sm:py-2 text-base sm:text-sm outline-none focus:border-[#D4AF37]/50"

const KINDS: ExecutorKind[] = ["self_employed", "entrepreneur", "legal", "individual", "foreign_citizen"]

export function ExecutorDialog({ open, onOpenChange, executor, onSaved }: Props) {
  const { user } = useAuth()
  const canAccess = user?.role === "owner" || user?.role === "admin"
  const [form, setForm] = useState<ExecutorForm>(emptyExecutor)
  const [objects, setObjects] = useState<{ id: number; object_code: string; address: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    setError("")
    if (executor) {
      const { id: _id, objects: objs, ...rest } = executor
      void _id
      setForm({ ...emptyExecutor, ...rest, object_ids: (objs || []).map((o) => o.id), password: "" })
    } else {
      setForm(emptyExecutor)
    }
    objectsApi
      .list()
      .then((d) => setObjects((d.objects || []).map((o) => ({ id: o.id, object_code: o.object_code, address: o.address || "" }))))
      .catch(() => setObjects([]))
  }, [open, executor])

  const set = <K extends keyof ExecutorForm>(k: K, v: ExecutorForm[K]) => setForm((p) => ({ ...p, [k]: v }))

  const field = (k: keyof ExecutorForm, label: string, opts: { placeholder?: string; numeric?: boolean; wide?: boolean; type?: string } = {}) => (
    <label className={cn("flex flex-col gap-1", opts.wide && "sm:col-span-2")}>
      <span className="text-xs text-white/50">{label}</span>
      <input
        value={String(form[k] ?? "")}
        onChange={(e) => set(k, e.target.value as never)}
        placeholder={opts.placeholder}
        inputMode={opts.numeric ? "numeric" : undefined}
        type={opts.type || "text"}
        className={input}
      />
    </label>
  )

  const isLegal = form.kind === "legal"
  const isPerson = ["individual", "self_employed", "foreign_citizen"].includes(form.kind)

  const toggleObject = (id: number) =>
    set("object_ids", form.object_ids.includes(id) ? form.object_ids.filter((x) => x !== id) : [...form.object_ids, id])

  const save = async () => {
    setSaving(true)
    setError("")
    try {
      const payload: Partial<ExecutorForm> = { ...form }
      if (!canAccess) {
        delete payload.access_enabled
        delete payload.login_email
        delete payload.password
      }
      const res = await executorsApi.save(payload, executor?.id)
      onSaved(res.id)
      onOpenChange(false)
    } catch (e) {
      setError((e as Error)?.message || "Не удалось сохранить")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1f1f1f] border-white/10 text-white sm:max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{executor ? "Исполнитель" : "Новый исполнитель"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => set("kind", k)}
              className={cn(
                "px-3 py-2 rounded-full text-sm min-h-[40px] transition-colors",
                form.kind === k ? "bg-[#D4AF37] text-[#161616] font-medium" : "bg-white/5 text-white/60 hover:text-white"
              )}
            >
              {executorKindLabels[k]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {isLegal ? (
            <>
              {field("org_name", "Название организации", { placeholder: "ООО «Мастер»", wide: true })}
              {field("director_position", "Должность руководителя", { placeholder: "Генеральный директор" })}
              {field("director_name", "ФИО руководителя")}
            </>
          ) : (
            <>
              {field("full_name", "ФИО", { placeholder: "Иванов Иван Иванович" })}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-white/50">Пол (для текста договора)</span>
                <select value={form.gender} onChange={(e) => set("gender", e.target.value as "m" | "f")} className={input}>
                  <option value="m">Мужской</option>
                  <option value="f">Женский</option>
                </select>
              </label>
            </>
          )}
          {field("specialty", "Вид работ", { placeholder: "Электрика, плитка, сантехника…" })}
          {field("phone", "Телефон", { placeholder: "+7 ___ ___-__-__", type: "tel" })}
          {field("email", "E-mail", { type: "email" })}
          {form.kind !== "individual" && form.kind !== "foreign_citizen" && field("inn", "ИНН", { numeric: true })}
          {(isLegal || form.kind === "entrepreneur") && field("ogrnip", isLegal ? "ОГРН" : "ОГРНИП", { numeric: true })}
          {form.kind === "foreign_citizen" && field("country", "Гражданство")}
          {isPerson && field("passport", "Паспорт", { placeholder: "серия, номер, кем и когда выдан", wide: true })}
          {field("address", isLegal ? "Юридический адрес" : "Адрес регистрации", { wide: true })}
        </div>

        <p className="text-xs uppercase tracking-wide text-white/40 mt-1">Банк — для оплаты работ</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {field("account", "Расчётный счёт", { numeric: true })}
          {field("bank_name", "Банк")}
          {field("bik", "БИК", { numeric: true })}
          {field("corr_account", "Корр. счёт", { numeric: true })}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Объекты исполнителя</p>
          {objects.length === 0 ? (
            <p className="text-xs text-white/40">Объектов пока нет</p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {objects.map((o) => {
                const on = form.object_ids.includes(o.id)
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => toggleObject(o.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors",
                      on ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]" : "border-white/10 text-white/60 hover:text-white"
                    )}
                    title={o.address}
                  >
                    {on && <Icon name="Check" size={12} />}
                    {o.object_code}
                  </button>
                )
              })}
            </div>
          )}
          <p className="text-[11px] text-white/30 mt-1.5">Объекты из договоров с исполнителем подключаются сами</p>
        </div>

        {canAccess && (
          <div className="rounded-xl border border-white/10 bg-[#161616]/60 p-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="accent-[#D4AF37] w-4 h-4"
                checked={form.access_enabled}
                onChange={(e) => set("access_enabled", e.target.checked)}
              />
              Открыть кабинет исполнителя для отчётов
            </label>
            {form.access_enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {field("login_email", "Почта для входа", { type: "email" })}
                {field("password", executor?.has_password ? "Новый пароль (если меняете)" : "Пароль", { placeholder: "не короче 6 символов" })}
                <p className="sm:col-span-2 text-xs text-white/40">
                  Исполнитель входит по адресу <span className="text-white/70">{window.location.origin}/executor</span> и видит
                  только свои объекты и договоры.
                </p>
              </div>
            )}
          </div>
        )}

        <label className="flex flex-col gap-1">
          <span className="text-xs text-white/50">Заметка</span>
          <textarea value={form.note} onChange={(e) => set("note", e.target.value)} rows={2} className={input} />
        </label>

        {error && (
          <p className="text-sm text-red-400 flex items-center gap-1.5">
            <Icon name="CircleAlert" size={15} />
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2 border-t border-white/10">
          <button onClick={() => onOpenChange(false)} className="min-h-[44px] px-4 text-sm text-white/50 hover:text-white">
            Отмена
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] text-[#161616] text-sm font-medium disabled:opacity-60"
          >
            {saving && <Icon name="Loader2" size={15} className="animate-spin" />}
            Сохранить
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ExecutorDialog
