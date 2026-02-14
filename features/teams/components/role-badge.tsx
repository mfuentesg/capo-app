import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ROLE_ICONS, ROLE_LABELS, type TeamRole } from "../constants"

interface RoleBadgeProps {
  role: TeamRole
  className?: string
  showLabel?: boolean
  variant?: "default" | "secondary" | "outline" | "destructive"
}

export function RoleBadge({
  role,
  className,
  showLabel = true,
  variant = "outline"
}: RoleBadgeProps) {
  const Icon = ROLE_ICONS[role]

  return (
    <Badge variant={variant} className={cn("gap-1", className)}>
      <Icon className="h-3 w-3" />
      {showLabel ? ROLE_LABELS[role] : null}
    </Badge>
  )
}
