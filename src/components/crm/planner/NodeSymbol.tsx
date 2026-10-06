import { SymbolPrim, symbolIcon } from "@/lib/planner/symbols"
import { NodeKind } from "@/lib/planner/types"

interface ShapesProps {
  prims: SymbolPrim[]
  color: string
  bg: string
  strokeWidth?: number
  opacity?: number
}

/** Рисует уже размещённый значок — на холсте и в иконках */
export function SymbolShapes({ prims, color, bg, strokeWidth = 1.5, opacity }: ShapesProps) {
  return (
    <g opacity={opacity}>
      {prims.map((p, i) => {
        if (p.kind === "circle") {
          return (
            <circle
              key={i}
              cx={p.c[0]}
              cy={p.c[1]}
              r={p.r}
              fill={p.fill ? color : bg}
              stroke={color}
              strokeWidth={strokeWidth}
            />
          )
        }
        const points = p.pts.map(([x, y]) => `${x},${y}`).join(" ")
        const common = {
          points,
          stroke: color,
          strokeWidth,
          strokeLinejoin: "round" as const,
          strokeLinecap: "round" as const,
        }
        return p.closed ? (
          <polygon key={i} {...common} fill={p.fill ? color : bg} />
        ) : (
          <polyline key={i} {...common} fill="none" />
        )
      })}
    </g>
  )
}

/** Маленький значок для кнопок и списков; цвет берёт от текста */
export function NodeSymbolIcon({ kind, height = 18 }: { kind: NodeKind; height?: number }) {
  const w = Math.round(height * 1.5)
  const prims = symbolIcon(kind, w, height, height * 0.34)
  if (!prims) return null
  return (
    <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} className="shrink-0">
      <SymbolShapes prims={prims} color="currentColor" bg="transparent" strokeWidth={1.4} />
    </svg>
  )
}

export default NodeSymbolIcon
