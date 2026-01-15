"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { useAppContext } from "@/features/app-context"
import { useTranslation } from "@/hooks/use-translation"
import type { Tables } from "@/lib/supabase/database.types"
import { TeamIcon } from "@/components/ui/icon-picker"

interface TeamDetailHeaderProps {
  team: Tables<"teams">
}

export function TeamDetailHeader({ team }: TeamDetailHeaderProps) {
  const router = useRouter()
  const { switchToTeam } = useAppContext()
  const { t } = useTranslation()

  const handleSwitchToTeam = () => {
    switchToTeam(team.id)
    toast.success(t.toasts.teamSwitched.replace("{name}", team.name))
    router.push("/dashboard")
  }

  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" asChild>
        <Link href="/dashboard/teams">
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>
      <div className="flex items-center gap-4 flex-1">
        <Avatar className="h-12 w-12">
          {team.avatar_url && <AvatarImage src={team.avatar_url} alt={team.name} />}
          <AvatarFallback className="bg-primary/10">
            <TeamIcon icon={team.icon} className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl truncate">{team.name}</h1>
          {team.description && <p className="text-muted-foreground truncate">{team.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {team.is_public && <Badge variant="secondary">{t.filters.public}</Badge>}
          <Button onClick={handleSwitchToTeam}>{t.teams.switchToTeam}</Button>
        </div>
      </div>
    </div>
  )
}
