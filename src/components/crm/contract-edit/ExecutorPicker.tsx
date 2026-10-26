import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { ContractOptions } from "@/lib/api"
import { Executor, executorsApi, executorToContractOptions, executorKindLabels } from "@/lib/executorsApi"
import { ExecutorDialog } from "@/components/crm/executors/ExecutorDialog"

interface Props {
  options: Required<ContractOptions>
  applyExecutor: (patch: Partial<Required<ContractOptions>>) => void
}

/** Выбор исполнителя из справочника — подставляет все его реквизиты в договор */
export function ExecutorPicker({ options, applyExecutor }: Props) {
  const [list, setList] = useState<Executor[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)

  const load = (selectId?: number) =>
    executorsApi
      .list()
      .then((d) => {
        const active = (d.executors || []).filter((e) => !e.is_archived)
        setList(active)
        if (selectId) {
          const e = active.find((x) => x.id === selectId)
          if (e) applyExecutor(executorToContractOptions(e) as Partial<Required<ContractOptions>>)
        }
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pick = (value: string) => {
    if (!value) {
      applyExecutor({ executor_id: null })
      return
    }
    const e = list.find((x) => String(x.id) === value)
    if (e) applyExecutor(executorToContractOptions(e) as Partial<Required<ContractOptions>>)
  }

  return (
    <div className="my-4 rounded-xl border border-orange-500/30 bg-orange-500/[0.05] p-3 sm:p-4">
      <p className="text-sm font-medium text-white/90 mb-2 flex items-center gap-2">
        <Icon name="HardHat" size={16} className="text-orange-300" />
        Исполнитель из справочника
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <select
            value={options.executor_id ? String(options.executor_id) : ""}
            onChange={(e) => pick(e.target.value)}
            disabled={loading}
            className="w-full appearance-none bg-[#161616] border border-white/10 rounded-lg px-3 pr-9 min-h-[44px] text-base sm:text-sm outline-none focus:border-[#D4AF37]/50 disabled:opacity-50"
          >
            <option value="">{loading ? "Загружаю…" : "— Ввести данные вручную —"}</option>
            {list.map((e) => (
              <option key={e.id} value={e.id}>
                {e.display_name} · {executorKindLabels[e.kind]}
                {e.specialty ? ` · ${e.specialty}` : ""}
              </option>
            ))}
          </select>
          <Icon name="ChevronsUpDown" size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-lg border border-white/10 text-sm text-white/70 hover:text-white"
        >
          <Icon name="Plus" size={15} />
          Новый
        </button>
      </div>
      <p className="text-[11px] text-white/40 mt-2">
        {options.executor_id
          ? "Реквизиты подставлены из справочника — можно поправить ниже, справочник не изменится"
          : "Выберите исполнителя — договор, оплаты и отчёты привяжутся к нему"}
      </p>
      <ExecutorDialog open={addOpen} onOpenChange={setAddOpen} executor={null} onSaved={(id) => load(id)} />
    </div>
  )
}

export default ExecutorPicker
