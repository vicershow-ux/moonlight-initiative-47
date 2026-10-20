import { LeadForm } from "@/components/LeadForm"
import Icon from "@/components/ui/icon"
import { reachGoal } from "@/lib/metrika"
import { ServiceLandingMeta } from "@/lib/serviceLanding"
import { getServiceFaq } from "@/lib/serviceFaq"

interface Props {
  meta: ServiceLandingMeta
  faq: ReturnType<typeof getServiceFaq>
  phone: string
  phoneHref: string
  others: ServiceLandingMeta[]
}

export function ServiceLandingBottom({ meta, faq, phone, phoneHref, others }: Props) {
  return (
    <>
      <section className="pb-20 md:pb-28">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-3">
              Частые вопросы
            </h2>
            <p className="text-muted-foreground mb-10">
              Собрали то, что чаще всего спрашивают до начала работ.
            </p>

            <div className="divide-y divide-border border-y border-border">
              {faq.map((item, i) => (
                <details key={item.question} className="group py-5" open={i === 0}>
                  <summary className="flex items-start justify-between gap-6 cursor-pointer list-none">
                    <h3 className="text-base md:text-lg font-medium pr-4">{item.question}</h3>
                    <Icon
                      name="Plus"
                      size={20}
                      className="shrink-0 mt-0.5 text-[#D4AF37] transition-transform duration-300 group-open:rotate-45"
                    />
                  </summary>
                  <p className="text-muted-foreground leading-relaxed mt-4 pr-10">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="zayavka" className="py-24 md:py-28 bg-foreground text-primary-foreground">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-primary-foreground/60 text-sm tracking-[0.3em] uppercase mb-8">
              Заявка
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.1] tracking-tight mb-8 text-balance">
              Нужны {meta.category.toLowerCase()}?
            </h2>
            <p className="text-primary-foreground/70 text-lg leading-relaxed mb-12 max-w-2xl mx-auto">
              Оставьте заявку на бесплатный замер — рассчитаем смету и сроки в течение 24 часов.
            </p>

            <LeadForm
              formName={`Услуга — ${meta.category}`}
              commentPlaceholder={`Что нужно сделать: ${meta.navLabel.toLowerCase()}`}
            />

            <p className="text-primary-foreground/50 text-sm mt-8">
              Или позвоните:{" "}
              <a
                href={phoneHref}
                onClick={() => reachGoal("phone_click", { mesto: meta.category })}
                className="hover:text-[#D4AF37] transition-colors"
              >
                {phone}
              </a>
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-10">
            Другие направления
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {others.map((c) => (
              <a
                key={c.slug}
                href={`/uslugi/${c.slug}`}
                className="group p-5 rounded-xl border border-border hover:border-[#D4AF37] transition-colors"
              >
                <Icon
                  name={c.icon}
                  fallback="Wrench"
                  size={20}
                  className="text-[#D4AF37] mb-3"
                />
                <p className="font-medium mb-1 group-hover:text-[#D4AF37] transition-colors">
                  {c.navLabel}
                </p>
                <p className="text-sm text-muted-foreground">{c.category}</p>
              </a>
            ))}
          </div>
          <a
            href="/uslugi"
            className="inline-flex items-center gap-2 mt-8 text-sm hover:text-[#D4AF37] transition-colors"
          >
            Все услуги
            <Icon name="ArrowRight" size={16} />
          </a>
        </div>
      </section>
    </>
  )
}

export default ServiceLandingBottom
