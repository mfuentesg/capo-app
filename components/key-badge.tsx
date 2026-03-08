"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface KeyBadgeProps {
  keyValue: string
  size?: "sm" | "md"
  className?: string
}

export function KeyBadge({ keyValue, size = "sm", className }: KeyBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        size === "md"
          ? "h-9 w-9 rounded-lg flex items-center justify-center font-mono"
          : "h-7 w-7 rounded-md flex items-center justify-center font-mono text-xs",
        className
      )}
    >
      {keyValue}
    </Badge>
  )
}

export default KeyBadge
