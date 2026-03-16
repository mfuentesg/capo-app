"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown, CircleUserRound, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@/features/auth"
import { useAppContext, useViewFilter } from "@/features/app-context"
import { useLocale } from "@/features/settings"
import { TeamIcon } from "@/components/ui/icon-picker"
import Link from "next/link"
import type { Tables } from "@/lib/supabase/database.types"
import type { ViewFilter } from "@/features/app-context"

function PillTrigger({
  viewFilter,
  teams,
  userName,
  userAvatarUrl,
  viewAllLabel
}: {
  viewFilter: ViewFilter
  teams: Tables<"teams">[]
  userName: string
  userAvatarUrl?: string | null
  viewAllLabel: string
}) {
  if (viewFilter.type === "team") {
    const team = teams.find((t) => t.id === viewFilter.teamId)
    return (
      <>
        <Avatar className="h-5 w-5 shrink-0">
          {team?.avatar_url && <AvatarImage src={team.avatar_url} alt={team.name} />}
          <AvatarFallback className="rounded text-[9px] bg-primary/20">
            <TeamIcon icon={team?.icon ?? null} className="h-3 w-3" />
          </AvatarFallback>
        </Avatar>
        <span className="max-w-[80px] truncate text-xs font-medium sm:max-w-[120px]">
          {team?.name}
        </span>
      </>
    )
  }

  if (viewFilter.type === "personal") {
    return (
      <>
        <Avatar className="h-5 w-5 shrink-0">
          {userAvatarUrl && <AvatarImage src={userAvatarUrl} alt={userName} />}
          <AvatarFallback className="bg-primary/10">
            <CircleUserRound className="h-3 w-3 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <span className="max-w-[80px] truncate text-xs font-medium sm:max-w-[120px]">{userName}</span>
      </>
    )
  }

  // "all"
  return (
    <>
      <div className="relative flex shrink-0">
        <Avatar className="h-5 w-5">
          {userAvatarUrl && <AvatarImage src={userAvatarUrl} alt={userName} />}
          <AvatarFallback className="bg-primary/10">
            <CircleUserRound className="h-3 w-3 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        {teams.length > 0 && (
          <Avatar className="h-5 w-5 -ml-1.5 ring-2 ring-background">
            {teams[0].avatar_url && <AvatarImage src={teams[0].avatar_url} alt={teams[0].name} />}
            <AvatarFallback className="bg-primary/20 text-[9px]">
              <TeamIcon icon={teams[0].icon} className="h-3 w-3" />
            </AvatarFallback>
          </Avatar>
        )}
        {teams.length === 0 && <Layers className="h-3.5 w-3.5 text-muted-foreground" />}
      </div>
      <span className="text-xs font-medium">{viewAllLabel}</span>
    </>
  )
}

export function ContextPill() {
  const { t } = useLocale()
  const { data: user } = useUser()
  const { teams } = useAppContext()
  const { viewFilter, setViewFilter } = useViewFilter()

  const hasTeams = teams.length > 0
  const userName = user?.displayName || user?.email || "You"
  const isFiltered = viewFilter.type !== "all"

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-full px-2.5 transition-colors",
            isFiltered && "bg-accent/60 hover:bg-accent/80"
          )}
        >
          <PillTrigger
            viewFilter={viewFilter}
            teams={teams}
            userName={userName}
            userAvatarUrl={user?.avatarUrl}
            viewAllLabel={t.nav.viewAll}
          />
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-2">
        <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">
          {t.nav.filterContext}
        </p>

        {/* All */}
        {hasTeams && (
          <button
            onClick={() => setViewFilter({ type: "all" })}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent",
              viewFilter.type === "all" && "bg-accent"
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
              <Layers className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t.nav.viewAll}</span>
                {viewFilter.type === "all" && <Check className="h-4 w-4 text-primary shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground truncate">{t.nav.viewAllDescription}</p>
            </div>
          </button>
        )}

        {/* Personal */}
        <button
          onClick={() => setViewFilter({ type: "personal" })}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent",
            viewFilter.type === "personal" && "bg-accent"
          )}
        >
          <Avatar className="h-8 w-8 shrink-0">
            {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={userName} />}
            <AvatarFallback className="bg-primary/10">
              <CircleUserRound className="h-4 w-4 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">{userName}</span>
              {viewFilter.type === "personal" && (
                <Check className="h-4 w-4 text-primary shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{t.nav.personalAccount}</p>
          </div>
        </button>

        {/* Teams */}
        {teams.map((team) => (
          <button
            key={team.id}
            onClick={() => setViewFilter({ type: "team", teamId: team.id })}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent",
              viewFilter.type === "team" && viewFilter.teamId === team.id && "bg-accent"
            )}
          >
            <Avatar className="h-8 w-8 shrink-0">
              {team.avatar_url && <AvatarImage src={team.avatar_url} alt={team.name} />}
              <AvatarFallback className="bg-primary/10 text-xs">
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
          </button>
        ))}

        {/* Footer */}
        <div className="mt-1 border-t pt-1">
          <Button asChild variant="ghost" size="sm" className="w-full justify-start gap-2 text-xs">
            <Link href="/dashboard/teams">{t.nav.manageTeams}</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
