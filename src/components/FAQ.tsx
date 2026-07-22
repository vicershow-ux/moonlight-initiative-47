import { useState } from "react"
import { Plus } from "lucide-react"

const faqs = [
  {
    question: "В каких регионах вы работаете?",
    answer:
      "Наша студия базируется в Москве, но мы реализуем проекты по всей России и в ближнем зарубежье. Мы верим в создание архитектуры, которая откликается на свой конкретный контекст и сообщество.",
  },
  {
    question: "Сколько времени занимает проектирование?",
    answer:
      "Сроки зависят от масштаба и сложности проекта. Типичный жилой объект занимает от 6 до 12 месяцев от первоначальной концепции до проектной документации. Мы тесно работаем с клиентами, чтобы установить реалистичные сроки для продуманной разработки дизайна.",
  },
  {
    question: "Как вы подходите к экологичному проектированию?",
    answer:
      "Устойчивое развитие - неотъемлемая часть нашей практики, а не дополнительная опция. Мы отдаем приоритет пассивным стратегиям проектирования, выбору материалов, энергоэффективности и долговечности. Каждый проект разрабатывается с минимальным воздействием на окружающую среду при максимальном комфорте и связи с природой.",
  },
  {
    question: "Какие услуги вы предоставляете?",
    answer:
      "Мы предоставляем полный спектр архитектурных услуг, включая мастер-планирование, эскизное проектирование, разработку дизайна, подготовку проектной документации и авторский надзор. Мы можем адаптировать наши услуги под конкретные потребности вашего проекта.",
  },
  {
    question: "Работаете ли вы с существующими зданиями?",
    answer:
      "Безусловно. Нам нравится сложность проектов адаптивного повторного использования и реконструкции. Будь то историческая реставрация или современная пристройка, мы подходим к существующим строениям с уважением, привнося их в диалог с современной жизнью.",
  },
  {
    question: "Как начать сотрудничество?",
    answer:
      "Начните с первичной консультации, где мы обсудим ваше видение, участок, бюджет и сроки. Это поможет нам понять, подходим ли мы для вашего проекта. После этого мы подготовим индивидуальное техническое задание и коммерческое предложение.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-20 md:py-29">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-3xl mb-16">
          <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6">Вопросы</p>
          <h2 className="text-6xl font-medium leading-[1.15] tracking-tight mb-6 text-balance lg:text-7xl">
            Частые вопросы
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
