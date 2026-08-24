import { useEffect } from "react"
import { Header } from "../components/Header"
import { Hero } from "../components/Hero"
import { Philosophy } from "../components/Philosophy"
import { Projects } from "../components/Projects"
import { Expertise } from "../components/Expertise"
import { Calculator } from "../components/Calculator"
import { FAQ } from "../components/FAQ"
import { CallToAction } from "../components/CallToAction"
import { Footer } from "../components/Footer"
import { useSiteContent } from "@/hooks/useSiteContent"

export default function Index() {
  const { content } = useSiteContent()

  useEffect(() => {
    if (!content) return
    const s = content.settings
    const { meta_title, meta_description } = s

    if (meta_title) document.title = meta_title

    const setMeta = (attr: "name" | "property", key: string, value: string) => {
      if (!value) return
      let tag = document.querySelector(`meta[${attr}="${key}"]`)
      if (!tag) {
        tag = document.createElement("meta")
        tag.setAttribute(attr, key)
        document.head.appendChild(tag)
      }
      tag.setAttribute("content", value)
    }

    document.querySelector('meta[name="robots"]')?.remove()

    setMeta("name", "description", meta_description)
    setMeta("name", "keywords", s.meta_keywords || "")
    setMeta("name", "geo.placename", s.seo_region || "")

    setMeta("property", "og:type", "website")
    setMeta("property", "og:title", meta_title)
    setMeta("property", "og:description", meta_description)
    setMeta("property", "og:url", window.location.origin)
    setMeta("property", "og:image", s.og_image || s.logo_url || "")

    setMeta("name", "twitter:card", "summary_large_image")
    setMeta("name", "twitter:title", meta_title)
    setMeta("name", "twitter:description", meta_description)
    setMeta("name", "twitter:image", s.og_image || s.logo_url || "")

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement("link")
      canonical.setAttribute("rel", "canonical")
      document.head.appendChild(canonical)
    }
    canonical.setAttribute("href", window.location.origin + window.location.pathname)

    const origin = window.location.origin
    const org = {
      "@context": "https://schema.org",
      "@type": "HomeAndConstructionBusiness",
      name: s.brand_name || "FixKey",
      description: meta_description,
      url: origin,
      image: s.og_image || `${origin}/logo-224.png`,
      logo: `${origin}/logo-224.png`,
      ...(s.phone ? { telephone: s.phone } : {}),
      ...(s.email ? { email: s.email } : {}),
      ...(s.seo_region
        ? {
            address: {
              "@type": "PostalAddress",
              addressLocality: s.seo_region.split(",")[0].trim(),
              addressRegion: s.seo_region,
              addressCountry: "RU",
            },
            areaServed: s.seo_region,
          }
        : {}),
      ...(s.telegram_url || s.max_url
        ? { sameAs: [s.telegram_url, s.max_url].filter(Boolean) }
        : {}),
    }

    const graph: object[] = [org]

    const faqItems = (content.faq || []).filter((f) => f.question && f.answer)
    if (faqItems.length > 0) {
      graph.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      })
    }

    let ld = document.getElementById("site-jsonld")
    if (!ld) {
      ld = document.createElement("script")
      ld.id = "site-jsonld"
      ld.setAttribute("type", "application/ld+json")
      document.head.appendChild(ld)
    }
    ld.textContent = JSON.stringify(graph)
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
      <Calculator />
      <FAQ />
      <CallToAction />
      <Footer />
    </main>
  )
}