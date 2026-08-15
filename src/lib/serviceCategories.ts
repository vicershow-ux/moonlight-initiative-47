import { useEffect, useMemo, useState } from "react"
import { servicesApi, ServiceItem } from "@/lib/api"

export const CATEGORY_SUGGESTIONS = [
  "Демонтажные работы",
  "Подготовительные работы",
  "Черновые отделочные работы",
  "Чистовые отделочные работы",
  "Плиточные работы",
  "Устройство полов",
  "Потолочные работы",
  "Гипсокартонные работы",
  "Кладочные работы",
  "Бетонные работы",
  "Столярные работы",
  "Электромонтажные работы",
  "Сантехнические работы",
]

export const SUBCATEGORY_SUGGESTIONS = [
  "Полы",
  "Стены",
  "Потолки",
  "Санузел",
  "Проёмы",
  "Инженерия",
]

const sortRu = (a: string, b: string) => a.localeCompare(b, "ru")

export function useServiceCategories(category?: string) {
  const [services, setServices] = useState<ServiceItem[]>([])

  useEffect(() => {
    let alive = true
    servicesApi
      .list()
      .then((res) => {
        if (alive) setServices(res.services || [])
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const categories = useMemo(() => {
    const used = services.map((s) => (s.category || "").trim()).filter(Boolean)
    return Array.from(new Set([...used.sort(sortRu), ...CATEGORY_SUGGESTIONS]))
  }, [services])

  const subcategories = useMemo(() => {
    const cat = (category || "").trim().toLowerCase()
    const inCategory = services
      .filter((s) => !cat || (s.category || "").trim().toLowerCase() === cat)
      .map((s) => (s.subcategory || "").trim())
      .filter(Boolean)
      .sort(sortRu)

    const others = services
      .map((s) => (s.subcategory || "").trim())
      .filter(Boolean)
      .sort(sortRu)

    return Array.from(new Set([...inCategory, ...others, ...SUBCATEGORY_SUGGESTIONS]))
  }, [services, category])

  return { categories, subcategories }
}
