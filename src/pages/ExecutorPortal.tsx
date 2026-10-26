import { useEffect, useRef, useState } from "react"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { compressImage } from "@/lib/compressImage"
import { getPortalToken, setPortalToken, clearPortalToken, portalApi, PortalData } from "@/lib/executorsApi"
import { reportStatus } from "@/components/crm/executors/ExecutorReportsList"
import { formatMoney, formatDate } from "@/components/crm/documents/constants"

const input =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 min-h-[48px] text-base outline-none focus:border-[#D4AF37]/50"

function LoginForm({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      const { token } = await portalApi.login(email, password)
      setPortalToken(token)
      onDone()
    } catch (err) {
      setError((err as Error)?.message || "Не удалось войти")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#161616] text-white flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-[#1f1f1f] border border-white/10 rounded-2xl p-6 flex flex-col gap-3">
        <div className="w-12 h-12 rounded-full bg-orange-500/15 text-orange-300 flex items-center justify-center mx-auto">
          <Icon name="HardHat" size={22} />
        </div>
        <h1 className="text-center text-lg font-semibold">Кабинет исполнителя</h1>
        <p className="text-center text-xs text-white/40 -mt-1 mb-2">Отчёты о работе по вашим объектам</p>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Почта" className={input} autoComplete="username" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Пароль" className={input} autoComplete="current-password" required />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="flex items-center justify-center gap-2 min-h-[48px] rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] text-[#161616] font-medium disabled:opacity-60"
        >
          {busy && <Icon name="Loader2" size={16} className="animate-spin" />}
          Войти
        </button>
        <p className="text-center text-[11px] text-white/30">Почту и пароль выдаёт заказчик работ</p>
      </form>
    </div>
  )
}

function ReportForm({ data, onSent }: { data: PortalData; onSent: () => void }) {
  const [objectId, setObjectId] = useState<number | "">(data.objects[0]?.id ?? "")
  const [contractId, setContractId] = useState<number | "">("")
  const [text, setText] = useState("")
  const [pct, setPct] = useState(50)
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [ok, setOk] = useState(false)
  const camRef = useRef<HTMLInputElement>(null)

  const contracts = data.contracts.filter((c) => c.object_id === objectId)

  useEffect(() => {
    setContractId(contracts[0]?.id ?? "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectId])

  const addPhotos = async (list: FileList | null) => {
    if (!list?.length) return
    setUploading(true)
    setError("")
    try {
      for (const file of Array.from(list).slice(0, 10 - photos.length)) {
        const { data: b64, name } = await compressImage(file)
        const { url } = await portalApi.upload(name, b64)
        setPhotos((p) => [...p, url])
      }
    } catch (e) {
      setError((e as Error)?.message || "Не удалось загрузить фото")
    } finally {
      setUploading(false)
      if (camRef.current) camRef.current.value = ""
    }
  }

  const send = async () => {
    if (!objectId) return setError("Выберите объект")
    if (text.trim().length < 3) return setError("Опишите, что сделано")
    setBusy(true)
    setError("")
    try {
      await portalApi.sendReport({ object_id: Number(objectId), contract_id: contractId || null, work_text: text, progress_pct: pct, photos })
      setText("")
      setPhotos([])
      setOk(true)
      setTimeout(() => setOk(false), 3000)
      onSent()
    } catch (e) {
      setError((e as Error)?.message || "Не удалось отправить отчёт")
    } finally {
      setBusy(false)
    }
  }

  if (data.objects.length === 0) {
    return (
      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5 text-center text-sm text-white/50">
        Вам пока не открыли ни одного объекта. Свяжитесь с заказчиком.
      </div>
    )
  }

  return (
    <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-4 flex flex-col gap-3">
      <p className="font-medium">Новый отчёт</p>
      <select value={objectId} onChange={(e) => setObjectId(Number(e.target.value))} className={input}>
        {data.objects.map((o) => (
          <option key={o.id} value={o.id}>
            {o.object_code} — {o.address}
          </option>
        ))}
      </select>
      {contracts.length > 1 && (
        <select value={contractId} onChange={(e) => setContractId(Number(e.target.value))} className={input}>
          {contracts.map((c) => (
            <option key={c.id} value={c.id}>
              Договор № {c.contract_number}
            </option>
          ))}
        </select>
      )}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Что сделано сегодня: например, «Проложил кабель в кухне и коридоре, установил 6 подрозетников»"
        className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-3 text-base outline-none focus:border-[#D4AF37]/50"
      />
      <div>
        <div className="flex justify-between text-xs text-white/50 mb-1">
          <span>Готовность работ</span>
          <span className="text-[#D4AF37] font-medium">{pct}%</span>
        </div>
        <input type="range" min={0} max={100} step={5} value={pct} onChange={(e) => setPct(Number(e.target.value))} className="w-full accent-[#D4AF37] h-8" />
      </div>
      <div className="flex gap-2 flex-wrap">
        {photos.map((u) => (
          <div key={u} className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10">
            <img src={u} alt="Фото" className="w-full h-full object-cover" />
            <button
              onClick={() => setPhotos((p) => p.filter((x) => x !== u))}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center"
              aria-label="Убрать фото"
            >
              <Icon name="X" size={12} />
            </button>
          </div>
        ))}
        {photos.length < 10 && (
          <button
            onClick={() => camRef.current?.click()}
            disabled={uploading}
            className="w-20 h-20 rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center gap-1 text-xs text-white/50"
          >
            <Icon name={uploading ? "Loader2" : "Camera"} size={20} className={uploading ? "animate-spin" : ""} />
            Фото
          </button>
        )}
      </div>
      <input ref={camRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addPhotos(e.target.files)} />
      {error && <p className="text-sm text-red-400">{error}</p>}
      {ok && <p className="text-sm text-emerald-400">Отчёт отправлен заказчику</p>}
      <button
        onClick={send}
        disabled={busy || uploading}
        className="flex items-center justify-center gap-2 min-h-[48px] rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] text-[#161616] font-medium disabled:opacity-60"
      >
        <Icon name={busy ? "Loader2" : "Send"} size={16} className={busy ? "animate-spin" : ""} />
        Отправить отчёт
      </button>
    </div>
  )
}

export default function ExecutorPortal() {
  const [authed, setAuthed] = useState(Boolean(getPortalToken()))
  const [data, setData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(false)

  const load = () => {
    setLoading(true)
    portalApi
      .me()
      .then(setData)
      .catch(() => {
        clearPortalToken()
        setAuthed(false)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (authed) load()
  }, [authed])

  if (!authed) return <LoginForm onDone={() => setAuthed(true)} />

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#161616] flex items-center justify-center">
        <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
      </div>
    )
  }
  if (!data) return null

  const objName = (id: number) => data.objects.find((o) => o.id === id)?.object_code || ""

  return (
    <div className="min-h-screen bg-[#161616] text-white">
      <header className="sticky top-0 z-10 bg-[#161616]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">
          <span className="w-10 h-10 rounded-full bg-orange-500/15 text-orange-300 flex items-center justify-center shrink-0">
            <Icon name="HardHat" size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{data.executor.name}</p>
            <p className="text-xs text-white/40 truncate">Заказчик: {data.company.name}</p>
          </div>
          <button
            onClick={async () => {
              await portalApi.logout()
              setAuthed(false)
              setData(null)
            }}
            className="w-11 h-11 flex items-center justify-center rounded-lg bg-white/5 text-white/60"
            aria-label="Выйти"
          >
            <Icon name="LogOut" size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 flex flex-col gap-4">
        <ReportForm data={data} onSent={load} />

        {data.contracts.length > 0 && (
          <section className="bg-[#1f1f1f] border border-white/10 rounded-xl p-4">
            <p className="font-medium mb-3">Мои договоры</p>
            <ul className="flex flex-col gap-2">
              {data.contracts.map((c) => (
                <li key={c.id} className="rounded-lg bg-[#161616] border border-white/10 p-3">
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="font-medium">
                      № {c.contract_number} · {objName(c.object_id)}
                    </span>
                    <span>{formatMoney(c.total_amount)}</span>
                  </div>
                  <div className="flex justify-between gap-2 text-xs text-white/40 mt-1">
                    <span>
                      {formatDate(c.contract_date)}
                      {c.work_subject ? ` · ${c.work_subject}` : ""}
                    </span>
                    <span className="text-emerald-400">получено {formatMoney(c.paid)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="bg-[#1f1f1f] border border-white/10 rounded-xl p-4">
          <p className="font-medium mb-3">Мои отчёты</p>
          {data.reports.length === 0 ? (
            <p className="text-xs text-white/40">Отчётов пока нет</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {data.reports.map((r) => {
                const st = reportStatus[r.status] || reportStatus.new
                return (
                  <li key={r.id} className="rounded-lg bg-[#161616] border border-white/10 p-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {r.object_code} · {formatDate(r.report_date)}
                      </span>
                      <span className={cn("px-2 py-0.5 rounded-full text-[11px]", st.cls)}>{st.label}</span>
                    </div>
                    <p className="text-sm text-white/70 whitespace-pre-wrap break-words">{r.work_text}</p>
                    {r.photos?.length > 0 && (
                      <div className="mt-2 flex gap-2 overflow-x-auto">
                        {r.photos.map((u) => (
                          <img key={u} src={u} alt="Фото" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                        ))}
                      </div>
                    )}
                    {r.reply && <p className="mt-2 text-xs text-white/60 border-l-2 border-[#D4AF37]/50 pl-2">Ответ: {r.reply}</p>}
                    {r.status === "new" && (
                      <button
                        onClick={async () => {
                          if (!window.confirm("Удалить отчёт?")) return
                          await portalApi.removeReport(r.id).catch(() => null)
                          load()
                        }}
                        className="mt-2 text-xs text-white/40 hover:text-red-400"
                      >
                        Удалить
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
