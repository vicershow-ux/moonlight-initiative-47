import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { Switch } from "@/components/ui/switch"
import { DadataSettings as Settings, objectsApi } from "@/lib/api"

const field = "w-full rounded-lg border border-white/10 bg-[#161616] px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"

interface Props {
  onChange?: (s: Settings) => void
}

/** DaData: ключ API и включение автозаполнения реквизитов по ИНН */
export function DadataSettings({ onChange }: Props) {
  const [s, setS] = useState<Settings | null>(null)
  const [key, setKey] = useState("")
  const [error, setError] = useState("")
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState<"" | "save" | "test">("")

  const apply = (v: Settings) => {
    setS(v)
    onChange?.(v)
  }

  useEffect(() => {
    objectsApi
      .dadataSettings()
      .then(apply)
      .catch((e) => setError(e instanceof Error ? e.message : "Ошибка загрузки"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const save = async (patch: { api_key?: string; enabled?: boolean }) => {
    setBusy("save")
    setNote(null)
    try {
      apply(await objectsApi.saveDadata(patch))
      if (patch.api_key !== undefined) {
        setKey("")
        setNote({ ok: true, text: patch.api_key ? "Ключ сохранён" : "Ключ удалён" })
      }
    } catch (e) {
      setNote({ ok: false, text: e instanceof Error ? e.message : "Не удалось сохранить" })
    } finally {
      setBusy("")
    }
  }

  const test = async () => {
    setBusy("test")
    setNote(null)
    try {
      const r = await objectsApi.testDadata(key.trim() || undefined)
      setNote(r.ok ? { ok: true, text: "Подключение работает — тестовый ИНН найден" } : { ok: false, text: r.error || "Ключ не подошёл" })
    } catch (e) {
      setNote({ ok: false, text: e instanceof Error ? e.message : "Проверка не удалась" })
    } finally {
      setBusy("")
    }
  }

  if (error) return <p className="text-sm text-red-400">{error}</p>
  if (!s)
    return (
      <div className="flex justify-center py-16">
        <Icon name="Loader2" size={24} className="animate-spin text-white/40" />
      </div>
    )

  const connected = s.has_key || s.from_env

  return (
    <div className="grid max-w-5xl gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex flex-col gap-5 rounded-xl border border-white/10 bg-[#1f1f1f] p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium">Автозаполнение реквизитов по ИНН</p>
            <p className="mt-1 text-sm text-white/50">
              В карточке объекта, где заказчик — юрлицо, кнопка «Заполнить по ИНН» подставит название, КПП, ОГРН, юридический адрес и руководителя из ЕГРЮЛ
            </p>
          </div>
          <Switch checked={s.enabled} disabled={busy !== ""} onCheckedChange={(v) => save({ enabled: v })} />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className={`h-2 w-2 rounded-full ${connected && s.enabled ? "bg-green-400" : "bg-white/30"}`} />
          {!s.enabled
            ? "Выключено"
            : s.has_key
              ? `Подключено · ключ ${s.key_masked}`
              : s.from_env
                ? "Подключено через общий ключ платформы"
                : "Ключ не указан"}
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-white/80">{s.has_key ? "Заменить API-ключ" : "API-ключ"}</span>
          <input
            className={`${field} font-mono`}
            value={key}
            onChange={(e) => setKey(e.target.value.trim())}
            placeholder={s.has_key ? s.key_masked : "например, 2d88b089b5cad21e…"}
            autoComplete="off"
            spellCheck={false}
          />
          <span className="text-xs text-white/40">Нужен только «API-ключ». Секретный ключ не требуется</span>
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => save({ api_key: key })}
            disabled={!key || busy !== ""}
            className="flex min-h-[44px] items-center gap-2 rounded-lg bg-[#D4AF37] px-4 text-sm text-[#161616] transition-colors hover:bg-[#B8860B] disabled:opacity-40"
          >
            <Icon name={busy === "save" ? "Loader2" : "Save"} size={15} className={busy === "save" ? "animate-spin" : ""} />
            Сохранить ключ
          </button>
          <button
            onClick={test}
            disabled={(!key && !connected) || busy !== ""}
            className="flex min-h-[44px] items-center gap-2 rounded-lg bg-white/5 px-4 text-sm transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            <Icon name={busy === "test" ? "Loader2" : "PlugZap"} size={15} className={busy === "test" ? "animate-spin" : ""} />
            Проверить подключение
          </button>
          {s.has_key && (
            <button
              onClick={() => window.confirm("Удалить ключ DaData?") && save({ api_key: "" })}
              disabled={busy !== ""}
              className="flex min-h-[44px] items-center gap-2 rounded-lg px-4 text-sm text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-40"
            >
              <Icon name="Trash2" size={15} />
              Удалить ключ
            </button>
          )}
        </div>
        {note && <p className={`text-sm ${note.ok ? "text-emerald-400" : "text-amber-400"}`}>{note.text}</p>}

        {s.requests_count > 0 && (
          <p className="text-xs text-white/40">
            Запросов выполнено: {s.requests_count}
            {s.last_used_at ? ` · последний ${new Date(s.last_used_at).toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}` : ""}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 self-start rounded-xl border border-white/10 bg-[#1f1f1f] p-4 text-sm sm:p-5">
        <p className="font-medium">Где взять ключ</p>
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-white/60">
          <li>
            Зарегистрируйтесь на{" "}
            <a href="https://dadata.ru" target="_blank" rel="noreferrer" className="text-[#D4AF37] hover:underline">
              dadata.ru
            </a>{" "}
            — это бесплатно
          </li>
          <li>Откройте «Личный кабинет» → «API-ключи»</li>
          <li>Скопируйте строку из поля «API-ключ» и вставьте слева</li>
        </ol>
        <p className="text-xs text-white/40">Бесплатно — до 10 000 запросов в день. Банковские реквизиты в ЕГРЮЛ нет — их вводят вручную</p>
      </div>
    </div>
  )
}

export default DadataSettings
