import { ReactNode, useEffect } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

interface LegalLayoutProps {
  title: string
  description: string
  updatedAt: string
  children: ReactNode
}

export function LegalLayout({ title, description, updatedAt, children }: LegalLayoutProps) {
  useEffect(() => {
    document.title = `${title} — FixKey`

    const desc = document.querySelector('meta[name="description"]')
    if (desc) desc.setAttribute("content", description)

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement("link")
      canonical.setAttribute("rel", "canonical")
      document.head.appendChild(canonical)
    }
    canonical.setAttribute("href", window.location.origin + window.location.pathname)

    window.scrollTo(0, 0)
  }, [title, description])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">{title}</h1>
            <p className="text-sm text-muted-foreground mb-12">Редакция от {updatedAt}</p>
            <div className="legal-content space-y-6 text-muted-foreground leading-relaxed">
              {children}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="pt-4">
      <h2 className="text-xl font-medium text-foreground mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 pl-5">
      {items.map((item, i) => (
        <li key={i} className="list-disc marker:text-[#D4AF37]">
          {item}
        </li>
      ))}
    </ul>
  )
}
