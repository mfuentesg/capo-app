"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Pencil, Check } from "lucide-react"
import { toast } from "sonner"
import { cn, formatDate } from "@/lib/utils"
import { useAppContext } from "@/features/app-context"
import { useTranslation } from "@/hooks/use-translation"
import type { Tables, TablesUpdate } from "@/lib/supabase/database.types"
import { TeamIcon, IconPicker } from "@/components/ui/icon-picker"
import { RoleBadge } from "./role-badge"

interface TeamDetailHeaderProps {
  team: Tables<"teams">
  onUpdate?: (updates: TablesUpdate<"teams">) => void
  isOwner?: boolean
  memberCount?: number
  pendingInviteCount?: number
  currentUserRole?: Tables<"team_members">["role"]
}

function EditableField({
  value,
  onSave,
  className,
  inputClassName,
  multiline = false,
  allowEmpty = false,
  label
}: {
  value: string
  onSave: (value: string) => void
  className?: string
  inputClassName?: string
  multiline?: boolean
  allowEmpty?: boolean
  label?: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if (!multiline) {
        ;(inputRef.current as HTMLInputElement).select()
      }
    }
  }, [isEditing, multiline])

  const handleSave = () => {
    const trimmed = editValue.trim()
    if (trimmed !== value && (trimmed || allowEmpty)) {
      onSave(trimmed)
    } else {
      setEditValue(value)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      handleSave()
    } else if (e.key === "Escape") {
      setEditValue(value)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-start gap-1.5">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={cn("min-h-20 px-2 py-1 border rounded resize-none", inputClassName)}
            rows={3}
          />
        ) : (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={cn("h-8 px-2", inputClassName)}
          />
        )}
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0"
          onClick={handleSave}
          aria-label="Save"
        >
          <Check className="h-5 w-5 text-green-600" />
        </Button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className={cn(
        "group inline-flex max-w-full items-center gap-1.5 rounded px-1 -ml-1 hover:bg-muted transition-colors text-left",
        className
      )}
    >
      <span className={multiline ? "whitespace-pre-wrap" : "truncate"}>{value || label}</span>
      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
    </button>
  )
}

export function TeamDetailHeader({
  team,
  onUpdate,
  isOwner,
  memberCount = 0,
  pendingInviteCount = 0,
  currentUserRole
}: TeamDetailHeaderProps) {
  const router = useRouter()
  const { context, switchToTeam } = useAppContext()
  const { t } = useTranslation()
  const [editingIcon, setEditingIcon] = useState(team.icon || "")
  const isCurrentTeam = context?.type === "team" && context.teamId === team.id

  const handleIconChange = (newIcon: string) => {
    setEditingIcon(newIcon)
    if (onUpdate) {
      onUpdate({ icon: newIcon })
    }
  }

  const handleSwitchToTeam = () => {
    if (isCurrentTeam) return
    switchToTeam(team.id)
    toast.success(t.toasts.teamSwitched.replace("{name}", team.name))
    router.push("/dashboard")
  }

  return (
    <div className="space-y-0">
      {/* Back button */}
      <Button
        variant="ghost"
        size="icon"
        asChild
        aria-label={t.invitations.backToTeams}
        className="mb-2"
      >
        <Link href="/dashboard/teams">
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>

      {/* Hero banner + floating icon */}
      <div className="relative">
        <div className="h-16 rounded-t-xl bg-gradient-to-br from-primary/15 to-primary/5 border-b border-primary/20" />
        <div className="absolute bottom-[-18px] left-4 h-11 w-11 rounded-xl border-2 border-border bg-background shadow-sm flex items-center justify-center">
          {isOwner ? (
            <IconPicker
              value={editingIcon}
              onChange={handleIconChange}
              iconClassName="h-6 w-6"
              idBase={`team-detail-${team.id}-icon-picker`}
            />
          ) : (
            <Avatar className="h-11 w-11 rounded-xl">
              {team.avatar_url && <AvatarImage src={team.avatar_url} alt={team.name} />}
              <AvatarFallback className="rounded-xl bg-primary/10">
                <TeamIcon icon={editingIcon} className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>

      {/* Info block — mt-7 clears the 18px icon overflow */}
      <div className="mt-7 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {isOwner && onUpdate ? (
            <EditableField
              value={team.name}
              onSave={(value) => onUpdate({ name: value })}
              className="max-w-full text-xl font-bold tracking-tight"
            />
          ) : (
            <h1 className="truncate text-xl font-bold tracking-tight">{team.name}</h1>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">
            {t.teams.created} {formatDate(team.created_at)}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {currentUserRole && <RoleBadge role={currentUserRole} />}
            {team.is_public && <Badge variant="secondary">{t.filters.public}</Badge>}
          </div>
        </div>
        <div className="shrink-0">
          {isCurrentTeam ? (
            <Badge variant="default" className="gap-1.5">
              <Check className="h-3 w-3" />
              {t.teams.active}
            </Badge>
          ) : (
            <Button size="sm" onClick={handleSwitchToTeam}>
              {t.teams.switchToTeam}
            </Button>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-lg p-3 flex flex-col gap-0.5">
          <span className="text-lg font-bold text-primary">{memberCount}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            {t.teams.members}
          </span>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 flex flex-col gap-0.5">
          <span className="text-lg font-bold text-primary">{pendingInviteCount}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            {t.teams.pendingInvitations}
          </span>
        </div>
      </div>
    </div>
  )
}
