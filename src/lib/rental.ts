import { Rental, RentalCounterparty } from "@/lib/api"

export const PERIOD_LABEL: Record<string, string> = {
  day: "сутки",
  week: "неделю",
  month: "месяц",
}

export const PERIOD_SHORT: Record<string, string> = {
  day: "сут.",
  week: "нед.",
  month: "мес.",
}

export const PARTY_LABEL: Record<string, string> = {
  individual: "Физическое лицо",
  entrepreneur: "ИП",
  legal: "Организация",
}

export const money = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(n || 0)) + " ₽"

export const num = (v: unknown) => Number(v || 0)

export function daysBetween(from: string, to: string | null): number {
  if (!from) return 0
  const start = new Date(from)
  const end = to ? new Date(to) : new Date()
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
  const diff = Math.floor((end.getTime() - start.getTime()) / 86400000)
  return Math.max(diff, 1)
}

export function periodsCount(rental: Pick<Rental, "date_from" | "date_to" | "rate_period" | "returned_at">) {
  const end = rental.returned_at || rental.date_to || null
  const days = daysBetween(rental.date_from, end)
  if (rental.rate_period === "week") return Math.ceil(days / 7)
  if (rental.rate_period === "month") return Math.ceil(days / 30)
  return days
}

export function rentalTotal(rental: Pick<Rental, "date_from" | "date_to" | "rate_period" | "returned_at" | "rate" | "qty">) {
  return periodsCount(rental) * num(rental.rate) * num(rental.qty)
}

export function isOverdue(rental: Pick<Rental, "date_to" | "status">) {
  if (rental.status !== "active" || !rental.date_to) return false
  const end = new Date(rental.date_to)
  end.setHours(23, 59, 59, 999)
  return end.getTime() < Date.now()
}

export function daysLeft(dateTo: string | null): number | null {
  if (!dateTo) return null
  const end = new Date(dateTo)
  end.setHours(23, 59, 59, 999)
  return Math.ceil((end.getTime() - Date.now()) / 86400000)
}

export function partyDetails(cp: RentalCounterparty | null | undefined): string[] {
  if (!cp) return []
  const rows: string[] = []

  if (cp.party_kind === "legal" || cp.party_kind === "entrepreneur") {
    if (cp.org_name) rows.push(cp.org_name)
    if (cp.inn) rows.push(`ИНН ${cp.inn}`)
    if (cp.kpp) rows.push(`КПП ${cp.kpp}`)
    if (cp.ogrn) rows.push(`ОГРН ${cp.ogrn}`)
    if (cp.legal_address) rows.push(`Адрес: ${cp.legal_address}`)
    if (cp.bank_name) rows.push(`Банк: ${cp.bank_name}`)
    if (cp.bik) rows.push(`БИК ${cp.bik}`)
    if (cp.account_number) rows.push(`Р/с ${cp.account_number}`)
    if (cp.correspondent_account) rows.push(`К/с ${cp.correspondent_account}`)
  } else {
    if (cp.full_name) rows.push(cp.full_name)
    const passport = [cp.passport_series, cp.passport_number].filter(Boolean).join(" ")
    if (passport) rows.push(`Паспорт: ${passport}`)
    if (cp.passport_issued_by) rows.push(`Выдан: ${cp.passport_issued_by}`)
    if (cp.passport_issued_date) {
      rows.push(`Дата выдачи: ${new Date(cp.passport_issued_date).toLocaleDateString("ru-RU")}`)
    }
    if (cp.passport_department_code) rows.push(`Код подразделения: ${cp.passport_department_code}`)
    if (cp.registration_address) rows.push(`Прописка: ${cp.registration_address}`)
  }

  if (cp.phone) rows.push(`Тел.: ${cp.phone}`)
  if (cp.email) rows.push(`Email: ${cp.email}`)
  return rows
}

export function counterpartyReady(cp: Partial<RentalCounterparty>): string[] {
  const missing: string[] = []
  if (cp.party_kind === "legal" || cp.party_kind === "entrepreneur") {
    if (!cp.org_name?.trim()) missing.push("название организации")
    if (!cp.inn?.trim()) missing.push("ИНН")
    if (!cp.legal_address?.trim()) missing.push("юридический адрес")
  } else {
    if (!cp.full_name?.trim()) missing.push("ФИО полностью")
    if (!cp.passport_series?.trim() || !cp.passport_number?.trim()) missing.push("серия и номер паспорта")
    if (!cp.passport_issued_by?.trim()) missing.push("кем выдан паспорт")
    if (!cp.registration_address?.trim()) missing.push("адрес регистрации")
  }
  return missing
}
