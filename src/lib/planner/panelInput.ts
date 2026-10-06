import {
  DEFAULT_PANEL,
  INPUT_DEVICE_INFO,
  InputDevice,
  InputDeviceKind,
  PanelSettings,
  breakerAmps,
} from "./types"

const uid = () => Math.random().toString(36).slice(2, 10)

/**
 * Настройки щита с переносом старого формата. Раньше ввод задавался полями
 * «вводной автомат» и «противопожарное УЗО» — превращаем их в список аппаратов,
 * чтобы у старых проектов схема не поменялась
 */
export function panelSettings(p?: Partial<PanelSettings> | null): PanelSettings {
  const base: PanelSettings = { ...DEFAULT_PANEL, ...(p || {}) }
  // Старый формат узнаём по его полям — пустые настройки получают ввод по умолчанию
  const legacy = p && !Array.isArray(p.devices) && (p.inputBreaker !== undefined || p.mainRcd !== undefined)
  if (legacy) {
    const devices: InputDevice[] = []
    const amps = breakerAmps(p.inputBreaker || "C40") || 40
    const curve = (String(p.inputBreaker || "C").match(/[BCD]/)?.[0] || "C") as "B" | "C" | "D"
    devices.push({ id: "in-qf", kind: "breaker", rating: amps, curve })
    if (p.mainRcd) devices.push({ id: "in-rcd", kind: "rcd", rating: rcdRating(amps), leakage: p.mainRcd })
    base.devices = devices
  }
  return base
}

/** Номинал УЗО — ближайший стандартный не меньше заданного тока */
export const rcdRating = (amps: number) => [16, 25, 40, 63, 80, 100].find((x) => x >= amps) ?? 100

export const newInputDevice = (kind: InputDeviceKind, afterAmps = 40): InputDevice => {
  const info = INPUT_DEVICE_INFO[kind]
  const fit = info.ratings.find((r) => r >= afterAmps) ?? info.ratings[info.ratings.length - 1]
  return {
    id: uid(),
    kind,
    rating: fit,
    ...(kind === "breaker" || kind === "rcbo" ? { curve: "C" as const } : {}),
    ...(kind === "rcd" || kind === "rcbo" ? { leakage: kind === "rcd" ? 100 : 30 } : {}),
    ...(kind === "meter" ? { meterType: "din" as const } : {}),
  }
}

/**
 * Типовая ширина аппарата ввода в DIN-модулях.
 * Однофазный счётчик на рейку — 4–6 модулей, берём 6 как распространённый;
 * трёхфазный — 7–8, берём 8. Реле напряжения — 2 (1ф) и 4 (3ф)
 */
export function inputDeviceModules(d: InputDevice, phases: 1 | 3): number {
  if (d.modules && d.modules > 0) return d.modules
  const three = phases === 3
  switch (d.kind) {
    case "meter":
      return d.meterType === "panel" ? 0 : three ? 8 : 6
    case "relay":
      return three ? 4 : 2
    case "breaker":
      return three ? 3 : 2
    case "switch":
      return three ? 3 : 2
    case "rcd":
      return three ? 4 : 2
    case "rcbo":
      return three ? 4 : 2
    case "spd":
      return three ? 4 : 2
  }
}

/** Полюсность для подписи: 2P, 3P, 4P */
export function inputDevicePoles(d: InputDevice, phases: 1 | 3): string {
  const three = phases === 3
  if (d.kind === "rcd" || d.kind === "rcbo" || d.kind === "spd") return three ? "4P" : "2P"
  if (d.kind === "breaker" || d.kind === "switch") return three ? "3P" : "2P"
  return three ? "3ф" : "1ф"
}

/** Позиционные обозначения по ГОСТ: QF1, PI1, KV1… — нумерация внутри каждого вида */
export function inputDevicePositions(devices: InputDevice[]): Map<string, string> {
  const counters: Record<string, number> = {}
  const out = new Map<string, string>()
  for (const d of devices) {
    const prefix = INPUT_DEVICE_INFO[d.kind].pos
    counters[prefix] = (counters[prefix] || 0) + 1
    out.set(d.id, `${prefix}0${counters[prefix] > 1 ? `.${counters[prefix]}` : ""}`)
  }
  return out
}

/** Основная характеристика аппарата одной строкой — для схемы и спецификации */
export function inputDeviceSpec(d: InputDevice, phases: 1 | 3): string {
  const poles = inputDevicePoles(d, phases)
  switch (d.kind) {
    case "breaker":
      return `${d.curve || "C"}${d.rating}, ${poles}`
    case "switch":
      return `${d.rating} А, ${poles}`
    case "meter":
      return `${phases === 3 ? "3ф" : "1ф"}, до ${d.rating} А${d.meterType === "panel" ? ", навесной" : ""}`
    case "relay":
      return `${d.rating} А, ${poles}`
    case "rcd":
      return `${d.rating} А, ${d.leakage ?? 30} мА, ${poles}`
    case "rcbo":
      return `${d.curve || "C"}${d.rating}, ${d.leakage ?? 30} мА, ${poles}`
    case "spd":
      return `тип 2, ${poles}`
  }
}

/** Ток, который ограничивает ввод: самый «слабый» защитный аппарат в цепочке */
export function inputLimitAmps(devices: InputDevice[]): number {
  const prot = devices.filter((d) => d.kind === "breaker" || d.kind === "rcbo")
  return prot.length ? Math.min(...prot.map((d) => d.rating)) : 0
}

/**
 * Проверки ввода: всё, что электрик скорее всего захочет поправить.
 * Ничего не запрещаем — только подсказываем
 */
export function inputWarnings(devices: InputDevice[], maxGroupAmps: number): string[] {
  const out: string[] = []
  const pos = inputDevicePositions(devices)
  const limit = inputLimitAmps(devices)

  if (limit === 0) {
    out.push("На вводе нет автомата или дифавтомата — щит не защищён от перегрузки и КЗ.")
  }
  if (limit && maxGroupAmps >= limit) {
    out.push(
      `Вводной автомат ${limit} А не больше самого мощного автомата группы (${maxGroupAmps} А) — селективность не обеспечена.`,
    )
  }
  for (const d of devices) {
    // Счётчик, реле, УЗО и выключатель нагрузки сами от перегрузки не защищают —
    // их номинал должен быть не меньше вводного автомата
    if ((d.kind === "relay" || d.kind === "rcd" || d.kind === "switch") && limit && d.rating < limit) {
      out.push(`${pos.get(d.id)} ${INPUT_DEVICE_INFO[d.kind].label.toLowerCase()} на ${d.rating} А меньше вводного автомата ${limit} А.`)
    }
    if (d.kind === "meter" && limit && d.rating < limit) {
      out.push(`${pos.get(d.id)} счётчик до ${d.rating} А рассчитан на меньший ток, чем вводной автомат ${limit} А.`)
    }
  }
  const relayIdx = devices.findIndex((d) => d.kind === "relay")
  const qfIdx = devices.findIndex((d) => d.kind === "breaker" || d.kind === "rcbo")
  if (relayIdx >= 0 && qfIdx > relayIdx) {
    out.push("Реле напряжения стоит раньше вводного автомата — обычно его ставят после автомата, чтобы автомат защищал и реле.")
  }
  const meters = devices.filter((d) => d.kind === "meter").length
  if (meters > 1) out.push("На вводе больше одного счётчика.")
  return out
}