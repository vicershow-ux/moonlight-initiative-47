import { useState } from "react"
import { Plus } from "lucide-react"
import { useSiteContent } from "@/hooks/useSiteContent"

const defaultFaqs = [
  {
    question: "В каких регионах вы работаете?",
    answer:
      "Компания базируется в Москве, но мы реализуем проекты по всей России. Собираем бригаду и логистику под конкретный город и объект.",
  },
  {
    question: "Сколько времени занимает ремонт?",
    answer:
      "Сроки зависят от площади и объёма работ. Типичная квартира 50-70 м² под ключ занимает от 6 до 10 недель. Точный график фиксируем в договоре до начала работ.",
  },
  {
    question: "Из чего складывается смета?",
    answer:
      "Смета формируется из работ и материалов по факту замера объекта, без скрытых статей. Вы видите цену каждой позиции и подтверждаете её до старта.",
  },
  {
    question: "Какие услуги вы предоставляете?",
    answer:
      "Полный цикл ремонта: демонтаж, черновые работы, инженерные системы, чистовая отделка, а также дизайн-проект и закупку материалов при необходимости.",
  },
  {
    question: "Даёте ли вы гарантию на работы?",
    answer:
      "Да, гарантия на все виды работ фиксируется в договоре — от 1 до 3 лет в зависимости от типа работ. При выявлении дефектов устраняем их за свой счёт.",
  },
  {
    question: "Как начать сотрудничество?",
    answer:
      "Начните с бесплатного замера объекта, где мы обсудим объём работ, бюджет и сроки. После этого подготовим детальную смету и договор с фиксированными условиями.",
  },
]

export function FAQ() {
  const { content } = useSiteContent()
  const faqEyebrow = content?.settings?.faq_eyebrow || "Вопросы"
  const faqTitle = content?.settings?.faq_title || "Частые вопросы"
  const faqs = content?.faq?.length ? content.faq : defaultFaqs

  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-20 md:py-29">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-3xl mb-16">
          <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6">{faqEyebrow}</p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-medium leading-[1.15] tracking-tight mb-6 text-balance lg:text-7xl">
            {faqTitle}
          </h2>
        </div>

        <div>
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-border">
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full py-6 flex items-start justify-between gap-6 text-left group"
              >
                <span className="text-lg font-medium text-foreground transition-colors group-hover:text-foreground/70">
                  {faq.question}
                </span>
                <Plus
                  className={`w-6 h-6 text-foreground flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-45" : "rotate-0"
                  }`}
                  strokeWidth={1.5}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-muted-foreground leading-relaxed pb-6 pr-12">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}