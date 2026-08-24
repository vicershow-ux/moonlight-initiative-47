import { useEffect } from "react"
import { useLocation } from "react-router-dom"

export default function PageNotFound() {
  const location = useLocation()

  useEffect(() => {
    document.title = "Страница не найдена — FixKey"

    const desc = document.querySelector('meta[name="description"]')
    if (desc) {
      desc.setAttribute(
        "content",
        "Запрошенная страница не найдена. Перейдите на главную страницу FixKey — ремонт квартир и домов под ключ в Обнинске и Калужской области.",
      )
    }

    let robots = document.querySelector('meta[name="robots"]')
    if (!robots) {
      robots = document.createElement("meta")
      robots.setAttribute("name", "robots")
      document.head.appendChild(robots)
    }
    robots.setAttribute("content", "noindex, follow")

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement("link")
      canonical.setAttribute("rel", "canonical")
      document.head.appendChild(canonical)
    }
    canonical.setAttribute("href", window.location.origin + "/")
  }, [location.pathname])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#161616] px-6">
      <div className="text-center max-w-md">
        <img
          src="/logo-112.png"
          srcSet="/logo-112.png 1x, /logo-168.png 1.5x, /logo-224.png 2x"
          alt="FixKey"
          width={56}
          height={56}
          className="h-14 w-auto object-contain mx-auto mb-6"
        />
        <h1 className="text-5xl font-bold mb-3 text-white">404</h1>
        <p className="text-lg text-white/60 mb-8">
          Такой страницы не существует. Возможно, она была перемещена или удалена.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm font-medium px-6 py-3 rounded-lg"
        >
          Вернуться на главную
        </a>
      </div>
    </div>
  )
}