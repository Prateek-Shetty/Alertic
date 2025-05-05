import { Badge } from "@/components/ui/badge"

interface ReportTypeBadgeProps {
  type: string
  className?: string
}

export function ReportTypeBadge({ type, className }: ReportTypeBadgeProps) {
  const isDisaster = type === "Disaster"

  return (
    <Badge
      className={`${isDisaster ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"} ${className || ""}`}
    >
      {type}
    </Badge>
  )
}
