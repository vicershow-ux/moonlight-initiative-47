import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { LeadForm } from "@/components/LeadForm"
import { useWorkCart, workCart } from "@/hooks/useWorkCart"
import { WorkQtyControl } from "./WorkQtyControl"

const money = (n: number) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n)

export function WorkCartBar() {
  const { items, total, count } = useWorkCart()
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (!open) setSent(false)
  }, [open])

  if (!count && !open) return null

  const grouped = items.reduce<Record<string, typeof items>>((acc, w) => {
    ;(acc[w.category || "Работы"] ||= []).push(w)
    return acc
  }, {})

  return (
    <>
      {count > 0 && !open && (
        <div className="fixed inset-x-0 bottom-0 z-40 p-3 md:p-5 pointer-events-none">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="pointer-events-auto mx-auto flex w-full max-w-xl items-center justify-between gap-3 rounded-full bg-[#161616] text-white pl-5 pr-2 py-2 shadow-2xl"
          >
            <span className="flex items-center gap-3 min-w-0">
              <span className="relative">
                <Icon name="ClipboardList" size={20} className="text-[#D4AF37]" />
                <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] rounded-full bg-[#D4AF37] text-[#161616] text-[10px] font-semibold flex items-center justify-center px-1">
                  {count}
                </span>
              </span>
              <span className="text-left min-w-0">
                <span className="block text-xs text-white/50">Выбрано работ</span>
                <span className="block text-sm font-medium truncate">≈ {money(total)} ₽</span>
              </span>
            </span>
            <span className="flex items-center gap-2 rounded-full bg-[#D4AF37] text-[#161616] text-sm font-medium px-5 py-2.5">
              Оформить заявку
              <Icon name="ArrowRight" size={16} />
            </span>
          </button>
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg bg-background p-0 flex flex-col">
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-border text-left">
            <SheetTitle>Ваша заявка</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {sent ? null : count === 0 ? (
              <p className="text-sm text-muted-foreground py-10 text-center">Список пуст — выберите работы в прайсе</p>
            ) : (
              <div className="flex flex-col gap-5">
                {Object.entries(grouped).map(([cat, list]) => (
                  <div key={cat}>
                    <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">{cat}</p>
                    <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
                      {list.map((w) => (
                        <div key={w.name} className="flex flex-col gap-2 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm leading-snug">{w.name}</p>
                            <button
                              type="button"
                              onClick={() => workCart.remove(w)}
                              className="text-muted-foreground hover:text-red-500 shrink-0"
                              aria-label="Убрать"
                            >
                              <Icon name="X" size={16} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-2">
                              <WorkQtyControl name={w.name} category={w.category} unit={w.unit} price={w.price} />
                              <span className="text-xs text-muted-foreground">{w.unit}</span>
                            </span>
                            <span className="text-sm font-medium whitespace-nowrap">{money(w.price * w.quantity)} ₽</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3">
                  <span className="text-sm">Ориентировочно за работы</span>
                  <span className="text-lg font-semibold">{money(total)} ₽</span>
                </div>
                <p className="text-xs text-muted-foreground -mt-2">
                  Без учёта материалов. Точную сумму зафиксируем в смете после бесплатного замера.
                </p>
                <button
                  type="button"
                  onClick={() => workCart.clear()}
                  className="self-start text-xs text-muted-foreground hover:text-red-500"
                >
                  Очистить список
                </button>
              </div>
            )}

            {(count > 0 || sent) && (
              <div className="mt-6 rounded-2xl bg-foreground text-primary-foreground p-5">
                {!sent && <p className="text-sm font-medium mb-4 text-center">Контакты для связи</p>}
                <LeadForm
                  formName="Заявка по прайсу"
                  submitLabel="Отправить заявку"
                  successText="Получили список работ — перезвоним и согласуем замер"
                  works={items.map((w) => ({ name: w.name, category: w.category, quantity: w.quantity }))}
                  onSuccess={() => {
                    setSent(true)
                    workCart.clear()
                  }}
                />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default WorkCartBar
