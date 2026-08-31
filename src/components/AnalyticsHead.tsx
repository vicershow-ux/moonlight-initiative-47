import { useEffect } from "react"
import { useSiteContent } from "@/hooks/useSiteContent"

export function AnalyticsHead() {
  const { content } = useSiteContent()

  useEffect(() => {
    const code = content?.settings?.analytics_head?.trim()
    if (!code) return
    if (window.__isCabinet) return
    if (document.querySelector("[data-analytics-injected]")) return

    const template = document.createElement("template")
    template.innerHTML = code

    const injected: Node[] = []
    template.content.childNodes.forEach((node) => {
      if (node.nodeName === "SCRIPT") {
        const src = node as HTMLScriptElement
        const script = document.createElement("script")
        Array.from(src.attributes).forEach((attr) =>
          script.setAttribute(attr.name, attr.value),
        )
        script.text = src.text
        script.setAttribute("data-analytics-injected", "true")
        document.head.appendChild(script)
        injected.push(script)
      } else if (node.nodeType === 1) {
        const clone = node.cloneNode(true) as HTMLElement
        clone.setAttribute("data-analytics-injected", "true")
        document.head.appendChild(clone)
        injected.push(clone)
      }
    })

    return () => {
      injected.forEach((node) => node.parentNode?.removeChild(node))
    }
  }, [content])

  return null
}

export default AnalyticsHead
