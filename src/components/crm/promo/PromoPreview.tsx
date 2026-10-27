import { forwardRef, useEffect, useRef, useState } from "react"
import { PromoData, PromoKind } from "@/lib/api"
import { MM_PX, sheetSize } from "./promoConfig"
import { PromoArtwork } from "./PromoArtwork"

interface Props {
  kind: PromoKind
  data: PromoData
}

/** Макет в натуральную величину, уменьшенный под ширину экрана; ref — на сам лист для печати */
export const PromoPreview = forwardRef<HTMLDivElement, Props>(function PromoPreview({ kind, data }, ref) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)
  const { w, h } = sheetSize(kind, data)
  const pxW = w * MM_PX
  const pxH = h * MM_PX

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const fit = () => setScale(Math.min(1, el.clientWidth / pxW))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [pxW])

  return (
    <div ref={boxRef} className="w-full">
      <div className="mx-auto shadow-2xl ring-1 ring-white/10" style={{ width: pxW * scale, height: pxH * scale, overflow: "hidden" }}>
        <div style={{ width: pxW, height: pxH, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <div ref={ref}>
            <PromoArtwork kind={kind} data={data} />
          </div>
        </div>
      </div>
    </div>
  )
})

export default PromoPreview
