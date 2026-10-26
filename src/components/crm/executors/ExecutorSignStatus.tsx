import Icon from "@/components/ui/icon"

interface Props {
  signedAt?: string | null
  kind: "contract" | "act"
}

/** Статус подписи исполнителя в договоре/акте, где мы — Заказчик */
export function ExecutorSignStatus({ signedAt, kind }: Props) {
  const doc = kind === "contract" ? "договор" : "акт"
  if (signedAt) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 p-3 sm:p-4 flex items-center gap-3 max-w-4xl mx-auto text-sm">
        <Icon name="BadgeCheck" size={20} className="text-emerald-400 shrink-0" />
        <span>
          Исполнитель подписал {doc} онлайн{" "}
          {new Date(signedAt).toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}. Менять{" "}
          {doc} больше нельзя.
        </span>
      </div>
    )
  }
  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl mb-4 p-3 sm:p-4 flex items-center gap-3 max-w-4xl mx-auto text-sm">
      <Icon name="Clock" size={20} className="text-amber-300 shrink-0" />
      <span>
        Ждёт подписи исполнителя. {kind === "contract" ? "Договор" : "Акт"} уже виден в его кабинете — он может прочитать и подписать онлайн.
      </span>
    </div>
  )
}

export default ExecutorSignStatus
