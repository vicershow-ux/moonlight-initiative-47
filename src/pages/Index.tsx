import { useEffect } from "react"
import { Header } from "../components/Header"
import { Hero } from "../components/Hero"
import { Philosophy } from "../components/Philosophy"
import { Projects } from "../components/Projects"
import { Expertise } from "../components/Expertise"
import { FAQ } from "../components/FAQ"
import { CallToAction } from "../components/CallToAction"
import { Footer } from "../components/Footer"
import { useSiteContent } from "@/hooks/useSiteContent"

export default function Index() {
  const { content } = useSiteContent()

  useEffect(() => {
    if (!content) return
    const { meta_title, meta_description } = content.settings

    if (meta_title) document.title = meta_title

    if (meta_description) {
      let descTag = document.querySelector('meta[name="description"]')
      if (!descTag) {
        descTag = document.createElement("meta")
        descTag.setAttribute("name", "description")
        document.head.appendChild(descTag)
      }
      descTag.setAttribute("content", meta_description)
    }
  }, [content])

  // Код аналитики (Яндекс.Метрика, Google Analytics и т.д.) — только на лендинге
  useEffect(() => {
    const code = content?.settings?.analytics_head?.trim()
    if (!code) return

    const container = document.createElement("div")
    container.setAttribute("data-analytics-landing", "true")

    const template = document.createElement("template")
    template.innerHTML = code

    const injected: Node[] = []
    template.content.childNodes.forEach((node) => {
      if (node.nodeName === "SCRIPT") {
        const src = node as HTMLScriptElement
        const script = document.createElement("script")
        Array.from(src.attributes).forEach((attr) => script.setAttribute(attr.name, attr.value))
        script.text = src.text
        document.head.appendChild(script)
        injected.push(script)
      } else {
        const clone = node.cloneNode(true)
        document.head.appendChild(clone)
        injected.push(clone)
      }
    })

    return () => {
      injected.forEach((node) => node.parentNode?.removeChild(node))
    }
  }, [content])

  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Philosophy />
      <Projects />
      <Expertise />
      <FAQ />
      <CallToAction />
      <Footer />
    </main>
  )
}