const UNITS_M = ["", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"]
const UNITS_F = ["", "одна", "две", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"]
const TEENS = [
  "десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать",
  "пятнадцать", "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать",
]
const TENS = ["", "", "двадцать", "тридцать", "сорок", "пятьдесят", "шестьдесят", "семьдесят", "восемьдесят", "девяносто"]
const HUNDREDS = ["", "сто", "двести", "триста", "четыреста", "пятьсот", "шестьсот", "семьсот", "восемьсот", "девятьсот"]

function threeDigitWords(n: number, feminine = false): string[] {
  const words: string[] = []
  const h = Math.floor(n / 100)
  const rem = n % 100
  if (h) words.push(HUNDREDS[h])
  if (rem >= 10 && rem < 20) {
    words.push(TEENS[rem - 10])
  } else {
    const t = Math.floor(rem / 10)
    const u = rem % 10
    if (t) words.push(TENS[t])
    if (u) words.push((feminine ? UNITS_F : UNITS_M)[u])
  }
  return words
}

function pluralize(n: number, forms: [string, string, string]): string {
  const n100 = n % 100
  if (n100 >= 11 && n100 <= 19) return forms[2]
  const n10 = n % 10
  if (n10 === 1) return forms[0]
  if (n10 >= 2 && n10 <= 4) return forms[1]
  return forms[2]
}

const SCALES: [number, boolean, [string, string, string]][] = [
  [10 ** 9, true, ["миллиард", "миллиарда", "миллиардов"]],
  [10 ** 6, true, ["миллион", "миллиона", "миллионов"]],
  [10 ** 3, false, ["тысяча", "тысячи", "тысяч"]],
]

export function numberToWordsRu(n: number): string {
  if (n === 0) return "ноль"
  let remaining = n
  const parts: string[] = []
  for (const [scaleVal, feminine, forms] of SCALES) {
    if (remaining >= scaleVal) {
      const count = Math.floor(remaining / scaleVal)
      remaining %= scaleVal
      parts.push(...threeDigitWords(count, feminine))
      parts.push(pluralize(count, forms))
    }
  }
  if (remaining) parts.push(...threeDigitWords(remaining, false))
  return parts.join(" ")
}

export function moneyWordsRu(amount: number): string {
  const n = Math.round(amount || 0)
  const words = numberToWordsRu(n)
  const rubleWord = pluralize(n, ["рубль", "рубля", "рублей"])
  const formatted = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n)
  return `${formatted} (${words} ${rubleWord})`
}

// Только пропись со словом «рублей», без числа (для шаблонов вида "1000 рублей (одна тысяча рублей)")
export function moneyInWords(amount: number): string {
  const n = Math.round(amount || 0)
  const words = numberToWordsRu(n)
  const rubleWord = pluralize(n, ["рубль", "рубля", "рублей"])
  return `${words} ${rubleWord}`
}

const MONTH_FORMS: [string, string, string] = ["месяц", "месяца", "месяцев"]

export function monthsWordsRu(n: number): string {
  const words = numberToWordsRu(n)
  return `${n} (${words}) ${pluralize(n, MONTH_FORMS)}`
}

const DURATION_UNIT_FORMS: Record<string, [string, string, string]> = {
  months: ["месяц", "месяца", "месяцев"],
  working_days: ["рабочий день", "рабочих дня", "рабочих дней"],
  calendar_days: ["календарный день", "календарных дня", "календарных дней"],
}

// Пропись срока с указанием единицы: "6 (шесть) месяцев", "10 (десять) рабочих дней"
export function durationWordsRu(n: number, unit: string): string {
  const forms = DURATION_UNIT_FORMS[unit] || DURATION_UNIT_FORMS.months
  const words = numberToWordsRu(n)
  return `${n} (${words}) ${pluralize(n, forms)}`
}

// Пропись срока без числа: "шесть месяцев", "десять рабочих дней" — для вставки в скобки
export function durationWordsOnlyRu(n: number, unit: string): string {
  const forms = DURATION_UNIT_FORMS[unit] || DURATION_UNIT_FORMS.months
  const words = numberToWordsRu(n)
  return `${words} ${pluralize(n, forms)}`
}

// Только слово единицы во множественном родительном (для лейблов селекта): "месяцев" и т.п.
export function durationUnitLabel(unit: string): string {
  const forms = DURATION_UNIT_FORMS[unit] || DURATION_UNIT_FORMS.months
  return forms[2]
}