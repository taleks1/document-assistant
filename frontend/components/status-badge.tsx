import { cn } from "@/lib/utils"
import type { RequestStatus } from "@/lib/mock-data"

const statusStyles: Record<RequestStatus, string> = {
  sent: "bg-info/10 text-info border-info/20",
  processing: "bg-warning/10 text-warning border-warning/20",
  reviewed: "bg-primary/10 text-primary border-primary/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
}

const statusLabels: Record<RequestStatus, string> = {
  sent: "Поднесено",
  processing: "Во обработка",
  reviewed: "Разгледано",
  approved: "Одобрено",
  rejected: "Одбиено",
}

interface StatusBadgeProps {
  status: RequestStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  )
}