"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { CircleUserRound } from "lucide-react"
import { useUser } from "@/features/auth"
import { useAppContext } from "@/features/app-context"
import { UserProfileHeader } from "@/components/layout/user-profile-header"
import { ContextSwitcher } from "@/components/layout/context-switcher"
import { ProfileMenuActions } from "@/components/layout/profile-menu-actions"
import { TeamIcon } from "@/components/ui/icon-picker"

export function UserProfileMenu() {
  const { data: user } = useUser()
  const { context, teams } = useAppContext()

  const currentTeam = React.useMemo(() => {
    if (context?.type !== "team" || !teams) return null
    return teams.find((t) => t.id === context.teamId) || null
  }, [context, teams])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full select-none"
          id="user-profile-trigger"
        >
          <Avatar className="h-9 w-9 ring-2 ring-background transition-all">
            {context?.type === "team" && currentTeam ? (
              <>
                <AvatarImage src={currentTeam.avatar_url || undefined} alt={currentTeam.name} />
                <AvatarFallback className="bg-primary/10">
                  <TeamIcon icon={currentTeam.icon} className="h-5 w-5" />
                </AvatarFallback>
              </>
            ) : (
              <>
                <AvatarImage src={user?.avatarUrl} alt={user?.displayName || "User"} />
                <AvatarFallback className="bg-primary/10">
                  <CircleUserRound className="h-5 w-5 text-muted-foreground" />
                </AvatarFallback>
              </>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <UserProfileHeader />
        <ContextSwitcher teams={teams} />
        <ProfileMenuActions />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
