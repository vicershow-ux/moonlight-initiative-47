import { PlanPoint } from "@/lib/planner/types"
import { ToScreen } from "./usePlanView"

interface Props {
  cursor: PlanPoint
  typed: string
  toScreen: ToScreen
}

/** Плашка у курсора: набранная длина стены или подсказка набрать её */
export function TypedLengthHint({ cursor, typed, toScreen }: Props) {
  return (
    <div
      className="pointer-events-none absolute z-10 flex items-center gap-1.5 rounded-lg border bg-[#161616]/95 px-2.5 py-1.5 text-xs shadow-lg"
      style={{
        left: toScreen(cursor).x + 16,
        top: toScreen(cursor).y + 14,
        borderColor: typed ? "#D4AF37" : "rgba(255,255,255,0.12)",
      }}
    >
      {typed ? (
        <>
          <span className="font-semibold text-[#D4AF37]">{typed}</span>
          <span className="text-white/40">мм · Enter</span>
        </>
      ) : (
        <span className="text-white/40">наберите длину, мм</span>
      )}
    </div>
  )
}

export default TypedLengthHint
