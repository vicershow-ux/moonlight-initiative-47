import { useEffect, useRef, useState } from "react"
import { HighlightedText } from "./HighlightedText"
import { useSiteContent } from "@/hooks/useSiteContent"

const defaultPhilosophyItems = [
  {
    title: "Прозрачная смета",
    description:
      "Фиксируем каждую позицию до начала работ. Никаких скрытых доплат — вы всегда знаете, за что платите.",
  },
  {
    title: "Контроль на каждом этапе",
    description:
      "Прораб и менеджер сопровождают проект от демонтажа до финальной уборки, с фотоотчётами на каждом шаге.",
  },
  {
    title: "Проверенные бригады",
    description:
      "Работаем только со штатными мастерами с опытом от 5 лет. Гарантия на все виды работ — в договоре.",
  },
  {
    title: "Соблюдение сроков",
    description: "Строим реалистичный график и держим его. Если задерживаем — компенсируем неустойкой по договору.",
  },
]

export function Philosophy() {
  const { content } = useSiteContent()
  const s = content?.settings
  const aboutEyebrow = s?.about_eyebrow || "О компании"
  const aboutTitleLine1 = s?.about_title_line1 || "Ремонт с"
  const aboutTitleHighlight = s?.about_title_highlight || "гарантией"
  const aboutDescription =
    s?.about_description ||
    "FixKey — команда, которая берёт на себя весь ремонт под ключ: от демонтажа до сдачи объекта. Мы отвечаем за результат договором и гарантией."
  const aboutImage = s?.about_image || "/img/exterior.webp"
  const philosophyItems = content?.philosophy?.length ? content.philosophy : defaultPhilosophyItems

  const [visibleItems, setVisibleItems] = useState<number[]>([])
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
      { threshold: 0.3 },
    )

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section id="about" className="py-32 md:py-29">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left column - Title and image */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6">{aboutEyebrow}</p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-medium leading-[1.15] tracking-tight mb-6 text-balance lg:text-8xl">
              {aboutTitleLine1}
              <br />
              <HighlightedText>{aboutTitleHighlight}</HighlightedText>
            </h2>

            <div className="relative hidden lg:block">
              <img
                src={aboutImage}
                alt="Ремонт квартиры под ключ"
                className="opacity-90 relative z-10 w-auto"
              />
            </div>
          </div>

          {/* Right column - Description and Philosophy items */}
          <div className="space-y-6 lg:pt-48">
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md mb-12">
              {aboutDescription}
            </p>

            {philosophyItems.map((item, index) => (
              <div
                key={index}
                ref={(el) => {
                  itemRefs.current[index] = el
                }}
                data-index={index}
                className={`transition-all duration-700 ${
                  visibleItems.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-6">
                  <span className="text-muted-foreground/50 text-sm font-medium">0{index + 1}</span>
                  <div>
                    <h3 className="text-xl font-medium mb-3">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}