"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Building2, Check, CircleUserRound, Layers, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@/features/auth"
import { useAppContext } from "@/features/app-context"
import { useLocale } from "@/features/settings"
import type { Tables } from "@/lib/supabase/database.types"
import { TeamIcon } from "@/components/ui/icon-picker"

interface ContextSwitcherProps {
  teams?: Tables<"teams">[] | null
}

export function ContextSwitcher({ teams }: ContextSwitcherProps) {
  const { t } = useLocale()
  const { data: user } = useUser()
  const { viewFilter, setViewFilter } = useAppContext()

  const hasTeams = teams && teams.length > 0

  return (
    <div className="p-2">
      <DropdownMenuLabel className="px-2 text-xs font-semibold text-muted-foreground">
        {t.nav.filterContext}
      </DropdownMenuLabel>

      {/* All buckets */}
      {hasTeams && (
        <DropdownMenuItem
          onClick={() => setViewFilter({ type: "all" })}
          className={cn(
            "flex items-center gap-3 px-2 py-2 rounded-md",
            viewFilter.type === "all" && "bg-accent"
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Layers className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">{t.nav.viewAll}</span>
              {viewFilter.type === "all" && <Check className="h-4 w-4 text-primary shrink-0" />}
            </div>
            <p className="text-xs text-muted-foreground truncate">{t.nav.viewAllDescription}</p>
          </div>
        </DropdownMenuItem>
      )}

      {/* Personal */}
      <DropdownMenuItem
        onClick={() => setViewFilter({ type: "personal" })}
        className={cn(
          "flex items-center gap-3 px-2 py-2 rounded-md",
          viewFilter.type === "personal" && "bg-accent"
        )}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.avatarUrl} alt={user?.displayName || "User"} />
          <AvatarFallback className="bg-primary/10">
            <CircleUserRound className="h-4 w-4 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">
              {user?.displayName || user?.email || "User"}
            </span>
            {viewFilter.type === "personal" && <Check className="h-4 w-4 text-primary shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground truncate">{t.nav.personalAccount}</p>
        </div>
      </DropdownMenuItem>

      {/* Teams */}
      {hasTeams &&
        teams.map((team) => (
          <DropdownMenuItem
            key={team.id}
            onClick={() => setViewFilter({ type: "team", teamId: team.id })}
            className={cn(
              "flex items-center gap-3 px-2 py-2 rounded-md",
              viewFilter.type === "team" && viewFilter.teamId === team.id && "bg-accent"
            )}
          >
            <Avatar className="h-8 w-8">
              {team.avatar_url && <AvatarImage src={team.avatar_url} alt={team.name} />}
              <AvatarFallback className="text-xs bg-primary/10">
                <TeamIcon icon={team.icon} className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">{team.name}</span>
                {viewFilter.type === "team" && viewFilter.teamId === team.id && (
                  <Check className="h-4 w-4 text-primary shrink-0" />
                )}
              </div>
            </div>
          </DropdownMenuItem>
        ))}

      <div className="mt-1 space-y-0.5">
        {!hasTeams && (
          <DropdownMenuItem asChild className="flex items-center gap-2 px-2 py-1.5 text-sm">
            <Link href="/dashboard/teams/new" onClick={(e) => e.stopPropagation()}>
              <Plus className="h-4 w-4" />
              <span>{t.nav.createTeam}</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild className="flex items-center gap-2 px-2 py-1.5 text-sm">
          <Link href="/dashboard/teams" onClick={(e) => e.stopPropagation()}>
            <Building2 className="h-4 w-4" />
            <span>{t.nav.manageTeams}</span>
          </Link>
        </DropdownMenuItem>
      </div>
    </div>
  )
}
