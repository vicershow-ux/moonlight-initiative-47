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