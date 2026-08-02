import { useState } from "react"
import { useSiteContent } from "@/hooks/useSiteContent"

const defaultProjects = [
  {
    id: 1,
    title: "Квартира на Тверской",
    category: "Ремонт под ключ",
    location: "Москва, 68 м²",
    year: "2024",
    image: "/img/hously-1.webp",
  },
  {
    id: 2,
    title: "Студия у парка",
    category: "Дизайнерский ремонт",
    location: "Санкт-Петербург, 34 м²",
    year: "2023",
    image: "/img/hously-2.webp",
  },
  {
    id: 3,
    title: "Дом у моря",
    category: "Капитальный ремонт",
    location: "Сочи, 140 м²",
    year: "2023",
    image: "/img/hously-3.webp",
  },
  {
    id: 4,
    title: "Пентхаус на Казанской",
    category: "Ремонт под ключ",
    location: "Казань, 95 м²",
    year: "2024",
    image: "/img/hously-4.webp",
  },
]

export function Projects() {
  const { content } = useSiteContent()
  const projectsEyebrow = content?.settings.projects_eyebrow || "Портфолио"
  const projectsTitle = content?.settings.projects_title || "Наши объекты"
  const projects = content?.projects?.length
    ? content.projects.map((p) => ({ id: p.id, title: p.title, category: p.category, location: p.location, year: p.year, image: p.image_url }))
    : defaultProjects

  const [hoveredId, setHoveredId] = useState<number | null>(null)

  return (
    <section id="projects" className="py-32 md:py-29 bg-secondary/50">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6">{projectsEyebrow}</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight">{projectsTitle}</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {projects.map((project) => (
            <article
              key={project.id}
              className="group cursor-pointer"
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="relative overflow-hidden aspect-[4/3] mb-6">
                <img
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  loading="lazy"
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    hoveredId === project.id ? "scale-105" : "scale-100"
                  }`}
                />
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-medium mb-2 group-hover:underline underline-offset-4">{project.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {project.category} · {project.location}
                  </p>
                </div>
                <span className="text-muted-foreground/60 text-sm">{project.year}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}