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
    <CrmLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Настройки для переезда</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Значения, которые нужно перенести на свой сервер. Видит только владелец компании.
          </p>
        </div>

        {!data && (
          <form
            onSubmit={submit}
            className="space-y-4 rounded-lg border border-border bg-card p-6"
          >
            <div className="flex gap-3 rounded-md bg-muted/50 p-4">
              <Icon name="ShieldCheck" size={20} className="mt-0.5 shrink-0 text-primary" />
              <p className="text-sm text-muted-foreground">
                Для доступа введите свой пароль от кабинета — тот же, которым вы входите.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Ваш пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Введите пароль"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
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
            <div className="flex gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
              <Icon name="TriangleAlert" size={20} className="mt-0.5 shrink-0 text-amber-600" />
              <div className="text-sm">
                <p className="font-medium text-amber-700 dark:text-amber-500">
                  Не пересылайте эти значения в мессенджерах
                </p>
                <p className="mt-1 text-muted-foreground">
                  Сохраните их сразу в файл настроек на своём сервере.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {FIELDS.map((field) => {
                const value = data[field.key] || ""
                const isOpen = shown[field.key]
                return (
                  <div key={field.key} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-medium">{field.label}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{field.hint}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          onClick={() =>
                            setShown((s) => ({ ...s, [field.key]: !s[field.key] }))
                          }
                          className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                          title={isOpen ? "Скрыть" : "Показать"}
                        >
                          <Icon name={isOpen ? "EyeOff" : "Eye"} size={16} />
                        </button>
                        <button
                          onClick={() => copy(value, field.label)}
                          disabled={!value}
                          className="rounded-md p-2 text-muted-foreground hover:bg-muted disabled:opacity-40"
                          title="Скопировать"
                        >
                          <Icon name="Copy" size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 break-all rounded-md bg-muted px-3 py-2 font-mono text-xs">
                      {!value ? (
                        <span className="text-muted-foreground">не задано</span>
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
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                <Icon name="ClipboardList" size={16} />
                Скопировать блок для файла настроек
              </button>
              <button
                onClick={() => {
                  setData(null)
                  setShown({})
                }}
                className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium"
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
