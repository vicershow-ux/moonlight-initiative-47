import { HighlightedText } from "./HighlightedText"
import { LeadForm } from "./LeadForm"

export function CallToAction() {
  return (
    <section id="contact" className="py-32 md:py-29 bg-foreground text-primary-foreground">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-primary-foreground/60 text-sm tracking-[0.3em] uppercase mb-8">Начать ремонт</p>

          <h2 className="text-3xl md:text-4xl lg:text-6xl font-medium leading-[1.1] tracking-tight mb-8 text-balance">
            Готовы сделать
            <br />
            ремонт <HighlightedText>без забот</HighlightedText>?
          </h2>

          <p className="text-primary-foreground/70 text-lg md:text-xl leading-relaxed mb-12 max-w-2xl mx-auto">
            Оставьте заявку на бесплатный замер — рассчитаем смету и сроки в течение 24 часов.
          </p>

          <LeadForm />

          <p className="text-primary-foreground/50 text-sm mt-8">
            Или позвоните: <a href="tel:+74951234567" className="hover:text-primary-foreground transition-colors">+7 (495) 123-45-67</a>
          </p>
        </div>
      </div>
    </section>
  )
}