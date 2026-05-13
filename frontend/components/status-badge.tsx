import { DocumentRequestStatus, DocumentRequestStatusLabel } from "@/lib/api"
import { cn } from "@/lib/utils"

const statusStyles: Record<DocumentRequestStatus, string> = {
  SUBMITTED: "bg-info/10 text-info border-info/20",
  IN_REVIEW: "bg-warning/10 text-warning border-warning/20",
  REVIEWED: "bg-primary/10 text-primary border-primary/20",
  APPROVED: "bg-success/10 text-success border-success/20",
  REJECTED: "bg-destructive/10 text-destructive border-destructive/20",
}

interface StatusBadgeProps {
  status: DocumentRequestStatus
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
      {DocumentRequestStatusLabel[status]}
    </span>
  )
}