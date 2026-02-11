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
import { cn } from "@/lib/utils"
import { useAppContext } from "@/features/app-context"
import { useTranslation } from "@/hooks/use-translation"
import type { Tables, TablesUpdate } from "@/lib/supabase/database.types"
import { TeamIcon, IconPicker } from "@/components/ui/icon-picker"

interface TeamDetailHeaderProps {
  team: Tables<"teams">
  onUpdate?: (updates: TablesUpdate<"teams">) => void
  isOwner?: boolean
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
        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleSave}>
          <Check className="h-5 w-5 text-green-600" />
        </Button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded px-1 -ml-1 hover:bg-muted transition-colors text-left",
        className
      )}
    >
      <span className={multiline ? "whitespace-pre-wrap" : "truncate"}>{value || label}</span>
      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
    </button>
  )
}

export function TeamDetailHeader({ team, onUpdate, isOwner }: TeamDetailHeaderProps) {
  const router = useRouter()
  const { switchToTeam } = useAppContext()
  const { t } = useTranslation()
  const [editingIcon, setEditingIcon] = useState(team.icon || "")

  const handleIconChange = (newIcon: string) => {
    setEditingIcon(newIcon)
    if (onUpdate) {
      onUpdate({ icon: newIcon })
    }
  }

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
        {isOwner ? (
          <IconPicker value={editingIcon} onChange={handleIconChange} iconClassName="h-6 w-6" />
        ) : (
          <Avatar className="h-12 w-12 border border-border">
            {team.avatar_url && <AvatarImage src={team.avatar_url} alt={team.name} />}
            <AvatarFallback className="bg-primary/10">
              <TeamIcon icon={editingIcon} className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
        )}
        <div className="flex-1 min-w-0">
          {isOwner && onUpdate ? (
            <>
              <EditableField
                value={team.name}
                onSave={(value) => onUpdate({ name: value })}
                className="text-lg font-bold tracking-tight sm:text-xl"
              />
            </>
          ) : (
            <>
              <h1 className="text-lg font-bold tracking-tight sm:text-xl truncate">{team.name}</h1>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {team.is_public && <Badge variant="secondary">{t.filters.public}</Badge>}
          <Button onClick={handleSwitchToTeam}>{t.teams.switchToTeam}</Button>
        </div>
      </div>
    </div>
  )
}
