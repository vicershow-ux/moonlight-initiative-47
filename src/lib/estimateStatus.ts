export type EstimateStatus =
  | "ready"
  | "in_approval"
  | "in_signing"
  | "needs_revision"
  | "approved"
  | "inactive"

export const estimateStatusOptions: { value: EstimateStatus; label: string }[] = [
  { value: "ready", label: "Готово" },
  { value: "in_approval", label: "На согласовании" },
  { value: "in_signing", label: "На подписании" },
  { value: "needs_revision", label: "Требует доработки" },
  { value: "approved", label: "Согласовано" },
  { value: "inactive", label: "Неактуальна" },
]

export const estimateStatusLabels: Record<string, string> = Object.fromEntries(
  estimateStatusOptions.map((o) => [o.value, o.label])
)

export const estimateStatusColors: Record<string, string> = {
  ready: "bg-green-500/20 text-green-300",
  in_approval: "bg-orange-500/20 text-orange-300",
  in_signing: "bg-blue-500/20 text-blue-300",
  needs_revision: "bg-red-500/20 text-red-300",
  approved: "bg-emerald-500/20 text-emerald-300",
  inactive: "bg-white/10 text-white/50",
}

export const getEstimateStatusLabel = (status?: string) =>
  (status && estimateStatusLabels[status]) || "Готово"

export const getEstimateStatusColor = (status?: string) =>
  (status && estimateStatusColors[status]) || estimateStatusColors.ready
