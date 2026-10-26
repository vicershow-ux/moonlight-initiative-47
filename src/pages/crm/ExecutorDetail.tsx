import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { Executor, ExecutorReport, executorKindLabels, executorsApi } from "@/lib/executorsApi"
import { objectsApi } from "@/lib/api"
import { ExecutorDialog } from "@/components/crm/executors/ExecutorDialog"
import { ExecutorReportsList } from "@/components/crm/executors/ExecutorReportsList"
import { ContractPaymentsCard } from "@/components/crm/executors/ContractPaymentsCard"
import { ExecutorTasksCard } from "@/components/crm/executors/ExecutorTasksCard"
import { formatMoney, formatDate } from "@/components/crm/documents/constants"

function NewContractButton({ executorId }: { executorId: number }) {
  const navigate = useNavigate()
  const [objects, setObjects] = useState<{ id: number; object_code: string; address?: string }[]>([])
  useEffect(() => {
    objectsApi.list().then((d) => setObjects(d.objects || [])).catch(() => setObjects([]))
  }, [])
  if (!objects.length) return null
  return (
    <select
      value=""
      onChange={(e) => e.target.value && navigate(`/cabinet/objects/${e.target.value}/contracts/new?role=customer&executor_id=${executorId}`)}
      className="bg-[#D4AF37] text-[#161616] font-medium rounded-lg px-3 min-h-[40px] text-sm outline-none cursor-pointer"
    >
      <option value="">+ Договор на объект…</option>
      {objects.map((o) => (
        <option key={o.id} value={o.id} className="bg-[#1f1f1f] text-white">
          {o.object_code} {o.address ? `— ${o.address}` : ""}
        </option>
      ))}
    </select>
  )
}

export default function ExecutorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canManage = user?.role === "owner" || user?.role === "admin"
  const [ex, setEx] = useState<Executor | null>(null)
  const [reports, setReports] = useState<ExecutorReport[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [openContract, setOpenContract] = useState<number | null>(null)

  const load = () => {
    if (!id) return
    Promise.all([executorsApi.get(Number(id)), executorsApi.reports({ executor_id: Number(id) }).catch(() => ({ reports: [] }))])
      .then(([d, r]) => {
        setEx(d.executor)
        setReports(r.reports || [])
      })
      .catch(() => navigate("/cabinet/executors"))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  if (loading || !ex) {
    return (
      <CrmLayout title="Исполнитель">
        <div className="flex justify-center py-24">
          <Icon name="Loader2" size={26} className="animate-spin text-white/40" />
        </div>
      </CrmLayout>
    )
  }

  const contracts = ex.contracts || []
  const total = contracts.reduce((s, c) => s + c.total_amount, 0)
  const paid = contracts.reduce((s, c) => s + c.paid, 0)
  const req = [
    ["ИНН", ex.inn],
    [ex.kind === "legal" ? "ОГРН" : "ОГРНИП", ex.ogrnip],
    ["Паспорт", ex.passport],
    ["Телефон", ex.phone],
    ["E-mail", ex.email],
    ["Адрес", ex.address],
    ["Банк", ex.bank_name],
    ["БИК", ex.bik],
    ["Р/с", ex.account],
    ["К/с", ex.corr_account],
  ].filter(([, v]) => v)

  return (
    <CrmLayout title={ex.display_name} subtitle={[executorKindLabels[ex.kind], ex.specialty].filter(Boolean).join(" · ")}>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Link to="/cabinet/executors" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white min-h-[40px]">
          <Icon name="ChevronLeft" size={16} />
          Все исполнители
        </Link>
        <div className="flex-1" />
        <button
          onClick={() => setEditOpen(true)}
          className="flex items-center gap-2 min-h-[40px] px-3 rounded-lg bg-white/5 hover:bg-white/10 text-sm"
        >
          <Icon name="Pencil" size={14} />
          Реквизиты
        </button>
        {canManage && !ex.is_archived && (
          <button
            onClick={async () => {
              if (!window.confirm("Перенести исполнителя в архив? Договоры и оплаты сохранятся.")) return
              await executorsApi.archive(ex.id)
              navigate("/cabinet/executors")
            }}
            className="flex items-center gap-2 min-h-[40px] px-3 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white/60"
          >
            <Icon name="Archive" size={14} />
            В архив
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        <div className="flex flex-col gap-4 min-w-0">
          <div className="grid grid-cols-3 gap-2">
            {[
              ["По договорам", formatMoney(total), "text-white"],
              ["Оплачено", formatMoney(paid), "text-emerald-400"],
              ["Долг", formatMoney(Math.max(0, total - paid)), "text-[#D4AF37]"],
            ].map(([l, v, c]) => (
              <div key={l} className="bg-[#1f1f1f] border border-white/10 rounded-xl p-3">
                <p className="text-[11px] text-white/40">{l}</p>
                <p className={cn("text-base sm:text-lg font-semibold", c)}>{v}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <p className="font-medium">Договоры</p>
              <NewContractButton executorId={ex.id} />
            </div>
            {contracts.length === 0 ? (
              <p className="text-xs text-white/40">Договоров пока нет. Выберите объект ниже, чтобы составить договор.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {contracts.map((c) => (
                  <li key={c.id} className="rounded-lg border border-white/10 bg-[#161616]">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          Договор № {c.contract_number} · {c.object_code}
                        </p>
                        <p className="text-xs text-white/40">
                          {formatDate(c.contract_date)}
                          {c.work_subject ? ` · ${c.work_subject}` : ""} · {c.status === "signed" ? "подписан" : "черновик"}
                        </p>
                      </div>
                      <div className="text-sm text-right">
                        <span className="font-medium">{formatMoney(c.total_amount)}</span>
                        <span className="block text-xs text-emerald-400">оплачено {formatMoney(c.paid)}</span>
                      </div>
                      <div className="grid grid-cols-3 sm:flex gap-2">
                        <Link
                          to={`/cabinet/objects/${c.object_id}/contracts/${c.id}`}
                          className="flex items-center justify-center w-full sm:w-9 h-10 sm:h-9 rounded-lg bg-white/5 text-white/50 hover:text-white"
                          title="Открыть договор"
                        >
                          <Icon name="Eye" size={15} />
                        </Link>
                        <Link
                          to={`/cabinet/objects/${c.object_id}/acts/new?contract_id=${c.id}`}
                          className="flex items-center justify-center w-full sm:w-9 h-10 sm:h-9 rounded-lg bg-white/5 text-white/50 hover:text-white"
                          title="Составить акт"
                        >
                          <Icon name="FileCheck" size={15} />
                        </Link>
                        <button
                          onClick={() => setOpenContract(openContract === c.id ? null : c.id)}
                          className={cn(
                            "flex items-center justify-center w-full sm:w-9 h-10 sm:h-9 rounded-lg bg-white/5 hover:text-white",
                            openContract === c.id ? "text-[#D4AF37]" : "text-white/50"
                          )}
                          title="Оплаты"
                        >
                          <Icon name="Banknote" size={15} />
                        </button>
                      </div>
                    </div>
                    {openContract === c.id && (
                      <div className="border-t border-white/10 p-2">
                        <ContractPaymentsCard contractId={c.id} total={c.total_amount} onChanged={load} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <ExecutorTasksCard executorId={ex.id} />

          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5">
            <p className="font-medium mb-3">Отчёты о работе</p>
            <ExecutorReportsList reports={reports} show="object" canReview onChanged={load} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5">
            <p className="font-medium mb-3">Реквизиты</p>
            {req.length === 0 ? (
              <p className="text-xs text-white/40">Не заполнены</p>
            ) : (
              <dl className="flex flex-col gap-2 text-sm">
                {req.map(([l, v]) => (
                  <div key={l}>
                    <dt className="text-[11px] text-white/40">{l}</dt>
                    <dd className="break-words">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5">
            <p className="font-medium mb-2">Кабинет исполнителя</p>
            {ex.access_enabled ? (
              <p className="text-sm text-white/60">
                Вход открыт: <span className="text-white">{ex.login_email}</span>
                <span className="block text-xs text-white/40 mt-1">
                  Входит через «Войти» на сайте
                  {ex.last_login_at ? ` · был ${formatDate(ex.last_login_at)}` : " · ещё не входил"}
                </span>
              </p>
            ) : (
              <p className="text-xs text-white/40">Закрыт. Откройте в «Реквизитах», чтобы исполнитель присылал отчёты с фото.</p>
            )}
          </div>
          {(ex.objects?.length || 0) > 0 && (
            <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5">
              <p className="font-medium mb-2">Объекты</p>
              <ul className="flex flex-col gap-1">
                {ex.objects!.map((o) => (
                  <li key={o.id}>
                    <Link to={`/cabinet/objects/${o.id}`} className="text-sm text-white/70 hover:text-[#D4AF37]">
                      {o.object_code} <span className="text-white/40">{o.address}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <ExecutorDialog open={editOpen} onOpenChange={setEditOpen} executor={ex} onSaved={load} />
    </CrmLayout>
  )
}
