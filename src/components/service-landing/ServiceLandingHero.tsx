import { HighlightedText } from "@/components/HighlightedText"
import Icon from "@/components/ui/icon"
import { serviceImage } from "@/lib/serviceImages"
import { reachGoal } from "@/lib/metrika"
import { ServiceLandingMeta } from "@/lib/serviceLanding"
import { usePageSeo } from "@/hooks/usePageSeo"
import { formatPrice } from "./formatPrice"


interface Props {
  meta: ServiceLandingMeta
  customSeo: ReturnType<typeof usePageSeo>
  phone: string
  phoneHref: string
  loading: boolean
  itemsCount: number
  minPrice: number
}

export function ServiceLandingHero({ meta, customSeo, phone, phoneHref, loading, itemsCount, minPrice }: Props) {
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-20">
      <div className="container mx-auto px-6 md:px-12">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <a href="/" className="hover:text-[#D4AF37] transition-colors">
            Главная
          </a>
          <Icon name="ChevronRight" size={14} />
          <a href="/uslugi" className="hover:text-[#D4AF37] transition-colors">
            Услуги
          </a>
          <Icon name="ChevronRight" size={14} />
          <span className="text-foreground">{meta.navLabel}</span>
        </nav>

        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-start">
          <div>
            <div className="inline-flex items-center gap-2.5 mb-6 text-sm text-muted-foreground">
              <span className="w-9 h-9 rounded-full bg-[#D4AF37]/15 flex items-center justify-center">
                <Icon name={meta.icon} fallback="Wrench" size={17} className="text-[#D4AF37]" />
              </span>
              {meta.category}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.15] tracking-tight mb-6 text-balance">
              {(customSeo?.h1_title || meta.h1).replace(" в Хабаровске", "")}{" "}
              <HighlightedText>в Хабаровске</HighlightedText>
            </h1>

            <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-2xl">
              {customSeo?.intro_text || meta.intro}
            </p>

            <ul className="space-y-3 mb-10">
              {meta.benefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm md:text-base">
                  <Icon name="Check" size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{b}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#zayavka"
                className="inline-flex items-center gap-2 text-sm px-6 py-3 rounded-full bg-[#D4AF37] text-[#161616] font-medium hover:bg-[#B8860B] transition-colors"
              >
                Оставить заявку
                <Icon name="ArrowRight" size={16} />
              </a>
              <a
                href={phoneHref}
                onClick={() => reachGoal("phone_click", { mesto: meta.category })}
                className="text-sm text-muted-foreground hover:text-[#D4AF37] transition-colors"
              >
                Или позвоните: {phone}
              </a>
            </div>
          </div>

          <div className="w-full flex flex-col gap-5">
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#161616] group">
            <img
              src={serviceImage(meta.slug)}
              alt={meta.category}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs">
              <Icon name={meta.icon} fallback="Wrench" size={14} className="text-[#D4AF37]" />
              {meta.navLabel}
            </span>
          </div>
          <div className="bg-foreground text-primary-foreground rounded-2xl p-6 md:p-8 w-full">
            <p className="text-primary-foreground/60 text-xs tracking-[0.2em] uppercase mb-4">
              Кратко
            </p>
            <div className="space-y-5 text-sm">
              <div className="flex items-start justify-between gap-4">
                <span className="text-primary-foreground/60">Позиций в прайсе</span>
                <span className="font-medium">{loading ? "…" : itemsCount}</span>
              </div>
              {minPrice > 0 && (
                <div className="flex items-start justify-between gap-4">
                  <span className="text-primary-foreground/60">Цены от</span>
                  <span className="font-medium">{formatPrice(minPrice)} ₽</span>
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <span className="text-primary-foreground/60">Гарантия</span>
                <span className="font-medium">3 года</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-primary-foreground/60">Смета</span>
                <span className="font-medium">Фиксируем до старта</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-primary-foreground/60">Выезд на замер</span>
                <span className="font-medium">Бесплатно</span>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServiceLandingHero
