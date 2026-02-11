"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users as UsersIcon, UserPlus, Settings, CircleUserRound } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import type { Tables } from "@/lib/supabase/database.types"
import { formatDate } from "@/lib/utils"

interface TeamMembersSectionProps {
  members: (Tables<"team_members"> & { user_full_name: string | null })[]
  isOwner: boolean
  // teamId is kept in interface for API compatibility but not used in implementation
  teamId?: string
}

export function TeamMembersSection({ members, isOwner }: TeamMembersSectionProps) {
  const { t } = useTranslation()
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <UsersIcon className="h-5 w-5" />
          <h2 className="text-lg font-semibold">{t.teams.members}</h2>
          {members && <Badge variant="secondary">{members.length}</Badge>}
        </div>
        <Button size="sm" disabled>
          <UserPlus className="h-4 w-4 mr-2" />
          {t.teams.addMember}
        </Button>
      </div>

      {members && members.length > 0 ? (
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10">
                    <CircleUserRound className="h-4 w-4 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {member.user_full_name || `User ${member.user_id.slice(0, 8)}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Joined {formatDate(member.joined_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{member.role}</Badge>
                {isOwner && (
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <UsersIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>{t.teams.noMembersYet}</p>
        </div>
      )}
    </div>
  )
}
