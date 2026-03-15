"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { CircleUserRound } from "lucide-react"
import { TeamIcon } from "@/components/ui/icon-picker"
import type { AppContext } from "@/features/app-context/types"
import type { Tables } from "@/lib/supabase/database.types"
import { useLocale } from "@/features/settings"

interface BucketSelectorProps {
  value: AppContext | null
  onChange: (ctx: AppContext) => void
  userId: string
  teams: Tables<"teams">[]
  disabled?: boolean
  label?: string
}

function contextToValue(ctx: AppContext | null): string {
  if (!ctx) return "personal"
  return ctx.type === "team" ? `team:${ctx.teamId}` : "personal"
}

function valueToContext(value: string, userId: string): AppContext {
  if (value.startsWith("team:")) {
    return { type: "team", teamId: value.slice(5), userId }
  }
  return { type: "personal", userId }
}

export function BucketSelector({
  value,
  onChange,
  userId,
  teams,
  disabled = false,
  label
}: BucketSelectorProps) {
  const { t } = useLocale()

  if (teams.length === 0) return null

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Select
        value={contextToValue(value)}
        onValueChange={(v) => onChange(valueToContext(v, userId))}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="personal">
            <div className="flex items-center gap-2">
              <CircleUserRound className="h-4 w-4 text-muted-foreground" />
              <span>{t.nav.personal}</span>
            </div>
          </SelectItem>
          {teams.map((team) => (
            <SelectItem key={team.id} value={`team:${team.id}`}>
              <div className="flex items-center gap-2">
                <TeamIcon icon={team.icon} className="h-4 w-4" />
                <span>{team.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
