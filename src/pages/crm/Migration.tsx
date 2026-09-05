import { useState } from "react"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { migrationApi, MigrationSettings } from "@/lib/api"
import { toast } from "sonner"

const FIELDS: { key: keyof MigrationSettings; label: string; hint: string }[] = [
  {
    key: "password_salt",
    label: "PASSWORD_SALT",
    hint: "Самое важное. Без него сотрудники не смогут войти по своим паролям",
  },
  {
    key: "database_url",
    label: "Адрес текущей базы",
    hint: "Нужен один раз, чтобы перенести данные на новый сервер",
  },
  { key: "smtp_host", label: "SMTP_HOST", hint: "Почтовый сервер для писем о заявках" },
  { key: "smtp_user", label: "SMTP_USER", hint: "Ящик, с которого уходят письма" },
  { key: "smtp_password", label: "SMTP_PASSWORD", hint: "Пароль от почтового ящика" },
]

export default function Migration() {
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<MigrationSettings | null>(null)
  const [shown, setShown] = useState<Record<string, boolean>>({})

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    try {
      setData(await migrationApi.get(password))
      setPassword("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось получить настройки")
    } finally {
      setLoading(false)
    }
  }

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(`${label} скопирован`)
    } catch {
      toast.error("Не удалось скопировать")
    }
  }

  const copyAll = () => {
    if (!data) return
    const text = [
      `PASSWORD_SALT=${data.password_salt}`,
      `SMTP_HOST=${data.smtp_host}`,
      `SMTP_USER=${data.smtp_user}`,
      `SMTP_PASSWORD=${data.smtp_password}`,
      ``,
      `# Адрес старой базы (для переноса данных):`,
      `# ${data.database_url}`,
    ].join("\n")
    copy(text, "Блок настроек")
  }

  return (
    <CrmLayout
      title="Переезд на свой сервер"
      subtitle="Настройки, которые нужно перенести. Видит только владелец компании"
    >
      <div className="max-w-3xl space-y-6">
        {!data && (
          <form
            onSubmit={submit}
            className="space-y-4 rounded-xl border border-white/10 bg-[#1f1f1f] p-6"
          >
            <div className="flex gap-3 rounded-lg bg-white/5 p-4">
              <Icon name="ShieldCheck" size={20} className="mt-0.5 shrink-0 text-[#D4AF37]" />
              <p className="text-sm text-white/60">
                Для доступа введите свой пароль от кабинета — тот же, которым вы входите.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">Ваш пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-lg border border-white/10 bg-[#161616] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#D4AF37]"
                placeholder="Введите пароль"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2.5 text-sm font-medium text-[#161616] transition-colors hover:bg-[#B8860B] disabled:opacity-50"
            >
              {loading ? (
                <Icon name="Loader2" size={16} className="animate-spin" />
              ) : (
                <Icon name="KeyRound" size={16} />
              )}
              Показать настройки
            </button>
          </form>
        )}

        {data && (
          <>
            <div className="flex gap-3 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 p-4">
              <Icon name="TriangleAlert" size={20} className="mt-0.5 shrink-0 text-[#D4AF37]" />
              <div className="text-sm">
                <p className="font-medium text-[#D4AF37]">
                  Не пересылайте эти значения в мессенджерах
                </p>
                <p className="mt-1 text-white/60">
                  Сохраните их сразу в файл настроек на своём сервере.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {FIELDS.map((field) => {
                const value = data[field.key] || ""
                const isOpen = shown[field.key]
                return (
                  <div key={field.key} className="rounded-xl border border-white/10 bg-[#1f1f1f] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-medium text-white">{field.label}</p>
                        <p className="mt-0.5 text-xs text-white/50">{field.hint}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          onClick={() =>
                            setShown((s) => ({ ...s, [field.key]: !s[field.key] }))
                          }
                          className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                          title={isOpen ? "Скрыть" : "Показать"}
                        >
                          <Icon name={isOpen ? "EyeOff" : "Eye"} size={16} />
                        </button>
                        <button
                          onClick={() => copy(value, field.label)}
                          disabled={!value}
                          className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
                          title="Скопировать"
                        >
                          <Icon name="Copy" size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 break-all rounded-lg bg-[#161616] px-3 py-2 font-mono text-xs text-white/90">
                      {!value ? (
                        <span className="text-white/40">не задано</span>
                      ) : isOpen ? (
                        value
                      ) : (
                        "•".repeat(Math.min(value.length, 40))
                      )}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={copyAll}
                className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2.5 text-sm font-medium text-[#161616] transition-colors hover:bg-[#B8860B]"
              >
                <Icon name="ClipboardList" size={16} />
                Скопировать блок для файла настроек
              </button>
              <button
                onClick={() => {
                  setData(null)
                  setShown({})
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
              >
                <Icon name="Lock" size={16} />
                Скрыть
              </button>
            </div>
          </>
        )}
      </div>
    </CrmLayout>
  )
}