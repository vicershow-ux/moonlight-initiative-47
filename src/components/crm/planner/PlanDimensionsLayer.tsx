import { dimensionParts, fmtMm, outerDimensions } from "@/lib/planner/geometry"
import { PlanRoom } from "@/lib/planner/types"
import { ToScreen } from "./usePlanView"

interface Props {
  rooms: PlanRoom[]
  scale: number
  toScreen: ToScreen
}

const COLOR = "rgba(255,255,255,0.55)"
const TEXT = "#D4AF37"

/** Размерные линии по внешнему контуру — как на строительных чертежах */
export function PlanDimensionsLayer({ rooms, scale, toScreen }: Props) {
  return (
    <g>
      {outerDimensions(rooms).map(({ room, dims }) =>
        dims.map((dim) => {
          // Короткие стены пропускаем: подпись не поместится и превратится в кашу
          if (dim.length * scale < 38) return null
          const d = dimensionParts(dim, toScreen)

          return (
            <g key={`${room.id}-${dim.id}`}>
              <line
                x1={d.ext1.x1}
                y1={d.ext1.y1}
                x2={d.ext1.x2}
                y2={d.ext1.y2}
                stroke={COLOR}
                strokeWidth={1}
              />
              <line
                x1={d.ext2.x1}
                y1={d.ext2.y1}
                x2={d.ext2.x2}
                y2={d.ext2.y2}
                stroke={COLOR}
                strokeWidth={1}
              />
              <line
                x1={d.line.x1}
                y1={d.line.y1}
                x2={d.line.x2}
                y2={d.line.y2}
                stroke={COLOR}
                strokeWidth={1}
              />
              <polygon points={d.arrows[0]} fill={COLOR} />
              <polygon points={d.arrows[1]} fill={COLOR} />
              <text
                x={d.label.x}
                y={d.label.y}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill={TEXT}
                transform={`rotate(${d.label.angle}, ${d.label.cx}, ${d.label.cy})`}
              >
                {fmtMm(d.length)}
              </text>
            </g>
          )
        }),
      )}
    </g>
  )
}

export default PlanDimensionsLayer