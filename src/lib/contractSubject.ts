/**
 * Вид работ по договору. «Ремонт квартиры» — исходный вариант,
 * остальные — направления услуг с сайта (категории прайса)
 */
export const RENOVATION = "ремонт квартиры"

/** Склонение названия услуги для «Договор подряда на …»: «Электромонтажные работы» → «электромонтажные работы» */
export function subjectTitle(subject?: string | null): string {
  const s = (subject || "").trim()
  if (!s || s === RENOVATION) return RENOVATION
  // Название категории — существительное в им. падеже. «на + вин. падеж» для неодушевлённых совпадает с ним
  const fixes: Record<string, string> = {
    "Отопление": "монтаж отопления",
    "Благоустройство": "благоустройство территории",
    "Вентиляция и кондиционирование": "монтаж вентиляции и кондиционирования",
    "Устройство полов": "устройство полов",
  }
  return fixes[s] || s.charAt(0).toLowerCase() + s.slice(1)
}

export const contractTitle = (subject?: string | null) => `Договор подряда на ${subjectTitle(subject)}`

/** Текст пункта 1.1 о том, какие работы выполняются */
export function subjectWorks(subject?: string | null): { works: string; place: string } {
  const s = (subject || "").trim()
  if (!s || s === RENOVATION) return { works: "ремонтно-отделочные работы", place: "в квартире" }
  return { works: `работы по направлению «${s}»`, place: "на объекте" }
}

/** Заголовок из сохранённого HTML, если вид работ в настройках не сохранён (старые договоры) */
export function titleFromHtml(html?: string | null): string | null {
  const m = /Договор подряда на ([^<№]+?)\s*№/.exec(html || "")
  return m ? `Договор подряда на ${m[1].trim()}` : null
}
