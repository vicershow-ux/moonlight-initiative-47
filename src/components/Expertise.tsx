import { useEffect, useRef, useState } from "react"
import { Home, Building, Armchair, Trees, ArrowRight } from "lucide-react"
import { HighlightedText } from "./HighlightedText"
import { useSiteContent } from "@/hooks/useSiteContent"
import { useServiceLandings } from "@/hooks/useServiceLandings"

const iconMap: Record<string, typeof Home> = { Home, Building, Armchair, Trees }

const defaultExpertiseAreas = [
  {
    title: "Ремонт квартир под ключ",
    description: "Берём на себя весь цикл: демонтаж, черновые работы, чистовая отделка, сдача объекта с фотоотчётом.",
    icon: "Home",
  },
  {
    title: "Ремонт коммерческих помещений",
    description:
      "Офисы, магазины, шоу-румы — работаем в сжатые сроки, не останавливая бизнес заказчика дольше необходимого.",
    icon: "Building",
  },
  {
    title: "Дизайн-проект интерьера",
    description:
      "Разрабатываем визуализацию и рабочую документацию, чтобы результат совпал с ожиданиями до начала работ.",
    icon: "Armchair",
  },
  {
    title: "Комплексное снабжение",
    description:
      "Закупаем материалы и технику по вашему бюджету напрямую у поставщиков — без переплат и простоев на объекте.",
    icon: "Trees",
  },
]

export function Expertise() {
  const { content } = useSiteContent()
  const { landings } = useServiceLandings()
  const s = content?.settings
  const servicesEyebrow = s?.services_eyebrow || "Наши услуги"
  const servicesTitleHighlight = s?.services_title_highlight || "Опыт"
  const servicesTitleRest = s?.services_title_rest || ", проверенный сотнями объектов"
  const servicesDescription =
    s?.services_description ||
    "Каждый проект курирует прораб с профильным образованием и опытом от 5 лет — от первого замера до сдачи ключей."
  const expertiseAreas = content?.expertise?.length ? content.expertise : defaultExpertiseAreas

  const [visibleItems, setVisibleItems] = useState<number[]>([])
  const sectionRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-index"))
          if (entry.isIntersecting) {
            setVisibleItems((prev) => [...new Set([...prev, index])])
          }
        })
      },
      { threshold: 0.15 },
    )

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    const fallback = setTimeout(() => {
      setVisibleItems(expertiseAreas.map((_, i) => i))
    }, 2500)

    return () => {
      observer.disconnect()
      clearTimeout(fallback)
    }
  }, [expertiseAreas.length])

  return (
    <section id="services" ref={sectionRef} className="py-32 md:py-29">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-3xl mb-20">
          <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6">{servicesEyebrow}</p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-medium leading-[1.15] tracking-tight mb-6 text-balance lg:text-8xl">
            <HighlightedText>{servicesTitleHighlight}</HighlightedText>{servicesTitleRest}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {servicesDescription}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
          {expertiseAreas.map((area, index) => {
            const Icon = iconMap[area.icon] || Home
            return (
              <div
                key={index}
                ref={(el) => {
                  itemRefs.current[index] = el
                }}
                data-index={index}
                className={`relative pl-8 border-l border-border transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  visibleItems.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 180}ms` }}
              >
                <div
                  className={`transition-all duration-1000 ${
                    visibleItems.includes(index) ? "animate-draw-stroke" : ""
                  }`}
                  style={{
                    transitionDelay: `${index * 150}ms`,
                  }}
                >
                  <Icon className="w-10 h-10 mb-4 text-foreground" strokeWidth={1.25} />
                </div>
                <h3 className="text-xl font-medium mb-4">{area.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{area.description}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-16 pt-12 border-t border-border">
          <p className="text-muted-foreground mb-6">
            Работаем и по отдельным направлениям — с открытым прайсом на каждую позицию:
          </p>
          <div className="flex flex-wrap gap-3">
            {landings.map((c) => (
              <a
                key={c.slug}
                href={`/uslugi/${c.slug}`}
                className="text-sm px-4 py-2 rounded-full border border-border hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
              >
                {c.category}
              </a>
            ))}
          </div>
          <a
            href="/uslugi"
            className="inline-flex items-center gap-2 mt-8 text-sm hover:text-[#D4AF37] transition-colors"
          >
            Все услуги и цены
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  )
}