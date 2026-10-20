import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { materialsApi, ParserInfo } from "@/lib/api"
import { goldBtn } from "./constants"

interface Props {
  onClose: () => void
  onUpdated: () => void
}

type Line = { id: number; name: string; status: "wait" | "run" | "ok" | "error"; message: string }

const fmt = (d: string | null) => (d ? new Date(d).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" }) : "—")

export function PriceParserModal({ onClose, onUpdated }: Props) {
  const [info, setInfo] = useState<ParserInfo | null>(null)
  const [error, setError] = useState("")
  const [checking, setChecking] = useState(false)
  const [repairing, setRepairing] = useState(false)
  const [repairLog, setRepairLog] = useState<{ label: string; ok: boolean; message: string }[]>([])
  const [checkMsg, setCheckMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [lines, setLines] = useState<Line[]>([])
  const [running, setRunning] = useState(false)

  const load = () =>
    materialsApi
      .parserInfo()
      .then((d) => {
        setInfo(d)
        setLines(
          d.items.map((it) => ({
            id: it.id,
            name: it.name,
            status: it.parse_status === "ok" ? "ok" : it.parse_status === "error" ? "error" : "wait",
            message: it.parsed_at ? `${it.parse_message} · ${fmt(it.parsed_at)}` : "Ещё не обновлялось",
          })),
        )
      })
      .catch((e) => setError(e?.message || "Не удалось загрузить данные"))

  useEffect(() => {
    load()
  }, [])

  const check = async () => {
    setChecking(true)
    setCheckMsg(null)
    try {
      const r = await materialsApi.parserCheck({ save_fail: true })
      setCheckMsg({ ok: r.ok, text: r.message })
      load()
    } catch (e) {
      setCheckMsg({ ok: false, text: (e as Error)?.message || "Ошибка проверки" })
    } finally {
      setChecking(false)
    }
  }

  const repair = async () => {
    if (!info) return
    setRepairing(true)
    setRepairLog([])
    setCheckMsg(null)
    let fixed = false
    for (const s of info.strategies) {
      try {
        const r = await materialsApi.parserCheck({ strategy: s.key })
        setRepairLog((l) => [...l, { label: s.label, ok: r.ok, message: r.message }])
        if (r.ok) {
          fixed = true
          setCheckMsg({ ok: true, text: `Починено — теперь используется способ «${s.label}»` })
          break
        }
      } catch (e) {
        setRepairLog((l) => [...l, { label: s.label, ok: false, message: (e as Error)?.message || "Ошибка" }])
      }
    }
    if (!fixed) {
      setCheckMsg({
        ok: false,
        text: "Ни один способ не прошёл: магазин закрыл страницы защитой от роботов. Цены этого магазина придётся вносить вручную, остальные магазины обновятся.",
      })
    }
    load()
    setRepairing(false)
  }

  const runAll = async () => {
    setRunning(true)
    for (const line of lines) {
      setLines((ls) => ls.map((x) => (x.id === line.id ? { ...x, status: "run", message: "Проверяю…" } : x)))
      try {
        const r = await materialsApi.parserUpdate(line.id)
        setLines((ls) => ls.map((x) => (x.id === line.id ? { ...x, status: r.ok ? "ok" : "error", message: r.message } : x)))
      } catch (e) {
        setLines((ls) =>
          ls.map((x) => (x.id === line.id ? { ...x, status: "error", message: (e as Error)?.message || "Ошибка" } : x)),
        )
      }
    }
    setRunning(false)
    onUpdated()
    load()
  }

  const strategyLabel = info?.strategies.find((s) => s.key === info.state.strategy)?.label || "—"
  const okCount = lines.filter((l) => l.status === "ok").length
  const errCount = lines.filter((l) => l.status === "error").length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/10 bg-[#1f1f1f] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <Icon name="RefreshCw" size={18} className="text-[#D4AF37]" />
            Обновление цен по ссылкам
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <Icon name="X" size={18} />
          </button>
        </div>

        {error && <div className="mb-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}

        {!info ? (
          <div className="flex justify-center py-10">
            <Icon name="Loader2" size={22} className="animate-spin text-white/40" />
          </div>
        ) : (
          <>
            <div className="mb-4 rounded-lg border border-white/10 bg-[#161616] p-4 text-sm">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${info.state.last_check_at ? (info.state.last_ok ? "bg-emerald-400" : "bg-red-400") : "bg-white/30"}`}
                />
                <span className="font-medium">
                  {info.state.last_check_at ? (info.state.last_ok ? "Парсер работает" : "Парсер не работает") : "Не проверялся"}
                </span>
              </div>
              <div className="space-y-1 text-xs text-white/50">
                <div>Способ загрузки: {strategyLabel}</div>
                <div>Последняя проверка: {fmt(info.state.last_check_at)}</div>
                <div>Последнее обновление цен: {fmt(info.state.last_run_at)}</div>
                {info.state.last_message && <div className="text-white/60">{info.state.last_message}</div>}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={check}
                  disabled={checking || repairing || running}
                  className="flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm text-white/80 hover:bg-white/5 disabled:opacity-40"
                >
                  <Icon name={checking ? "Loader2" : "Activity"} size={15} className={checking ? "animate-spin" : ""} />
                  Проверить работу
                </button>
                <button
                  onClick={repair}
                  disabled={checking || repairing || running}
                  className="flex items-center gap-2 rounded-lg border border-[#D4AF37]/40 px-3 py-2 text-sm text-[#D4AF37] hover:bg-[#D4AF37]/10 disabled:opacity-40"
                >
                  <Icon name={repairing ? "Loader2" : "Wrench"} size={15} className={repairing ? "animate-spin" : ""} />
                  Починить
                </button>
              </div>
              {checkMsg && (
                <div
                  className={`mt-3 rounded-lg px-3 py-2 text-xs ${checkMsg.ok ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}
                >
                  {checkMsg.text}
                </div>
              )}
              {repairLog.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs">
                  {repairLog.map((r, i) => (
                    <li key={i} className={r.ok ? "text-emerald-300" : "text-white/40"}>
                      {r.ok ? "✓" : "✕"} {r.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm text-white/60">
                Материалов со ссылкой на товар: {lines.length}
                {(okCount > 0 || errCount > 0) && (
                  <span className="ml-2 text-xs">
                    <span className="text-emerald-400">{okCount} ок</span>
                    {errCount > 0 && <span className="ml-2 text-red-400">{errCount} ошибок</span>}
                  </span>
                )}
              </div>
              <button className={goldBtn} disabled={running || lines.length === 0} onClick={runAll}>
                <Icon name={running ? "Loader2" : "RefreshCw"} size={16} className={running ? "animate-spin" : ""} />
                Обновить цены и наличие
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="py-8 text-center text-sm text-white/30">
                Добавьте в материалах ссылку на страницу товара (не на главную магазина) — тогда цену можно будет обновлять
              </div>
            ) : (
              <ul className="divide-y divide-white/5 rounded-lg border border-white/10">
                {lines.map((l) => (
                  <li key={l.id} className="flex items-start gap-3 px-3 py-2.5 text-sm">
                    <Icon
                      name={l.status === "run" ? "Loader2" : l.status === "ok" ? "CircleCheck" : l.status === "error" ? "CircleAlert" : "Circle"}
                      size={16}
                      className={`mt-0.5 shrink-0 ${l.status === "run" ? "animate-spin text-white/50" : l.status === "ok" ? "text-emerald-400" : l.status === "error" ? "text-red-400" : "text-white/20"}`}
                    />
                    <div className="min-w-0">
                      <div className="truncate">{l.name}</div>
                      <div className="text-xs text-white/40">{l.message}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default PriceParserModal
