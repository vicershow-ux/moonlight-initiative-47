import { HighlightedText } from "./HighlightedText"
import { LeadForm } from "./LeadForm"
import { useSiteContent } from "@/hooks/useSiteContent"

export function CallToAction() {
  const { content } = useSiteContent()
  const s = content?.settings
  const ctaEyebrow = s?.cta_eyebrow || "Начать ремонт"
  const ctaTitleLine1 = s?.cta_title_line1 || "Готовы сделать"
  const ctaTitleHighlight = s?.cta_title_highlight || "без забот"
  const ctaDescription =
    s?.cta_description || "Оставьте заявку на бесплатный замер — рассчитаем смету и сроки в течение 24 часов."
  const phone = s?.phone || "+7 (495) 123-45-67"
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`

  return (
    <section id="contact" className="py-32 md:py-29 bg-foreground text-primary-foreground">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-primary-foreground/60 text-sm tracking-[0.3em] uppercase mb-8">{ctaEyebrow}</p>

          <h2 className="text-3xl md:text-4xl lg:text-6xl font-medium leading-[1.1] tracking-tight mb-8 text-balance">
            {ctaTitleLine1}
            <br />
            ремонт <HighlightedText>{ctaTitleHighlight}</HighlightedText>?
          </h2>

          <p className="text-primary-foreground/70 text-lg md:text-xl leading-relaxed mb-12 max-w-2xl mx-auto">
            {ctaDescription}
          </p>

          <LeadForm />

          <p className="text-primary-foreground/50 text-sm mt-8">
            Или позвоните: <a href={phoneHref} className="hover:text-primary-foreground transition-colors">{phone}</a>
          </p>
        </div>
      </div>
    </section>
  )
}
