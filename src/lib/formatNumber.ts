export function num2(value: unknown): string {
  const n = typeof value === "number" ? value : parseFloat(String(value ?? ""))
  if (!Number.isFinite(n)) return "0"
  return String(Math.round((n + Number.EPSILON) * 100) / 100)
}
