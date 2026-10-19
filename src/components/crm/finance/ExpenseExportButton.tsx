import { useState } from "react"
import Icon from "@/components/ui/icon"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { exportExpensesZip, monthTitle } from "@/lib/exportExpensesZip"

const lastMonths = () => {
  const out: string[] = []
  const d = new Date()
  for (let i = 0; i < 18; i++) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1)
    out.push(`${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`)
  }
  return out
}

export function ExpenseExportButton() {
  const months = lastMonths()
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(() => (new Date().getDate() <= 10 ? months[1] : months[0]))
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState("")
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)

  const run = async () => {
    setBusy(true)
    setResult(null)
    try {
      const r = await exportExpensesZip(month, setProgress)
      const parts = [`${r.count} расходов`, `${r.docs} документов`]
      if (r.noDocs) parts.push(`без документов: ${r.noDocs}`)
      if (r.failed) parts.push(`не скачалось файлов: ${r.failed} (ссылки в «Прочитай.txt»)`)
      setResult({ ok: true, text: `Архив скачан: ${parts.join(", ")}.` })
    } catch (e) {
      setResult({ ok: false, text: e instanceof Error ? e.message : "Не удалось собрать архив" })
    } finally {
      setBusy(false)
      setProgress("")
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setResult(null)
          setOpen(true)
        }}
        className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
      >
        <Icon name="FolderArchive" size={15} />
        Архив для бухгалтера
      </button>
      <Dialog open={open} onOpenChange={(v) => !busy && setOpen(v)}>
        <DialogContent className="max-w-md border-white/10 bg-[#1f1f1f] text-white">
          <DialogHeader>
            <DialogTitle>Архив расходов для бухгалтера</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-white/50">Месяц</span>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                disabled={busy}
                className="rounded-lg border border-white/10 bg-[#161616] px-3 py-2.5 text-sm capitalize outline-none focus:border-[#D4AF37]/50"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {monthTitle(m)}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded-lg bg-white/5 p-3 text-xs text-white/60 flex flex-col gap-1.5">
              <p className="flex items-center gap-2">
                <Icon name="Sheet" size={14} className="text-green-400" />
                Таблица Excel: реестр всех расходов и сводка по категориям и объектам
              </p>
              <p className="flex items-center gap-2">
                <Icon name="Folder" size={14} className="text-[#D4AF37]" />
                Папка «Документы»: чеки и накладные, имя файла совпадает с номером строки
              </p>
            </div>
            {result && (
              <p className={`flex items-start gap-1.5 text-sm ${result.ok ? "text-green-300" : "text-red-400"}`}>
                <Icon name={result.ok ? "CircleCheck" : "CircleAlert"} size={15} className="mt-0.5 shrink-0" />
                {result.text}
              </p>
            )}
            <button
              onClick={run}
              disabled={busy}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-3 text-sm font-medium text-[#161616] hover:bg-[#B8860B] disabled:opacity-60"
            >
              <Icon name={busy ? "Loader2" : "Download"} size={15} className={busy ? "animate-spin" : ""} />
              {busy ? progress || "Готовлю…" : "Скачать архив .zip"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ExpenseExportButton
