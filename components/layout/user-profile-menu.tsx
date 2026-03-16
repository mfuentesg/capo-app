"use client"

import { Button } from "@/components/ui/button"
import { useTranslation } from "@/hooks/use-translation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { CircleUserRound } from "lucide-react"
import { useUser } from "@/features/auth"
import { UserProfileHeader } from "@/components/layout/user-profile-header"
import { ProfileMenuActions } from "@/components/layout/profile-menu-actions"
import { createOverlayIds } from "@/lib/ui/stable-overlay-ids"

export function UserProfileMenu() {
  const { t } = useTranslation()
  const { data: user } = useUser()
  const menuIds = createOverlayIds("user-profile-menu")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full select-none"
          id={menuIds.triggerId}
          aria-controls={menuIds.contentId}
          aria-label={t.common.userMenu}
        >
          <Avatar className="h-9 w-9 ring-2 ring-background transition-shadow">
            <AvatarImage src={user?.avatarUrl} alt={user?.displayName || "You"} />
            <AvatarFallback className="bg-primary/10">
              <CircleUserRound className="h-5 w-5 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72"
        id={menuIds.contentId}
        aria-labelledby={menuIds.triggerId}
      >
        <UserProfileHeader />
        <ProfileMenuActions />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
