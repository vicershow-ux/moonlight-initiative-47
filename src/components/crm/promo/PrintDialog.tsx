import { Dispatch, SetStateAction } from "react"
import Icon from "@/components/ui/icon"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { PromoDesign } from "@/lib/promoTypes"
import { PrintOptions, printDesign } from "./printDesign"

interface Props {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  design: PromoDesign
  title: string
  perSheet: number
  printOpts: PrintOptions
  setPrintOpts: Dispatch<SetStateAction<PrintOptions>>
}

/** Окно настроек печати на листе А4 */
export function PrintDialog({ open, setOpen, design, title, perSheet, printOpts, setPrintOpts }: Props) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-white/10 bg-[#1f1f1f] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Печать на листе А4</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {design.sides.length > 1 && (
            <div className="space-y-1.5">
              <div className="text-xs text-white/50">Что печатать</div>
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-[#161616] p-1">
                {(
                  [
                    ["both", "Обе стороны"],
                    ["front", "Лицевую"],
                    ["back", "Оборот"],
                  ] as const
                ).map(([v, l]) => (
                  <button key={v} onClick={() => setPrintOpts((o) => ({ ...o, sides: v }))} className={`rounded-md py-2 text-xs ${printOpts.sides === v ? "bg-[#D4AF37] font-medium text-[#161616]" : "text-white/60"}`}>
                    {l}
                  </button>
                ))}
              </div>
              {printOpts.sides === "both" && <p className="text-[11px] text-white/40">Оборот печатается вторым листом. Вставьте первый лист обратной стороной и напечатайте оборот — визитки совпадут.</p>}
            </div>
          )}
          {perSheet > 1 && (
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>Заполнить лист ({perSheet} шт. на А4)</span>
              <input type="checkbox" checked={printOpts.fill} onChange={(e) => setPrintOpts((o) => ({ ...o, fill: e.target.checked }))} className="h-4 w-4 accent-[#D4AF37]" />
            </label>
          )}
          {perSheet > 1 && (
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>Пунктир для отреза</span>
              <input type="checkbox" checked={printOpts.cutLines} onChange={(e) => setPrintOpts((o) => ({ ...o, cutLines: e.target.checked }))} className="h-4 w-4 accent-[#D4AF37]" />
            </label>
          )}
          <p className="rounded-lg bg-white/5 p-3 text-xs text-white/60">В окне печати выберите масштаб «100%» (или «Фактический размер»), поля «Нет» и включите «Фон и цвета».</p>
          <button
            onClick={() => {
              setOpen(false)
              printDesign(design, title, printOpts)
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#D4AF37] py-3 text-sm font-medium text-[#161616] hover:bg-[#B8860B]"
          >
            <Icon name="Printer" size={16} /> Печатать
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PrintDialog
